'use client';

import React from 'react';
import { useDMS } from '@/lib/dms-context';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, Info, AlertTriangle, XCircle, X } from 'lucide-react';

export function ToastBanner() {
  const { toast, dismissToast } = useDMS();

  return (
    <div className="fixed bottom-18 lg:bottom-5 right-2 sm:right-5 z-50 pointer-events-none max-w-sm w-full px-3 sm:px-4">
      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className={`pointer-events-auto rounded-xl p-3.5 shadow-lg border flex items-start gap-3 backdrop-blur-md ${
              toast.type === 'success'
                ? 'bg-slate-900/95 text-white border-emerald-500/30'
                : toast.type === 'warning'
                ? 'bg-amber-950/95 text-amber-100 border-amber-500/40'
                : toast.type === 'error'
                ? 'bg-rose-950/95 text-rose-100 border-rose-500/40'
                : 'bg-slate-900/95 text-white border-slate-700/60'
            }`}
          >
            <div className="shrink-0 mt-0.5">
              {toast.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              ) : toast.type === 'warning' ? (
                <AlertTriangle className="w-4 h-4 text-amber-400" />
              ) : toast.type === 'error' ? (
                <XCircle className="w-4 h-4 text-rose-400" />
              ) : (
                <Info className="w-4 h-4 text-indigo-400" />
              )}
            </div>

            <div className="flex-1 text-xs font-medium leading-relaxed">
              {toast.message}
            </div>

            <button
              onClick={dismissToast}
              className="text-slate-400 hover:text-white transition p-0.5 shrink-0"
              aria-label="Dismiss notification"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
