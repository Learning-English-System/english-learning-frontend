import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Plus, 
  Volume2, 
  X, 
  BookOpen 
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';
import type { VocabularyItem, Category, CreateVocabularyRequest } from '../../services/api';

interface VocabularyExplorerProps {
  vocabularyList: VocabularyItem[];
  categories: Category[];
  onAddWord: (wordData: CreateVocabularyRequest) => Promise<void>;
  onRefreshList: () => Promise<void>;
}

export const VocabularyExplorer: React.FC<VocabularyExplorerProps> = ({
  vocabularyList,
  categories,
  onAddWord,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [adding, setAdding] = useState(false);

  // Form State
  const [word, setWord] = useState('');
  const [translation, setTranslation] = useState('');
  const [partOfSpeech, setPartOfSpeech] = useState('Noun');
  const [cefrLevel, setCefrLevel] = useState('B1');
  const [definition, setDefinition] = useState('');
  const [exampleSentence, setExampleSentence] = useState('');
  const [categoryId, setCategoryId] = useState('');

  const playAudio = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      window.speechSynthesis.speak(utterance);
    }
  };

  const filteredItems = vocabularyList.filter((item) => {
    const matchesSearch =
      item.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.translation.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === 'all' || item.categoryId === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!word || !translation) return;
    setAdding(true);

    try {
      await onAddWord({
        word: word.trim(),
        translation: translation.trim(),
        partOfSpeech,
        cefrLevel,
        definition: definition.trim(),
        exampleSentence: exampleSentence.trim(),
        categoryId: categoryId || undefined,
      });
      setShowAddModal(false);
      // Reset form
      setWord('');
      setTranslation('');
      setDefinition('');
      setExampleSentence('');
    } catch (err) {
      console.error('Failed to add word', err);
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6">
      
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#1d1d1f] dark:text-[#f5f5f7]">
            Vocabulary Library
          </h1>
          <p className="text-[14px] text-[#86868b] mt-1">
            {vocabularyList.length} words cataloged in your active spaced-repetition memory
          </p>
        </div>
        <Button
          variant="primary"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => setShowAddModal(true)}
          className="rounded-full px-5 self-start sm:self-auto"
        >
          Add Word
        </Button>
      </div>

      {/* Search & Categories Bar */}
      <div className="space-y-4 mb-8">
        <div className="max-w-md">
          <Input
            placeholder="Search word, meaning, context..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon={<Search className="w-4 h-4" />}
            className="rounded-full bg-white dark:bg-[#1c1c1e] shadow-apple-sm"
          />
        </div>

        {/* Categories Chips */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-tight transition-all shrink-0 ${
              selectedCategory === 'all'
                ? 'bg-[#1d1d1f] text-white dark:bg-[#f5f5f7] dark:text-[#1d1d1f]'
                : 'bg-black/[0.04] dark:bg-white/[0.08] text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7]'
            }`}
          >
            All Categories ({vocabularyList.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-tight transition-all shrink-0 ${
                selectedCategory === cat.id
                  ? 'bg-[#1d1d1f] text-white dark:bg-[#f5f5f7] dark:text-[#1d1d1f]'
                  : 'bg-black/[0.04] dark:bg-white/[0.08] text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7]'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Vocabulary Cards */}
      {filteredItems.length === 0 ? (
        <Card className="text-center py-16">
          <BookOpen className="w-12 h-12 mx-auto text-[#86868b]/40 mb-3" />
          <h3 className="text-lg font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] mb-1">
            No words found
          </h3>
          <p className="text-sm text-[#86868b]">
            {searchTerm ? 'Try adjusting your search criteria' : 'Click "Add Word" to build your repository'}
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
            >
              <Card hoverEffect className="p-5 h-full flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h4 className="font-serif text-2xl font-normal tracking-tight text-[#121316] dark:text-[#f4f3f0]">
                        {item.word}
                      </h4>
                      {item.phonetic && (
                        <span className="text-xs font-mono text-stone-400">
                          {item.phonetic}
                        </span>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => playAudio(item.word)}
                      className="w-7 h-7 text-stone-500 hover:text-stone-900 dark:hover:text-stone-100"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>

                  <p className="text-sm font-semibold text-[#121316] dark:text-[#f4f3f0] mb-1.5">
                    {item.translation}
                  </p>

                  {item.definition && (
                    <p className="text-xs font-serif italic text-stone-600 dark:text-stone-400 line-clamp-2 mb-2.5 leading-relaxed">
                      "{item.definition}"
                    </p>
                  )}

                  {item.exampleSentence && (
                    <p className="text-xs text-stone-600 dark:text-stone-400 bg-black/[0.02] dark:bg-white/[0.03] p-2 rounded-md line-clamp-2 font-sans border border-black/[0.04] dark:border-white/[0.06]">
                      {item.exampleSentence}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between pt-3 mt-3 border-t border-black/[0.06] dark:border-white/[0.08] text-xs">
                  <div className="flex items-center gap-1.5">
                    <Badge variant="stone" size="sm">
                      {item.partOfSpeech || 'Word'}
                    </Badge>
                    <Badge variant="amber" size="sm" className="font-mono">
                      {item.cefrLevel || 'B1'}
                    </Badge>
                  </div>
                  <span className="text-[11px] font-mono text-stone-400">
                    Rep: {item.repetitions ?? item.reviewState?.repetitionCount ?? 0}x
                  </span>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add Word Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-lg"
            >
              <Card className="p-6 sm:p-8 shadow-apple-lg border border-black/[0.1] dark:border-white/[0.15]">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold tracking-tight text-[#1d1d1f] dark:text-[#f5f5f7]">
                    Add New Word
                  </h3>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowAddModal(false)}
                    className="rounded-full w-8 h-8"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                <form onSubmit={handleCreateSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="English Word *"
                      required
                      placeholder="e.g. resilient"
                      value={word}
                      onChange={(e) => setWord(e.target.value)}
                    />
                    <Input
                      label="Vietnamese Meaning *"
                      required
                      placeholder="e.g. kiên cường, bền bỉ"
                      value={translation}
                      onChange={(e) => setTranslation(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[13px] font-medium text-[#86868b] mb-1.5">
                        Part of Speech
                      </label>
                      <select
                        value={partOfSpeech}
                        onChange={(e) => setPartOfSpeech(e.target.value)}
                        className="w-full rounded-xl bg-black/[0.03] dark:bg-white/[0.06] border border-black/[0.08] dark:border-white/[0.12] px-3.5 py-2.5 text-sm text-[#1d1d1f] dark:text-[#f5f5f7] focus:outline-none focus:ring-2 focus:ring-[#0071e3]/30"
                      >
                        <option value="Noun">Noun (Danh từ)</option>
                        <option value="Verb">Verb (Động từ)</option>
                        <option value="Adjective">Adjective (Tính từ)</option>
                        <option value="Adverb">Adverb (Phó từ)</option>
                        <option value="Phrase">Phrase (Cụm từ)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[13px] font-medium text-[#86868b] mb-1.5">
                        CEFR Level
                      </label>
                      <select
                        value={cefrLevel}
                        onChange={(e) => setCefrLevel(e.target.value)}
                        className="w-full rounded-xl bg-black/[0.03] dark:bg-white/[0.06] border border-black/[0.08] dark:border-white/[0.12] px-3.5 py-2.5 text-sm text-[#1d1d1f] dark:text-[#f5f5f7] focus:outline-none focus:ring-2 focus:ring-[#0071e3]/30"
                      >
                        <option value="A1">A1 - Beginner</option>
                        <option value="A2">A2 - Elementary</option>
                        <option value="B1">B1 - Intermediate</option>
                        <option value="B2">B2 - Upper Intermediate</option>
                        <option value="C1">C1 - Advanced</option>
                        <option value="C2">C2 - Mastery</option>
                      </select>
                    </div>
                  </div>

                  <Input
                    label="English Definition"
                    placeholder="Able to withstand or recover quickly from difficult conditions"
                    value={definition}
                    onChange={(e) => setDefinition(e.target.value)}
                  />

                  {categories.length > 0 && (
                    <div>
                      <label className="block text-[13px] font-medium text-[#86868b] mb-1.5">
                        Category
                      </label>
                      <select
                        value={categoryId}
                        onChange={(e) => setCategoryId(e.target.value)}
                        className="w-full rounded-xl bg-black/[0.03] dark:bg-white/[0.06] border border-black/[0.08] dark:border-white/[0.12] px-3.5 py-2.5 text-sm text-[#1d1d1f] dark:text-[#f5f5f7] focus:outline-none focus:ring-2 focus:ring-[#0071e3]/30"
                      >
                        <option value="">None / General</option>
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <Input
                    label="Example Sentence"
                    placeholder="The local economy has proved remarkably resilient."
                    value={exampleSentence}
                    onChange={(e) => setExampleSentence(e.target.value)}
                  />

                  <div className="flex justify-end gap-3 pt-4 border-t border-black/[0.06] dark:border-white/[0.08]">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => setShowAddModal(false)}
                      className="rounded-full px-5"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      loading={adding}
                      className="rounded-full px-6"
                    >
                      Save Word
                    </Button>
                  </div>
                </form>
              </Card>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
