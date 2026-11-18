'use client';

import React from 'react';
import { useDMS } from '@/lib/dms-context';
import { StakeholderRole } from '@/types/dms';
import { motion } from 'motion/react';
import { ShieldAlert, ArrowLeft, UserCheck, Lock, ShieldCheck } from 'lucide-react';

interface AccessDeniedViewProps {
  requiredRoles: StakeholderRole[];
  moduleName: string;
  onNavigateHome: () => void;
}

export function AccessDeniedView({
  requiredRoles,
  moduleName,
  onNavigateHome,
}: AccessDeniedViewProps) {
  const { currentUser, switchRole, showToast } = useDMS();

  const handleSwitchToAuthorizedRole = (role: StakeholderRole) => {
    switchRole(role);
    showToast(`Switched active profile to ${role}`, 'success');
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="max-w-lg w-full bg-white rounded-2xl border border-rose-200/80 shadow-xl p-6 sm:p-8 text-center relative overflow-hidden"
      >
        {/* Top accent */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-rose-500 via-amber-500 to-rose-600" />

        <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 mx-auto mb-4 shadow-inner">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <span className="text-[11px] font-bold uppercase tracking-wider text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200 inline-block mb-3">
          Role-Based Access Control (RBAC) Barrier
        </span>

        <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mb-2">
          {moduleName} Restricted
        </h2>

        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6">
          According to Section 4.6 of the Discount Management System specifications, access to{' '}
          <strong className="text-slate-800">{moduleName}</strong> is restricted to staff roles only.
          Your active session is currently set to <strong className="text-indigo-600 font-semibold">{currentUser.role}</strong>.
        </p>

        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 text-left mb-6">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 mb-2">
            <Lock className="w-3.5 h-3.5 text-slate-400" />
            <span>Authorized Roles for this Module:</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {requiredRoles.map((r) => (
              <span
                key={r}
                className="text-[11px] font-medium px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700"
              >
                {r}
              </span>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-xs text-slate-500 font-medium">
            Switch to a staff demo persona to inspect this module:
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {requiredRoles.slice(0, 3).map((r) => (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                key={r}
                onClick={() => handleSwitchToAuthorizedRole(r)}
                className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer shadow-xs"
              >
                <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>As {r}</span>
              </motion.button>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-center">
            <button
              onClick={onNavigateHome}
              className="text-xs text-slate-600 hover:text-indigo-600 font-semibold flex items-center gap-1.5 transition cursor-pointer p-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Customer Offers & Deals</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
