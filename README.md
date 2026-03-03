InvestFlow – Architecture Overview
1. Project Overview

InvestFlow is a full-stack investment tracking application designed to:

Register investment events (buy, sell, dividend)

Track portfolio performance

Integrate with real market APIs

Provide a timeline visualization of investment history

Calculate portfolio metrics and simulations (e.g., DCA)

2. Technology Stack
Frontend

Angular 21

Standalone components

Signals (state management)

Angular Router

Chart.js or ApexCharts

Tailwind or Angular Material

Backend

Node.js

NestJS

PostgreSQL

pg (native PostgreSQL driver)

SQL queries (no ORM)

Infrastructure

Docker

Docker Compose (local development)

Deployment target:

Backend + DB: Railway or Fly.io

Frontend: Netlify or Vercel

3. High-Level Architecture
Angular 21 (Frontend)
        ↓ HTTP REST
NestJS API (Backend)
        ↓
PostgreSQL
        ↓
External Market API (e.g. Alpha Vantage / Finnhub)
4. Backend Architecture (NestJS)
Architectural Style

Modular architecture

Clean separation of concerns

No ORM (SQL-first approach)

Repository pattern

DTO validation

Service layer business logic

Backend Folder Structure
backend/
 ├── src/
 │    ├── main.ts
 │    ├── app.module.ts
 │    │
 │    ├── modules/
 │    │    ├── investments/
 │    │    │    ├── investments.module.ts
 │    │    │    ├── investments.controller.ts
 │    │    │    ├── investments.service.ts
 │    │    │    ├── investments.repository.ts
 │    │    │    ├── dto/
 │    │    │    │    ├── create-investment.dto.ts
 │    │    │    │    └── update-investment.dto.ts
 │    │    │    └── sql/
 │    │    │         ├── insert-investment.sql
 │    │    │         └── portfolio-summary.sql
 │    │
 │    ├── database/
 │    │    ├── database.module.ts
 │    │    ├── database.service.ts
 │    │    └── migrations/
 │    │         ├── 001_create_investments.sql
 │    │         └── 002_add_indexes.sql
 │    │
 │    ├── market/
 │    │    ├── market.module.ts
 │    │    ├── market.service.ts
 │    │    └── market.client.ts
 │    │
 │    └── common/
 │         ├── filters/
 │         ├── interceptors/
 │         └── utils/
 │
 ├── Dockerfile
 ├── package.json
 └── tsconfig.json
5. Database Design
investments table
CREATE TABLE investments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_symbol VARCHAR(10) NOT NULL,
    type VARCHAR(20) NOT NULL,
    quantity NUMERIC,
    price NUMERIC,
    amount NUMERIC,
    date TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);
Recommended Indexes
CREATE INDEX idx_investments_asset ON investments(asset_symbol);
CREATE INDEX idx_investments_date ON investments(date);
6. Frontend Architecture (Angular 21)
Architectural Principles

Standalone components

Feature-based structure

Signals for state

Derived/computed portfolio metrics

REST API integration

Lazy-loaded routes

Frontend Folder Structure
frontend/
 ├── src/
 │    ├── main.ts
 │    ├── app/
 │    │    ├── app.routes.ts
 │    │    │
 │    │    ├── core/
 │    │    │    ├── services/
 │    │    │    │    ├── api.service.ts
 │    │    │    │    └── portfolio.service.ts
 │    │    │    └── interceptors/
 │    │    │
 │    │    ├── shared/
 │    │    │    ├── components/
 │    │    │    └── models/
 │    │    │
 │    │    ├── features/
 │    │    │    ├── investments/
 │    │    │    │    ├── timeline/
 │    │    │    │    ├── dashboard/
 │    │    │    │    ├── filters/
 │    │    │    │    └── investments.routes.ts
 │    │    │    │
 │    │    │    └── simulation/
 │    │    │         ├── dca-simulator.component.ts
 │    │    │         └── simulation.service.ts
 │
 ├── Dockerfile
 ├── nginx.conf
 └── angular.json
7. Infrastructure & Deployment
Local Development

Docker Compose includes:

NestJS backend container

PostgreSQL container

Angular frontend container (optional for local)

Example structure:

investflow/
 ├── backend/
 ├── frontend/
 └── docker-compose.yml
Production Strategy

Option 1 (Recommended Initial Setup):

Backend: Railway

Database: Railway PostgreSQL

Frontend: Netlify or Vercel

Option 2 (Advanced):

Backend: Fly.io

Database: Managed PostgreSQL

Frontend: Static hosting (Cloudflare / Vercel)

8. Future Improvements

JWT Authentication

Multi-user portfolio support

Market price caching layer

Background jobs (cron-based price updates)

Go microservice for financial simulations

CI/CD pipeline (GitHub Actions)

Monitoring & logging

Portfolio analytics module

9. Architectural Principles

SQL-first design

Clear separation of concerns

Stateless backend

RESTful API design

Environment-based configuration

Docker-first deployment

Scalable service boundaries