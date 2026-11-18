'use client';

import React, { useState } from 'react';
import { useDMS } from '@/lib/dms-context';
import { Coupon } from '@/types/dms';
import { motion, AnimatePresence } from 'motion/react';
import {
  Ticket,
  Plus,
  Power,
  Edit2,
  Trash2,
  Copy,
  Check,
  Sparkles,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  AlertCircle,
  BarChart,
} from 'lucide-react';

export function CouponManagementView() {
  const {
    coupons,
    rules,
    createCoupon,
    updateCoupon,
    toggleCouponActive,
    currentUser,
  } = useDMS();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Form states
  const [code, setCode] = useState('');
  const [ruleId, setRuleId] = useState('');
  const [usageLimit, setUsageLimit] = useState<number>(100);
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);

  const activeRules = rules.filter((r) => r.status === 'active' || r.approvalStatus === 'approved');

  const openCreateModal = () => {
    setEditingCoupon(null);
    setCode(`PROMO${Math.floor(100 + Math.random() * 900)}`);
    setRuleId(activeRules[0]?.id || '');
    setUsageLimit(100);
    setDescription('');
    setIsActive(true);
    setIsModalOpen(true);
  };

  const openEditModal = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setCode(coupon.code);
    setRuleId(coupon.ruleId);
    setUsageLimit(coupon.usageLimit);
    setDescription(coupon.description);
    setIsActive(coupon.isActive);
    setIsModalOpen(true);
  };

  const handleSaveCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !ruleId) return;

    if (editingCoupon) {
      updateCoupon({
        ...editingCoupon,
        code: code.trim().toUpperCase(),
        ruleId,
        usageLimit: Number(usageLimit),
        description,
        isActive,
      });
    } else {
      createCoupon({
        code: code.trim().toUpperCase(),
        ruleId,
        usageLimit: Number(usageLimit),
        description: description || `Promo coupon code for selected promotion.`,
        isActive,
      });
    }

    setIsModalOpen(false);
  };

  const handleCopy = (couponCode: string) => {
    navigator.clipboard.writeText(couponCode);
    setCopiedCode(couponCode);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const filteredCoupons = coupons.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const rule = rules.find((r) => r.id === c.ruleId);
    return (
      c.code.toLowerCase().includes(q) ||
      c.description.toLowerCase().includes(q) ||
      rule?.name.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Ticket className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-bold text-slate-900">
              Coupon Code Allocations & Usage Counters
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage redeemable promo codes, monitor redemption counters against quotas, and link to discount rules.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-2xs transition"
        >
          <Plus className="w-4 h-4" />
          <span>Generate New Coupon</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between gap-3">
        <div className="relative w-full max-w-sm">
          <input
            type="text"
            placeholder="Search coupons by code or rule..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-8 pr-3 py-1.5 border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
        </div>

        <div className="text-xs text-slate-500">
          Total Coupons: <strong className="text-slate-800">{coupons.length}</strong>
        </div>
      </div>

      {/* Coupons Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[680px]">
            <thead className="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Coupon Code</th>
                <th className="py-3 px-3">Linked Discount Rule</th>
                <th className="py-3 px-3">Redemption Counter</th>
                <th className="py-3 px-3">Description & Terms</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredCoupons.map((coupon) => {
                const linkedRule = rules.find((r) => r.id === coupon.ruleId);
                const isExhausted = coupon.usageCount >= coupon.usageLimit;
                const percentUsed = Math.min(
                  100,
                  Math.round((coupon.usageCount / coupon.usageLimit) * 100)
                );

                return (
                  <tr key={coupon.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sm text-indigo-700 bg-indigo-50/80 px-2.5 py-1 rounded-md border border-indigo-200 tracking-wider">
                          {coupon.code}
                        </span>
                        <button
                          onClick={() => handleCopy(coupon.code)}
                          className="text-slate-400 hover:text-indigo-600 transition"
                          title="Copy coupon code"
                        >
                          {copiedCode === coupon.code ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </td>

                    <td className="py-3.5 px-3">
                      {linkedRule ? (
                        <div>
                          <div className="font-semibold text-slate-800 text-xs">
                            {linkedRule.name}
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1.5">
                            <span className="bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded font-medium text-[10px]">
                              {linkedRule.discountCategory}
                            </span>
                            <span>
                              {linkedRule.discountType === 'percentage'
                                ? `${linkedRule.discountValue}%`
                                : `₹${linkedRule.discountValue}`}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <span className="text-rose-500 font-medium">Unlinked Rule</span>
                      )}
                    </td>

                    <td className="py-3.5 px-3">
                      <div className="w-36 space-y-1">
                        <div className="flex justify-between text-[11px] font-medium text-slate-700">
                          <span>
                            {coupon.usageCount} used
                          </span>
                          <span className="text-slate-400">
                            / {coupon.usageLimit} max
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              percentUsed >= 100
                                ? 'bg-rose-500'
                                : percentUsed >= 70
                                ? 'bg-amber-500'
                                : 'bg-emerald-500'
                            }`}
                            style={{ width: `${percentUsed}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-3 text-[11px] text-slate-600 max-w-xs">
                      {coupon.description}
                    </td>

                    <td className="py-3.5 px-3">
                      {!coupon.isActive ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                          Deactivated
                        </span>
                      ) : isExhausted ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-orange-100 text-orange-800 border border-orange-200">
                          Exhausted
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" />
                          Ready
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => toggleCouponActive(coupon.id)}
                          className={`p-1.5 rounded-md border transition ${
                            coupon.isActive
                              ? 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border-emerald-200'
                              : 'text-slate-600 bg-slate-100 hover:bg-slate-200 border-slate-300'
                          }`}
                          title={coupon.isActive ? 'Deactivate coupon' : 'Activate coupon'}
                        >
                          <Power className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => openEditModal(coupon)}
                          className="p-1.5 rounded-md border border-slate-200 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 transition"
                          title="Edit coupon parameters"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                <h3 className="text-base font-bold text-slate-900">
                  {editingCoupon ? 'Modify Coupon' : 'Generate New Coupon Code'}
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 font-bold"
                >
                  ✕
                </button>
              </div>

            <form onSubmit={handleSaveCoupon} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Coupon Code (Unique Uppercase String) *
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-xs font-mono uppercase focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => setCode(`DEAL${Math.floor(100 + Math.random() * 900)}`)}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs"
                  >
                    Randomize
                  </button>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Link to Discount Rule *
                </label>
                <select
                  required
                  value={ruleId}
                  onChange={(e) => setRuleId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-slate-50 font-medium"
                >
                  <option value="">Select an active discount rule...</option>
                  {rules.map((rule) => (
                    <option key={rule.id} value={rule.id}>
                      {rule.name} ({rule.discountCategory} -{' '}
                      {rule.discountType === 'percentage'
                        ? `${rule.discountValue}%`
                        : `₹${rule.discountValue}`}
                      )
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Total Redemption Limit (Quota) *
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={usageLimit}
                  onChange={(e) => setUsageLimit(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Engine Guard Check #4 rejects redemption once usage reaches this quota.
                </span>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Customer-Facing Description
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Get 20% off on all electronics during festival week"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="activeCheck"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="activeCheck" className="text-xs font-semibold text-slate-800">
                  Enable coupon immediately (Active status)
                </label>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold shadow-xs"
                >
                  {editingCoupon ? 'Save Changes' : 'Generate Coupon'}
                </button>
              </div>
            </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
