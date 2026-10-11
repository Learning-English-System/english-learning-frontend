import React, { useState } from 'react';
import { 
  Shield, 
  Smartphone, 
  Laptop, 
  Flame, 
  Clock, 
  Award, 
  Trash2,
  CheckCircle2
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { ProgressRing } from '../ui/ProgressRing';
import type { 
  LearnerProfile, 
  UserSession, 
  LearningProgress 
} from '../../services/api';

interface ProfileDashboardProps {
  profile: LearnerProfile | null;
  progress: LearningProgress | null;
  sessions: UserSession[];
  onUpdateProfile: (data: Partial<LearnerProfile>) => Promise<void>;
  onRevokeSession: (sessionId: string) => Promise<void>;
}

export const ProfileDashboard: React.FC<ProfileDashboardProps> = ({
  profile,
  progress,
  sessions,
  onUpdateProfile,
  onRevokeSession,
}) => {
  const [dailyGoal, setDailyGoal] = useState(profile?.dailyGoalMinutes || 20);
  const [targetCefr, setTargetCefr] = useState(profile?.targetCefrLevel || 'B2');
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSavePreferences = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);
    try {
      await onUpdateProfile({
        dailyGoalMinutes: Number(dailyGoal),
        targetCefrLevel: targetCefr,
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  // Activity Rings Data (Apple Fitness style)
  const totalReviewed = progress?.totalReviewed || 0;
  const streak = progress?.streakDays || 5;
  const masteredCount = progress?.retentionRate ? Math.round(progress.retentionRate * 100) : 85;

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 space-y-8">
      
      {/* Title */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#34c759]/10 text-[#34c759] text-xs font-semibold mb-3">
          <Award className="w-3.5 h-3.5" />
          <span>Learner Identity & Metrics</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-[#1d1d1f] dark:text-[#f5f5f7]">
          Profile & Learning Health
        </h1>
        <p className="text-[14px] text-[#86868b] mt-1">
          Monitor your neural retention curve, streak velocity, and active OpenIddict security sessions
        </p>
      </div>

      {/* Top Section: Apple Fitness Rings & Identity Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* User Card */}
        <Card className="p-6 md:col-span-1 flex flex-col justify-between">
          <div className="text-center py-4">
            <div className="w-16 h-16 mx-auto rounded-xl bg-[#121316] text-[#faf9f5] dark:bg-[#f4f3f0] dark:text-[#121316] flex items-center justify-center text-xl font-serif font-bold mb-3 shadow-xs border border-black/10 dark:border-white/10 select-none">
              {profile?.displayName?.charAt(0) || 'L'}
            </div>
            <h3 className="text-lg font-bold text-[#121316] dark:text-[#f4f3f0]">
              {profile?.displayName || 'Learner'}
            </h3>
            <p className="text-xs font-mono text-stone-400 mt-0.5">
              {profile?.email}
            </p>
            <div className="flex justify-center gap-1.5 mt-3">
              <Badge variant="oxford" size="sm" className="font-mono">{profile?.targetCefrLevel || 'B2'} Candidate</Badge>
              <Badge variant="amber" size="sm" className="font-mono">{streak}d Streak</Badge>
            </div>
          </div>

          <div className="pt-3 border-t border-black/[0.06] dark:border-white/[0.08] text-xs font-mono text-stone-500 flex justify-between">
            <span>Native: {profile?.nativeLanguage?.toUpperCase() || 'VI'}</span>
            <span>Target: {profile?.targetLanguage?.toUpperCase() || 'EN'}</span>
          </div>
        </Card>

        {/* Cognitive Metric Rings Card */}
        <Card className="p-6 md:col-span-2 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-mono uppercase tracking-wider text-stone-500 mb-1">
              Cognitive Retention Velocity
            </h3>
            <p className="text-xs text-stone-400 mb-6">
              Three algorithmic markers tracking your spaced memory durability
            </p>

            <div className="grid grid-cols-3 gap-3 text-center">
              
              {/* Ring 1: Minutes */}
              <div className="p-3.5 rounded-lg bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.04] dark:border-white/[0.06] flex flex-col items-center">
                <ProgressRing progress={75} size={64} strokeWidth={5} color="#b45309">
                  <Clock className="w-4 h-4 text-[#b45309]" />
                </ProgressRing>
                <div className="mt-2.5">
                  <div className="text-xs font-bold text-[#121316] dark:text-[#f4f3f0] font-mono">15 / {dailyGoal}m</div>
                  <div className="text-[10px] text-stone-400 uppercase font-mono mt-0.5">Focus Time</div>
                </div>
              </div>

              {/* Ring 2: Reviews */}
              <div className="p-3.5 rounded-lg bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.04] dark:border-white/[0.06] flex flex-col items-center">
                <ProgressRing progress={85} size={64} strokeWidth={5} color="#1a365d">
                  <Award className="w-4 h-4 text-[#1a365d] dark:text-[#38bdf8]" />
                </ProgressRing>
                <div className="mt-2.5">
                  <div className="text-xs font-bold text-[#121316] dark:text-[#f4f3f0] font-mono">{totalReviewed} cards</div>
                  <div className="text-[10px] text-stone-400 uppercase font-mono mt-0.5">SM-2 Reviews</div>
                </div>
              </div>

              {/* Ring 3: Retention */}
              <div className="p-3.5 rounded-lg bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.04] dark:border-white/[0.06] flex flex-col items-center">
                <ProgressRing progress={masteredCount} size={64} strokeWidth={5} color="#15803d">
                  <Flame className="w-4 h-4 text-[#15803d] dark:text-[#4ade80]" />
                </ProgressRing>
                <div className="mt-2.5">
                  <div className="text-xs font-bold text-[#121316] dark:text-[#f4f3f0] font-mono">{masteredCount}%</div>
                  <div className="text-[10px] text-stone-400 uppercase font-mono mt-0.5">Retention Rate</div>
                </div>
              </div>

            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-black/[0.05] dark:border-white/[0.08] text-xs text-[#86868b] text-center">
            SuperMemo-2 algorithm automatically schedules intervals based on your recall accuracy.
          </div>
        </Card>

      </div>

      {/* Preferences Form */}
      <Card className="p-6">
        <h3 className="text-lg font-bold text-[#1d1d1f] dark:text-[#f5f5f7] mb-1">
          Learning Goals & CEFR Targets
        </h3>
        <p className="text-xs text-[#86868b] mb-6">
          Personalize your daily workload and difficulty levels.
        </p>

        <form onSubmit={handleSavePreferences} className="space-y-4 max-w-xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#86868b] uppercase tracking-wider mb-2">
                Daily Goal (Minutes)
              </label>
              <input
                type="number"
                min={5}
                max={180}
                value={dailyGoal}
                onChange={(e) => setDailyGoal(Number(e.target.value))}
                className="w-full rounded-xl bg-black/[0.03] dark:bg-white/[0.06] border border-black/[0.08] dark:border-white/[0.12] px-3.5 py-2.5 text-sm text-[#1d1d1f] dark:text-[#f5f5f7] focus:outline-none focus:ring-2 focus:ring-[#0071e3]/30"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#86868b] uppercase tracking-wider mb-2">
                Target CEFR Proficiency
              </label>
              <select
                value={targetCefr}
                onChange={(e) => setTargetCefr(e.target.value)}
                className="w-full rounded-xl bg-black/[0.03] dark:bg-white/[0.06] border border-black/[0.08] dark:border-white/[0.12] px-3.5 py-2.5 text-sm text-[#1d1d1f] dark:text-[#f5f5f7] focus:outline-none focus:ring-2 focus:ring-[#0071e3]/30"
              >
                <option value="A1">A1 - Beginner</option>
                <option value="A2">A2 - Elementary</option>
                <option value="B1">B1 - Intermediate</option>
                <option value="B2">B2 - Upper Intermediate</option>
                <option value="C1">C1 - Advanced</option>
                <option value="C2">C2 - Mastery</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Button
              type="submit"
              variant="primary"
              loading={saving}
              className="rounded-full px-6"
            >
              Update Preferences
            </Button>
            {savedSuccess && (
              <span className="text-xs text-[#34c759] font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Preferences saved!
              </span>
            )}
          </div>
        </form>
      </Card>

      {/* Security Sessions */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-[#1d1d1f] dark:text-[#f5f5f7]">
              Active Devices & Security Sessions
            </h3>
            <p className="text-xs text-[#86868b] mt-0.5">
              Managed by OpenIddict Token Families with automatic rotation detection
            </p>
          </div>
          <Shield className="w-5 h-5 text-[#34c759]" />
        </div>

        {sessions.length === 0 ? (
          <p className="text-xs text-[#86868b] py-4">No other active device sessions detected.</p>
        ) : (
          <div className="space-y-3 mt-4">
            {sessions.map((sess) => (
              <div
                key={sess.id}
                className="p-4 rounded-xl border border-black/[0.06] dark:border-white/[0.08] bg-black/[0.02] dark:bg-white/[0.03] flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-black/[0.04] dark:bg-white/[0.08] flex items-center justify-center text-[#86868b]">
                    {(sess.userAgentSummary || sess.userAgent)?.toLowerCase().includes('mobile') ? (
                      <Smartphone className="w-5 h-5" />
                    ) : (
                      <Laptop className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">
                      {(sess.userAgentSummary || sess.userAgent)?.split(' ')[0] || 'Web Browser'}
                    </div>
                    <div className="text-[11px] text-[#86868b] flex items-center gap-2 mt-0.5">
                      <span>IP: {sess.ipAddress || '127.0.0.1'}</span>
                      <span>•</span>
                      <span>Risk: {sess.riskLevel || 'Low'}</span>
                    </div>
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRevokeSession(sess.id)}
                  className="rounded-full text-xs text-[#ff3b30] hover:bg-[#ff3b30]/10"
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1" /> Revoke
                </Button>
              </div>
            ))}
          </div>
        )}
      </Card>

    </div>
  );
};
