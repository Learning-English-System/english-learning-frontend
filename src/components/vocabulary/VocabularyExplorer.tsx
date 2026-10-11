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
      utterance.rate = 0.9;
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
      
      {/* Header bar - To, rõ ràng, tinh tế */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Thư Viện Từ Vựng
          </h1>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
            <span className="text-indigo-600 dark:text-indigo-400 font-bold text-base">{vocabularyList.length}</span> từ vựng đã được lưu trữ trong hệ thống
          </p>
        </div>
        <Button
          variant="primary"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => setShowAddModal(true)}
          className="rounded-xl px-5 py-2.5 text-sm font-semibold shadow-sm self-start sm:self-auto"
        >
          Thêm từ mới
        </Button>
      </div>

      {/* Search & Categories Bar */}
      <div className="space-y-4 mb-8">
        <div className="max-w-md">
          <Input
            placeholder="Tìm kiếm từ, nghĩa hoặc câu ví dụ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon={<Search className="w-4 h-4 text-slate-400" />}
            className="rounded-xl bg-white dark:bg-[#111726] border-slate-200 dark:border-white/10 text-sm shadow-sm"
          />
        </div>

        {/* Categories Chips */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold tracking-tight transition-all shrink-0 ${
              selectedCategory === 'all'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-white dark:bg-[#111726] border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-white/20'
            }`}
          >
            Tất cả ({vocabularyList.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold tracking-tight transition-all shrink-0 ${
                selectedCategory === cat.id
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white dark:bg-[#111726] border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-white/20'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Vocabulary Cards */}
      {filteredItems.length === 0 ? (
        <Card className="text-center py-16 border border-slate-200 dark:border-white/10 bg-white dark:bg-[#111726]">
          <BookOpen className="w-12 h-12 mx-auto text-slate-400 mb-3" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
            Chưa tìm thấy từ nào
          </h3>
          <p className="text-sm text-slate-500">
            {searchTerm ? 'Hãy thử tìm kiếm với từ khóa khác' : 'Bấm "Thêm từ mới" để bắt đầu tích lũy từ vựng'}
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredItems.map((item) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
            >
              <Card hoverEffect className="p-6 h-full flex flex-col justify-between border border-slate-200/90 dark:border-white/10 bg-white dark:bg-[#111726] shadow-sm hover:shadow-md rounded-2xl">
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      {/* Word - To rõ ràng */}
                      <h4 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                        {item.word}
                      </h4>
                      {item.phonetic && (
                        <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                          /{item.phonetic.replace(/^\/|\/$/g, '')}/
                        </span>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => playAudio(item.word)}
                      title="Phát âm"
                      className="w-9 h-9 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-full"
                    >
                      <Volume2 className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Nghĩa tiếng Việt */}
                  <p className="text-base font-bold text-slate-800 dark:text-slate-100 mb-2">
                    {item.translation}
                  </p>

                  {item.definition && (
                    <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2 mb-3 leading-relaxed">
                      "{item.definition}"
                    </p>
                  )}

                  {item.exampleSentence && (
                    <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-white/[0.03] p-3 rounded-xl line-clamp-2 italic border border-slate-200/60 dark:border-white/5 font-medium">
                      {item.exampleSentence}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-100 dark:border-white/5 text-xs">
                  <div className="flex items-center gap-2">
                    <Badge variant="stone" size="sm" className="font-semibold">
                      {item.partOfSpeech || 'Word'}
                    </Badge>
                    <Badge variant="cyan" size="sm" className="font-bold">
                      {item.cefrLevel || 'B1'}
                    </Badge>
                  </div>
                  <span className="text-xs font-semibold text-slate-400">
                    Đã ôn: <span className="text-slate-700 dark:text-slate-200 font-bold">{item.repetitions ?? item.reviewState?.repetitionCount ?? 0}</span> lần
                  </span>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add Word Modal - Tối giản, tinh tế */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-lg"
            >
              <Card className="p-6 sm:p-8 border border-slate-200 dark:border-white/15 bg-white dark:bg-[#111726] shadow-2xl rounded-2xl">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                      Thêm Từ Vựng Mới
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Từ mới sẽ tự động được thêm vào lịch ôn tập ngắt quãng
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowAddModal(false)}
                    className="rounded-full w-8 h-8 text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                <form onSubmit={handleCreateSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Từ tiếng Anh *"
                      required
                      placeholder="e.g. resilient"
                      value={word}
                      onChange={(e) => setWord(e.target.value)}
                    />
                    <Input
                      label="Nghĩa tiếng Việt *"
                      required
                      placeholder="e.g. kiên cường, bền bỉ"
                      value={translation}
                      onChange={(e) => setTranslation(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">
                        Từ loại
                      </label>
                      <select
                        value={partOfSpeech}
                        onChange={(e) => setPartOfSpeech(e.target.value)}
                        className="w-full rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-white/10 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="Noun">Danh từ (Noun)</option>
                        <option value="Verb">Động từ (Verb)</option>
                        <option value="Adjective">Tính từ (Adjective)</option>
                        <option value="Adverb">Phó từ (Adverb)</option>
                        <option value="Phrase">Cụm từ (Phrase)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">
                        Cấp độ CEFR
                      </label>
                      <select
                        value={cefrLevel}
                        onChange={(e) => setCefrLevel(e.target.value)}
                        className="w-full rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-white/10 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="A1">A1 - Sơ cấp</option>
                        <option value="A2">A2 - Cơ bản</option>
                        <option value="B1">B1 - Trung cấp</option>
                        <option value="B2">B2 - Khá</option>
                        <option value="C1">C1 - Nâng cao</option>
                        <option value="C2">C2 - Thành thạo</option>
                      </select>
                    </div>
                  </div>

                  <Input
                    label="Định nghĩa (tiếng Anh)"
                    placeholder="Able to withstand or recover quickly from difficult conditions"
                    value={definition}
                    onChange={(e) => setDefinition(e.target.value)}
                  />

                  {categories.length > 0 && (
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">
                        Danh mục / Chủ đề
                      </label>
                      <select
                        value={categoryId}
                        onChange={(e) => setCategoryId(e.target.value)}
                        className="w-full rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-white/10 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="">Chung (General)</option>
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <Input
                    label="Câu ví dụ thực tế"
                    placeholder="The local economy has proved remarkably resilient."
                    value={exampleSentence}
                    onChange={(e) => setExampleSentence(e.target.value)}
                  />

                  <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-white/10">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => setShowAddModal(false)}
                      className="rounded-xl px-5 text-sm font-semibold"
                    >
                      Hủy bỏ
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      loading={adding}
                      className="rounded-xl px-6 text-sm font-semibold"
                    >
                      Lưu từ vựng
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
