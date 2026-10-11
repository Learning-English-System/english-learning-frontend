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
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-[var(--neural-cyan)]/10 border border-[var(--neural-cyan)]/20 text-[var(--neural-cyan)] text-[11px] font-mono mb-2">
          <Award className="w-3.5 h-3.5" />
          <span>SYNAPSE // OPERATIONAL METRICS</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-white font-tech">
          Cognitive Profile & Telemetry
        </h1>
        <p className="text-xs font-mono text-stone-400 mt-1">
          Monitor your neural retention curve, streak velocity, and active OpenIddict security sessions
        </p>
      </div>

      {/* Top Section: Metric Rings & Identity Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* User Card */}
        <Card className="p-6 md:col-span-1 flex flex-col justify-between border-white/[0.08] bg-[#0c0e12]">
          <div className="text-center py-4">
            <div className="w-14 h-14 mx-auto rounded-xl bg-black border border-[var(--neural-cyan)]/30 text-[var(--neural-cyan)] flex items-center justify-center text-xl font-tech font-bold mb-3 shadow-[0_0_15px_rgba(0,240,255,0.15)] select-none">
              {profile?.displayName?.charAt(0) || 'L'}
            </div>
            <h3 className="text-base font-bold text-white font-tech">
              {profile?.displayName || 'Learner'}
            </h3>
            <p className="text-xs font-mono text-stone-400 mt-0.5">
              {profile?.email}
            </p>
            <div className="flex justify-center gap-1.5 mt-3">
              <Badge variant="cyan" size="sm" className="font-mono">{profile?.targetCefrLevel || 'B2'} Candidate</Badge>
              <Badge variant="stone" size="sm" className="font-mono">{streak}d Streak</Badge>
            </div>
          </div>

          <div className="pt-3 border-t border-white/[0.08] text-xs font-mono text-stone-400 flex justify-between">
            <span>Native: {profile?.nativeLanguage?.toUpperCase() || 'VI'}</span>
            <span>Target: {profile?.targetLanguage?.toUpperCase() || 'EN'}</span>
          </div>
        </Card>

        {/* Cognitive Metric Rings Card */}
        <Card className="p-6 md:col-span-2 flex flex-col justify-between border-white/[0.08] bg-[#0c0e12]">
          <div>
            <h3 className="text-sm font-mono uppercase tracking-wider text-stone-400 mb-1">
              Synaptic Retention Telemetry
            </h3>
            <p className="text-xs text-stone-500 mb-6 font-mono">
              Algorithmic memory markers tracking neural consolidation and half-life decay
            </p>

            <div className="grid grid-cols-3 gap-3 text-center">
              
              {/* Ring 1: Minutes */}
              <div className="p-3.5 rounded-lg bg-white/[0.02] border border-white/[0.06] flex flex-col items-center">
                <ProgressRing progress={75} size={64} strokeWidth={5} color="#00f0ff">
                  <Clock className="w-4 h-4 text-[var(--neural-cyan)]" />
                </ProgressRing>
                <div className="mt-2.5">
                  <div className="text-xs font-bold text-white font-mono">15 / {dailyGoal}m</div>
                  <div className="text-[10px] text-stone-400 uppercase font-mono mt-0.5">Focus Duration</div>
                </div>
              </div>

              {/* Ring 2: Reviews */}
              <div className="p-3.5 rounded-lg bg-white/[0.02] border border-white/[0.06] flex flex-col items-center">
                <ProgressRing progress={85} size={64} strokeWidth={5} color="#38bdf8">
                  <Award className="w-4 h-4 text-sky-400" />
                </ProgressRing>
                <div className="mt-2.5">
                  <div className="text-xs font-bold text-white font-mono">{totalReviewed} nodes</div>
                  <div className="text-[10px] text-stone-400 uppercase font-mono mt-0.5">SM-2 Reviews</div>
                </div>
              </div>

              {/* Ring 3: Retention */}
              <div className="p-3.5 rounded-lg bg-white/[0.02] border border-white/[0.06] flex flex-col items-center">
                <ProgressRing progress={masteredCount} size={64} strokeWidth={5} color="#10b981">
                  <Flame className="w-4 h-4 text-emerald-400" />
                </ProgressRing>
                <div className="mt-2.5">
                  <div className="text-xs font-bold text-white font-mono">{masteredCount}%</div>
                  <div className="text-[10px] text-stone-400 uppercase font-mono mt-0.5">Retention Rate</div>
                </div>
              </div>

            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-white/[0.08] text-xs font-mono text-stone-500 text-center">
            SuperMemo-2 algorithm automatically calculates node intervals based on recall precision.
          </div>
        </Card>

      </div>

      {/* Preferences Form */}
      <Card className="p-6 border-white/[0.08] bg-[#0c0e12]">
        <h3 className="text-base font-bold text-white font-tech mb-1">
          Cognitive Workload & CEFR Targets
        </h3>
        <p className="text-xs font-mono text-stone-400 mb-6">
          Calibrate your daily review throughput and target difficulty threshold.
        </p>

        <form onSubmit={handleSavePreferences} className="space-y-4 max-w-xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-stone-400 mb-2">
                Daily Quota (Minutes)
              </label>
              <input
                type="number"
                min={5}
                max={180}
                value={dailyGoal}
                onChange={(e) => setDailyGoal(Number(e.target.value))}
                className="w-full rounded-lg bg-black/40 border border-white/[0.08] px-3.5 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-[var(--neural-cyan)]"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-stone-400 mb-2">
                CEFR Target Level
              </label>
              <select
                value={targetCefr}
                onChange={(e) => setTargetCefr(e.target.value)}
                className="w-full rounded-lg bg-black/40 border border-white/[0.08] px-3.5 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-[var(--neural-cyan)]"
              >
                <option value="A1" className="bg-[#0c0e12]">A1 - Beginner</option>
                <option value="A2" className="bg-[#0c0e12]">A2 - Elementary</option>
                <option value="B1" className="bg-[#0c0e12]">B1 - Intermediate</option>
                <option value="B2" className="bg-[#0c0e12]">B2 - Upper Intermediate</option>
                <option value="C1" className="bg-[#0c0e12]">C1 - Advanced</option>
                <option value="C2" className="bg-[#0c0e12]">C2 - Mastery</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Button
              type="submit"
              variant="primary"
              loading={saving}
              className="rounded-lg px-5 text-xs font-mono"
            >
              Update Calibration
            </Button>
            {savedSuccess && (
              <span className="text-xs font-mono text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Parameters stored successfully.
              </span>
            )}
          </div>
        </form>
      </Card>

      {/* Security Sessions */}
      <Card className="p-6 border-white/[0.08] bg-[#0c0e12]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-white font-tech">
              Active Devices & Security Sessions
            </h3>
            <p className="text-xs font-mono text-stone-400 mt-0.5">
              Managed by OpenIddict Token Families with automatic rotation detection
            </p>
          </div>
          <Shield className="w-5 h-5 text-emerald-400" />
        </div>

        {sessions.length === 0 ? (
          <p className="text-xs font-mono text-stone-500 py-4">No secondary active device sessions detected.</p>
        ) : (
          <div className="space-y-3 mt-4">
            {sessions.map((sess) => (
              <div
                key={sess.id}
                className="p-3.5 rounded-lg border border-white/[0.06] bg-white/[0.02] flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-black/40 border border-white/[0.08] flex items-center justify-center text-stone-400">
                    {(sess.userAgentSummary || sess.userAgent)?.toLowerCase().includes('mobile') ? (
                      <Smartphone className="w-4 h-4" />
                    ) : (
                      <Laptop className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <div className="text-xs font-mono font-semibold text-white">
                      {(sess.userAgentSummary || sess.userAgent)?.split(' ')[0] || 'Web Browser'}
                    </div>
                    <div className="text-[11px] font-mono text-stone-400 flex items-center gap-2 mt-0.5">
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
                  className="rounded-lg text-xs font-mono text-red-400 hover:bg-red-500/10 hover:text-red-300"
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
