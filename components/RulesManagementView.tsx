'use client';

import React, { useState } from 'react';
import { useDMS } from '@/lib/dms-context';
import { DiscountRule, DiscountCategory, DiscountType } from '@/types/dms';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sliders,
  Plus,
  Search,
  Filter,
  Calendar,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Edit2,
  Trash2,
  Power,
  Shield,
  Layers,
  Percent,
  Coins,
} from 'lucide-react';

export function RulesManagementView() {
  const {
    rules,
    createRule,
    updateRule,
    deleteRule,
    toggleRuleStatus,
    currentUser,
    simulatedDate,
  } = useDMS();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<DiscountRule | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [filterStatus, setFilterStatus] = useState<string>('All');

  // Form states for creating / editing rule
  const [name, setName] = useState('');
  const [discountType, setDiscountType] = useState<DiscountType>('percentage');
  const [discountCategory, setDiscountCategory] = useState<DiscountCategory>('Seasonal');
  const [discountValue, setDiscountValue] = useState<number>(20);
  const [applicableCategory, setApplicableCategory] = useState<string>('All Categories');
  const [minOrderValue, setMinOrderValue] = useState<number | undefined>(undefined);
  const [minQuantity, setMinQuantity] = useState<number | undefined>(undefined);
  const [maxDiscountCap, setMaxDiscountCap] = useState<number | undefined>(undefined);
  const [validFrom, setValidFrom] = useState<string>('2026-10-01');
  const [validTo, setValidTo] = useState<string>('2026-11-30');
  const [notes, setNotes] = useState<string>('');

  const discountCategories: DiscountCategory[] = [
    'Quantity',
    'Seasonal',
    'Trade/Functional',
    'Cash',
    'Clearance',
    'Rebate',
    'Special Offer',
  ];

  const productCategories = [
    'All Categories',
    'Electronics',
    'Fashion & Apparel',
    'Home & Kitchen',
    'Books & Stationery',
    'Gourmet & Groceries',
  ];

  const openCreateModal = () => {
    setEditingRule(null);
    setName('');
    setDiscountType('percentage');
    setDiscountCategory('Seasonal');
    setDiscountValue(20);
    setApplicableCategory('All Categories');
    setMinOrderValue(undefined);
    setMinQuantity(undefined);
    setMaxDiscountCap(undefined);
    setValidFrom(simulatedDate);
    // 30 days ahead by default
    const futureDate = new Date(simulatedDate);
    futureDate.setDate(futureDate.getDate() + 30);
    setValidTo(futureDate.toISOString().split('T')[0]);
    setNotes('');
    setIsModalOpen(true);
  };

  const openEditModal = (rule: DiscountRule) => {
    setEditingRule(rule);
    setName(rule.name);
    setDiscountType(rule.discountType);
    setDiscountCategory(rule.discountCategory);
    setDiscountValue(rule.discountValue);
    setApplicableCategory(rule.applicableCategory);
    setMinOrderValue(rule.minOrderValue);
    setMinQuantity(rule.minQuantity);
    setMaxDiscountCap(rule.maxDiscountCap);
    setValidFrom(rule.validFrom);
    setValidTo(rule.validTo);
    setNotes(rule.notes || '');
    setIsModalOpen(true);
  };

  const handleSaveRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    // Check authorization: Administrators and Business Managers auto-approve.
    // Marketing and Sales Staff submissions enter "pending_approval" as per requirements in Section 1.4.1.
    const isAutoApproved =
      currentUser.role === 'Administrator' || currentUser.role === 'Business Manager';

    if (editingRule) {
      updateRule({
        ...editingRule,
        name,
        discountType,
        discountCategory,
        discountValue,
        applicableCategory,
        minOrderValue: minOrderValue ? Number(minOrderValue) : undefined,
        minQuantity: minQuantity ? Number(minQuantity) : undefined,
        maxDiscountCap: maxDiscountCap ? Number(maxDiscountCap) : undefined,
        validFrom,
        validTo,
        notes,
      });
    } else {
      createRule({
        name,
        discountType,
        discountCategory,
        discountValue: Number(discountValue),
        applicableCategory,
        minOrderValue: minOrderValue ? Number(minOrderValue) : undefined,
        minQuantity: minQuantity ? Number(minQuantity) : undefined,
        maxDiscountCap: maxDiscountCap ? Number(maxDiscountCap) : undefined,
        validFrom,
        validTo,
        status: isAutoApproved ? 'active' : 'pending_approval',
        approvalStatus: isAutoApproved ? 'approved' : 'pending',
        createdByRole: currentUser.role,
        notes,
      });
    }

    setIsModalOpen(false);
  };

  const filteredRules = rules.filter((r) => {
    if (filterCategory !== 'All' && r.discountCategory !== filterCategory) return false;
    if (filterStatus !== 'All') {
      if (filterStatus === 'active' && r.status !== 'active') return false;
      if (filterStatus === 'expired' && r.status !== 'expired') return false;
      if (filterStatus === 'pending' && r.approvalStatus !== 'pending') return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        r.name.toLowerCase().includes(q) ||
        r.applicableCategory.toLowerCase().includes(q) ||
        r.discountCategory.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header and Action */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-bold text-slate-900">
              Discount Rules Governance
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Define eligibility rules, percentage/flat deductions, caps, and validity windows across 7 categories.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-2xs transition"
        >
          <Plus className="w-4 h-4" />
          <span>Define New Discount Rule</span>
        </button>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <div className="relative w-full max-w-sm">
            <input
              type="text"
              placeholder="Search rules by name, category, or type..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-8 pr-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400 font-medium">Category:</span>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs bg-slate-50 font-medium text-slate-700"
          >
            <option value="All">All Categories</option>
            {discountCategories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <span className="text-slate-400 font-medium ml-2">Status:</span>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs bg-slate-50 font-medium text-slate-700"
          >
            <option value="All">All Statuses</option>
            <option value="active">Active</option>
            <option value="pending">Pending Approval</option>
            <option value="expired">Expired</option>
          </select>
        </div>
      </div>

      {/* Rules Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[700px]">
            <thead className="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Rule Name & Details</th>
                <th className="py-3 px-3">Category & Scope</th>
                <th className="py-3 px-3">Deduction Value</th>
                <th className="py-3 px-3">Guard Conditions</th>
                <th className="py-3 px-3">Validity Period</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredRules.map((rule) => {
                const isExpired = simulatedDate > rule.validTo;

                return (
                  <tr key={rule.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900 text-sm">{rule.name}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1.5">
                        <span>Created by {rule.createdByRole}</span>
                        {rule.notes && <span>• {rule.notes}</span>}
                      </div>
                    </td>

                    <td className="py-3.5 px-3">
                      <div className="inline-block px-2 py-0.5 rounded font-medium text-[11px] bg-slate-100 text-slate-800 border border-slate-200 mb-1">
                        {rule.discountCategory}
                      </div>
                      <div className="text-[11px] text-slate-500 font-medium">
                        Target: {rule.applicableCategory}
                      </div>
                    </td>

                    <td className="py-3.5 px-3">
                      <div className="font-bold text-slate-900 text-sm">
                        {rule.discountType === 'percentage'
                          ? `${rule.discountValue}%`
                          : `₹${rule.discountValue.toLocaleString('en-IN')}`}
                      </div>
                      <div className="text-[10px] text-slate-400 capitalize">
                        {rule.discountType} discount
                      </div>
                    </td>

                    <td className="py-3.5 px-3 space-y-0.5 text-[11px]">
                      {rule.minOrderValue ? (
                        <div className="text-slate-600">
                          Min Order: <strong>₹{rule.minOrderValue.toLocaleString('en-IN')}</strong>
                        </div>
                      ) : null}
                      {rule.minQuantity && rule.minQuantity > 1 ? (
                        <div className="text-slate-600">
                          Min Qty: <strong>{rule.minQuantity} items</strong>
                        </div>
                      ) : null}
                      {rule.maxDiscountCap ? (
                        <div className="text-slate-600">
                          Max Cap: <strong>₹{rule.maxDiscountCap.toLocaleString('en-IN')}</strong>
                        </div>
                      ) : null}
                      {!rule.minOrderValue && !rule.minQuantity && !rule.maxDiscountCap && (
                        <span className="text-slate-400">None (General)</span>
                      )}
                    </td>

                    <td className="py-3.5 px-3 text-[11px]">
                      <div className="flex items-center gap-1 text-slate-600 font-medium">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span>{rule.validFrom}</span>
                      </div>
                      <div className="text-slate-500 mt-0.5">
                        to{' '}
                        <strong className={isExpired ? 'text-rose-600 line-through' : 'text-slate-800'}>
                          {rule.validTo}
                        </strong>
                      </div>
                    </td>

                    <td className="py-3.5 px-3">
                      {rule.approvalStatus === 'pending' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                          <AlertTriangle className="w-3 h-3" />
                          Pending
                        </span>
                      ) : isExpired ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-100 text-rose-800 border border-rose-200">
                          <XCircle className="w-3 h-3" />
                          Expired
                        </span>
                      ) : rule.status === 'active' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-300">
                          Paused
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => toggleRuleStatus(rule.id)}
                          className={`p-1.5 rounded-md border transition ${
                            rule.status === 'active'
                              ? 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border-emerald-200'
                              : 'text-slate-600 bg-slate-100 hover:bg-slate-200 border-slate-300'
                          }`}
                          title={rule.status === 'active' ? 'Deactivate rule' : 'Activate rule'}
                        >
                          <Power className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => openEditModal(rule)}
                          className="p-1.5 rounded-md border border-slate-200 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 transition"
                          title="Edit discount parameters"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Delete rule "${rule.name}"?`)) {
                              deleteRule(rule.id);
                            }
                          }}
                          className="p-1.5 rounded-md border border-slate-200 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                          title="Delete discount rule"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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

      {/* Modal for Creating or Editing Rule */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                <h3 className="text-base font-bold text-slate-900">
                  {editingRule ? 'Edit Discount Rule' : 'Create New Discount Rule'}
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 text-lg font-bold"
                >
                  ✕
                </button>
              </div>

            <form onSubmit={handleSaveRule} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Rule Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Festival Sale Electronics 20%"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Discount Category *
                  </label>
                  <select
                    value={discountCategory}
                    onChange={(e) => setDiscountCategory(e.target.value as DiscountCategory)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-slate-50 font-medium"
                  >
                    {discountCategories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Discount Type *
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setDiscountType('percentage')}
                      className={`flex-1 py-1.5 rounded-lg border font-semibold transition ${
                        discountType === 'percentage'
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      Percentage (%)
                    </button>
                    <button
                      type="button"
                      onClick={() => setDiscountType('flat')}
                      className={`flex-1 py-1.5 rounded-lg border font-semibold transition ${
                        discountType === 'flat'
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      Flat (₹)
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Discount Value * ({discountType === 'percentage' ? '%' : '₹'})
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={discountValue}
                    onChange={(e) => setDiscountValue(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Applicable Product Category
                  </label>
                  <select
                    value={applicableCategory}
                    onChange={(e) => setApplicableCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-slate-50"
                  >
                    {productCategories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Guard Thresholds */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-3">
                <p className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                  Guard Engine Thresholds (Optional)
                </p>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[11px] text-slate-600 block mb-1">
                      Min Order Value (₹)
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 5000"
                      value={minOrderValue || ''}
                      onChange={(e) =>
                        setMinOrderValue(e.target.value ? Number(e.target.value) : undefined)
                      }
                      className="w-full px-2.5 py-1.5 border border-slate-200 rounded bg-white text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-600 block mb-1">
                      Min Items Qty
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 4"
                      value={minQuantity || ''}
                      onChange={(e) =>
                        setMinQuantity(e.target.value ? Number(e.target.value) : undefined)
                      }
                      className="w-full px-2.5 py-1.5 border border-slate-200 rounded bg-white text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-600 block mb-1">
                      Max Cap Limit (₹)
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 4000"
                      value={maxDiscountCap || ''}
                      onChange={(e) =>
                        setMaxDiscountCap(e.target.value ? Number(e.target.value) : undefined)
                      }
                      className="w-full px-2.5 py-1.5 border border-slate-200 rounded bg-white text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Validity Period */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Valid From Date
                  </label>
                  <input
                    type="date"
                    required
                    value={validFrom}
                    onChange={(e) => setValidFrom(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Valid Until Date (Expiry)
                  </label>
                  <input
                    type="date"
                    required
                    value={validTo}
                    onChange={(e) => setValidTo(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Campaign Notes / Business Rationale
                </label>
                <textarea
                  rows={2}
                  placeholder="Enter purpose, budget approval notes, or target audience..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
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
                  {editingRule ? 'Save Changes' : 'Create Rule'}
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
