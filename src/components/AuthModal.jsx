import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, User, Phone, Tag, ArrowRight, ShieldCheck, AlertCircle, Loader2 } from 'lucide-react';
import { supabase, isAdminEmail, createAdminProfile } from '../lib/supabaseClient';

/**
 * AuthModal Component
 * Handles User Sign Up (Name, Email, Phone, Password, Referral Code) and Sign In.
 * Enforces Kenyan phone formatting, URL referral extraction, and banned user blocking.
 */
export default function AuthModal({
  isOpen,
  onClose,
  initialMode = 'signup', // 'signup' | 'signin'
  onAuthSuccess
}) {
  const [mode, setMode] = useState(initialMode);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Auto-detect referral code from URL if present (e.g. ?ref=KE-DAVE88)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const ref = params.get('ref') || params.get('referral');
      if (ref) {
        setReferralCode(ref.toUpperCase());
      }
    }
  }, []);

  useEffect(() => {
    setMode(initialMode);
    setErrorMsg('');
  }, [initialMode, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      if (mode === 'signup') {
        // Validation
        if (!fullName.trim()) throw new Error('Please enter your full official name.');
        if (!email.trim() || !email.includes('@')) throw new Error('Please provide a valid email address.');

        // Clean phone input
        let cleanedPhone = phone.trim().replace(/\s+/g, '');
        if (cleanedPhone.startsWith('0')) {
          cleanedPhone = '+254' + cleanedPhone.substring(1);
        } else if (!cleanedPhone.startsWith('+')) {
          cleanedPhone = '+' + cleanedPhone;
        }

        if (cleanedPhone.length < 10) {
          throw new Error('Please provide a valid Kenyan phone number (e.g. 0712 345 678).');
        }

        if (password.length < 6) {
          throw new Error('Password must be at least 6 characters long.');
        }

        const { data, error } = await supabase.auth.signUp({
          email: email.trim().toLowerCase(),
          password,
          options: {
            data: {
              full_name: fullName.trim(),
              phone: cleanedPhone,
              referred_by: referralCode.trim() ? referralCode.trim().toUpperCase() : null
            }
          }
        });

        if (error) throw error;

        // Fetch created profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('email', email.trim().toLowerCase())
          .single();

        if (onAuthSuccess) onAuthSuccess(profile || data?.user);
        onClose();
      } else {
        // Sign In
        if (!email.trim() || !password) {
          throw new Error('Please enter both your email address and password.');
        }

        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim().toLowerCase(),
          password
        });

        if (error) throw error;

        // Fetch user profile
        const { data: profile, error: profileErr } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (profileErr && !isAdminEmail(data.user.email)) throw profileErr;

        const resolvedProfile = profile || (
          isAdminEmail(data.user.email) ? createAdminProfile(data.user) : null
        );

        if (resolvedProfile?.is_banned) {
          throw new Error(`ACCESS PERMANENTLY SUSPENDED: ${resolvedProfile.ban_reason || '48-hour training window expired.'}`);
        }

        if (onAuthSuccess) onAuthSuccess(resolvedProfile);
        onClose();
      }
    } catch (err) {
      setErrorMsg(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-md overflow-hidden bg-[#0d1527] border border-white/10 rounded-2xl shadow-2xl text-slate-100"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-slate-900/50">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-brand-500/20 border border-brand-500/40 flex items-center justify-center text-brand-400 font-bold text-sm">
                R
              </div>
              <span className="font-bold text-base text-white">RemotelyKE Auth</span>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Mode Switcher */}
          <div className="grid grid-cols-2 p-1.5 mx-6 mt-4 bg-slate-950/70 border border-white/10 rounded-xl gap-1">
            <button
              type="button"
              onClick={() => { setMode('signup'); setErrorMsg(''); }}
              className={`py-2 text-xs font-bold rounded-lg transition-all ${mode === 'signup'
                  ? 'bg-brand-500 text-slate-950 shadow-md shadow-brand-500/20'
                  : 'text-slate-400 hover:text-white'
                }`}
            >
              Create Account
            </button>
            <button
              type="button"
              onClick={() => { setMode('signin'); setErrorMsg(''); }}
              className={`py-2 text-xs font-bold rounded-lg transition-all ${mode === 'signin'
                  ? 'bg-brand-500 text-slate-950 shadow-md shadow-brand-500/20'
                  : 'text-slate-400 hover:text-white'
                }`}
            >
              Sign In
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 pt-4 space-y-3.5">
            {errorMsg && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-red-950/70 border border-red-500/50 rounded-xl flex items-start space-x-2.5 text-xs text-red-200"
              >
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                <span className="leading-relaxed">{errorMsg}</span>
              </motion.div>
            )}

            {mode === 'signup' && (
              <>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Grace Wambui"
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900/90 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-brand-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Kenyan Phone Number (M-Pesa)</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="0712 345 678 or 254..."
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900/90 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-brand-500"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900/90 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900/90 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>

            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center justify-between">
                  <span>Referral Code (Optional)</span>
                  <span className="text-[10px] text-brand-400 font-semibold">+50 Coins to Inviter</span>
                </label>
                <div className="relative">
                  <Tag className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    value={referralCode}
                    onChange={(e) => setReferralCode(e.target.value)}
                    placeholder="e.g. KE-DAVE88"
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900/90 border border-white/10 text-white placeholder-slate-500 text-sm uppercase tracking-wider font-mono focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 rounded-xl bg-brand-500 hover:bg-brand-400 text-slate-950 font-bold text-sm shadow-lg shadow-brand-500/20 flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <span>{mode === 'signup' ? 'Create Account & Continue' : 'Sign In to Dashboard'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {mode === 'signup' && (
              <div className="pt-2 text-center text-[11px] text-slate-400">
                <span>By registering, you agree to the 48-Hour Training policy and Kenyan remote work guidelines.</span>
              </div>
            )}
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
