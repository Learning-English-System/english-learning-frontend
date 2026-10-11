import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthProvider, useAuth } from './context/AuthContext';
import {
  api,
  type VocabularyItem,
  type LearningProgress,
  type Category,
  type UserSession,
  type CreateVocabularyRequest,
} from './services/api';

import { NavigationBar, type NavTab } from './components/layout/NavigationBar';
import { CinematicAtmosphere } from './components/layout/CinematicAtmosphere';
import { AuthModal } from './components/auth/AuthModal';
import { FlashcardReview } from './components/review/FlashcardReview';
import { VocabularyExplorer } from './components/vocabulary/VocabularyExplorer';
import { AiTutor } from './components/ai/AiTutor';
import { TestAssessment } from './components/test/TestAssessment';
import { ProfileDashboard } from './components/profile/ProfileDashboard';
import { sounds } from './lib/sound';

import type { Variants } from 'framer-motion';

// Apple Keynote Cinematic Camera Depth Transition
const cinematicTransition: Variants = {
  initial: { opacity: 0, scale: 0.97, filter: 'blur(10px)' },
  animate: { 
    opacity: 1, 
    scale: 1, 
    filter: 'blur(0px)', 
    transition: { duration: 0.45, ease: 'easeOut' } 
  },
  exit: { 
    opacity: 0, 
    scale: 1.02, 
    filter: 'blur(12px)', 
    transition: { duration: 0.25, ease: 'easeIn' } 
  },
};

const AppContent: React.FC = () => {
  const { isAuthenticated, profile, logout, refreshProfile, loading: authLoading } = useAuth();
  
  // Theme state: defaults to dark or system preference
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme) return savedTheme === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  const [activeTab, setActiveTab] = useState<NavTab>('review');

  // Application Data States
  const [progress, setProgress] = useState<LearningProgress | null>(null);
  const [dueReviews, setDueReviews] = useState<VocabularyItem[]>([]);
  const [vocabList, setVocabList] = useState<VocabularyItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [dataLoading, setDataLoading] = useState<boolean>(false);

  // Sync dark class on document root
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  // Load user data when authenticated
  const loadData = useCallback(async () => {
    if (!isAuthenticated) return;
    setDataLoading(true);
    try {
      const [progData, dueData, listData, catData, sessData] = await Promise.allSettled([
        api.getProgress(),
        api.getDueReviews(30),
        api.getVocabularyList(),
        api.getCategories(),
        api.getSessions(),
      ]);

      if (progData.status === 'fulfilled') setProgress(progData.value);
      if (dueData.status === 'fulfilled') setDueReviews(dueData.value);
      if (listData.status === 'fulfilled') setVocabList(listData.value);
      if (catData.status === 'fulfilled') setCategories(catData.value);
      if (sessData.status === 'fulfilled') setSessions(sessData.value);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setDataLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated, loadData]);

  // Tab switch with Apple tactile audio click
  const handleTabChange = (tab: NavTab) => {
    sounds.playClick(1100);
    setActiveTab(tab);
  };

  // Handle Review submission
  const handleReviewRating = async (vocabularyId: string, quality: number) => {
    sounds.playClick(900);
    await api.submitReview(vocabularyId, quality);
    const [updatedDue, updatedProg] = await Promise.allSettled([
      api.getDueReviews(30),
      api.getProgress(),
    ]);
    if (updatedDue.status === 'fulfilled') setDueReviews(updatedDue.value);
    if (updatedProg.status === 'fulfilled') setProgress(updatedProg.value);
  };

  // Handle Add word
  const handleAddWord = async (wordData: CreateVocabularyRequest) => {
    sounds.playSuccess();
    await api.createVocabulary(wordData);
    await loadData();
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[var(--color-canvas)] text-[var(--color-ink)] flex flex-col items-center justify-center relative overflow-hidden">
        <CinematicAtmosphere activeTab="review" isDark={isDark} />
        <div className="w-9 h-9 border-3 border-indigo-200 dark:border-indigo-900 border-t-indigo-600 rounded-full animate-spin z-10" />
        <span className="mt-4 text-xs font-semibold tracking-wider text-slate-500 z-10">
          Đang khởi tạo hệ thống...
        </span>
      </div>
    );
  }

  // If not authenticated, render Clean Minimalist Landing Page
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[var(--color-canvas)] text-[var(--color-ink)] flex flex-col justify-center items-center p-4 relative overflow-hidden transition-colors duration-200">
        <CinematicAtmosphere activeTab="ai" isDark={isDark} />

        {/* Landing Hero Headline */}
        <div className="text-center max-w-xl mx-auto mb-8 z-10 pt-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/80 dark:border-indigo-800/40 text-xs font-bold text-indigo-700 dark:text-indigo-400 mb-4 select-none shadow-sm">
            <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
            <span>Nền tảng học tiếng Anh thông minh</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white mb-3.5 leading-tight">
            Ghi nhớ từ vựng tự nhiên. <br className="hidden sm:inline" />Nhớ sâu và bền vững.
          </h1>
          <p className="text-sm sm:text-base font-medium text-slate-600 dark:text-slate-300 leading-relaxed max-w-lg mx-auto">
            Kết hợp phương pháp lặp lại ngắt quãng SuperMemo-2, trí tuệ nhân tạo phản xạ phát âm và bài thi chuẩn CEFR.
          </p>
        </div>

        {/* Auth Card */}
        <div className="w-full max-w-md z-10">
          <AuthModal />
        </div>

        <p className="mt-8 text-xs font-medium text-slate-400 dark:text-slate-500 text-center z-10">
          Synapse English • Tối giản • Hiệu quả • Chuẩn khoa học trí nhớ
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-canvas)] text-[var(--color-ink)] flex flex-col relative overflow-x-hidden transition-colors duration-200">
      {/* Background Atmosphere */}
      <CinematicAtmosphere activeTab={activeTab} isDark={isDark} />

      {/* Subtle sync loading line */}
      {dataLoading && (
        <div className="fixed top-0 left-0 right-0 h-[2px] bg-indigo-600 z-[60]" />
      )}

      {/* Top Glass Navigation Bar */}
      <NavigationBar
        activeTab={activeTab}
        onTabChange={handleTabChange}
        profile={profile}
        dueReviewsCount={dueReviews.length}
        streakDays={7}
        onLogout={logout}
        isDark={isDark}
        onToggleTheme={() => {
          sounds.playClick(1400);
          setIsDark((prev) => !prev);
        }}
      />

      {/* Main Content Area with Cinematic Camera Depth Transitions */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <AnimatePresence mode="wait">
          {activeTab === 'review' && (
            <motion.div
              key="tab-review"
              variants={cinematicTransition}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <FlashcardReview
                dueReviews={dueReviews}
                onSubmitRating={handleReviewRating}
                onRefreshQueue={loadData}
              />
            </motion.div>
          )}

          {activeTab === 'vocab' && (
            <motion.div
              key="tab-vocab"
              variants={cinematicTransition}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <VocabularyExplorer
                vocabularyList={vocabList}
                categories={categories}
                onAddWord={handleAddWord}
                onRefreshList={loadData}
              />
            </motion.div>
          )}

          {activeTab === 'ai' && (
            <motion.div
              key="tab-ai"
              variants={cinematicTransition}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <AiTutor
                onAnalyzeWord={(word) => api.analyzeVocabulary(word)}
                onAssessPronunciation={(text, audioBase64) =>
                  api.assessPronunciation(text, audioBase64)
                }
                onSaveToVocab={handleAddWord}
              />
            </motion.div>
          )}

          {activeTab === 'test' && (
            <motion.div
              key="tab-test"
              variants={cinematicTransition}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <TestAssessment
                currentTest={null}
                onStartTest={async (_level, count) => {
                  return await api.createTestSession(count);
                }}
                onSubmitTest={async (testId, answers) => {
                  const formatted = Object.entries(answers).map(
                    ([questionId, selectedAnswer]) => ({
                      questionId,
                      selectedAnswer,
                    })
                  );
                  return await api.submitTest(testId, formatted);
                }}
              />
            </motion.div>
          )}

          {activeTab === 'profile' && (
            <motion.div
              key="tab-profile"
              variants={cinematicTransition}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <ProfileDashboard
                profile={profile}
                progress={progress}
                sessions={sessions}
                onUpdateProfile={async (data) => {
                  sounds.playSuccess();
                  await api.updateProfile(data);
                  await refreshProfile();
                }}
                onRevokeSession={async (sessionId) => {
                  sounds.playClick(600);
                  await api.revokeSession(sessionId);
                  const sess = await api.getSessions();
                  setSessions(sess);
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
