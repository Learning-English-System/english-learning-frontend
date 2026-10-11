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
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0071e3]/10 text-[#0071e3] text-xs font-semibold mb-3">
          <Award className="w-3.5 h-3.5" />
          <span>Standardized CEFR Diagnostics</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-[#1d1d1f] dark:text-[#f5f5f7]">
          Language Proficiency Assessments
        </h1>
        <p className="text-[14px] text-[#86868b] mt-1">
          Adaptive multi-level assessments measuring grammar, vocabulary depth, and contextual fluency
        </p>
      </div>

      {/* VIEW 1: Test Result Presentation */}
      {result && (
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Card className="p-8 sm:p-10 text-center shadow-apple-lg border border-[#34c759]/20">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#34c759]/10 text-[#34c759] flex items-center justify-center">
              <Award className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-[#1d1d1f] dark:text-[#f5f5f7] mb-1">
              Assessment Completed!
            </h2>
            <p className="text-sm text-[#86868b] mb-6">
              Your responses have been graded according to the CEFR standard.
            </p>

            <div className="max-w-xs mx-auto py-4 mb-6">
              <div className="text-5xl font-black text-[#0071e3] tracking-tight mb-2">
                {result.score !== undefined ? `${Math.round(result.score)}%` : 'Completed'}
              </div>
              <div className="flex items-center justify-center gap-2">
                <Badge variant="blue" size="md">
                  Assessed Level: {result.cefrLevel || selectedLevel}
                </Badge>
              </div>
            </div>

            <Button
              variant="primary"
              onClick={() => {
                setResult(null);
                setActiveSession(null);
              }}
              className="rounded-full px-8 py-2.5"
            >
              Take Another Test
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
          <div className="flex items-center justify-between text-xs font-semibold text-[#86868b] px-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full bg-[#0071e3]/10 text-[#0071e3]">
                Level {activeSession.targetLevel || selectedLevel}
              </span>
              <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
            </div>
            <span>{answeredCount}/{questions.length} answered</span>
          </div>

          {/* Question Card */}
          <Card className="p-8">
            <h3 className="font-serif text-2xl font-normal tracking-tight text-[#121316] dark:text-[#f4f3f0] mb-6 leading-relaxed">
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
                        ? 'border-[#121316] dark:border-[#f4f3f0] bg-black/[0.05] dark:bg-white/[0.07] text-[#121316] dark:text-[#f4f3f0] font-medium shadow-xs'
                        : 'border-black/[0.08] dark:border-white/[0.1] bg-black/[0.02] dark:bg-white/[0.03] text-stone-700 dark:text-stone-300 hover:border-black/20 dark:hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <kbd className="craft-kbd">
                        {String.fromCharCode(65 + idx)}
                      </kbd>
                      <span className="text-sm font-sans">{option}</span>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-[#121316] dark:text-[#f4f3f0]" />}
                  </button>
                );
              })}
            </div>

            {/* Navigator controls */}
            <div className="flex items-center justify-between pt-6 border-t border-black/[0.05] dark:border-white/[0.08]">
              <Button
                variant="secondary"
                disabled={currentQuestionIndex === 0}
                onClick={() => setCurrentQuestionIndex((prev) => prev - 1)}
                className="rounded-full px-5"
              >
                Previous
              </Button>

              {currentQuestionIndex + 1 < questions.length ? (
                <Button
                  variant="primary"
                  onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
                  className="rounded-full px-6"
                >
                  Next
                </Button>
              ) : (
                <Button
                  variant="primary"
                  loading={submitting}
                  onClick={handleSubmit}
                  className="rounded-full px-7 bg-[#34c759] hover:bg-[#30d158]"
                >
                  Submit Assessment
                </Button>
              )}
            </div>
          </Card>
        </motion.div>
      )}

      {/* VIEW 3: Start New Test Configuration */}
      {!result && !activeSession && (
        <Card className="p-8 sm:p-10 shadow-apple-lg">
          <div className="max-w-lg mx-auto text-center space-y-6">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-[#0071e3] to-[#5856d6] flex items-center justify-center text-white shadow-apple-md">
              <FileText className="w-8 h-8" />
            </div>

            <div>
              <h2 className="text-2xl font-bold tracking-tight text-[#1d1d1f] dark:text-[#f5f5f7] mb-2">
                Configure Assessment
              </h2>
              <p className="text-sm text-[#86868b]">
                Choose your target CEFR level and assessment length to begin.
              </p>
            </div>

            <div className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#86868b] mb-2">
                  Select CEFR Target
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].map((lvl) => (
                    <button
                      key={lvl}
                      onClick={() => setSelectedLevel(lvl)}
                      className={`py-2.5 rounded-xl font-bold text-sm border transition-all ${
                        selectedLevel === lvl
                          ? 'border-[#0071e3] bg-[#0071e3] text-white shadow-apple-sm'
                          : 'border-black/[0.08] dark:border-white/[0.1] bg-black/[0.02] dark:bg-white/[0.04] text-[#1d1d1f] dark:text-[#f5f5f7] hover:border-[#0071e3]/50'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#86868b] mb-2">
                  Question Count
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[5, 10, 20].map((cnt) => (
                    <button
                      key={cnt}
                      onClick={() => setSelectedCount(cnt)}
                      className={`py-2 rounded-xl text-sm font-semibold border transition-all ${
                        selectedCount === cnt
                          ? 'border-[#0071e3] bg-[#0071e3] text-white'
                          : 'border-black/[0.08] dark:border-white/[0.1] text-[#1d1d1f] dark:text-[#f5f5f7]'
                      }`}
                    >
                      {cnt} Questions
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
                className="w-full rounded-full font-semibold py-3"
              >
                Start CEFR {selectedLevel} Assessment
              </Button>
            </div>
          </div>
        </Card>
      )}

    </div>
  );
};
