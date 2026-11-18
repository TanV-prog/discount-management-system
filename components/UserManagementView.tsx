'use client';

import React, { useState } from 'react';
import { useDMS } from '@/lib/dms-context';
import { StakeholderRole, UserAccount } from '@/types/dms';
import { motion, AnimatePresence } from 'motion/react';
import {
  Users,
  Shield,
  Activity,
  UserCheck,
  Calendar,
  Lock,
  Plus,
  KeyRound,
  FileText,
} from 'lucide-react';

export function UserManagementView() {
  const {
    users,
    updateUserRole,
    activityLogs,
    currentUser,
    showToast,
  } = useDMS();

  const [activeTab, setActiveTab] = useState<'users' | 'audit'>('users');
  const [logFilter, setLogFilter] = useState<string>('all');

  const roles: StakeholderRole[] = [
    'Administrator',
    'Business Manager',
    'Sales Staff',
    'Customer',
    'Marketing Team',
    'Accountant',
  ];

  const getRoleBadgeColor = (role: StakeholderRole) => {
    switch (role) {
      case 'Administrator':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Business Manager':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Sales Staff':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Marketing Team':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Accountant':
        return 'bg-cyan-100 text-cyan-800 border-cyan-200';
      case 'Customer':
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const filteredLogs = activityLogs.filter((log) => {
    if (logFilter === 'all') return true;
    return log.type === logFilter;
  });

  const handleRoleChange = (userId: string, userName: string, newRole: StakeholderRole) => {
    updateUserRole(userId, newRole);
    showToast(`Updated ${userName}'s role to ${newRole}`, 'info');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-bold text-slate-900">
              Access Governance & System Activity Logs
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Role-Based Access Control (RBAC), user directory, and tamper-evident event audit trail.
          </p>
        </div>

        {/* Tab switch between Users and Audit Trail */}
        <div className="flex items-center bg-slate-100/80 p-1 rounded-xl text-xs font-semibold relative">
          <button
            onClick={() => setActiveTab('users')}
            className={`relative px-3.5 py-1.5 rounded-lg transition cursor-pointer z-10 ${
              activeTab === 'users'
                ? 'text-slate-900 font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {activeTab === 'users' && (
              <motion.div
                layoutId="userMgmtTabIndicator"
                className="absolute inset-0 bg-white rounded-lg shadow-2xs border border-slate-200/80 -z-10"
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              />
            )}
            User Directory ({users.length})
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`relative px-3.5 py-1.5 rounded-lg transition cursor-pointer z-10 ${
              activeTab === 'audit'
                ? 'text-slate-900 font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {activeTab === 'audit' && (
              <motion.div
                layoutId="userMgmtTabIndicator"
                className="absolute inset-0 bg-white rounded-lg shadow-2xs border border-slate-200/80 -z-10"
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              />
            )}
            Activity Logs ({activityLogs.length})
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'users' ? (
          <motion.div
            key="users-tab"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.16 }}
            className="space-y-4"
          >
            <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs min-w-[650px]">
                  <thead className="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">User</th>
                      <th className="py-3 px-3">Email Address</th>
                      <th className="py-3 px-3">Department</th>
                      <th className="py-3 px-3">Assigned Role (RBAC)</th>
                      <th className="py-3 px-3">Registered Since</th>
                      <th className="py-3 px-4 text-right">Reassign Role</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-slate-50/70 transition">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-xs text-slate-700 uppercase">
                              {user.name.charAt(0)}
                            </div>
                            <div>
                              <div className="font-semibold text-slate-900">{user.name}</div>
                              {user.id === currentUser.id && (
                                <span className="text-[10px] text-indigo-600 font-semibold">
                                  (Active Profile)
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-3 font-mono text-[11px] text-slate-600">
                          {user.email}
                        </td>

                        <td className="py-3.5 px-3 text-slate-500">
                          {user.department || 'Retail Customer'}
                        </td>

                        <td className="py-3.5 px-3">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${getRoleBadgeColor(
                              user.role
                            )}`}
                          >
                            {user.role}
                          </span>
                        </td>

                        <td className="py-3.5 px-3 text-slate-500">{user.joinedDate}</td>

                        <td className="py-3.5 px-4 text-right">
                          <select
                            value={user.role}
                            onChange={(e) =>
                              handleRoleChange(user.id, user.name, e.target.value as StakeholderRole)
                            }
                            className="border border-slate-200 rounded-lg px-2.5 py-1 text-xs bg-slate-50 font-medium text-slate-700 focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                          >
                            {roles.map((r) => (
                              <option key={r} value={r}>
                                {r}
                              </option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        ) : (
          /* Activity & Audit Trail Tab */
          <motion.div
            key="audit-tab"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.16 }}
            className="space-y-4"
          >
            <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-slate-400 font-medium mr-1 text-[11px]">Filter:</span>
                {['all', 'redemption', 'creation', 'approval', 'modification', 'security'].map(
                  (filter) => (
                    <button
                      key={filter}
                      onClick={() => setLogFilter(filter)}
                      className={`px-2.5 py-1 rounded-md capitalize transition cursor-pointer text-xs ${
                        logFilter === filter
                          ? 'bg-slate-900 text-white font-semibold'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {filter}
                    </button>
                  )
                )}
              </div>

              <div className="text-slate-400 text-xs">
                Showing <strong className="text-slate-800">{filteredLogs.length}</strong> events
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
              <div className="divide-y divide-slate-100">
                {filteredLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-4 hover:bg-slate-50 transition text-xs flex items-start justify-between gap-4"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                          log.type === 'redemption'
                            ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                            : log.type === 'approval'
                            ? 'bg-blue-50 text-blue-600 border border-blue-200'
                            : log.type === 'creation'
                            ? 'bg-indigo-50 text-indigo-600 border border-indigo-200'
                            : log.type === 'security'
                            ? 'bg-purple-50 text-purple-600 border border-purple-200'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}
                      >
                        <Activity className="w-3.5 h-3.5" />
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">{log.action}</span>
                          <span className="text-[10px] uppercase font-semibold text-slate-500">
                            {log.type}
                          </span>
                        </div>
                        <p className="text-slate-600 mt-1 leading-relaxed">{log.details}</p>
                        <div className="text-[11px] text-slate-400 mt-1">
                          Actor: <strong className="text-slate-700">{log.actorName}</strong> ({log.actorRole})
                        </div>
                      </div>
                    </div>

                    <span className="text-slate-400 whitespace-nowrap font-mono text-[11px]">
                      {log.timestamp}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
