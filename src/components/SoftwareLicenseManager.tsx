import React, { useState, useEffect } from 'react';
import {
  KeyRound,
  Plus,
  Search,
  AlertTriangle,
  Clock,
  DollarSign,
  Users,
  ShieldCheck,
  Calendar,
  Layers,
  Trash2,
  Edit2,
  ExternalLink,
  UserPlus,
  UserMinus,
  CheckCircle2,
  X,
} from 'lucide-react';
import { SoftwareLicense, LicenseAssignment, User, Asset, UserRole, LicenseType } from '../types';
import { api } from '../api';

interface SoftwareLicenseManagerProps {
  currentUserRole: UserRole;
  users: User[];
  assets: Asset[];
}

export const SoftwareLicenseManager: React.FC<SoftwareLicenseManagerProps> = ({
  currentUserRole,
  users,
  assets,
}) => {
  const [licenses, setLicenses] = useState<(SoftwareLicense & { days_remaining: number | null; warning_level: string; is_over_allocated: boolean })[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLicense, setSelectedLicense] = useState<SoftwareLicense | null>(null);
  const [assignments, setAssignments] = useState<LicenseAssignment[]>([]);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isLicenseModalOpen, setIsLicenseModalOpen] = useState(false);
  const [editingLicense, setEditingLicense] = useState<SoftwareLicense | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionError, setActionError] = useState<string | null>(null);

  // Seat assignment form state
  const [assignType, setAssignType] = useState<'user' | 'asset'>('user');
  const [targetUserId, setTargetUserId] = useState('');
  const [targetAssetId, setTargetAssetId] = useState('');
  const [assignError, setAssignError] = useState('');

  // New License Form State
  const [softwareName, setSoftwareName] = useState('');
  const [vendor, setVendor] = useState('');
  const [licenseKey, setLicenseKey] = useState('');
  const [licenseType, setLicenseType] = useState<LicenseType>('annual_subscription');
  const [totalSeats, setTotalSeats] = useState('10');
  const [renewalCost, setRenewalCost] = useState('1200.00');
  const [expirationDate, setExpirationDate] = useState('');
  const [licenseModalError, setLicenseModalError] = useState('');

  useEffect(() => {
    fetchLicenses();
  }, []);

  const fetchLicenses = async () => {
    try {
      setLoading(true);
      const data = await api.getLicenses();
      setLicenses(data);
    } catch (err) {
      console.error('Failed to load licenses', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAssignments = async (license: SoftwareLicense) => {
    setSelectedLicense(license);
    try {
      const data = await api.getLicenseAssignments(license.id);
      setAssignments(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenAssignModal = () => {
    setAssignError('');
    setAssignType('user');
    setTargetUserId(users[0]?.id || '');
    setTargetAssetId(assets[0]?.id || '');
    setIsAssignModalOpen(true);
  };

  const handleConfirmAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLicense) return;

    try {
      const payload = assignType === 'user' ? { assigned_user_id: targetUserId } : { assigned_asset_id: targetAssetId };
      const res = await api.assignLicenseSeat(selectedLicense.id, payload);
      setAssignments([res.assignment, ...assignments]);
      setIsAssignModalOpen(false);
      fetchLicenses();
    } catch (err: any) {
      setAssignError(err.message || 'Seat assignment failed');
    }
  };

  const handleRevokeSeat = async (assignmentId: string) => {
    if (!selectedLicense) return;
    try {
      setActionError(null);
      await api.revokeLicenseSeat(selectedLicense.id, assignmentId);
      setAssignments(assignments.filter((a) => a.id !== assignmentId));
      fetchLicenses();
    } catch (err: any) {
      setActionError(err.message || 'Failed to revoke seat');
    }
  };

  const handleOpenLicenseModal = (license?: SoftwareLicense) => {
    if (license) {
      setEditingLicense(license);
      setSoftwareName(license.software_name);
      setVendor(license.vendor);
      setLicenseKey(license.license_key || '');
      setLicenseType(license.license_type);
      setTotalSeats(String(license.total_seats));
      setRenewalCost(license.renewal_cost ? String(license.renewal_cost) : '');
      setExpirationDate(license.expiration_date || '');
    } else {
      setEditingLicense(null);
      setSoftwareName('');
      setVendor('');
      setLicenseKey('');
      setLicenseType('annual_subscription');
      setTotalSeats('25');
      setRenewalCost('2400.00');
      const d = new Date();
      d.setFullYear(d.getFullYear() + 1);
      setExpirationDate(d.toISOString().split('T')[0]);
    }
    setLicenseModalError('');
    setIsLicenseModalOpen(true);
  };

  const handleSaveLicense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!softwareName.trim() || !vendor.trim() || !totalSeats) {
      setLicenseModalError('Software Name, Vendor, and Total Seats are required.');
      return;
    }

    try {
      const payload = {
        software_name: softwareName.trim(),
        vendor: vendor.trim(),
        license_key: licenseKey.trim() || null,
        license_type: licenseType,
        total_seats: parseInt(totalSeats, 10),
        renewal_cost: renewalCost ? parseFloat(renewalCost) : null,
        expiration_date: expirationDate || null,
      };

      if (editingLicense) {
        await api.updateLicense(editingLicense.id, payload);
      } else {
        await api.createLicense(payload);
      }

      setIsLicenseModalOpen(false);
      fetchLicenses();
    } catch (err: any) {
      setLicenseModalError(err.message || 'Failed to save license');
    }
  };

  const handleDeleteLicense = async (licenseId: string) => {
    try {
      setActionError(null);
      await api.deleteLicense(licenseId);
      if (selectedLicense?.id === licenseId) setSelectedLicense(null);
      fetchLicenses();
    } catch (err: any) {
      setActionError(err.message || 'Failed to delete license');
    }
  };

  const isReadOnly = currentUserRole === 'auditor';

  const filteredLicenses = licenses.filter((l) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      l.software_name.toLowerCase().includes(q) ||
      l.vendor.toLowerCase().includes(q) ||
      (l.license_key && l.license_key.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-4">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Software Licenses &amp; SaaS Subscriptions</span>
            <span className="px-2 py-0.5 text-xs font-medium bg-amber-50 text-amber-800 rounded-full border border-amber-200">
              {licenses.length} contracts
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor seat allocations, eliminate unused shelfware, and catch 30/60/90-day expiration warnings.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleOpenLicenseModal()}
            disabled={isReadOnly}
            title={isReadOnly ? 'Auditor role is read-only' : 'Add new software contract'}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold shadow-xs transition-all ${
              isReadOnly
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                : 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95'
            }`}
          >
            <Plus className="w-4 h-4" />
            Add Software License
          </button>
        </div>
      </div>

      {/* Operational / Security Error Banner */}
      {actionError && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 px-4 py-3 rounded-xl text-xs font-medium flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{actionError}</span>
          </div>
          <button
            onClick={() => setActionError(null)}
            className="text-rose-500 hover:text-rose-700 p-1 rounded-md"
            title="Dismiss error"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Critical License Expirations Banner (from screenshot) */}
      {licenses.filter((l) => l.warning_level === 'critical_30' || l.warning_level === 'warning_60').length > 0 && (
        <div className="bg-white rounded-2xl border border-rose-200 shadow-xs overflow-hidden">
          <div className="px-5 py-3.5 bg-rose-50/75 border-b border-rose-100 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-rose-900">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <span>Action Required: Software Licenses Approaching Renewal Threshold</span>
            </div>
            <span className="text-xs font-semibold text-rose-700 bg-rose-100/70 px-2.5 py-0.5 rounded-full border border-rose-200">
              {licenses.filter((l) => l.warning_level === 'critical_30' || l.warning_level === 'warning_60').length} urgent renewals
            </span>
          </div>
          <div className="divide-y divide-rose-50 p-2">
            {licenses
              .filter((l) => l.warning_level === 'critical_30' || l.warning_level === 'warning_60')
              .map((lic) => (
                <div
                  key={lic.id}
                  className="px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-rose-50/40 rounded-xl transition-colors text-xs"
                >
                  <div>
                    <div className="font-bold text-slate-900">{lic.software_name}</div>
                    <div className="text-slate-500 text-[11px]">
                      Vendor: {lic.vendor} • Renewal Cost: ${Number(lic.renewal_cost || 0).toLocaleString()} • {lic.allocated_seats}/{lic.total_seats} seats active
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                        lic.warning_level === 'critical_30'
                          ? 'bg-rose-100 text-rose-800 border-rose-300 animate-pulse'
                          : 'bg-amber-100 text-amber-800 border-amber-300'
                      }`}
                    >
                      Expires in {lic.days_remaining} days ({lic.expiration_date})
                    </span>
                    <button
                      onClick={() => handleOpenLicenseModal(lic)}
                      disabled={isReadOnly}
                      className="px-3 py-1 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold shadow-2xs hover:border-slate-300 transition-colors cursor-pointer"
                    >
                      Renew
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Search Input */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search software by title, vendor, or license key..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Main Grid of Licenses */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredLicenses.map((lic) => {
          const seatPct = lic.total_seats > 0 ? Math.round((lic.allocated_seats / lic.total_seats) * 100) : 0;
          const isExpiring30 = lic.warning_level === 'critical_30';
          const isExpiring60 = lic.warning_level === 'warning_60';
          const isExpiring90 = lic.warning_level === 'warning_90';

          return (
            <div
              key={lic.id}
              className={`bg-white rounded-2xl border p-5 shadow-xs flex flex-col justify-between transition-all hover:shadow-md ${
                isExpiring30
                  ? 'border-rose-300 ring-1 ring-rose-300/50'
                  : isExpiring60
                  ? 'border-amber-300'
                  : 'border-slate-200'
              }`}
            >
              <div>
                {/* Card Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2.5">
                    <div className="p-2 rounded-xl bg-amber-50 text-amber-600 shrink-0">
                      <KeyRound className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 leading-snug">{lic.software_name}</h3>
                      <div className="text-xs text-slate-500">{lic.vendor}</div>
                    </div>
                  </div>
                  {/* Warning Badge */}
                  {isExpiring30 && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200 animate-pulse">
                      <AlertTriangle className="w-3 h-3" />
                      {lic.days_remaining}d Left (Urgent)
                    </span>
                  )}
                  {isExpiring60 && !isExpiring30 && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                      <Clock className="w-3 h-3" />
                      {lic.days_remaining}d Left (60d)
                    </span>
                  )}
                  {isExpiring90 && !isExpiring60 && !isExpiring30 && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                      {lic.days_remaining}d Left
                    </span>
                  )}
                </div>

                {/* License Key & Type */}
                <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="font-mono text-[11px] text-slate-500 truncate max-w-[160px] bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                    {lic.license_key || 'No Key Stored'}
                  </span>
                  <span className="capitalize text-[11px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                    {lic.license_type.replace('_', ' ')}
                  </span>
                </div>

                {/* Seat Allocation Progress Bar */}
                <div className="mt-4 space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-slate-600">Seat Utilization:</span>
                    <span className="font-bold text-slate-900">
                      {lic.allocated_seats} / {lic.total_seats} seats ({seatPct}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        seatPct >= 100
                          ? 'bg-rose-500'
                          : seatPct >= 85
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(seatPct, 100)}%` }}
                    />
                  </div>
                  {seatPct >= 100 && (
                    <div className="text-[10px] text-rose-600 font-semibold flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      100% capacity reached. Provision additional seats to avoid lockout.
                    </div>
                  )}
                </div>

                {/* Cost & Expiration */}
                <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <div className="text-[10px] text-slate-400 font-semibold uppercase">Renewal Cost</div>
                    <div className="font-bold text-slate-900 mt-0.5">
                      {lic.renewal_cost
                        ? `$${Number(lic.renewal_cost).toLocaleString('en-US', { minimumFractionDigits: 2 })}`
                        : '—'}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 font-semibold uppercase">Contract Expiry</div>
                    <div className="font-bold text-slate-900 mt-0.5">
                      {lic.expiration_date || 'Perpetual / Ongoing'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => handleOpenAssignments(lic)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 hover:underline"
                >
                  <Users className="w-3.5 h-3.5" />
                  Manage Seats ({lic.allocated_seats})
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenLicenseModal(lic)}
                    disabled={isReadOnly}
                    title={isReadOnly ? 'Auditor is read-only' : 'Edit license contract'}
                    className={`p-1.5 rounded-lg transition-colors ${
                      isReadOnly
                        ? 'text-slate-300 cursor-not-allowed'
                        : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>

                  {currentUserRole === 'admin' && (
                    <button
                      onClick={() => handleDeleteLicense(lic.id)}
                      title="Delete license contract"
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Seat Management Drawer / Modal */}
      {selectedLicense && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Seat Allocations: {selectedLicense.software_name}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {selectedLicense.allocated_seats} of {selectedLicense.total_seats} seats assigned
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedLicense(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-xs font-semibold text-slate-700">
                  Active Licensed Users &amp; Workstations
                </div>
                {!isReadOnly && (
                  <button
                    onClick={handleOpenAssignModal}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-all active:scale-95"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    Assign New Seat
                  </button>
                )}
              </div>

              {/* Assignment Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[11px] font-semibold uppercase">
                    <tr>
                      <th className="py-2.5 px-3">Assignee / Target</th>
                      <th className="py-2.5 px-3">Type</th>
                      <th className="py-2.5 px-3">Assigned Date</th>
                      <th className="py-2.5 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {assignments.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-8 text-center text-slate-400">
                          No seats currently assigned. Click "Assign New Seat" to provision a user.
                        </td>
                      </tr>
                    ) : (
                      assignments.map((asg) => (
                        <tr key={asg.id} className="hover:bg-slate-50/80">
                          <td className="py-2.5 px-3 font-medium text-slate-800">
                            {asg.assigned_user_name || asg.assigned_asset_tag || 'Unknown Target'}
                          </td>
                          <td className="py-2.5 px-3 text-slate-500">
                            {asg.assigned_user_id ? 'Employee Seat' : 'Hardware Node'}
                          </td>
                          <td className="py-2.5 px-3 text-slate-500">
                            {new Date(asg.assigned_at).toLocaleDateString()}
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            {!isReadOnly && (
                              <button
                                onClick={() => handleRevokeSeat(asg.id)}
                                title="Revoke seat and return to available pool"
                                className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-600 hover:text-rose-800 hover:bg-rose-50 px-2 py-1 rounded transition-colors"
                              >
                                <UserMinus className="w-3 h-3" />
                                Revoke
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-3 border-t border-slate-100 flex items-center justify-end bg-slate-50/60">
              <button
                onClick={() => setSelectedLicense(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200/60 rounded-xl transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Seat Sub-Modal */}
      {isAssignModalOpen && selectedLicense && (
        <div className="fixed inset-0 z-60 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h4 className="text-sm font-bold text-slate-900">
                Provision Seat: {selectedLicense.software_name}
              </h4>
              <button
                onClick={() => setIsAssignModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {assignError && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 text-xs text-rose-700 rounded-xl">
                {assignError}
              </div>
            )}

            <form onSubmit={handleConfirmAssign} className="space-y-3 text-xs">
              <div className="flex gap-2 p-1 bg-slate-100 rounded-xl">
                <button
                  type="button"
                  onClick={() => setAssignType('user')}
                  className={`flex-1 py-1.5 rounded-lg font-semibold text-xs transition-colors ${
                    assignType === 'user' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  Assign to Employee
                </button>
                <button
                  type="button"
                  onClick={() => setAssignType('asset')}
                  className={`flex-1 py-1.5 rounded-lg font-semibold text-xs transition-colors ${
                    assignType === 'asset' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  Assign to Hardware
                </button>
              </div>

              {assignType === 'user' ? (
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Select Employee</label>
                  <select
                    value={targetUserId}
                    onChange={(e) => setTargetUserId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  >
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.full_name} ({u.email})
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Select Hardware Device</label>
                  <select
                    value={targetAssetId}
                    onChange={(e) => setTargetAssetId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  >
                    {assets.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.asset_tag} — {a.model_name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAssignModalOpen(false)}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-xs"
                >
                  Confirm Allocation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New / Edit Software License Contract Modal */}
      {isLicenseModalOpen && (
        <div className="fixed inset-0 z-60 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h4 className="text-base font-bold text-slate-900">
                {editingLicense ? 'Modify Software Contract' : 'Add Software License Contract'}
              </h4>
              <button
                onClick={() => setIsLicenseModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {licenseModalError && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 text-xs text-rose-700 rounded-xl">
                {licenseModalError}
              </div>
            )}

            <form onSubmit={handleSaveLicense} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Software Title *</label>
                  <input
                    type="text"
                    required
                    value={softwareName}
                    onChange={(e) => setSoftwareName(e.target.value)}
                    placeholder="e.g. Datadog Infrastructure"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Vendor *</label>
                  <input
                    type="text"
                    required
                    value={vendor}
                    onChange={(e) => setVendor(e.target.value)}
                    placeholder="e.g. Datadog Inc."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">License Key / Org Token</label>
                <input
                  type="text"
                  value={licenseKey}
                  onChange={(e) => setLicenseKey(e.target.value)}
                  placeholder="e.g. DD-ORG-API-KEY-9941"
                  className="w-full px-3 py-2 font-mono bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Subscription Type</label>
                  <select
                    value={licenseType}
                    onChange={(e) => setLicenseType(e.target.value as LicenseType)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  >
                    <option value="annual_subscription">Annual Subscription</option>
                    <option value="monthly_subscription">Monthly Subscription</option>
                    <option value="perpetual">Perpetual License</option>
                    <option value="freemium">Freemium / Open Source</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Total Seats Purchased *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={totalSeats}
                    onChange={(e) => setTotalSeats(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Renewal Cost ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={renewalCost}
                    onChange={(e) => setRenewalCost(e.target.value)}
                    placeholder="4500.00"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Renewal / Expiration Date</label>
                  <input
                    type="date"
                    value={expirationDate}
                    onChange={(e) => setExpirationDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsLicenseModalOpen(false)}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-xs"
                >
                  {editingLicense ? 'Update Contract' : 'Create License'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
