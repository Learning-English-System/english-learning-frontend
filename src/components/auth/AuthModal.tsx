import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, ExternalLink, ShieldCheck, CheckCircle2, AlertCircle, Cpu } from 'lucide-react';
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
    { value: 'login', label: 'Access' },
    { value: 'register', label: 'Initialize' },
    { value: 'verify', label: 'Validate' },
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
        setSuccessMsg('Account registered. Access token dispatched to local dev inbox (http://localhost:8025).');
      } else if (mode === 'verify') {
        await verifyEmail(email, token.trim());
        setSuccessMsg('Token validated. Neural identity authorized.');
        setMode('login');
      }
    } catch (err: any) {
      setError(err.message || 'Authentication sequence failed.');
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
      <Card className="p-8 sm:p-10 border-white/[0.08] bg-[#0c0e12]/90 shadow-[0_25px_60px_rgba(0,0,0,0.8)] backdrop-blur-xl">
          
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-12 h-12 mx-auto mb-3.5 rounded-xl bg-black border border-[var(--neural-cyan)]/30 text-[var(--neural-cyan)] flex items-center justify-center shadow-[0_0_20px_rgba(0,240,255,0.2)] select-none">
              <Cpu className="w-6 h-6 animate-pulse" />
            </div>
            <h1 className="font-tech text-2xl font-bold tracking-tight text-white">
              SYNAPSE // NEURAL
            </h1>
            <p className="text-[11px] font-mono text-stone-400 mt-1 uppercase tracking-wider">
              COGNITIVE LINGUISTIC ARCHITECTURE
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
                className="mb-5 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-mono flex items-start gap-2.5"
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
                className="mb-5 p-3 rounded-lg bg-red-500/10 border border-red-500/25 text-red-400 text-xs font-mono flex items-start gap-2.5"
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
                  label="Subject Identity"
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
                label="Electronic Address"
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
                  label="Security Credential"
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
                  <label className="text-xs font-mono text-stone-400 uppercase tracking-wider">
                    Validation Token
                  </label>
                  <a
                    href="http://localhost:8025"
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-[var(--neural-cyan)] hover:underline flex items-center gap-1 font-mono"
                  >
                    Mailpit Local <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <textarea
                  rows={4}
                  required
                  placeholder="Paste verification token payload..."
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  className="w-full rounded-lg bg-black/40 border border-white/[0.08] p-3 text-xs font-mono text-stone-200 focus:outline-none focus:border-[var(--neural-cyan)] transition-all resize-none"
                />
              </div>
            )}

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={loading}
                className="w-full text-xs font-mono uppercase tracking-wider py-3 rounded-lg"
              >
                {mode === 'login'
                  ? 'Authenticate Session'
                  : mode === 'register'
                  ? 'Register Neural Identity'
                  : 'Validate Token'}
              </Button>
            </div>
          </form>

          {/* Footer security note */}
          <div className="mt-8 pt-6 border-t border-white/[0.08] flex items-center justify-center gap-2 text-xs font-mono text-stone-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>OpenIddict Token Families & SHA-256</span>
          </div>

        </Card>
      </motion.div>
  );
};
