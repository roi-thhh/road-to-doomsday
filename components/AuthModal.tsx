'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserProfile, RoleSelection, PartnerRequest } from '@/lib/types';
import { 
  supabase, 
  isSupabaseConfigured, 
  saveDbUserProfile, 
  sendPartnerRequest, 
  fetchPendingPartnerRequests, 
  acceptPartnerRequest, 
  declinePartnerRequest, 
  unlinkPartner 
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
  UserPlus,
  Check,
  Ban,
  Unlink
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  role: RoleSelection | null;
  currentUserProfile: UserProfile | null;
  onAuthenticate: (profile: UserProfile) => void;
  onPartnerLinked: (partnerIdOrEmail: string) => void;
  onPartnerUnlinked: () => void;
  initialMode?: 'signin' | 'signup' | 'partner';
}

export default function AuthModal({
  isOpen,
  onClose,
  role,
  currentUserProfile,
  onAuthenticate,
  onPartnerLinked,
  onPartnerUnlinked,
  initialMode = 'signin',
}: AuthModalProps) {
  const [activeTab, setActiveTab] = useState<'signin' | 'signup' | 'partner'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [targetPartnerEmail, setTargetPartnerEmail] = useState('');
  const [pendingRequests, setPendingRequests] = useState<PartnerRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (initialMode) setActiveTab(initialMode);
  }, [initialMode]);

  // Load incoming requests when modal opens
  useEffect(() => {
    async function loadRequests() {
      if (currentUserProfile?.email) {
        const reqs = await fetchPendingPartnerRequests(currentUserProfile.email);
        setPendingRequests(reqs);
      }
    }
    if (isOpen) {
      loadRequests();
    }
  }, [isOpen, currentUserProfile]);

  if (!isOpen) return null;

  const isConfigured = isSupabaseConfigured();
  const isPartnerConnected = Boolean(currentUserProfile?.partnerId || currentUserProfile?.partnerEmail);

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
          };

          await saveDbUserProfile(userProf);
          onAuthenticate(userProf);

          setSuccessMsg('Account created & logged in! You can now send a partner request.');
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
          // Fetch existing profile to preserve partner_id and role
          const dbProfile = await fetchDbUserProfile(data.user.id);
          
          const userProf: UserProfile = dbProfile || {
            id: data.user.id,
            email: data.user.email || email,
            roleSelection: role,
          };

          // Only save to DB if they somehow don't have a profile
          if (!dbProfile) {
            await saveDbUserProfile(userProf);
          }
          
          onAuthenticate(userProf);

          setSuccessMsg('Signed in successfully!');
          setTimeout(() => onClose(), 1000);
        }
      }
    } catch (err: any) {
      const msg = err.message || '';
      if (msg.toLowerCase().includes('email not confirmed')) {
        setErrorMsg('Email not confirmed! Solution: In your Supabase Dashboard -> Auth -> Providers -> Email, turn OFF "Confirm email" to allow instant logins.');
      } else if (msg.toLowerCase().includes('rate limit')) {
        setErrorMsg('Email Rate Limit Exceeded! Solution: Turn OFF "Confirm email" in Supabase Dashboard -> Auth -> Providers -> Email.');
      } else {
        setErrorMsg(msg || 'Authentication failed. Please check credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Submit Partner Invite Request
  const handleSendPartnerRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!currentUserProfile?.id || !currentUserProfile?.email) {
      setErrorMsg('You must be signed in to send a partner request!');
      return;
    }

    if (!targetPartnerEmail.trim()) {
      setErrorMsg('Please enter your partner\'s email address.');
      return;
    }

    setLoading(true);

    try {
      const res = await sendPartnerRequest(
        currentUserProfile.id,
        currentUserProfile.email,
        targetPartnerEmail.trim()
      );

      if (!res.success) {
        setErrorMsg(res.error || 'Failed to send request.');
      } else {
        setSuccessMsg(`Partner request sent to ${targetPartnerEmail.trim()}! They can now accept it inside their account.`);
        setTargetPartnerEmail('');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred sending request.');
    } finally {
      setLoading(false);
    }
  };

  // Accept Partner Request
  const handleAcceptRequest = async (req: PartnerRequest) => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await acceptPartnerRequest(req);
      if (res.success) {
        setSuccessMsg(`Partner request accepted! You are now connected with ${req.senderEmail}.`);
        onPartnerLinked(req.senderId);
        setPendingRequests((prev) => prev.filter((r) => r.id !== req.id));
        setTimeout(() => onClose(), 1500);
      } else {
        setErrorMsg(res.error || 'Failed to accept request.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error accepting request.');
    } finally {
      setLoading(false);
    }
  };

  // Decline Partner Request
  const handleDeclineRequest = async (requestId: string) => {
    await declinePartnerRequest(requestId);
    setPendingRequests((prev) => prev.filter((r) => r.id !== requestId));
  };

  // Unlink Connected Partner
  const handleUnlink = async () => {
    if (currentUserProfile?.id) {
      await unlinkPartner(currentUserProfile.id, currentUserProfile.partnerId || '');
      onPartnerUnlinked();
      setSuccessMsg('Partner unlinked.');
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
              className={`flex-1 py-2 font-black text-xs uppercase rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1 relative ${
                activeTab === 'partner'
                  ? 'bg-neo-pink text-black shadow-brutal-sm'
                  : 'hover:text-neo-pink'
              }`}
            >
              <Heart className="w-3.5 h-3.5 fill-current" /> PARTNER
              {pendingRequests.length > 0 && (
                <span className="absolute -top-2 -right-1 bg-neo-red text-white text-[9px] font-black px-1.5 py-0.5 rounded-full border border-black animate-pulse">
                  {pendingRequests.length}
                </span>
              )}
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
                <ShieldAlert className="w-4 h-4 shrink-0" /> ERROR
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
            currentUserProfile ? (
              <div className="flex flex-col gap-4">
                <div className="bg-gray-100 border-4 border-black p-5 rounded-2xl shadow-brutal-sm flex flex-col gap-3 text-center">
                  <h3 className="text-sm font-black uppercase text-black">You are already signed in</h3>
                  <div>
                    <label className="block text-xs font-black uppercase mb-1 text-left">Your Email Address</label>
                    <input
                      type="text"
                      disabled
                      value={currentUserProfile.email}
                      className="w-full px-3 py-2 bg-gray-200 border-2 border-black rounded-lg font-black text-xs text-black/70 cursor-not-allowed select-all"
                    />
                  </div>
                  <p className="text-[10px] font-bold text-black/60">
                    If you want to sign in to a different account, please log out first using the control bar.
                  </p>
                </div>
              </div>
            ) : (
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

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={loading}
                  type="submit"
                  className="mt-2 bg-neo-red text-white py-3 border-4 border-black rounded-lg font-black uppercase text-base shadow-brutal hover:bg-black hover:text-neo-yellow transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {loading ? 'Authenticating...' : activeTab === 'signup' ? 'CREATE ACCOUNT ⚡' : 'SIGN IN 🛡️'}
                </motion.button>
              </form>
            )
          )}

          {/* TAB 3: PARTNER LINK & REQUESTS */}
          {activeTab === 'partner' && (
            <div className="flex flex-col gap-5">
              {/* 1. Pending Partner Requests List */}
              {pendingRequests.length > 0 && (
                <div className="bg-neo-red text-white border-4 border-black p-4 rounded-xl shadow-brutal-sm flex flex-col gap-3">
                  <span className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                    <Heart className="w-4 h-4 fill-current animate-bounce" /> INCOMING PARTNER REQUEST
                  </span>
                  {pendingRequests.map((req) => (
                    <div key={req.id} className="bg-white text-black p-3 rounded-lg border-2 border-black flex items-center justify-between gap-2">
                      <div className="text-left">
                        <span className="block text-[10px] font-black text-black/60">FROM</span>
                        <span className="text-xs font-black text-neo-red">{req.senderEmail}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleAcceptRequest(req)}
                          className="bg-neo-green text-black px-2.5 py-1 rounded border border-black font-black text-[10px] uppercase flex items-center gap-1 hover:scale-105 cursor-pointer"
                        >
                          <Check className="w-3 h-3" /> ACCEPT
                        </button>
                        <button
                          onClick={() => handleDeclineRequest(req.id)}
                          className="bg-gray-200 text-black px-2 py-1 rounded border border-black font-black text-[10px] uppercase hover:bg-neo-red hover:text-white cursor-pointer"
                        >
                          <Ban className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* 2. Connected Partner Status (LOCKED & GREYED OUT) */}
              {isPartnerConnected ? (
                <div className="bg-gray-100 border-4 border-black p-5 rounded-2xl shadow-brutal-sm flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="bg-neo-green text-black px-3 py-1 rounded-full border-2 border-black font-black text-xs uppercase flex items-center gap-1 shadow-brutal-sm">
                      <CheckCircle2 className="w-4 h-4 text-black" /> PARTNER CONNECTED
                    </span>
                    <button
                      onClick={handleUnlink}
                      className="bg-neo-red text-white px-2.5 py-1 rounded-lg border-2 border-black font-black text-[10px] uppercase flex items-center gap-1 hover:bg-black cursor-pointer shadow-brutal-sm"
                      title="Unlink current partner"
                    >
                      <Unlink className="w-3 h-3" /> UNLINK
                    </button>
                  </div>

                  <div>
                    <span className="block text-[10px] font-black uppercase text-black/60">CONNECTED EMAIL</span>
                    <input
                      type="text"
                      disabled
                      value={currentUserProfile?.partnerEmail || currentUserProfile?.partnerId || 'Partner Account Linked'}
                      className="w-full mt-1 px-3 py-2 bg-gray-200 border-2 border-black rounded-lg font-black text-xs text-black/70 cursor-not-allowed select-all"
                    />
                  </div>

                  <p className="text-[10px] font-bold text-black/70 leading-relaxed">
                    🔒 Your timeline is actively synchronized with your partner! Progress changes reflect live on both accounts.
                  </p>
                </div>
              ) : (
                /* 3. Send Request Form (when not connected) */
                <form onSubmit={handleSendPartnerRequest} className="flex flex-col gap-4">
                  <div className="bg-white border-4 border-black p-4 rounded-xl shadow-brutal-sm">
                    <h3 className="text-sm font-black uppercase mb-1 flex items-center gap-1.5">
                      <UserPlus className="w-4 h-4 text-neo-red" /> SEND PARTNER REQUEST
                    </h3>
                    <p className="text-xs text-black/80 leading-relaxed font-medium">
                      Enter your partner&apos;s email address to send a link request. <span className="font-black text-neo-red underline">They must already have an account!</span>
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase mb-1">Partner Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 w-4 h-4 text-black/60" />
                      <input
                        type="email"
                        required
                        placeholder="girlfriend@marvel.com or boyfriend@marvel.com"
                        value={targetPartnerEmail}
                        onChange={(e) => setTargetPartnerEmail(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 bg-white border-4 border-black rounded-lg font-bold text-sm focus:outline-none focus:ring-4 focus:ring-black shadow-brutal-sm"
                      />
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={loading}
                    type="submit"
                    className="mt-1 bg-neo-pink text-black py-3 border-4 border-black rounded-lg font-black uppercase text-base shadow-brutal hover:bg-black hover:text-white transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {loading ? 'Sending Request...' : 'SEND PARTNER REQUEST ⚡'}
                  </motion.button>
                </form>
              )}

            </div>
          )}

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
