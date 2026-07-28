'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserProfile, RoleSelection } from '@/lib/types';
import { supabase, isSupabaseConfigured, saveDbUserProfile } from '@/lib/supabase';
import { X, Lock, Mail, UserCheck, Heart, Sparkles, CheckCircle2, ShieldAlert, Key } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  role: RoleSelection | null;
  onAuthenticate: (profile: UserProfile) => void;
}

export default function AuthModal({ isOpen, onClose, role, onAuthenticate }: AuthModalProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [partnerIdOrEmail, setPartnerIdOrEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const isConfigured = isSupabaseConfigured();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    if (!isConfigured) {
      setErrorMsg('Supabase is not configured yet! Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env.local file.');
      setLoading(false);
      return;
    }

    try {
      if (isSignUp) {
        // Real Supabase User Registration
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) throw error;

        if (data.user) {
          const userProf: UserProfile = {
            id: data.user.id,
            email: data.user.email || email,
            roleSelection: role,
            partnerId: partnerIdOrEmail ? partnerIdOrEmail : undefined,
          };

          // Save profile record into Supabase users table
          await saveDbUserProfile(userProf);

          onAuthenticate(userProf);
          setSuccessMsg('Account registered & partner linked successfully!');
          setTimeout(() => onClose(), 1000);
        }
      } else {
        // Real Supabase User Sign In
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        if (data.user) {
          const userProf: UserProfile = {
            id: data.user.id,
            email: data.user.email || email,
            roleSelection: role,
            partnerId: partnerIdOrEmail ? partnerIdOrEmail : undefined,
          };

          // Update user profile in Supabase table
          await saveDbUserProfile(userProf);

          onAuthenticate(userProf);
          setSuccessMsg('Signed in successfully to Supabase Backend!');
          setTimeout(() => onClose(), 1000);
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative bg-neo-yellow text-black border-8 border-black rounded-2xl p-6 md:p-8 max-w-md w-full shadow-brutal-lg font-sans"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-black text-white p-2 border-2 border-black rounded-lg hover:bg-neo-red transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="mb-6 text-center">
            <span className="inline-flex items-center gap-1.5 bg-neo-red text-white px-3 py-1 border-2 border-black rounded-full text-xs font-black uppercase mb-2 shadow-brutal-sm">
              <Heart className="w-3.5 h-3.5 fill-current" /> SUPABASE REAL AUTH
            </span>
            <h2 className="text-3xl font-black uppercase tracking-tight font-display">
              {isSignUp ? 'CREATE ACCOUNT' : 'SUPABASE LOGIN'}
            </h2>
            <p className="text-xs font-bold text-black/80 mt-1">
              Selected Role: <span className="bg-black text-neo-yellow px-2 py-0.5 rounded font-black uppercase">{role || 'AVENGER'}</span>
            </p>
          </div>

          {!isConfigured && (
            <div className="mb-4 bg-neo-orange text-black p-3.5 rounded-xl border-4 border-black text-xs font-bold flex flex-col gap-1.5 shadow-brutal-sm">
              <div className="flex items-center gap-2 text-sm font-black">
                <Key className="w-4 h-4 shrink-0" /> SUPABASE CREDENTIALS REQUIRED
              </div>
              <p className="text-[11px] leading-relaxed">
                Add your <code className="bg-black text-white px-1 py-0.5 rounded">NEXT_PUBLIC_SUPABASE_URL</code> and <code className="bg-black text-white px-1 py-0.5 rounded">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> to your <code className="bg-black text-white px-1 py-0.5 rounded">.env.local</code> file to enable live backend login!
              </p>
            </div>
          )}

          {errorMsg && (
            <div className="mb-4 bg-neo-red text-white p-3 rounded-lg border-4 border-black text-xs font-bold flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0" /> {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="mb-4 bg-neo-green text-black p-3 rounded-lg border-4 border-black text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" /> {successMsg}
            </div>
          )}

          {/* Real Auth Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-black uppercase mb-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-4 h-4 text-black/60" />
                <input
                  type="email"
                  required
                  placeholder="avenger@marvel.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-white border-4 border-black rounded-lg font-bold text-sm focus:outline-none focus:ring-4 focus:ring-black shadow-brutal-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black uppercase mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-4 h-4 text-black/60" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-white border-4 border-black rounded-lg font-bold text-sm focus:outline-none focus:ring-4 focus:ring-black shadow-brutal-sm"
                />
              </div>
            </div>

            {/* Partner Linking Field */}
            {isSignUp && (
              <div>
                <label className="block text-xs font-black uppercase mb-1">
                  Partner User ID or Email <span className="text-neo-red">(Optional)</span>
                </label>
                <div className="relative">
                  <Heart className="absolute left-3 top-3 w-4 h-4 text-neo-red" />
                  <input
                    type="text"
                    placeholder="partner@marvel.com or USR-8921"
                    value={partnerIdOrEmail}
                    onChange={(e) => setPartnerIdOrEmail(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 bg-white border-4 border-black rounded-lg font-bold text-sm focus:outline-none focus:ring-4 focus:ring-black shadow-brutal-sm"
                  />
                </div>
                <p className="text-[10px] font-bold text-black/70 mt-1">
                  Links accounts in Supabase database so your partner&apos;s watch progress overlays automatically.
                </p>
              </div>
            )}

            {/* Submit Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={loading}
              type="submit"
              className="mt-2 bg-neo-red text-white py-3 border-4 border-black rounded-lg font-black uppercase text-base shadow-brutal hover:bg-black hover:text-neo-yellow transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? 'Authenticating with Backend...' : isSignUp ? 'SIGN UP & SYNC DATABASE ⚡' : 'LOG IN TO SUPABASE 🛡️'}
            </motion.button>
          </form>

          {/* Toggle Sign In / Register */}
          <div className="mt-4 pt-4 border-t-2 border-black flex flex-col items-center gap-3 text-center">
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-xs font-black uppercase text-black hover:underline"
            >
              {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Register Now"}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
