import React, { useState, useEffect } from 'react';
import { X, Laptop, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Asset, AssetCategory, AssetStatus, Department } from '../types';

interface AssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (assetData: Partial<Asset>) => Promise<void>;
  editingAsset?: Asset | null;
  departments: Department[];
}

export const AssetModal: React.FC<AssetModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingAsset,
  departments,
}) => {
  const [assetTag, setAssetTag] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [modelName, setModelName] = useState('');
  const [category, setCategory] = useState<AssetCategory>('laptop');
  const [status, setStatus] = useState<AssetStatus>('in_stock');
  const [departmentId, setDepartmentId] = useState('');
  const [purchaseDate, setPurchaseDate] = useState('');
  const [warrantyExpiration, setWarrantyExpiration] = useState('');
  const [purchaseCost, setPurchaseCost] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generalError, setGeneralError] = useState('');

  // Field validation tracking
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (editingAsset) {
      setAssetTag(editingAsset.asset_tag);
      setSerialNumber(editingAsset.serial_number);
      setModelName(editingAsset.model_name);
      setCategory(editingAsset.category);
      setStatus(editingAsset.status);
      setDepartmentId(editingAsset.department_id || '');
      setPurchaseDate(editingAsset.purchase_date || '');
      setWarrantyExpiration(editingAsset.warranty_expiration || '');
      setPurchaseCost(editingAsset.purchase_cost ? String(editingAsset.purchase_cost) : '');
      setNotes(editingAsset.notes || '');
    } else {
      // Generate clean sequential tag suggestion
      const randomTagNum = Math.floor(1000 + Math.random() * 9000);
      setAssetTag(`AST-2024-${randomTagNum}`);
      setSerialNumber('');
      setModelName('');
      setCategory('laptop');
      setStatus('in_stock');
      setDepartmentId(departments[0]?.id || '');
      setPurchaseDate(new Date().toISOString().split('T')[0]);
      // 3 years warranty default
      const future = new Date();
      future.setFullYear(future.getFullYear() + 3);
      setWarrantyExpiration(future.toISOString().split('T')[0]);
      setPurchaseCost('');
      setNotes('');
    }
    setTouched({});
    setFieldErrors({});
    setGeneralError('');
  }, [editingAsset, isOpen, departments]);

  if (!isOpen) return null;

  const validateFields = () => {
    const errors: Record<string, string> = {};
    if (!assetTag.trim()) {
      errors.assetTag = 'Asset Tag is required.';
    }
    if (!serialNumber.trim()) {
      errors.serialNumber = 'OEM Serial Number is required.';
    }
    if (!modelName.trim()) {
      errors.modelName = 'Model & hardware specs are required.';
    }
    if (purchaseCost && (isNaN(Number(purchaseCost)) || Number(purchaseCost) < 0)) {
      errors.purchaseCost = 'Cost must be a valid positive number.';
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    validateFields();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({
      assetTag: true,
      serialNumber: true,
      modelName: true,
      purchaseCost: true,
    });

    if (!validateFields()) {
      setGeneralError('Please resolve the highlighted validation errors before saving.');
      return;
    }

    setIsSubmitting(true);
    setGeneralError('');
    try {
      await onSave({
        asset_tag: assetTag.trim(),
        serial_number: serialNumber.trim(),
        model_name: modelName.trim(),
        category,
        status,
        department_id: departmentId || null,
        purchase_date: purchaseDate || null,
        warranty_expiration: warrantyExpiration || null,
        purchase_cost: purchaseCost ? parseFloat(purchaseCost) : null,
        notes: notes.trim() || null,
      });
      onClose();
    } catch (err: any) {
      const msg = err.message || 'Failed to save hardware asset record.';
      setGeneralError(msg);
      if (msg.toLowerCase().includes('asset tag')) {
        setFieldErrors((prev) => ({ ...prev, assetTag: msg }));
        setTouched((prev) => ({ ...prev, assetTag: true }));
      } else if (msg.toLowerCase().includes('serial number')) {
        setFieldErrors((prev) => ({ ...prev, serialNumber: msg }));
        setTouched((prev) => ({ ...prev, serialNumber: true }));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-8">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100 shrink-0">
              <Laptop className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {editingAsset ? 'Modify Hardware Asset' : 'Register New Hardware Asset'}
              </h3>
              <p className="text-xs text-slate-500">
                {editingAsset
                  ? `Updating specifications for asset ${editingAsset.asset_tag}`
                  : 'Register a physical hardware unit in the central enterprise inventory.'}
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

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {generalError && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
              <span className="font-medium">{generalError}</span>
            </div>
          )}

          {/* Standardized 2-Column Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Col 1: Asset Tag */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Asset Tag <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={assetTag}
                onChange={(e) => setAssetTag(e.target.value)}
                onBlur={() => handleBlur('assetTag')}
                placeholder="e.g. AST-2024-1001"
                disabled={!!editingAsset}
                className={`w-full h-10 px-3 text-xs font-mono rounded-xl border transition-all text-slate-900 placeholder:text-slate-400 focus:outline-hidden ${
                  touched.assetTag && fieldErrors.assetTag
                    ? 'border-rose-300 bg-rose-50/20 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20'
                    : 'bg-slate-50 hover:bg-slate-100/60 focus:bg-white border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20'
                } disabled:opacity-60 disabled:cursor-not-allowed`}
              />
              {touched.assetTag && fieldErrors.assetTag ? (
                <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1 font-medium">
                  <AlertCircle className="w-3 h-3 shrink-0" /> {fieldErrors.assetTag}
                </p>
              ) : (
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Unique internal inventory tracking barcode / RFID tag
                </span>
              )}
            </div>

            {/* Col 2: Serial Number */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Serial Number <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={serialNumber}
                onChange={(e) => setSerialNumber(e.target.value)}
                onBlur={() => handleBlur('serialNumber')}
                placeholder="e.g. C02G80XZMD6T"
                disabled={!!editingAsset}
                className={`w-full h-10 px-3 text-xs font-mono rounded-xl border transition-all text-slate-900 placeholder:text-slate-400 focus:outline-hidden ${
                  touched.serialNumber && fieldErrors.serialNumber
                    ? 'border-rose-300 bg-rose-50/20 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20'
                    : 'bg-slate-50 hover:bg-slate-100/60 focus:bg-white border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20'
                } disabled:opacity-60 disabled:cursor-not-allowed`}
              />
              {touched.serialNumber && fieldErrors.serialNumber ? (
                <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1 font-medium">
                  <AlertCircle className="w-3 h-3 shrink-0" /> {fieldErrors.serialNumber}
                </p>
              ) : (
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Manufacturer hardware serial for OEM support
                </span>
              )}
            </div>

            {/* Col 1 & 2 Full Span: Model Name */}
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Hardware Model &amp; Key Specifications <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={modelName}
                onChange={(e) => setModelName(e.target.value)}
                onBlur={() => handleBlur('modelName')}
                placeholder="e.g. Dell XPS 15 9530 (Intel Core i9, 32GB RAM, 1TB NVMe, RTX 4070)"
                className={`w-full h-10 px-3 text-xs rounded-xl border transition-all text-slate-900 placeholder:text-slate-400 focus:outline-hidden ${
                  touched.modelName && fieldErrors.modelName
                    ? 'border-rose-300 bg-rose-50/20 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20'
                    : 'bg-slate-50 hover:bg-slate-100/60 focus:bg-white border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20'
                }`}
              />
              {touched.modelName && fieldErrors.modelName && (
                <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1 font-medium">
                  <AlertCircle className="w-3 h-3 shrink-0" /> {fieldErrors.modelName}
                </p>
              )}
            </div>

            {/* Col 1: Category */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Device Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as AssetCategory)}
                className="w-full h-10 px-3 text-xs font-medium bg-slate-50 hover:bg-slate-100/60 border border-slate-200 rounded-xl text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer"
              >
                <option value="laptop">Laptop Computer</option>
                <option value="desktop">Workstation / Desktop</option>
                <option value="monitor">External Display / Monitor</option>
                <option value="mobile">Mobile Phone / Tablet</option>
                <option value="network_device">Network Gear / Router / Switch</option>
                <option value="peripheral">Peripheral / Dock / Accessory</option>
              </select>
            </div>

            {/* Col 2: Status */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Condition &amp; Availability Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as AssetStatus)}
                className="w-full h-10 px-3 text-xs font-medium bg-slate-50 hover:bg-slate-100/60 border border-slate-200 rounded-xl text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer"
              >
                <option value="in_stock">In Stock (Ready for Deployment)</option>
                <option value="assigned">Assigned (In Active Use)</option>
                <option value="in_repair">In Repair (Service Ticket Open)</option>
                <option value="retired">Retired (End of Lifecycle)</option>
                <option value="lost">Lost / Stolen</option>
              </select>
            </div>

            {/* Col 1: Department */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Assigned Department Cost Center
              </label>
              <select
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value)}
                className="w-full h-10 px-3 text-xs font-medium bg-slate-50 hover:bg-slate-100/60 border border-slate-200 rounded-xl text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer"
              >
                <option value="">Unassigned / IT Central Reserve</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name} ({dept.code})
                  </option>
                ))}
              </select>
            </div>

            {/* Col 2: Purchase Cost */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Valuation / Purchase Cost ($)
              </label>
              <input
                type="number"
                step="0.01"
                value={purchaseCost}
                onChange={(e) => setPurchaseCost(e.target.value)}
                onBlur={() => handleBlur('purchaseCost')}
                placeholder="2499.00"
                className={`w-full h-10 px-3 text-xs rounded-xl border transition-all text-slate-900 placeholder:text-slate-400 focus:outline-hidden ${
                  touched.purchaseCost && fieldErrors.purchaseCost
                    ? 'border-rose-300 bg-rose-50/20 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20'
                    : 'bg-slate-50 hover:bg-slate-100/60 focus:bg-white border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20'
                }`}
              />
              {touched.purchaseCost && fieldErrors.purchaseCost && (
                <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1 font-medium">
                  <AlertCircle className="w-3 h-3 shrink-0" /> {fieldErrors.purchaseCost}
                </p>
              )}
            </div>

            {/* Col 1: Purchase Date */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Purchase / Procurement Date
              </label>
              <input
                type="date"
                value={purchaseDate}
                onChange={(e) => setPurchaseDate(e.target.value)}
                className="w-full h-10 px-3 text-xs bg-slate-50 hover:bg-slate-100/60 focus:bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              />
            </div>

            {/* Col 2: Warranty Expiration */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Warranty Expiration Date
              </label>
              <input
                type="date"
                value={warrantyExpiration}
                onChange={(e) => setWarrantyExpiration(e.target.value)}
                className="w-full h-10 px-3 text-xs bg-slate-50 hover:bg-slate-100/60 focus:bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              />
            </div>

            {/* Col 1 & 2 Full Span: Notes */}
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Internal IT Notes, MDM Enrolment &amp; Specs
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Enrolled in Microsoft Intune and Jamf Pro. Pre-configured with BitLocker / FileVault disk encryption."
                className="w-full p-3 text-xs bg-slate-50 hover:bg-slate-100/60 focus:bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              />
            </div>
          </div>

          {/* Standardized Button Hierarchy: Ghost Secondary, Solid Primary */}
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
              className="px-5 py-2.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white rounded-xl shadow-xs disabled:opacity-50 transition-all flex items-center gap-1.5"
            >
              {isSubmitting ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Saving Record...</span>
                </>
              ) : editingAsset ? (
                'Save Changes'
              ) : (
                'Create Hardware Record'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
