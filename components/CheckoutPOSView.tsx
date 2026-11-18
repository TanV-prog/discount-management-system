'use client';

import React, { useState } from 'react';
import { useDMS } from '@/lib/dms-context';
import { OrderTransaction, Product } from '@/types/dms';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  Tag,
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Receipt,
  ArrowRight,
  Info,
  Check,
  ShoppingBag,
  ChevronDown,
  Printer,
  Sparkles,
} from 'lucide-react';

export function CheckoutPOSView() {
  const {
    products,
    cart,
    addToCart,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    appliedCouponCode,
    setAppliedCouponCode,
    calculationResult,
    executeCheckout,
    currentUser,
    simulatedDate,
    showToast,
  } = useDMS();

  const [localCode, setLocalCode] = useState<string | null>(null);
  const displayCode = localCode !== null ? localCode : appliedCouponCode;
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [customerName, setCustomerName] = useState<string>(
    currentUser.role === 'Customer' ? currentUser.name : 'Walk-in Client'
  );
  const [customerEmail, setCustomerEmail] = useState<string>(
    currentUser.role === 'Customer' ? currentUser.email : 'client@pos-retail.com'
  );
  const [completedOrder, setCompletedOrder] = useState<OrderTransaction | null>(null);
  const [showGuardDetails, setShowGuardDetails] = useState<boolean>(true);

  const categories = ['All', 'Electronics', 'Fashion & Apparel', 'Home & Kitchen', 'Books & Stationery'];

  const filteredProducts = products.filter((p) => {
    if (selectedCategory === 'All') return true;
    return p.category === selectedCategory;
  });

  const cartSubtotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const totalQuantity = cart.reduce((acc, item) => acc + item.quantity, 0);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = displayCode.trim();
    setAppliedCouponCode(trimmed);
    setLocalCode(null);
    if (trimmed) {
      showToast(`Evaluating coupon "${trimmed}"`, 'info');
    }
  };

  const handleQuickSelectCoupon = (code: string) => {
    setLocalCode(null);
    setAppliedCouponCode(code);
    showToast(`Loaded test preset: ${code}`, 'info');
  };

  const handleRemoveCoupon = () => {
    setLocalCode(null);
    setAppliedCouponCode('');
    showToast('Removed coupon', 'info');
  };

  const handleCompleteOrder = () => {
    if (cart.length === 0) return;
    const order = executeCheckout(customerName, customerEmail);
    if (order) {
      setCompletedOrder(order);
      showToast(`Order ${order.orderNumber} completed successfully!`, 'success');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top POS Information Strip */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs flex flex-wrap items-center justify-between gap-3"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <ShoppingCart className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 leading-tight">
              Point of Sale & Checkout Terminal
            </h2>
            <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
              <span>Real-time evaluation with 7-Guard Engine</span>
              <span aria-hidden="true">·</span>
              <span>Operator: <strong className="text-slate-800 font-medium">{currentUser.name}</strong> ({currentUser.role})</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500 font-medium">Clock:</span>
          <span className="font-mono bg-slate-100 text-slate-800 px-2 py-1 rounded border border-slate-200 font-semibold">
            {simulatedDate}
          </span>
        </div>
      </motion.div>

      {/* Main Grid: Products Catalog (Left) + Cart & 7-Guard Engine (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Product Catalog (5 cols on lg) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-indigo-600" />
                <span>Product Catalog</span>
              </h3>
              <span className="text-xs text-slate-400">
                {filteredProducts.length} items
              </span>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1 overflow-x-auto pb-2 scrollbar-none text-xs">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2.5 py-1 rounded-md font-medium whitespace-nowrap transition cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-slate-900 text-white font-semibold'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Product Item Cards */}
            <div className="mt-3 space-y-2 max-h-[540px] overflow-y-auto pr-1">
              {filteredProducts.map((product) => {
                const inCart = cart.find((item) => item.product.id === product.id);
                return (
                  <motion.div
                    key={product.id}
                    layout
                    whileHover={{ scale: 1.01 }}
                    transition={{ duration: 0.15 }}
                    className="p-3 rounded-lg border border-slate-100 hover:border-indigo-200 bg-slate-50/50 hover:bg-slate-50 flex items-center justify-between gap-3 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 text-[11px] text-slate-500">
                        <span className="font-medium text-indigo-600">{product.category}</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono">{product.sku}</span>
                      </div>
                      <h4 className="text-xs font-semibold text-slate-800 truncate mt-0.5">
                        {product.name}
                      </h4>
                      <p className="text-xs font-bold text-slate-900 mt-0.5">
                        ₹{product.price.toLocaleString('en-IN')}
                      </p>
                    </div>

                    <div>
                      {inCart ? (
                        <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg p-1 shadow-2xs">
                          <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={() => updateCartQuantity(product.id, inCart.quantity - 1)}
                            className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition cursor-pointer"
                            title="Decrease quantity"
                          >
                            <Minus className="w-3 h-3" />
                          </motion.button>
                          <span className="w-6 text-center text-xs font-bold text-slate-900">
                            {inCart.quantity}
                          </span>
                          <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={() => updateCartQuantity(product.id, inCart.quantity + 1)}
                            className="w-6 h-6 rounded bg-indigo-50 hover:bg-indigo-100 text-indigo-600 flex items-center justify-center transition cursor-pointer"
                            title="Increase quantity"
                          >
                            <Plus className="w-3 h-3" />
                          </motion.button>
                        </div>
                      ) : (
                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          onClick={() => addToCart(product)}
                          className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 shadow-2xs transition cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add</span>
                        </motion.button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Order Basket & 7-Guard Calculation Engine (7 cols on lg) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Cart Items List */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-4 sm:p-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900">Active Order Basket</h3>
                <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-semibold">
                  {totalQuantity} {totalQuantity === 1 ? 'item' : 'items'}
                </span>
              </div>
              {cart.length > 0 && (
                <button
                  onClick={clearCart}
                  className="text-xs text-rose-600 hover:text-rose-700 font-medium flex items-center gap-1 transition cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear Cart</span>
                </button>
              )}
            </div>

            {cart.length === 0 ? (
              <div className="py-8 text-center text-slate-400">
                <ShoppingCart className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-xs">Your basket is empty. Add products from the catalog to test discount calculation.</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1 mb-4">
                <AnimatePresence mode="popLayout">
                  {cart.map((item) => (
                    <motion.div
                      key={item.product.id}
                      layout
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      transition={{ duration: 0.18 }}
                      className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 bg-slate-50/60"
                    >
                      <div className="min-w-0 flex-1 pr-2">
                        <div className="text-[10px] text-slate-500 font-medium">
                          {item.product.category}
                        </div>
                        <p className="text-xs font-semibold text-slate-800 truncate">
                          {item.product.name}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          ₹{item.product.price.toLocaleString('en-IN')} × {item.quantity} ={' '}
                          <strong className="text-slate-900">
                            ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
                          </strong>
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 bg-white border border-slate-200 rounded p-0.5">
                          <button
                            onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                            className="w-5 h-5 flex items-center justify-center text-slate-600 hover:bg-slate-100 rounded cursor-pointer"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-5 text-center text-xs font-bold">{item.quantity}</span>
                          <button
                            onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                            className="w-5 h-5 flex items-center justify-center text-indigo-600 hover:bg-indigo-50 rounded cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <button
                          onClick={() => removeFromCart(item.product.id)}
                          className="text-slate-400 hover:text-rose-600 p-1 transition cursor-pointer"
                          title="Remove product"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}

            {/* Coupon Code Input Form */}
            <div className="pt-3 border-t border-slate-100">
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="Enter coupon code (e.g. FESTIVAL20, CLEAR35, BULK1500)..."
                    value={displayCode}
                    onChange={(e) => setLocalCode(e.target.value.toUpperCase())}
                    className="w-full text-xs sm:text-sm pl-9 pr-3 py-2 border border-slate-200 rounded-lg font-mono uppercase focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  />
                  <Tag className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                </div>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition shadow-xs cursor-pointer"
                >
                  Verify & Apply
                </motion.button>
                {appliedCouponCode && (
                  <button
                    type="button"
                    onClick={handleRemoveCoupon}
                    className="px-2.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs font-medium transition cursor-pointer"
                    title="Remove applied coupon"
                  >
                    Clear
                  </button>
                )}
              </form>

              {/* Quick Coupon Preset Pills for testing guards */}
              <div className="mt-2.5">
                <span className="text-[11px] font-medium text-slate-400 mr-1.5">
                  Test Presets:
                </span>
                <div className="inline-flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleQuickSelectCoupon('FESTIVAL20')}
                    className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition cursor-pointer"
                    title="20% on Electronics (valid)"
                  >
                    FESTIVAL20 (Valid)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickSelectCoupon('BULK1500')}
                    className="text-[11px] font-mono px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition cursor-pointer"
                    title="Volume discount 4+ items"
                  >
                    BULK1500 (Qty Guard)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickSelectCoupon('CLEAR35')}
                    className="text-[11px] font-mono px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 transition cursor-pointer"
                    title="Fashion category check"
                  >
                    CLEAR35 (Category Guard)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickSelectCoupon('EXHAUSTED500')}
                    className="text-[11px] font-mono px-2 py-0.5 rounded bg-orange-50 text-orange-700 border border-orange-200 hover:bg-orange-100 transition cursor-pointer"
                    title="Exhausted usage limit guard test"
                  >
                    EXHAUSTED500 (Limit Guard)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickSelectCoupon('DISABLED20')}
                    className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-300 hover:bg-slate-200 transition cursor-pointer"
                    title="Deactivated coupon test"
                  >
                    DISABLED20 (Inactive Guard)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickSelectCoupon('SUMMER25')}
                    className="text-[11px] font-mono px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 transition cursor-pointer"
                    title="Expired campaign guard test"
                  >
                    SUMMER25 (Expiry Guard)
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 7-GUARD ENGINE LIVE AUDIT PANEL */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <h4 className="text-xs font-bold tracking-wide uppercase">
                  7-Guard Application Engine Sequence
                </h4>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    calculationResult.isEligible
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                  }`}
                >
                  {calculationResult.isEligible ? 'QUALIFIED' : 'NOT APPLIED'}
                </span>
                <button
                  onClick={() => setShowGuardDetails(!showGuardDetails)}
                  className="text-[11px] text-slate-400 hover:text-white transition cursor-pointer flex items-center gap-1"
                >
                  <span>{showGuardDetails ? 'Collapse' : 'Expand'}</span>
                  <ChevronDown
                    className={`w-3 h-3 transition-transform ${
                      showGuardDetails ? 'rotate-180' : ''
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Diagnostic Message */}
            <div
              className={`p-3 text-xs border-b flex items-center gap-2.5 ${
                calculationResult.isEligible
                  ? 'bg-emerald-50/80 border-emerald-100 text-emerald-900'
                  : appliedCouponCode
                  ? 'bg-amber-50/80 border-amber-100 text-amber-900'
                  : 'bg-slate-50 border-slate-100 text-slate-600'
              }`}
            >
              {calculationResult.isEligible ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : appliedCouponCode ? (
                <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
              ) : (
                <Info className="w-4 h-4 text-slate-400 shrink-0" />
              )}
              <span className="font-medium">{calculationResult.statusMessage}</span>
            </div>

            {/* Guard Checklist with Smooth Accordion */}
            <AnimatePresence>
              {showGuardDetails && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="p-3 bg-slate-50/50 space-y-2 overflow-hidden"
                >
                  {calculationResult.guardChecks.map((guard) => (
                    <motion.div
                      key={guard.stepNumber}
                      whileHover={{ scale: 1.01, x: 2 }}
                      transition={{ duration: 0.15 }}
                      className={`p-2.5 rounded-lg border text-xs flex items-start gap-2.5 transition shadow-2xs ${
                        guard.passed
                          ? 'bg-white border-emerald-200 text-slate-800 hover:border-emerald-300 hover:shadow-xs'
                          : 'bg-rose-50/70 border-rose-200 text-rose-950'
                      }`}
                    >
                      <div className="mt-0.5 shrink-0">
                        {guard.passed ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <XCircle className="w-4 h-4 text-rose-600" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-semibold text-slate-900">
                            Guard {guard.stepNumber}: {guard.title}
                          </span>
                          <span
                            className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded ${
                              guard.passed
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-rose-200 text-rose-900'
                            }`}
                          >
                            {guard.passed ? 'PASSED' : 'REJECTED'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 mt-0.5">{guard.message}</p>
                        {guard.detail && (
                          <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                            ↳ {guard.detail}
                          </p>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Financial Breakdown & Order Completion */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 space-y-4">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Financial Breakdown & Final Payable Amount
            </h4>

            <div className="space-y-2 text-xs border-b border-slate-100 pb-3">
              <div className="flex justify-between text-slate-600">
                <span>Original Order Subtotal:</span>
                <span className="font-semibold text-slate-900">
                  ₹{cartSubtotal.toLocaleString('en-IN')}
                </span>
              </div>

              {calculationResult.discountAmount > 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex justify-between text-emerald-700 bg-emerald-50/60 p-2.5 rounded-lg border border-emerald-100"
                >
                  <div className="flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5" />
                    <span>
                      Discount Applied ({calculationResult.discountCategory} -{' '}
                      {calculationResult.appliedRule?.name}):
                    </span>
                  </div>
                  <span className="font-bold">
                    - ₹{calculationResult.discountAmount.toLocaleString('en-IN')}
                  </span>
                </motion.div>
              ) : (
                <div className="flex justify-between text-slate-500">
                  <span>Discount Applied:</span>
                  <span>₹0</span>
                </div>
              )}

              {calculationResult.maxCapApplied && (
                <p className="text-[11px] text-amber-700 bg-amber-50 px-2 py-1 rounded">
                  * Maximum discount ceiling cap reached. Capped at ₹
                  {calculationResult.appliedRule?.maxDiscountCap?.toLocaleString('en-IN')}.
                </p>
              )}
            </div>

            {/* Final Total Amount */}
            <div className="flex items-baseline justify-between pt-1">
              <div>
                <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold block">
                  Final Payable Amount
                </span>
                <span className="text-xs text-slate-400">
                  Inclusive of all verified deductions
                </span>
              </div>
              <div className="text-right">
                <motion.span
                  key={calculationResult.finalAmount}
                  initial={{ scale: 0.95 }}
                  animate={{ scale: 1 }}
                  className="text-2xl font-black text-slate-900 block"
                >
                  ₹{calculationResult.finalAmount.toLocaleString('en-IN')}
                </motion.span>
                {calculationResult.discountAmount > 0 && (
                  <span className="block text-xs font-bold text-emerald-600">
                    You save ₹{calculationResult.discountAmount.toLocaleString('en-IN')} (
                    {Math.round(
                      (calculationResult.discountAmount / calculationResult.originalAmount) * 100
                    )}
                    %)
                  </span>
                )}
              </div>
            </div>

            {/* Customer Details Form & Complete Sale Button */}
            <div className="pt-2 border-t border-slate-100 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="text-[11px] font-medium text-slate-500 block mb-1">
                    Customer Name
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-slate-500 block mb-1">
                    Customer Email
                  </label>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleCompleteOrder}
                disabled={cart.length === 0}
                className={`w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition shadow-xs cursor-pointer ${
                  cart.length > 0
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                <Receipt className="w-4 h-4" />
                <span>
                  Complete Order & Record Transaction (₹
                  {calculationResult.finalAmount.toLocaleString('en-IN')})
                </span>
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* Completed Order Receipt Modal with 3D Depth */}
      <AnimatePresence>
        {completedOrder && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4" style={{ perspective: 1200 }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.88, rotateX: 16, y: 25 }}
              animate={{ opacity: 1, scale: 1, rotateX: 0, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, rotateX: -8, y: 15 }}
              transition={{ type: 'spring', damping: 22, stiffness: 240 }}
              style={{ transformStyle: 'preserve-3d' }}
              className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200/90 relative overflow-hidden"
            >
              {/* 3D Top Accent Strip */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500" />

              <div className="text-center mb-4 pt-1">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-2 shadow-2xs">
                  <Check className="w-6 h-6 stroke-[3]" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Order Completed Successfully</h3>
                <p className="text-xs text-slate-500 font-mono">Invoice #{completedOrder.orderNumber}</p>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs space-y-1.5 mb-4">
                <div className="flex justify-between">
                  <span className="text-slate-500">Date & Time:</span>
                  <span className="font-medium text-slate-800">{completedOrder.timestamp}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Customer:</span>
                  <span className="font-medium text-slate-800">{completedOrder.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Sales Operator:</span>
                  <span className="font-medium text-slate-800">{completedOrder.roleInitiator}</span>
                </div>
                {completedOrder.couponCode && (
                  <div className="flex justify-between text-emerald-700 font-medium">
                    <span>Coupon Applied:</span>
                    <span>
                      {completedOrder.couponCode} ({completedOrder.discountCategory})
                    </span>
                  </div>
                )}
              </div>

              {/* Items summary */}
              <div className="border-t border-b border-slate-100 py-2.5 my-2 text-xs space-y-1">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Purchased Items ({completedOrder.items.length})
                </p>
                {completedOrder.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-slate-700">
                    <span>
                      {item.quantity}× {item.productName}
                    </span>
                    <span className="font-medium">₹{item.total.toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>

              {/* Financial summary */}
              <div className="space-y-1 text-xs pt-1 mb-5">
                <div className="flex justify-between text-slate-500">
                  <span>Subtotal:</span>
                  <span>₹{completedOrder.subtotal.toLocaleString('en-IN')}</span>
                </div>
                {completedOrder.discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-medium">
                    <span>Discount Savings:</span>
                    <span>- ₹{completedOrder.discountAmount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-bold text-slate-900 pt-1 border-t border-slate-200">
                  <span>Total Paid:</span>
                  <span>₹{completedOrder.finalAmount.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => window.print()}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Receipt</span>
                </button>
                <button
                  onClick={() => setCompletedOrder(null)}
                  className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition cursor-pointer"
                >
                  Close & New Sale
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
