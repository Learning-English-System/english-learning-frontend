import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Trophy, RefreshCcw } from 'lucide-react';
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
        // Finished all cards! Trigger luxury chime and confetti
        sounds.playSuccess();
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#0071e3', '#34c759', '#ff9500', '#af52de'],
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
        if (e.key === '1') handleRate(0); // Blackout
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
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="p-10 text-center shadow-apple-lg">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#34c759]/10 text-[#34c759] flex items-center justify-center">
              <Trophy className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-[#1d1d1f] dark:text-[#f5f5f7] mb-2">
              Queue Cleared!
            </h2>
            <p className="text-[15px] text-[#86868b] dark:text-[#a1a1a6] max-w-md mx-auto mb-6 leading-relaxed">
              You have completed all scheduled SuperMemo-2 reviews for today. Great dedication!
            </p>
            <Button
              variant="secondary"
              icon={<RefreshCcw className="w-4 h-4" />}
              onClick={onRefreshQueue}
              className="rounded-full px-6"
            >
              Check Again
            </Button>
          </Card>
        </motion.div>
      </div>
    );
  }

  const progressPercent = Math.round(((currentIndex + 1) / dueReviews.length) * 100);

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      
      {/* Progress header */}
      <div className="flex items-center justify-between mb-4 text-xs font-medium text-[#86868b]">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#0071e3]" />
          <span>Card {currentIndex + 1} of {dueReviews.length}</span>
        </div>
        <span>{progressPercent}% completed</span>
      </div>

      {/* Progress bar */}
      <div className="w-full h-1.5 rounded-full bg-black/[0.06] dark:bg-white/[0.08] mb-6 overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-[#0071e3] to-[#5856d6] rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progressPercent}%` }}
          transition={{ duration: 0.3 }}
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
      <div className="mt-8">
        <AnimatePresence mode="wait">
          {!isFlipped ? (
            <motion.div
              key="flip-btn"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-center"
            >
              <Button
                variant="primary"
                size="lg"
                onClick={toggleFlip}
                className="w-full max-w-sm rounded-full py-3 text-[15px] font-semibold"
              >
                Reveal Answer (Space)
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="rating-pills"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="space-y-3"
            >
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                
                {/* Again / 0 */}
                <button
                  disabled={submitting}
                  onClick={() => handleRate(0)}
                  className="p-3 rounded-2xl bg-[#ff3b30]/10 hover:bg-[#ff3b30]/20 text-[#ff3b30] border border-[#ff3b30]/20 text-center transition-all active:scale-95 select-none"
                >
                  <div className="text-xs font-semibold uppercase tracking-wider mb-0.5">Again</div>
                  <div className="text-[11px] opacity-80">&lt; 1 min [1]</div>
                </button>

                {/* Hard / 2 */}
                <button
                  disabled={submitting}
                  onClick={() => handleRate(2)}
                  className="p-3 rounded-2xl bg-[#ff9500]/10 hover:bg-[#ff9500]/20 text-[#ff9500] border border-[#ff9500]/20 text-center transition-all active:scale-95 select-none"
                >
                  <div className="text-xs font-semibold uppercase tracking-wider mb-0.5">Hard</div>
                  <div className="text-[11px] opacity-80">1 day [2]</div>
                </button>

                {/* Good / 4 */}
                <button
                  disabled={submitting}
                  onClick={() => handleRate(4)}
                  className="p-3 rounded-2xl bg-[#0071e3]/10 hover:bg-[#0071e3]/20 text-[#0071e3] border border-[#0071e3]/20 text-center transition-all active:scale-95 select-none"
                >
                  <div className="text-xs font-semibold uppercase tracking-wider mb-0.5">Good</div>
                  <div className="text-[11px] opacity-80">3 days [3]</div>
                </button>

                {/* Easy / 5 */}
                <button
                  disabled={submitting}
                  onClick={() => handleRate(5)}
                  className="p-3 rounded-2xl bg-[#34c759]/10 hover:bg-[#34c759]/20 text-[#34c759] border border-[#34c759]/20 text-center transition-all active:scale-95 select-none"
                >
                  <div className="text-xs font-semibold uppercase tracking-wider mb-0.5">Easy</div>
                  <div className="text-[11px] opacity-80">7 days [4]</div>
                </button>

              </div>
              <p className="text-center text-[11px] text-[#86868b]">
                Keyboard shortcuts: 1 (Again), 2 (Hard), 3 (Good), 4 (Easy)
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </div>
  );
};
