// Central API client supporting direct microservice ports or Nginx Gateway

const GATEWAY_URL = import.meta.env.VITE_API_GATEWAY_URL || '';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface UserInfo {
  id: string;
  email: string;
  displayName: string;
  role: string;
}

export interface LearnerProfile {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  nativeLanguage: string;
  targetLanguage: string;
  dailyGoalMinutes: number;
  targetCefrLevel: string;
  dailyReviewTarget: number;
  reminderEnabled: boolean;
  preferredDifficulty: string;
}

export interface VocabularyExample {
  id: string;
  sentence: string;
  translation: string;
}

export interface ReviewState {
  repetitionCount: number;
  intervalDays: number;
  easeFactor: number;
  dueAt: string;
  lastReviewedAt?: string;
  lapseCount: number;
  correctCount: number;
  incorrectCount: number;
}

export interface VocabularyItem {
  id: string;
  userId: string;
  word: string;
  normalizedWord: string;
  translation: string;
  partOfSpeech: string;
  definition: string;
  cefrLevel: string;
  categoryId?: string;
  categoryName?: string;
  source: string;
  status: string; // "New", "Learning", "Mastered"
  createdAt: string;
  updatedAt: string;
  examples: VocabularyExample[];
  reviewState?: ReviewState;
}

export interface LearningProgress {
  userId: string;
  totalWords: number;
  learningWords: number;
  masteredWords: number;
  dueReviews: number;
  rollingAccuracy: number;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  isSystem: boolean;
  wordCount: number;
}

export interface VocabularyAnalysis {
  normalizedWord: string;
  translation: string;
  partOfSpeech: string;
  definition: string;
  cefrLevel: string;
  suggestedCategories: string[];
  examples: Array<{ sentence: string; translation: string }>;
  collocations: string[];
  phonetic?: string;
}

export interface PronunciationAssessment {
  transcript: string;
  matchScore: number;
  feedback: string;
  isAcceptable: boolean;
}

export interface TestQuestion {
  id: string;
  vocabularyId: string;
  questionType: string;
  prompt: string;
  options: string[];
  orderIndex: number;
  selectedAnswer?: string;
  correctAnswer?: string;
  isCorrect?: boolean;
}

export interface TestSession {
  id: string;
  title: string;
  status: string;
  totalQuestions: number;
  correctAnswers: number;
  scorePercentage: number;
  startedAt: string;
  completedAt?: string;
  questions: TestQuestion[];
}

export interface UserSession {
  id: string;
  ipAddress: string;
  geoCountry: string;
  geoCity: string;
  userAgent: string;
  createdAt: string;
  lastActiveAt: string;
  riskLevel: string;
  isCurrentSession: boolean;
}

class ApiService {
  private getHeaders(): HeadersInit {
    const token = localStorage.getItem('access_token');
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    };
  }

  // --- Auth APIs ---
  async login(email: string, password: string): Promise<AuthTokens> {
    const params = new URLSearchParams();
    params.append('grant_type', 'password');
    params.append('client_id', 'spa-client');
    params.append('username', email);
    params.append('password', password);
    params.append('scope', 'openid profile email offline_access');

    const res = await fetch(`${GATEWAY_URL}/api/auth/connect/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString()
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error_description: 'Login failed' }));
      throw new Error(err.error_description || err.error || 'Login failed');
    }

    const data = await res.json();
    const tokens: AuthTokens = {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresIn: data.expires_in
    };
    localStorage.setItem('access_token', tokens.accessToken);
    localStorage.setItem('refresh_token', tokens.refreshToken);
    return tokens;
  }

  async register(email: string, password: string, displayName: string): Promise<any> {
    const res = await fetch(`${GATEWAY_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, displayName })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: 'Registration failed' }));
      let errorMsg = err.message || err.title || err.detail;
      if (err.errors && typeof err.errors === 'object') {
        const errorList = Object.values(err.errors).flat().join(' ');
        if (errorList) errorMsg = errorList;
      }
      throw new Error(errorMsg || 'Registration failed');
    }
    return res.json();
  }

  async logout(): Promise<void> {
    const token = localStorage.getItem('access_token');
    if (token) {
      await fetch(`${GATEWAY_URL}/api/auth/logout`, {
        method: 'POST',
        headers: this.getHeaders()
      }).catch(() => {});
    }
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }

  async logoutAll(): Promise<void> {
    await fetch(`${GATEWAY_URL}/api/auth/logout-all`, {
      method: 'POST',
      headers: this.getHeaders()
    });
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }

  async getSessions(): Promise<UserSession[]> {
    const res = await fetch(`${GATEWAY_URL}/api/auth/sessions`, {
      headers: this.getHeaders()
    });
    if (!res.ok) return [];
    return res.json();
  }

  async revokeSession(sessionId: string): Promise<void> {
    await fetch(`${GATEWAY_URL}/api/auth/sessions/${sessionId}`, {
      method: 'DELETE',
      headers: this.getHeaders()
    });
  }

  // --- Profile APIs ---
  async getProfile(): Promise<LearnerProfile> {
    const res = await fetch(`${GATEWAY_URL}/api/profile/me`, {
      headers: this.getHeaders()
    });
    if (!res.ok) throw new Error('Failed to load profile');
    return res.json();
  }

  async updateProfile(data: Partial<LearnerProfile>): Promise<LearnerProfile> {
    const res = await fetch(`${GATEWAY_URL}/api/profile/me`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to update profile');
    return res.json();
  }

  // --- Learning & Vocabulary APIs ---
  async getVocabularyList(search?: string, status?: string, categoryId?: string): Promise<VocabularyItem[]> {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (status) params.append('status', status);
    if (categoryId) params.append('categoryId', categoryId);

    const res = await fetch(`${GATEWAY_URL}/api/vocabulary?${params.toString()}`, {
      headers: this.getHeaders()
    });
    if (!res.ok) return [];
    return res.json();
  }

  async createVocabulary(data: {
    word: string;
    translation: string;
    partOfSpeech?: string;
    definition?: string;
    cefrLevel?: string;
    categoryId?: string;
    examples?: Array<{ sentence: string; translation: string }>;
  }): Promise<VocabularyItem> {
    const res = await fetch(`${GATEWAY_URL}/api/vocabulary`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed to create vocabulary' }));
      throw new Error(err.error || 'Failed to create vocabulary');
    }
    return res.json();
  }

  async deleteVocabulary(id: string): Promise<void> {
    await fetch(`${GATEWAY_URL}/api/vocabulary/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders()
    });
  }

  async getDueReviews(limit: number = 20): Promise<VocabularyItem[]> {
    const res = await fetch(`${GATEWAY_URL}/api/vocabulary/reviews/due?limit=${limit}`, {
      headers: this.getHeaders()
    });
    if (!res.ok) return [];
    return res.json();
  }

  async submitReview(vocabularyId: string, qualityRating: number): Promise<any> {
    const res = await fetch(`${GATEWAY_URL}/api/vocabulary/${vocabularyId}/reviews`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ qualityRating })
    });
    if (!res.ok) throw new Error('Failed to submit review');
    return res.json();
  }

  async getProgress(): Promise<LearningProgress> {
    const res = await fetch(`${GATEWAY_URL}/api/vocabulary/progress`, {
      headers: this.getHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch progress');
    return res.json();
  }

  async getCategories(): Promise<Category[]> {
    const res = await fetch(`${GATEWAY_URL}/api/vocabulary/categories`, {
      headers: this.getHeaders()
    });
    if (!res.ok) return [];
    return res.json();
  }

  async createCategory(name: string): Promise<Category> {
    const res = await fetch(`${GATEWAY_URL}/api/vocabulary/categories`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ name })
    });
    if (!res.ok) throw new Error('Failed to create category');
    return res.json();
  }

  // --- AI APIs ---
  async analyzeVocabulary(word: string, targetLanguage: string = 'vi', context?: string): Promise<VocabularyAnalysis> {
    const res = await fetch(`${GATEWAY_URL}/api/ai/vocabulary/analyze`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ word, targetLanguage, contextSentence: context })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'AI analysis failed' }));
      throw new Error(err.error || 'AI analysis failed');
    }
    return res.json();
  }

  async generateDistractors(word: string, correctMeaning: string, count: number = 3): Promise<{ distractors: string[] }> {
    const res = await fetch(`${GATEWAY_URL}/api/ai/vocabulary/distractors`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ word, correctMeaning, count })
    });
    if (!res.ok) return { distractors: [] };
    return res.json();
  }

  async assessPronunciation(expectedText: string, audioBase64: string, audioMimeType: string = 'audio/wav'): Promise<PronunciationAssessment> {
    const res = await fetch(`${GATEWAY_URL}/api/ai/pronunciation/assess`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ expectedText, audioBase64, audioMimeType })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Pronunciation assessment failed' }));
      throw new Error(err.error || 'Pronunciation assessment failed');
    }
    return res.json();
  }

  // --- Test APIs ---
  async createTestSession(questionCount: number = 5, categoryId?: string): Promise<TestSession> {
    const res = await fetch(`${GATEWAY_URL}/api/tests`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ questionCount, categoryId })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed to create test session' }));
      throw new Error(err.error || 'Failed to create test session');
    }
    return res.json();
  }

  async getTestSession(id: string): Promise<TestSession> {
    const res = await fetch(`${GATEWAY_URL}/api/tests/${id}`, {
      headers: this.getHeaders()
    });
    if (!res.ok) throw new Error('Test session not found');
    return res.json();
  }

  async submitTest(id: string, answers: Array<{ questionId: string; selectedAnswer: string }>): Promise<TestSession> {
    const res = await fetch(`${GATEWAY_URL}/api/tests/${id}/submit`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ answers })
    });
    if (!res.ok) throw new Error('Failed to submit test');
    return res.json();
  }

  async getTestSessions(): Promise<any[]> {
    const res = await fetch(`${GATEWAY_URL}/api/tests`, {
      headers: this.getHeaders()
    });
    if (!res.ok) return [];
    return res.json();
  }
}

export const api = new ApiService();
