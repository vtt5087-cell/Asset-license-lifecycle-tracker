import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { 
  Search, 
  Filter, 
  Plus, 
  MoreVertical, 
  ChevronLeft, 
  ChevronRight, 
  Laptop, 
  Monitor, 
  Smartphone, 
  HardDrive, 
  Server, 
  Tag,
  CheckCircle2,
  AlertTriangle,
  Wrench,
  XCircle,
  HelpCircle,
  Download,
  Eye,
  Edit2,
  Trash2,
  LogIn,
  LogOut,
  Copy,
  Check,
  RefreshCw
} from 'lucide-react';
import { 
  Asset as AppAsset, 
  AssetCategory as AppAssetCategory, 
  AssetStatus as AppAssetStatus, 
  Department, 
  User, 
  UserRole 
} from '../types';

// --- Types & Interfaces ---
export type AssetStatus = 'in_stock' | 'assigned' | 'in_repair' | 'retired' | 'lost';
export type AssetCategory = 'laptop' | 'desktop' | 'monitor' | 'mobile' | 'peripheral' | 'network_device';

export interface Asset {
  id: string;
  assetTag: string;
  serialNumber: string;
  modelName: string;
  category: AssetCategory;
  status: AssetStatus;
  assignedUser?: string;
  department?: string;
  purchaseCost: number;
  warrantyExpiration: string;
  rawAsset?: AppAsset;
}

// --- Mock Data (fallback when standalone or initializing) ---
export const MOCK_ASSETS: Asset[] = [
  { id: '1', assetTag: 'AST-2026-001', serialNumber: 'SN-X98234-A', modelName: 'MacBook Pro 16" M3', category: 'laptop', status: 'assigned', assignedUser: 'Alex Morgan', department: 'Engineering', purchaseCost: 2499.00, warrantyExpiration: '2027-11-15' },
  { id: '2', assetTag: 'AST-2026-002', serialNumber: 'SN-DELL-9912', modelName: 'Dell UltraSharp 27" 4K', category: 'monitor', status: 'in_stock', department: 'Design', purchaseCost: 650.00, warrantyExpiration: '2026-12-01' },
  { id: '3', assetTag: 'AST-2026-003', serialNumber: 'SN-LEN-44102', modelName: 'ThinkPad X1 Carbon', category: 'laptop', status: 'in_repair', assignedUser: 'Jordan Lee', department: 'Product', purchaseCost: 1850.00, warrantyExpiration: '2026-10-10' },
  { id: '4', assetTag: 'AST-2026-004', serialNumber: 'SN-APL-77121', modelName: 'iPad Pro 12.9"', category: 'mobile', status: 'assigned', assignedUser: 'Sarah Chen', department: 'Executive', purchaseCost: 1099.00, warrantyExpiration: '2028-01-20' },
  { id: '5', assetTag: 'AST-2026-005', serialNumber: 'SN-CISCO-881', modelName: 'Cisco Catalyst Switch', category: 'network_device', status: 'retired', department: 'IT Operations', purchaseCost: 3200.00, warrantyExpiration: '2025-05-12' },
];

// --- Helper UI Components ---

// Category Badge with Icon
export const CategoryIcon = ({ category }: { category: AssetCategory }) => {
  const iconProps = { className: "w-4 h-4 mr-1.5 text-slate-500 shrink-0" };
  switch (category) {
    case 'laptop': return <Laptop {...iconProps} />;
    case 'monitor': return <Monitor {...iconProps} />;
    case 'mobile': return <Smartphone {...iconProps} />;
    case 'network_device': return <Server {...iconProps} />;
    default: return <HardDrive {...iconProps} />;
  }
};

// Custom Status Badges
export const StatusBadge = ({ status }: { status: AssetStatus }) => {
  const badgeStyles: Record<AssetStatus, { bg: string; text: string; border: string; icon: React.ReactNode; label: string }> = {
    in_stock: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', icon: <CheckCircle2 className="w-3.5 h-3.5 mr-1 shrink-0" />, label: 'In Stock' },
    assigned: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', icon: <Tag className="w-3.5 h-3.5 mr-1 shrink-0" />, label: 'Assigned' },
    in_repair: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', icon: <Wrench className="w-3.5 h-3.5 mr-1 shrink-0" />, label: 'In Repair' },
    retired: { bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-200', icon: <XCircle className="w-3.5 h-3.5 mr-1 shrink-0" />, label: 'Retired' },
    lost: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', icon: <AlertTriangle className="w-3.5 h-3.5 mr-1 shrink-0" />, label: 'Lost' },
  };

  const style = badgeStyles[status] || { bg: 'bg-gray-50', text: 'text-gray-600', border: 'border-gray-200', icon: <HelpCircle className="w-3.5 h-3.5 mr-1 shrink-0" />, label: status };

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${style.bg} ${style.text} ${style.border}`}>
      {style.icon}
      {style.label}
    </span>
  );
};

export interface AssetInventoryTableProps {
  assets?: AppAsset[] | Asset[];
  departments?: Department[];
  users?: User[];
  currentUserRole?: UserRole;
  onNewAsset?: () => void;
  onOpenCreateModal?: () => void;
  onEditAsset?: (asset: AppAsset) => void;
  onOpenEditModal?: (asset: AppAsset) => void;
  onDeleteAsset?: (assetOrId: any) => void;
  onCheckOut?: (asset: AppAsset) => void;
  onOpenCheckoutModal?: (asset: AppAsset) => void;
  onCheckIn?: (asset: AppAsset) => void;
  onOpenCheckinModal?: (asset: AppAsset) => void;
  onViewDetails?: (asset: AppAsset) => void;
  onOpenDetailModal?: (asset: AppAsset) => void;
  isLoading?: boolean;
  onRefresh?: () => void;
}

// --- Memoized Asset Row Component ---
const AssetRow = React.memo(({
  asset,
  onViewDetails,
  onOpenDetailModal,
  handleCopySerial,
  copiedSerial,
  activeMenuAssetId,
  setActiveMenuAssetId,
  menuRef,
  onCheckOut,
  onOpenCheckoutModal,
  onCheckIn,
  onOpenCheckinModal,
  onEditAsset,
  onOpenEditModal,
  onDeleteAsset,
  currentUserRole,
  virtualRow
}: any) => {
  const getRawOrTransformedAsset = (a: any) => a.rawAsset || a;

  return (
    <tr 
      className="hover:bg-slate-50/80 transition-colors group cursor-pointer will-change-transform"
      onClick={() => {
        const raw = getRawOrTransformedAsset(asset);
        if (onViewDetails) onViewDetails(raw);
        else if (onOpenDetailModal) onOpenDetailModal(raw);
      }}
    >
      {/* Asset Tag & Serial */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
          {asset.assetTag}
        </div>
        <div className="text-xs text-slate-400 font-mono mt-0.5 flex items-center gap-1.5">
          <span>{asset.serialNumber}</span>
          <button
            type="button"
            onClick={(e) => handleCopySerial(e, asset.serialNumber)}
            className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-slate-600 transition-opacity p-0.5"
            title="Copy serial number to clipboard"
          >
            {copiedSerial === asset.serialNumber ? (
              <Check className="w-3 h-3 text-emerald-500" />
            ) : (
              <Copy className="w-3 h-3" />
            )}
          </button>
        </div>
      </td>

      {/* Model Name */}
      <td className="px-6 py-4 whitespace-nowrap max-w-xs">
        <div className="font-medium text-slate-800 truncate" title={asset.modelName}>
          {asset.modelName}
        </div>
        <div className="text-xs text-slate-500 mt-0.5">Warranty: {asset.warrantyExpiration}</div>
      </td>

      {/* Category */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="inline-flex items-center capitalize text-slate-700">
          <CategoryIcon category={asset.category} />
          {asset.category.replace('_', ' ')}
        </div>
      </td>

      {/* Status Badge */}
      <td className="px-6 py-4 whitespace-nowrap text-center">
        <StatusBadge status={asset.status} />
      </td>

      {/* Assigned User & Dept */}
      <td className="px-6 py-4 whitespace-nowrap">
        {asset.assignedUser ? (
          <div>
            <div className="font-medium text-slate-800">{asset.assignedUser}</div>
            <div className="text-xs text-slate-500">{asset.department || 'General'}</div>
          </div>
        ) : (
          <span className="text-xs italic text-slate-400">Unassigned</span>
        )}
      </td>

      {/* Cost (Right-Aligned) */}
      <td className="px-6 py-4 whitespace-nowrap text-right font-mono font-medium text-slate-700">
        ${asset.purchaseCost.toLocaleString('en-US', { minimumFractionDigits: 2 })}
      </td>

      {/* Context Action Menu */}
      <td 
        className="px-6 py-4 whitespace-nowrap text-center relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={(e) => {
            e.stopPropagation();
            setActiveMenuAssetId(activeMenuAssetId === asset.id ? null : asset.id);
          }}
          className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors focus:outline-hidden cursor-pointer"
          title="Options"
        >
          <MoreVertical className="w-4 h-4" />
        </button>

        {/* Dropdown Menu */}
        {activeMenuAssetId === asset.id && (
          <div 
            ref={menuRef}
            className="absolute right-6 top-10 z-30 w-48 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 text-left text-xs font-medium animate-in fade-in zoom-in-95 duration-100"
          >
            <button
              onClick={() => {
                setActiveMenuAssetId(null);
                const raw = getRawOrTransformedAsset(asset);
                if (onViewDetails) onViewDetails(raw);
                else if (onOpenDetailModal) onOpenDetailModal(raw);
              }}
              className="w-full px-3 py-2 text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-colors text-left cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5 text-slate-400" />
              <span>View Specifications</span>
            </button>

            {currentUserRole !== 'auditor' && asset.status === 'in_stock' && (
              <button
                onClick={() => {
                  setActiveMenuAssetId(null);
                  const raw = getRawOrTransformedAsset(asset);
                  if (onCheckOut) onCheckOut(raw);
                  else if (onOpenCheckoutModal) onOpenCheckoutModal(raw);
                }}
                className="w-full px-3 py-2 text-emerald-700 hover:bg-emerald-50 flex items-center gap-2 transition-colors text-left cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5 text-emerald-600" />
                <span>Check Out Equipment</span>
              </button>
            )}

            {currentUserRole !== 'auditor' && asset.status === 'assigned' && (
              <button
                onClick={() => {
                  setActiveMenuAssetId(null);
                  const raw = getRawOrTransformedAsset(asset);
                  if (onCheckIn) onCheckIn(raw);
                  else if (onOpenCheckinModal) onOpenCheckinModal(raw);
                }}
                className="w-full px-3 py-2 text-blue-700 hover:bg-blue-50 flex items-center gap-2 transition-colors text-left cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5 text-blue-600" />
                <span>Check In Return</span>
              </button>
            )}

            {currentUserRole !== 'auditor' && (
              <button
                onClick={() => {
                  setActiveMenuAssetId(null);
                  const raw = getRawOrTransformedAsset(asset);
                  if (onEditAsset) onEditAsset(raw);
                  else if (onOpenEditModal) onOpenEditModal(raw);
                }}
                className="w-full px-3 py-2 text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-colors text-left cursor-pointer border-t border-slate-100"
              >
                <Edit2 className="w-3.5 h-3.5 text-slate-400" />
                <span>Edit Metadata</span>
              </button>
            )}

            {currentUserRole === 'admin' && (
              <button
                onClick={() => {
                  setActiveMenuAssetId(null);
                  if (onDeleteAsset) onDeleteAsset(asset.id);
                }}
                className="w-full px-3 py-2 text-rose-700 hover:bg-rose-50 flex items-center gap-2 transition-colors text-left cursor-pointer border-t border-slate-100"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                <span>Retire Asset</span>
              </button>
            )}
          </div>
        )}
      </td>
    </tr>
  );
});

// --- Main Asset Table Component ---
export function AssetInventoryTable({
  assets = [],
  currentUserRole = 'admin',
  onNewAsset,
  onOpenCreateModal,
  onEditAsset,
  onOpenEditModal,
  onDeleteAsset,
  onCheckOut,
  onOpenCheckoutModal,
  onCheckIn,
  onOpenCheckinModal,
  onViewDetails,
  onOpenDetailModal,
}: AssetInventoryTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 250);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Active context menu state
  const [activeMenuAssetId, setActiveMenuAssetId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  // Copied serial feedback
  const [copiedSerial, setCopiedSerial] = useState<string | null>(null);

  // Close context menu on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setActiveMenuAssetId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Normalize incoming assets (supports both raw AppAsset objects from DB and mock Asset format)
  const normalizedAssets: Asset[] = useMemo(() => {
    if (assets && assets.length > 0) {
      return assets.map((a: any) => {
        const isAppAsset = 'asset_tag' in a || 'serial_number' in a;
        if (isAppAsset) {
          return {
            id: a.id,
            assetTag: a.asset_tag,
            serialNumber: a.serial_number,
            modelName: a.model_name,
            category: a.category,
            status: a.status,
            assignedUser: a.assigned_user_name || undefined,
            department: a.department_name || undefined,
            purchaseCost: typeof a.purchase_cost === 'number' ? a.purchase_cost : parseFloat(a.purchase_cost || 0) || 0,
            warrantyExpiration: a.warranty_expiration || 'N/A',
            rawAsset: a,
          };
        }
        return {
          ...a,
          purchaseCost: Number(a.purchaseCost) || 0,
          rawAsset: a.rawAsset || a,
        };
      });
    }
    return MOCK_ASSETS;
  }, [assets]);

  // Hardware Fleet Distribution & Condition Calculations (from screenshot)
  const totalAssetsCount = normalizedAssets.length;
  
  const categoryStats = useMemo(() => {
    const categories: { key: string; label: string }[] = [
      { key: 'laptop', label: 'Laptop' },
      { key: 'desktop', label: 'Desktop' },
      { key: 'monitor', label: 'Monitor' },
      { key: 'mobile', label: 'Mobile' },
      { key: 'peripheral', label: 'Peripheral' },
      { key: 'network_device', label: 'Network Device' },
    ];
    return categories.map(({ key, label }) => {
      const count = normalizedAssets.filter((a) => {
        const cat = (a.category || '').toLowerCase();
        if (key === 'network_device') return cat === 'network_device' || cat === 'network';
        return cat === key;
      }).length;
      const pct = totalAssetsCount > 0 ? Math.round((count / totalAssetsCount) * 100) : 0;
      return { key, label, count, pct };
    });
  }, [normalizedAssets, totalAssetsCount]);

  const conditionStats = useMemo(() => {
    const inStock = normalizedAssets.filter((a) => (a.status || '').toLowerCase() === 'in_stock' || (a.status || '').toLowerCase() === 'available').length;
    const assigned = normalizedAssets.filter((a) => (a.status || '').toLowerCase() === 'assigned').length;
    const inRepair = normalizedAssets.filter((a) => (a.status || '').toLowerCase() === 'in_repair').length;
    const retired = normalizedAssets.filter((a) => (a.status || '').toLowerCase() === 'retired' || (a.status || '').toLowerCase() === 'decommissioned').length;
    return { inStock, assigned, inRepair, retired };
  }, [normalizedAssets]);

  // Filter Logic
  const filteredAssets = useMemo(() => {
    return normalizedAssets.filter((asset) => {
      const q = debouncedSearchTerm.toLowerCase();
      const matchesSearch =
        asset.modelName.toLowerCase().includes(q) ||
        asset.assetTag.toLowerCase().includes(q) ||
        asset.serialNumber.toLowerCase().includes(q) ||
        (asset.assignedUser && asset.assignedUser.toLowerCase().includes(q)) ||
        (asset.department && asset.department.toLowerCase().includes(q));

      const matchesStatus = statusFilter === 'ALL' || asset.status === statusFilter;
      const matchesCategory = categoryFilter === 'ALL' || asset.category === categoryFilter;

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [normalizedAssets, debouncedSearchTerm, statusFilter, categoryFilter]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredAssets.length / itemsPerPage));
  const effectivePage = Math.min(currentPage, totalPages);
  const startIndex = (effectivePage - 1) * itemsPerPage;
  const paginatedAssets = filteredAssets.slice(startIndex, startIndex + itemsPerPage);

  const parentRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: paginatedAssets.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 73,
    overscan: 5,
  });

  const handleCopySerial = (e: React.MouseEvent, serial: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(serial);
    setCopiedSerial(serial);
    setTimeout(() => setCopiedSerial(null), 1800);
  };

  // CSV Export Handler
  const handleExportCSV = () => {
    const headers = [
      'Asset Tag',
      'Serial Number',
      'Hardware Model',
      'Category',
      'Status',
      'Assigned Custodian',
      'Department',
      'Purchase Cost (USD)',
      'Warranty Expiration',
    ];

    const rows = filteredAssets.map((asset) => [
      `"${asset.assetTag}"`,
      `"${asset.serialNumber}"`,
      `"${asset.modelName.replace(/"/g, '""')}"`,
      `"${asset.category}"`,
      `"${asset.status}"`,
      `"${(asset.assignedUser || 'Unassigned').replace(/"/g, '""')}"`,
      `"${(asset.department || 'IT Stock').replace(/"/g, '""')}"`,
      `"${asset.purchaseCost.toFixed(2)}"`,
      `"${asset.warrantyExpiration}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const timestamp = new Date().toISOString().split('T')[0];
    link.href = url;
    link.setAttribute('download', `hardware_inventory_${timestamp}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleAddAssetClick = () => {
    if (onNewAsset) {
      onNewAsset();
    } else if (onOpenCreateModal) {
      onOpenCreateModal();
    }
  };

  const getRawOrTransformedAsset = (item: Asset): AppAsset => {
    if (item.rawAsset) return item.rawAsset;
    return {
      id: item.id,
      asset_tag: item.assetTag,
      serial_number: item.serialNumber,
      model_name: item.modelName,
      category: item.category,
      status: item.status,
      assigned_user_name: item.assignedUser || null,
      department_name: item.department || null,
      purchase_cost: item.purchaseCost,
      warranty_expiration: item.warrantyExpiration,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      
      {/* 1. Header Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Hardware Inventory</h1>
          <p className="text-sm text-slate-500 mt-1">Manage and track hardware assets, warranty statuses, and assignments.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 shadow-xs transition-all focus:outline-hidden focus:ring-2 focus:ring-slate-400 cursor-pointer"
            title="Export filtered records as a CSV spreadsheet"
          >
            <Download className="w-4 h-4 text-slate-500" />
            Export CSV
          </button>
          {currentUserRole !== 'auditor' && (
            <button 
              onClick={handleAddAssetClick}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium shadow-xs transition-all focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 cursor-pointer active:scale-98"
            >
              <Plus className="w-4 h-4" />
              Add Asset
            </button>
          )}
        </div>
      </div>

      {/* Hardware Fleet Distribution & Device Condition & Lifecycle State Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hardware Fleet Distribution */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Hardware Fleet Distribution</h3>
            <span className="text-xs text-slate-400">By Device Category</span>
          </div>

          <div className="space-y-3">
            {categoryStats.map(({ key, label, count, pct }) => {
              const isSelected = categoryFilter === key;
              return (
                <div
                  key={key}
                  className="space-y-1 cursor-pointer group"
                  onClick={() => {
                    setCategoryFilter(isSelected ? 'ALL' : key);
                    setCurrentPage(1);
                  }}
                  title={`Click to filter table by ${label}`}
                >
                  <div className="flex justify-between text-xs">
                    <span className={`font-medium capitalize ${isSelected ? 'text-indigo-600 font-bold' : 'text-slate-700 group-hover:text-indigo-600'}`}>
                      {label}
                    </span>
                    <span className="text-slate-500 font-semibold">
                      {count} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${isSelected ? 'bg-indigo-700 ring-2 ring-indigo-300' : 'bg-indigo-600'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Device Condition & Lifecycle State */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Device Condition &amp; Lifecycle State</h3>
            <span className="text-xs text-slate-400">Asset Status</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div
              onClick={() => {
                setStatusFilter(statusFilter === 'in_stock' ? 'ALL' : 'in_stock');
                setCurrentPage(1);
              }}
              className={`p-3 bg-emerald-50/60 rounded-xl border transition-all cursor-pointer hover:shadow-xs ${
                statusFilter === 'in_stock' ? 'border-emerald-500 ring-2 ring-emerald-300 bg-emerald-100/60' : 'border-emerald-100'
              }`}
              title="Click to filter by In Stock"
            >
              <div className="text-[10px] font-bold text-emerald-800 uppercase">In Stock (Available)</div>
              <div className="text-xl font-bold text-emerald-900 mt-1">{conditionStats.inStock}</div>
              <div className="text-[10px] text-emerald-700 mt-0.5">Ready for immediate employee check-out</div>
            </div>

            <div
              onClick={() => {
                setStatusFilter(statusFilter === 'assigned' ? 'ALL' : 'assigned');
                setCurrentPage(1);
              }}
              className={`p-3 bg-blue-50/60 rounded-xl border transition-all cursor-pointer hover:shadow-xs ${
                statusFilter === 'assigned' ? 'border-blue-500 ring-2 ring-blue-300 bg-blue-100/60' : 'border-blue-100'
              }`}
              title="Click to filter by Assigned"
            >
              <div className="text-[10px] font-bold text-blue-800 uppercase">Assigned in Field</div>
              <div className="text-xl font-bold text-blue-900 mt-1">{conditionStats.assigned}</div>
              <div className="text-[10px] text-blue-700 mt-0.5">Actively provisioned to staff</div>
            </div>

            <div
              onClick={() => {
                setStatusFilter(statusFilter === 'in_repair' ? 'ALL' : 'in_repair');
                setCurrentPage(1);
              }}
              className={`p-3 bg-amber-50/60 rounded-xl border transition-all cursor-pointer hover:shadow-xs ${
                statusFilter === 'in_repair' ? 'border-amber-500 ring-2 ring-amber-300 bg-amber-100/60' : 'border-amber-100'
              }`}
              title="Click to filter by In Repair"
            >
              <div className="text-[10px] font-bold text-amber-800 uppercase">In Repair / RMA</div>
              <div className="text-xl font-bold text-amber-900 mt-1">{conditionStats.inRepair}</div>
              <div className="text-[10px] text-amber-700 mt-0.5">Under maintenance or depot service</div>
            </div>

            <div
              onClick={() => {
                setStatusFilter(statusFilter === 'retired' ? 'ALL' : 'retired');
                setCurrentPage(1);
              }}
              className={`p-3 bg-slate-50 rounded-xl border transition-all cursor-pointer hover:shadow-xs ${
                statusFilter === 'retired' ? 'border-slate-500 ring-2 ring-slate-300 bg-slate-200/60' : 'border-slate-200'
              }`}
              title="Click to filter by Decommissioned"
            >
              <div className="text-[10px] font-bold text-slate-600 uppercase">Decommissioned</div>
              <div className="text-xl font-bold text-slate-900 mt-1">{conditionStats.retired}</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Retired after 4-year lifecycle refresh</div>
            </div>
          </div>

          <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100 text-xs text-indigo-900 flex items-center justify-between">
            <span>Need to provision a temporary workstation?</span>
            <button
              onClick={() => {
                setStatusFilter('in_stock');
                setSearchTerm('');
                setCurrentPage(1);
              }}
              className="text-xs font-bold text-indigo-700 hover:text-indigo-900 underline cursor-pointer"
            >
              Filter In Stock →
            </button>
          </div>
        </div>
      </div>

      {/* 2. Control Bar (Search & Filters) */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        
        {/* Search Input */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search tag, model, serial, or user..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          />
        </div>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 w-full sm:w-auto">
          
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-slate-400 hidden sm:block" />
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full sm:w-auto py-2 pl-3 pr-8 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-700 font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="in_stock">In Stock</option>
              <option value="assigned">Assigned</option>
              <option value="in_repair">In Repair</option>
              <option value="retired">Retired</option>
              <option value="lost">Lost</option>
            </select>
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full sm:w-auto py-2 pl-3 pr-8 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-700 font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
          >
            <option value="ALL">All Categories</option>
            <option value="laptop">Laptops</option>
            <option value="desktop">Desktops</option>
            <option value="monitor">Monitors</option>
            <option value="mobile">Mobile Devices</option>
            <option value="network_device">Network Equipment</option>
            <option value="peripheral">Peripherals</option>
          </select>

        </div>
      </div>

      {/* 3. Main Data Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div ref={parentRef} className="overflow-x-auto max-h-[600px] overflow-y-auto">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-slate-50 z-10">
              <tr className="border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <th scope="col" className="px-6 py-3.5">Asset Tag</th>
                <th scope="col" className="px-6 py-3.5">Model &amp; Spec</th>
                <th scope="col" className="px-6 py-3.5">Category</th>
                <th scope="col" className="px-6 py-3.5 text-center">Status</th>
                <th scope="col" className="px-6 py-3.5">Assigned To</th>
                <th scope="col" className="px-6 py-3.5 text-right">Cost</th>
                <th scope="col" className="px-6 py-3.5 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-sm">
              {paginatedAssets.length > 0 ? (
                <>
                  {rowVirtualizer.getVirtualItems().length > 0 && rowVirtualizer.getVirtualItems()[0].start > 0 && (
                    <tr>
                      <td colSpan={7} style={{ height: `${rowVirtualizer.getVirtualItems()[0].start}px` }} />
                    </tr>
                  )}
                  {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                    const asset = paginatedAssets[virtualRow.index];
                    return (
                      <AssetRow
                        key={asset.id}
                        asset={asset}
                        onViewDetails={onViewDetails}
                        onOpenDetailModal={onOpenDetailModal}
                        handleCopySerial={handleCopySerial}
                        copiedSerial={copiedSerial}
                        activeMenuAssetId={activeMenuAssetId}
                        setActiveMenuAssetId={setActiveMenuAssetId}
                        menuRef={menuRef}
                        onCheckOut={onCheckOut}
                        onOpenCheckoutModal={onOpenCheckoutModal}
                        onCheckIn={onCheckIn}
                        onOpenCheckinModal={onOpenCheckinModal}
                        onEditAsset={onEditAsset}
                        onOpenEditModal={onOpenEditModal}
                        onDeleteAsset={onDeleteAsset}
                        currentUserRole={currentUserRole}
                        virtualRow={virtualRow}
                      />
                    );
                  })}
                  {rowVirtualizer.getVirtualItems().length > 0 && rowVirtualizer.getTotalSize() - rowVirtualizer.getVirtualItems()[rowVirtualizer.getVirtualItems().length - 1].end > 0 && (
                    <tr>
                      <td colSpan={7} style={{ height: `${rowVirtualizer.getTotalSize() - rowVirtualizer.getVirtualItems()[rowVirtualizer.getVirtualItems().length - 1].end}px` }} />
                    </tr>
                  )}
                </>
              ) : (
                /* Empty State */
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                    <p className="text-base font-medium text-slate-700">No assets found</p>
                    <p className="text-sm mt-1 text-slate-400">Try adjusting your search terms or filter constraints.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 4. Table Pagination Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-sm text-slate-600">
            Showing <span className="font-medium text-slate-900">{filteredAssets.length === 0 ? 0 : startIndex + 1}</span>
            {filteredAssets.length > 0 && (
              <>
                {' '}to <span className="font-medium text-slate-900">{Math.min(startIndex + itemsPerPage, filteredAssets.length)}</span>
              </>
            )}{' '}
            of <span className="font-medium text-slate-900">{filteredAssets.length}</span> assets
          </span>

          <div className="inline-flex items-center gap-2">
            <button 
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={effectivePage <= 1}
              className="p-2 border border-slate-300 rounded-lg text-slate-600 bg-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors cursor-pointer"
              title="Previous Page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm font-medium text-slate-700 px-2">
              Page {effectivePage} of {totalPages}
            </span>
            <button 
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={effectivePage >= totalPages}
              className="p-2 border border-slate-300 rounded-lg text-slate-600 bg-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors cursor-pointer"
              title="Next Page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}

export default AssetInventoryTable;
