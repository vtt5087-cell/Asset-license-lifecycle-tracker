import React, { useState } from 'react';
import {
  Edit3,
  Camera,
  Tag,
  ClipboardCheck,
  MessageSquare,
  UserCheck,
  Share2,
  Truck,
  Search,
  MapPin,
  RefreshCw,
  ShieldCheck,
  Clock,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  QrCode,
  Printer,
  X,
} from 'lucide-react';
import { DashboardMetrics } from '../types';

export interface LifecyclePipelineProps {
  metrics?: DashboardMetrics | null;
  onNavigateTab: (tab: 'inventory' | 'licenses' | 'audit' | 'architecture') => void;
  onNewAsset: () => void;
  onStageHover?: (color: string | null) => void;
}

interface ActionItem {
  id: string;
  name: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  handler: () => void;
}

interface StageDefinition {
  number: string;
  title: string;
  subtitle: string;
  color: string;
  metricHeading: string;
  primaryValue: string;
  secondaryValue: string;
  tertiaryDetail?: string;
  badgeAccentBg: string;
  lightBg: string;
  borderColor: string;
  textColor: string;
  actions: ActionItem[];
}

export const LifecyclePipeline: React.FC<LifecyclePipelineProps> = ({
  metrics,
  onNavigateTab,
  onNewAsset,
}) => {
  // Modal states for rich functional action handlers
  const [isTagModalOpen, setIsTagModalOpen] = useState(false);
  const [isCaptureModalOpen, setIsCaptureModalOpen] = useState(false);
  const [capturedSerial, setCapturedSerial] = useState<string | null>(null);
  const [tagSampleAsset] = useState({
    tag: 'AST-2026-089',
    serial: 'SN-X1C-994821',
    model: 'ThinkPad X1 Carbon Gen 11',
    custodian: 'Unassigned (In Stock)',
  });
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const triggerNotice = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 3500);
  };

  // Dynamic values based on backend metrics with fallback to user prompt requirements
  const valuation = metrics?.total_valuation
    ? `$${metrics.total_valuation.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : '$18,984.00';

  const totalAssets = metrics?.total_assets ?? 10;
  const inStock = metrics?.unassigned_count ?? 2;
  const assignedCount = metrics?.assigned_count ?? 6;
  const inRepairCount = metrics?.in_repair_count ?? 1;
  const retiredCount = metrics?.retired_count ?? 1;
  const expiring30 = metrics?.licenses_expiring_30_days ?? 2;
  const expiring60 = metrics?.licenses_expiring_60_days ?? 1;
  const totalExpiring = expiring30 + expiring60;

  const stages: StageDefinition[] = [
    {
      number: '01',
      title: 'Asset Creation',
      subtitle: 'Intake & Registration',
      color: '#E53935',
      badgeAccentBg: 'bg-red-600',
      lightBg: 'bg-red-50/50',
      borderColor: 'border-red-200',
      textColor: 'text-red-600',
      metricHeading: 'TOTAL HARDWARE VALUATION',
      primaryValue: valuation,
      secondaryValue: `${totalAssets} devices registered in PostgreSQL`,
      tertiaryDetail: 'Procured & Asset Tagged',
      actions: [
        {
          id: 'design',
          name: 'Design',
          subtitle: 'Spec hardware profile',
          icon: Edit3,
          handler: () => onNewAsset(),
        },
        {
          id: 'capture',
          name: 'Capture',
          subtitle: 'Intake camera scan',
          icon: Camera,
          handler: () => {
            setCapturedSerial(`SN-CAPTURE-${Math.floor(100000 + Math.random() * 900000)}`);
            setIsCaptureModalOpen(true);
          },
        },
        {
          id: 'tag',
          name: 'Tag',
          subtitle: 'Generate barcode / RFID',
          icon: Tag,
          handler: () => setIsTagModalOpen(true),
        },
      ],
    },
    {
      number: '02',
      title: 'Asset Management',
      subtitle: 'Custody & Readiness',
      color: '#FB8C00',
      badgeAccentBg: 'bg-amber-600',
      lightBg: 'bg-amber-50/50',
      borderColor: 'border-amber-200',
      textColor: 'text-amber-600',
      metricHeading: 'READY TO DEPLOY (IN STOCK)',
      primaryValue: `${inStock} / ${totalAssets} total`,
      secondaryValue: `${assignedCount} assigned, ${inRepairCount} in repair`,
      tertiaryDetail: 'Tested & Depot Ready',
      actions: [
        {
          id: 'review',
          name: 'Review',
          subtitle: 'Inspect inventory stock',
          icon: ClipboardCheck,
          handler: () => onNavigateTab('inventory'),
        },
        {
          id: 'annotate',
          name: 'Annotate',
          subtitle: 'Log maintenance notes',
          icon: MessageSquare,
          handler: () => onNavigateTab('audit'),
        },
        {
          id: 'approve',
          name: 'Approve',
          subtitle: 'Validate user assignment',
          icon: UserCheck,
          handler: () => onNavigateTab('inventory'),
        },
      ],
    },
    {
      number: '03',
      title: 'Asset Distribution',
      subtitle: 'Fulfillment & Handover',
      color: '#4CAF50',
      badgeAccentBg: 'bg-emerald-600',
      lightBg: 'bg-emerald-50/50',
      borderColor: 'border-emerald-200',
      textColor: 'text-emerald-600',
      metricHeading: 'DEPLOYMENT SLA',
      primaryValue: '98%',
      secondaryValue: 'Units Deployed Today: 5',
      tertiaryDetail: 'Target SLA: 95% • Lead: 1.4h',
      actions: [
        {
          id: 'share',
          name: 'Share',
          subtitle: 'Export handover manifest',
          icon: Share2,
          handler: () => {
            triggerNotice('Equipment handover manifest prepared for sharing.');
            onNavigateTab('inventory');
          },
        },
        {
          id: 'deliver',
          name: 'Deliver',
          subtitle: 'Dispatch workstation checkout',
          icon: Truck,
          handler: () => onNavigateTab('inventory'),
        },
      ],
    },
    {
      number: '04',
      title: 'Retrieval & Optimization',
      subtitle: 'SaaS & Fleet Refresh',
      color: '#1E88E5',
      badgeAccentBg: 'bg-blue-600',
      lightBg: 'bg-blue-50/50',
      borderColor: 'border-blue-200',
      textColor: 'text-blue-600',
      metricHeading: 'UPCOMING EXPIRATIONS',
      primaryValue: `${totalExpiring}`,
      secondaryValue: `${expiring30} within 30d, ${expiring60} in 60d`,
      tertiaryDetail: 'Critical renewals flagged',
      actions: [
        {
          id: 'search',
          name: 'Search',
          subtitle: 'Filter contracts & serials',
          icon: Search,
          handler: () => onNavigateTab('licenses'),
        },
        {
          id: 'find',
          name: 'Find',
          subtitle: 'Locate device custodian',
          icon: MapPin,
          handler: () => onNavigateTab('inventory'),
        },
        {
          id: 'reuse',
          name: 'Reuse',
          subtitle: 'Re-certify returned unit',
          icon: RefreshCw,
          handler: () => onNavigateTab('inventory'),
        },
      ],
    },
    {
      number: '05',
      title: 'Archive & Retirement',
      subtitle: 'Decommission & Audit',
      color: '#00ACC1',
      badgeAccentBg: 'bg-teal-600',
      lightBg: 'bg-teal-50/50',
      borderColor: 'border-teal-200',
      textColor: 'text-teal-600',
      metricHeading: 'TOTAL DECOMMISSIONED',
      primaryValue: `${retiredCount} Assets`,
      secondaryValue: 'Compliance Audit Status: 100%',
      tertiaryDetail: 'NIST 800-88 sanitized & e-Waste certified',
      actions: [
        {
          id: 'preserve',
          name: 'Preserve',
          subtitle: 'Permanent immutable audit trail',
          icon: ShieldCheck,
          handler: () => onNavigateTab('audit'),
        },
        {
          id: 'expire',
          name: 'Expire',
          subtitle: 'Decommission & wipe record',
          icon: Clock,
          handler: () => onNavigateTab('licenses'),
        },
      ],
    },
  ];

  return (
    <div className="space-y-4">
      {/* Toast Notice */}
      {actionNotice && (
        <div className="bg-slate-900 text-white text-xs px-4 py-2.5 rounded-xl shadow-lg flex items-center justify-between animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{actionNotice}</span>
          </div>
          <button onClick={() => setActionNotice(null)} className="text-slate-400 cursor-pointer">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 5-Stage Visual Lifecycle Pipeline Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 pt-6">
        {stages.map((stage, idx) => {
          return (
            <div
              key={stage.number}
              className="rounded-2xl border border-slate-200 bg-white shadow-sm flex flex-col justify-between overflow-hidden relative cursor-pointer"
            >
              {/* Hexagonal Header Badge (Overlapping the Chevron Apex) */}
              <div className="absolute -top-5 left-1/2 -translate-x-1/2 z-20">
                <div className="relative flex items-center justify-center">
                  {/* SVG Hexagon Definition with crisp white stroke and drop shadow */}
                  <svg
                    width="48"
                    height="54"
                    viewBox="0 0 48 54"
                    className="filter drop-shadow-md overflow-visible"
                  >
                    <polygon
                      points="24,2 45,14 45,40 24,52 3,40 3,14"
                      fill={stage.color}
                      stroke="#FFFFFF"
                      strokeWidth="2.5"
                      strokeLinejoin="round"
                    />
                    <text
                      x="24"
                      y="33"
                      textAnchor="middle"
                      fill="#FFFFFF"
                      fontSize="15"
                      fontWeight="800"
                      fontFamily="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace"
                    >
                      {stage.number}
                    </text>
                  </svg>
                </div>
              </div>

              {/* Top Container with Chevron Point Shape */}
              <div>
                <div
                  className="w-full pt-9 pb-4 px-3.5 text-white text-center relative chevron-top-peak"
                  style={{ backgroundColor: stage.color }}
                >
                  <div className="text-[10px] uppercase font-mono tracking-widest text-white/80 font-bold">
                    Stage {stage.number}
                  </div>
                  <h3 className="font-bold text-base leading-snug tracking-tight text-white mt-0.5">
                    {stage.title}
                  </h3>
                  <div className="text-[11px] text-white/90 font-medium mt-0.5">
                    {stage.subtitle}
                  </div>
                </div>

                {/* Downward Chevron Notch Accent */}
                <div
                  className="h-2.5 w-full chevron-arrow-point -mt-0.5"
                  style={{ backgroundColor: stage.color }}
                />

                {/* Telemetry Metrics Panel */}
                <div
                  className="p-4 border-b border-slate-100"
                  style={{
                    backgroundColor: 'rgba(248, 250, 252, 0.7)',
                  }}
                >
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 line-clamp-1">
                    {stage.metricHeading}
                  </div>
                  <div
                    className="text-xl font-extrabold text-slate-900 tracking-tight mt-1"
                    title={stage.primaryValue}
                  >
                    {stage.primaryValue}
                  </div>
                  <div className="text-xs font-semibold text-slate-600 mt-1 line-clamp-1">
                    {stage.secondaryValue}
                  </div>
                  {stage.tertiaryDetail && (
                    <div className="text-[10px] text-slate-500 mt-1 flex items-center gap-1">
                      <span
                        className="w-1.5 h-1.5 rounded-full shrink-0"
                        style={{ backgroundColor: stage.color }}
                      />
                      <span className="truncate">{stage.tertiaryDetail}</span>
                    </div>
                  )}
                </div>

                {/* Lifecycle Functional Actions */}
                <div className="p-3.5 space-y-2">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">
                    Lifecycle Actions
                  </div>
                  <div className="space-y-1.5">
                    {stage.actions.map((act) => {
                      const IconComponent = act.icon;
                      return (
                        <button
                          key={act.id}
                          onClick={act.handler}
                          className="w-full flex items-center justify-between p-2 rounded-xl text-left border cursor-pointer"
                          style={{
                            backgroundColor: 'rgba(248, 250, 252, 0.7)',
                            borderColor: 'rgba(226, 232, 240, 0.8)',
                          }}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div
                              className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 shadow-2xs"
                              style={{
                                backgroundColor: `${stage.color}20`,
                                color: stage.color,
                              }}
                            >
                              <IconComponent className="w-3.5 h-3.5" />
                            </div>
                            <div className="min-w-0">
                              <div className="text-xs font-bold text-slate-800 flex items-center gap-1">
                                <span>{act.name}</span>
                              </div>
                              <div className="text-[10px] text-slate-500 truncate">
                                {act.subtitle}
                              </div>
                            </div>
                          </div>
                          <ArrowRight className="w-3 h-3 text-slate-400 shrink-0 ml-1" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Bottom Pipeline Progress Bar & Connector */}
              <div
                className="px-3.5 py-2.5 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500"
                style={{
                  backgroundColor: 'rgba(248, 250, 252, 0.8)',
                }}
              >
                <span className="flex items-center gap-1 font-medium">
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: stage.color }}
                  />
                  Pipeline Step {idx + 1} of 5
                </span>
                <span className="font-semibold text-slate-400">
                  {idx < 4 ? '→ Next' : '✓ Verified'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Interactive Modal: Asset RFID & QR Tag Preview */}
      {isTagModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-red-50 text-red-600">
                  <Tag className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Asset Tag &amp; Barcode Label</h4>
                  <p className="text-xs text-slate-500">Stage 01: Physical Equipment Identification</p>
                </div>
              </div>
              <button
                onClick={() => setIsTagModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Printable Asset Tag Sticker Preview */}
            <div className="my-5 p-4 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 flex flex-col items-center text-center">
              <div className="w-full bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex items-center gap-4">
                <div className="p-2 bg-slate-900 rounded-lg text-white">
                  <QrCode className="w-12 h-12" />
                </div>
                <div className="text-left space-y-0.5 min-w-0">
                  <div className="text-[10px] font-bold uppercase text-red-600 tracking-wider">
                    PROPERTY OF IT SERVICE DESK
                  </div>
                  <div className="text-base font-mono font-bold text-slate-900">
                    {tagSampleAsset.tag}
                  </div>
                  <div className="text-xs font-mono text-slate-500 truncate">
                    SN: {tagSampleAsset.serial}
                  </div>
                  <div className="text-[11px] text-slate-700 font-semibold truncate">
                    {tagSampleAsset.model}
                  </div>
                </div>
              </div>
              <p className="text-[11px] text-slate-500 mt-2">
                Thermal barcode printer ready (Zebra ZD421 / DYMO 450 compatible)
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  setIsTagModalOpen(false);
                  triggerNotice(`Asset tag ${tagSampleAsset.tag} sent to IT zebra thermal printer.`);
                }}
                className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl flex items-center gap-1.5 transition-colors"
              >
                <Printer className="w-4 h-4 text-slate-600" />
                <span>Print Tag Label</span>
              </button>
              <button
                onClick={() => {
                  setIsTagModalOpen(false);
                  onNewAsset();
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <Sparkles className="w-4 h-4" />
                <span>Register New Hardware</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Modal: Camera Intake & Serial Capture */}
      {isCaptureModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-red-50 text-red-600">
                  <Camera className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Intake Hardware Capture</h4>
                  <p className="text-xs text-slate-500">Stage 01: Optical Serial &amp; Model OCR</p>
                </div>
              </div>
              <button
                onClick={() => setIsCaptureModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="my-5 p-5 rounded-xl bg-slate-900 text-white flex flex-col items-center justify-center relative overflow-hidden">
              <div className="w-44 h-24 border-2 border-red-500 rounded-lg flex items-center justify-center relative">
                <div className="w-full h-0.5 bg-red-500/80 absolute animate-pulse" />
                <span className="text-[10px] font-mono text-red-300">ALIGN OEM BARCODE</span>
              </div>
              <div className="mt-3 text-center">
                <span className="text-xs font-bold text-emerald-400 flex items-center justify-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Serial Captured
                </span>
                <span className="text-sm font-mono text-slate-300 font-bold block mt-0.5">
                  {capturedSerial}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setIsCaptureModalOpen(false)}
                className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setIsCaptureModalOpen(false);
                  onNewAsset();
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-xs"
              >
                Populate Intake Form
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
