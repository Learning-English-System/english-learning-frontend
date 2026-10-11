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
        // Finished all cards! Trigger synaptic audio and confetti
        sounds.playSuccess();
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#00f0ff', '#10b981', '#ffffff', '#38bdf8'],
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
          <Card className="p-10 text-center border border-white/[0.08] bg-[#0c0d10]">
            <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-[var(--neural-cyan)]/10 text-[var(--neural-cyan)] flex items-center justify-center border border-[var(--neural-cyan)]/20 shadow-[0_0_15px_rgba(0,240,255,0.15)]">
              <Trophy className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold tracking-tight text-white mb-2 font-tech">
              SYNAPSE CYCLE COMPLETE
            </h2>
            <p className="text-xs text-stone-400 max-w-md mx-auto mb-6 leading-relaxed font-sans">
              All scheduled spaced-repetition neural nodes for this cycle have been consolidated. The SuperMemo-2 algorithm will reschedule based on memory half-life decay.
            </p>
            <Button
              variant="secondary"
              icon={<RefreshCcw className="w-3.5 h-3.5" />}
              onClick={onRefreshQueue}
              className="rounded-lg px-5 text-xs font-mono"
            >
              Scan For Due Nodes
            </Button>
          </Card>
        </motion.div>
      </div>
    );
  }

  const progressPercent = Math.round(((currentIndex + 1) / dueReviews.length) * 100);

  return (
    <div className="max-w-2xl mx-auto py-6 px-4">
      
      {/* Session Header */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-black/[0.06] dark:border-white/[0.08]">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-[var(--neural-cyan)]" />
          <span className="text-xs font-mono text-stone-400 uppercase tracking-wider">
            Node {currentIndex + 1} // {dueReviews.length}
          </span>
        </div>
        <span className="text-xs font-mono font-medium text-[var(--neural-cyan)]">
          {progressPercent}% Synced
        </span>
      </div>

      {/* Progress track */}
      <div className="w-full h-1 rounded-full bg-black/[0.06] dark:bg-white/[0.08] mb-6 overflow-hidden">
        <motion.div
          className="h-full bg-[var(--neural-cyan)] rounded-full shadow-[0_0_8px_rgba(0,240,255,0.5)]"
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
                className="w-full max-w-sm rounded-lg py-2.5 text-sm"
              >
                <span>Reveal Synapse Node</span>
                <kbd className="neural-kbd ml-2 text-inherit opacity-80">Space</kbd>
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="rating-pills"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="space-y-3"
            >
              {/* Tactile Mechanical Keypads */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                
                {/* Again / 0 */}
                <button
                  disabled={submitting}
                  onClick={() => handleRate(0)}
                  className="p-3 rounded-lg bg-black/[0.03] dark:bg-white/[0.04] hover:bg-black/[0.06] dark:hover:bg-white/[0.08] border border-black/[0.08] dark:border-white/[0.1] hover:border-red-500/40 text-left transition-all active:translate-y-[1px] select-none group"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-red-500 dark:text-red-400 font-tech">Again</span>
                    <kbd className="neural-kbd">1</kbd>
                  </div>
                  <div className="text-[11px] text-stone-500 font-mono">&lt; 1 min</div>
                </button>

                {/* Hard / 2 */}
                <button
                  disabled={submitting}
                  onClick={() => handleRate(2)}
                  className="p-3 rounded-lg bg-black/[0.03] dark:bg-white/[0.04] hover:bg-black/[0.06] dark:hover:bg-white/[0.08] border border-black/[0.08] dark:border-white/[0.1] hover:border-amber-500/40 text-left transition-all active:translate-y-[1px] select-none group"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-amber-500 dark:text-amber-400 font-tech">Hard</span>
                    <kbd className="neural-kbd">2</kbd>
                  </div>
                  <div className="text-[11px] text-stone-500 font-mono">1 day</div>
                </button>

                {/* Good / 4 */}
                <button
                  disabled={submitting}
                  onClick={() => handleRate(4)}
                  className="p-3 rounded-lg bg-black/[0.03] dark:bg-white/[0.04] hover:bg-black/[0.06] dark:hover:bg-white/[0.08] border border-black/[0.08] dark:border-white/[0.1] hover:border-cyan-500/40 text-left transition-all active:translate-y-[1px] select-none group"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-cyan-500 dark:text-[var(--neural-cyan)] font-tech">Good</span>
                    <kbd className="neural-kbd">3</kbd>
                  </div>
                  <div className="text-[11px] text-stone-500 font-mono">3 days</div>
                </button>

                {/* Easy / 5 */}
                <button
                  disabled={submitting}
                  onClick={() => handleRate(5)}
                  className="p-3 rounded-lg bg-black/[0.03] dark:bg-white/[0.04] hover:bg-black/[0.06] dark:hover:bg-white/[0.08] border border-black/[0.08] dark:border-white/[0.1] hover:border-emerald-500/40 text-left transition-all active:translate-y-[1px] select-none group"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-emerald-500 dark:text-emerald-400 font-tech">Easy</span>
                    <kbd className="neural-kbd">4</kbd>
                  </div>
                  <div className="text-[11px] text-stone-500 font-mono">7 days</div>
                </button>

              </div>
              <p className="text-center text-[11px] font-mono text-stone-500">
                SuperMemo-2 algorithm automatically recalibrates ease factor
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </div>
  );
};
