'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  DiscountRule,
  Coupon,
  CartItem,
  OrderTransaction,
  ActivityLog,
  UserAccount,
  StakeholderRole,
  Product,
  DiscountCalculationResult,
} from '@/types/dms';
import {
  INITIAL_RULES,
  INITIAL_COUPONS,
  INITIAL_PRODUCTS,
  INITIAL_TRANSACTIONS,
  INITIAL_LOGS,
  INITIAL_USERS,
} from '@/lib/initial-data';
import { calculateDiscount } from '@/lib/discount-engine';

export interface ToastInfo {
  id: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
}

interface DMSContextType {
  currentUser: UserAccount;
  setCurrentUser: (user: UserAccount) => void;
  switchRole: (role: StakeholderRole) => void;
  simulatedDate: string;
  setSimulatedDate: (date: string) => void;

  // Toast Notifications
  toast: ToastInfo | null;
  showToast: (message: string, type?: ToastInfo['type']) => void;
  dismissToast: () => void;

  // Catalog & Cart
  products: Product[];
  cart: CartItem[];
  addToCart: (product: Product) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;

  // Rules & Coupons
  rules: DiscountRule[];
  coupons: Coupon[];
  createRule: (rule: Omit<DiscountRule, 'id'>) => void;
  updateRule: (rule: DiscountRule) => void;
  deleteRule: (id: string) => void;
  toggleRuleStatus: (id: string) => void;
  approveRule: (id: string, approved: boolean) => void;

  createCoupon: (coupon: Omit<Coupon, 'id' | 'usageCount'>) => void;
  updateCoupon: (coupon: Coupon) => void;
  toggleCouponActive: (id: string) => void;

  // Checkout & Transactions
  appliedCouponCode: string;
  setAppliedCouponCode: (code: string) => void;
  calculationResult: DiscountCalculationResult;
  executeCheckout: (customerName?: string, customerEmail?: string) => OrderTransaction | null;

  // Records & Analytics
  transactions: OrderTransaction[];
  activityLogs: ActivityLog[];
  users: UserAccount[];
  updateUserRole: (userId: string, newRole: StakeholderRole) => void;
  resetAllData: () => void;
}

const DMSContext = createContext<DMSContextType | undefined>(undefined);

const STORAGE_KEY_PREFIX = 'dms_v1_';

function readStorageItem<T>(key: string): T | null {
  try {
    const item = localStorage.getItem(`${STORAGE_KEY_PREFIX}${key}`);
    return item ? (JSON.parse(item) as T) : null;
  } catch {
    return null;
  }
}

export function DMSProvider({ children }: { children: React.ReactNode }) {
  // Track whether client-side localStorage has been loaded after hydration
  const [isStorageHydrated, setIsStorageHydrated] = useState(false);

  // Simulated system date (deterministic on SSR & initial client render)
  const [simulatedDate, setSimulatedDateState] = useState<string>('2026-10-21');

  // Users & Current Auth
  const [users, setUsers] = useState<UserAccount[]>(INITIAL_USERS);
  const [currentUser, setCurrentUserState] = useState<UserAccount>(INITIAL_USERS[2]);

  // Catalog, Cart, and Discounts
  const [products] = useState<Product[]>(INITIAL_PRODUCTS);
  const [cart, setCart] = useState<CartItem[]>([
    { product: INITIAL_PRODUCTS[0], quantity: 1 },
  ]);
  const [rules, setRules] = useState<DiscountRule[]>(INITIAL_RULES);
  const [coupons, setCoupons] = useState<Coupon[]>(INITIAL_COUPONS);
  const [appliedCouponCode, setAppliedCouponCode] = useState<string>('FESTIVAL20');

  // Records
  const [transactions, setTransactions] = useState<OrderTransaction[]>(INITIAL_TRANSACTIONS);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(INITIAL_LOGS);

  // Toast notifications state
  const [toast, setToast] = useState<ToastInfo | null>(null);

  const dismissToast = () => {
    setToast(null);
  };

  const showToast = (message: string, type: ToastInfo['type'] = 'info') => {
    const id = `toast-${Date.now()}`;
    setToast({ id, message, type });
    setTimeout(() => {
      setToast((current) => (current?.id === id ? null : current));
    }, 3500);
  };

  // Load persisted state from LocalStorage AFTER initial hydration
  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const storedDate = localStorage.getItem(`${STORAGE_KEY_PREFIX}date`);
        if (storedDate) setSimulatedDateState(storedDate);

        const storedUser = readStorageItem<UserAccount>('user');
        if (storedUser) setCurrentUserState(storedUser);

        const storedCart = readStorageItem<CartItem[]>('cart');
        if (storedCart) setCart(storedCart);

        const storedRules = readStorageItem<DiscountRule[]>('rules');
        if (storedRules) setRules(storedRules);

        const storedCoupons = readStorageItem<Coupon[]>('coupons');
        if (storedCoupons) setCoupons(storedCoupons);

        const storedTransactions = readStorageItem<OrderTransaction[]>('transactions');
        if (storedTransactions) setTransactions(storedTransactions);

        const storedLogs = readStorageItem<ActivityLog[]>('logs');
        if (storedLogs) setActivityLogs(storedLogs);
      } catch {
        // Storage disabled or unavailable
      } finally {
        setIsStorageHydrated(true);
      }
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  // Sync to LocalStorage on updates only after initial storage load completes
  useEffect(() => {
    if (!isStorageHydrated) return;
    try {
      localStorage.setItem(`${STORAGE_KEY_PREFIX}date`, simulatedDate);
      localStorage.setItem(`${STORAGE_KEY_PREFIX}rules`, JSON.stringify(rules));
      localStorage.setItem(`${STORAGE_KEY_PREFIX}coupons`, JSON.stringify(coupons));
      localStorage.setItem(`${STORAGE_KEY_PREFIX}cart`, JSON.stringify(cart));
      localStorage.setItem(`${STORAGE_KEY_PREFIX}transactions`, JSON.stringify(transactions));
      localStorage.setItem(`${STORAGE_KEY_PREFIX}logs`, JSON.stringify(activityLogs));
      localStorage.setItem(`${STORAGE_KEY_PREFIX}user`, JSON.stringify(currentUser));
    } catch {
      // Storage quota or disabled
    }
  }, [isStorageHydrated, simulatedDate, rules, coupons, cart, transactions, activityLogs, currentUser]);

  const logActivity = (
    action: string,
    details: string,
    type: ActivityLog['type']
  ) => {
    const newLog: ActivityLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: `${simulatedDate} ${new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`,
      actorName: currentUser.name,
      actorRole: currentUser.role,
      action,
      details,
      type,
    };
    setActivityLogs((prev) => [newLog, ...prev]);
  };

  const setSimulatedDate = (date: string) => {
    setSimulatedDateState(date);
    logActivity('System Date Changed', `Simulated date changed to ${date}`, 'modification');
    showToast(`System date set to ${date}`, 'info');
  };

  const setCurrentUser = (user: UserAccount) => {
    setCurrentUserState(user);
    logActivity('User Switched', `Active session switched to ${user.name} (${user.role})`, 'security');
  };

  const switchRole = (role: StakeholderRole) => {
    const existing = users.find((u) => u.role === role);
    if (existing) {
      setCurrentUser(existing);
    } else {
      const syntheticUser: UserAccount = {
        id: `usr-${role.toLowerCase().replace(/\s+/g, '-')}`,
        name: `${role} User`,
        email: `${role.toLowerCase().replace(/\s+/g, '.')}@dms-enterprise.internal`,
        role,
        joinedDate: '2026-01-01',
      };
      setCurrentUser(syntheticUser);
    }
    showToast(`Active persona switched to ${role}`, 'info');
  };

  // Cart operations
  const addToCart = (product: Product) => {
    setCart((prev) => {
      const idx = prev.findIndex((item) => item.product.id === product.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = { ...copy[idx], quantity: copy[idx].quantity + 1 };
        return copy;
      }
      return [...prev, { product, quantity: 1 }];
    });
    showToast(`Added "${product.name}" to cart`, 'success');
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
    showToast('Item removed from cart', 'info');
  };

  const clearCart = () => {
    setCart([]);
    showToast('Cart basket cleared', 'info');
  };

  // Rule operations
  const createRule = (newRuleData: Omit<DiscountRule, 'id'>) => {
    const id = `rule-${Date.now().toString(36)}`;
    const newRule: DiscountRule = {
      ...newRuleData,
      id,
    };
    setRules((prev) => [newRule, ...prev]);
    logActivity(
      'Rule Created',
      `Created ${newRule.discountCategory} discount rule "${newRule.name}" (${newRule.status}, ${newRule.approvalStatus})`,
      'creation'
    );
    showToast(`Discount rule "${newRule.name}" created`, 'success');
  };

  const updateRule = (updatedRule: DiscountRule) => {
    setRules((prev) => prev.map((r) => (r.id === updatedRule.id ? updatedRule : r)));
    logActivity(
      'Rule Updated',
      `Modified discount rule "${updatedRule.name}"`,
      'modification'
    );
    showToast(`Rule "${updatedRule.name}" updated`, 'info');
  };

  const deleteRule = (id: string) => {
    const rule = rules.find((r) => r.id === id);
    setRules((prev) => prev.filter((r) => r.id !== id));
    // Also remove or unlink coupons
    setCoupons((prev) => prev.filter((c) => c.ruleId !== id));
    if (rule) {
      logActivity(
        'Rule Deleted',
        `Removed discount rule "${rule.name}" and associated coupon codes`,
        'modification'
      );
      showToast(`Rule "${rule.name}" deleted`, 'warning');
    }
  };

  const toggleRuleStatus = (id: string) => {
    setRules((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          const nextStatus = r.status === 'active' ? 'inactive' : 'active';
          logActivity(
            'Rule Status Changed',
            `Rule "${r.name}" set to ${nextStatus}`,
            'modification'
          );
          showToast(`Rule "${r.name}" set to ${nextStatus}`, 'info');
          return { ...r, status: nextStatus };
        }
        return r;
      })
    );
  };

  const approveRule = (id: string, approved: boolean) => {
    setRules((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          const status = approved ? 'approved' : 'rejected';
          const ruleStatus = approved ? 'active' : 'inactive';
          logActivity(
            approved ? 'Rule Approved' : 'Rule Rejected',
            `${approved ? 'Approved' : 'Rejected'} discount request "${r.name}"`,
            'approval'
          );
          showToast(
            `Rule "${r.name}" ${approved ? 'approved & activated' : 'rejected'}`,
            approved ? 'success' : 'warning'
          );
          return { ...r, approvalStatus: status, status: ruleStatus };
        }
        return r;
      })
    );
  };

  // Coupon operations
  const createCoupon = (couponData: Omit<Coupon, 'id' | 'usageCount'>) => {
    const newCoupon: Coupon = {
      ...couponData,
      id: `cp-${Date.now().toString(36)}`,
      usageCount: 0,
    };
    setCoupons((prev) => [newCoupon, ...prev]);
    logActivity(
      'Coupon Created',
      `Generated coupon code "${newCoupon.code}" (Limit: ${newCoupon.usageLimit})`,
      'creation'
    );
    showToast(`Generated coupon "${newCoupon.code}"`, 'success');
  };

  const updateCoupon = (updatedCoupon: Coupon) => {
    setCoupons((prev) => prev.map((c) => (c.id === updatedCoupon.id ? updatedCoupon : c)));
    logActivity(
      'Coupon Modified',
      `Updated parameters for coupon "${updatedCoupon.code}"`,
      'modification'
    );
    showToast(`Updated coupon "${updatedCoupon.code}"`, 'info');
  };

  const toggleCouponActive = (id: string) => {
    setCoupons((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          const nextActive = !c.isActive;
          logActivity(
            'Coupon Toggle',
            `Coupon "${c.code}" ${nextActive ? 'activated' : 'deactivated'}`,
            'modification'
          );
          showToast(`Coupon "${c.code}" ${nextActive ? 'activated' : 'deactivated'}`, 'info');
          return { ...c, isActive: nextActive };
        }
        return c;
      })
    );
  };

  const updateUserRole = (userId: string, newRole: StakeholderRole) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          logActivity(
            'Role Reassigned',
            `Changed ${u.name}'s role from ${u.role} to ${newRole}`,
            'security'
          );
          return { ...u, role: newRole };
        }
        return u;
      })
    );
  };

  // Real-time discount calculation
  const cartSubtotal = cart.reduce(
    (acc, item) => acc + item.product.price * item.quantity,
    0
  );

  const calculationResult = calculateDiscount({
    orderTotal: cartSubtotal,
    couponCode: appliedCouponCode,
    cartItems: cart,
    currentDateStr: simulatedDate,
    rules,
    coupons,
  });

  // Execute checkout and store transaction
  const executeCheckout = (customerName?: string, customerEmail?: string) => {
    if (cart.length === 0) return null;

    const orderNum = `ORD-${Math.floor(10000 + Math.random() * 90000)}`;
    const custName = customerName || (currentUser.role === 'Customer' ? currentUser.name : 'Walk-in Customer');
    const custEmail = customerEmail || (currentUser.role === 'Customer' ? currentUser.email : 'guest@retailpos.com');

    // If a coupon was eligible and applied, increment its usage counter
    if (calculationResult.isEligible && calculationResult.appliedCoupon) {
      const code = calculationResult.appliedCoupon.code;
      setCoupons((prev) =>
        prev.map((c) =>
          c.code.toUpperCase() === code.toUpperCase()
            ? { ...c, usageCount: c.usageCount + 1 }
            : c
        )
      );
    }

    const newTransaction: OrderTransaction = {
      id: `tx-${Date.now()}`,
      orderNumber: orderNum,
      timestamp: `${simulatedDate} ${new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`,
      customerName: custName,
      customerEmail: custEmail,
      roleInitiator: currentUser.role,
      subtotal: calculationResult.originalAmount,
      discountAmount: calculationResult.discountAmount,
      finalAmount: calculationResult.finalAmount,
      couponCode: calculationResult.isEligible ? calculationResult.appliedCoupon?.code : undefined,
      ruleName: calculationResult.isEligible ? calculationResult.appliedRule?.name : undefined,
      discountCategory: calculationResult.discountCategory,
      totalQuantity: cart.reduce((acc, item) => acc + item.quantity, 0),
      items: cart.map((item) => ({
        productName: item.product.name,
        category: item.product.category,
        unitPrice: item.product.price,
        quantity: item.quantity,
        total: item.product.price * item.quantity,
      })),
      status: 'Completed',
    };

    setTransactions((prev) => [newTransaction, ...prev]);

    logActivity(
      'Transaction Recorded',
      `Order ${orderNum} completed for ₹${newTransaction.finalAmount.toLocaleString('en-IN')}${
        newTransaction.discountAmount > 0
          ? ` (Saved ₹${newTransaction.discountAmount.toLocaleString('en-IN')} via ${newTransaction.couponCode})`
          : ' (Full price)'
      }`,
      'redemption'
    );

    // Clear cart and coupon code after successful purchase
    setCart([]);
    setAppliedCouponCode('');

    return newTransaction;
  };

  const resetAllData = () => {
    setRules(INITIAL_RULES);
    setCoupons(INITIAL_COUPONS);
    setTransactions(INITIAL_TRANSACTIONS);
    setActivityLogs(INITIAL_LOGS);
    setUsers(INITIAL_USERS);
    setSimulatedDateState('2026-10-21');
    setCart([{ product: INITIAL_PRODUCTS[0], quantity: 1 }]);
    setAppliedCouponCode('FESTIVAL20');
    try {
      localStorage.clear();
    } catch {
      // ignore
    }
  };

  return (
    <DMSContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        switchRole,
        simulatedDate,
        setSimulatedDate,
        toast,
        showToast,
        dismissToast,
        products,
        cart,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        rules,
        coupons,
        createRule,
        updateRule,
        deleteRule,
        toggleRuleStatus,
        approveRule,
        createCoupon,
        updateCoupon,
        toggleCouponActive,
        appliedCouponCode,
        setAppliedCouponCode,
        calculationResult,
        executeCheckout,
        transactions,
        activityLogs,
        users,
        updateUserRole,
        resetAllData,
      }}
    >
      {children}
    </DMSContext.Provider>
  );
}

export function useDMS() {
  const context = useContext(DMSContext);
  if (!context) {
    throw new Error('useDMS must be used within a DMSProvider');
  }
  return context;
}
