import React, { useState } from 'react';
import { X, Lock, Mail, User as UserIcon, Phone, Flame, ArrowRight, ShieldCheck, Bike, Headphones, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, defaultMode = 'login' }) => {
  const { login, register, quickSwitch } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>(defaultMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        await register(name, email, password, phone);
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickSwitch = async (role: 'customer' | 'admin' | 'rider' | 'support') => {
    setError(null);
    setLoading(true);
    try {
      await quickSwitch(role);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Quick login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-neutral-900 border border-neutral-800 shadow-2xl">
        {/* Top Header */}
        <div className="relative bg-gradient-to-br from-neutral-900 via-neutral-950 to-neutral-900 p-6 border-b border-neutral-800">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-neutral-400 hover:text-white p-2 rounded-lg hover:bg-neutral-800 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-9 h-9 rounded-xl bg-amber-400 flex items-center justify-center text-neutral-950 shadow-md">
              <Flame className="w-5 h-5 fill-neutral-950" />
            </div>
            <div>
              <span className="font-display font-extrabold text-lg tracking-wider text-white">
                SNACK <span className="text-amber-400">FUEL</span>
              </span>
            </div>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            {mode === 'login' ? 'Welcome Back!' : 'Fuel Your Account'}
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            {mode === 'login'
              ? 'Access your orders, saved addresses, and favorite meals.'
              : 'Join Snack Fuel for fast ordering, live tracking and rewards.'}
          </p>
        </div>

        {/* Demo Fast Logins banner */}
        <div className="bg-neutral-950/70 p-4 border-b border-neutral-800/80">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-400 mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>1-Click Demo Login (Instant Role Testing):</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => handleQuickSwitch('admin')}
              className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-neutral-800 hover:bg-amber-400 hover:text-neutral-950 text-neutral-200 font-medium transition-colors border border-neutral-700/60"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin Portal</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickSwitch('rider')}
              className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-neutral-800 hover:bg-amber-400 hover:text-neutral-950 text-neutral-200 font-medium transition-colors border border-neutral-700/60"
            >
              <Bike className="w-3.5 h-3.5" />
              <span>Rider Portal</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickSwitch('support')}
              className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-neutral-800 hover:bg-amber-400 hover:text-neutral-950 text-neutral-200 font-medium transition-colors border border-neutral-700/60"
            >
              <Headphones className="w-3.5 h-3.5" />
              <span>Support Agent</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickSwitch('customer')}
              className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-neutral-800 hover:bg-amber-400 hover:text-neutral-950 text-neutral-200 font-medium transition-colors border border-neutral-700/60"
            >
              <UserIcon className="w-3.5 h-3.5" />
              <span>Customer Demo</span>
            </button>
          </div>
        </div>

        {/* Mode Switch Tabs (Sign In vs New User / Register) */}
        <div className="flex border-b border-neutral-800 bg-neutral-950/40 p-1.5 gap-1.5">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError(null);
            }}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              mode === 'login'
                ? 'bg-amber-400 text-neutral-950 shadow-md shadow-amber-400/20'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Sign In (Existing User)</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setError(null);
            }}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              mode === 'register'
                ? 'bg-amber-400 text-neutral-950 shadow-md shadow-amber-400/20'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>New User (Register Free)</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 text-xs text-rose-300 bg-rose-950/40 border border-rose-800/60 rounded-xl space-y-2">
              <p>{error}</p>
              {mode === 'login' && (
                <button
                  type="button"
                  onClick={() => {
                    setMode('register');
                    setError(null);
                  }}
                  className="inline-flex items-center gap-1.5 text-[11px] font-bold text-amber-400 hover:text-amber-300 underline cursor-pointer"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>New user? Click here to register your account now</span>
                </button>
              )}
            </div>
          )}

          {mode === 'register' && (
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                Full Name <span className="text-amber-400">*</span>
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Zain Basra"
                  className="w-full pl-10 pr-4 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-colors"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@domain.com"
                className="w-full pl-10 pr-4 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-colors"
              />
            </div>
          </div>

          {mode === 'register' && (
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1.5">Phone Number</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+92 300 1234567"
                  className="w-full pl-10 pr-4 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-colors"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1.5">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-colors"
              />
            </div>
          </div>

          {mode === 'login' && (
            <div className="p-3 rounded-xl bg-neutral-950/80 border border-neutral-800 text-[11px] text-neutral-400">
              <span className="text-neutral-300 font-semibold">Demo Credentials:</span>{' '}
              <span className="text-amber-400 font-mono">customer@snackfuel.com</span> / <span className="text-amber-400 font-mono">password123</span>
              <p className="text-[10px] text-neutral-500 mt-0.5">Or click any 1-Click Demo role button at the top.</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-amber-400/20 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 cursor-pointer"
          >
            <span>{loading ? 'Processing...' : mode === 'login' ? 'Sign In to Snack Fuel' : 'Create Free Account'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          {/* Toggle login / register */}
          <div className="pt-2 text-center text-xs text-neutral-400">
            {mode === 'login' ? (
              <span>
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => setMode('register')}
                  className="text-amber-400 font-semibold hover:underline"
                >
                  Create one now
                </button>
              </span>
            ) : (
              <span>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="text-amber-400 font-semibold hover:underline"
                >
                  Sign in
                </button>
              </span>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
