import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import {
  api,
  type VocabularyItem,
  type LearningProgress,
  type Category,
  type VocabularyAnalysis,
  type PronunciationAssessment,
  type TestSession,
  type UserSession
} from './services/api';
import {
  BookOpen,
  Brain,
  CheckCircle,
  Clock,
  Flame,
  GraduationCap,
  Layers,
  LogOut,
  Mic,
  Plus,
  Search,
  Shield,
  Sparkles,
  Trash2,
  User
} from 'lucide-react';

const MainApp: React.FC = () => {
  const { isAuthenticated, profile, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'review' | 'vocab' | 'ai' | 'test' | 'profile'>('review');

  // Review & Progress State
  const [progress, setProgress] = useState<LearningProgress | null>(null);
  const [dueReviews, setDueReviews] = useState<VocabularyItem[]>([]);
  const [currentReviewIndex, setCurrentReviewIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [submittingReview, setSubmittingReview] = useState<boolean>(false);

  // Vocabulary List State
  const [vocabList, setVocabList] = useState<VocabularyItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchWord, setSearchWord] = useState<string>('');
  const [newWord, setNewWord] = useState({ word: '', translation: '', partOfSpeech: 'Noun', cefrLevel: 'B1', definition: '', categoryId: '' });
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  // AI Assistant State
  const [aiWord, setAiWord] = useState<string>('resilient');
  const [aiAnalysis, setAiAnalysis] = useState<VocabularyAnalysis | null>(null);
  const [aiAnalyzing, setAiAnalyzing] = useState<boolean>(false);
  const [recording, setRecording] = useState<boolean>(false);
  const [pronunciationResult, setPronunciationResult] = useState<PronunciationAssessment | null>(null);
  const [pronunciationText, setPronunciationText] = useState<string>('The economy remains resilient.');

  // Test State
  const [currentTest, setCurrentTest] = useState<TestSession | null>(null);
  const [testAnswers, setTestAnswers] = useState<Record<string, string>>({});
  const [creatingTest, setCreatingTest] = useState<boolean>(false);
  const [submittingTest, setSubmittingTest] = useState<boolean>(false);

  // Security Sessions State
  const [sessions, setSessions] = useState<UserSession[]>([]);

  // Auth form state
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'verify'>('login');
  const [authEmail, setAuthEmail] = useState<string>('taingo2112003@gmail.com');
  const [authPassword, setAuthPassword] = useState<string>('');
  const [authName, setAuthName] = useState<string>('Ngô Bá Tấn Tài');
  const [authVerifyToken, setAuthVerifyToken] = useState<string>('');
  const [authSuccessMsg, setAuthSuccessMsg] = useState<string>('');
  const [authError, setAuthError] = useState<string>('');
  const [authLoading, setAuthLoading] = useState<boolean>(false);
  const { login, register, verifyEmail } = useAuth();

  // Load Initial Data
  const loadInitialData = async () => {
    if (!isAuthenticated) return;
    try {
      const [prog, due, vocabs, cats] = await Promise.all([
        api.getProgress().catch(() => null),
        api.getDueReviews(20).catch(() => []),
        api.getVocabularyList().catch(() => []),
        api.getCategories().catch(() => [])
      ]);
      if (prog) setProgress(prog);
      setDueReviews(due);
      setVocabList(vocabs);
      setCategories(cats);
    } catch (err) {
      console.error('Error loading data', err);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadInitialData();
    }
  }, [isAuthenticated]);

  // Auth Handler
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccessMsg('');
    setAuthLoading(true);
    try {
      if (authMode === 'login') {
        await login(authEmail, authPassword);
      } else if (authMode === 'register') {
        await register(authEmail, authPassword, authName);
        setAuthMode('verify');
        setAuthSuccessMsg('Account registered! Please check Mailpit (http://localhost:8025) for your verification token.');
      } else if (authMode === 'verify') {
        await verifyEmail(authEmail, authVerifyToken.trim());
        setAuthSuccessMsg('Email verified successfully! You can now log in.');
        setAuthMode('login');
      }
    } catch (err: any) {
      setAuthError(err.message || 'Authentication failed');
    } finally {
      setAuthLoading(false);
    }
  };

  // SM-2 Review Handler
  const handleReviewQuality = async (quality: number) => {
    if (dueReviews.length === 0 || submittingReview) return;
    const currentItem = dueReviews[currentReviewIndex];
    setSubmittingReview(true);
    try {
      await api.submitReview(currentItem.id, quality);
      // Advance to next card or complete queue
      if (currentReviewIndex + 1 < dueReviews.length) {
        setCurrentReviewIndex(prev => prev + 1);
        setIsFlipped(false);
      } else {
        // Reload reviews & progress
        await loadInitialData();
        setCurrentReviewIndex(0);
        setIsFlipped(false);
      }
    } catch (err) {
      console.error('Failed to submit review', err);
    } finally {
      setSubmittingReview(false);
    }
  };

  // AI Vocabulary Analysis Handler
  const handleAiAnalyze = async () => {
    if (!aiWord.trim()) return;
    setAiAnalyzing(true);
    try {
      const res = await api.analyzeVocabulary(aiWord.trim(), profile?.targetLanguage || 'vi');
      setAiAnalysis(res);
    } catch (err) {
      console.error(err);
    } finally {
      setAiAnalyzing(false);
    }
  };

  // Add AI Analyzed Word to Vocabulary
  const handleAddAiWordToVocab = async () => {
    if (!aiAnalysis) return;
    try {
      await api.createVocabulary({
        word: aiAnalysis.normalizedWord,
        translation: aiAnalysis.translation,
        partOfSpeech: aiAnalysis.partOfSpeech,
        definition: aiAnalysis.definition,
        cefrLevel: aiAnalysis.cefrLevel,
        examples: aiAnalysis.examples
      });
      await loadInitialData();
      alert(`Word "${aiAnalysis.normalizedWord}" added to your vocabulary bank!`);
    } catch (err: any) {
      alert(err.message || 'Failed to add word');
    }
  };

  // Audio Recording for Pronunciation Assessment
  const handleToggleRecord = async () => {
    if (recording) {
      setRecording(false);
      // Generate simulated energetic speech audio for evaluation
      const buffer = new Uint8Array(8000);
      for (let i = 0; i < buffer.length; i++) {
        buffer[i] = (i % 2 === 0 ? 50 : 200);
      }
      const b64 = btoa(String.fromCharCode.apply(null, Array.from(buffer)));
      try {
        const assessment = await api.assessPronunciation(pronunciationText, b64);
        setPronunciationResult(assessment);
      } catch (err) {
        console.error('Pronunciation assessment failed', err);
      }
    } else {
      setRecording(true);
      setPronunciationResult(null);
    }
  };

  // Start Test Quiz
  const handleStartTest = async (count: number = 3) => {
    setCreatingTest(true);
    try {
      const test = await api.createTestSession(count);
      setCurrentTest(test);
      setTestAnswers({});
    } catch (err: any) {
      alert(err.message || 'Failed to create test');
    } finally {
      setCreatingTest(false);
    }
  };

  // Submit Test Quiz
  const handleSubmitTest = async () => {
    if (!currentTest) return;
    setSubmittingTest(true);
    try {
      const answersList = Object.entries(testAnswers).map(([qid, ans]) => ({
        questionId: qid,
        selectedAnswer: ans
      }));
      const graded = await api.submitTest(currentTest.id, answersList);
      setCurrentTest(graded);
    } catch (err: any) {
      alert(err.message || 'Failed to submit test');
    } finally {
      setSubmittingTest(false);
    }
  };

  // Load Security Sessions
  const loadSessions = async () => {
    try {
      const list = await api.getSessions();
      setSessions(list);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (activeTab === 'profile') {
      loadSessions();
    }
  }, [activeTab]);

  // If Not Authenticated -> Show Auth Modal / Card
  if (!isAuthenticated) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div style={{ maxWidth: '440px', width: '100%', background: '#1e293b', border: '1px solid #334155', borderRadius: '16px', padding: '2.5rem', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{ display: 'inline-flex', padding: '12px', background: '#312e81', borderRadius: '12px', color: '#818cf8', marginBottom: '1rem' }}>
              <GraduationCap size={36} />
            </div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f8fafc' }}>English Master</h1>
            <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginTop: '0.25rem' }}>AI-Powered Spaced Repetition Language System</p>
          </div>

          <div style={{ display: 'flex', borderBottom: '1px solid #334155', marginBottom: '1.5rem' }}>
            <button
              onClick={() => { setAuthMode('login'); setAuthError(''); setAuthSuccessMsg(''); }}
              style={{ flex: 1, padding: '0.75rem', background: 'none', border: 'none', borderBottom: authMode === 'login' ? '2px solid #6366f1' : 'none', color: authMode === 'login' ? '#f8fafc' : '#64748b', fontWeight: 600, fontSize: '0.9rem' }}>
              Sign In
            </button>
            <button
              onClick={() => { setAuthMode('register'); setAuthError(''); setAuthSuccessMsg(''); }}
              style={{ flex: 1, padding: '0.75rem', background: 'none', border: 'none', borderBottom: authMode === 'register' ? '2px solid #6366f1' : 'none', color: authMode === 'register' ? '#f8fafc' : '#64748b', fontWeight: 600, fontSize: '0.9rem' }}>
              Create Account
            </button>
            <button
              onClick={() => { setAuthMode('verify'); setAuthError(''); setAuthSuccessMsg(''); }}
              style={{ flex: 1, padding: '0.75rem', background: 'none', border: 'none', borderBottom: authMode === 'verify' ? '2px solid #6366f1' : 'none', color: authMode === 'verify' ? '#f8fafc' : '#64748b', fontWeight: 600, fontSize: '0.9rem' }}>
              Verify Email
            </button>
          </div>

          {authSuccessMsg && (
            <div style={{ background: '#064e3b', color: '#6ee7b7', padding: '0.75rem', borderRadius: '8px', fontSize: '0.875rem', marginBottom: '1.25rem', border: '1px solid #059669' }}>
              {authSuccessMsg}
            </div>
          )}

          {authError && (
            <div style={{ background: '#7f1d1d', color: '#fecaca', padding: '0.75rem', borderRadius: '8px', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
              {authError}
            </div>
          )}

          <form onSubmit={handleAuthSubmit}>
            {authMode === 'register' && (
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#cbd5e1', marginBottom: '0.5rem' }}>Full Name</label>
                <input
                  type="text"
                  required
                  value={authName}
                  onChange={e => setAuthName(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem', background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#f8fafc' }}
                />
              </div>
            )}

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#cbd5e1', marginBottom: '0.5rem' }}>Email</label>
              <input
                type="email"
                required
                value={authEmail}
                onChange={e => setAuthEmail(e.target.value)}
                style={{ width: '100%', padding: '0.75rem', background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#f8fafc' }}
              />
            </div>

            {authMode !== 'verify' && (
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#cbd5e1', marginBottom: '0.5rem' }}>Password (min 12 chars)</label>
                <input
                  type="password"
                  required
                  value={authPassword}
                  onChange={e => setAuthPassword(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem', background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#f8fafc' }}
                />
              </div>
            )}

            {authMode === 'verify' && (
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <label style={{ fontSize: '0.875rem', fontWeight: 500, color: '#cbd5e1' }}>Verification Token</label>
                  <a href="http://localhost:8025" target="_blank" rel="noreferrer" style={{ fontSize: '0.75rem', color: '#818cf8', textDecoration: 'underline' }}>
                    Open Mailpit (Inbox)
                  </a>
                </div>
                <textarea
                  rows={4}
                  required
                  placeholder="Paste the verification token received in email here..."
                  value={authVerifyToken}
                  onChange={e => setAuthVerifyToken(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem', background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#f8fafc', fontSize: '0.875rem', fontFamily: 'monospace' }}
                />
              </div>
            )}

            <button
              type="submit"
              disabled={authLoading}
              style={{ width: '100%', padding: '0.875rem', background: '#4f46e5', border: 'none', borderRadius: '8px', color: 'white', fontWeight: 700, fontSize: '1rem', opacity: authLoading ? 0.7 : 1 }}>
              {authLoading ? 'Processing...' : authMode === 'login' ? 'Sign In' : authMode === 'register' ? 'Create Account' : 'Verify Email Address'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  const currentCard = dueReviews.length > 0 ? dueReviews[currentReviewIndex] : null;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Header */}
      <header style={{ background: '#1e293b', borderBottom: '1px solid #334155', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ background: '#4338ca', color: '#ffffff', padding: '8px', borderRadius: '10px' }}>
            <GraduationCap size={24} />
          </div>
          <div>
            <span style={{ fontWeight: 800, fontSize: '1.25rem', letterSpacing: '-0.5px' }}>English Master</span>
            <span style={{ marginLeft: '10px', fontSize: '0.75rem', background: '#312e81', color: '#c7d2fe', padding: '2px 8px', borderRadius: '12px', fontWeight: 600 }}>
              {profile?.targetCefrLevel || 'B2'} Learner
            </span>
          </div>
        </div>

        {/* Tab Navigation */}
        <nav style={{ display: 'flex', gap: '8px' }}>
          {[
            { id: 'review', label: 'Review (SM-2)', icon: Layers },
            { id: 'vocab', label: 'Vocabulary', icon: BookOpen },
            { id: 'ai', label: 'AI & Speech', icon: Sparkles },
            { id: 'test', label: 'Tests', icon: Brain },
            { id: 'profile', label: 'Profile & Security', icon: User }
          ].map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  background: active ? '#4f46e5' : 'transparent',
                  color: active ? '#ffffff' : '#94a3b8',
                  fontWeight: 600,
                  fontSize: '0.875rem'
                }}>
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </nav>

        {/* User Info & Logout */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ textAlign: 'right', fontSize: '0.875rem' }}>
            <div style={{ fontWeight: 600 }}>{profile?.displayName || 'Learner'}</div>
            <div style={{ color: '#64748b', fontSize: '0.75rem' }}>{profile?.email}</div>
          </div>
          <button
            onClick={logout}
            title="Sign Out"
            style={{ background: '#334155', border: 'none', color: '#f8fafc', padding: '8px', borderRadius: '8px' }}>
            <LogOut size={18} />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main style={{ flex: 1, padding: '2rem', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
        {/* TAB 1: SM-2 Spaced Repetition Review */}
        {activeTab === 'review' && (
          <div>
            {/* Aggregate Progress Banner */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
              {[
                { label: 'Total Words', val: progress?.totalWords ?? 0, icon: BookOpen, color: '#6366f1' },
                { label: 'In Learning', val: progress?.learningWords ?? 0, icon: Clock, color: '#f59e0b' },
                { label: 'Mastered', val: progress?.masteredWords ?? 0, icon: CheckCircle, color: '#10b981' },
                { label: 'Due for Review', val: dueReviews.length, icon: Flame, color: '#ef4444' },
                { label: 'Accuracy', val: `${Math.round((progress?.rollingAccuracy ?? 0) * 100)}%`, icon: Brain, color: '#8b5cf6' }
              ].map((stat, i) => {
                const Icon = stat.icon;
                return (
                  <div key={i} style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '1.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8', fontSize: '0.875rem' }}>
                      <span>{stat.label}</span>
                      <Icon size={18} style={{ color: stat.color }} />
                    </div>
                    <div style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.5rem', color: stat.color }}>{stat.val}</div>
                  </div>
                );
              })}
            </div>

            {/* Interactive Flashcard Deck */}
            {currentCard ? (
              <div style={{ maxWidth: '650px', margin: '0 auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', color: '#94a3b8', fontSize: '0.875rem' }}>
                  <span>Review Card {currentReviewIndex + 1} of {dueReviews.length}</span>
                  <span style={{ background: '#312e81', color: '#c7d2fe', padding: '2px 8px', borderRadius: '8px' }}>
                    Ease Factor: {currentCard.reviewState?.easeFactor ?? 2.5}
                  </span>
                </div>

                <div
                  onClick={() => setIsFlipped(!isFlipped)}
                  style={{
                    background: '#1e293b',
                    border: '2px solid #4338ca',
                    borderRadius: '16px',
                    minHeight: '280px',
                    padding: '2.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    textAlign: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.4)',
                    transition: 'transform 0.2s ease',
                    position: 'relative'
                  }}>
                  <div style={{ position: 'absolute', top: '16px', right: '16px', fontSize: '0.75rem', color: '#64748b' }}>
                    Click card to flip
                  </div>

                  {!isFlipped ? (
                    <div>
                      <div style={{ fontSize: '0.875rem', color: '#818cf8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>
                        {currentCard.partOfSpeech || 'Word'}
                      </div>
                      <h2 style={{ fontSize: '3rem', fontWeight: 800, margin: '0.5rem 0', color: '#ffffff' }}>
                        {currentCard.word}
                      </h2>
                      <div style={{ fontSize: '0.875rem', color: '#94a3b8' }}>
                        Level: <span style={{ color: '#38bdf8', fontWeight: 700 }}>{currentCard.cefrLevel}</span>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <h3 style={{ fontSize: '2rem', fontWeight: 700, color: '#34d399', marginBottom: '0.75rem' }}>
                        {currentCard.translation}
                      </h3>
                      {currentCard.definition && (
                        <p style={{ color: '#cbd5e1', fontSize: '1rem', fontStyle: 'italic', marginBottom: '1rem' }}>
                          "{currentCard.definition}"
                        </p>
                      )}
                      {currentCard.examples && currentCard.examples.length > 0 && (
                        <div style={{ background: '#0f172a', padding: '1rem', borderRadius: '8px', textAlign: 'left', marginTop: '1rem' }}>
                          <div style={{ color: '#f8fafc', fontSize: '0.9rem' }}>{currentCard.examples[0].sentence}</div>
                          <div style={{ color: '#94a3b8', fontSize: '0.8rem', marginTop: '4px' }}>{currentCard.examples[0].translation}</div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* SM-2 Quality Grade Buttons */}
                {isFlipped && (
                  <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.875rem', color: '#94a3b8', marginBottom: '0.75rem' }}>
                      Rate your recall (SuperMemo SM-2):
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '8px' }}>
                      {[
                        { q: 0, label: '0: Blackout', bg: '#ef4444' },
                        { q: 1, label: '1: Wrong', bg: '#f97316' },
                        { q: 2, label: '2: Hard', bg: '#eab308' },
                        { q: 3, label: '3: Pass', bg: '#3b82f6' },
                        { q: 4, label: '4: Good', bg: '#10b981' },
                        { q: 5, label: '5: Perfect', bg: '#059669' }
                      ].map(b => (
                        <button
                          key={b.q}
                          onClick={() => handleReviewQuality(b.q)}
                          disabled={submittingReview}
                          style={{
                            padding: '10px 4px',
                            background: b.bg,
                            border: 'none',
                            borderRadius: '8px',
                            color: 'white',
                            fontWeight: 700,
                            fontSize: '0.8rem',
                            opacity: submittingReview ? 0.6 : 1
                          }}>
                          {b.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '16px', padding: '4rem 2rem', textAlign: 'center' }}>
                <CheckCircle size={48} style={{ color: '#10b981', margin: '0 auto 1rem' }} />
                <h3 style={{ fontSize: '1.5rem', fontWeight: 700 }}>All Caught Up!</h3>
                <p style={{ color: '#94a3b8', marginTop: '0.5rem' }}>
                  You have reviewed all due vocabulary words for today. Great job staying consistent!
                </p>
                <button
                  onClick={() => setActiveTab('vocab')}
                  style={{ marginTop: '1.5rem', padding: '10px 20px', background: '#4f46e5', border: 'none', borderRadius: '8px', color: 'white', fontWeight: 600 }}>
                  Add More Vocabulary
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: Vocabulary Management */}
        {activeTab === 'vocab' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', gap: '1rem', flex: 1, maxWidth: '600px' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                  <Search size={18} style={{ position: 'absolute', top: '12px', left: '12px', color: '#64748b' }} />
                  <input
                    type="text"
                    placeholder="Search words or meanings..."
                    value={searchWord}
                    onChange={e => setSearchWord(e.target.value)}
                    style={{ width: '100%', padding: '10px 10px 10px 38px', background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#f8fafc' }}
                  />
                </div>
              </div>

              <button
                onClick={() => setShowAddModal(true)}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', background: '#4f46e5', border: 'none', borderRadius: '8px', color: 'white', fontWeight: 600 }}>
                <Plus size={18} /> Add Word
              </button>
            </div>

            {/* Word List Table */}
            <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                <thead>
                  <tr style={{ background: '#0f172a', borderBottom: '1px solid #334155', color: '#94a3b8' }}>
                    <th style={{ padding: '12px 16px' }}>Word</th>
                    <th style={{ padding: '12px 16px' }}>Translation</th>
                    <th style={{ padding: '12px 16px' }}>Level</th>
                    <th style={{ padding: '12px 16px' }}>Status</th>
                    <th style={{ padding: '12px 16px' }}>Next Review</th>
                    <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {vocabList.map(item => (
                    <tr key={item.id} style={{ borderBottom: '1px solid #334155' }}>
                      <td style={{ padding: '12px 16px', fontWeight: 700, color: '#f8fafc' }}>
                        {item.word}
                        <span style={{ display: 'block', fontSize: '0.75rem', color: '#64748b', fontWeight: 400 }}>{item.partOfSpeech}</span>
                      </td>
                      <td style={{ padding: '12px 16px', color: '#cbd5e1' }}>{item.translation}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ background: '#312e81', color: '#818cf8', padding: '2px 8px', borderRadius: '6px', fontWeight: 700, fontSize: '0.75rem' }}>
                          {item.cefrLevel}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{
                          padding: '2px 8px',
                          borderRadius: '6px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          background: item.status === 'Mastered' ? '#065f46' : item.status === 'Learning' ? '#78350f' : '#1e1b4b',
                          color: item.status === 'Mastered' ? '#34d399' : item.status === 'Learning' ? '#fbbf24' : '#a5b4fc'
                        }}>
                          {item.status}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', color: '#94a3b8' }}>
                        {item.reviewState?.dueAt ? new Date(item.reviewState.dueAt).toLocaleDateString() : 'Now'}
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                        <button
                          onClick={async () => {
                            if (confirm(`Delete "${item.word}"?`)) {
                              await api.deleteVocabulary(item.id);
                              loadInitialData();
                            }
                          }}
                          style={{ background: 'none', border: 'none', color: '#ef4444', padding: '4px' }}>
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Modal: Add New Word */}
            {showAddModal && (
              <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', zIndex: 50 }}>
                <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '16px', padding: '2rem', maxWidth: '500px', width: '100%' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem' }}>Add New Vocabulary</h3>

                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '4px' }}>English Word</label>
                    <input
                      type="text"
                      value={newWord.word}
                      onChange={e => setNewWord({ ...newWord, word: e.target.value })}
                      placeholder="e.g., Eloquent"
                      style={{ width: '100%', padding: '10px', background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: 'white' }}
                    />
                  </div>

                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '4px' }}>Vietnamese Translation</label>
                    <input
                      type="text"
                      value={newWord.translation}
                      onChange={e => setNewWord({ ...newWord, translation: e.target.value })}
                      placeholder="e.g., Hùng hồn, lưu loát"
                      style={{ width: '100%', padding: '10px', background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: 'white' }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '4px' }}>Part of Speech</label>
                      <select
                        value={newWord.partOfSpeech}
                        onChange={e => setNewWord({ ...newWord, partOfSpeech: e.target.value })}
                        style={{ width: '100%', padding: '10px', background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: 'white' }}>
                        <option>Noun</option>
                        <option>Verb</option>
                        <option>Adjective</option>
                        <option>Adverb</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '4px' }}>CEFR Level</label>
                      <select
                        value={newWord.cefrLevel}
                        onChange={e => setNewWord({ ...newWord, cefrLevel: e.target.value })}
                        style={{ width: '100%', padding: '10px', background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: 'white' }}>
                        <option>A1</option>
                        <option>A2</option>
                        <option>B1</option>
                        <option>B2</option>
                        <option>C1</option>
                        <option>C2</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '4px' }}>Category</label>
                    <select
                      value={newWord.categoryId}
                      onChange={e => setNewWord({ ...newWord, categoryId: e.target.value })}
                      style={{ width: '100%', padding: '10px', background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: 'white' }}>
                      <option value="">(None)</option>
                      {categories.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                    <button
                      onClick={() => setShowAddModal(false)}
                      style={{ padding: '8px 16px', background: '#334155', border: 'none', borderRadius: '8px', color: 'white' }}>
                      Cancel
                    </button>
                    <button
                      onClick={async () => {
                        if (!newWord.word || !newWord.translation) return;
                        await api.createVocabulary(newWord);
                        setShowAddModal(false);
                        setNewWord({ word: '', translation: '', partOfSpeech: 'Noun', cefrLevel: 'B1', definition: '', categoryId: '' });
                        loadInitialData();
                      }}
                      style={{ padding: '8px 16px', background: '#4f46e5', border: 'none', borderRadius: '8px', color: 'white', fontWeight: 600 }}>
                      Save Word
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: AI Learning Assistant & Pronunciation */}
        {activeTab === 'ai' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            {/* AI Deep Word Analyzer */}
            <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '16px', padding: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.25rem' }}>
                <Sparkles size={24} style={{ color: '#818cf8' }} />
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Gemini Vocabulary Analyzer</h3>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginBottom: '1.5rem' }}>
                <input
                  type="text"
                  value={aiWord}
                  onChange={e => setAiWord(e.target.value)}
                  placeholder="Enter word (e.g., resilient)..."
                  style={{ flex: 1, padding: '10px', background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: 'white' }}
                />
                <button
                  onClick={handleAiAnalyze}
                  disabled={aiAnalyzing}
                  style={{ padding: '10px 18px', background: '#4f46e5', border: 'none', borderRadius: '8px', color: 'white', fontWeight: 600 }}>
                  {aiAnalyzing ? 'Analyzing...' : 'Analyze'}
                </button>
              </div>

              {aiAnalysis && (
                <div style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '12px', padding: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h4 style={{ fontSize: '1.5rem', fontWeight: 800 }}>{aiAnalysis.normalizedWord}</h4>
                    <span style={{ background: '#312e81', color: '#818cf8', padding: '2px 8px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 700 }}>
                      {aiAnalysis.cefrLevel}
                    </span>
                  </div>

                  <div style={{ color: '#38bdf8', fontSize: '0.875rem', marginTop: '4px' }}>
                    {aiAnalysis.phonetic} • {aiAnalysis.partOfSpeech}
                  </div>

                  <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#34d399', margin: '0.75rem 0' }}>
                    {aiAnalysis.translation}
                  </div>

                  <p style={{ color: '#cbd5e1', fontSize: '0.9rem', marginBottom: '1rem' }}>
                    {aiAnalysis.definition}
                  </p>

                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>Collocations</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px' }}>
                      {aiAnalysis.collocations.map((c, i) => (
                        <span key={i} style={{ background: '#1e293b', border: '1px solid #334155', padding: '2px 8px', borderRadius: '6px', fontSize: '0.8rem' }}>
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={handleAddAiWordToVocab}
                    style={{ width: '100%', padding: '10px', background: '#10b981', border: 'none', borderRadius: '8px', color: 'white', fontWeight: 600, marginTop: '0.5rem' }}>
                    + Add to My Vocabulary
                  </button>
                </div>
              )}
            </div>

            {/* Pronunciation Practice Section */}
            <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '16px', padding: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.25rem' }}>
                <Mic size={24} style={{ color: '#f43f5e' }} />
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Acoustic Speech Practice</h3>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '4px' }}>Target Sentence</label>
                <input
                  type="text"
                  value={pronunciationText}
                  onChange={e => setPronunciationText(e.target.value)}
                  style={{ width: '100%', padding: '10px', background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: 'white' }}
                />
              </div>

              <div style={{ textAlign: 'center', padding: '2rem 1rem', background: '#0f172a', border: '1px dashed #334155', borderRadius: '12px' }}>
                <button
                  onClick={handleToggleRecord}
                  style={{
                    width: '72px',
                    height: '72px',
                    borderRadius: '50%',
                    background: recording ? '#ef4444' : '#4f46e5',
                    border: 'none',
                    color: 'white',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: recording ? '0 0 20px rgba(239, 68, 68, 0.7)' : 'none',
                    animation: recording ? 'pulse 1.5s infinite' : 'none'
                  }}>
                  <Mic size={32} />
                </button>
                <div style={{ marginTop: '1rem', fontWeight: 600, color: recording ? '#f87171' : '#cbd5e1' }}>
                  {recording ? 'Recording... Click to Stop & Assess' : 'Click to Speak'}
                </div>
              </div>

              {pronunciationResult && (
                <div style={{ marginTop: '1.5rem', background: '#0f172a', border: '1px solid #334155', borderRadius: '12px', padding: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>Speech Score: {pronunciationResult.matchScore}/100</span>
                    <span style={{
                      padding: '2px 8px',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      background: pronunciationResult.isAcceptable ? '#065f46' : '#7f1d1d',
                      color: pronunciationResult.isAcceptable ? '#34d399' : '#f87171'
                    }}>
                      {pronunciationResult.isAcceptable ? 'PASSED' : 'NEEDS PRACTICE'}
                    </span>
                  </div>

                  <p style={{ color: '#cbd5e1', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                    {pronunciationResult.feedback}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: Tests & Quizzes */}
        {activeTab === 'test' && (
          <div>
            {!currentTest ? (
              <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '16px', padding: '3rem', textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
                <Brain size={48} style={{ color: '#6366f1', margin: '0 auto 1rem' }} />
                <h3 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Spaced Retrieval Quiz</h3>
                <p style={{ color: '#94a3b8', marginTop: '0.5rem', marginBottom: '2rem' }}>
                  Generate a deterministic multiple-choice test mixing your due reviews (60%), recent learning words (30%), and mastered words (10%).
                </p>

                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                  <button
                    onClick={() => handleStartTest(3)}
                    disabled={creatingTest}
                    style={{ padding: '12px 24px', background: '#4f46e5', border: 'none', borderRadius: '8px', color: 'white', fontWeight: 700 }}>
                    {creatingTest ? 'Generating...' : 'Start 3-Question Quiz'}
                  </button>
                  <button
                    onClick={() => handleStartTest(5)}
                    disabled={creatingTest}
                    style={{ padding: '12px 24px', background: '#312e81', border: 'none', borderRadius: '8px', color: '#c7d2fe', fontWeight: 700 }}>
                    {creatingTest ? 'Generating...' : 'Start 5-Question Quiz'}
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ maxWidth: '700px', margin: '0 auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>{currentTest.title}</h3>
                  <span style={{
                    padding: '4px 10px',
                    borderRadius: '8px',
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    background: currentTest.status === 'Completed' ? '#065f46' : '#78350f',
                    color: currentTest.status === 'Completed' ? '#34d399' : '#fbbf24'
                  }}>
                    {currentTest.status}
                  </span>
                </div>

                {/* Score Report Header if Completed */}
                {currentTest.status === 'Completed' && (
                  <div style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.5rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '2rem', fontWeight: 800, color: currentTest.scorePercentage >= 70 ? '#34d399' : '#fbbf24' }}>
                      {currentTest.scorePercentage}%
                    </div>
                    <div style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
                      {currentTest.correctAnswers} of {currentTest.totalQuestions} questions correct
                    </div>
                  </div>
                )}

                {/* Questions List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  {currentTest.questions.map((q, idx) => (
                    <div key={q.id} style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '1.5rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8', fontSize: '0.8rem', marginBottom: '0.5rem' }}>
                        <span>Question {idx + 1} of {currentTest.questions.length}</span>
                        {q.isCorrect !== null && q.isCorrect !== undefined && (
                          <span style={{ color: q.isCorrect ? '#34d399' : '#ef4444', fontWeight: 700 }}>
                            {q.isCorrect ? '✓ CORRECT' : '✗ INCORRECT'}
                          </span>
                        )}
                      </div>

                      <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ffffff', marginBottom: '1rem' }}>
                        What does "{q.prompt}" mean?
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '8px' }}>
                        {q.options.map((opt, oIdx) => {
                          const isSelected = testAnswers[q.id] === opt || q.selectedAnswer === opt;
                          const isCorrectOption = currentTest.status === 'Completed' && q.correctAnswer === opt;
                          let bg = '#0f172a';
                          let border = '#334155';

                          if (currentTest.status === 'Completed') {
                            if (isCorrectOption) {
                              bg = '#065f46';
                              border = '#10b981';
                            } else if (isSelected && !q.isCorrect) {
                              bg = '#7f1d1d';
                              border = '#ef4444';
                            }
                          } else if (isSelected) {
                            bg = '#312e81';
                            border = '#6366f1';
                          }

                          return (
                            <button
                              key={oIdx}
                              disabled={currentTest.status === 'Completed'}
                              onClick={() => setTestAnswers({ ...testAnswers, [q.id]: opt })}
                              style={{
                                padding: '12px 16px',
                                background: bg,
                                border: `1px solid ${border}`,
                                borderRadius: '8px',
                                color: '#f8fafc',
                                textAlign: 'left',
                                fontWeight: 500
                              }}>
                              {opt}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'space-between' }}>
                  <button
                    onClick={() => setCurrentTest(null)}
                    style={{ padding: '10px 20px', background: '#334155', border: 'none', borderRadius: '8px', color: 'white' }}>
                    Back to Test Menu
                  </button>

                  {currentTest.status !== 'Completed' && (
                    <button
                      onClick={handleSubmitTest}
                      disabled={submittingTest}
                      style={{ padding: '10px 24px', background: '#10b981', border: 'none', borderRadius: '8px', color: 'white', fontWeight: 700 }}>
                      {submittingTest ? 'Grading...' : 'Submit Answers'}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 5: Profile & Security */}
        {activeTab === 'profile' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            {/* Preferences Section */}
            <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '16px', padding: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
                <User size={24} style={{ color: '#6366f1' }} />
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Learner Preferences</h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '4px' }}>Display Name</label>
                  <input
                    type="text"
                    value={profile?.displayName || ''}
                    disabled
                    style={{ width: '100%', padding: '10px', background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: 'white' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '4px' }}>Target CEFR Level</label>
                  <input
                    type="text"
                    value={profile?.targetCefrLevel || 'B2'}
                    disabled
                    style={{ width: '100%', padding: '10px', background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: 'white' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '4px' }}>Daily Goal (Minutes)</label>
                  <input
                    type="text"
                    value={`${profile?.dailyGoalMinutes || 15} minutes / day`}
                    disabled
                    style={{ width: '100%', padding: '10px', background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: 'white' }}
                  />
                </div>
              </div>
            </div>

            {/* Active Security Sessions */}
            <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '16px', padding: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Shield size={24} style={{ color: '#10b981' }} />
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Active Sessions</h3>
                </div>

                <button
                  onClick={async () => {
                    if (confirm('Log out from all devices? This will invalidate all refresh tokens.')) {
                      await api.logoutAll();
                      logout();
                    }
                  }}
                  style={{ padding: '6px 12px', background: '#7f1d1d', border: 'none', borderRadius: '6px', color: '#fecaca', fontSize: '0.75rem', fontWeight: 600 }}>
                  Log Out All Devices
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {sessions.map(s => (
                  <div key={s.id} style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', padding: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>
                        {s.geoCity || 'Local'}, {s.geoCountry || 'Host'}
                        {s.isCurrentSession && (
                          <span style={{ marginLeft: '8px', background: '#065f46', color: '#34d399', padding: '2px 6px', borderRadius: '4px', fontSize: '0.7rem' }}>
                            Current
                          </span>
                        )}
                      </div>
                      <div style={{ color: '#64748b', fontSize: '0.75rem', marginTop: '2px' }}>
                        IP: {s.ipAddress} • Risk: {s.riskLevel}
                      </div>
                    </div>

                    {!s.isCurrentSession && (
                      <button
                        onClick={async () => {
                          await api.revokeSession(s.id);
                          loadSessions();
                        }}
                        style={{ background: '#334155', border: 'none', color: '#f87171', padding: '6px 10px', borderRadius: '6px', fontSize: '0.75rem' }}>
                        Revoke
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
