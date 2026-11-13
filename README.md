# ALLT - Asset & License Lifecycle Tracker

ALLT is an enterprise-grade IT Service Desk and hardware/software lifecycle management platform built with React 18, TypeScript, Tailwind CSS, Vite, and Express.

![ALLT Banner](public/logo.png)

## Features

- **Hardware Fleet Inventory**: Complete lifecycle tracking (In Stock, Assigned, Under Repair, Decommissioned, Lost/Stolen) with virtualized 60 FPS rendering.
- **Software License Management**: Track enterprise seat allocations, license keys, renewal timelines, cost calculations, and 30/60/90-day expiration alerts.
- **Check-in / Check-out Engine**: Dynamic asset assignment workflow with audit log tracking and condition history.
- **Executive Analytics & KPI Dashboard**: Real-time fleet valuation, allocation ratios, department breakdowns, and hardware warranty status.
- **Audit Logging**: Comprehensive, append-only security logs tracking administrative, agent, and auditor operations.
- **Role-Based Access Control (RBAC)**: Fine-grained permissions for Admin, IT Agent, and Auditor roles.

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, TanStack Virtual, Lucide React
- **Backend**: Express, TypeScript (Node.js ESM/CJS), JSON Web Tokens (JWT)
- **Database**: In-memory relational store with seed fixtures and transactional triggers

## Quick Start

### 1. Prerequisites
- Node.js 18+ or 20+
- npm, yarn, or pnpm

### 2. Installation
```bash
git clone https://github.com/your-username/allt-asset-lifecycle-tracker.git
cd allt-asset-lifecycle-tracker
npm install
```

### 3. Development Server
Run both the Express backend and the Vite client simultaneously:
```bash
npm run dev
```
The application will be live at `http://localhost:3000`.

### 4. Production Build & Start
```bash
npm run build
npm start
```

## Project Structure

```
├── public/                 # Static assets and icons
│   ├── logo.png            # ALLT Brand Logo
│   └── allt-gemini-logo.png
├── src/
│   ├── components/         # Modular UI components
│   │   ├── AlltLogo.tsx
│   │   ├── AppLayout.tsx
│   │   ├── ArchitectureDocs.tsx
│   │   ├── AssetDetailModal.tsx
│   │   ├── AssetInventoryTable.tsx
│   │   ├── AssetModal.tsx
│   │   ├── AuditLogViewer.tsx
│   │   ├── CheckInOutModal.tsx
│   │   ├── DashboardOverview.tsx
│   │   ├── Header.tsx
│   │   ├── LifecyclePipeline.tsx
│   │   ├── RightNavDrawer.tsx
│   │   └── SoftwareLicenseManager.tsx
│   ├── api.ts              # API client methods
│   ├── App.tsx             # Root application view
│   ├── index.css           # Tailwind styling entry
│   ├── main.tsx            # Vite DOM mount
│   └── types.ts            # Domain entity interfaces & types
├── server.ts               # Express server, REST endpoints, and RBAC
├── package.json            # Scripts and dependencies
└── tsconfig.json           # TypeScript configuration
```

## License
MIT
