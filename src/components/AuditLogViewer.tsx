import React, { useEffect, useState } from 'react';
import {
  History,
  Search,
  Filter,
  Shield,
  User,
  Clock,
  ArrowRight,
  Laptop,
  KeyRound,
  FileCode,
  CheckCircle,
  RefreshCw,
} from 'lucide-react';
import { AuditLog } from '../types';
import { api } from '../api';

export const AuditLogViewer: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [selectedEntity, setSelectedEntity] = useState<string>('all');
  const [selectedAction, setSelectedAction] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const data = await api.getAuditLogs({ limit: 100 });
      setLogs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter((log) => {
    if (selectedEntity !== 'all' && log.entity_type !== selectedEntity) return false;
    if (selectedAction !== 'all' && log.action !== selectedAction) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchActor = log.performed_by_name.toLowerCase().includes(q);
      const matchAction = log.action.toLowerCase().includes(q);
      const matchPayload = JSON.stringify(log.payload || {}).toLowerCase().includes(q);
      return matchActor || matchAction || matchPayload;
    }
    return true;
  });

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'CHECK_OUT':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'CHECK_IN':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'CREATE':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'UPDATE':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'DELETE':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'SEAT_ASSIGN':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'SEAT_REVOKE':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'LOGIN':
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Enterprise Compliance &amp; Audit Trail</span>
            <span className="px-2 py-0.5 text-xs font-medium bg-slate-100 text-slate-700 rounded-full border border-slate-200">
              {filteredLogs.length} events
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Immutable log of hardware provisioning, license allocations, and administrative state changes.
          </p>
        </div>

        <button
          onClick={fetchLogs}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold shadow-xs transition-colors self-start"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh Audit Trail
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs grid grid-cols-1 sm:grid-cols-12 gap-3 text-xs">
        <div className="relative sm:col-span-6">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by agent name, entity, action, or details..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>

        <div className="sm:col-span-3">
          <select
            value={selectedEntity}
            onChange={(e) => setSelectedEntity(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none"
          >
            <option value="all">All Entity Types</option>
            <option value="asset">Hardware Asset</option>
            <option value="license">Software License</option>
            <option value="assignment">Seat Assignment</option>
            <option value="auth">Authentication</option>
          </select>
        </div>

        <div className="sm:col-span-3">
          <select
            value={selectedAction}
            onChange={(e) => setSelectedAction(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none"
          >
            <option value="all">All Actions</option>
            <option value="CHECK_OUT">CHECK_OUT</option>
            <option value="CHECK_IN">CHECK_IN</option>
            <option value="CREATE">CREATE</option>
            <option value="UPDATE">UPDATE</option>
            <option value="DELETE">DELETE</option>
            <option value="SEAT_ASSIGN">SEAT_ASSIGN</option>
            <option value="SEAT_REVOKE">SEAT_REVOKE</option>
            <option value="LOGIN">LOGIN</option>
          </select>
        </div>
      </div>

      {/* Log Feed */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs divide-y divide-slate-100 overflow-hidden">
        {filteredLogs.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            No audit records matching your filter criteria.
          </div>
        ) : (
          filteredLogs.map((log) => (
            <div key={log.id} className="p-4 hover:bg-slate-50/70 transition-colors text-xs space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded-md font-bold text-[10px] uppercase border ${getActionBadge(log.action)}`}>
                    {log.action}
                  </span>
                  <span className="font-semibold text-slate-900 capitalize">
                    {log.entity_type} ID: <code className="font-mono text-[11px] text-slate-600 bg-slate-100 px-1 py-0.5 rounded">{log.entity_id}</code>
                  </span>
                </div>
                <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{new Date(log.created_at).toLocaleString()}</span>
                </div>
              </div>

              {/* Actor & Role */}
              <div className="flex items-center gap-2 text-slate-600">
                <span className="font-medium">Performed by:</span>
                <span className="font-bold text-slate-800">{log.performed_by_name}</span>
                <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 text-[10px] uppercase font-mono">
                  {log.performed_by_role}
                </span>
              </div>

              {/* Payload Diff / Details */}
              {log.payload && (
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 font-mono text-[11px] text-slate-700 whitespace-pre-wrap">
                  {JSON.stringify(log.payload, null, 2)}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
