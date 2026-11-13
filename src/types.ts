export type UserRole = 'admin' | 'it_agent' | 'auditor';

export type AssetStatus = 'in_stock' | 'assigned' | 'in_repair' | 'retired' | 'lost';

export type AssetCategory = 'laptop' | 'desktop' | 'monitor' | 'mobile' | 'peripheral' | 'network_device';

export type LicenseType = 'perpetual' | 'annual_subscription' | 'monthly_subscription' | 'freemium';

export interface Department {
  id: string;
  name: string;
  cost_center: string;
  created_at: string;
}

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  department_id?: string;
  department_name?: string;
  is_active: boolean;
  created_at: string;
}

export interface Asset {
  id: string;
  asset_tag: string;
  serial_number: string;
  model_name: string;
  category: AssetCategory;
  status: AssetStatus;
  assigned_user_id?: string | null;
  assigned_user_name?: string | null;
  assigned_user_email?: string | null;
  department_id?: string | null;
  department_name?: string | null;
  purchase_date?: string | null;
  warranty_expiration?: string | null;
  purchase_cost?: number | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface SoftwareLicense {
  id: string;
  software_name: string;
  vendor: string;
  license_key?: string | null;
  license_type: LicenseType;
  total_seats: number;
  allocated_seats: number;
  renewal_cost?: number | null;
  expiration_date?: string | null;
  created_at: string;
  updated_at: string;
}

export interface LicenseAssignment {
  id: string;
  license_id: string;
  software_name?: string;
  assigned_user_id?: string | null;
  assigned_user_name?: string | null;
  assigned_asset_id?: string | null;
  assigned_asset_tag?: string | null;
  assigned_at: string;
}

export interface AuditLog {
  id: string;
  entity_type: 'asset' | 'license' | 'assignment' | 'auth';
  entity_id: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'CHECK_OUT' | 'CHECK_IN' | 'SEAT_ASSIGN' | 'SEAT_REVOKE' | 'LOGIN';
  performed_by_id?: string | null;
  performed_by_name: string;
  performed_by_role: UserRole;
  payload?: Record<string, any>;
  created_at: string;
}

export interface DashboardMetrics {
  total_assets: number;
  total_valuation: number;
  unassigned_count: number;
  in_repair_count: number;
  assigned_count: number;
  retired_count: number;
  total_licenses: number;
  total_license_cost: number;
  licenses_expiring_30_days: number;
  licenses_expiring_60_days: number;
  licenses_expiring_90_days: number;
  over_allocated_licenses: number;
  category_distribution: Record<AssetCategory, number>;
  status_distribution: Record<AssetStatus, number>;
}
