import React from 'react';
import {
  X,
  Laptop,
  Monitor,
  Smartphone,
  Server,
  Layers,
  Calendar,
  DollarSign,
  Shield,
  User,
  Building,
  Tag,
  Clock,
  FileText,
  CheckCircle,
  AlertTriangle,
  LogOut,
  LogIn,
  Edit2,
} from 'lucide-react';
import { Asset } from '../types';

interface AssetDetailModalProps {
  isOpen: boolean;
  asset: Asset | null;
  onClose: () => void;
  onEdit: (asset: Asset) => void;
  onCheckOut: (asset: Asset) => void;
  onCheckIn: (asset: Asset) => void;
  isReadOnly?: boolean;
}

export const AssetDetailModal: React.FC<AssetDetailModalProps> = ({
  isOpen,
  asset,
  onClose,
  onEdit,
  onCheckOut,
  onCheckIn,
  isReadOnly,
}) => {
  if (!isOpen || !asset) return null;

  const isWarrantyExpired = asset.warranty_expiration
    ? new Date(asset.warranty_expiration) < new Date()
    : false;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-8">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100 shrink-0">
              <Laptop className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">{asset.model_name}</h3>
                <span className="px-2 py-0.5 text-xs font-mono font-bold bg-slate-100 text-slate-700 rounded-md border border-slate-200">
                  {asset.asset_tag}
                </span>
              </div>
              <p className="text-xs text-slate-500 capitalize">
                Category: {asset.category.replace('_', ' ')} • Serial: {asset.serial_number}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body (Standardized 2-Column Responsive Layout) */}
        <div className="p-6 space-y-5 text-xs text-slate-700">
          {/* Quick Metrics (2x2 grid on mobile, 4-col on desktop) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="text-slate-400 text-[10px] font-semibold uppercase">Status</div>
              <div className="mt-1 font-bold text-slate-900 capitalize flex items-center gap-1.5">
                <span
                  className={`w-2 h-2 rounded-full shrink-0 ${
                    asset.status === 'in_stock'
                      ? 'bg-emerald-500'
                      : asset.status === 'assigned'
                      ? 'bg-blue-500'
                      : asset.status === 'in_repair'
                      ? 'bg-amber-500'
                      : 'bg-slate-400'
                  }`}
                />
                <span className="truncate">{asset.status.replace('_', ' ')}</span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="text-slate-400 text-[10px] font-semibold uppercase">Purchase Value</div>
              <div className="mt-1 font-bold text-slate-900 tabular-nums">
                {asset.purchase_cost
                  ? `$${Number(asset.purchase_cost).toLocaleString('en-US', { minimumFractionDigits: 2 })}`
                  : 'N/A'}
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="text-slate-400 text-[10px] font-semibold uppercase">Procurement Date</div>
              <div className="mt-1 font-bold text-slate-900 truncate">{asset.purchase_date || 'N/A'}</div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="text-slate-400 text-[10px] font-semibold uppercase">Warranty Status</div>
              <div className="mt-1 font-bold truncate">
                {asset.warranty_expiration ? (
                  isWarrantyExpired ? (
                    <span className="text-rose-600">Expired</span>
                  ) : (
                    <span className="text-emerald-700">Active</span>
                  )
                ) : (
                  <span className="text-slate-400">N/A</span>
                )}
              </div>
            </div>
          </div>

          {/* Current Custody / Assignment Card */}
          <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200 space-y-3">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-slate-400" />
              Custody &amp; Department Allocation
            </div>
            {asset.assigned_user_name ? (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-sm shrink-0">
                    {asset.assigned_user_name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-900 truncate" title={asset.assigned_user_name}>
                      {asset.assigned_user_name}
                    </div>
                    <div className="text-[11px] text-slate-500 truncate" title={asset.assigned_user_email}>
                      {asset.assigned_user_email}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Department: {asset.department_name || 'Assigned'}
                    </div>
                  </div>
                </div>
                {!isReadOnly && (
                  <button
                    onClick={() => {
                      onClose();
                      onCheckIn(asset);
                    }}
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-semibold rounded-xl text-xs transition-colors shrink-0"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Check In Return</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="text-slate-500 italic">
                  Device is currently in IT Stock Shelf and available for deployment.
                </div>
                {!isReadOnly && (
                  <button
                    onClick={() => {
                      onClose();
                      onCheckOut(asset);
                    }}
                    className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs transition-colors shadow-xs shrink-0"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Check Out to Employee</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Standard 2-Column Hardware Specification Breakdown */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-1">Asset Tag &amp; Barcode</span>
              <span className="font-mono text-xs font-bold text-slate-900">{asset.asset_tag}</span>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-1">OEM Serial Number</span>
              <span className="font-mono text-xs font-bold text-slate-900">{asset.serial_number}</span>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-1">Device Category</span>
              <span className="font-medium text-xs text-slate-900 capitalize">{asset.category.replace('_', ' ')}</span>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-1">Warranty Expiration</span>
              <span className="font-medium text-xs text-slate-900">{asset.warranty_expiration || 'Not Recorded'}</span>
            </div>
          </div>

          {/* Technical Specs & Provisioning Notes */}
          <div className="space-y-1.5">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              Technical Notes &amp; Enterprise Enrollment
            </div>
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 whitespace-pre-wrap font-mono text-[11px] text-slate-700 leading-relaxed">
              {asset.notes || 'No specific hardware notes or configuration logs recorded.'}
            </div>
          </div>

          {/* Timestamps */}
          <div className="flex flex-col sm:flex-row items-center justify-between pt-2 border-t border-slate-100 text-[11px] text-slate-400 gap-1">
            <span>Created: {new Date(asset.created_at).toLocaleString()}</span>
            <span>Last Updated: {new Date(asset.updated_at).toLocaleString()}</span>
          </div>

          {/* Standardized Button Hierarchy */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl border border-slate-200/80 transition-colors"
            >
              Close
            </button>
            {!isReadOnly && (
              <button
                onClick={() => {
                  onClose();
                  onEdit(asset);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs transition-all active:scale-[0.98]"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit Specifications</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
