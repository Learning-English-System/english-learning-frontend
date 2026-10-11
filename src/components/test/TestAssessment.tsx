import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Award, 
  Check 
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import type { TestSession } from '../../services/api';

interface TestAssessmentProps {
  currentTest: TestSession | null;
  onStartTest: (level: string, questionCount: number) => Promise<TestSession>;
  onSubmitTest: (testId: string, answers: Record<string, string>) => Promise<any>;
}

export const TestAssessment: React.FC<TestAssessmentProps> = ({
  currentTest,
  onStartTest,
  onSubmitTest,
}) => {
  const [selectedLevel, setSelectedLevel] = useState('B2');
  const [selectedCount, setSelectedCount] = useState(5);
  const [starting, setStarting] = useState(false);
  
  // Test Taking State
  const [activeSession, setActiveSession] = useState<TestSession | null>(currentTest);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any | null>(null);

  const handleStart = async () => {
    setStarting(true);
    setResult(null);
    setAnswers({});
    setCurrentQuestionIndex(0);
    try {
      const session = await onStartTest(selectedLevel, selectedCount);
      setActiveSession(session);
    } catch (err) {
      console.error('Failed to start test', err);
    } finally {
      setStarting(false);
    }
  };

  const handleSelectOption = (questionId: string, optionId: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionId,
    }));
  };

  const handleSubmit = async () => {
    if (!activeSession) return;
    setSubmitting(true);
    try {
      const res = await onSubmitTest(activeSession.id, answers);
      setResult(res);
      setActiveSession(null);
    } catch (err) {
      console.error('Failed to submit test', err);
    } finally {
      setSubmitting(false);
    }
  };

  const questions = activeSession?.questions || [];
  const activeQuestion = questions[currentQuestionIndex];
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 space-y-8">
      
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-[var(--neural-cyan)]/10 border border-[var(--neural-cyan)]/20 text-[var(--neural-cyan)] text-[11px] font-mono mb-2">
          <Award className="w-3.5 h-3.5" />
          <span>SYNAPSE // CEFR EVALUATION CORE</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-white font-tech">
          Cognitive Proficiency Diagnostics
        </h1>
        <p className="text-xs font-mono text-stone-400 mt-1">
          Standardized CEFR benchmarks measuring syntactic grammar, lexical depth, and cognitive fluency
        </p>
      </div>

      {/* VIEW 1: Test Result Presentation */}
      {result && (
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Card className="p-8 sm:p-10 text-center border border-emerald-500/30 bg-[#0c0e12]">
            <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
              <Award className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-bold text-white mb-1 font-tech">
              DIAGNOSTIC CYCLE COMPLETE
            </h2>
            <p className="text-xs font-mono text-stone-400 mb-6">
              Your responses have been validated against the CEFR linguistic framework.
            </p>

            <div className="max-w-xs mx-auto py-4 mb-6">
              <div className="text-5xl font-black text-[var(--neural-cyan)] tracking-tight mb-2 font-tech">
                {result.score !== undefined ? `${Math.round(result.score)}%` : 'Completed'}
              </div>
              <div className="flex items-center justify-center gap-2">
                <Badge variant="cyan" size="md">
                  Calibrated Level: {result.cefrLevel || selectedLevel}
                </Badge>
              </div>
            </div>

            <Button
              variant="primary"
              onClick={() => {
                setResult(null);
                setActiveSession(null);
              }}
              className="rounded-lg px-6 py-2 text-xs font-mono"
            >
              Initialize Next Diagnostic
            </Button>
          </Card>
        </motion.div>
      )}

      {/* VIEW 2: Active Test Taking Session */}
      {!result && activeSession && activeQuestion && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Status bar */}
          <div className="flex items-center justify-between text-xs font-mono text-stone-400 px-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md bg-[var(--neural-cyan)]/10 text-[var(--neural-cyan)] border border-[var(--neural-cyan)]/20">
                Level {activeSession.targetLevel || selectedLevel}
              </span>
              <span>Sequence {currentQuestionIndex + 1} // {questions.length}</span>
            </div>
            <span>{answeredCount}/{questions.length} responses recorded</span>
          </div>

          {/* Question Card */}
          <Card className="p-8 border-white/[0.08] bg-[#0c0e12]">
            <h3 className="font-tech text-xl font-bold tracking-tight text-white mb-6 leading-relaxed">
              {activeQuestion.prompt}
            </h3>

            {/* Options */}
            <div className="space-y-2.5 mb-8">
              {activeQuestion.options.map((option, idx) => {
                const isSelected = answers[activeQuestion.id] === option;
                return (
                  <button
                    key={option}
                    onClick={() => handleSelectOption(activeQuestion.id, option)}
                    className={`w-full text-left p-3.5 rounded-lg border transition-all duration-150 flex items-center justify-between select-none ${
                      isSelected
                        ? 'border-[var(--neural-cyan)] bg-[var(--neural-cyan)]/10 text-white shadow-[0_0_12px_rgba(0,240,255,0.15)]'
                        : 'border-white/[0.08] bg-white/[0.02] text-stone-300 hover:border-white/[0.2] hover:bg-white/[0.04]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <kbd className="neural-kbd">
                        {String.fromCharCode(65 + idx)}
                      </kbd>
                      <span className="text-xs font-sans text-stone-200">{option}</span>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-[var(--neural-cyan)]" />}
                  </button>
                );
              })}
            </div>

            {/* Navigator controls */}
            <div className="flex items-center justify-between pt-6 border-t border-white/[0.08]">
              <Button
                variant="secondary"
                disabled={currentQuestionIndex === 0}
                onClick={() => setCurrentQuestionIndex((prev) => prev - 1)}
                className="rounded-lg px-4 text-xs font-mono"
              >
                Previous
              </Button>

              {currentQuestionIndex + 1 < questions.length ? (
                <Button
                  variant="primary"
                  onClick={() => setCurrentQuestionIndex((prev) => prev - 1)}
                  className="rounded-lg px-5 text-xs font-mono"
                >
                  Next Node
                </Button>
              ) : (
                <Button
                  variant="primary"
                  loading={submitting}
                  onClick={handleSubmit}
                  className="rounded-lg px-6 text-xs font-mono bg-emerald-500 hover:bg-emerald-400 text-black font-semibold"
                >
                  Submit Diagnostic
                </Button>
              )}
            </div>
          </Card>
        </motion.div>
      )}

      {/* VIEW 3: Start New Test Configuration */}
      {!result && !activeSession && (
        <Card className="p-8 sm:p-10 border-white/[0.08] bg-[#0c0e12]">
          <div className="max-w-lg mx-auto text-center space-y-6">
            <div className="w-14 h-14 mx-auto rounded-xl bg-[var(--neural-cyan)]/10 border border-[var(--neural-cyan)]/25 flex items-center justify-center text-[var(--neural-cyan)] shadow-[0_0_20px_rgba(0,240,255,0.15)]">
              <FileText className="w-7 h-7" />
            </div>

            <div>
              <h2 className="text-xl font-bold tracking-tight text-white mb-1 font-tech">
                Diagnostic Parameters
              </h2>
              <p className="text-xs font-mono text-stone-400">
                Select target CEFR cognitive benchmark and sequence volume.
              </p>
            </div>

            <div className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-stone-400 mb-2">
                  CEFR Proficiency Target
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].map((lvl) => (
                    <button
                      key={lvl}
                      onClick={() => setSelectedLevel(lvl)}
                      className={`py-2 rounded-lg font-mono font-bold text-xs border transition-all ${
                        selectedLevel === lvl
                          ? 'border-[var(--neural-cyan)] bg-[var(--neural-cyan)]/20 text-[var(--neural-cyan)] shadow-[0_0_10px_rgba(0,240,255,0.2)]'
                          : 'border-white/[0.08] bg-white/[0.02] text-stone-400 hover:border-white/[0.15] hover:text-white'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-stone-400 mb-2">
                  Sequence Volume
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[5, 10, 20].map((cnt) => (
                    <button
                      key={cnt}
                      onClick={() => setSelectedCount(cnt)}
                      className={`py-2 rounded-lg text-xs font-mono border transition-all ${
                        selectedCount === cnt
                          ? 'border-[var(--neural-cyan)] bg-[var(--neural-cyan)]/20 text-[var(--neural-cyan)] shadow-[0_0_10px_rgba(0,240,255,0.2)]'
                          : 'border-white/[0.08] bg-white/[0.02] text-stone-400 hover:border-white/[0.15] hover:text-white'
                      }`}
                    >
                      {cnt} Nodes
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-4">
              <Button
                variant="primary"
                size="lg"
                loading={starting}
                onClick={handleStart}
                className="w-full rounded-lg font-mono text-xs py-3"
              >
                Execute CEFR {selectedLevel} Evaluation
              </Button>
            </div>
          </div>
        </Card>
      )}

    </div>
  );
};
