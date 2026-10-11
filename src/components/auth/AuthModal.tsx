import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GraduationCap, Mail, Lock, User, ExternalLink, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';
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
    { value: 'login', label: 'Sign In' },
    { value: 'register', label: 'Create Account' },
    { value: 'verify', label: 'Verify Email' },
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
        setSuccessMsg('Account created successfully! Check Mailpit (http://localhost:8025) for your verification token.');
      } else if (mode === 'verify') {
        await verifyEmail(email, token.trim());
        setSuccessMsg('Email confirmed successfully! You can now sign in.');
        setMode('login');
      }
    } catch (err: any) {
      setError(err.message || 'Authentication error occurred.');
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
      <Card className="p-8 sm:p-10 shadow-apple-lg apple-specular border border-black/[0.08] dark:border-white/[0.12]">
          
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-tr from-[#0071e3] to-[#5856d6] flex items-center justify-center text-white shadow-apple-md">
              <GraduationCap className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-[#1d1d1f] dark:text-[#f5f5f7]">
              English Master
            </h1>
            <p className="text-[13px] text-[#86868b] dark:text-[#a1a1a6] mt-1.5 leading-relaxed">
              AI-driven Spaced Repetition Language Platform
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
                className="mb-5 p-3.5 rounded-xl bg-[#34c759]/10 border border-[#34c759]/25 text-[#34c759] dark:text-[#30d158] text-[13px] flex items-start gap-2.5"
              >
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{successMsg}</span>
              </motion.div>
            )}

            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-5 p-3.5 rounded-xl bg-[#ff3b30]/10 border border-[#ff3b30]/25 text-[#ff3b30] dark:text-[#ff453a] text-[13px] flex items-start gap-2.5"
              >
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <Input
                  label="Full Name"
                  type="text"
                  required
                  placeholder="e.g. John Appleseed"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  icon={<User className="w-4 h-4" />}
                />
              </div>
            )}

            <div>
              <Input
                label="Email Address"
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
                  label="Password (min 12 chars, upper/lower/number/symbol)"
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
                  <label className="text-[13px] font-medium text-[#86868b] dark:text-[#a1a1a6]">
                    Verification Token
                  </label>
                  <a
                    href="http://localhost:8025"
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-[#0071e3] dark:text-[#2997ff] hover:underline flex items-center gap-1 font-medium"
                  >
                    Open Mailpit Inbox <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <textarea
                  rows={4}
                  required
                  placeholder="Paste the verification token from your email here..."
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  className="w-full rounded-xl bg-black/[0.03] dark:bg-white/[0.06] border border-black/[0.08] dark:border-white/[0.12] p-3 text-[13px] font-mono text-[#1d1d1f] dark:text-[#f5f5f7] focus:outline-none focus:ring-2 focus:ring-[#0071e3]/30 focus:border-[#0071e3] transition-all resize-none"
                />
              </div>
            )}

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={loading}
                className="w-full text-base font-semibold py-3"
              >
                {mode === 'login'
                  ? 'Sign In'
                  : mode === 'register'
                  ? 'Create Account'
                  : 'Verify Account'}
              </Button>
            </div>
          </form>

          {/* Footer security note */}
          <div className="mt-8 pt-6 border-t border-black/[0.06] dark:border-white/[0.08] flex items-center justify-center gap-2 text-xs text-[#86868b]">
            <ShieldCheck className="w-4 h-4 text-[#34c759]" />
            <span>Secured with OpenID Connect & NIST-grade crypto</span>
          </div>

        </Card>
      </motion.div>
  );
};
