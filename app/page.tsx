'use client';

import React, { useState } from 'react';
import { DMSProvider, useDMS } from '@/lib/dms-context';
import { StakeholderRole } from '@/types/dms';
import { Navbar } from '@/components/Navbar';
import { OffersView } from '@/components/OffersView';
import { CheckoutPOSView } from '@/components/CheckoutPOSView';
import { RulesManagementView } from '@/components/RulesManagementView';
import { CouponManagementView } from '@/components/CouponManagementView';
import { ApprovalQueueView } from '@/components/ApprovalQueueView';
import { ReportsView } from '@/components/ReportsView';
import { UserManagementView } from '@/components/UserManagementView';
import { AccessDeniedView } from '@/components/AccessDeniedView';
import { AuthModal } from '@/components/AuthModal';
import { DateSimulatorModal } from '@/components/DateSimulatorModal';
import { ToastBanner } from '@/components/ToastBanner';
import { motion, AnimatePresence } from 'motion/react';

const MODULE_PERMISSIONS: Record<string, { label: string; roles: StakeholderRole[] }> = {
  offers: {
    label: 'Offers & Coupons',
    roles: ['Customer', 'Sales Staff', 'Business Manager', 'Marketing Team', 'Administrator', 'Accountant'],
  },
  checkout: {
    label: 'Checkout & POS Terminal',
    roles: ['Customer', 'Sales Staff', 'Business Manager', 'Administrator'],
  },
  rules: {
    label: 'Discount Rules Governance',
    roles: ['Administrator', 'Business Manager', 'Marketing Team', 'Sales Staff'],
  },
  coupons: {
    label: 'Coupon Code Management',
    roles: ['Administrator', 'Business Manager', 'Marketing Team'],
  },
  approvals: {
    label: 'Proposal Approval Queue',
    roles: ['Business Manager', 'Administrator'],
  },
  reports: {
    label: 'Reports & Financial Analytics',
    roles: ['Administrator', 'Business Manager', 'Accountant', 'Marketing Team', 'Sales Staff'],
  },
  users: {
    label: 'Access & User Directory',
    roles: ['Administrator'],
  },
};

function DMSMainContent() {
  const [currentTab, setCurrentTab] = useState<string>('offers');
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isDateSimOpen, setIsDateSimOpen] = useState(false);

  const { currentUser } = useDMS();

  // Check if current user is authorized for the selected tab
  const activeModuleConfig = MODULE_PERMISSIONS[currentTab] || {
    label: 'System Module',
    roles: ['Administrator'],
  };
  const isAuthorized = activeModuleConfig.roles.includes(currentUser.role);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-indigo-500 selection:text-white">
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenDateSim={() => setIsDateSimOpen(true)}
      />

      {/* Main Content with Page-Level Motion Transitions */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-6 pb-24 lg:pb-8">
        <AnimatePresence mode="wait">
          {!isAuthorized ? (
            <motion.div
              key={`unauthorized-${currentTab}-${currentUser.role}`}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
            >
              <AccessDeniedView
                moduleName={activeModuleConfig.label}
                requiredRoles={activeModuleConfig.roles}
                onNavigateHome={() => setCurrentTab('offers')}
              />
            </motion.div>
          ) : (
            <motion.div
              key={currentTab}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
            >
              {currentTab === 'offers' && (
                <OffersView onNavigateToCheckout={() => setCurrentTab('checkout')} />
              )}
              {currentTab === 'checkout' && <CheckoutPOSView />}
              {currentTab === 'rules' && <RulesManagementView />}
              {currentTab === 'coupons' && <CouponManagementView />}
              {currentTab === 'approvals' && <ApprovalQueueView />}
              {currentTab === 'reports' && <ReportsView />}
              {currentTab === 'users' && <UserManagementView />}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Quiet, Professional System Footer */}
      <footer className="bg-white border-t border-slate-200 mt-8 sm:mt-12 py-6 mb-16 lg:mb-0 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800">Discount Management System</span>
            <span aria-hidden="true">·</span>
            <span>7-Guard Engine Verification</span>
            <span aria-hidden="true">·</span>
            <span>Role-Based Access Control</span>
          </div>

          <div className="flex items-center gap-2 text-slate-500">
            <span>Session: <strong className="text-slate-800 font-medium">{currentUser.name}</strong></span>
            <span aria-hidden="true">·</span>
            <span className="capitalize">{currentUser.role}</span>
          </div>
        </div>
      </footer>

      {/* Modals & Toast System */}
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
      <DateSimulatorModal isOpen={isDateSimOpen} onClose={() => setIsDateSimOpen(false)} />
      <ToastBanner />
    </div>
  );
}

export default function Page() {
  return (
    <DMSProvider>
      <DMSMainContent />
    </DMSProvider>
  );
}
