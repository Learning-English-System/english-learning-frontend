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

  const totalReviewed = progress?.totalReviewed || 0;
  const streak = progress?.streakDays || 5;
  const masteredCount = progress?.retentionRate ? Math.round(progress.retentionRate * 100) : 85;

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 space-y-8">
      
      {/* Title */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 text-xs font-semibold mb-2">
          <Award className="w-4 h-4" />
          <span>Hồ Sơ & Thống Kê Học Tập</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Tiến Độ Của Bạn
        </h1>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
          Theo dõi chuỗi ngày học tập, tốc độ ghi nhớ từ vựng và thiết bị đăng nhập
        </p>
      </div>

      {/* Top Section: User Card & Big Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* User Card */}
        <Card className="p-6 md:col-span-1 flex flex-col justify-between border border-slate-200/90 dark:border-white/10 bg-white dark:bg-[#111726] shadow-sm rounded-2xl">
          <div className="text-center py-4">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-indigo-600 text-white flex items-center justify-center text-2xl font-bold mb-3 shadow-md select-none">
              {profile?.displayName?.charAt(0) || 'U'}
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              {profile?.displayName || 'Học viên'}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              {profile?.email}
            </p>
            <div className="flex justify-center gap-2 mt-4">
              <Badge variant="cyan" size="md" className="font-bold">Mục tiêu {profile?.targetCefrLevel || 'B2'}</Badge>
              <Badge variant="amber" size="md" className="font-bold">🔥 {streak} ngày</Badge>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-white/5 text-xs font-semibold text-slate-400 flex justify-between">
            <span>Ngôn ngữ gốc: {profile?.nativeLanguage?.toUpperCase() || 'VI'}</span>
            <span>Mục tiêu: {profile?.targetLanguage?.toUpperCase() || 'EN'}</span>
          </div>
        </Card>

        {/* Cognitive Metric Rings Card - Chữ số to rõ ràng */}
        <Card className="p-6 md:col-span-2 flex flex-col justify-between border border-slate-200/90 dark:border-white/10 bg-white dark:bg-[#111726] shadow-sm rounded-2xl">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
              Chỉ Số Ghi Nhớ Ngắn & Dài Hạn
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-6">
              Đo lường độ bền vững của trí nhớ theo thuật toán ngắt quãng
            </p>

            <div className="grid grid-cols-3 gap-4 text-center">
              
              {/* Metric 1: Minutes */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/5 flex flex-col items-center">
                <ProgressRing progress={75} size={70} strokeWidth={6} color="#4f46e5">
                  <Clock className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                </ProgressRing>
                <div className="mt-3">
                  <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                    15 <span className="text-xs font-semibold text-slate-400">/ {dailyGoal}p</span>
                  </div>
                  <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">Thời gian học</div>
                </div>
              </div>

              {/* Metric 2: Reviews */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/5 flex flex-col items-center">
                <ProgressRing progress={85} size={70} strokeWidth={6} color="#0284c7">
                  <Award className="w-5 h-5 text-sky-600 dark:text-sky-400" />
                </ProgressRing>
                <div className="mt-3">
                  <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                    {totalReviewed} <span className="text-xs font-semibold text-slate-400">từ</span>
                  </div>
                  <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">Đã ôn tập</div>
                </div>
              </div>

              {/* Metric 3: Retention */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/5 flex flex-col items-center">
                <ProgressRing progress={masteredCount} size={70} strokeWidth={6} color="#10b981">
                  <Flame className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </ProgressRing>
                <div className="mt-3">
                  <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                    {masteredCount}%
                  </div>
                  <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">Tỷ lệ nhớ lâu</div>
                </div>
              </div>

            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100 dark:border-white/5 text-xs text-slate-500 text-center font-medium">
            Thuật toán SuperMemo-2 tự động phân tích độ khó để nhắc lại đúng thời điểm vàng trước khi quên.
          </div>
        </Card>

      </div>

      {/* Preferences Form */}
      <Card className="p-6 sm:p-7 border border-slate-200/90 dark:border-white/10 bg-white dark:bg-[#111726] shadow-sm rounded-2xl">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
          Thiết Lập Mục Tiêu & Cấp Độ
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-6">
          Tùy chỉnh thời gian học mỗi ngày và trình độ mục tiêu mong muốn đạt được.
        </p>

        <form onSubmit={handleSavePreferences} className="space-y-4 max-w-xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Mục tiêu hàng ngày (Phút)
              </label>
              <input
                type="number"
                min={5}
                max={180}
                value={dailyGoal}
                onChange={(e) => setDailyGoal(Number(e.target.value))}
                className="w-full rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-white/10 px-4 py-2.5 text-base font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Trình độ CEFR mục tiêu
              </label>
              <select
                value={targetCefr}
                onChange={(e) => setTargetCefr(e.target.value)}
                className="w-full rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-white/10 px-4 py-2.5 text-base font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="A1">A1 - Sơ cấp</option>
                <option value="A2">A2 - Cơ bản</option>
                <option value="B1">B1 - Trung cấp</option>
                <option value="B2">B2 - Khá</option>
                <option value="C1">C1 - Nâng cao</option>
                <option value="C2">C2 - Thành thạo</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-3">
            <Button
              type="submit"
              variant="primary"
              loading={saving}
              className="rounded-xl px-6 py-2.5 text-sm font-semibold shadow-sm"
            >
              Lưu thay đổi
            </Button>
            {savedSuccess && (
              <span className="text-sm font-bold text-emerald-600 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> Đã cập nhật thành công!
              </span>
            )}
          </div>
        </form>
      </Card>

      {/* Security Sessions */}
      <Card className="p-6 sm:p-7 border border-slate-200/90 dark:border-white/10 bg-white dark:bg-[#111726] shadow-sm rounded-2xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Thiết Bị & Phiên Đăng Nhập Hoạt Động
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Bảo mật danh tính với cơ chế OpenIddict Token Family
            </p>
          </div>
          <Shield className="w-5 h-5 text-emerald-600" />
        </div>

        {sessions.length === 0 ? (
          <p className="text-sm text-slate-400 py-3">Không có phiên đăng nhập phụ nào khác.</p>
        ) : (
          <div className="space-y-3 mt-4">
            {sessions.map((sess) => (
              <div
                key={sess.id}
                className="p-4 rounded-xl border border-slate-200/70 dark:border-white/10 bg-slate-50/60 dark:bg-white/[0.02] flex items-center justify-between"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300">
                    {(sess.userAgentSummary || sess.userAgent)?.toLowerCase().includes('mobile') ? (
                      <Smartphone className="w-5 h-5" />
                    ) : (
                      <Laptop className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-900 dark:text-white">
                      {(sess.userAgentSummary || sess.userAgent)?.split(' ')[0] || 'Trình duyệt Web'}
                    </div>
                    <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5 font-medium">
                      <span>IP: {sess.ipAddress || '127.0.0.1'}</span>
                      <span>•</span>
                      <span>Mức an toàn: {sess.riskLevel || 'An toàn'}</span>
                    </div>
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRevokeSession(sess.id)}
                  className="rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1" /> Đăng xuất
                </Button>
              </div>
            ))}
          </div>
        )}
      </Card>

    </div>
  );
};
