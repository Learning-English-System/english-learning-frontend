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
      className="perspective-1000 w-full h-[380px] sm:h-[410px] cursor-pointer select-none group"
    >
      <div
        className={`relative w-full h-full duration-500 transform-style-3d transition-transform ease-out ${
          isFlipped ? 'rotate-y-180' : ''
        }`}
      >
        {/* FRONT SIDE */}
        <div className="absolute inset-0 backface-hidden neural-surface rounded-xl p-8 sm:p-10 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="stone" size="sm" className="font-mono">
                {item.partOfSpeech || 'Word'}
              </Badge>
              <Badge variant="cyan" size="sm" className="font-mono">
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
              className="rounded-lg w-8 h-8 bg-black/[0.04] dark:bg-white/[0.06] hover:bg-black/[0.08]"
            >
              <Volume2 className="w-4 h-4 text-stone-700 dark:text-stone-300" />
            </Button>
          </div>

          <div className="text-center my-auto py-6">
            <h2 className="font-tech text-5xl sm:text-6xl font-bold tracking-tight text-[#090a0c] dark:text-[#f3f4f6] mb-3">
              {item.word}
            </h2>
            {item.phonetic ? (
              <p className="font-mono text-sm text-cyan-600 dark:text-cyan-400 tracking-wider">
                /{item.phonetic}/
              </p>
            ) : (
              <p className="font-mono text-[11px] text-stone-400 uppercase tracking-widest">
                [SPACE TO FLIP]
              </p>
            )}
          </div>

          <div className="flex items-center justify-between text-xs font-mono text-stone-500 pt-3 border-t border-black/[0.06] dark:border-white/[0.07]">
            <span className="flex items-center gap-1.5">
              <span className="synapse-dot" />
              <span>ACTIVE SYNAPSE</span>
            </span>
            <span className="flex items-center gap-1">
              <RotateCw className="w-3 h-3" />
              <span>Press <kbd className="neural-kbd">Space</kbd></span>
            </span>
          </div>
        </div>

        {/* BACK SIDE (ROTATED 180deg) */}
        <div className="absolute inset-0 backface-hidden rotate-y-180 neural-surface rounded-xl p-8 sm:p-10 flex flex-col justify-between border-cyan-500/20 dark:border-cyan-400/20">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-cyan-600 dark:text-cyan-400 tracking-widest uppercase">
              // RECALL SYNTHESIS
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                onPlayAudio();
              }}
              className="rounded-lg w-8 h-8"
            >
              <Volume2 className="w-4 h-4" />
            </Button>
          </div>

          <div className="my-auto py-4 space-y-4">
            <div>
              <p className="text-[11px] text-stone-400 uppercase font-mono tracking-wider mb-1">
                Vietnamese Translation
              </p>
              <h3 className="font-tech text-2xl sm:text-3xl font-bold text-[#090a0c] dark:text-[#f3f4f6]">
                {item.translation}
              </h3>
            </div>

            {item.definition && (
              <div className="pt-2 border-t border-black/[0.06] dark:border-white/[0.07]">
                <p className="text-[11px] text-stone-400 uppercase font-mono tracking-wider mb-1">
                  Definition
                </p>
                <p className="text-sm text-stone-700 dark:text-stone-300 leading-relaxed font-sans">
                  {item.definition}
                </p>
              </div>
            )}

            {(item.exampleSentence || (item.examples && item.examples.length > 0)) && (
              <div className="pt-2 border-t border-black/[0.06] dark:border-white/[0.07] bg-black/[0.02] dark:bg-white/[0.03] p-3 rounded-lg border border-black/[0.04] dark:border-white/[0.06]">
                <p className="text-[10px] text-stone-400 uppercase font-mono tracking-wider mb-1">
                  Contextual Example
                </p>
                <p className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed font-mono">
                  "{item.exampleSentence || item.examples[0].sentence}"
                </p>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between text-xs font-mono text-stone-500 pt-3 border-t border-black/[0.06] dark:border-white/[0.07]">
            <span>STRENGTH: <span className="text-emerald-500 font-bold">OPTIMAL</span></span>
            <span>Keys <kbd className="neural-kbd">1</kbd> <kbd className="neural-kbd">2</kbd> <kbd className="neural-kbd">3</kbd> <kbd className="neural-kbd">4</kbd></span>
          </div>
        </div>
      </div>
    </div>
  );
};
