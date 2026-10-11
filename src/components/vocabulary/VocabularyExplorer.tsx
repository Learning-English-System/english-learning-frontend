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
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-[var(--neural-cyan)]/10 border border-[var(--neural-cyan)]/20 text-[var(--neural-cyan)] text-[11px] font-mono mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--neural-cyan)] animate-pulse" />
            SYNAPSE VOCABULARY MATRIX
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white font-tech">
            Linguistic Repository
          </h1>
          <p className="text-xs font-mono text-stone-400 mt-1">
            {vocabularyList.length} active lexical nodes encoded in synaptic memory
          </p>
        </div>
        <Button
          variant="primary"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => setShowAddModal(true)}
          className="rounded-lg px-4 self-start sm:self-auto text-xs"
        >
          Add Node
        </Button>
      </div>

      {/* Search & Categories Bar */}
      <div className="space-y-4 mb-8">
        <div className="max-w-md">
          <Input
            placeholder="Search lexical node, translation, context..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon={<Search className="w-4 h-4" />}
            className="rounded-lg bg-black/40 border-white/[0.08]"
          />
        </div>

        {/* Categories Chips */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-md text-xs font-mono tracking-tight transition-all shrink-0 border ${
              selectedCategory === 'all'
                ? 'bg-[var(--neural-cyan)]/15 text-[var(--neural-cyan)] border-[var(--neural-cyan)]/40 shadow-[0_0_10px_rgba(0,240,255,0.2)]'
                : 'bg-white/[0.02] border-white/[0.06] text-stone-400 hover:text-white hover:border-white/[0.12]'
            }`}
          >
            All Clusters ({vocabularyList.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-md text-xs font-mono tracking-tight transition-all shrink-0 border ${
                selectedCategory === cat.id
                  ? 'bg-[var(--neural-cyan)]/15 text-[var(--neural-cyan)] border-[var(--neural-cyan)]/40 shadow-[0_0_10px_rgba(0,240,255,0.2)]'
                  : 'bg-white/[0.02] border-white/[0.06] text-stone-400 hover:text-white hover:border-white/[0.12]'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Vocabulary Cards */}
      {filteredItems.length === 0 ? (
        <Card className="text-center py-16 border-white/[0.06]">
          <BookOpen className="w-10 h-10 mx-auto text-stone-600 mb-3" />
          <h3 className="text-base font-semibold text-white mb-1 font-tech">
            No Lexical Nodes Found
          </h3>
          <p className="text-xs font-mono text-stone-500">
            {searchTerm ? 'Adjust filter queries to scan repository' : 'Click "Add Node" to encode new vocabulary'}
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
              <Card hoverEffect className="p-5 h-full flex flex-col justify-between border-white/[0.07] bg-[#0c0e12]/80">
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h4 className="font-tech text-xl font-bold tracking-tight text-white">
                        {item.word}
                      </h4>
                      {item.phonetic && (
                        <span className="text-xs font-mono text-[var(--neural-cyan)]">
                          /{item.phonetic.replace(/^\/|\/$/g, '')}/
                        </span>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => playAudio(item.word)}
                      className="w-7 h-7 text-stone-400 hover:text-[var(--neural-cyan)]"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>

                  <p className="text-sm font-semibold text-white/90 mb-1.5 font-sans">
                    {item.translation}
                  </p>

                  {item.definition && (
                    <p className="text-xs text-stone-400 line-clamp-2 mb-2.5 leading-relaxed font-sans">
                      "{item.definition}"
                    </p>
                  )}

                  {item.exampleSentence && (
                    <p className="text-xs text-stone-300 bg-white/[0.03] p-2.5 rounded-md line-clamp-2 font-mono border border-white/[0.06]">
                      {item.exampleSentence}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between pt-3 mt-3 border-t border-white/[0.06] text-xs">
                  <div className="flex items-center gap-1.5">
                    <Badge variant="cyan" size="sm">
                      {item.partOfSpeech || 'Word'}
                    </Badge>
                    <Badge variant="stone" size="sm" className="font-mono">
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
              <Card className="p-6 sm:p-8 border border-white/[0.1] bg-[#0c0e12] shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-bold tracking-tight text-white font-tech">
                      Encode New Lexical Node
                    </h3>
                    <p className="text-xs font-mono text-stone-400 mt-0.5">
                      Direct insertion into synaptic memory pipeline
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowAddModal(false)}
                    className="rounded-lg w-8 h-8 text-stone-400 hover:text-white"
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
                      <label className="block text-xs font-mono text-stone-400 mb-1.5 uppercase tracking-wider">
                        Part of Speech
                      </label>
                      <select
                        value={partOfSpeech}
                        onChange={(e) => setPartOfSpeech(e.target.value)}
                        className="w-full rounded-lg bg-black/40 border border-white/[0.08] px-3.5 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-[var(--neural-cyan)]"
                      >
                        <option value="Noun" className="bg-[#0c0e12]">Noun (Danh từ)</option>
                        <option value="Verb" className="bg-[#0c0e12]">Verb (Động từ)</option>
                        <option value="Adjective" className="bg-[#0c0e12]">Adjective (Tính từ)</option>
                        <option value="Adverb" className="bg-[#0c0e12]">Adverb (Phó từ)</option>
                        <option value="Phrase" className="bg-[#0c0e12]">Phrase (Cụm từ)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-mono text-stone-400 mb-1.5 uppercase tracking-wider">
                        CEFR Level
                      </label>
                      <select
                        value={cefrLevel}
                        onChange={(e) => setCefrLevel(e.target.value)}
                        className="w-full rounded-lg bg-black/40 border border-white/[0.08] px-3.5 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-[var(--neural-cyan)]"
                      >
                        <option value="A1" className="bg-[#0c0e12]">A1 - Beginner</option>
                        <option value="A2" className="bg-[#0c0e12]">A2 - Elementary</option>
                        <option value="B1" className="bg-[#0c0e12]">B1 - Intermediate</option>
                        <option value="B2" className="bg-[#0c0e12]">B2 - Upper Intermediate</option>
                        <option value="C1" className="bg-[#0c0e12]">C1 - Advanced</option>
                        <option value="C2" className="bg-[#0c0e12]">C2 - Mastery</option>
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
                      <label className="block text-xs font-mono text-stone-400 mb-1.5 uppercase tracking-wider">
                        Cluster / Category
                      </label>
                      <select
                        value={categoryId}
                        onChange={(e) => setCategoryId(e.target.value)}
                        className="w-full rounded-lg bg-black/40 border border-white/[0.08] px-3.5 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-[var(--neural-cyan)]"
                      >
                        <option value="" className="bg-[#0c0e12]">None / General</option>
                        {categories.map((c) => (
                          <option key={c.id} value={c.id} className="bg-[#0c0e12]">
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

                  <div className="flex justify-end gap-3 pt-4 border-t border-white/[0.08]">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => setShowAddModal(false)}
                      className="rounded-lg px-4 text-xs font-mono"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      loading={adding}
                      className="rounded-lg px-5 text-xs font-mono"
                    >
                      Encode Node
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
