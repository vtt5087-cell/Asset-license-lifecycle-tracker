import React, { useEffect, useState } from 'react';
import {
  Server,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Laptop,
  KeyRound,
  BarChart3,
  History,
  FileCode2,
  RefreshCw,
  UserCheck,
  AlertTriangle,
  Menu,
} from 'lucide-react';
import { User, UserRole } from '../types';
import { api } from '../api';
import { AlltLogo } from './AlltLogo';

interface HeaderProps {
  activeTab: 'inventory' | 'licenses' | 'dashboard' | 'audit' | 'architecture';
  setActiveTab?: (tab: 'inventory' | 'licenses' | 'dashboard' | 'audit' | 'architecture') => void;
  onTabChange?: (tab: 'inventory' | 'licenses' | 'dashboard' | 'audit' | 'architecture') => void;
  currentUser?: User | null;
  currentUserRole?: UserRole;
  onRoleChange: (role: UserRole) => void;
  onRefreshData?: () => void;
  isRefreshing?: boolean;
  onToggleNav?: () => void;
  isNavOpen?: boolean;
  activePipelineColor?: string | null;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onTabChange,
  currentUser,
  currentUserRole,
  onRoleChange,
  onRefreshData,
  isRefreshing,
  onToggleNav,
  isNavOpen,
  activePipelineColor,
}) => {
  const [healthStatus, setHealthStatus] = useState<'healthy' | 'checking' | 'error'>('checking');
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  const handleTabSelect = (tab: 'inventory' | 'licenses' | 'dashboard' | 'audit' | 'architecture') => {
    if (setActiveTab) setActiveTab(tab);
    if (onTabChange) onTabChange(tab);
  };

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const checkHealth = async () => {
    try {
      const res = await api.getHealth();
      if (res.status === 'healthy') setHealthStatus('healthy');
      else setHealthStatus('error');
    } catch {
      setHealthStatus('error');
    }
  };

  const rolesList: { role: UserRole; name: string; title: string; badge: string; desc: string }[] = [
    {
      role: 'admin',
      name: 'Sarah Connor',
      title: 'IT Director & Security Lead',
      badge: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      desc: 'Full CRUD privileges on hardware, licenses, deletions, and system configuration.',
    },
    {
      role: 'it_agent',
      name: 'Marcus Vance',
      title: 'Senior IT Service Desk Agent',
      badge: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      desc: 'Provisioning equipment, check-in/out workflows, and software seat allocations.',
    },
    {
      role: 'auditor',
      name: 'Elena Rostova',
      title: 'Compliance & Financial Auditor',
      badge: 'bg-amber-100 text-amber-800 border-amber-200',
      desc: 'Read-only access to all assets, SaaS contracts, valuation records, and audit trails.',
    },
  ];

  const activeRole = currentUser?.role || currentUserRole || 'admin';
  const currentRoleConfig = rolesList.find((r) => r.role === activeRole) || rolesList[0];
  const displayName = currentUser?.full_name || currentRoleConfig.name;

  return (
    <header className="border-b border-slate-200 bg-white sticky top-0 z-30 shadow-xs backdrop-blur-md">
      {/* Creator Attribution Banner */}
      <div className="bg-slate-900 text-white px-4 py-1.5 text-xs border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex items-center justify-center sm:justify-between gap-2">
          <span className="font-medium tracking-wide text-slate-300 hidden sm:inline">
            ALLT — Asset &amp; License Lifecycle Tracker
          </span>
          <span className="font-semibold tracking-wide text-white flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Created by Tariq Van Tonder
          </span>
        </div>
      </div>

      {/* Top Banner if Auditor Mode is active */}
      {activeRole === 'auditor' && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-1.5 text-xs text-amber-800 flex items-center justify-between">
          <div className="flex items-center gap-2 max-w-7xl mx-auto w-full">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>Auditor Read-Only Mode Active:</strong> You have compliance oversight privileges. Write operations (Creating, Updating, Deleting, Check-in/out) are restricted by RBAC.
            </span>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Logo & Product Identity */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="h-10 w-10 flex items-center justify-center shrink-0">
              <AlltLogo className="w-10 h-10 object-contain" />
            </div>
            <div className="shrink-0">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 text-sm xl:text-base tracking-tight whitespace-nowrap">
                  ALLT
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500 whitespace-nowrap">
                <span className="flex items-center gap-1.5 whitespace-nowrap">
                  <span
                    className={`w-2 h-2 rounded-full shrink-0 ${
                      healthStatus === 'healthy'
                        ? 'bg-emerald-500 animate-pulse'
                        : healthStatus === 'checking'
                        ? 'bg-amber-500'
                        : 'bg-rose-500'
                    }`}
                  />
                  <span>{healthStatus === 'healthy' ? 'API & Database Online' : 'Checking Health...'}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Inline Navigation Tabs removed — relocated to Right-Hand Side Drawer */}

          {/* Right Action: Role Switcher & Refresh */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {onRefreshData && (
              <button
                id="btn-refresh-data"
                onClick={onRefreshData}
                disabled={isRefreshing}
                title="Refresh inventory from PostgreSQL API"
                className="h-9 w-9 shrink-0 flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
              >
                <RefreshCw className={`w-4 h-4 shrink-0 ${isRefreshing ? 'animate-spin text-indigo-600' : ''}`} />
              </button>
            )}

            {/* RBAC Persona Switcher */}
            <div className="relative shrink-0">
              <button
                id="btn-role-switcher"
                onClick={() => setShowRoleMenu(!showRoleMenu)}
                className="h-10 flex items-center gap-2.5 pl-2 pr-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 shrink-0 whitespace-nowrap"
              >
                <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-xs font-bold shrink-0 shadow-2xs">
                  {displayName.charAt(0)}
                </div>
                <div className="text-left hidden sm:block whitespace-nowrap">
                  <div className="text-xs font-semibold text-slate-800 flex items-center gap-1.5 leading-tight whitespace-nowrap">
                    <span className="whitespace-nowrap">{displayName}</span>
                    <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded border whitespace-nowrap shrink-0 ${currentRoleConfig.badge}`}>
                      {activeRole}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-500 leading-tight whitespace-nowrap">{currentRoleConfig.title}</div>
                </div>
              </button>

              {/* Persona Dropdown Menu */}
              {showRoleMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowRoleMenu(false)} />
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 z-50 p-2 overflow-hidden">
                    <div className="px-3 py-2 border-b border-slate-100">
                      <div className="text-xs font-semibold text-slate-800">Switch Role Persona (JWT Auth)</div>
                      <div className="text-[11px] text-slate-500">
                        Select a role to verify RBAC security policies &amp; permission constraints.
                      </div>
                    </div>

                    <div className="py-1 space-y-1">
                      {rolesList.map((item) => (
                        <button
                          key={item.role}
                          onClick={() => {
                            onRoleChange(item.role);
                            setShowRoleMenu(false);
                          }}
                          className={`w-full text-left p-2.5 rounded-xl transition-colors flex items-start gap-2.5 ${
                            activeRole === item.role
                              ? 'bg-slate-50 border border-slate-200'
                              : 'hover:bg-slate-50/80 border border-transparent'
                          }`}
                        >
                          <div className="mt-0.5">
                            {item.role === 'admin' && <ShieldCheck className="w-4 h-4 text-indigo-600" />}
                            {item.role === 'it_agent' && <Shield className="w-4 h-4 text-emerald-600" />}
                            {item.role === 'auditor' && <ShieldAlert className="w-4 h-4 text-amber-600" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-medium text-slate-900">{item.name}</span>
                              <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${item.badge}`}>
                                {item.role}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-500 truncate">{item.title}</div>
                            <div className="text-[10px] text-slate-400 mt-1 leading-snug">{item.desc}</div>
                          </div>
                        </button>
                      ))}
                    </div>

                    <div className="px-3 py-2 bg-slate-50 rounded-xl mt-1 border border-slate-100 flex items-center justify-between text-[11px] text-slate-600">
                      <span className="flex items-center gap-1 font-mono text-[10px]">
                        <KeyRound className="w-3 h-3 text-slate-400" />
                        JWT 256-bit signed
                      </span>
                      <span className="text-emerald-700 font-medium">Valid session</span>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Right-Hand Navigation Drawer Trigger Button (Docked right edge / red circle position) */}
            {onToggleNav && (
              <button
                id="btn-nav-drawer-toggle"
                onClick={onToggleNav}
                title="Toggle Navigation Menu (or hover screen right edge)"
                className={`h-10 px-3 rounded-xl border flex items-center gap-2 text-xs font-semibold transition-all focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 cursor-pointer shadow-xs ${
                  isNavOpen
                    ? 'bg-blue-600 text-white border-blue-600 shadow-blue-500/20'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 hover:text-blue-600'
                }`}
              >
                <Menu className={`w-4 h-4 transition-transform ${isNavOpen ? 'rotate-90 text-white' : 'text-blue-600'}`} />
                <span className="font-semibold hidden sm:inline">Menu</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
