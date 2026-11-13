import React, { useEffect, useState } from 'react';
import { DashboardMetrics } from '../types';
import { api } from '../api';
import { LifecyclePipeline } from './LifecyclePipeline';

interface DashboardOverviewProps {
  onNavigateTab: (tab: 'inventory' | 'licenses' | 'audit' | 'architecture') => void;
  onNewAsset: () => void;
  onStageHover?: (color: string | null) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  onNavigateTab,
  onNewAsset,
  onStageHover,
}) => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const m = await api.getMetrics();
      setMetrics(m);
    } catch (err: any) {
      console.error('Failed to load metrics', err);
      setError(err?.message || 'Failed to connect to metrics service');
    } finally {
      setLoading(false);
    }
  };

  if (error && !metrics) {
    return (
      <div className="p-8 rounded-2xl border border-rose-200 bg-rose-50/50 text-center max-w-lg mx-auto my-12">
        <h3 className="text-sm font-bold text-rose-900 mb-1">Metrics Telemetry Unavailable</h3>
        <p className="text-xs text-rose-700 mb-4">{error}</p>
        <button
          onClick={loadData}
          className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-all cursor-pointer"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  if (loading || !metrics) {
    return (
      <div className="space-y-6 animate-pulse p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-2">
            <div className="h-6 bg-slate-200 rounded-md w-64"></div>
            <div className="h-4 bg-slate-200 rounded-md w-96"></div>
          </div>
          <div className="flex gap-2">
            <div className="h-9 bg-slate-200 rounded-xl w-32"></div>
            <div className="h-9 bg-slate-200 rounded-xl w-40"></div>
          </div>
        </div>
        
        {/* Pipeline Skeleton */}
        <div className="mt-8 relative hidden md:block">
          <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-200 -translate-y-1/2"></div>
          <div className="relative flex justify-between">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 rounded-2xl bg-slate-200 border-4 border-white shadow-xs z-10"></div>
                <div className="h-4 bg-slate-200 rounded-md w-24"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Welcome & KPI Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            IT Service Desk Executive Analytics
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time telemetry across hardware assets, software seats, capital valuation, and SLA compliance.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigateTab('inventory')}
            className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl shadow-xs cursor-pointer"
          >
            Manage Hardware
          </button>
          <button
            onClick={() => onNavigateTab('licenses')}
            className="px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 rounded-xl shadow-xs cursor-pointer"
          >
            Review SaaS Contracts
          </button>
        </div>
      </div>

      {/* 5-Stage Visual Lifecycle Pipeline Grid */}
      <LifecyclePipeline
        metrics={metrics}
        onNavigateTab={onNavigateTab}
        onNewAsset={onNewAsset}
        onStageHover={onStageHover}
      />
    </div>
  );
};
