import {
  Asset,
  SoftwareLicense,
  LicenseAssignment,
  AuditLog,
  DashboardMetrics,
  User,
  Department,
  UserRole,
} from './types';

class ApiService {
  private token: string | null = null;
  private currentRole: UserRole = 'admin';

  constructor() {
    // Load persisted token or role if available
    const savedRole = localStorage.getItem('active_role') as UserRole;
    if (savedRole) {
      this.currentRole = savedRole;
    }
  }

  setRole(role: UserRole) {
    this.currentRole = role;
    localStorage.setItem('active_role', role);
    this.token = null; // force re-login on next request
  }

  getRole(): UserRole {
    return this.currentRole;
  }

  async login(role?: UserRole): Promise<{ token: string; user: User }> {
    const targetRole = role || this.currentRole;
    const res = await fetch('/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: targetRole }),
    });
    if (!res.ok) throw new Error('Login failed');
    const data = await res.json();
    this.token = data.token;
    this.currentRole = data.user.role;
    localStorage.setItem('jwt_token', data.token);
    localStorage.setItem('active_role', data.user.role);
    return data;
  }

  private async getHeaders(): Promise<HeadersInit> {
    if (!this.token) {
      const stored = localStorage.getItem('jwt_token');
      if (stored) {
        this.token = stored;
      } else {
        await this.login(this.currentRole);
      }
    }
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.token}`,
    };
  }

  // Health
  async getHealth() {
    const res = await fetch('/api/v1/health');
    return res.json();
  }

  // Auth & Users
  async getUsers(): Promise<User[]> {
    const res = await fetch('/api/v1/auth/users');
    return res.json();
  }

  async getDepartments(): Promise<Department[]> {
    const res = await fetch('/api/v1/departments');
    return res.json();
  }

  // Assets
  async getAssets(params?: {
    search?: string;
    status?: string;
    category?: string;
    department_id?: string;
    skip?: number;
    limit?: number;
  }): Promise<{ total: number; skip: number; limit: number; items: Asset[] }> {
    const q = new URLSearchParams();
    if (params?.search) q.append('search', params.search);
    if (params?.status && params.status !== 'all') q.append('status', params.status);
    if (params?.category && params.category !== 'all') q.append('category', params.category);
    if (params?.department_id && params.department_id !== 'all') q.append('department_id', params.department_id);
    if (params?.skip !== undefined) q.append('skip', String(params.skip));
    if (params?.limit !== undefined) q.append('limit', String(params.limit));

    const res = await fetch(`/api/v1/assets?${q.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch assets');
    return res.json();
  }

  async getAsset(id: string): Promise<Asset> {
    const res = await fetch(`/api/v1/assets/${id}`);
    if (!res.ok) throw new Error('Asset not found');
    return res.json();
  }

  async createAsset(assetData: Partial<Asset>): Promise<Asset> {
    const headers = await this.getHeaders();
    const res = await fetch('/api/v1/assets', {
      method: 'POST',
      headers,
      body: JSON.stringify(assetData),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to create asset');
    }
    return res.json();
  }

  async updateAsset(id: string, assetData: Partial<Asset>): Promise<Asset> {
    const headers = await this.getHeaders();
    const res = await fetch(`/api/v1/assets/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(assetData),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to update asset');
    }
    return res.json();
  }

  async deleteAsset(id: string): Promise<void> {
    const headers = await this.getHeaders();
    const res = await fetch(`/api/v1/assets/${id}`, {
      method: 'DELETE',
      headers,
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to delete asset');
    }
  }

  async checkoutAsset(id: string, userId: string, notes?: string): Promise<{ message: string; asset: Asset }> {
    const headers = await this.getHeaders();
    const res = await fetch(`/api/v1/assets/${id}/checkout`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ user_id: userId, notes }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to check out asset');
    }
    return res.json();
  }

  async checkinAsset(id: string, conditionStatus: string, checkinNotes?: string): Promise<{ message: string; asset: Asset }> {
    const headers = await this.getHeaders();
    const res = await fetch(`/api/v1/assets/${id}/checkin`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ condition_status: conditionStatus, checkin_notes: checkinNotes }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to check in asset');
    }
    return res.json();
  }

  // Licenses
  async getLicenses(search?: string): Promise<(SoftwareLicense & { days_remaining: number | null; warning_level: string; is_over_allocated: boolean })[]> {
    const q = search ? `?search=${encodeURIComponent(search)}` : '';
    const res = await fetch(`/api/v1/licenses${q}`);
    if (!res.ok) throw new Error('Failed to fetch licenses');
    return res.json();
  }

  async createLicense(licenseData: Partial<SoftwareLicense>): Promise<SoftwareLicense> {
    const headers = await this.getHeaders();
    const res = await fetch('/api/v1/licenses', {
      method: 'POST',
      headers,
      body: JSON.stringify(licenseData),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to create license');
    }
    return res.json();
  }

  async updateLicense(id: string, licenseData: Partial<SoftwareLicense>): Promise<SoftwareLicense> {
    const headers = await this.getHeaders();
    const res = await fetch(`/api/v1/licenses/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(licenseData),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to update license');
    }
    return res.json();
  }

  async deleteLicense(id: string): Promise<void> {
    const headers = await this.getHeaders();
    const res = await fetch(`/api/v1/licenses/${id}`, {
      method: 'DELETE',
      headers,
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to delete license');
    }
  }

  async getLicenseAssignments(licenseId: string): Promise<LicenseAssignment[]> {
    const res = await fetch(`/api/v1/licenses/${licenseId}/assignments`);
    if (!res.ok) throw new Error('Failed to fetch assignments');
    return res.json();
  }

  async assignLicenseSeat(licenseId: string, payload: { assigned_user_id?: string; assigned_asset_id?: string }): Promise<any> {
    const headers = await this.getHeaders();
    const res = await fetch(`/api/v1/licenses/${licenseId}/assign`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to assign seat');
    }
    return res.json();
  }

  async revokeLicenseSeat(licenseId: string, assignmentId: string): Promise<any> {
    const headers = await this.getHeaders();
    const res = await fetch(`/api/v1/licenses/${licenseId}/assignments/${assignmentId}`, {
      method: 'DELETE',
      headers,
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to revoke seat assignment');
    }
    return res.json();
  }

  // Audit Logs
  async getAuditLogs(params?: { entity_type?: string; action?: string; limit?: number }): Promise<AuditLog[]> {
    const q = new URLSearchParams();
    if (params?.entity_type) q.append('entity_type', params.entity_type);
    if (params?.action) q.append('action', params.action);
    if (params?.limit) q.append('limit', String(params.limit));

    const res = await fetch(`/api/v1/audit-logs?${q.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch audit logs');
    return res.json();
  }

  // Dashboard Metrics
  async getMetrics(): Promise<DashboardMetrics> {
    const res = await fetch('/api/v1/metrics');
    if (!res.ok) throw new Error('Failed to fetch dashboard metrics');
    return res.json();
  }
}

export const api = new ApiService();
