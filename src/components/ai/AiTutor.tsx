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
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 space-y-8">
      
      {/* Title */}
      <div>
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-[var(--neural-cyan)]/10 border border-[var(--neural-cyan)]/20 text-[var(--neural-cyan)] text-[11px] font-mono mb-2">
          <BrainCircuit className="w-3.5 h-3.5" />
          <span>SYNAPSE // NEURAL COGNITION ENGINE</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-white font-tech">
          Cognitive Linguistic Lab
        </h1>
        <p className="text-xs font-mono text-stone-400 mt-1">
          Deep contextual linguistic decomposition and real-time acoustic speech evaluation
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Section 1: Vocabulary Deep Analyzer */}
        <div className="space-y-4">
          <Card className="p-6 border-white/[0.08] bg-[#0c0e12]">
            <h3 className="text-base font-bold tracking-tight text-white mb-1 flex items-center gap-2 font-tech">
              <Sparkles className="w-4 h-4 text-[var(--neural-cyan)]" />
              <span>Lexical Breakdown Engine</span>
            </h3>
            <p className="text-xs font-mono text-stone-400 mb-4">
              Enter any word or expression to compute CEFR level, collocations, and contextual nuance.
            </p>

            <div className="flex gap-2 mb-6">
              <Input
                placeholder="e.g. ubiquitous, resilient, nuance"
                value={targetWord}
                onChange={(e) => setTargetWord(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
                className="rounded-lg bg-black/40 border-white/[0.08] text-xs font-mono"
              />
              <Button
                variant="primary"
                loading={analyzing}
                onClick={handleAnalyze}
                className="rounded-lg shrink-0 px-4 text-xs font-mono"
              >
                Deconstruct
              </Button>
            </div>

            <AnimatePresence mode="wait">
              {analysis && (
                <motion.div
                  key={analysis.word || analysis.normalizedWord}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4 pt-4 border-t border-white/[0.08]"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-tech text-2xl font-bold tracking-tight text-white">
                          {analysis.word || analysis.normalizedWord}
                        </h4>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => playSpeech(analysis.word || analysis.normalizedWord)}
                          className="w-7 h-7 text-stone-400 hover:text-[var(--neural-cyan)]"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                      <p className="text-xs font-mono text-[var(--neural-cyan)] mt-0.5">
                        /{analysis.phonetic?.replace(/^\/|\/$/g, '')}/
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Badge variant="cyan" size="sm">{analysis.partOfSpeech}</Badge>
                      <Badge variant="stone" size="sm" className="font-mono">{analysis.cefrLevel}</Badge>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-lg bg-white/[0.02] border border-white/[0.06]">
                    <div className="text-[11px] uppercase font-mono tracking-wider text-stone-400 font-medium mb-1">
                      Vietnamese Meaning
                    </div>
                    <div className="text-sm font-semibold text-white/95">
                      {analysis.vietnameseTranslation || analysis.translation}
                    </div>
                  </div>

                  {analysis.definition && (
                    <div>
                      <div className="text-[11px] uppercase font-mono tracking-wider text-stone-400 font-medium mb-1">
                        Lexical Definition
                      </div>
                      <p className="text-xs text-stone-300 leading-relaxed font-sans">
                        "{analysis.definition}"
                      </p>
                    </div>
                  )}

                  {(analysis.exampleSentence || (analysis.examples && analysis.examples.length > 0)) && (
                    <div className="p-3 rounded-lg border border-white/[0.06] bg-black/30 text-xs font-mono text-stone-300">
                      "{analysis.exampleSentence || analysis.examples[0].sentence}"
                    </div>
                  )}

                  {((analysis.synonyms && analysis.synonyms.length > 0) || (analysis.collocations && analysis.collocations.length > 0)) && (
                    <div>
                      <div className="text-[11px] uppercase tracking-wider text-stone-400 font-mono mb-1.5">
                        Synaptic Collocations
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {(analysis.synonyms || analysis.collocations || []).map((s: string, idx: number) => (
                          <Badge key={idx} variant="stone" size="sm" className="font-mono">{s}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="pt-2">
                    <Button
                      variant={savedSuccess ? "secondary" : "primary"}
                      icon={savedSuccess ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Plus className="w-4 h-4" />}
                      onClick={handleSaveWord}
                      disabled={savedSuccess}
                      className="w-full rounded-lg text-xs font-mono py-2"
                    >
                      {savedSuccess ? "Encoded in Library" : "Insert into SRS Synapse Queue"}
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        </div>

        {/* Section 2: Speech & Pronunciation Lab */}
        <div className="space-y-4">
          <Card className="p-6 border-white/[0.08] bg-[#0c0e12]">
            <h3 className="text-base font-bold tracking-tight text-white mb-1 flex items-center gap-2 font-tech">
              <Mic className="w-4 h-4 text-[var(--neural-cyan)]" />
              <span>Acoustic Phonetics Analyzer</span>
            </h3>
            <p className="text-xs font-mono text-stone-400 mb-4">
              Real-time acoustic spectral analysis measuring pronunciation precision, cadence, and CEFR pitch.
            </p>

            <div className="p-3.5 rounded-lg bg-black/40 border border-white/[0.08] mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] uppercase tracking-wider text-stone-400 font-mono">
                  Input Sequence
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  icon={<Volume2 className="w-3.5 h-3.5" />}
                  onClick={() => playSpeech(practicePhrase)}
                  className="text-xs text-[var(--neural-cyan)] py-1 px-2.5 h-auto font-mono hover:bg-white/[0.05]"
                >
                  Synthesize
                </Button>
              </div>
              <input
                type="text"
                value={practicePhrase}
                onChange={(e) => setPracticePhrase(e.target.value)}
                className="w-full text-sm font-mono text-white bg-transparent border-b border-white/[0.1] focus:border-[var(--neural-cyan)] outline-none py-1 transition-colors"
                placeholder="Type a sentence to practice pronunciation..."
              />
            </div>

            {/* Acoustic Studio Recording Station */}
            <div className="text-center py-6">
              <div className="relative inline-flex items-center justify-center">
                {isRecording && (
                  <motion.div
                    animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0.1, 0.6] }}
                    transition={{ repeat: Infinity, duration: 1.2 }}
                    className="absolute w-20 h-20 rounded-full bg-[var(--neural-cyan)]/25 -z-10 shadow-[0_0_25px_rgba(0,240,255,0.4)]"
                  />
                )}
                
                <button
                  onClick={handleToggleRecord}
                  disabled={assessing}
                  className={`w-14 h-14 rounded-full flex items-center justify-center transition-all active:scale-95 select-none shadow-md border ${
                    isRecording
                      ? 'bg-red-500 text-white border-red-400 ring-4 ring-red-500/20'
                      : assessing
                      ? 'bg-stone-800 text-stone-500 border-white/[0.1]'
                      : 'bg-[#15171c] text-[var(--neural-cyan)] border-[var(--neural-cyan)]/30 hover:border-[var(--neural-cyan)] hover:shadow-[0_0_15px_rgba(0,240,255,0.25)]'
                  }`}
                >
                  {isRecording ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                </button>
              </div>

              <p className="text-xs font-mono text-stone-400 mt-3 tracking-wider">
                {isRecording
                  ? 'CAPTURING ACOUSTIC STREAM...'
                  : assessing
                  ? 'COMPUTING PHONEMIC FIDELITY...'
                  : 'INITIALIZE MICROPHONE TO ANALYZE'}
              </p>
            </div>

            {/* Assessment Score Presentation */}
            {assessment && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="pt-4 border-t border-white/[0.08]"
              >
                <div className="grid grid-cols-3 gap-3 text-center my-4">
                  <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.06]">
                    <ProgressRing progress={assessment.overallScore ?? assessment.matchScore} size={56} strokeWidth={5} color="#00f0ff">
                      <span className="text-xs font-bold text-white font-mono">{Math.round(assessment.overallScore ?? assessment.matchScore)}</span>
                    </ProgressRing>
                    <div className="text-[10px] font-mono uppercase tracking-wider text-stone-400 mt-1.5">Precision</div>
                  </div>

                  <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.06]">
                    <ProgressRing progress={assessment.fluencyScore ?? assessment.matchScore} size={56} strokeWidth={5} color="#10b981">
                      <span className="text-xs font-bold text-white font-mono">{Math.round(assessment.fluencyScore ?? assessment.matchScore)}</span>
                    </ProgressRing>
                    <div className="text-[10px] font-mono uppercase tracking-wider text-stone-400 mt-1.5">Cadence</div>
                  </div>

                  <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.06]">
                    <ProgressRing progress={assessment.accuracyScore ?? assessment.matchScore} size={56} strokeWidth={5} color="#8b5cf6">
                      <span className="text-xs font-bold text-white font-mono">{Math.round(assessment.accuracyScore ?? assessment.matchScore)}</span>
                    </ProgressRing>
                    <div className="text-[10px] font-mono uppercase tracking-wider text-stone-400 mt-1.5">Acoustic</div>
                  </div>
                </div>

                {assessment.feedback && (
                  <p className="text-xs text-stone-300 font-mono text-center bg-white/[0.02] p-3 rounded-lg border border-white/[0.06]">
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
