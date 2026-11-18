'use client';

import React, { useState } from 'react';
import { useDMS } from '@/lib/dms-context';
import { DiscountCategory } from '@/types/dms';
import { motion, AnimatePresence } from 'motion/react';
import {
  Tag,
  Copy,
  Check,
  Calendar,
  Sparkles,
  ArrowRight,
  Clock,
  Layers,
  Search,
} from 'lucide-react';
import { Floating3DBadge } from '@/components/Floating3DBadge';
import { Tilt3DCard } from '@/components/Tilt3DCard';

interface OffersViewProps {
  onNavigateToCheckout: () => void;
}

export function OffersView({ onNavigateToCheckout }: OffersViewProps) {
  const {
    rules,
    coupons,
    simulatedDate,
    setAppliedCouponCode,
    showToast,
  } = useDMS();

  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const discountCategories: (string | DiscountCategory)[] = [
    'All',
    'Seasonal',
    'Quantity',
    'Clearance',
    'Cash',
    'Rebate',
    'Trade/Functional',
    'Special Offer',
  ];

  // Match coupon to rule
  const offersList = coupons.map((coupon) => {
    const rule = rules.find((r) => r.id === coupon.ruleId);
    const isExpired = rule ? simulatedDate > rule.validTo : false;
    const isPending = rule ? rule.approvalStatus !== 'approved' : false;
    const isUsable =
      coupon.isActive &&
      !isExpired &&
      !isPending &&
      coupon.usageCount < coupon.usageLimit;

    return {
      coupon,
      rule,
      isExpired,
      isPending,
      isUsable,
    };
  });

  const filteredOffers = offersList.filter(({ coupon, rule }) => {
    if (!rule) return false;

    // Filter by discount category
    if (selectedCategory !== 'All' && rule.discountCategory !== selectedCategory) {
      return false;
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchCode = coupon.code.toLowerCase().includes(q);
      const matchName = rule.name.toLowerCase().includes(q);
      const matchDesc = coupon.description.toLowerCase().includes(q);
      const matchCat = rule.applicableCategory.toLowerCase().includes(q);
      if (!matchCode && !matchName && !matchDesc && !matchCat) return false;
    }

    return true;
  });

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    showToast(`Coupon code ${code} copied to clipboard`, 'success');
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleApplyDirectly = (code: string) => {
    setAppliedCouponCode(code);
    showToast(`Coupon ${code} applied to checkout`, 'success');
    onNavigateToCheckout();
  };

  return (
    <div className="space-y-6">
      {/* Clean Hero Header with 3D Floating Badge */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-xs relative overflow-hidden"
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 mb-2">
              <Sparkles className="w-4 h-4" />
              <span className="tracking-wide uppercase text-[11px]">
                Discount Discovery & Active Coupons
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 mb-2">
              Verified Promotional Campaigns
            </h1>

            <p className="text-sm text-slate-600 leading-relaxed">
              Browse all 7 standardized discount categories defined in your business rules.
              Copy promo codes or apply them directly to your order basket with automatic 7-guard qualification.
            </p>

            {/* Clean unboxed metadata row per design constitution */}
            <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 pt-3 border-t border-slate-100">
              <span className="flex items-center gap-1.5 font-medium text-slate-700">
                <Clock className="w-3.5 h-3.5 text-indigo-600" />
                <span>Simulated Date: <strong className="font-mono text-slate-900">{simulatedDate}</strong></span>
              </span>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <span>
                Active Usable Coupons: <strong className="text-slate-900">{offersList.filter((o) => o.isUsable).length}</strong>
              </span>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <span>
                7 Categories Supported
              </span>
            </div>
          </div>

          {/* 3D Floating Isometric Discount Badge */}
          <div className="hidden sm:flex items-center justify-center lg:justify-end pr-2">
            <Floating3DBadge
              discountPercent="35%"
              label="SPECIAL OFFER"
              subtitle="7-GUARD VERIFIED"
            />
          </div>
        </div>
      </motion.div>

      {/* Filter and Search Controls */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder="Search by coupon code, rule name, category, or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs sm:text-sm pl-9 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </div>

          <div className="text-xs text-slate-500 flex items-center justify-end">
            Showing <strong className="mx-1 text-slate-900">{filteredOffers.length}</strong> campaigns
          </div>
        </div>

        {/* 7 Discount Categories Segmented Filter */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none text-xs">
          <span className="text-slate-400 font-medium mr-1.5 flex items-center gap-1 whitespace-nowrap text-[11px]">
            <Layers className="w-3.5 h-3.5" /> Category:
          </span>
          {discountCategories.map((cat) => {
            const active = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition cursor-pointer ${
                  active
                    ? 'bg-slate-900 text-white shadow-2xs font-semibold'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Offers Grid with Animated Layout */}
      <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence mode="popLayout">
          {filteredOffers.map(({ coupon, rule, isExpired, isPending, isUsable }) => {
            if (!rule) return null;
            const isCopied = copiedCode === coupon.code;
            const usagePercent = Math.min(
              100,
              Math.round((coupon.usageCount / coupon.usageLimit) * 100)
            );

            return (
              <motion.div
                key={coupon.id}
                layout
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.2 }}
                className="h-full"
              >
                <Tilt3DCard
                  maxTilt={10}
                  glare={true}
                  className={`h-full bg-white rounded-xl border flex flex-col justify-between overflow-hidden shadow-2xs transition-colors ${
                    isUsable
                      ? 'border-slate-200 hover:border-indigo-300 hover:shadow-md'
                      : 'border-slate-200 bg-slate-50/70 opacity-75'
                  }`}
                >
                  {/* Card Header & Content */}
                <div className="p-5">
                  {/* Category and Status */}
                  <div className="flex items-center justify-between text-xs mb-3">
                    <span className="font-semibold text-indigo-700 text-xs">
                      {rule.discountCategory}
                    </span>

                    {/* Status Text Indicator */}
                    {!coupon.isActive ? (
                      <span className="text-[11px] font-medium text-slate-500">
                        Deactivated
                      </span>
                    ) : isPending ? (
                      <span className="text-[11px] font-medium text-amber-700">
                        Pending Approval
                      </span>
                    ) : isExpired ? (
                      <span className="text-[11px] font-medium text-rose-600">
                        Expired
                      </span>
                    ) : coupon.usageCount >= coupon.usageLimit ? (
                      <span className="text-[11px] font-medium text-orange-600">
                        Limit Reached
                      </span>
                    ) : (
                      <span className="text-[11px] font-medium text-emerald-700 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Active
                      </span>
                    )}
                  </div>

                  {/* Value */}
                  <div className="flex items-baseline gap-2 mb-1.5">
                    <span className="text-2xl font-black text-slate-900 tracking-tight">
                      {rule.discountType === 'percentage'
                        ? `${rule.discountValue}% OFF`
                        : `₹${rule.discountValue.toLocaleString('en-IN')} FLAT OFF`}
                    </span>
                    {rule.maxDiscountCap && (
                      <span className="text-xs text-slate-500">
                        (Cap: ₹{rule.maxDiscountCap.toLocaleString('en-IN')})
                      </span>
                    )}
                  </div>

                  <h3 className="font-semibold text-slate-900 text-sm mb-1 leading-snug">
                    {rule.name}
                  </h3>
                  <p className="text-xs text-slate-600 mb-4 line-clamp-2 leading-relaxed">
                    {coupon.description}
                  </p>

                  {/* Clean unboxed terms */}
                  <div className="space-y-1.5 text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Target Category</span>
                      <strong className="text-slate-800 font-medium">
                        {rule.applicableCategory}
                      </strong>
                    </div>
                    {rule.minOrderValue ? (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Min. Order</span>
                        <strong className="text-slate-800 font-medium">
                          ₹{rule.minOrderValue.toLocaleString('en-IN')}
                        </strong>
                      </div>
                    ) : null}
                    {rule.minQuantity && rule.minQuantity > 1 ? (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Min. Quantity</span>
                        <strong className="text-slate-800 font-medium">
                          {rule.minQuantity} items
                        </strong>
                      </div>
                    ) : null}
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        Valid Until
                      </span>
                      <span
                        className={`font-medium ${
                          isExpired ? 'text-rose-600 line-through' : 'text-slate-700'
                        }`}
                      >
                        {rule.validTo}
                      </span>
                    </div>
                  </div>

                  {/* Usage limit bar */}
                  <div className="mt-3.5">
                    <div className="flex justify-between text-[11px] text-slate-500 mb-1">
                      <span>Quota Used</span>
                      <span>
                        {coupon.usageCount} / {coupon.usageLimit}
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <motion.div
                        className={`h-full rounded-full ${
                          usagePercent >= 90
                            ? 'bg-rose-500'
                            : usagePercent >= 60
                            ? 'bg-amber-500'
                            : 'bg-indigo-600'
                        }`}
                        initial={{ width: 0 }}
                        animate={{ width: `${usagePercent}%` }}
                        transition={{ duration: 0.4, ease: 'easeOut' }}
                      />
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="bg-slate-50/80 px-4 py-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  {/* Coupon Code Block */}
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-md border border-slate-200 font-mono font-bold text-xs text-indigo-700 tracking-wider shadow-2xs"
                  >
                    <span>{coupon.code}</span>
                    <button
                      onClick={() => handleCopy(coupon.code)}
                      className="text-slate-400 hover:text-indigo-600 transition p-0.5 cursor-pointer"
                      title="Copy coupon code"
                    >
                      {isCopied ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </motion.div>

                  {/* Apply Button */}
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleApplyDirectly(coupon.code)}
                    disabled={!isUsable}
                    className={`text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition cursor-pointer ${
                      isUsable
                        ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs'
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    <span>Apply to Cart</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </motion.button>
                </div>
              </Tilt3DCard>
            </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>

      {filteredOffers.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl border border-slate-200 p-8">
          <Tag className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-800">
            No matching discount offers found
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Try adjusting your category filter or search query.
          </p>
        </div>
      )}
    </div>
  );
}
