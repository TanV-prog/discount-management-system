'use client';

import React, { useState } from 'react';
import { useDMS } from '@/lib/dms-context';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar } from 'lucide-react';

interface DateSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DateSimulatorModal({ isOpen, onClose }: DateSimulatorModalProps) {
  const { simulatedDate, setSimulatedDate } = useDMS();
  const [draftDate, setDraftDate] = useState<string | null>(null);
  const selectedDate = draftDate ?? simulatedDate;

  const presets = [
    {
      id: 'peak',
      label: 'During Festival Sale (Peak Active)',
      date: '2026-10-15',
      note: 'All October 2026 promotions active',
    },
    {
      id: 'before',
      label: 'Before Campaign Launch',
      date: '2026-09-15',
      note: 'Triggers "Campaign not yet started" guard check',
    },
    {
      id: 'after',
      label: 'After Festival Sale Expiry',
      date: '2026-11-05',
      note: 'Triggers "Discount rule expired" guard check',
    },
    {
      id: 'today',
      label: 'Real Today Date',
      date: 'TODAY',
      note: 'Current real-world calendar day',
    },
  ];

  const handleClose = () => {
    setDraftDate(null);
    onClose();
  };

  const handleApply = (dateToSet: string) => {
    const resolvedDate =
      dateToSet === 'TODAY' ? new Date().toISOString().split('T')[0] : dateToSet;
    setSimulatedDate(resolvedDate);
    setDraftDate(null);
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
            className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-bold text-slate-900">
                  System Date & Time Simulation
                </h3>
              </div>
              <button
                onClick={handleClose}
                className="text-slate-400 hover:text-slate-600 font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
              The 7-Guard Engine verifies coupon validity against the system clock. Adjust the date to test
              automatic prevention of expired or premature discount redemption.
            </p>

            <div className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Custom Simulated Date (YYYY-MM-DD)
                </label>
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setDraftDate(e.target.value)}
                    className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-xs font-mono"
                  />
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleApply(selectedDate)}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold transition cursor-pointer shadow-xs"
                  >
                    Apply Date
                  </motion.button>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-2">
                  Quick Test Presets
                </label>
                <div className="space-y-2">
                  {presets.map((preset) => (
                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      key={preset.id}
                      onClick={() => handleApply(preset.date)}
                      className={`w-full p-2.5 rounded-lg border text-left flex items-center justify-between transition cursor-pointer ${
                        simulatedDate === preset.date
                          ? 'border-indigo-500 bg-indigo-50/50 font-bold text-indigo-900'
                          : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      <div>
                        <div className="font-semibold">{preset.label}</div>
                        <div className="text-[11px] text-slate-500">{preset.note}</div>
                      </div>
                      <span className="font-mono text-xs px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-800">
                        {preset.date === 'TODAY' ? 'Today' : preset.date}
                      </span>
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={handleClose}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium cursor-pointer"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
