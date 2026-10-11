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
    <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6 space-y-8">
      
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 text-xs font-semibold mb-2">
          <Award className="w-4 h-4" />
          <span>Đánh Giá Năng Lực Chuẩn CEFR</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Bài Kiểm Tra Trình Độ
        </h1>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
          Hệ thống câu hỏi thích ứng đánh giá ngữ pháp, từ vựng và phản xạ ngữ cảnh
        </p>
      </div>

      {/* VIEW 1: Test Result Presentation */}
      {result && (
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Card className="p-8 sm:p-12 text-center border border-emerald-200 dark:border-emerald-800/50 bg-white dark:bg-[#111726] shadow-xl rounded-2xl">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-200 dark:border-emerald-800/50 shadow-sm">
              <Award className="w-8 h-8" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mb-2">
              Hoàn Thành Bài Kiểm Tra!
            </h2>
            <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mb-6">
              Kết quả của bạn đã được đối soát theo chuẩn khung năng lực ngoại ngữ Châu Âu.
            </p>

            {/* Điểm số - To rõ ràng */}
            <div className="max-w-xs mx-auto py-4 mb-6">
              <div className="text-6xl font-black text-indigo-600 dark:text-indigo-400 tracking-tight mb-3">
                {result.score !== undefined ? `${Math.round(result.score)}%` : 'Hoàn thành'}
              </div>
              <div className="flex items-center justify-center gap-2">
                <Badge variant="cyan" size="md" className="font-bold text-sm px-4 py-1.5 rounded-full">
                  Trình độ đạt được: {result.cefrLevel || selectedLevel}
                </Badge>
              </div>
            </div>

            <Button
              variant="primary"
              onClick={() => {
                setResult(null);
                setActiveSession(null);
              }}
              className="rounded-xl px-8 py-3 text-base font-semibold shadow-md"
            >
              Làm bài kiểm tra khác
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
          <div className="flex items-center justify-between text-sm font-semibold text-slate-500 dark:text-slate-400 px-1">
            <div className="flex items-center gap-2.5">
              <span className="px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 font-bold text-xs">
                Cấp độ {activeSession.targetLevel || selectedLevel}
              </span>
              <span>Câu {currentQuestionIndex + 1} / {questions.length}</span>
            </div>
            <span>Đã làm: {answeredCount}/{questions.length} câu</span>
          </div>

          {/* Question Card */}
          <Card className="p-7 sm:p-10 border border-slate-200 dark:border-white/10 bg-white dark:bg-[#111726] shadow-md rounded-2xl">
            {/* Câu hỏi - Chữ to rõ ràng */}
            <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white mb-8 leading-relaxed">
              {activeQuestion.prompt}
            </h3>

            {/* Options - Rộng rãi, dễ chọn */}
            <div className="space-y-3 mb-8">
              {activeQuestion.options.map((option, idx) => {
                const isSelected = answers[activeQuestion.id] === option;
                return (
                  <button
                    key={option}
                    onClick={() => handleSelectOption(activeQuestion.id, option)}
                    className={`w-full text-left p-4 sm:p-5 rounded-xl border-2 transition-all flex items-center justify-between select-none ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/30 text-indigo-900 dark:text-indigo-100 font-bold shadow-sm'
                        : 'border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800/30 text-slate-700 dark:text-slate-200 hover:border-slate-300 dark:hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${
                        isSelected 
                          ? 'bg-indigo-600 text-white' 
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                      }`}>
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span className="text-base sm:text-lg font-medium">{option}</span>
                    </div>
                    {isSelected && <Check className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0" />}
                  </button>
                );
              })}
            </div>

            {/* Navigator controls */}
            <div className="flex items-center justify-between pt-6 border-t border-slate-100 dark:border-white/5">
              <Button
                variant="secondary"
                disabled={currentQuestionIndex === 0}
                onClick={() => setCurrentQuestionIndex((prev) => prev - 1)}
                className="rounded-xl px-5 text-sm font-semibold"
              >
                Câu trước
              </Button>

              {currentQuestionIndex + 1 < questions.length ? (
                <Button
                  variant="primary"
                  onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
                  className="rounded-xl px-6 text-sm font-semibold shadow-sm"
                >
                  Câu tiếp theo
                </Button>
              ) : (
                <Button
                  variant="primary"
                  loading={submitting}
                  onClick={handleSubmit}
                  className="rounded-xl px-7 text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 shadow-md text-white"
                >
                  Nộp bài thi
                </Button>
              )}
            </div>
          </Card>
        </motion.div>
      )}

      {/* VIEW 3: Start New Test Configuration */}
      {!result && !activeSession && (
        <Card className="p-8 sm:p-10 border border-slate-200 dark:border-white/10 bg-white dark:bg-[#111726] shadow-lg rounded-2xl">
          <div className="max-w-lg mx-auto text-center space-y-6">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-200 dark:border-indigo-800/50 shadow-sm">
              <FileText className="w-8 h-8" />
            </div>

            <div>
              <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-1.5">
                Cấu Hình Bài Kiểm Tra
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Lựa chọn trình độ mục tiêu và số lượng câu hỏi để bắt đầu
              </p>
            </div>

            <div className="space-y-5 text-left">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
                  Chọn Trình Độ CEFR
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
                  {['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].map((lvl) => (
                    <button
                      key={lvl}
                      onClick={() => setSelectedLevel(lvl)}
                      className={`py-3 rounded-xl font-extrabold text-base border-2 transition-all ${
                        selectedLevel === lvl
                          ? 'border-indigo-600 bg-indigo-600 text-white shadow-sm'
                          : 'border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
                  Số Lượng Câu Hỏi
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[5, 10, 20].map((cnt) => (
                    <button
                      key={cnt}
                      onClick={() => setSelectedCount(cnt)}
                      className={`py-3 rounded-xl text-sm font-bold border-2 transition-all ${
                        selectedCount === cnt
                          ? 'border-indigo-600 bg-indigo-600 text-white shadow-sm'
                          : 'border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                      }`}
                    >
                      {cnt} câu hỏi
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-3">
              <Button
                variant="primary"
                size="lg"
                loading={starting}
                onClick={handleStart}
                className="w-full rounded-xl font-bold text-base py-3.5 shadow-md"
              >
                Bắt đầu làm bài kiểm tra {selectedLevel}
              </Button>
            </div>
          </div>
        </Card>
      )}

    </div>
  );
};
