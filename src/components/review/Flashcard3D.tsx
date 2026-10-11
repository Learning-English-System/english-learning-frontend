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
      className="perspective-1000 w-full min-h-[380px] sm:min-h-[420px] cursor-pointer select-none group"
    >
      <div
        className={`relative w-full h-full duration-500 transform-style-3d transition-transform ease-out ${
          isFlipped ? 'rotate-y-180' : ''
        }`}
      >
        {/* FRONT SIDE */}
        <div className="absolute inset-0 backface-hidden bg-white dark:bg-[#111726] border border-slate-200 dark:border-white/10 shadow-lg dark:shadow-2xl rounded-2xl p-8 sm:p-10 flex flex-col justify-between">
          
          {/* Top badges & audio */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="stone" size="md" className="font-semibold text-xs px-2.5 py-1">
                {item.partOfSpeech || 'Word'}
              </Badge>
              <Badge variant="cyan" size="md" className="font-bold text-xs px-2.5 py-1">
                {item.cefrLevel || 'B2'}
              </Badge>
            </div>
            <Button
              variant="secondary"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                onPlayAudio();
              }}
              title="Phát âm"
              className="rounded-full w-10 h-10 shadow-sm"
            >
              <Volume2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </Button>
          </div>

          {/* Main Word - TO, RÕ RÀNG, SẮC NÉT */}
          <div className="text-center my-auto py-6">
            <h2 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-3">
              {item.word}
            </h2>
            {item.phonetic && (
              <p className="text-lg sm:text-xl text-indigo-600 dark:text-indigo-400 font-semibold tracking-wide">
                /{item.phonetic.replace(/^\/|\/$/g, '')}/
              </p>
            )}
          </div>

          {/* Bottom Flip Hint */}
          <div className="flex items-center justify-between text-xs sm:text-sm font-medium text-slate-400 dark:text-slate-500 pt-4 border-t border-slate-100 dark:border-white/5">
            <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Thẻ ôn tập</span>
            </span>
            <span className="flex items-center gap-1.5">
              <RotateCw className="w-3.5 h-3.5" />
              <span>Chạm hoặc nhấn <kbd className="neural-kbd text-xs">Space</kbd> để lật</span>
            </span>
          </div>
        </div>

        {/* BACK SIDE (ROTATED 180deg) */}
        <div className="absolute inset-0 backface-hidden rotate-y-180 bg-white dark:bg-[#111726] border-2 border-indigo-500/20 dark:border-indigo-500/30 shadow-lg dark:shadow-2xl rounded-2xl p-8 sm:p-10 flex flex-col justify-between">
          
          {/* Top header */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Giải nghĩa & Ngữ cảnh
            </span>
            <Button
              variant="secondary"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                onPlayAudio();
              }}
              title="Phát âm"
              className="rounded-full w-10 h-10 shadow-sm"
            >
              <Volume2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </Button>
          </div>

          {/* Meaning & Details - Chữ to rõ ràng */}
          <div className="my-auto py-4 space-y-4">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Nghĩa tiếng Việt
              </p>
              <h3 className="text-2xl sm:text-4xl font-bold text-slate-900 dark:text-white leading-tight">
                {item.translation}
              </h3>
            </div>

            {item.definition && (
              <div className="pt-3 border-t border-slate-100 dark:border-white/5">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Định nghĩa
                </p>
                <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                  {item.definition}
                </p>
              </div>
            )}

            {(item.exampleSentence || (item.examples && item.examples.length > 0)) && (
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/5">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Ví dụ câu
                </p>
                <p className="text-sm sm:text-base text-slate-800 dark:text-slate-200 font-medium italic">
                  "{item.exampleSentence || item.examples[0].sentence}"
                </p>
              </div>
            )}
          </div>

          {/* Bottom rating guidance */}
          <div className="flex items-center justify-between text-xs sm:text-sm font-medium text-slate-400 dark:text-slate-500 pt-4 border-t border-slate-100 dark:border-white/5">
            <span>Chọn mức độ ghi nhớ bên dưới</span>
            <span className="flex items-center gap-1">
              Phím tắt <kbd className="neural-kbd text-xs">1</kbd> <kbd className="neural-kbd text-xs">2</kbd> <kbd className="neural-kbd text-xs">3</kbd> <kbd className="neural-kbd text-xs">4</kbd>
            </span>
          </div>

        </div>
      </div>
    </div>
  );
};
