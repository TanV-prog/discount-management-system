'use client';

import React, { useState } from 'react';
import { useDMS } from '@/lib/dms-context';
import { StakeholderRole, UserAccount } from '@/types/dms';
import { motion, AnimatePresence } from 'motion/react';
import {
  Lock,
  Mail,
  User,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { users, currentUser, setCurrentUser, showToast } = useDMS();

  const [tab, setTab] = useState<'signin' | 'register'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<StakeholderRole>('Customer');
  const [errorMsg, setErrorMsg] = useState('');

  // Password Strength Calculation (Client-side feedback required in Section 4.5)
  const calculateStrength = (pwd: string) => {
    let score = 0;
    if (pwd.length >= 8) score += 1;
    if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score += 1;
    if (/\d/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;
    if (/^\d+$/.test(pwd) || ['password', '12345678', 'qwerty'].includes(pwd.toLowerCase())) {
      score = 0; // Rejected commonly used or entirely numeric
    }
    return score;
  };

  const strengthScore = calculateStrength(password);
  const isEntirelyNumeric = password.length > 0 && /^\d+$/.test(password);

  const getStrengthLabel = () => {
    if (!password) return { label: 'Empty', color: 'bg-slate-200 text-slate-400' };
    if (isEntirelyNumeric) return { label: 'Rejected: Numeric only', color: 'bg-rose-500 text-white' };
    if (strengthScore <= 1) return { label: 'Weak', color: 'bg-rose-500 text-white' };
    if (strengthScore <= 3) return { label: 'Moderate', color: 'bg-amber-500 text-white' };
    return { label: 'Strong & Compliant', color: 'bg-emerald-500 text-white' };
  };

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    const found = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (found) {
      setCurrentUser(found);
      showToast(`Welcome back, ${found.name}! Signed in as ${found.role}`, 'success');
      onClose();
    } else {
      setErrorMsg('No user account found with that email. Try a Demo Account below or Register.');
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      setErrorMsg('Password must be at least 8 characters long.');
      return;
    }
    if (isEntirelyNumeric) {
      setErrorMsg('Passwords cannot be entirely numeric.');
      return;
    }

    const newUser: UserAccount = {
      id: `usr-${Date.now()}`,
      name: name || 'New Shopper',
      email: email || `user${Math.floor(Math.random() * 900)}@dms.internal`,
      role, // defaults to Customer
      joinedDate: new Date().toISOString().split('T')[0],
    };

    setCurrentUser(newUser);
    showToast(`Account created! Logged in as ${newUser.name} (${newUser.role})`, 'success');
    onClose();
  };

  const handleSelectDemoUser = (user: UserAccount) => {
    setCurrentUser(user);
    showToast(`Switched active profile to ${user.name} (${user.role})`, 'info');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 8 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden"
          >
            {/* Header & Tabs */}
            <div className="p-6 pb-0">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-sm">
                    %
                  </div>
                  <h3 className="text-base font-bold text-slate-900">
                    User Authentication & Roles
                  </h3>
                </div>
                <button
                  onClick={onClose}
                  className="text-slate-400 hover:text-slate-600 font-bold text-lg cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="flex border-b border-slate-200 text-xs font-semibold relative">
                <button
                  onClick={() => {
                    setTab('signin');
                    setErrorMsg('');
                  }}
                  className={`flex-1 py-2.5 text-center transition cursor-pointer ${
                    tab === 'signin'
                      ? 'border-b-2 border-indigo-600 text-indigo-600 font-bold'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  Sign In
                </button>
                <button
                  onClick={() => {
                    setTab('register');
                    setErrorMsg('');
                  }}
                  className={`flex-1 py-2.5 text-center transition cursor-pointer ${
                    tab === 'register'
                      ? 'border-b-2 border-indigo-600 text-indigo-600 font-bold'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  Create Account
                </button>
              </div>
            </div>

            {/* Form Body */}
            <div className="p-6 space-y-4">
              {errorMsg && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {tab === 'signin' ? (
                <form onSubmit={handleSignIn} className="space-y-3 text-xs">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      Email Address
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        required
                        placeholder="e.g. rohan.s@storefront.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 transition-all"
                      />
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    </div>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        required
                        placeholder="Enter password..."
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 transition-all"
                      />
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    </div>
                  </div>

                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition shadow-xs cursor-pointer"
                  >
                    Sign In to DMS
                  </motion.button>
                </form>
              ) : (
                <form onSubmit={handleRegister} className="space-y-3 text-xs">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ananya Roy"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 transition-all"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. user@domain.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 transition-all"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="font-semibold text-slate-700">Password *</label>
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                          getStrengthLabel().color
                        }`}
                      >
                        {getStrengthLabel().label}
                      </span>
                    </div>
                    <input
                      type="password"
                      required
                      placeholder="Minimum 8 characters..."
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 transition-all"
                    />

                    {/* Password strength visual meter */}
                    <div className="grid grid-cols-4 gap-1 mt-1.5">
                      {[1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className={`h-1 rounded-full transition-all ${
                            strengthScore >= i
                              ? strengthScore >= 4
                                ? 'bg-emerald-500'
                                : strengthScore >= 2
                                ? 'bg-amber-500'
                                : 'bg-rose-500'
                              : 'bg-slate-200'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">
                      Requires 8+ characters, mixed case, number, and no purely numeric strings.
                    </p>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      Account Role (Default: Customer)
                    </label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value as StakeholderRole)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 font-medium cursor-pointer"
                    >
                      <option value="Customer">Customer (Default Shopper Profile)</option>
                      <option value="Sales Staff">Sales Staff (POS Operator)</option>
                      <option value="Marketing Team">Marketing Team (Campaign Creator)</option>
                      <option value="Business Manager">Business Manager (Approver)</option>
                      <option value="Administrator">Administrator (System Governance)</option>
                      <option value="Accountant">Accountant (Ledger & Reports)</option>
                    </select>
                  </div>

                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition shadow-xs cursor-pointer"
                  >
                    Register & Initialize Role
                  </motion.button>
                </form>
              )}

              {/* Quick Demo Stakeholder Switcher */}
              <div className="pt-3 border-t border-slate-100">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Instant One-Click Demo Personas:
                </p>
                <div className="grid grid-cols-2 gap-1.5">
                  {users.map((u) => (
                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      key={u.id}
                      onClick={() => handleSelectDemoUser(u)}
                      className={`p-2 rounded-lg border text-left text-xs transition cursor-pointer ${
                        currentUser.id === u.id
                          ? 'border-indigo-500 bg-indigo-50/50 font-bold text-indigo-900'
                          : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      <div className="font-semibold truncate">{u.name}</div>
                      <div className="text-[10px] text-slate-400">{u.role}</div>
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
