import React, { useState, useEffect, useTransition, useCallback } from 'react';
import { AppLayout } from './components/AppLayout';
import { Header } from './components/Header';
import { DashboardOverview } from './components/DashboardOverview';
import { AssetInventoryTable } from './components/AssetInventoryTable';
import { SoftwareLicenseManager } from './components/SoftwareLicenseManager';
import { AuditLogViewer } from './components/AuditLogViewer';
import { ArchitectureDocs } from './components/ArchitectureDocs';
import { AssetModal } from './components/AssetModal';
import { CheckInOutModal } from './components/CheckInOutModal';
import { AssetDetailModal } from './components/AssetDetailModal';
import { Asset, Department, User, UserRole } from './types';
import { api } from './api';

function App() {
  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'inventory' | 'licenses' | 'audit' | 'architecture'
  >('dashboard');
  const [isPending, startTransition] = useTransition();
  const [activePipelineColor, setActivePipelineColor] = useState<string | null>(null);

  const [currentUserRole, setCurrentUserRole] = useState<UserRole>('admin');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);

  // Modals state
  const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);

  const [checkInOutMode, setCheckInOutMode] = useState<'checkout' | 'checkin'>('checkout');
  const [isCheckInOutModalOpen, setIsCheckInOutModalOpen] = useState(false);
  const [activeCheckInOutAsset, setActiveCheckInOutAsset] = useState<Asset | null>(null);

  const [detailAsset, setDetailAsset] = useState<Asset | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Toast / notification feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  }, []);

  const reloadAssets = useCallback(async () => {
    try {
      const res = await api.getAssets({ limit: 100 });
      setAssets(res.items);
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    const initApp = async () => {
      try {
        const auth = await api.login(currentUserRole);
        setCurrentUser(auth.user);
        const [deptList, userList, assetList] = await Promise.all([
          api.getDepartments(),
          api.getUsers(),
          api.getAssets({ limit: 100 }),
        ]);
        setDepartments(deptList);
        setUsers(userList);
        setAssets(assetList.items);
      } catch (err) {
        console.error('Initialization error', err);
      }
    };
    initApp();
  }, []);

  const handleRoleChange = useCallback(async (role: UserRole) => {
    try {
      setCurrentUserRole(role);
      const auth = await api.login(role);
      setCurrentUser(auth.user);
      showToast(`Switched active session to [${role.toUpperCase()}]. Permissions adjusted.`);
    } catch (err) {
      console.error('Role change failed', err);
    }
  }, [showToast]);

  // Asset CRUD handlers
  const handleOpenCreateAsset = useCallback(() => {
    setEditingAsset(null);
    setIsAssetModalOpen(true);
  }, []);

  const handleOpenEditAsset = useCallback((asset: Asset) => {
    setEditingAsset(asset);
    setIsAssetModalOpen(true);
  }, []);

  const handleSaveAsset = useCallback(async (assetData: Partial<Asset>) => {
    if (editingAsset) {
      await api.updateAsset(editingAsset.id, assetData);
      showToast(`Updated hardware specifications for ${editingAsset.asset_tag}.`);
    } else {
      const created = await api.createAsset(assetData);
      showToast(`Registered new asset ${created.asset_tag} (${created.model_name}).`);
    }
    await reloadAssets();
  }, [editingAsset, showToast, reloadAssets]);

  const handleDeleteAsset = useCallback(async (assetId: string) => {
    try {
      await api.deleteAsset(assetId);
      showToast('Asset record permanently removed from inventory.');
      await reloadAssets();
    } catch (err: any) {
      showToast(err.message || 'Deletion failed');
    }
  }, [showToast, reloadAssets]);

  // Check In / Check Out Handlers
  const handleOpenCheckout = useCallback((asset: Asset) => {
    setActiveCheckInOutAsset(asset);
    setCheckInOutMode('checkout');
    setIsCheckInOutModalOpen(true);
  }, []);

  const handleOpenCheckin = useCallback((asset: Asset) => {
    setActiveCheckInOutAsset(asset);
    setCheckInOutMode('checkin');
    setIsCheckInOutModalOpen(true);
  }, []);

  const handleConfirmCheckout = useCallback(async (assetId: string, userId: string, notes?: string) => {
    await api.checkoutAsset(assetId, userId, notes);
    showToast('Equipment successfully provisioned and checked out to employee.');
    await reloadAssets();
  }, [showToast, reloadAssets]);

  const handleConfirmCheckin = useCallback(async (
    assetId: string,
    conditionStatus: string,
    notes?: string
  ) => {
    await api.checkinAsset(assetId, conditionStatus, notes);
    showToast('Equipment returned and checked into IT inventory stock.');
    await reloadAssets();
  }, [showToast, reloadAssets]);

  // Detail Modal Handler
  const handleOpenDetail = useCallback((asset: Asset) => {
    setDetailAsset(asset);
    setIsDetailModalOpen(true);
  }, []);

  const handleTabSelect = useCallback((
    tab: 'dashboard' | 'inventory' | 'licenses' | 'audit' | 'architecture'
  ) => {
    setActivePipelineColor(null);
    startTransition(() => {
      setActiveTab(tab);
    });
  }, []);

  const handleCloseAssetModal = useCallback(() => setIsAssetModalOpen(false), []);
  const handleCloseCheckInOutModal = useCallback(() => setIsCheckInOutModalOpen(false), []);
  const handleCloseDetailModal = useCallback(() => setIsDetailModalOpen(false), []);

  return (
    <AppLayout
      activeTab={activeTab}
      onTabSelect={handleTabSelect}
      activePipelineColor={activePipelineColor}
      header={({ isNavOpen, onToggleNav }) => (
        <Header
          activeTab={activeTab}
          setActiveTab={handleTabSelect}
          onTabChange={handleTabSelect}
          currentUser={currentUser}
          currentUserRole={currentUserRole}
          onRoleChange={handleRoleChange}
          onRefreshData={reloadAssets}
          isNavOpen={isNavOpen}
          onToggleNav={onToggleNav}
          activePipelineColor={activePipelineColor}
        />
      )}
      footer={
        <footer className="border-t border-slate-200 bg-white py-4 mt-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-700">ALLT</span>
              <span>•</span>
              <span>Enterprise IT Operations Suite</span>
              <span>•</span>
              <span className="font-semibold text-slate-700">Created by Tariq Van Tonder</span>
            </div>
            <div className="flex items-center gap-4">
              <span>PostgreSQL 16 Engine</span>
              <span>REST API v1.0.0</span>
              <span>JWT RBAC Enforced</span>
            </div>
          </div>
        </footer>
      }
    >
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl border border-slate-700 flex items-center gap-3 text-xs animate-in slide-in-from-bottom-5 duration-200">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Viewport Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && (
          <DashboardOverview
            onNavigateTab={handleTabSelect}
            onNewAsset={handleOpenCreateAsset}
            onStageHover={setActivePipelineColor}
          />
        )}

        {activeTab === 'inventory' && (
          <AssetInventoryTable
            assets={assets}
            departments={departments}
            users={users}
            currentUserRole={currentUserRole}
            onNewAsset={handleOpenCreateAsset}
            onEditAsset={handleOpenEditAsset}
            onDeleteAsset={handleDeleteAsset}
            onCheckOut={handleOpenCheckout}
            onCheckIn={handleOpenCheckin}
            onViewDetails={handleOpenDetail}
          />
        )}

        {activeTab === 'licenses' && (
          <SoftwareLicenseManager
            currentUserRole={currentUserRole}
            users={users}
            assets={assets}
          />
        )}

        {activeTab === 'audit' && <AuditLogViewer />}

        {activeTab === 'architecture' && <ArchitectureDocs />}
      </main>

      {/* Hardware Asset Create/Edit Modal */}
      <AssetModal
        isOpen={isAssetModalOpen}
        onClose={handleCloseAssetModal}
        onSave={handleSaveAsset}
        editingAsset={editingAsset}
        departments={departments}
      />

      {/* Check In / Out Modal */}
      <CheckInOutModal
        isOpen={isCheckInOutModalOpen}
        mode={checkInOutMode}
        asset={activeCheckInOutAsset}
        users={users}
        onClose={handleCloseCheckInOutModal}
        onConfirmCheckout={handleConfirmCheckout}
        onConfirmCheckin={handleConfirmCheckin}
      />

      {/* Asset Detail Drawer / Modal */}
      <AssetDetailModal
        isOpen={isDetailModalOpen}
        asset={detailAsset}
        onClose={handleCloseDetailModal}
        onEdit={handleOpenEditAsset}
        onCheckOut={handleOpenCheckout}
        onCheckIn={handleOpenCheckin}
        isReadOnly={currentUserRole === 'auditor'}
      />
    </AppLayout>
  );
}

export default React.memo(App);

