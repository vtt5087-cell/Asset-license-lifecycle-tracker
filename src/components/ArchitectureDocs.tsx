import React, { useState } from 'react';
import {
  Database,
  FileCode2,
  Server,
  Box,
  Layers,
  GitBranch,
  ShieldCheck,
  Check,
  Copy,
  Terminal,
  ExternalLink,
} from 'lucide-react';

export const ArchitectureDocs: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<
    'ddl' | 'api' | 'docker_k8s' | 'cicd' | 'rbac'
  >('ddl');
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(key);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const postgresDDL = `-- =============================================================================
-- ASSET & LICENSE LIFECYCLE TRACKER: PRODUCTION POSTGRESQL DDL SCHEMA
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. ENUMS
CREATE TYPE user_role AS ENUM ('admin', 'it_agent', 'auditor');
CREATE TYPE asset_status AS ENUM ('in_stock', 'assigned', 'in_repair', 'retired', 'lost');
CREATE TYPE asset_category AS ENUM ('laptop', 'desktop', 'monitor', 'mobile', 'peripheral', 'network_device');
CREATE TYPE license_type AS ENUM ('perpetual', 'annual_subscription', 'monthly_subscription', 'freemium');

-- 2. DEPARTMENTS & USERS
CREATE TABLE departments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    cost_center VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL UNIQUE,
    full_name VARCHAR(150) NOT NULL,
    role user_role NOT NULL DEFAULT 'it_agent',
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3. HARDWARE ASSETS
CREATE TABLE assets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    asset_tag VARCHAR(50) NOT NULL UNIQUE,
    serial_number VARCHAR(100) NOT NULL UNIQUE,
    model_name VARCHAR(150) NOT NULL,
    category asset_category NOT NULL,
    status asset_status NOT NULL DEFAULT 'in_stock',
    assigned_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    purchase_date DATE,
    warranty_expiration DATE,
    purchase_cost NUMERIC(10, 2),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_assets_status ON assets(status);
CREATE INDEX idx_assets_category ON assets(category);
CREATE INDEX idx_assets_assigned_user ON assets(assigned_user_id);
CREATE INDEX idx_assets_asset_tag ON assets(asset_tag);

-- 4. SOFTWARE LICENSES & SEAT ASSIGNMENTS
CREATE TABLE software_licenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    software_name VARCHAR(150) NOT NULL,
    vendor VARCHAR(150) NOT NULL,
    license_key VARCHAR(255),
    license_type license_type NOT NULL,
    total_seats INTEGER NOT NULL CHECK (total_seats >= 0),
    allocated_seats INTEGER NOT NULL DEFAULT 0 CHECK (allocated_seats <= total_seats),
    renewal_cost NUMERIC(10, 2),
    expiration_date DATE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_licenses_expiration ON software_licenses(expiration_date);

CREATE TABLE license_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    license_id UUID NOT NULL REFERENCES software_licenses(id) ON DELETE CASCADE,
    assigned_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    assigned_asset_id UUID REFERENCES assets(id) ON DELETE CASCADE,
    assigned_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_assignment_target CHECK (
        (assigned_user_id IS NOT NULL AND assigned_asset_id IS NULL) OR
        (assigned_user_id IS NULL AND assigned_asset_id IS NOT NULL)
    )
);

-- 5. AUDIT LOGGING
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,
    action VARCHAR(50) NOT NULL,
    performed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    payload JSONB,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_entity ON audit_logs(entity_type, entity_id);

-- 6. AUTOMATION TRIGGERS FOR REAL-TIME SEAT SYNC
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_assets_timestamp
    BEFORE UPDATE ON assets
    FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER trg_update_licenses_timestamp
    BEFORE UPDATE ON software_licenses
    FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE OR REPLACE FUNCTION sync_license_seat_count()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        UPDATE software_licenses 
        SET allocated_seats = allocated_seats + 1 
        WHERE id = NEW.license_id;
    ELSIF (TG_OP = 'DELETE') THEN
        UPDATE software_licenses 
        SET allocated_seats = allocated_seats - 1 
        WHERE id = OLD.license_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_sync_license_seats
    AFTER INSERT OR DELETE ON license_assignments
    FOR EACH ROW EXECUTE FUNCTION sync_license_seat_count();`;

  const dockerK8sGuide = `# =============================================================================
# 1. PRODUCTION MULTI-STAGE DOCKERFILE
# =============================================================================

# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Runtime stage
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

COPY package*.json ./
RUN npm ci --only=production
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server.ts ./server.ts

EXPOSE 3000
USER node
CMD ["npm", "start"]

# =============================================================================
# 2. DOCKER COMPOSE FOR LOCAL OR ON-PREMISE PRODUCTION
# =============================================================================
version: '3.8'

services:
  db:
    image: postgres:16-alpine
    container_name: asset_tracker_db
    restart: always
    environment:
      POSTGRES_USER: \${DB_USER:-postgres}
      POSTGRES_PASSWORD: \${DB_PASSWORD:-postgres_secure_pass_2025}
      POSTGRES_DB: \${DB_NAME:-asset_tracker}
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  api:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: asset_tracker_api
    restart: always
    depends_on:
      db:
        condition: service_healthy
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgresql://postgres:postgres_secure_pass_2025@db:5432/asset_tracker
      JWT_SECRET: \${JWT_SECRET:-enterprise_super_secret_jwt_key_2025}
      PORT: 3000

volumes:
  postgres_data:

# =============================================================================
# 3. KUBERNETES MANIFESTS (k8s/deployment.yaml)
# =============================================================================
apiVersion: apps/v1
kind: Deployment
metadata:
  name: asset-tracker-deployment
  namespace: it-operations
  labels:
    app: asset-tracker
spec:
  replicas: 3
  selector:
    matchLabels:
      app: asset-tracker
  template:
    metadata:
      labels:
        app: asset-tracker
    spec:
      containers:
        - name: app
          image: ghcr.io/acme-corp/asset-license-tracker:latest
          imagePullPolicy: IfNotPresent
          ports:
            - containerPort: 3000
          env:
            - name: DATABASE_URL
              valueFrom:
                secretKeyRef:
                  name: asset-tracker-secrets
                  key: database-url
            - name: JWT_SECRET
              valueFrom:
                secretKeyRef:
                  name: asset-tracker-secrets
                  key: jwt-secret
          resources:
            requests:
              cpu: "250m"
              memory: "512Mi"
            limits:
              cpu: "1000m"
              memory: "1Gi"
          readinessProbe:
            httpGet:
              path: /api/v1/health
              port: 3000
            initialDelaySeconds: 5
            periodSeconds: 10
          livenessProbe:
            httpGet:
              path: /api/v1/health
              port: 3000
            initialDelaySeconds: 15
            periodSeconds: 20
---
apiVersion: v1
kind: Service
metadata:
  name: asset-tracker-service
  namespace: it-operations
spec:
  type: ClusterIP
  selector:
    app: asset-tracker
  ports:
    - protocol: TCP
      port: 80
      targetPort: 3000
---
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: asset-tracker-ingress
  namespace: it-operations
  annotations:
    kubernetes.io/ingress.class: nginx
    cert-manager.io/cluster-issuer: letsencrypt-prod
spec:
  tls:
    - hosts:
        - it-assets.acme.corp
      secretName: asset-tracker-tls
  rules:
    - host: it-assets.acme.corp
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: asset-tracker-service
                port:
                  number: 80`;

  const cicdPipeline = `# .github/workflows/deploy.yml
name: Build, Test & Deploy Asset & License Lifecycle Tracker

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: \${{ github.repository }}

jobs:
  test-and-lint:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Source Code
        uses: actions/checkout@v4

      - name: Setup Node.js 20
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Install Dependencies
        run: npm ci

      - name: Lint Codebase & Type Check
        run: npm run lint

      - name: Build Application Bundle
        run: npm run build

  build-and-push:
    needs: test-and-lint
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write
    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Log in to GitHub Container Registry (GHCR)
        uses: docker/login-action@v3
        with:
          registry: \${{ env.REGISTRY }}
          username: \${{ github.actor }}
          password: \${{ secrets.GITHUB_TOKEN }}

      - name: Extract Docker Metadata
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: \${{ env.REGISTRY }}/\${{ env.IMAGE_NAME }}
          tags: |
            type=sha,format=long
            type=raw,value=latest

      - name: Build and Push Docker Image
        uses: docker/build-push-action@v5
        with:
          context: .
          push: true
          tags: \${{ steps.meta.outputs.tags }}
          labels: \${{ steps.meta.outputs.labels }}

  deploy-kubernetes:
    needs: build-and-push
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Set Kubernetes Context
        uses: azure/k8s-set-context@v3
        with:
          method: kubeconfig
          kubeconfig: \${{ secrets.KUBECONFIG }}

      - name: Deploy to Kubernetes Cluster
        run: |
          kubectl apply -f k8s/configmap.yaml
          kubectl apply -f k8s/deployment.yaml
          kubectl apply -f k8s/service.yaml
          kubectl apply -f k8s/ingress.yaml
          kubectl rollout status deployment/asset-tracker-deployment -n it-operations`;

  const apiSpec = `# =============================================================================
# REST API SPECIFICATIONS (v1.0.0)
# Base URL: /api/v1
# Headers: Authorization: Bearer <jwt-token>
# Content-Type: application/json
# =============================================================================

### 1. ASSET MANAGEMENT
- GET    /api/v1/assets
  Query: ?search=&status=&category=&department_id=&skip=0&limit=50
  Response: { total: number, skip: number, limit: number, items: Asset[] }

- POST   /api/v1/assets
  Body: { asset_tag, serial_number, model_name, category, status, department_id, purchase_cost, notes }
  Roles: admin, it_agent
  Response: 201 Created -> Asset

- GET    /api/v1/assets/{id}
  Response: Asset

- PUT    /api/v1/assets/{id}
  Body: { model_name, category, status, department_id, notes, purchase_cost }
  Roles: admin, it_agent
  Response: Asset

- DELETE /api/v1/assets/{id}
  Roles: admin
  Response: 200 { message: "Asset successfully deleted" }

- POST   /api/v1/assets/{id}/checkout
  Body: { user_id: string, notes?: string }
  Roles: admin, it_agent
  Effect: Sets status='assigned', assigns user_id, department, records CHECK_OUT audit log.

- POST   /api/v1/assets/{id}/checkin
  Body: { condition_status: "in_stock"|"in_repair"|"retired", checkin_notes?: string }
  Roles: admin, it_agent
  Effect: Clears user_id, sets condition, records CHECK_IN audit log.

### 2. SOFTWARE LICENSES & SEATS
- GET    /api/v1/licenses
  Query: ?search=
  Response: SoftwareLicense[] with days_remaining, warning_level (30/60/90), is_over_allocated

- POST   /api/v1/licenses
  Body: { software_name, vendor, license_key, license_type, total_seats, renewal_cost, expiration_date }
  Roles: admin, it_agent

- POST   /api/v1/licenses/{id}/assign
  Body: { assigned_user_id?: string, assigned_asset_id?: string }
  Roles: admin, it_agent
  Effect: Increments allocated_seats, records SEAT_ASSIGN audit log.

- DELETE /api/v1/licenses/{id}/assignments/{assignmentId}
  Roles: admin, it_agent
  Effect: Revokes assignment, decrements allocated_seats, records SEAT_REVOKE audit log.

### 3. METRICS & AUDIT
- GET    /api/v1/metrics
  Response: { total_assets, total_valuation, unassigned_count, expiring_30d, expiring_60d, category_distribution }

- GET    /api/v1/audit-logs
  Query: ?entity_type=&action=&limit=100
  Response: AuditLog[]

- GET    /api/v1/health
  Response: { status: "healthy", uptime_seconds, database: { status: "connected", tables, records } }`;

  const rbacGuide = `### Role-Based Access Control (RBAC) Matrix

| Operation / Resource | Admin | IT Agent | Auditor |
|----------------------|-------|----------|---------|
| View Assets & Licenses | ✅ Allowed | ✅ Allowed | ✅ Allowed |
| View Financial Valuation | ✅ Allowed | ✅ Allowed | ✅ Allowed |
| Check-Out Equipment | ✅ Allowed | ✅ Allowed | ❌ Restricted (403 Forbidden) |
| Check-In Equipment | ✅ Allowed | ✅ Allowed | ❌ Restricted (403 Forbidden) |
| Create / Edit Assets | ✅ Allowed | ✅ Allowed | ❌ Restricted (403 Forbidden) |
| Delete Hardware Assets | ✅ Allowed | ❌ Restricted | ❌ Restricted (403 Forbidden) |
| Allocate / Revoke SaaS Seats | ✅ Allowed | ✅ Allowed | ❌ Restricted (403 Forbidden) |
| Create / Delete SaaS Contracts | ✅ Allowed | ❌ Restricted | ❌ Restricted (403 Forbidden) |
| View System Compliance Audit Logs | ✅ Allowed | ✅ Allowed | ✅ Allowed |

### JWT Verification Strategy
- Tokens are signed via HMAC-SHA256 with a 256-bit secret key.
- Claims include: \`sub\` (User ID), \`email\`, \`full_name\`, and \`role\` ('admin' | 'it_agent' | 'auditor').
- Middleware \`requireRole('admin', 'it_agent')\` enforces authorization boundaries at the API layer.
- If an Auditor attempts a mutation, the server returns HTTP 403 Forbidden with an explanation payload.`;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
          System Architecture, Schemas &amp; DevOps Blueprints
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Production artifacts, PostgreSQL schemas, OpenAPI routes, containerization, and deployment pipelines.
        </p>
      </div>

      {/* Sub-Tabs */}
      <div className="flex items-center gap-1.5 border-b border-slate-200 pb-2 overflow-x-auto text-xs font-semibold">
        <button
          onClick={() => setActiveSubTab('ddl')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
            activeSubTab === 'ddl'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          1. PostgreSQL DDL &amp; Triggers
        </button>

        <button
          onClick={() => setActiveSubTab('api')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
            activeSubTab === 'api'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Server className="w-3.5 h-3.5" />
          2. REST API Specification
        </button>

        <button
          onClick={() => setActiveSubTab('docker_k8s')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
            activeSubTab === 'docker_k8s'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Box className="w-3.5 h-3.5" />
          3. Docker &amp; Kubernetes
        </button>

        <button
          onClick={() => setActiveSubTab('cicd')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
            activeSubTab === 'cicd'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <GitBranch className="w-3.5 h-3.5" />
          4. GitHub Actions CI/CD
        </button>

        <button
          onClick={() => setActiveSubTab('rbac')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
            activeSubTab === 'rbac'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          5. RBAC &amp; JWT Security
        </button>
      </div>

      {/* Tab Panels */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
        {/* Terminal / Code Header */}
        <div className="px-5 py-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-rose-500/80" />
              <span className="w-3 h-3 rounded-full bg-amber-500/80" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
            </div>
            <span className="font-mono text-xs text-slate-400 ml-2">
              {activeSubTab === 'ddl' && 'schema.sql — PostgreSQL 16 Enterprise DDL'}
              {activeSubTab === 'api' && 'api_v1_specification.md — REST Endpoints'}
              {activeSubTab === 'docker_k8s' && 'docker-compose.yml & k8s/deployment.yaml'}
              {activeSubTab === 'cicd' && '.github/workflows/deploy.yml — CI/CD Pipeline'}
              {activeSubTab === 'rbac' && 'rbac_matrix.md — Security & Roles'}
            </span>
          </div>

          <button
            onClick={() => {
              let textToCopy = '';
              if (activeSubTab === 'ddl') textToCopy = postgresDDL;
              else if (activeSubTab === 'api') textToCopy = apiSpec;
              else if (activeSubTab === 'docker_k8s') textToCopy = dockerK8sGuide;
              else if (activeSubTab === 'cicd') textToCopy = cicdPipeline;
              else if (activeSubTab === 'rbac') textToCopy = rbacGuide;
              handleCopy(textToCopy, activeSubTab);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-mono transition-colors"
          >
            {copiedSection === activeSubTab ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Raw</span>
              </>
            )}
          </button>
        </div>

        {/* Code Content */}
        <div className="p-5 overflow-x-auto max-h-[600px] overflow-y-auto font-mono text-xs text-slate-300 leading-relaxed">
          {activeSubTab === 'ddl' && <pre>{postgresDDL}</pre>}
          {activeSubTab === 'api' && <pre>{apiSpec}</pre>}
          {activeSubTab === 'docker_k8s' && <pre>{dockerK8sGuide}</pre>}
          {activeSubTab === 'cicd' && <pre>{cicdPipeline}</pre>}
          {activeSubTab === 'rbac' && <pre>{rbacGuide}</pre>}
        </div>
      </div>
    </div>
  );
};
