import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  Mic, 
  MicOff, 
  Volume2, 
  Plus, 
  CheckCircle2, 
  BrainCircuit
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';
import { ProgressRing } from '../ui/ProgressRing';
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

  // Mock microphone toggle & assessment for local dev
  const handleToggleRecord = async () => {
    if (!isRecording) {
      setIsRecording(true);
      // Simulate 2 seconds of speaking
      setTimeout(async () => {
        setIsRecording(false);
        setAssessing(true);
        try {
          // Send sample audio data
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
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 space-y-10">
      
      {/* Title */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#5856d6]/10 text-[#5856d6] dark:text-[#bf5af2] text-xs font-semibold mb-3">
          <BrainCircuit className="w-3.5 h-3.5" />
          <span>Apple Intelligence Assistant</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-[#1d1d1f] dark:text-[#f5f5f7]">
          AI Learning Lab
        </h1>
        <p className="text-[14px] text-[#86868b] mt-1">
          Deep contextual linguistic decomposition and real-time acoustic speech evaluation
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Section 1: Vocabulary Deep Analyzer */}
        <div className="space-y-4">
          <Card className="p-6">
            <h3 className="text-lg font-bold tracking-tight text-[#1d1d1f] dark:text-[#f5f5f7] mb-2 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#0071e3]" />
              <span>Vocabulary Breakdown</span>
            </h3>
            <p className="text-xs text-[#86868b] mb-4">
              Enter any word or expression to receive CEFR difficulty, collocations, and contextual nuance.
            </p>

            <div className="flex gap-2 mb-6">
              <Input
                placeholder="e.g. ubiquitous, resilient, nuance"
                value={targetWord}
                onChange={(e) => setTargetWord(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
                className="rounded-xl"
              />
              <Button
                variant="primary"
                loading={analyzing}
                onClick={handleAnalyze}
                className="rounded-xl shrink-0 px-5"
              >
                Analyze
              </Button>
            </div>

            <AnimatePresence mode="wait">
              {analysis && (
                <motion.div
                  key={analysis.word || analysis.normalizedWord}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4 pt-4 border-t border-black/[0.05] dark:border-white/[0.08]"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-2xl font-bold text-[#1d1d1f] dark:text-[#f5f5f7]">
                          {analysis.word || analysis.normalizedWord}
                        </h4>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => playSpeech(analysis.word || analysis.normalizedWord)}
                          className="rounded-full w-7 h-7"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                      <p className="text-xs font-mono text-[#86868b] mt-0.5">
                        {analysis.phonetic}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Badge variant="purple" size="sm">{analysis.partOfSpeech}</Badge>
                      <Badge variant="blue" size="sm">{analysis.cefrLevel}</Badge>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-black/[0.03] dark:bg-white/[0.05]">
                    <div className="text-[11px] uppercase tracking-wider text-[#86868b] font-semibold mb-1">
                      Vietnamese Meaning
                    </div>
                    <div className="text-base font-semibold text-[#0071e3] dark:text-[#2997ff]">
                      {analysis.vietnameseTranslation || analysis.translation}
                    </div>
                  </div>

                  {analysis.definition && (
                    <div>
                      <div className="text-[11px] uppercase tracking-wider text-[#86868b] font-semibold mb-1">
                        Definition
                      </div>
                      <p className="text-sm text-[#1d1d1f] dark:text-[#f5f5f7] leading-relaxed">
                        {analysis.definition}
                      </p>
                    </div>
                  )}

                  {(analysis.exampleSentence || (analysis.examples && analysis.examples.length > 0)) && (
                    <div className="p-3 rounded-xl border border-black/[0.06] dark:border-white/[0.08] text-sm italic">
                      "{analysis.exampleSentence || analysis.examples[0].sentence}"
                    </div>
                  )}

                  {((analysis.synonyms && analysis.synonyms.length > 0) || (analysis.collocations && analysis.collocations.length > 0)) && (
                    <div>
                      <div className="text-[11px] uppercase tracking-wider text-[#86868b] font-semibold mb-1.5">
                        Synonyms & Collocations
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {(analysis.synonyms || analysis.collocations || []).map((s: string, idx: number) => (
                          <Badge key={idx} variant="gray" size="sm">{s}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="pt-2">
                    <Button
                      variant={savedSuccess ? "secondary" : "primary"}
                      icon={savedSuccess ? <CheckCircle2 className="w-4 h-4 text-[#34c759]" /> : <Plus className="w-4 h-4" />}
                      onClick={handleSaveWord}
                      disabled={savedSuccess}
                      className="w-full rounded-full"
                    >
                      {savedSuccess ? "Saved in Library" : "Add to SRS Flashcards"}
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        </div>

        {/* Section 2: Speech & Pronunciation Lab */}
        <div className="space-y-4">
          <Card className="p-6">
            <h3 className="text-lg font-bold tracking-tight text-[#1d1d1f] dark:text-[#f5f5f7] mb-2 flex items-center gap-2">
              <Mic className="w-5 h-5 text-[#af52de]" />
              <span>Pronunciation Coach</span>
            </h3>
            <p className="text-xs text-[#86868b] mb-4">
              Speak into your microphone to get instant phonetic precision, pitch, and fluency scoring.
            </p>

            <div className="p-4 rounded-2xl bg-black/[0.03] dark:bg-white/[0.05] border border-black/[0.05] dark:border-white/[0.08] mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] uppercase tracking-wider text-[#86868b] font-semibold">
                  Target Sentence
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  icon={<Volume2 className="w-3.5 h-3.5" />}
                  onClick={() => playSpeech(practicePhrase)}
                  className="text-xs text-[#0071e3] dark:text-[#2997ff] py-1 px-2.5 h-auto"
                >
                  Listen
                </Button>
              </div>
              <input
                type="text"
                value={practicePhrase}
                onChange={(e) => setPracticePhrase(e.target.value)}
                className="w-full text-base font-medium text-[#1d1d1f] dark:text-[#f5f5f7] bg-transparent border-b border-black/[0.1] dark:border-white/[0.15] focus:border-[#0071e3] outline-none py-1 transition-colors"
                placeholder="Type a sentence to practice pronunciation..."
              />
            </div>

            {/* Apple Siri Style Pulsing Microphone Recorder */}
            <div className="text-center py-6">
              <div className="relative inline-flex items-center justify-center">
                {isRecording && (
                  <>
                    <motion.div
                      animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0.1, 0.6] }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                      className="absolute w-24 h-24 rounded-full bg-gradient-to-tr from-[#af52de] to-[#0071e3] -z-10"
                    />
                    <motion.div
                      animate={{ scale: [1, 1.2, 1], opacity: [0.8, 0.2, 0.8] }}
                      transition={{ repeat: Infinity, duration: 1 }}
                      className="absolute w-20 h-20 rounded-full bg-[#af52de]/40 -z-10"
                    />
                  </>
                )}
                
                <button
                  onClick={handleToggleRecord}
                  disabled={assessing}
                  className={`w-16 h-16 rounded-full flex items-center justify-center text-white shadow-apple-md transition-all active:scale-95 select-none ${
                    isRecording
                      ? 'bg-[#ff3b30] shadow-[#ff3b30]/30'
                      : assessing
                      ? 'bg-[#86868b]'
                      : 'bg-gradient-to-tr from-[#0071e3] to-[#af52de] hover:opacity-95'
                  }`}
                >
                  {isRecording ? <MicOff className="w-7 h-7" /> : <Mic className="w-7 h-7" />}
                </button>
              </div>

              <p className="text-xs text-[#86868b] mt-3 font-medium">
                {isRecording
                  ? 'Listening... Speak clearly into microphone'
                  : assessing
                  ? 'Analyzing acoustic phonemes...'
                  : 'Tap microphone and read the sentence aloud'}
              </p>
            </div>

            {/* Assessment Score Presentation */}
            {assessment && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="pt-4 border-t border-black/[0.05] dark:border-white/[0.08]"
              >
                <div className="grid grid-cols-3 gap-3 text-center my-4">
                  <div className="p-3 rounded-xl bg-black/[0.02] dark:bg-white/[0.04]">
                    <ProgressRing progress={assessment.overallScore ?? assessment.matchScore} size={56} strokeWidth={5} color="#34c759">
                      <span className="text-xs font-bold">{Math.round(assessment.overallScore ?? assessment.matchScore)}</span>
                    </ProgressRing>
                    <div className="text-[11px] font-semibold text-[#86868b] mt-1">Overall</div>
                  </div>

                  <div className="p-3 rounded-xl bg-black/[0.02] dark:bg-white/[0.04]">
                    <ProgressRing progress={assessment.fluencyScore ?? assessment.matchScore} size={56} strokeWidth={5} color="#0071e3">
                      <span className="text-xs font-bold">{Math.round(assessment.fluencyScore ?? assessment.matchScore)}</span>
                    </ProgressRing>
                    <div className="text-[11px] font-semibold text-[#86868b] mt-1">Fluency</div>
                  </div>

                  <div className="p-3 rounded-xl bg-black/[0.02] dark:bg-white/[0.04]">
                    <ProgressRing progress={assessment.accuracyScore ?? assessment.matchScore} size={56} strokeWidth={5} color="#af52de">
                      <span className="text-xs font-bold">{Math.round(assessment.accuracyScore ?? assessment.matchScore)}</span>
                    </ProgressRing>
                    <div className="text-[11px] font-semibold text-[#86868b] mt-1">Accuracy</div>
                  </div>
                </div>

                {assessment.feedback && (
                  <p className="text-xs text-[#86868b] text-center italic bg-black/[0.02] dark:bg-white/[0.04] p-3 rounded-xl">
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
