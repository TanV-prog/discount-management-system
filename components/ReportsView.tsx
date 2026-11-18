'use client';

import React, { useState } from 'react';
import { useDMS } from '@/lib/dms-context';
import { DiscountCategory } from '@/types/dms';
import { motion } from 'motion/react';
import {
  BarChart3,
  TrendingUp,
  Download,
  DollarSign,
  Ticket,
  Calendar,
  Layers,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  Coins,
} from 'lucide-react';

export function ReportsView() {
  const {
    transactions,
    rules,
    coupons,
    simulatedDate,
  } = useDMS();

  const [filterCategory, setFilterCategory] = useState<string>('All');

  // KPI Computations
  const totalGrossSales = transactions.reduce((acc, t) => acc + t.subtotal, 0);
  const totalDiscountsGranted = transactions.reduce((acc, t) => acc + t.discountAmount, 0);
  const totalNetRevenue = transactions.reduce((acc, t) => acc + t.finalAmount, 0);
  const avgDiscountRate =
    totalGrossSales > 0 ? Math.round((totalDiscountsGranted / totalGrossSales) * 100) : 0;

  const activeRulesCount = rules.filter(
    (r) => r.status === 'active' && r.validTo >= simulatedDate
  ).length;

  const expiredRulesCount = rules.filter(
    (r) => r.status === 'expired' || r.validTo < simulatedDate
  ).length;

  const totalCouponsIssued = coupons.length;
  const totalRedemptions = coupons.reduce((acc, c) => acc + c.usageCount, 0);

  // Performance by 7 Discount Categories
  const categoriesList: DiscountCategory[] = [
    'Seasonal',
    'Quantity',
    'Clearance',
    'Cash',
    'Rebate',
    'Trade/Functional',
    'Special Offer',
  ];

  const categoryStats = categoriesList.map((cat) => {
    const txForCat = transactions.filter((t) => t.discountCategory === cat);
    const count = txForCat.length;
    const discountSum = txForCat.reduce((acc, t) => acc + t.discountAmount, 0);
    const revenueSum = txForCat.reduce((acc, t) => acc + t.finalAmount, 0);

    return {
      category: cat,
      ordersCount: count,
      discountSum,
      revenueSum,
      percentOfAllDiscounts:
        totalDiscountsGranted > 0 ? Math.round((discountSum / totalDiscountsGranted) * 100) : 0,
    };
  });

  // Filter transactions
  const filteredTransactions = transactions.filter((t) => {
    if (filterCategory === 'All') return true;
    return t.discountCategory === filterCategory;
  });

  // CSV Export function
  const handleExportCSV = () => {
    const headers = [
      'Order Number',
      'Date & Time',
      'Customer',
      'Email',
      'Sales Role',
      'Subtotal (INR)',
      'Discount (INR)',
      'Final Amount (INR)',
      'Coupon Code',
      'Rule Name',
      'Discount Category',
      'Items Count',
      'Status',
    ];

    const rows = transactions.map((t) => [
      t.orderNumber,
      `"${t.timestamp}"`,
      `"${t.customerName}"`,
      `"${t.customerEmail}"`,
      `"${t.roleInitiator}"`,
      t.subtotal,
      t.discountAmount,
      t.finalAmount,
      `"${t.couponCode || 'N/A'}"`,
      `"${t.ruleName || 'None'}"`,
      `"${t.discountCategory || 'Standard'}"`,
      t.totalQuantity,
      t.status,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `DMS_Discount_Report_${simulatedDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-bold text-slate-900">
              Discount Performance & Financial Reports
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time analytics on discount allowances, coupon redemptions, gross margins, and rule efficacy.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-2xs transition"
        >
          <Download className="w-4 h-4" />
          <span>Export Audit Report (CSV)</span>
        </button>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Total Discounts Granted
          </span>
          <div className="text-xl sm:text-2xl font-black text-rose-600 mt-1">
            ₹{totalDiscountsGranted.toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-slate-500 mt-0.5 block">
            Across {transactions.length} total orders
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Net Revenue Realized
          </span>
          <div className="text-xl sm:text-2xl font-black text-emerald-600 mt-1">
            ₹{totalNetRevenue.toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-slate-500 mt-0.5 block">
            From ₹{totalGrossSales.toLocaleString('en-IN')} gross sales
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Average Discount Margin
          </span>
          <div className="text-xl sm:text-2xl font-black text-indigo-600 mt-1">
            {avgDiscountRate}%
          </div>
          <span className="text-[11px] text-slate-500 mt-0.5 block">
            Overall promotional deduction
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Active vs Expired Rules
          </span>
          <div className="text-xl sm:text-2xl font-black text-slate-900 mt-1 flex items-baseline gap-2">
            <span className="text-emerald-600">{activeRulesCount}</span>
            <span className="text-slate-300">/</span>
            <span className="text-rose-500">{expiredRulesCount}</span>
          </div>
          <span className="text-[11px] text-slate-500 mt-0.5 block">
            {totalRedemptions} coupon redemptions
          </span>
        </div>
      </div>

      {/* Breakdown by 7 Discount Categories */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Layers className="w-4 h-4 text-indigo-600" />
          <span>Performance by 7 Discount Categories</span>
        </h3>

        <div className="space-y-3">
          {categoryStats.map((stat) => (
            <div key={stat.category} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-800">{stat.category}</span>
                  <span className="text-[11px] text-slate-400">
                    ({stat.ordersCount} {stat.ordersCount === 1 ? 'sale' : 'sales'})
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-slate-500">
                    Discount: <strong className="text-rose-600">₹{stat.discountSum.toLocaleString('en-IN')}</strong>
                  </span>
                  <span className="text-slate-400 font-mono text-[11px]">
                    {stat.percentOfAllDiscounts}%
                  </span>
                </div>
              </div>

              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <motion.div
                  className="bg-indigo-600 h-full rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.max(4, stat.percentOfAllDiscounts)}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Live Coupon Usage Statistics */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5">
        <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
          <Ticket className="w-4 h-4 text-indigo-600" />
          <span>Live Coupon Redemptions Against Allotted Quotas</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {coupons.map((coupon) => {
            const rule = rules.find((r) => r.id === coupon.ruleId);
            const usagePercent = Math.min(
              100,
              Math.round((coupon.usageCount / coupon.usageLimit) * 100)
            );

            return (
              <div
                key={coupon.id}
                className="p-3 rounded-lg border border-slate-100 bg-slate-50/60 text-xs space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                    {coupon.code}
                  </span>
                  <span
                    className={`text-[10px] font-semibold px-1.5 py-0.2 rounded ${
                      coupon.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {coupon.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <div className="text-[11px] text-slate-600 truncate">
                  {rule?.name || 'Discount Rule'}
                </div>

                <div>
                  <div className="flex justify-between text-[10px] text-slate-500 mb-0.5">
                    <span>Usage: {coupon.usageCount} / {coupon.usageLimit}</span>
                    <span>{usagePercent}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        usagePercent >= 100 ? 'bg-rose-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${usagePercent}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Transactions Audit Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-sm font-bold text-slate-900">
            Recent Order Transactions & Discount Logs ({filteredTransactions.length})
          </h3>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400">Filter by category:</span>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="border border-slate-200 rounded px-2 py-1 text-xs bg-slate-50"
            >
              <option value="All">All Categories</option>
              {categoriesList.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[700px]">
            <thead className="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Order ID & Date</th>
                <th className="py-3 px-3">Customer / Staff</th>
                <th className="py-3 px-3">Subtotal</th>
                <th className="py-3 px-3">Discount Applied</th>
                <th className="py-3 px-3">Final Amount</th>
                <th className="py-3 px-3">Coupon / Category</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredTransactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-50/70 transition">
                  <td className="py-3 px-4">
                    <div className="font-mono font-bold text-slate-900">{tx.orderNumber}</div>
                    <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                      <Calendar className="w-3 h-3" />
                      <span>{tx.timestamp}</span>
                    </div>
                  </td>

                  <td className="py-3 px-3">
                    <div className="font-medium text-slate-800">{tx.customerName}</div>
                    <div className="text-[10px] text-slate-400">Role: {tx.roleInitiator}</div>
                  </td>

                  <td className="py-3 px-3 font-medium text-slate-700">
                    ₹{tx.subtotal.toLocaleString('en-IN')}
                  </td>

                  <td className="py-3 px-3">
                    {tx.discountAmount > 0 ? (
                      <span className="font-bold text-rose-600">
                        - ₹{tx.discountAmount.toLocaleString('en-IN')}
                      </span>
                    ) : (
                      <span className="text-slate-400">₹0</span>
                    )}
                  </td>

                  <td className="py-3 px-3 font-bold text-slate-900">
                    ₹{tx.finalAmount.toLocaleString('en-IN')}
                  </td>

                  <td className="py-3 px-3">
                    {tx.couponCode ? (
                      <div>
                        <span className="font-mono text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded text-[11px] font-semibold border border-indigo-100">
                          {tx.couponCode}
                        </span>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {tx.discountCategory}
                        </div>
                      </div>
                    ) : (
                      <span className="text-slate-400">Regular Sale</span>
                    )}
                  </td>

                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                      {tx.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
