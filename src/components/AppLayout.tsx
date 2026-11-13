import React, { useState } from 'react';
import { RightNavDrawer, NavTabId } from './RightNavDrawer';

export interface AppLayoutProps {
  activeTab: NavTabId;
  onTabSelect: (tab: NavTabId) => void;
  header: (props: { isNavOpen: boolean; onToggleNav: () => void; onOpenNav: () => void }) => React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  activePipelineColor?: string | null;
}

/**
 * AppLayout manages the hover-triggered dynamic behavior for the
 * right-hand side navigation drawer and wraps the main page view.
 */
export const AppLayout: React.FC<AppLayoutProps> = ({
  activeTab,
  onTabSelect,
  header,
  children,
  footer,
}) => {
  const [isNavOpen, setIsNavOpen] = useState(false);

  const handleMouseEnter = () => {
    setIsNavOpen(true);
  };

  const handleMouseLeave = () => {
    setIsNavOpen(false);
  };

  const handleToggleNav = () => {
    setIsNavOpen((prev) => !prev);
  };

  const handleOpenNav = () => {
    setIsNavOpen(true);
  };

  const handleCloseNav = () => {
    setIsNavOpen(false);
  };

  return (
    <div
      className="min-h-screen text-slate-800 flex flex-col font-sans antialiased relative overflow-x-hidden"
      style={{
        backgroundColor: 'rgba(241, 245, 249, 0.7)',
      }}
    >
      {/* Top Header */}
      {header({
        isNavOpen,
        onToggleNav: handleToggleNav,
        onOpenNav: handleOpenNav,
      })}

      {/* Main Page View Area */}
      <div className="flex-1 flex flex-col">
        {children}
      </div>

      {/* Footer */}
      {footer}

      {/* Dynamic Right-Hand Side Drawer with hover trigger edge & pull-tab */}
      <RightNavDrawer
        isOpen={isNavOpen}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onOpen={handleOpenNav}
        onClose={handleCloseNav}
        activeTab={activeTab}
        onTabSelect={onTabSelect}
      />
    </div>
  );
};
