import React from 'react';
import { motion } from 'framer-motion';
import { Volume2, RotateCw } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import type { VocabularyItem } from '../../services/api';

interface Flashcard3DProps {
  item: VocabularyItem;
  isFlipped: boolean;
  onFlip: () => void;
  onPlayAudio: () => void;
}

export const Flashcard3D: React.FC<Flashcard3DProps> = ({
  item,
  isFlipped,
  onFlip,
  onPlayAudio,
}) => {
  return (
    <div className="w-full max-w-xl mx-auto perspective-1000 py-4">
      <motion.div
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
        className="w-full min-h-[380px] sm:min-h-[420px] relative transform-style-3d cursor-pointer select-none"
        onClick={onFlip}
      >
        {/* FRONT SIDE */}
        <div className="absolute inset-0 backface-hidden apple-glass rounded-3xl p-8 sm:p-10 shadow-apple-lg border border-black/[0.08] dark:border-white/[0.12] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="purple" size="sm">
                {item.partOfSpeech || 'Word'}
              </Badge>
              <Badge variant="blue" size="sm">
                {item.cefrLevel || 'B2'}
              </Badge>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                onPlayAudio();
              }}
              title="Listen pronunciation"
              className="rounded-full w-10 h-10 bg-black/[0.04] dark:bg-white/[0.08] hover:bg-[#0071e3] hover:text-white transition-colors"
            >
              <Volume2 className="w-5 h-5" />
            </Button>
          </div>

          <div className="text-center my-auto py-6">
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-[#1d1d1f] dark:text-[#f5f5f7] mb-3">
              {item.word}
            </h2>
            {item.phonetic && (
              <p className="text-lg text-[#86868b] dark:text-[#a1a1a6] font-mono tracking-normal">
                {item.phonetic}
              </p>
            )}
          </div>

          <div className="flex items-center justify-center gap-2 text-xs text-[#86868b] font-medium pt-4 border-t border-black/[0.05] dark:border-white/[0.06]">
            <RotateCw className="w-3.5 h-3.5 animate-spin-slow" />
            <span>Click or press Spacebar to reveal answer</span>
          </div>
        </div>

        {/* BACK SIDE (ROTATED 180deg) */}
        <div className="absolute inset-0 backface-hidden rotate-y-180 apple-glass rounded-3xl p-8 sm:p-10 shadow-apple-lg border border-[#0071e3]/20 dark:border-[#2997ff]/30 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#0071e3] uppercase tracking-wider">
              Meaning & Context
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                onPlayAudio();
              }}
              className="rounded-full w-9 h-9"
            >
              <Volume2 className="w-4 h-4" />
            </Button>
          </div>

          <div className="my-auto py-4 space-y-4">
            <div>
              <p className="text-xs text-[#86868b] uppercase tracking-wider font-semibold mb-1">
                Vietnamese Translation
              </p>
              <h3 className="text-2xl sm:text-3xl font-bold text-[#1d1d1f] dark:text-[#f5f5f7]">
                {item.translation}
              </h3>
            </div>

            {item.definition && (
              <div className="pt-2 border-t border-black/[0.05] dark:border-white/[0.06]">
                <p className="text-xs text-[#86868b] uppercase tracking-wider font-semibold mb-1">
                  Definition
                </p>
                <p className="text-sm text-[#1d1d1f] dark:text-[#f5f5f7] leading-relaxed">
                  {item.definition}
                </p>
              </div>
            )}

            {(item.exampleSentence || (item.examples && item.examples.length > 0)) && (
              <div className="pt-2 border-t border-black/[0.05] dark:border-white/[0.06] bg-black/[0.02] dark:bg-white/[0.04] p-3 rounded-xl">
                <p className="text-xs text-[#86868b] uppercase tracking-wider font-semibold mb-1">
                  Example
                </p>
                <p className="text-sm italic text-[#1d1d1f] dark:text-[#f5f5f7] leading-relaxed">
                  "{item.exampleSentence || item.examples[0].sentence}"
                </p>
              </div>
            )}
          </div>

          <div className="flex items-center justify-center gap-2 text-xs text-[#86868b] font-medium pt-4 border-t border-black/[0.05] dark:border-white/[0.06]">
            <span>Rate your recall quality below</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
