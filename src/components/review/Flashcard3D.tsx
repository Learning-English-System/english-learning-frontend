import React from 'react';
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
    <div
      onClick={onFlip}
      className="perspective-1000 w-full h-[400px] sm:h-[430px] cursor-pointer select-none group"
    >
      <div
        className={`relative w-full h-full duration-500 transform-style-3d transition-transform ease-out ${
          isFlipped ? 'rotate-y-180' : ''
        }`}
      >
        {/* FRONT SIDE */}
        <div className="absolute inset-0 backface-hidden craft-surface rounded-2xl p-8 sm:p-10 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="stone" size="sm">
                {item.partOfSpeech || 'Word'}
              </Badge>
              <Badge variant="amber" size="sm" className="font-mono">
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
              className="rounded-md w-9 h-9 bg-black/[0.04] dark:bg-white/[0.06] hover:bg-black/[0.08]"
            >
              <Volume2 className="w-4 h-4 text-stone-700 dark:text-stone-300" />
            </Button>
          </div>

          <div className="text-center my-auto py-6">
            <h2 className="font-serif text-5xl sm:text-6xl font-normal tracking-tight text-[#121316] dark:text-[#f4f3f0] mb-3">
              {item.word}
            </h2>
            {item.phonetic ? (
              <p className="font-mono text-sm text-stone-500 dark:text-stone-400 tracking-wider">
                {item.phonetic}
              </p>
            ) : (
              <p className="font-mono text-xs text-stone-400 dark:text-stone-500 tracking-widest uppercase">
                TAP TO FLIP
              </p>
            )}
          </div>

          <div className="flex items-center justify-center gap-2 text-xs text-stone-500 dark:text-stone-400 font-medium pt-4 border-t border-black/[0.06] dark:border-white/[0.08]">
            <RotateCw className="w-3.5 h-3.5" />
            <span>Click card or press <kbd className="craft-kbd">Space</kbd> to reveal meaning</span>
          </div>
        </div>

        {/* BACK SIDE (ROTATED 180deg) */}
        <div className="absolute inset-0 backface-hidden rotate-y-180 craft-surface rounded-2xl p-8 sm:p-10 flex flex-col justify-between border-stone-300 dark:border-stone-700">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-medium text-stone-500 uppercase tracking-widest">
              Lexical Definition
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                onPlayAudio();
              }}
              className="rounded-md w-8 h-8"
            >
              <Volume2 className="w-4 h-4" />
            </Button>
          </div>

          <div className="my-auto py-4 space-y-4">
            <div>
              <p className="text-[11px] text-stone-400 uppercase tracking-wider font-mono font-medium mb-1">
                Vietnamese Translation
              </p>
              <h3 className="text-2xl sm:text-3xl font-bold text-[#121316] dark:text-[#f4f3f0]">
                {item.translation}
              </h3>
            </div>

            {item.definition && (
              <div className="pt-2 border-t border-black/[0.06] dark:border-white/[0.08]">
                <p className="text-[11px] text-stone-400 uppercase tracking-wider font-mono font-medium mb-1">
                  Definition
                </p>
                <p className="font-serif italic text-base text-[#121316] dark:text-[#f4f3f0] leading-relaxed">
                  "{item.definition}"
                </p>
              </div>
            )}

            {(item.exampleSentence || (item.examples && item.examples.length > 0)) && (
              <div className="pt-2 border-t border-black/[0.06] dark:border-white/[0.08] bg-black/[0.02] dark:bg-white/[0.03] p-3 rounded-lg">
                <p className="text-[11px] text-stone-400 uppercase tracking-wider font-mono font-medium mb-1">
                  Example
                </p>
                <p className="text-sm text-stone-700 dark:text-stone-300 leading-relaxed font-sans">
                  {item.exampleSentence || item.examples[0].sentence}
                </p>
              </div>
            )}
          </div>

          <div className="flex items-center justify-center gap-1.5 text-xs text-stone-500 font-medium pt-3 border-t border-black/[0.06] dark:border-white/[0.08]">
            <span>Rate recall with keys <kbd className="craft-kbd">1</kbd> <kbd className="craft-kbd">2</kbd> <kbd className="craft-kbd">3</kbd> <kbd className="craft-kbd">4</kbd></span>
          </div>
        </div>
      </div>
    </div>
  );
};
