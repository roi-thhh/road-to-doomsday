'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserProfile, RoleSelection } from '@/lib/types';
import { 
  supabase, 
  isSupabaseConfigured, 
  saveDbUserProfile, 
  updateDbPartnerLink 
} from '@/lib/supabase';
import { 
  X, 
  Lock, 
  Mail, 
  UserCheck, 
  Heart, 
  Sparkles, 
  CheckCircle2, 
  ShieldAlert, 
  Key, 
  Link as LinkIcon,
  Info
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  role: RoleSelection | null;
  currentUserProfile: UserProfile | null;
  onAuthenticate: (profile: UserProfile) => void;
  onPartnerLinked: (partnerIdOrEmail: string) => void;
  initialMode?: 'signin' | 'signup' | 'partner';
}

export default function AuthModal({
  isOpen,
  onClose,
  role,
  currentUserProfile,
  onAuthenticate,
  onPartnerLinked,
  initialMode = 'signin',
}: AuthModalProps) {
  const [activeTab, setActiveTab] = useState<'signin' | 'signup' | 'partner'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [partnerIdOrEmail, setPartnerIdOrEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (initialMode) setActiveTab(initialMode);
  }, [initialMode]);

  useEffect(() => {
    if (currentUserProfile?.partnerId || currentUserProfile?.partnerEmail) {
      setPartnerIdOrEmail(currentUserProfile.partnerId || currentUserProfile.partnerEmail || '');
    }
  }, [currentUserProfile]);

  if (!isOpen) return null;

  const isConfigured = isSupabaseConfigured();

  // Submit Sign In or Sign Up Form
  const handleSubmitAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    if (!isConfigured) {
      setErrorMsg('Supabase is not configured yet! Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env.local file or Vercel settings.');
      setLoading(false);
      return;
    }

    try {
      if (activeTab === 'signup') {
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
            partnerId: partnerIdOrEmail.trim() || undefined,
          };

          // Save profile record into Supabase users table
          await saveDbUserProfile(userProf);

          if (partnerIdOrEmail.trim()) {
            onPartnerLinked(partnerIdOrEmail.trim());
          }

          onAuthenticate(userProf);

          if (!data.session) {
            setSuccessMsg('Account registered! Note: If "Confirm Email" is enabled in Supabase, check your inbox or turn off email confirmation in Supabase Dashboard (Auth -> Providers -> Email).');
          } else {
            setSuccessMsg('Account registered & logged in successfully!');
          }
          setTimeout(() => onClose(), 1500);
        }
      } else if (activeTab === 'signin') {
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
            partnerId: partnerIdOrEmail.trim() || undefined,
          };

          await saveDbUserProfile(userProf);

          if (partnerIdOrEmail.trim()) {
            onPartnerLinked(partnerIdOrEmail.trim());
          }

          onAuthenticate(userProf);
          setSuccessMsg('Signed in successfully!');
          setTimeout(() => onClose(), 1000);
        }
      }
    } catch (err: any) {
      const msg = err.message || '';
      if (msg.toLowerCase().includes('email not confirmed')) {
        setErrorMsg('Email not confirmed! Solution: In your Supabase Dashboard -> Auth -> Providers -> Email, turn OFF "Confirm email" to allow instant logins without confirmation links.');
      } else if (msg.toLowerCase().includes('rate limit')) {
        setErrorMsg('Email Rate Limit Exceeded! Solution: Turn OFF "Confirm email" in Supabase Dashboard -> Auth -> Providers -> Email. This disables email verification and bypasses rate limits.');
      } else {
        setErrorMsg(msg || 'Authentication failed. Please check credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Submit Partner Link Form (when logged in or linking partner)
  const handleSubmitPartnerLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!partnerIdOrEmail.trim()) {
      setErrorMsg('Please enter a valid Partner User ID or Email address.');
      return;
    }

    setLoading(true);

    try {
      if (currentUserProfile?.id && isConfigured) {
        const res = await updateDbPartnerLink(currentUserProfile.id, partnerIdOrEmail.trim());
        if (res.success) {
          const updated: UserProfile = {
            ...currentUserProfile,
            partnerId: res.partnerId || partnerIdOrEmail.trim(),
            partnerEmail: res.partnerEmail,
          };
          onAuthenticate(updated);
        }
      }

      onPartnerLinked(partnerIdOrEmail.trim());
      setSuccessMsg('Partner linked & progress overlay updated!');
      setTimeout(() => onClose(), 1200);
    } catch (err: any) {
      setErrorMsg(err.message || 'Could not link partner. Please check User ID or Email.');
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
          className="relative bg-neo-yellow text-black border-8 border-black rounded-2xl p-6 md:p-8 max-w-md w-full shadow-brutal-lg font-sans max-h-[90vh] overflow-y-auto"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-black text-white p-2 border-2 border-black rounded-lg hover:bg-neo-red transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Mode Tabs */}
          <div className="flex bg-black text-white rounded-xl border-4 border-black p-1 mb-6 shadow-brutal-sm">
            <button
              onClick={() => setActiveTab('signin')}
              className={`flex-1 py-2 font-black text-xs uppercase rounded-lg transition-all cursor-pointer ${
                activeTab === 'signin'
                  ? 'bg-neo-yellow text-black shadow-brutal-sm'
                  : 'hover:text-neo-yellow'
              }`}
            >
              SIGN IN
            </button>
            <button
              onClick={() => setActiveTab('signup')}
              className={`flex-1 py-2 font-black text-xs uppercase rounded-lg transition-all cursor-pointer ${
                activeTab === 'signup'
                  ? 'bg-neo-yellow text-black shadow-brutal-sm'
                  : 'hover:text-neo-yellow'
              }`}
            >
              REGISTER
            </button>
            <button
              onClick={() => setActiveTab('partner')}
              className={`flex-1 py-2 font-black text-xs uppercase rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1 ${
                activeTab === 'partner'
                  ? 'bg-neo-pink text-black shadow-brutal-sm'
                  : 'hover:text-neo-pink'
              }`}
            >
              <Heart className="w-3.5 h-3.5 fill-current" /> PARTNER
            </button>
          </div>

          {!isConfigured && (
            <div className="mb-4 bg-neo-orange text-black p-3.5 rounded-xl border-4 border-black text-xs font-bold flex flex-col gap-1.5 shadow-brutal-sm">
              <div className="flex items-center gap-2 text-sm font-black">
                <Key className="w-4 h-4 shrink-0" /> SUPABASE CREDENTIALS REQUIRED
              </div>
              <p className="text-[11px] leading-relaxed">
                Add your <code className="bg-black text-white px-1 py-0.5 rounded">NEXT_PUBLIC_SUPABASE_URL</code> and <code className="bg-black text-white px-1 py-0.5 rounded">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> to your environment settings to enable live backend database sync!
              </p>
            </div>
          )}

          {errorMsg && (
            <div className="mb-4 bg-neo-red text-white p-3 rounded-lg border-4 border-black text-xs font-bold flex flex-col gap-1 shadow-brutal-sm">
              <div className="flex items-center gap-2 font-black">
                <ShieldAlert className="w-4 h-4 shrink-0" /> AUTH ERROR
              </div>
              <p className="text-[11px] leading-relaxed">{errorMsg}</p>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 bg-neo-green text-black p-3 rounded-lg border-4 border-black text-xs font-bold flex items-center gap-2 shadow-brutal-sm">
              <CheckCircle2 className="w-4 h-4 shrink-0" /> {successMsg}
            </div>
          )}

          {/* TAB 1 & 2: SIGN IN & REGISTER */}
          {(activeTab === 'signin' || activeTab === 'signup') && (
            <form onSubmit={handleSubmitAuth} className="flex flex-col gap-4">
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

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={loading}
                type="submit"
                className="mt-2 bg-neo-red text-white py-3 border-4 border-black rounded-lg font-black uppercase text-base shadow-brutal hover:bg-black hover:text-neo-yellow transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? 'Authenticating...' : activeTab === 'signup' ? 'CREATE ACCOUNT & SYNC ⚡' : 'LOG IN TO SUPABASE 🛡️'}
              </motion.button>
            </form>
          )}

          {/* TAB 3: LINK PARTNER */}
          {activeTab === 'partner' && (
            <form onSubmit={handleSubmitPartnerLink} className="flex flex-col gap-4">
              <div className="bg-white border-4 border-black p-4 rounded-xl shadow-brutal-sm">
                <h3 className="text-sm font-black uppercase mb-1 flex items-center gap-1.5">
                  <LinkIcon className="w-4 h-4 text-neo-red" /> PARTNER SYNCHRONIZATION
                </h3>
                <p className="text-xs text-black/80 leading-relaxed font-medium">
                  Enter your partner&apos;s **User Sync ID** or **Email Address** below to link your timeline progress!
                </p>
              </div>

              <div>
                <label className="block text-xs font-black uppercase mb-1">Partner User ID or Email</label>
                <div className="relative">
                  <Heart className="absolute left-3 top-3 w-4 h-4 text-neo-red fill-current" />
                  <input
                    type="text"
                    required
                    placeholder="partner@marvel.com or USR-8921"
                    value={partnerIdOrEmail}
                    onChange={(e) => setPartnerIdOrEmail(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 bg-white border-4 border-black rounded-lg font-bold text-sm focus:outline-none focus:ring-4 focus:ring-black shadow-brutal-sm"
                  />
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={loading}
                type="submit"
                className="mt-2 bg-neo-pink text-black py-3 border-4 border-black rounded-lg font-black uppercase text-base shadow-brutal hover:bg-black hover:text-white transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? 'Linking Partner...' : 'LINK & OVERLAY TIMELINE ⚡'}
              </motion.button>
            </form>
          )}

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
