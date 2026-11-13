import React, { useState } from 'react';
import { X, LogOut, LogIn, UserCheck, AlertCircle, Laptop, Tag, Shield } from 'lucide-react';
import { Asset, User } from '../types';

interface CheckInOutModalProps {
  isOpen: boolean;
  mode: 'checkout' | 'checkin';
  asset: Asset | null;
  users: User[];
  onClose: () => void;
  onConfirmCheckout: (assetId: string, userId: string, notes?: string) => Promise<void>;
  onConfirmCheckin: (assetId: string, conditionStatus: string, notes?: string) => Promise<void>;
}

export const CheckInOutModal: React.FC<CheckInOutModalProps> = ({
  isOpen,
  mode,
  asset,
  users,
  onClose,
  onConfirmCheckout,
  onConfirmCheckin,
}) => {
  const [selectedUserId, setSelectedUserId] = useState(users[0]?.id || '');
  const [conditionStatus, setConditionStatus] = useState('in_stock');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen || !asset) return null;

  const targetUser = users.find((u) => u.id === selectedUserId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');

    try {
      if (mode === 'checkout') {
        if (!selectedUserId) {
          setErrorMsg('Please select an employee custodian to receive this equipment.');
          setIsSubmitting(false);
          return;
        }
        await onConfirmCheckout(asset.id, selectedUserId, notes);
      } else {
        await onConfirmCheckin(asset.id, conditionStatus, notes);
      }
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Operation failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-8">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div
              className={`p-2.5 rounded-xl shrink-0 ${
                mode === 'checkout'
                  ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                  : 'bg-blue-50 text-blue-600 border border-blue-100'
              }`}
            >
              {mode === 'checkout' ? <LogOut className="w-5 h-5" /> : <LogIn className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {mode === 'checkout' ? 'Check Out Hardware Equipment' : 'Check In Equipment Return'}
              </h3>
              <p className="text-xs text-slate-500 font-mono">
                {asset.asset_tag} • {asset.model_name}
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Device Summary Banner (2-column info grid) */}
          <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-[10px] uppercase font-semibold text-slate-400 block">Equipment Model</span>
              <span className="font-semibold text-slate-900 block truncate" title={asset.model_name}>
                {asset.model_name}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-semibold text-slate-400 block">Hardware Serial</span>
              <span className="font-mono text-slate-700 block truncate" title={asset.serial_number}>
                {asset.serial_number}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-semibold text-slate-400 block">Current Status</span>
              <span className="font-semibold text-slate-800 capitalize">
                {asset.status.replace('_', ' ')}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                {mode === 'checkout' ? 'Current Location' : 'Previous Custodian'}
              </span>
              <span className="font-medium text-slate-700 truncate block">
                {mode === 'checkout'
                  ? 'IT Central Stock Depot'
                  : asset.assigned_user_name || 'Unassigned'}
              </span>
            </div>
          </div>

          {mode === 'checkout' ? (
            /* Check Out Form (Standard 2-Column Grid) */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Assign To Employee Custodian <span className="text-rose-500">*</span>
                </label>
                <select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  className="w-full h-10 px-3 text-xs font-medium bg-slate-50 hover:bg-slate-100/60 focus:bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all cursor-pointer"
                >
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.full_name} ({u.email}) — {u.department_name}
                    </option>
                  ))}
                </select>
              </div>

              {targetUser && (
                <div className="md:col-span-2 p-3 bg-emerald-50/70 rounded-xl border border-emerald-100 flex items-center gap-2.5 text-xs text-emerald-800">
                  <UserCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div>
                    <span className="font-semibold">{targetUser.full_name}</span> will be registered as the primary custodian in department: <strong>{targetUser.department_name}</strong>.
                  </div>
                </div>
              )}

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Provisioning / Handover Notes
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Issued for hybrid remote setup. EDR sensor verified. Signed acceptance agreement."
                  className="w-full p-3 text-xs bg-slate-50 hover:bg-slate-100/60 focus:bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                />
              </div>
            </div>
          ) : (
            /* Check In Form (Standard 2-Column Grid) */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Returned Hardware Condition Status <span className="text-rose-500">*</span>
                </label>
                <select
                  value={conditionStatus}
                  onChange={(e) => setConditionStatus(e.target.value)}
                  className="w-full h-10 px-3 text-xs font-medium bg-slate-50 hover:bg-slate-100/60 focus:bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
                >
                  <option value="in_stock">In Stock (Good Condition - Ready to Reassign)</option>
                  <option value="in_repair">In Repair (Physical damage or hardware diagnosis required)</option>
                  <option value="retired">Retired (End-of-life / decommissioning)</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Intake Inspection Notes &amp; Shelf Location
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Returned with original OEM power adapter. Drive securely formatted and placed on Shelf B3."
                  className="w-full p-3 text-xs bg-slate-50 hover:bg-slate-100/60 focus:bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>
            </div>
          )}

          {/* Standard Button Hierarchy: Ghost Secondary, Solid Primary */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl border border-slate-200/80 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-5 py-2.5 text-xs font-semibold text-white rounded-xl shadow-xs disabled:opacity-50 transition-all active:scale-[0.98] ${
                mode === 'checkout'
                  ? 'bg-emerald-600 hover:bg-emerald-700 focus:ring-2 focus:ring-emerald-500/20'
                  : 'bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500/20'
              }`}
            >
              {isSubmitting
                ? 'Processing...'
                : mode === 'checkout'
                ? 'Confirm Equipment Check Out'
                : 'Confirm Return Check In'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
