import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, RefreshCcw, Layers } from 'lucide-react';
import { Flashcard3D } from './Flashcard3D';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { sounds } from '../../lib/sound';
import type { VocabularyItem } from '../../services/api';

interface FlashcardReviewProps {
  dueReviews: VocabularyItem[];
  onSubmitRating: (vocabularyId: string, quality: number) => Promise<void>;
  onRefreshQueue: () => Promise<void>;
}

export const FlashcardReview: React.FC<FlashcardReviewProps> = ({
  dueReviews,
  onSubmitRating,
  onRefreshQueue,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const currentItem = dueReviews.length > 0 ? dueReviews[currentIndex] : null;

  // Audio speech synthesis helper
  const playAudio = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  const toggleFlip = () => {
    sounds.playFlip();
    setIsFlipped((prev) => !prev);
  };

  const handleRate = async (quality: number) => {
    if (!currentItem || submitting) return;
    setSubmitting(true);
    sounds.playClick(900);

    try {
      await onSubmitRating(currentItem.id, quality);
      setIsFlipped(false);

      if (currentIndex + 1 < dueReviews.length) {
        setCurrentIndex((prev) => prev + 1);
      } else {
        // Finished all cards!
        sounds.playSuccess();
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#4f46e5', '#10b981', '#f59e0b', '#38bdf8'],
        });
        await onRefreshQueue();
        setCurrentIndex(0);
      }
    } catch (err) {
      console.error('Failed to submit review', err);
    } finally {
      setSubmitting(false);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!currentItem) return;

      if (e.code === 'Space') {
        e.preventDefault();
        toggleFlip();
      } else if (isFlipped) {
        if (e.key === '1') handleRate(0); // Again
        if (e.key === '2') handleRate(2); // Hard
        if (e.key === '3') handleRate(4); // Good
        if (e.key === '4') handleRate(5); // Easy
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentItem, isFlipped, currentIndex, dueReviews.length]);

  if (!currentItem) {
    return (
      <div className="max-w-xl mx-auto py-16 px-4 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="p-10 text-center border border-slate-200 dark:border-white/10 shadow-lg bg-white dark:bg-[#111726]">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-200 dark:border-emerald-800/50 shadow-sm">
              <Trophy className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mb-2">
              Hoàn Thành Phiên Ôn Tập!
            </h2>
            <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-6 leading-relaxed">
              Bạn đã ôn hết tất cả từ vựng hôm nay. Thuật toán Spaced Repetition sẽ tự động tính toán thời gian tối ưu cho phiên tiếp theo.
            </p>
            <Button
              variant="primary"
              icon={<RefreshCcw className="w-4 h-4" />}
              onClick={onRefreshQueue}
              className="rounded-xl px-6 py-3 text-sm font-semibold shadow-sm"
            >
              Kiểm tra từ vựng mới
            </Button>
          </Card>
        </motion.div>
      </div>
    );
  }

  const progressPercent = Math.round(((currentIndex + 1) / dueReviews.length) * 100);

  return (
    <div className="max-w-2xl mx-auto py-6 px-4">
      
      {/* Session Header - Chữ số to rõ ràng */}
      <div className="flex items-center justify-between mb-3 pb-2">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <span className="text-base font-bold text-slate-800 dark:text-slate-100">
            Thẻ {currentIndex + 1} <span className="text-slate-400 font-normal">/ {dueReviews.length}</span>
          </span>
        </div>
        <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
          {progressPercent}% Hoàn thành
        </span>
      </div>

      {/* Progress track */}
      <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 mb-6 overflow-hidden">
        <motion.div
          className="h-full bg-indigo-600 dark:bg-indigo-500 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progressPercent}%` }}
          transition={{ duration: 0.2 }}
        />
      </div>

      {/* 3D Card */}
      <Flashcard3D
        item={currentItem}
        isFlipped={isFlipped}
        onFlip={toggleFlip}
        onPlayAudio={() => playAudio(currentItem.word)}
      />

      {/* Rating actions */}
      <div className="mt-6">
        <AnimatePresence mode="wait">
          {!isFlipped ? (
            <motion.div
              key="flip-btn"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="text-center"
            >
              <Button
                variant="primary"
                size="lg"
                onClick={toggleFlip}
                className="w-full max-w-sm rounded-xl py-3.5 text-base font-semibold shadow-md"
              >
                <span>Xem đáp án</span>
                <kbd className="neural-kbd ml-3 px-2 py-0.5 text-xs">Space</kbd>
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="rating-pills"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="space-y-4"
            >
              {/* 4 Rating Buttons - Chữ số to rõ ràng, bố cục cân đối */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                
                {/* Again / 0 */}
                <button
                  disabled={submitting}
                  onClick={() => handleRate(0)}
                  className="p-3.5 rounded-xl bg-white dark:bg-[#111726] hover:bg-rose-50/50 dark:hover:bg-rose-950/20 border-2 border-slate-200 dark:border-white/10 hover:border-rose-400 dark:hover:border-rose-500 text-left transition-all active:scale-[0.98] shadow-sm select-none group"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-base font-bold text-rose-600 dark:text-rose-400">Học lại</span>
                    <span className="w-6 h-6 rounded-md bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 flex items-center justify-center font-bold text-xs">1</span>
                  </div>
                  <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">&lt; 1 phút</div>
                </button>

                {/* Hard / 2 */}
                <button
                  disabled={submitting}
                  onClick={() => handleRate(2)}
                  className="p-3.5 rounded-xl bg-white dark:bg-[#111726] hover:bg-amber-50/50 dark:hover:bg-amber-950/20 border-2 border-slate-200 dark:border-white/10 hover:border-amber-400 dark:hover:border-amber-500 text-left transition-all active:scale-[0.98] shadow-sm select-none group"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-base font-bold text-amber-600 dark:text-amber-400">Khó</span>
                    <span className="w-6 h-6 rounded-md bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 flex items-center justify-center font-bold text-xs">2</span>
                  </div>
                  <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">1 ngày</div>
                </button>

                {/* Good / 4 */}
                <button
                  disabled={submitting}
                  onClick={() => handleRate(4)}
                  className="p-3.5 rounded-xl bg-white dark:bg-[#111726] hover:bg-indigo-50/50 dark:hover:bg-indigo-950/20 border-2 border-slate-200 dark:border-white/10 hover:border-indigo-400 dark:hover:border-indigo-500 text-left transition-all active:scale-[0.98] shadow-sm select-none group"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-base font-bold text-indigo-600 dark:text-indigo-400">Tốt</span>
                    <span className="w-6 h-6 rounded-md bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-bold text-xs">3</span>
                  </div>
                  <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">3 ngày</div>
                </button>

                {/* Easy / 5 */}
                <button
                  disabled={submitting}
                  onClick={() => handleRate(5)}
                  className="p-3.5 rounded-xl bg-white dark:bg-[#111726] hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20 border-2 border-slate-200 dark:border-white/10 hover:border-emerald-400 dark:hover:border-emerald-500 text-left transition-all active:scale-[0.98] shadow-sm select-none group"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-base font-bold text-emerald-600 dark:text-emerald-400">Dễ</span>
                    <span className="w-6 h-6 rounded-md bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold text-xs">4</span>
                  </div>
                  <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">7 ngày</div>
                </button>

              </div>
              <p className="text-center text-xs font-medium text-slate-400 dark:text-slate-500">
                Ghi nhận theo thuật toán ngắt quãng SuperMemo-2
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </div>
  );
};
