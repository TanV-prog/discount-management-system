'use client';

import React, { useState } from 'react';
import { useDMS } from '@/lib/dms-context';
import { motion, AnimatePresence } from 'motion/react';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  ShieldCheck,
  Calendar,
  Layers,
  Sparkles,
  Check,
  X,
  FileText,
} from 'lucide-react';

export function ApprovalQueueView() {
  const {
    rules,
    approveRule,
    currentUser,
  } = useDMS();

  const [decisionNotes, setDecisionNotes] = useState<{ [ruleId: string]: string }>({});

  const pendingRules = rules.filter((r) => r.approvalStatus === 'pending');
  const pastApprovals = rules.filter((r) => r.approvalStatus !== 'pending');

  const handleDecision = (ruleId: string, approved: boolean) => {
    approveRule(ruleId, approved);
  };

  const isAuthorizedToApprove =
    currentUser.role === 'Business Manager' || currentUser.role === 'Administrator';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-bold text-slate-900">
              Discount Proposal Approval Queue
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Business Manager & Administrator governance gate to review and activate promotional campaigns.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`text-xs px-3 py-1 rounded-full font-semibold border flex items-center gap-1.5 ${
              isAuthorizedToApprove
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-amber-50 text-amber-800 border-amber-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>
              {isAuthorizedToApprove
                ? 'Authorization Granted'
                : 'View Only (Requires Manager Role)'}
            </span>
          </span>
        </div>
      </div>

      {/* Pending Items */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <span>Awaiting Executive Review ({pendingRules.length})</span>
          </h3>
          <span className="text-xs text-slate-400">
            Rules cannot be redeemed at checkout until approved
          </span>
        </div>

        {pendingRules.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-8 text-center shadow-2xs">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-slate-800">
              All Discount Requests Processed
            </h4>
            <p className="text-xs text-slate-500 mt-1">
              There are no pending discount rules waiting for business approval.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AnimatePresence mode="popLayout">
              {pendingRules.map((rule) => (
                <motion.div
                  key={rule.id}
                  layout
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.92, y: 8 }}
                  transition={{ duration: 0.2 }}
                  className="bg-white rounded-xl border border-amber-200 shadow-xs p-5 flex flex-col justify-between relative overflow-hidden"
                >
                <div className="absolute top-0 right-0 w-2 h-full bg-amber-400" />

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                      {rule.discountCategory}
                    </span>
                    <span className="text-xs text-slate-500">
                      Proposed by <strong className="text-slate-800">{rule.createdByRole}</strong>
                    </span>
                  </div>

                  <h4 className="font-bold text-slate-900 text-base mb-1">{rule.name}</h4>

                  <div className="flex items-baseline gap-2 mb-3">
                    <span className="text-xl font-black text-indigo-600">
                      {rule.discountType === 'percentage'
                        ? `${rule.discountValue}% OFF`
                        : `₹${rule.discountValue.toLocaleString('en-IN')} FLAT OFF`}
                    </span>
                    {rule.maxDiscountCap && (
                      <span className="text-xs text-slate-500">
                        (Capped at ₹{rule.maxDiscountCap.toLocaleString('en-IN')})
                      </span>
                    )}
                  </div>

                  {rule.notes && (
                    <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-xs text-slate-600 mb-3 flex items-start gap-2">
                      <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                      <span>{rule.notes}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50/70 p-3 rounded-lg border border-slate-100 mb-4">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">
                        Target Category
                      </span>
                      <span className="font-semibold text-slate-800">
                        {rule.applicableCategory}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">
                        Min. Order Value
                      </span>
                      <span className="font-semibold text-slate-800">
                        {rule.minOrderValue ? `₹${rule.minOrderValue.toLocaleString('en-IN')}` : 'None'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">
                        Start Date
                      </span>
                      <span className="font-semibold text-slate-800">{rule.validFrom}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">
                        Expiry Date
                      </span>
                      <span className="font-semibold text-slate-800">{rule.validTo}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                  <button
                    onClick={() => handleDecision(rule.id, false)}
                    disabled={!isAuthorizedToApprove}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                      isAuthorizedToApprove
                        ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
                        : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Reject</span>
                  </button>

                  <button
                    onClick={() => handleDecision(rule.id, true)}
                    disabled={!isAuthorizedToApprove}
                    className={`px-4 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition shadow-2xs ${
                      isAuthorizedToApprove
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Approve & Activate</span>
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        )}
      </div>

      {/* History of Decisions */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5">
        <h3 className="text-sm font-bold text-slate-800 mb-3">
          Recently Reviewed Rules & Audit Status
        </h3>

        <div className="space-y-2">
          {pastApprovals.map((rule) => (
            <div
              key={rule.id}
              className="flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-slate-50/50 text-xs"
            >
              <div>
                <span className="font-semibold text-slate-900">{rule.name}</span>
                <span className="text-slate-400 ml-2">({rule.discountCategory})</span>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-slate-500">
                  {rule.discountType === 'percentage'
                    ? `${rule.discountValue}%`
                    : `₹${rule.discountValue}`}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                    rule.approvalStatus === 'approved'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {rule.approvalStatus}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
