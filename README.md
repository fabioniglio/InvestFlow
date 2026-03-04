# InvestFlow

A full-stack investment tracking application for registering events, monitoring portfolio performance, and running financial simulations.

![Angular](https://img.shields.io/badge/Angular-21-dd0031?logo=angular)
![NestJS](https://img.shields.io/badge/NestJS-backend-e0234e?logo=nestjs)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-database-336791?logo=postgresql)
![Docker](https://img.shields.io/badge/Docker-infrastructure-2496ed?logo=docker)

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Technology Stack](#2-technology-stack)
3. [High-Level Architecture](#3-high-level-architecture)
4. [Backend Architecture](#4-backend-architecture-nestjs)
5. [Database Design](#5-database-design)
6. [Frontend Architecture](#6-frontend-architecture-angular-21)
7. [Infrastructure & Deployment](#7-infrastructure--deployment)
8. [Getting Started](#8-getting-started)
9. [Future Improvements](#9-future-improvements)
10. [Architectural Principles](#10-architectural-principles)

---

## 1. Project Overview

InvestFlow lets you:

- Register investment events (buy, sell, dividend)
- Track portfolio performance over time
- Integrate with real market APIs (e.g. Alpha Vantage / Finnhub)
- Visualize investment history on a timeline
- Calculate portfolio metrics and run simulations (e.g. Dollar-Cost Averaging)

---

## 2. Technology Stack

### Frontend

| Tool | Purpose |
|------|---------|
| Angular 21 | UI framework |
| Standalone components | Component model |
| Signals | State management |
| Angular Router | Client-side routing (lazy-loaded) |
| Chart.js / ApexCharts | Data visualization |
| Tailwind / Angular Material | Styling |

### Backend

| Tool | Purpose |
|------|---------|
| Node.js + NestJS | API framework |
| PostgreSQL | Primary database |
| `pg` (native driver) | Database connectivity |
| SQL-first (no ORM) | Query management |

### Infrastructure

| Tool | Purpose |
|------|---------|
| Docker | Containerization |
| Docker Compose | Local orchestration |
| Railway / Fly.io | Backend & DB hosting |
| Netlify / Vercel | Frontend hosting |

---

## 3. High-Level Architecture

```
Angular 21 (Frontend)
       │  HTTP REST
       ▼
NestJS API (Backend)
       │
       ▼
  PostgreSQL
       │
       ▼
External Market API
(Alpha Vantage / Finnhub)
```

---

## 4. Backend Architecture (NestJS)

### Design Decisions

- **Modular architecture** — each domain is an isolated NestJS module
- **No ORM** — SQL-first approach for full query control
- **Repository pattern** — data access logic separated from business logic
- **DTO validation** — input validated at the controller boundary
- **Service layer** — business logic lives in services, not controllers

### Folder Structure

```
backend/
└── src/
    ├── main.ts
    ├── app.module.ts
    │
    ├── modules/
    │   └── investments/
    │       ├── investments.module.ts
    │       ├── investments.controller.ts
    │       ├── investments.service.ts
    │       ├── investments.repository.ts
    │       ├── dto/
    │       │   ├── create-investment.dto.ts
    │       │   └── update-investment.dto.ts
    │       └── sql/
    │           ├── insert-investment.sql
    │           └── portfolio-summary.sql
    │
    ├── database/
    │   ├── database.module.ts
    │   ├── database.service.ts
    │   └── migrations/
    │       ├── 001_create_investments.sql
    │       └── 002_add_indexes.sql
    │
    ├── market/
    │   ├── market.module.ts
    │   ├── market.service.ts
    │   └── market.client.ts
    │
    └── common/
        ├── filters/
        ├── interceptors/
        └── utils/
```

---

## 5. Database Design

### `investments` table

```sql
CREATE TABLE investments (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_symbol VARCHAR(10)  NOT NULL,
    type         VARCHAR(20)  NOT NULL,  -- 'buy' | 'sell' | 'dividend'
    quantity     NUMERIC,
    price        NUMERIC,
    amount       NUMERIC,
    date         TIMESTAMP    NOT NULL,
    created_at   TIMESTAMP    DEFAULT NOW()
);
```

### Indexes

```sql
CREATE INDEX idx_investments_asset ON investments(asset_symbol);
CREATE INDEX idx_investments_date  ON investments(date);
```

---

## 6. Frontend Architecture (Angular 21)

### Design Decisions

- **Standalone components** — no NgModules, simpler dependency graph
- **Feature-based structure** — each feature owns its routes, components, and services
- **Signals** — reactive state without RxJS overhead for derived/computed values
- **Lazy-loaded routes** — features are loaded on demand

### Folder Structure

```
frontend/
└── src/
    ├── main.ts
    └── app/
        ├── app.routes.ts
        │
        ├── core/
        │   ├── services/
        │   │   ├── api.service.ts
        │   │   └── portfolio.service.ts
        │   └── interceptors/
        │
        ├── shared/
        │   ├── components/
        │   └── models/
        │
        └── features/
            ├── investments/
            │   ├── timeline/
            │   ├── dashboard/
            │   ├── filters/
            │   └── investments.routes.ts
            │
            └── simulation/
                ├── dca-simulator.component.ts
                └── simulation.service.ts
```

---

## 7. Infrastructure & Deployment

### Local Development

All services are orchestrated with Docker Compose:

```
investflow/
├── backend/          # NestJS app
├── frontend/         # Angular app
└── docker-compose.yml
```

The Compose stack includes:
- NestJS backend container
- PostgreSQL container
- Angular frontend container (optional for local dev)

### Production

**Option 1 — Recommended for initial launch:**

| Layer | Platform |
|-------|---------|
| Backend API | Railway |
| Database | Railway PostgreSQL |
| Frontend | Netlify or Vercel |

**Option 2 — Advanced:**

| Layer | Platform |
|-------|---------|
| Backend API | Fly.io |
| Database | Managed PostgreSQL |
| Frontend | Cloudflare Pages / Vercel |

---

## 8. Getting Started

> Prerequisites: [Node.js](https://nodejs.org), [Docker](https://www.docker.com), [Docker Compose](https://docs.docker.com/compose/)

```bash
# 1. Clone the repository
git clone https://github.com/your-username/investflow.git
cd investflow

# 2. Start all services
docker compose up --build

# Backend API will be available at http://localhost:3000
# Frontend will be available at http://localhost:4200
```

For running services individually, see the `README.md` files inside `backend/` and `frontend/`.

---

## 9. Future Improvements

- [ ] JWT Authentication
- [ ] Multi-user portfolio support
- [ ] Market price caching layer
- [ ] Background jobs (cron-based price updates)
- [ ] Go microservice for financial simulations
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] Monitoring & logging
- [ ] Portfolio analytics module

---

## 10. Architectural Principles

- **SQL-first design** — raw SQL for full control and visibility over queries
- **Clear separation of concerns** — controller → service → repository layers
- **Stateless backend** — no server-side session state
- **RESTful API design** — predictable, resource-oriented endpoints
- **Environment-based configuration** — no secrets in code
- **Docker-first deployment** — consistent environments from local to production
- **Scalable service boundaries** — modules are loosely coupled and independently deployable
