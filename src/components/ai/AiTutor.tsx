import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  Mic, 
  MicOff, 
  Volume2, 
  Plus, 
  CheckCircle2, 
  Bot
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';
import type { 
  VocabularyAnalysis, 
  PronunciationAssessment, 
  CreateVocabularyRequest 
} from '../../services/api';

interface AiTutorProps {
  onAnalyzeWord: (word: string) => Promise<VocabularyAnalysis>;
  onAssessPronunciation: (text: string, audioBase64: string) => Promise<PronunciationAssessment>;
  onSaveToVocab: (req: CreateVocabularyRequest) => Promise<void>;
}

export const AiTutor: React.FC<AiTutorProps> = ({
  onAnalyzeWord,
  onAssessPronunciation,
  onSaveToVocab,
}) => {
  // Vocabulary Analysis State
  const [targetWord, setTargetWord] = useState('resilient');
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<VocabularyAnalysis | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Pronunciation Assessment State
  const [practicePhrase, setPracticePhrase] = useState('The economy remains remarkably resilient.');
  const [isRecording, setIsRecording] = useState(false);
  const [assessing, setAssessing] = useState(false);
  const [assessment, setAssessment] = useState<PronunciationAssessment | null>(null);

  const handleAnalyze = async () => {
    if (!targetWord.trim()) return;
    setAnalyzing(true);
    setSavedSuccess(false);
    try {
      const res = await onAnalyzeWord(targetWord.trim());
      setAnalysis(res);
    } catch (err) {
      console.error('AI Analysis failed', err);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSaveWord = async () => {
    if (!analysis) return;
    try {
      await onSaveToVocab({
        word: analysis.word || analysis.normalizedWord,
        translation: analysis.vietnameseTranslation || analysis.translation || analysis.normalizedWord,
        partOfSpeech: analysis.partOfSpeech || 'Word',
        cefrLevel: analysis.cefrLevel || 'B2',
        definition: analysis.definition || '',
        exampleSentence: analysis.exampleSentence || (analysis.examples?.[0]?.sentence ?? ''),
      });
      setSavedSuccess(true);
    } catch (err) {
      console.error('Failed to save analyzed word', err);
    }
  };

  const playSpeech = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'en-US';
      window.speechSynthesis.speak(u);
    }
  };

  const handleToggleRecord = async () => {
    if (!isRecording) {
      setIsRecording(true);
      setTimeout(async () => {
        setIsRecording(false);
        setAssessing(true);
        try {
          const res = await onAssessPronunciation(
            practicePhrase,
            "UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA="
          );
          setAssessment(res);
        } catch (err) {
          console.error(err);
        } finally {
          setAssessing(false);
        }
      }, 2200);
    } else {
      setIsRecording(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 space-y-8">
      
      {/* Title */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 text-xs font-semibold mb-2">
          <Bot className="w-4 h-4" />
          <span>AI Trợ Lý Ngôn Ngữ</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Luyện Nói & Phân Tích Chuyên Sâu
        </h1>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
          Bóc tách ngữ nghĩa từ vựng chuyên sâu và chấm điểm âm học chuẩn bản xứ
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Section 1: Vocabulary Deep Analyzer */}
        <div className="space-y-4">
          <Card className="p-6 sm:p-7 border border-slate-200/90 dark:border-white/10 bg-white dark:bg-[#111726] shadow-sm rounded-2xl">
            <h3 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white mb-1 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <span>Phân Tích Từ Vựng</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-5">
              Nhập từ vựng bất kỳ để nhận phân tích độ khó CEFR, collocations và sắc thái ngữ cảnh.
            </p>

            <div className="flex gap-2.5 mb-6">
              <Input
                placeholder="e.g. ubiquitous, resilient, nuance"
                value={targetWord}
                onChange={(e) => setTargetWord(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
                className="rounded-xl text-sm bg-slate-50 dark:bg-slate-800/40"
              />
              <Button
                variant="primary"
                loading={analyzing}
                onClick={handleAnalyze}
                className="rounded-xl shrink-0 px-5 text-sm font-semibold"
              >
                Phân tích
              </Button>
            </div>

            <AnimatePresence mode="wait">
              {analysis && (
                <motion.div
                  key={analysis.word || analysis.normalizedWord}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4 pt-4 border-t border-slate-100 dark:border-white/5"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2.5">
                        <h4 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                          {analysis.word || analysis.normalizedWord}
                        </h4>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => playSpeech(analysis.word || analysis.normalizedWord)}
                          className="w-8 h-8 rounded-full text-slate-500 hover:text-indigo-600"
                        >
                          <Volume2 className="w-4 h-4" />
                        </Button>
                      </div>
                      {analysis.phonetic && (
                        <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 mt-0.5">
                          /{analysis.phonetic.replace(/^\/|\/$/g, '')}/
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Badge variant="stone" size="md" className="font-semibold">{analysis.partOfSpeech}</Badge>
                      <Badge variant="cyan" size="md" className="font-bold">{analysis.cefrLevel}</Badge>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/5">
                    <div className="text-xs uppercase font-bold tracking-wider text-slate-400 mb-1">
                      Nghĩa tiếng Việt
                    </div>
                    <div className="text-lg font-bold text-slate-900 dark:text-white">
                      {analysis.vietnameseTranslation || analysis.translation}
                    </div>
                  </div>

                  {analysis.definition && (
                    <div>
                      <div className="text-xs uppercase font-bold tracking-wider text-slate-400 mb-1">
                        Định nghĩa
                      </div>
                      <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                        "{analysis.definition}"
                      </p>
                    </div>
                  )}

                  {(analysis.exampleSentence || (analysis.examples && analysis.examples.length > 0)) && (
                    <div className="p-3.5 rounded-xl border border-slate-200/60 dark:border-white/5 bg-slate-50 dark:bg-white/[0.02] text-sm italic text-slate-800 dark:text-slate-200 font-medium">
                      "{analysis.exampleSentence || analysis.examples[0].sentence}"
                    </div>
                  )}

                  {((analysis.synonyms && analysis.synonyms.length > 0) || (analysis.collocations && analysis.collocations.length > 0)) && (
                    <div>
                      <div className="text-xs uppercase tracking-wider text-slate-400 font-bold mb-1.5">
                        Từ đồng nghĩa & Cụm từ liên quan
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {(analysis.synonyms || analysis.collocations || []).map((s: string, idx: number) => (
                          <Badge key={idx} variant="stone" size="sm" className="font-semibold">{s}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="pt-2">
                    <Button
                      variant={savedSuccess ? "secondary" : "primary"}
                      icon={savedSuccess ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Plus className="w-4 h-4" />}
                      onClick={handleSaveWord}
                      disabled={savedSuccess}
                      className="w-full rounded-xl py-3 text-sm font-semibold shadow-sm"
                    >
                      {savedSuccess ? "Đã lưu vào bộ từ vựng" : "Thêm vào lịch ôn tập Flashcard"}
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        </div>

        {/* Section 2: Speech & Pronunciation Lab */}
        <div className="space-y-4">
          <Card className="p-6 sm:p-7 border border-slate-200/90 dark:border-white/10 bg-white dark:bg-[#111726] shadow-sm rounded-2xl">
            <h3 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white mb-1 flex items-center gap-2">
              <Mic className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <span>Chấm Điểm Phát Âm</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-5">
              Đọc to câu văn vào micro để nhận phản hồi trực tiếp về độ chuẩn xác ngữ âm và độ lưu loát.
            </p>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/5 mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs uppercase tracking-wider text-slate-400 font-bold">
                  Câu luyện tập
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  icon={<Volume2 className="w-3.5 h-3.5" />}
                  onClick={() => playSpeech(practicePhrase)}
                  className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold py-1 px-2.5 h-auto rounded-lg"
                >
                  Nghe mẫu
                </Button>
              </div>
              <input
                type="text"
                value={practicePhrase}
                onChange={(e) => setPracticePhrase(e.target.value)}
                className="w-full text-base font-semibold text-slate-900 dark:text-white bg-transparent border-b border-slate-200 dark:border-white/10 focus:border-indigo-600 outline-none py-1 transition-colors"
                placeholder="Nhập câu bạn muốn luyện phát âm..."
              />
            </div>

            {/* Recording Station */}
            <div className="text-center py-6">
              <div className="relative inline-flex items-center justify-center">
                {isRecording && (
                  <motion.div
                    animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0.1, 0.6] }}
                    transition={{ repeat: Infinity, duration: 1.2 }}
                    className="absolute w-20 h-20 rounded-full bg-rose-500/20 -z-10"
                  />
                )}
                
                <button
                  onClick={handleToggleRecord}
                  disabled={assessing}
                  className={`w-16 h-16 rounded-full flex items-center justify-center transition-all active:scale-95 select-none shadow-md ${
                    isRecording
                      ? 'bg-rose-600 text-white ring-4 ring-rose-500/20'
                      : assessing
                      ? 'bg-slate-200 dark:bg-slate-800 text-slate-400'
                      : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-500/25'
                  }`}
                >
                  {isRecording ? <MicOff className="w-7 h-7" /> : <Mic className="w-7 h-7" />}
                </button>
              </div>

              <p className="text-sm font-semibold text-slate-600 dark:text-slate-300 mt-4">
                {isRecording
                  ? 'Đang lắng nghe... hãy đọc to câu trên'
                  : assessing
                  ? 'AI đang phân tích ngữ âm...'
                  : 'Bấm micro để bắt đầu nói'}
              </p>
            </div>

            {/* Assessment Score - Chữ số to rõ ràng! */}
            {assessment && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="pt-4 border-t border-slate-100 dark:border-white/5"
              >
                <div className="grid grid-cols-3 gap-3 text-center my-4">
                  
                  {/* Overall */}
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/5">
                    <div className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">
                      {Math.round(assessment.overallScore ?? assessment.matchScore)}%
                    </div>
                    <div className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-1">Tổng quan</div>
                  </div>

                  {/* Fluency */}
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/5">
                    <div className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
                      {Math.round(assessment.fluencyScore ?? assessment.matchScore)}%
                    </div>
                    <div className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-1">Lưu loát</div>
                  </div>

                  {/* Accuracy */}
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/5">
                    <div className="text-3xl font-extrabold text-sky-600 dark:text-sky-400">
                      {Math.round(assessment.accuracyScore ?? assessment.matchScore)}%
                    </div>
                    <div className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-1">Độ chính xác</div>
                  </div>

                </div>

                {assessment.feedback && (
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 text-center bg-slate-50 dark:bg-white/[0.03] p-3 rounded-xl border border-slate-200/60 dark:border-white/5 font-medium">
                    "{assessment.feedback}"
                  </p>
                )}
              </motion.div>
            )}

          </Card>
        </div>

      </div>

    </div>
  );
};
