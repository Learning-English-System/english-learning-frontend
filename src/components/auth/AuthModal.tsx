import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, ExternalLink, ShieldCheck, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { SegmentControl, type SegmentOption } from '../ui/SegmentControl';
import { useAuth } from '../../context/AuthContext';

export type AuthMode = 'login' | 'register' | 'verify';

export const AuthModal: React.FC = () => {
  const { login, register, verifyEmail } = useAuth();
  
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('taingo2112003@gmail.com');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('Ngô Bá Tấn Tài');
  const [token, setToken] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const modeOptions: SegmentOption<AuthMode>[] = [
    { value: 'login', label: 'Đăng nhập' },
    { value: 'register', label: 'Đăng ký' },
    { value: 'verify', label: 'Xác thực' },
  ];

  const handleModeChange = (newMode: AuthMode) => {
    setMode(newMode);
    setError('');
    setSuccessMsg('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      if (mode === 'login') {
        await login(email, password);
      } else if (mode === 'register') {
        await register(email, password, displayName);
        setMode('verify');
        setSuccessMsg('Đăng ký thành công! Vui lòng kiểm tra hòm thư Mailpit (http://localhost:8025) để lấy mã xác thực.');
      } else if (mode === 'verify') {
        await verifyEmail(email, token.trim());
        setSuccessMsg('Xác thực email thành công! Bạn có thể đăng nhập ngay.');
        setMode('login');
      }
    } catch (err: any) {
      setError(err.message || 'Xác thực thất bại, vui lòng kiểm tra lại thông tin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-md mx-auto"
    >
      <Card className="p-8 sm:p-10 border border-slate-200 dark:border-white/10 bg-white dark:bg-[#111726] shadow-xl rounded-2xl">
          
          {/* Header */}
          <div className="text-center mb-7">
            <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md select-none">
              <Sparkles className="w-6 h-6 fill-current" />
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Synapse
            </h1>
            <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
              Học tiếng Anh thông minh & bền vững
            </p>
          </div>

          {/* Mode Switcher */}
          <div className="flex justify-center mb-6">
            <SegmentControl
              options={modeOptions}
              value={mode}
              onChange={handleModeChange}
              pillId="auth-mode-pill"
            />
          </div>

          {/* Notifications */}
          <AnimatePresence mode="wait">
            {successMsg && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-5 p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 text-emerald-700 dark:text-emerald-300 text-xs sm:text-sm font-medium flex items-start gap-2.5"
              >
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
                <span>{successMsg}</span>
              </motion.div>
            )}

            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-5 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/50 text-rose-700 dark:text-rose-300 text-xs sm:text-sm font-medium flex items-start gap-2.5"
              >
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <Input
                  label="Họ và tên"
                  type="text"
                  required
                  placeholder="e.g. Nguyễn Văn A"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  icon={<User className="w-4 h-4" />}
                />
              </div>
            )}

            <div>
              <Input
                label="Địa chỉ Email"
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                icon={<Mail className="w-4 h-4" />}
              />
            </div>

            {mode !== 'verify' && (
              <div>
                <Input
                  label="Mật khẩu"
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  icon={<Lock className="w-4 h-4" />}
                />
              </div>
            )}

            {mode === 'verify' && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Mã xác thực Email
                  </label>
                  <a
                    href="http://localhost:8025"
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 font-semibold"
                  >
                    Mở Mailpit Inbox <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <textarea
                  rows={4}
                  required
                  placeholder="Dán mã xác thực token nhận được từ email..."
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  className="w-full rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-white/10 p-3 text-xs sm:text-sm font-mono text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all resize-none"
                />
              </div>
            )}

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={loading}
                className="w-full text-base font-bold py-3.5 rounded-xl shadow-md"
              >
                {mode === 'login'
                  ? 'Đăng Nhập'
                  : mode === 'register'
                  ? 'Tạo Tài Khoản'
                  : 'Xác Thực Email'}
              </Button>
            </div>
          </form>

          {/* Footer security note */}
          <div className="mt-7 pt-5 border-t border-slate-100 dark:border-white/5 flex items-center justify-center gap-2 text-xs font-medium text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Bảo mật an toàn với OpenIddict & OAuth 2.0</span>
          </div>

        </Card>
      </motion.div>
  );
};
