import React, { useRef } from 'react';
import {
  BarChart3,
  Laptop,
  KeyRound,
  History,
  FileCode2,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Compass,
  Layers,
} from 'lucide-react';

export type NavTabId = 'dashboard' | 'inventory' | 'licenses' | 'audit' | 'architecture';

export interface NavItemConfig {
  id: NavTabId;
  label: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
}

export interface RightNavDrawerProps {
  isOpen: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onClose: () => void;
  onOpen: () => void;
  activeTab: NavTabId;
  onTabSelect: (tab: NavTabId) => void;
}

export const NAV_ITEMS: NavItemConfig[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    subtitle: 'Lifecycle telemetry & KPIs',
    icon: BarChart3,
  },
  {
    id: 'inventory',
    label: 'Hardware Assets',
    subtitle: 'IT asset registry & checkout',
    icon: Laptop,
  },
  {
    id: 'licenses',
    label: 'Software & SaaS',
    subtitle: 'Renewals & seat allocation',
    icon: KeyRound,
  },
  {
    id: 'audit',
    label: 'Audit Trail',
    subtitle: 'Security & compliance logs',
    icon: History,
  },
  {
    id: 'architecture',
    label: 'Architecture & Docs',
    subtitle: 'API schemas & ER diagram',
    icon: FileCode2,
  },
];

export const RightNavDrawer: React.FC<RightNavDrawerProps> = ({
  isOpen,
  onMouseEnter,
  onMouseLeave,
  onClose,
  onOpen,
  activeTab,
  onTabSelect,
}) => {
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleTriggerEnter = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    onMouseEnter();
  };

  const handleContainerLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      onMouseLeave();
    }, 150);
  };

  const handleContainerEnter = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
  };

  return (
    <>
      {/* 1. Slim Vertical Hover Trigger Strip along the right viewport edge */}
      <div
        id="right-nav-trigger-strip"
        onMouseEnter={handleTriggerEnter}
        className="fixed right-0 top-0 h-full w-3 z-40 pointer-events-auto cursor-pointer"
        aria-label="Hover edge to open navigation drawer"
      />

      {/* 2. Visual Pull-Tab Cue docked on right edge */}
      <div
        id="right-nav-pull-tab"
        onMouseEnter={handleTriggerEnter}
        onClick={onOpen}
        className={`fixed right-0 top-1/2 -translate-y-1/2 z-40 flex items-center bg-white/95 backdrop-blur-xs border-y border-l border-slate-300/80 shadow-md py-3.5 pl-2 pr-1 rounded-l-2xl cursor-pointer transition-all duration-300 hover:bg-slate-50 hover:pl-2.5 group ${
          isOpen ? 'opacity-0 pointer-events-none translate-x-full' : 'opacity-100 translate-x-0'
        }`}
        title="Navigation Menu (Hover or Click)"
      >
        <div className="flex flex-col items-center gap-1.5 text-slate-500 group-hover:text-blue-600 transition-colors">
          <Menu className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" />
          <span className="text-[9px] font-bold tracking-widest text-slate-400 group-hover:text-blue-600 [writing-mode:vertical-lr] rotate-180 uppercase select-none">
            Nav
          </span>
          <ChevronLeft className="w-3 h-3 text-slate-400 group-hover:-translate-x-0.5 transition-transform" />
        </div>
      </div>

      {/* 3. Subtle Backdrop Overlay (soft focus when drawer expands) */}
      <div
        id="right-nav-backdrop"
        onClick={onClose}
        className={`fixed inset-0 bg-slate-900/15 backdrop-blur-[1px] z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* 4. Sliding Vertical Navigation Drawer */}
      <div
        id="right-nav-drawer-container"
        onMouseEnter={handleContainerEnter}
        onMouseLeave={handleContainerLeave}
        className={`fixed top-0 right-0 h-full z-50 transform transition-transform duration-300 ease-in-out will-change-transform ${
          isOpen ? 'translate-x-0' : 'translate-x-[calc(100%-12px)]'
        }`}
        style={{
          width: 'calc(18rem + 40px)', // 72 (18rem) + 40px hitbox
          transform: isOpen ? 'translate3d(0, 0, 0)' : 'translate3d(18rem, 0, 0)',
        }}
      >
        {/* Invisible Hitbox Extension */}
        <div className="absolute top-0 left-0 w-[40px] h-full cursor-pointer" aria-hidden="true" />
        
        {/* Drawer Content Surface */}
        <aside
          className="absolute top-0 right-0 h-full w-72 bg-white/95 backdrop-blur-md border-l border-slate-200 shadow-2xl flex flex-col justify-between"
          aria-label="Right sidebar navigation"
        >
          {/* Drawer Header */}
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50/80 to-white">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0">
              <Compass className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h3 className="text-xs font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
                <span>Navigation</span>
                <span className="text-[10px] font-medium text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-full">
                  5 views
                </span>
              </h3>
              <p className="text-[10px] text-slate-500 truncate">
                ALLT
              </p>
            </div>
          </div>

          <button
            id="btn-close-right-nav"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Close Drawer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Link List */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5">
          <div className="px-2 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Workspaces
          </div>

          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                id={`drawer-nav-${item.id}`}
                onClick={() => {
                  onTabSelect(item.id);
                  onClose();
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-all duration-150 group cursor-pointer ${
                  isActive
                    ? 'bg-slate-100 text-blue-600 font-semibold shadow-2xs'
                    : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200/80 group-hover:text-slate-800'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold leading-tight truncate">
                      {item.label}
                    </div>
                    <div className="text-[10px] text-slate-400 group-hover:text-slate-500 truncate leading-tight mt-0.5">
                      {item.subtitle}
                    </div>
                  </div>
                </div>

                {isActive ? (
                  <span className="w-1.5 h-4 bg-blue-600 rounded-full shrink-0 ml-2" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-400 group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
                )}
              </button>
            );
          })}
        </div>

        {/* Drawer Footer & Hover Instructions */}
        <div className="p-3.5 border-t border-slate-100 bg-slate-50/70 text-[11px] text-slate-500">
          <div className="flex items-center gap-2 text-[10px] text-slate-400 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>Hover right edge to open anytime</span>
          </div>
        </div>
        </aside>
      </div>
    </>
  );
};
