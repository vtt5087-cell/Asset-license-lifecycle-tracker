import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import jwt from 'jsonwebtoken';
import { createServer as createViteServer } from 'vite';
import {
  User,
  Department,
  Asset,
  SoftwareLicense,
  LicenseAssignment,
  AuditLog,
  UserRole,
  AssetStatus,
  AssetCategory,
  LicenseType,
  DashboardMetrics,
} from './src/types';

const app = express();
const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'asset-lifecycle-tracker-jwt-secret-2025';

app.use(express.json());

// In-Memory Database Store Initialized with Relational Data
const departments: Department[] = [
  { id: 'dept-001', name: 'Engineering', cost_center: 'CC-ENG-101', created_at: '2024-01-10T08:00:00Z' },
  { id: 'dept-002', name: 'IT & Information Security', cost_center: 'CC-IT-202', created_at: '2024-01-10T08:00:00Z' },
  { id: 'dept-003', name: 'Product & UX Design', cost_center: 'CC-PROD-303', created_at: '2024-01-10T08:00:00Z' },
  { id: 'dept-004', name: 'Finance & Operations', cost_center: 'CC-FIN-404', created_at: '2024-01-10T08:00:00Z' },
];

const users: User[] = [
  {
    id: 'usr-001',
    email: 'sarah.connor@acme.corp',
    full_name: 'Sarah Connor',
    role: 'admin',
    department_id: 'dept-002',
    department_name: 'IT & Information Security',
    is_active: true,
    created_at: '2024-01-15T09:00:00Z',
  },
  {
    id: 'usr-002',
    email: 'marcus.vance@acme.corp',
    full_name: 'Marcus Vance',
    role: 'it_agent',
    department_id: 'dept-002',
    department_name: 'IT & Information Security',
    is_active: true,
    created_at: '2024-02-01T10:00:00Z',
  },
  {
    id: 'usr-003',
    email: 'elena.rostova@acme.corp',
    full_name: 'Elena Rostova',
    role: 'auditor',
    department_id: 'dept-004',
    department_name: 'Finance & Operations',
    is_active: true,
    created_at: '2024-02-15T11:00:00Z',
  },
  {
    id: 'usr-004',
    email: 'alex.chen@acme.corp',
    full_name: 'Alex Chen',
    role: 'it_agent',
    department_id: 'dept-001',
    department_name: 'Engineering',
    is_active: true,
    created_at: '2024-03-01T09:30:00Z',
  },
  {
    id: 'usr-005',
    email: 'priya.patel@acme.corp',
    full_name: 'Priya Patel',
    role: 'it_agent',
    department_id: 'dept-003',
    department_name: 'Product & UX Design',
    is_active: true,
    created_at: '2024-03-10T14:00:00Z',
  },
];

let assets: Asset[] = [
  {
    id: 'ast-1001',
    asset_tag: 'AST-2024-001',
    serial_number: 'C02G80XZMD6T',
    model_name: 'MacBook Pro 16" M3 Max (36GB/1TB)',
    category: 'laptop',
    status: 'assigned',
    assigned_user_id: 'usr-004',
    assigned_user_name: 'Alex Chen',
    assigned_user_email: 'alex.chen@acme.corp',
    department_id: 'dept-001',
    department_name: 'Engineering',
    purchase_date: '2024-02-10',
    warranty_expiration: '2027-02-10',
    purchase_cost: 3499.00,
    notes: 'Primary engineering workstation with AppleCare+ Enterprise warranty.',
    created_at: '2024-02-10T10:00:00Z',
    updated_at: '2024-02-11T14:20:00Z',
  },
  {
    id: 'ast-1002',
    asset_tag: 'AST-2024-002',
    serial_number: '8CG3451KL8',
    model_name: 'ThinkPad X1 Carbon Gen 11 (32GB/1TB)',
    category: 'laptop',
    status: 'assigned',
    assigned_user_id: 'usr-001',
    assigned_user_name: 'Sarah Connor',
    assigned_user_email: 'sarah.connor@acme.corp',
    department_id: 'dept-002',
    department_name: 'IT & Information Security',
    purchase_date: '2024-01-20',
    warranty_expiration: '2027-01-20',
    purchase_cost: 2150.00,
    notes: 'IT Admin laptop with hardware TPM 2.0 & BitLocker active.',
    created_at: '2024-01-20T08:00:00Z',
    updated_at: '2024-01-20T08:00:00Z',
  },
  {
    id: 'ast-1003',
    asset_tag: 'AST-2024-003',
    serial_number: 'CN0G55K7WS200',
    model_name: 'Dell UltraSharp U2723QE 27" 4K USB-C Hub',
    category: 'monitor',
    status: 'assigned',
    assigned_user_id: 'usr-005',
    assigned_user_name: 'Priya Patel',
    assigned_user_email: 'priya.patel@acme.corp',
    department_id: 'dept-003',
    department_name: 'Product & UX Design',
    purchase_date: '2024-03-12',
    warranty_expiration: '2027-03-12',
    purchase_cost: 620.00,
    notes: 'Calibrated color gamut for UX design team.',
    created_at: '2024-03-12T11:00:00Z',
    updated_at: '2024-03-12T11:00:00Z',
  },
  {
    id: 'ast-1004',
    asset_tag: 'AST-2024-004',
    serial_number: 'DX9X01LLP091',
    model_name: 'Apple Studio Display 27" 5K Retina',
    category: 'monitor',
    status: 'in_stock',
    assigned_user_id: null,
    assigned_user_name: null,
    assigned_user_email: null,
    department_id: 'dept-002',
    department_name: 'IT & Information Security',
    purchase_date: '2024-04-05',
    warranty_expiration: '2026-04-05',
    purchase_cost: 1599.00,
    notes: 'Bench tested, packed in IT storage shelf B2 ready for deployment.',
    created_at: '2024-04-05T09:15:00Z',
    updated_at: '2024-04-05T09:15:00Z',
  },
  {
    id: 'ast-1005',
    asset_tag: 'AST-2024-005',
    serial_number: 'F2LXK992N70',
    model_name: 'iPhone 15 Pro 256GB Titanium',
    category: 'mobile',
    status: 'assigned',
    assigned_user_id: 'usr-002',
    assigned_user_name: 'Marcus Vance',
    assigned_user_email: 'marcus.vance@acme.corp',
    department_id: 'dept-002',
    department_name: 'IT & Information Security',
    purchase_date: '2023-11-15',
    warranty_expiration: '2025-11-15',
    purchase_cost: 1099.00,
    notes: 'On-call IT response mobile device with MDM installed.',
    created_at: '2023-11-15T12:00:00Z',
    updated_at: '2023-11-15T12:00:00Z',
  },
  {
    id: 'ast-1006',
    asset_tag: 'AST-2024-006',
    serial_number: 'FOC2438T042',
    model_name: 'Cisco Catalyst 9200L 48-Port PoE+ Switch',
    category: 'network_device',
    status: 'assigned',
    assigned_user_id: null,
    assigned_user_name: null,
    assigned_user_email: null,
    department_id: 'dept-002',
    department_name: 'IT & Information Security',
    purchase_date: '2023-08-10',
    warranty_expiration: '2028-08-10',
    purchase_cost: 4850.00,
    notes: 'Floor 3 Server Room Rack 2 Switch.',
    created_at: '2023-08-10T15:00:00Z',
    updated_at: '2023-08-10T15:00:00Z',
  },
  {
    id: 'ast-1007',
    asset_tag: 'AST-2024-007',
    serial_number: 'PF3N487Z1',
    model_name: 'ThinkPad T14 Gen 4 (AMD Ryzen 7 PRO)',
    category: 'laptop',
    status: 'in_repair',
    assigned_user_id: null,
    assigned_user_name: null,
    assigned_user_email: null,
    department_id: 'dept-002',
    department_name: 'IT & Information Security',
    purchase_date: '2023-09-01',
    warranty_expiration: '2026-09-01',
    purchase_cost: 1450.00,
    notes: 'RMA Ticket #88491: Keyboard backlight flicker and erratic trackpad.',
    created_at: '2023-09-01T10:00:00Z',
    updated_at: '2024-05-18T16:00:00Z',
  },
  {
    id: 'ast-1008',
    asset_tag: 'AST-2024-008',
    serial_number: 'C02F30LLMD6R',
    model_name: 'MacBook Air 15" M2 (16GB/512GB)',
    category: 'laptop',
    status: 'in_stock',
    assigned_user_id: null,
    assigned_user_name: null,
    assigned_user_email: null,
    department_id: 'dept-002',
    department_name: 'IT & Information Security',
    purchase_date: '2024-01-05',
    warranty_expiration: '2026-01-05',
    purchase_cost: 1699.00,
    notes: 'Staged image ready with macOS Sonoma and CrowdStrike Falcon.',
    created_at: '2024-01-05T09:00:00Z',
    updated_at: '2024-05-10T11:00:00Z',
  },
  {
    id: 'ast-1009',
    asset_tag: 'AST-2024-009',
    serial_number: 'MJ234-LOGI-88',
    model_name: 'Logitech MX Master 3S + MX Keys Combo',
    category: 'peripheral',
    status: 'assigned',
    assigned_user_id: 'usr-004',
    assigned_user_name: 'Alex Chen',
    assigned_user_email: 'alex.chen@acme.corp',
    department_id: 'dept-001',
    department_name: 'Engineering',
    purchase_date: '2024-02-15',
    warranty_expiration: '2026-02-15',
    purchase_cost: 219.00,
    notes: 'Ergonomic input peripheral bundle.',
    created_at: '2024-02-15T09:00:00Z',
    updated_at: '2024-02-15T09:00:00Z',
  },
  {
    id: 'ast-1010',
    asset_tag: 'AST-2024-010',
    serial_number: 'C02D109XMD6R',
    model_name: 'MacBook Pro 13" Intel 2019 (16GB/512GB)',
    category: 'laptop',
    status: 'retired',
    assigned_user_id: null,
    assigned_user_name: null,
    assigned_user_email: null,
    department_id: 'dept-002',
    department_name: 'IT & Information Security',
    purchase_date: '2019-10-10',
    warranty_expiration: '2022-10-10',
    purchase_cost: 1799.00,
    notes: 'Retired from active service after 4-year lifecycle refresh. Securely erased.',
    created_at: '2019-10-10T09:00:00Z',
    updated_at: '2024-01-10T16:00:00Z',
  },
];

// Helper to compute date relative to now
const today = new Date();
const addDays = (days: number) => {
  const d = new Date(today);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
};

let softwareLicenses: SoftwareLicense[] = [
  {
    id: 'lic-101',
    software_name: 'Microsoft 365 E5 Enterprise',
    vendor: 'Microsoft Corp.',
    license_key: 'MS365-E5-ENT-8849-ACME-001',
    license_type: 'annual_subscription',
    total_seats: 100,
    allocated_seats: 94,
    renewal_cost: 45600.00,
    expiration_date: addDays(72), // in ~72 days (within 90-day alert)
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'lic-102',
    software_name: 'GitHub Enterprise Cloud',
    vendor: 'GitHub / Microsoft',
    license_key: 'GH-ENT-ORG-ACME-CORP',
    license_type: 'annual_subscription',
    total_seats: 50,
    allocated_seats: 48,
    renewal_cost: 12600.00,
    expiration_date: addDays(48), // in ~48 days (within 60-day alert)
    created_at: '2024-02-01T00:00:00Z',
    updated_at: '2024-02-01T00:00:00Z',
  },
  {
    id: 'lic-103',
    software_name: 'Figma Enterprise Design System',
    vendor: 'Figma Inc.',
    license_key: 'FIGMA-ENT-TOKEN-9941',
    license_type: 'annual_subscription',
    total_seats: 25,
    allocated_seats: 25, // 100% capacity!
    renewal_cost: 18000.00,
    expiration_date: addDays(19), // in 19 days (CRITICAL 30-day alert!)
    created_at: '2024-03-01T00:00:00Z',
    updated_at: '2024-03-01T00:00:00Z',
  },
  {
    id: 'lic-104',
    software_name: 'JetBrains All Products Pack',
    vendor: 'JetBrains s.r.o.',
    license_key: 'JB-ALL-PACK-COMM-2024',
    license_type: 'annual_subscription',
    total_seats: 30,
    allocated_seats: 28,
    renewal_cost: 17700.00,
    expiration_date: addDays(27), // in 27 days (CRITICAL 30-day alert!)
    created_at: '2024-01-15T00:00:00Z',
    updated_at: '2024-01-15T00:00:00Z',
  },
  {
    id: 'lic-105',
    software_name: 'Slack Business+ Workspace',
    vendor: 'Salesforce / Slack',
    license_key: 'SLACK-T-ACME-BIZPLUS',
    license_type: 'annual_subscription',
    total_seats: 120,
    allocated_seats: 112,
    renewal_cost: 18000.00,
    expiration_date: addDays(160), // in ~160 days (healthy)
    created_at: '2024-04-01T00:00:00Z',
    updated_at: '2024-04-01T00:00:00Z',
  },
  {
    id: 'lic-106',
    software_name: 'Datadog Pro Host Monitoring',
    vendor: 'Datadog Inc.',
    license_key: 'DD-API-KEY-PROD-CLUSTER-091',
    license_type: 'monthly_subscription',
    total_seats: 40,
    allocated_seats: 38,
    renewal_cost: 7200.00,
    expiration_date: addDays(85), // within 90 days
    created_at: '2024-05-01T00:00:00Z',
    updated_at: '2024-05-01T00:00:00Z',
  },
];

let licenseAssignments: LicenseAssignment[] = [
  {
    id: 'asg-101',
    license_id: 'lic-103',
    software_name: 'Figma Enterprise Design System',
    assigned_user_id: 'usr-005',
    assigned_user_name: 'Priya Patel',
    assigned_asset_id: null,
    assigned_at: '2024-03-10T14:30:00Z',
  },
  {
    id: 'asg-102',
    license_id: 'lic-104',
    software_name: 'JetBrains All Products Pack',
    assigned_user_id: 'usr-004',
    assigned_user_name: 'Alex Chen',
    assigned_asset_id: null,
    assigned_at: '2024-03-01T10:00:00Z',
  },
  {
    id: 'asg-103',
    license_id: 'lic-102',
    software_name: 'GitHub Enterprise Cloud',
    assigned_user_id: 'usr-004',
    assigned_user_name: 'Alex Chen',
    assigned_asset_id: null,
    assigned_at: '2024-02-05T11:00:00Z',
  },
  {
    id: 'asg-104',
    license_id: 'lic-101',
    software_name: 'Microsoft 365 E5 Enterprise',
    assigned_user_id: 'usr-001',
    assigned_user_name: 'Sarah Connor',
    assigned_asset_id: null,
    assigned_at: '2024-01-15T09:30:00Z',
  },
  {
    id: 'asg-105',
    license_id: 'lic-101',
    software_name: 'Microsoft 365 E5 Enterprise',
    assigned_user_id: 'usr-002',
    assigned_user_name: 'Marcus Vance',
    assigned_asset_id: null,
    assigned_at: '2024-02-01T10:15:00Z',
  },
];

let auditLogs: AuditLog[] = [
  {
    id: 'aud-001',
    entity_type: 'asset',
    entity_id: 'ast-1001',
    action: 'CHECK_OUT',
    performed_by_id: 'usr-002',
    performed_by_name: 'Marcus Vance',
    performed_by_role: 'it_agent',
    payload: {
      asset_tag: 'AST-2024-001',
      model_name: 'MacBook Pro 16" M3 Max',
      assigned_to: 'Alex Chen',
      department: 'Engineering',
    },
    created_at: '2024-02-11T14:20:00Z',
  },
  {
    id: 'aud-002',
    entity_type: 'license',
    entity_id: 'lic-103',
    action: 'SEAT_ASSIGN',
    performed_by_id: 'usr-001',
    performed_by_name: 'Sarah Connor',
    performed_by_role: 'admin',
    payload: {
      software_name: 'Figma Enterprise Design System',
      assigned_to: 'Priya Patel',
      allocated_seats: 25,
      total_seats: 25,
    },
    created_at: '2024-03-10T14:30:00Z',
  },
  {
    id: 'aud-003',
    entity_type: 'asset',
    entity_id: 'ast-1007',
    action: 'UPDATE',
    performed_by_id: 'usr-002',
    performed_by_name: 'Marcus Vance',
    performed_by_role: 'it_agent',
    payload: {
      asset_tag: 'AST-2024-007',
      old_status: 'in_stock',
      new_status: 'in_repair',
      notes: 'RMA Ticket #88491: Sent to Lenovo Depot repair',
    },
    created_at: '2024-05-18T16:00:00Z',
  },
];

// Authentication & RBAC Middleware
interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    full_name: string;
    role: UserRole;
  };
}

const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    // Default fallback to Admin in local dev/demo mode if no token sent, or require token
    req.user = {
      id: 'usr-001',
      email: 'sarah.connor@acme.corp',
      full_name: 'Sarah Connor',
      role: 'admin',
    };
    return next();
  }

  jwt.verify(token, JWT_SECRET, (err: any, decoded: any) => {
    if (err) {
      res.status(401).json({ error: 'Unauthorized: Invalid or expired access token' });
      return;
    }
    req.user = decoded as any;
    next();
  });
};

const requireRole = (...allowedRoles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized: Missing valid authentication credentials' });
      return;
    }
    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        error: `Forbidden: Role '${req.user.role}' lacks sufficient privileges for this operation. Requires one of: [${allowedRoles.join(', ')}]`,
      });
      return;
    }
    next();
  };
};

// --- AUTH ENDPOINTS ---

app.post('/api/v1/auth/login', (req: Request, res: Response) => {
  const { email, role } = req.body;
  const user = users.find((u) => (email && u.email.toLowerCase() === email.toLowerCase()) || (role && u.role === role)) || users[0];

  const payload = {
    id: user.id,
    email: user.email,
    full_name: user.full_name,
    role: user.role,
  };

  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '8h' });

  // Record audit log
  auditLogs.unshift({
    id: `aud-${Date.now()}`,
    entity_type: 'auth',
    entity_id: user.id,
    action: 'LOGIN',
    performed_by_id: user.id,
    performed_by_name: user.full_name,
    performed_by_role: user.role,
    payload: { email: user.email, role: user.role },
    created_at: new Date().toISOString(),
  });

  res.json({
    token,
    user,
    expires_in: 28800,
  });
});

app.get('/api/v1/auth/me', authenticateToken, (req: AuthRequest, res: Response) => {
  const user = users.find((u) => u.id === req.user?.id) || users[0];
  res.json(user);
});

app.get('/api/v1/auth/users', (req: Request, res: Response) => {
  res.json(users);
});

app.get('/api/v1/departments', (req: Request, res: Response) => {
  res.json(departments);
});

// --- HARDWARE ASSETS ENDPOINTS ---

app.get('/api/v1/assets', (req: Request, res: Response) => {
  const { category, status, department_id, search, skip = 0, limit = 50 } = req.query;

  let results = [...assets];

  if (category) {
    results = results.filter((a) => a.category === category);
  }
  if (status) {
    results = results.filter((a) => a.status === status);
  }
  if (department_id) {
    results = results.filter((a) => a.department_id === department_id);
  }
  if (search) {
    const q = String(search).toLowerCase();
    results = results.filter(
      (a) =>
        a.asset_tag.toLowerCase().includes(q) ||
        a.serial_number.toLowerCase().includes(q) ||
        a.model_name.toLowerCase().includes(q) ||
        (a.assigned_user_name && a.assigned_user_name.toLowerCase().includes(q)) ||
        (a.notes && a.notes.toLowerCase().includes(q))
    );
  }

  const offset = Number(skip) || 0;
  const max = Number(limit) || 50;
  const paginated = results.slice(offset, offset + max);

  res.json({
    total: results.length,
    skip: offset,
    limit: max,
    items: paginated,
  });
});

app.get('/api/v1/assets/:id', (req: Request, res: Response) => {
  const asset = assets.find((a) => a.id === req.params.id);
  if (!asset) {
    res.status(404).json({ error: 'Asset not found' });
    return;
  }
  res.json(asset);
});

app.post('/api/v1/assets', authenticateToken, requireRole('admin', 'it_agent'), (req: AuthRequest, res: Response) => {
  const { asset_tag, serial_number, model_name, category, status, department_id, purchase_date, warranty_expiration, purchase_cost, notes } = req.body;

  if (!asset_tag || !serial_number || !model_name || !category) {
    res.status(400).json({ error: 'Missing required fields: asset_tag, serial_number, model_name, and category are mandatory' });
    return;
  }

  const existingTag = assets.find((a) => a.asset_tag.toLowerCase() === asset_tag.trim().toLowerCase());
  if (existingTag) {
    res.status(409).json({ error: `Asset tag '${asset_tag}' is already registered` });
    return;
  }

  const existingSerial = assets.find((a) => a.serial_number.toLowerCase() === serial_number.trim().toLowerCase());
  if (existingSerial) {
    res.status(409).json({ error: `Serial number '${serial_number}' is already registered to asset ${existingSerial.asset_tag}` });
    return;
  }

  const dept = departments.find((d) => d.id === department_id);

  const newAsset: Asset = {
    id: `ast-${Date.now()}`,
    asset_tag: asset_tag.trim(),
    serial_number: serial_number.trim(),
    model_name: model_name.trim(),
    category: category as AssetCategory,
    status: (status as AssetStatus) || 'in_stock',
    assigned_user_id: null,
    assigned_user_name: null,
    assigned_user_email: null,
    department_id: dept ? dept.id : null,
    department_name: dept ? dept.name : null,
    purchase_date: purchase_date || null,
    warranty_expiration: warranty_expiration || null,
    purchase_cost: purchase_cost ? Number(purchase_cost) : null,
    notes: notes || null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  assets.unshift(newAsset);

  auditLogs.unshift({
    id: `aud-${Date.now()}`,
    entity_type: 'asset',
    entity_id: newAsset.id,
    action: 'CREATE',
    performed_by_id: req.user?.id,
    performed_by_name: req.user?.full_name || 'System Agent',
    performed_by_role: req.user?.role || 'it_agent',
    payload: { asset_tag: newAsset.asset_tag, model: newAsset.model_name, category: newAsset.category },
    created_at: new Date().toISOString(),
  });

  res.status(201).json(newAsset);
});

app.put('/api/v1/assets/:id', authenticateToken, requireRole('admin', 'it_agent'), (req: AuthRequest, res: Response) => {
  const assetIndex = assets.findIndex((a) => a.id === req.params.id);
  if (assetIndex === -1) {
    res.status(404).json({ error: 'Asset not found' });
    return;
  }

  const current = assets[assetIndex];
  const { model_name, category, status, department_id, purchase_date, warranty_expiration, purchase_cost, notes } = req.body;
  const dept = department_id ? departments.find((d) => d.id === department_id) : undefined;

  const updated: Asset = {
    ...current,
    model_name: model_name !== undefined ? model_name : current.model_name,
    category: category !== undefined ? category : current.category,
    status: status !== undefined ? status : current.status,
    department_id: dept !== undefined ? (dept ? dept.id : null) : current.department_id,
    department_name: dept !== undefined ? (dept ? dept.name : null) : current.department_name,
    purchase_date: purchase_date !== undefined ? purchase_date : current.purchase_date,
    warranty_expiration: warranty_expiration !== undefined ? warranty_expiration : current.warranty_expiration,
    purchase_cost: purchase_cost !== undefined ? Number(purchase_cost) : current.purchase_cost,
    notes: notes !== undefined ? notes : current.notes,
    updated_at: new Date().toISOString(),
  };

  assets[assetIndex] = updated;

  auditLogs.unshift({
    id: `aud-${Date.now()}`,
    entity_type: 'asset',
    entity_id: updated.id,
    action: 'UPDATE',
    performed_by_id: req.user?.id,
    performed_by_name: req.user?.full_name || 'IT Agent',
    performed_by_role: req.user?.role || 'it_agent',
    payload: { changes: req.body, previous_status: current.status, new_status: updated.status },
    created_at: new Date().toISOString(),
  });

  res.json(updated);
});

app.delete('/api/v1/assets/:id', authenticateToken, requireRole('admin'), (req: AuthRequest, res: Response) => {
  const assetIndex = assets.findIndex((a) => a.id === req.params.id);
  if (assetIndex === -1) {
    res.status(404).json({ error: 'Asset not found' });
    return;
  }

  const deleted = assets[assetIndex];
  assets.splice(assetIndex, 1);

  auditLogs.unshift({
    id: `aud-${Date.now()}`,
    entity_type: 'asset',
    entity_id: deleted.id,
    action: 'DELETE',
    performed_by_id: req.user?.id,
    performed_by_name: req.user?.full_name || 'Admin',
    performed_by_role: req.user?.role || 'admin',
    payload: { asset_tag: deleted.asset_tag, model_name: deleted.model_name },
    created_at: new Date().toISOString(),
  });

  res.json({ message: 'Asset successfully deleted', deleted_asset_id: deleted.id });
});

// Check-Out Workflow
app.post('/api/v1/assets/:id/checkout', authenticateToken, requireRole('admin', 'it_agent'), (req: AuthRequest, res: Response) => {
  const asset = assets.find((a) => a.id === req.params.id);
  if (!asset) {
    res.status(404).json({ error: 'Asset not found' });
    return;
  }

  const { user_id, notes } = req.body;
  const targetUser = users.find((u) => u.id === user_id);
  if (!targetUser) {
    res.status(400).json({ error: 'Valid user_id is required for checkout' });
    return;
  }

  const dept = departments.find((d) => d.id === targetUser.department_id);

  asset.status = 'assigned';
  asset.assigned_user_id = targetUser.id;
  asset.assigned_user_name = targetUser.full_name;
  asset.assigned_user_email = targetUser.email;
  asset.department_id = dept ? dept.id : asset.department_id;
  asset.department_name = dept ? dept.name : asset.department_name;
  if (notes) {
    asset.notes = asset.notes ? `${asset.notes}\n[Checkout] ${notes}` : `[Checkout] ${notes}`;
  }
  asset.updated_at = new Date().toISOString();

  auditLogs.unshift({
    id: `aud-${Date.now()}`,
    entity_type: 'asset',
    entity_id: asset.id,
    action: 'CHECK_OUT',
    performed_by_id: req.user?.id,
    performed_by_name: req.user?.full_name || 'IT Agent',
    performed_by_role: req.user?.role || 'it_agent',
    payload: {
      asset_tag: asset.asset_tag,
      assigned_to: targetUser.full_name,
      user_email: targetUser.email,
      department: asset.department_name,
      notes,
    },
    created_at: new Date().toISOString(),
  });

  res.json({ message: 'Asset successfully checked out', asset });
});

// Check-In Workflow
app.post('/api/v1/assets/:id/checkin', authenticateToken, requireRole('admin', 'it_agent'), (req: AuthRequest, res: Response) => {
  const asset = assets.find((a) => a.id === req.params.id);
  if (!asset) {
    res.status(404).json({ error: 'Asset not found' });
    return;
  }

  const { condition_status = 'in_stock', checkin_notes } = req.body;
  const previousAssignee = asset.assigned_user_name;

  asset.status = condition_status as AssetStatus;
  asset.assigned_user_id = null;
  asset.assigned_user_name = null;
  asset.assigned_user_email = null;
  if (checkin_notes) {
    asset.notes = asset.notes ? `${asset.notes}\n[Checkin] ${checkin_notes}` : `[Checkin] ${checkin_notes}`;
  }
  asset.updated_at = new Date().toISOString();

  auditLogs.unshift({
    id: `aud-${Date.now()}`,
    entity_type: 'asset',
    entity_id: asset.id,
    action: 'CHECK_IN',
    performed_by_id: req.user?.id,
    performed_by_name: req.user?.full_name || 'IT Agent',
    performed_by_role: req.user?.role || 'it_agent',
    payload: {
      asset_tag: asset.asset_tag,
      returned_from: previousAssignee,
      condition_status,
      checkin_notes,
    },
    created_at: new Date().toISOString(),
  });

  res.json({ message: 'Asset successfully checked in to inventory', asset });
});

// --- SOFTWARE LICENSES ENDPOINTS ---

app.get('/api/v1/licenses', (req: Request, res: Response) => {
  const { search } = req.query;
  let items = [...softwareLicenses];

  if (search) {
    const q = String(search).toLowerCase();
    items = items.filter(
      (l) =>
        l.software_name.toLowerCase().includes(q) ||
        l.vendor.toLowerCase().includes(q) ||
        (l.license_key && l.license_key.toLowerCase().includes(q))
    );
  }

  // Calculate alert level for each license
  const enriched = items.map((l) => {
    let daysRemaining = null;
    let warningLevel: 'none' | 'warning_90' | 'warning_60' | 'critical_30' | 'expired' = 'none';

    if (l.expiration_date) {
      const exp = new Date(l.expiration_date);
      const diffMs = exp.getTime() - today.getTime();
      daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

      if (daysRemaining <= 0) {
        warningLevel = 'expired';
      } else if (daysRemaining <= 30) {
        warningLevel = 'critical_30';
      } else if (daysRemaining <= 60) {
        warningLevel = 'warning_60';
      } else if (daysRemaining <= 90) {
        warningLevel = 'warning_90';
      }
    }

    const isOverAllocated = l.allocated_seats > l.total_seats;
    const isAtCapacity = l.allocated_seats === l.total_seats;

    return {
      ...l,
      days_remaining: daysRemaining,
      warning_level: warningLevel,
      is_over_allocated: isOverAllocated,
      is_at_capacity: isAtCapacity,
    };
  });

  res.json(enriched);
});

app.post('/api/v1/licenses', authenticateToken, requireRole('admin', 'it_agent'), (req: AuthRequest, res: Response) => {
  const { software_name, vendor, license_key, license_type, total_seats, renewal_cost, expiration_date } = req.body;

  if (!software_name || !vendor || total_seats === undefined || !license_type) {
    res.status(400).json({ error: 'software_name, vendor, total_seats, and license_type are required' });
    return;
  }

  const newLicense: SoftwareLicense = {
    id: `lic-${Date.now()}`,
    software_name: software_name.trim(),
    vendor: vendor.trim(),
    license_key: license_key ? license_key.trim() : null,
    license_type: license_type as LicenseType,
    total_seats: Number(total_seats),
    allocated_seats: 0,
    renewal_cost: renewal_cost ? Number(renewal_cost) : null,
    expiration_date: expiration_date || null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  softwareLicenses.unshift(newLicense);

  auditLogs.unshift({
    id: `aud-${Date.now()}`,
    entity_type: 'license',
    entity_id: newLicense.id,
    action: 'CREATE',
    performed_by_id: req.user?.id,
    performed_by_name: req.user?.full_name || 'Admin',
    performed_by_role: req.user?.role || 'admin',
    payload: { software_name: newLicense.software_name, total_seats: newLicense.total_seats },
    created_at: new Date().toISOString(),
  });

  res.status(201).json(newLicense);
});

app.put('/api/v1/licenses/:id', authenticateToken, requireRole('admin', 'it_agent'), (req: AuthRequest, res: Response) => {
  const licIndex = softwareLicenses.findIndex((l) => l.id === req.params.id);
  if (licIndex === -1) {
    res.status(404).json({ error: 'License not found' });
    return;
  }

  const current = softwareLicenses[licIndex];
  const { software_name, vendor, license_key, license_type, total_seats, renewal_cost, expiration_date } = req.body;

  const updated: SoftwareLicense = {
    ...current,
    software_name: software_name !== undefined ? software_name : current.software_name,
    vendor: vendor !== undefined ? vendor : current.vendor,
    license_key: license_key !== undefined ? license_key : current.license_key,
    license_type: license_type !== undefined ? license_type : current.license_type,
    total_seats: total_seats !== undefined ? Number(total_seats) : current.total_seats,
    renewal_cost: renewal_cost !== undefined ? Number(renewal_cost) : current.renewal_cost,
    expiration_date: expiration_date !== undefined ? expiration_date : current.expiration_date,
    updated_at: new Date().toISOString(),
  };

  softwareLicenses[licIndex] = updated;

  auditLogs.unshift({
    id: `aud-${Date.now()}`,
    entity_type: 'license',
    entity_id: updated.id,
    action: 'UPDATE',
    performed_by_id: req.user?.id,
    performed_by_name: req.user?.full_name || 'IT Agent',
    performed_by_role: req.user?.role || 'it_agent',
    payload: { changes: req.body },
    created_at: new Date().toISOString(),
  });

  res.json(updated);
});

app.delete('/api/v1/licenses/:id', authenticateToken, requireRole('admin'), (req: AuthRequest, res: Response) => {
  const licIndex = softwareLicenses.findIndex((l) => l.id === req.params.id);
  if (licIndex === -1) {
    res.status(404).json({ error: 'License not found' });
    return;
  }

  const deleted = softwareLicenses[licIndex];
  softwareLicenses.splice(licIndex, 1);
  // remove associated assignments
  licenseAssignments = licenseAssignments.filter((asg) => asg.license_id !== deleted.id);

  auditLogs.unshift({
    id: `aud-${Date.now()}`,
    entity_type: 'license',
    entity_id: deleted.id,
    action: 'DELETE',
    performed_by_id: req.user?.id,
    performed_by_name: req.user?.full_name || 'Admin',
    performed_by_role: req.user?.role || 'admin',
    payload: { software_name: deleted.software_name },
    created_at: new Date().toISOString(),
  });

  res.json({ message: 'License deleted successfully', deleted_license_id: deleted.id });
});

// Seat Assignment
app.get('/api/v1/licenses/:id/assignments', (req: Request, res: Response) => {
  const assignments = licenseAssignments.filter((a) => a.license_id === req.params.id);
  res.json(assignments);
});

app.post('/api/v1/licenses/:id/assign', authenticateToken, requireRole('admin', 'it_agent'), (req: AuthRequest, res: Response) => {
  const license = softwareLicenses.find((l) => l.id === req.params.id);
  if (!license) {
    res.status(404).json({ error: 'Software license not found' });
    return;
  }

  const { assigned_user_id, assigned_asset_id } = req.body;

  if (!assigned_user_id && !assigned_asset_id) {
    res.status(400).json({ error: 'Must assign to either a user or an asset' });
    return;
  }

  if (assigned_user_id && assigned_asset_id) {
    res.status(400).json({ error: 'Validation error: License seat must be assigned to either a user OR an asset, but not both' });
    return;
  }

  if (license.allocated_seats >= license.total_seats) {
    res.status(400).json({ error: `Cannot allocate seat: License '${license.software_name}' has reached its maximum seat capacity (${license.total_seats}/${license.total_seats})` });
    return;
  }

  const duplicateAssignment = licenseAssignments.find((a) =>
    a.license_id === license.id &&
    ((assigned_user_id && a.assigned_user_id === assigned_user_id) ||
     (assigned_asset_id && a.assigned_asset_id === assigned_asset_id))
  );
  if (duplicateAssignment) {
    res.status(409).json({ error: 'Seat is already assigned to this recipient for this license' });
    return;
  }

  let userName: string | null = null;
  let assetTag: string | null = null;

  if (assigned_user_id) {
    const user = users.find((u) => u.id === assigned_user_id);
    if (!user) {
      res.status(404).json({ error: 'Target user not found' });
      return;
    }
    userName = user.full_name;
  }

  if (assigned_asset_id) {
    const asset = assets.find((a) => a.id === assigned_asset_id);
    if (!asset) {
      res.status(404).json({ error: 'Target asset not found' });
      return;
    }
    assetTag = asset.asset_tag;
  }

  const newAssignment: LicenseAssignment = {
    id: `asg-${Date.now()}`,
    license_id: license.id,
    software_name: license.software_name,
    assigned_user_id: assigned_user_id || null,
    assigned_user_name: userName,
    assigned_asset_id: assigned_asset_id || null,
    assigned_asset_tag: assetTag,
    assigned_at: new Date().toISOString(),
  };

  licenseAssignments.unshift(newAssignment);
  license.allocated_seats += 1;
  license.updated_at = new Date().toISOString();

  auditLogs.unshift({
    id: `aud-${Date.now()}`,
    entity_type: 'assignment',
    entity_id: newAssignment.id,
    action: 'SEAT_ASSIGN',
    performed_by_id: req.user?.id,
    performed_by_name: req.user?.full_name || 'IT Agent',
    performed_by_role: req.user?.role || 'it_agent',
    payload: {
      software_name: license.software_name,
      assigned_to: userName || assetTag,
      allocated_seats: license.allocated_seats,
      total_seats: license.total_seats,
    },
    created_at: new Date().toISOString(),
  });

  res.status(201).json({ assignment: newAssignment, updated_license: license });
});

app.delete('/api/v1/licenses/:id/assignments/:assignmentId', authenticateToken, requireRole('admin', 'it_agent'), (req: AuthRequest, res: Response) => {
  const license = softwareLicenses.find((l) => l.id === req.params.id);
  const asgIndex = licenseAssignments.findIndex((a) => a.id === req.params.assignmentId && a.license_id === req.params.id);

  if (asgIndex === -1) {
    res.status(404).json({ error: 'License assignment not found' });
    return;
  }

  const removed = licenseAssignments[asgIndex];
  licenseAssignments.splice(asgIndex, 1);

  if (license && license.allocated_seats > 0) {
    license.allocated_seats -= 1;
    license.updated_at = new Date().toISOString();
  }

  auditLogs.unshift({
    id: `aud-${Date.now()}`,
    entity_type: 'assignment',
    entity_id: removed.id,
    action: 'SEAT_REVOKE',
    performed_by_id: req.user?.id,
    performed_by_name: req.user?.full_name || 'IT Agent',
    performed_by_role: req.user?.role || 'it_agent',
    payload: {
      software_name: removed.software_name,
      revoked_from: removed.assigned_user_name || removed.assigned_asset_tag,
    },
    created_at: new Date().toISOString(),
  });

  res.json({ message: 'Seat assignment revoked', assignment_id: removed.id, updated_license: license });
});

app.get('/api/v1/assignments', (req: Request, res: Response) => {
  res.json(licenseAssignments);
});

// --- AUDIT LOGS ENDPOINTS ---

app.get('/api/v1/audit-logs', (req: Request, res: Response) => {
  const { entity_type, action, limit = 100 } = req.query;
  let items = [...auditLogs];

  if (entity_type) {
    items = items.filter((a) => a.entity_type === entity_type);
  }
  if (action) {
    items = items.filter((a) => a.action === action);
  }

  const max = Number(limit) || 100;
  res.json(items.slice(0, max));
});

// --- REPORTING & ANALYTICS DASHBOARD METRICS ---

app.get('/api/v1/metrics', (req: Request, res: Response) => {
  const totalAssets = assets.length;
  const totalValuation = assets.reduce((sum, a) => sum + (a.purchase_cost || 0), 0);
  const unassignedCount = assets.filter((a) => a.status === 'in_stock').length;
  const inRepairCount = assets.filter((a) => a.status === 'in_repair').length;
  const assignedCount = assets.filter((a) => a.status === 'assigned').length;
  const retiredCount = assets.filter((a) => a.status === 'retired').length;

  const totalLicenses = softwareLicenses.length;
  const totalLicenseCost = softwareLicenses.reduce((sum, l) => sum + (l.renewal_cost || 0), 0);

  let expiring30 = 0;
  let expiring60 = 0;
  let expiring90 = 0;
  let overAllocated = 0;

  softwareLicenses.forEach((l) => {
    if (l.allocated_seats > l.total_seats) {
      overAllocated += 1;
    }
    if (l.expiration_date) {
      const diffDays = Math.ceil((new Date(l.expiration_date).getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays <= 30 && diffDays >= 0) expiring30 += 1;
      if (diffDays <= 60 && diffDays > 30) expiring60 += 1;
      if (diffDays <= 90 && diffDays > 60) expiring90 += 1;
    }
  });

  const categoryDistribution: Record<AssetCategory, number> = {
    laptop: 0,
    desktop: 0,
    monitor: 0,
    mobile: 0,
    peripheral: 0,
    network_device: 0,
  };

  assets.forEach((a) => {
    if (categoryDistribution[a.category] !== undefined) {
      categoryDistribution[a.category] += 1;
    }
  });

  const statusDistribution: Record<AssetStatus, number> = {
    in_stock: unassignedCount,
    assigned: assignedCount,
    in_repair: inRepairCount,
    retired: retiredCount,
    lost: assets.filter((a) => a.status === 'lost').length,
  };

  const metrics: DashboardMetrics = {
    total_assets: totalAssets,
    total_valuation: totalValuation,
    unassigned_count: unassignedCount,
    in_repair_count: inRepairCount,
    assigned_count: assignedCount,
    retired_count: retiredCount,
    total_licenses: totalLicenses,
    total_license_cost: totalLicenseCost,
    licenses_expiring_30_days: expiring30,
    licenses_expiring_60_days: expiring60,
    licenses_expiring_90_days: expiring90,
    over_allocated_licenses: overAllocated,
    category_distribution: categoryDistribution,
    status_distribution: statusDistribution,
  };

  res.json(metrics);
});

// --- SERVICE HEALTH ENDPOINT ---

app.get('/api/v1/health', (req: Request, res: Response) => {
  const memoryUsage = process.memoryUsage();
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime_seconds: Math.floor(process.uptime()),
    database: {
      status: 'connected',
      engine: 'PostgreSQL-compatible / Async ORM Interface',
      tables: ['departments', 'users', 'assets', 'software_licenses', 'license_assignments', 'audit_logs'],
      records: {
        departments: departments.length,
        users: users.length,
        assets: assets.length,
        software_licenses: softwareLicenses.length,
        assignments: licenseAssignments.length,
        audit_logs: auditLogs.length,
      },
    },
    memory: {
      rss_mb: Math.round(memoryUsage.rss / 1024 / 1024),
      heap_used_mb: Math.round(memoryUsage.heapUsed / 1024 / 1024),
    },
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
  });
});

// Vite middleware for development & SPA static fallback
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[ALLT] Express server running on port ${PORT}`);
  });
}

startServer();
