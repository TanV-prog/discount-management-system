'use client';

import React, { useState } from 'react';
import { useDMS } from '@/lib/dms-context';
import { StakeholderRole } from '@/types/dms';
import { motion, AnimatePresence } from 'motion/react';
import {
  Tag,
  ShoppingCart,
  Sliders,
  Ticket,
  CheckCircle2,
  BarChart3,
  Users,
  Calendar,
  ChevronDown,
  UserCheck,
  RefreshCw,
  ShieldCheck,
  Menu,
  X,
  ChevronRight,
  Sparkles,
  Lock,
} from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onOpenAuth: () => void;
  onOpenDateSim: () => void;
}

export function Navbar({
  currentTab,
  setCurrentTab,
  onOpenAuth,
  onOpenDateSim,
}: NavbarProps) {
  const {
    currentUser,
    switchRole,
    simulatedDate,
    cart,
    rules,
    resetAllData,
  } = useDMS();

  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const cartItemCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const pendingApprovalsCount = rules.filter((r) => r.approvalStatus === 'pending').length;

  const roles: StakeholderRole[] = [
    'Customer',
    'Sales Staff',
    'Business Manager',
    'Marketing Team',
    'Administrator',
    'Accountant',
  ];

  const getRoleBadgeColor = (role: StakeholderRole) => {
    switch (role) {
      case 'Administrator':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Business Manager':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Sales Staff':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Marketing Team':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Accountant':
        return 'bg-cyan-50 text-cyan-700 border-cyan-200';
      case 'Customer':
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const navItems = [
    {
      id: 'offers',
      label: 'Offers',
      description: 'Discover active discounts & coupons',
      icon: Tag,
      roles: ['Customer', 'Sales Staff', 'Business Manager', 'Marketing Team', 'Administrator', 'Accountant'],
    },
    {
      id: 'checkout',
      label: 'Checkout & POS',
      description: 'Cart, orders & 7-guard engine',
      icon: ShoppingCart,
      badge: cartItemCount > 0 ? cartItemCount : null,
      roles: ['Customer', 'Sales Staff', 'Business Manager', 'Administrator'],
    },
    {
      id: 'rules',
      label: 'Rules',
      description: 'Discount criteria & caps across 7 categories',
      icon: Sliders,
      roles: ['Administrator', 'Business Manager', 'Marketing Team', 'Sales Staff'],
    },
    {
      id: 'coupons',
      label: 'Coupons',
      description: 'Unique codes, quotas & counters',
      icon: Ticket,
      roles: ['Administrator', 'Business Manager', 'Marketing Team'],
    },
    {
      id: 'approvals',
      label: 'Approvals',
      description: 'Executive review gate for proposals',
      icon: CheckCircle2,
      badge: pendingApprovalsCount > 0 ? pendingApprovalsCount : null,
      roles: ['Business Manager', 'Administrator'],
    },
    {
      id: 'reports',
      label: 'Reports',
      description: 'Financial KPIs, savings & CSV export',
      icon: BarChart3,
      roles: ['Administrator', 'Business Manager', 'Accountant', 'Marketing Team', 'Sales Staff'],
    },
    {
      id: 'users',
      label: 'Access & Audit',
      description: 'RBAC user directory & activity trail',
      icon: Users,
      roles: ['Administrator'],
    },
  ];

  const isRoleAuthorized = (allowedRoles: string[]) => {
    return allowedRoles.includes(currentUser.role);
  };

  const handleNavClick = (tabId: string) => {
    setCurrentTab(tabId);
    setMobileDrawerOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 transition-shadow">
        {/* Compact Environment Bar */}
        <div className="bg-slate-900 text-slate-300 text-xs px-3 sm:px-6 lg:px-8 py-1.5 flex items-center justify-between gap-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="tracking-wide text-[11px] sm:text-xs">DMS Enterprise</span>
            </div>
            <span className="text-slate-600 hidden md:inline" aria-hidden="true">·</span>
            <span className="text-slate-400 text-[11px] hidden md:inline">
              7-Guard Engine Active
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Simulated Date Controller Button */}
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={onOpenDateSim}
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 px-2 py-0.5 rounded transition text-xs border border-slate-700 cursor-pointer"
              title="Adjust system clock to verify date validity guards"
            >
              <Calendar className="w-3 h-3 text-indigo-400 shrink-0" />
              <span className="hidden sm:inline">Clock:</span>
              <strong className="text-white font-mono text-[11px] sm:text-xs">{simulatedDate}</strong>
            </motion.button>

            {/* Quick Reset Data */}
            <button
              onClick={() => {
                if (confirm('Reset all rules, coupons, and orders to initial demo state?')) {
                  resetAllData();
                }
              }}
              className="text-slate-400 hover:text-slate-200 text-xs flex items-center gap-1 transition p-0.5 cursor-pointer"
              title="Reset system database to clean initial state"
            >
              <RefreshCw className="w-3 h-3" />
              <span className="hidden sm:inline text-[11px]">Reset</span>
            </button>
          </div>
        </div>

        {/* Main Navigation Row */}
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16 gap-2">
            {/* Brand Logo & Title */}
            <div
              className="flex items-center gap-2.5 cursor-pointer group shrink-0"
              onClick={() => handleNavClick('offers')}
            >
              <motion.div
                whileHover={{ scale: 1.05, rotate: 6 }}
                whileTap={{ scale: 0.95 }}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-700 text-white flex items-center justify-center font-black text-lg shadow-sm shadow-indigo-200"
              >
                %
              </motion.div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-slate-900 text-base sm:text-lg tracking-tight group-hover:text-indigo-600 transition-colors">
                    DiscountMS
                  </span>
                  <span className="text-[9px] uppercase font-bold text-indigo-600 bg-indigo-50 px-1 py-0.2 rounded border border-indigo-100 hidden sm:inline">
                    Enterprise
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 hidden sm:block leading-none mt-0.5">
                  Centralized Discount System
                </p>
              </div>
            </div>

            {/* Desktop Nav Tabs with Gliding Animated Indicator (Role-Filtered) */}
            <nav className="hidden lg:flex items-center space-x-1 relative p-1 bg-slate-100/70 rounded-xl border border-slate-200/60">
              {navItems
                .filter((item) => isRoleAuthorized(item.roles))
                .map((item) => {
                  const active = currentTab === item.id;

                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavClick(item.id)}
                      className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors z-10 cursor-pointer ${
                        active
                          ? 'text-indigo-700 font-bold'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {active && (
                        <motion.div
                          layoutId="activeNavIndicator"
                          className="absolute inset-0 bg-white rounded-lg shadow-xs border border-slate-200/80 -z-10"
                          transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                        />
                      )}
                      <item.icon className={`w-3.5 h-3.5 ${active ? 'text-indigo-600' : 'text-slate-400'}`} />
                      <span>{item.label}</span>

                      {item.badge !== null && item.badge !== undefined && (
                        <motion.span
                          initial={{ scale: 0.8 }}
                          animate={{ scale: 1 }}
                          className={`ml-1 px-1.5 py-0.2 text-[10px] font-bold rounded-full ${
                            active ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          {item.badge}
                        </motion.span>
                      )}
                    </button>
                  );
                })}
            </nav>

            {/* Right Controls: Cart Quick Link, Persona Switcher, Profile & Mobile Hamburger */}
            <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
              {/* Quick Cart Button */}
              <motion.button
                whileTap={{ scale: 0.94 }}
                onClick={() => handleNavClick('checkout')}
                className={`relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition cursor-pointer ${
                  currentTab === 'checkout'
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                    : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                }`}
                title="Open checkout & POS basket"
              >
                <ShoppingCart className="w-4 h-4" />
                <span className="hidden sm:inline font-semibold">Cart</span>
                {cartItemCount > 0 && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      currentTab === 'checkout'
                        ? 'bg-white text-indigo-700'
                        : 'bg-indigo-600 text-white'
                    }`}
                  >
                    {cartItemCount}
                  </span>
                )}
              </motion.button>

              {/* Desktop Role Switcher Dropdown */}
              <div className="relative hidden md:block">
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition cursor-pointer ${getRoleBadgeColor(
                    currentUser.role
                  )}`}
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                  <span>{currentUser.role}</span>
                  <ChevronDown
                    className={`w-3 h-3 transition-transform duration-200 ${
                      roleDropdownOpen ? 'rotate-180' : ''
                    }`}
                  />
                </motion.button>

                <AnimatePresence>
                  {roleDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 6, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 4, scale: 0.96 }}
                      transition={{ duration: 0.15, ease: 'easeOut' }}
                      className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50"
                      onMouseLeave={() => setRoleDropdownOpen(false)}
                    >
                      <div className="px-3 py-1 border-b border-slate-100">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          Switch Active Persona
                        </span>
                      </div>
                      <div className="py-1">
                        {roles.map((role) => (
                          <button
                            key={role}
                            onClick={() => {
                              switchRole(role);
                              setRoleDropdownOpen(false);
                            }}
                            className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 transition cursor-pointer ${
                              currentUser.role === role
                                ? 'font-bold text-indigo-700 bg-indigo-50/50'
                                : 'text-slate-700'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span
                                className={`w-2 h-2 rounded-full ${
                                  role === 'Administrator'
                                    ? 'bg-purple-500'
                                    : role === 'Business Manager'
                                    ? 'bg-blue-500'
                                    : role === 'Sales Staff'
                                    ? 'bg-emerald-500'
                                    : role === 'Marketing Team'
                                    ? 'bg-amber-500'
                                    : role === 'Accountant'
                                    ? 'bg-cyan-500'
                                    : 'bg-slate-400'
                                }`}
                              />
                              <span>{role}</span>
                            </div>
                            {currentUser.role === role && (
                              <UserCheck className="w-3.5 h-3.5 text-indigo-600" />
                            )}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* User Profile / Auth Button */}
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={onOpenAuth}
                className="flex items-center gap-1.5 p-1 sm:px-2.5 sm:py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-slate-100 text-xs text-slate-700 font-medium transition cursor-pointer"
                title="Sign in or register user profile"
              >
                <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs uppercase">
                  {currentUser.name.charAt(0)}
                </div>
                <span className="hidden sm:inline font-medium text-slate-800">
                  {currentUser.name.split(' ')[0]}
                </span>
              </motion.button>

              {/* Mobile Hamburger Menu Toggle Button */}
              <motion.button
                whileTap={{ scale: 0.92 }}
                onClick={() => setMobileDrawerOpen(!mobileDrawerOpen)}
                className="lg:hidden p-2 rounded-lg text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer border border-slate-200"
                aria-label="Toggle navigation menu"
              >
                {mobileDrawerOpen ? (
                  <X className="w-5 h-5 text-slate-900" />
                ) : (
                  <Menu className="w-5 h-5 text-slate-900" />
                )}
              </motion.button>
            </div>
          </div>
        </div>
      </header>

      {/* MOBILE SLIDE-OVER DRAWER NAVIGATION */}
      <AnimatePresence>
        {mobileDrawerOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex justify-end">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMobileDrawerOpen(false)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
            />

            {/* Slide-in Menu Sheet */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="relative w-full max-w-xs bg-white h-full shadow-2xl flex flex-col justify-between z-10 overflow-y-auto"
            >
              {/* Drawer Top Header */}
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-sm">
                    %
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">DiscountMS</h3>
                    <p className="text-[10px] text-slate-500">Navigation & Tools</p>
                  </div>
                </div>

                <button
                  onClick={() => setMobileDrawerOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Active User Card & Persona Switcher */}
              <div className="p-4 bg-slate-50/80 border-b border-slate-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Active Persona
                  </span>
                  <button
                    onClick={() => {
                      onOpenAuth();
                      setMobileDrawerOpen(false);
                    }}
                    className="text-[11px] text-indigo-600 font-semibold hover:underline"
                  >
                    Manage Profile
                  </button>
                </div>

                <div className="flex items-center gap-2.5 mb-3">
                  <div className="w-9 h-9 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-sm">
                    {currentUser.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-slate-900 text-xs truncate">
                      {currentUser.name}
                    </div>
                    <span
                      className={`inline-block px-2 py-0.2 rounded text-[10px] font-semibold border ${getRoleBadgeColor(
                        currentUser.role
                      )}`}
                    >
                      {currentUser.role}
                    </span>
                  </div>
                </div>

                {/* Quick Persona Pills */}
                <div className="grid grid-cols-2 gap-1.5 pt-2 border-t border-slate-200/60">
                  {roles.map((role) => (
                    <button
                      key={role}
                      onClick={() => switchRole(role)}
                      className={`px-2 py-1.5 rounded-md text-[11px] font-medium text-left truncate transition cursor-pointer ${
                        currentUser.role === role
                          ? 'bg-indigo-600 text-white font-bold shadow-2xs'
                          : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                      }`}
                    >
                      {role}
                    </button>
                  ))}
                </div>
              </div>

              {/* Navigation Items List with Customer vs Staff Grouping */}
              <div className="p-3 flex-1 overflow-y-auto space-y-4">
                {/* Customer Section */}
                <div>
                  <span className="px-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                    Customer Experience
                  </span>
                  <div className="space-y-1">
                    {navItems
                      .filter((item) => ['offers', 'checkout'].includes(item.id))
                      .map((item) => {
                        const active = currentTab === item.id;
                        return (
                          <button
                            key={item.id}
                            onClick={() => handleNavClick(item.id)}
                            className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition cursor-pointer ${
                              active
                                ? 'bg-indigo-50/80 text-indigo-700 font-bold border border-indigo-200/80 shadow-2xs'
                                : 'text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                  active
                                    ? 'bg-indigo-600 text-white shadow-2xs'
                                    : 'bg-slate-100 text-slate-600'
                                }`}
                              >
                                <item.icon className="w-4 h-4" />
                              </div>
                              <div>
                                <div className="text-xs font-semibold">{item.label}</div>
                                <div className="text-[10px] text-slate-400 font-normal truncate max-w-[170px]">
                                  {item.description}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5">
                              {item.badge !== null && item.badge !== undefined && (
                                <span
                                  className={`px-1.5 py-0.2 text-[10px] font-bold rounded-full ${
                                    active
                                      ? 'bg-indigo-600 text-white'
                                      : 'bg-indigo-100 text-indigo-700'
                                  }`}
                                >
                                  {item.badge}
                                </span>
                              )}
                              <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                            </div>
                          </button>
                        );
                      })}
                  </div>
                </div>

                {/* Staff / Back-Office Section */}
                <div>
                  <div className="px-2 flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Staff &amp; Governance
                    </span>
                    {currentUser.role === 'Customer' && (
                      <span className="text-[9px] font-semibold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200/60 flex items-center gap-1">
                        <Lock className="w-2.5 h-2.5" /> Staff Only
                      </span>
                    )}
                  </div>

                  <div className="space-y-1">
                    {navItems
                      .filter((item) => !['offers', 'checkout'].includes(item.id))
                      .map((item) => {
                        const active = currentTab === item.id;
                        const authorized = isRoleAuthorized(item.roles);

                        return (
                          <button
                            key={item.id}
                            onClick={() => handleNavClick(item.id)}
                            className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition cursor-pointer ${
                              active
                                ? 'bg-indigo-50/80 text-indigo-700 font-bold border border-indigo-200/80'
                                : authorized
                                ? 'text-slate-700 hover:bg-slate-50'
                                : 'text-slate-400 hover:bg-amber-50/50'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                  active
                                    ? 'bg-indigo-600 text-white shadow-2xs'
                                    : authorized
                                    ? 'bg-slate-100 text-slate-600'
                                    : 'bg-slate-50 text-slate-400 border border-slate-200'
                                }`}
                              >
                                {authorized ? (
                                  <item.icon className="w-4 h-4" />
                                ) : (
                                  <Lock className="w-3.5 h-3.5 text-slate-400" />
                                )}
                              </div>
                              <div>
                                <div className="text-xs font-semibold flex items-center gap-1.5">
                                  <span>{item.label}</span>
                                  {!authorized && (
                                    <span className="text-[9px] font-normal px-1 py-0.2 bg-slate-100 text-slate-500 rounded">
                                      Restricted
                                    </span>
                                  )}
                                </div>
                                <div className="text-[10px] text-slate-400 font-normal truncate max-w-[170px]">
                                  {item.description}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5">
                              {item.badge !== null && item.badge !== undefined && (
                                <span
                                  className={`px-1.5 py-0.2 text-[10px] font-bold rounded-full ${
                                    active
                                      ? 'bg-indigo-600 text-white'
                                      : 'bg-amber-100 text-amber-700'
                                  }`}
                                >
                                  {item.badge}
                                </span>
                              )}
                              <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                            </div>
                          </button>
                        );
                      })}
                  </div>
                </div>
              </div>

              {/* Drawer Footer Actions */}
              <div className="p-4 border-t border-slate-100 bg-slate-50 space-y-2">
                <button
                  onClick={() => {
                    onOpenDateSim();
                    setMobileDrawerOpen(false);
                  }}
                  className="w-full flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200 text-xs text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                >
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                    <span>System Clock:</span>
                  </span>
                  <span className="font-mono font-bold text-slate-900">{simulatedDate}</span>
                </button>

                <button
                  onClick={() => {
                    if (confirm('Reset all demo data to initial state?')) {
                      resetAllData();
                      setMobileDrawerOpen(false);
                    }
                  }}
                  className="w-full py-2 text-center text-xs text-slate-500 hover:text-slate-800 transition cursor-pointer"
                >
                  Reset Demo Store Data
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MOBILE BOTTOM NAVIGATION BAR FOR ONE-THUMB USABILITY - ROLE-AWARE */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 lg:hidden shadow-lg px-2 py-1 flex items-center justify-around">
        <button
          onClick={() => handleNavClick('offers')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-lg text-[10px] font-medium transition cursor-pointer ${
            currentTab === 'offers'
              ? 'text-indigo-600 font-bold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Tag className="w-4 h-4 mb-0.5" />
          <span>Offers</span>
        </button>

        <button
          onClick={() => handleNavClick('checkout')}
          className={`relative flex flex-col items-center justify-center py-1 px-2.5 rounded-lg text-[10px] font-medium transition cursor-pointer ${
            currentTab === 'checkout'
              ? 'text-indigo-600 font-bold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <ShoppingCart className="w-4 h-4 mb-0.5" />
          <span>Checkout</span>
          {cartItemCount > 0 && (
            <span className="absolute top-0 right-1 w-4 h-4 rounded-full bg-indigo-600 text-white font-bold text-[9px] flex items-center justify-center">
              {cartItemCount}
            </span>
          )}
        </button>

        {currentUser.role === 'Customer' ? (
          <>
            <button
              onClick={() => onOpenAuth()}
              className="flex flex-col items-center justify-center py-1 px-2.5 rounded-lg text-[10px] font-medium text-slate-500 hover:text-slate-800 transition cursor-pointer"
            >
              <UserCheck className="w-4 h-4 mb-0.5 text-indigo-500" />
              <span>Persona</span>
            </button>
          </>
        ) : (
          <>
            {isRoleAuthorized(['Administrator', 'Business Manager', 'Marketing Team', 'Sales Staff']) && (
              <button
                onClick={() => handleNavClick('rules')}
                className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-lg text-[10px] font-medium transition cursor-pointer ${
                  currentTab === 'rules'
                    ? 'text-indigo-600 font-bold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Sliders className="w-4 h-4 mb-0.5" />
                <span>Rules</span>
              </button>
            )}

            {isRoleAuthorized(['Administrator', 'Business Manager', 'Accountant', 'Marketing Team', 'Sales Staff']) && (
              <button
                onClick={() => handleNavClick('reports')}
                className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-lg text-[10px] font-medium transition cursor-pointer ${
                  currentTab === 'reports'
                    ? 'text-indigo-600 font-bold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <BarChart3 className="w-4 h-4 mb-0.5" />
                <span>Reports</span>
              </button>
            )}
          </>
        )}

        <button
          onClick={() => setMobileDrawerOpen(true)}
          className="flex flex-col items-center justify-center py-1 px-2.5 rounded-lg text-[10px] font-medium text-slate-500 hover:text-slate-800 transition cursor-pointer relative"
        >
          <Menu className="w-4 h-4 mb-0.5" />
          <span>More</span>
          {pendingApprovalsCount > 0 && currentUser.role !== 'Customer' && (
            <span className="absolute top-0 right-1 w-2 h-2 rounded-full bg-amber-500"></span>
          )}
        </button>
      </div>
    </>
  );
}
