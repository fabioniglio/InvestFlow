# InvestFlow — Feature Tracker

## Phase 1 — Data Foundation (Backend)

- [x] Database module with pg Pool and migration runner
- [x] Migration: create `investments` table
- [x] Migration: add indexes on `asset_symbol` and `date`
- [x] `POST /investments` — log a buy/sell/dividend event
- [x] `GET /investments` — list events (filters: asset, type, from, to)
- [x] `GET /investments/portfolio/summary` — aggregated holdings per asset
- [x] `DELETE /investments/:id` — remove an event
- [x] DTO validation with class-validator

## Phase 2 — Market Price Integration (Backend)

- [ ] Market module scaffolding
- [ ] Integrate Alpha Vantage or Finnhub API client
- [ ] `GET /market/price/:symbol` — fetch current price
- [ ] `GET /portfolio/value` — holdings × current price + P&L per asset

## Phase 3 — Core UI (Frontend)

- [ ] API service (HttpClient wrapper)
- [ ] Investment form — log buy/sell/dividend
- [ ] Investment list / timeline — filterable by asset and type
- [ ] Portfolio overview page — cards per asset (qty, avg price, current price, P&L)

## Phase 4 — Dashboard & Analytics (Frontend)

- [ ] Portfolio value over time — line chart
- [ ] Allocation breakdown — pie chart
- [ ] P&L per asset — bar chart
- [ ] Summary KPIs — total invested, current value, total P&L, best/worst performer

## Backlog (Post-MVP)

- [ ] JWT Authentication
- [ ] Multi-user portfolio support
- [ ] Market price caching layer
- [ ] Background cron jobs for price updates
- [ ] DCA simulator
- [ ] CI/CD pipeline (GitHub Actions)
