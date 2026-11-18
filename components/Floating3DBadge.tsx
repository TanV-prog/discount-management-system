'use client';

import React from 'react';
import { motion } from 'motion/react';

interface Floating3DBadgeProps {
  label?: string;
  discountPercent?: string;
  subtitle?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function Floating3DBadge({
  label = 'SPECIAL OFFER',
  discountPercent = '35%',
  subtitle = '7-GUARD VERIFIED',
  size = 'md',
}: Floating3DBadgeProps) {
  return (
    <div className="relative inline-block" style={{ perspective: 1000 }}>
      <motion.div
        animate={{
          y: [-4, 4, -4],
          rotateX: [8, -6, 8],
          rotateY: [-12, 12, -12],
        }}
        transition={{
          duration: 4.8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        style={{ transformStyle: 'preserve-3d' }}
        className="relative select-none"
      >
        {/* Soft 3D Drop Shadow */}
        <div className="absolute inset-0 translate-y-4 translate-z-[-24px] bg-indigo-950/25 blur-lg rounded-2xl" />

        {/* 3D Chamfer Thickness Layer (Simulates physical coin/token depth) */}
        <div className="absolute inset-0 translate-y-1.5 translate-z-[-6px] bg-slate-900 rounded-2xl shadow-inner border border-slate-700" />

        {/* Main 3D Metallic Card Face */}
        <div className="relative bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl border border-indigo-400/40 flex items-center gap-3">
          {/* 3D Gold Seal Coin */}
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-yellow-300 to-amber-200 text-amber-950 font-black text-sm flex items-center justify-center shadow-md border border-amber-200/80 shrink-0">
            %
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold tracking-widest uppercase text-indigo-300">
                {label}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <div className="text-xl font-black tracking-tight text-white leading-none mt-0.5">
              UP TO {discountPercent}
            </div>
            {subtitle && (
              <div className="text-[9px] font-mono font-semibold tracking-wider text-slate-400 uppercase mt-0.5">
                {subtitle}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
