# AVRO Backend Database Specification — AI Insights Engine

## 1. Overview
This document specifies the database architecture and domain schemas required for the **AI Insights Engine** of AVRO, as derived from the frontend analysis (`HostControlScreen.tsx`, `HomeScreen.tsx`, `base44/HostControlPage.txt`).

---

## 2. Required Databases & Engine Mapping

### A. Event Telemetry & Conversion Funnel Database
* **Engine**: ClickHouse / TimescaleDB
* **Purpose**: Tracks conversion funnel metrics (`Search` → `Viewed` → `Saved` → `Visited` → `Booked` → `Moved in`), period comparisons (7D/30D/90D/This Month), drop-off percentages, and multi-touch acquisition sources (`Google`, `Instagram`, `WhatsApp`, `Referral`, `Walk-in`).
* **Core Tables**:
  - `funnel_events` (event_id, timestamp, property_id, stage, source_channel, user_id, session_id)
  - `funnel_aggregations_daily` (date, property_id, stage, count, source_channel)

### B. Demand & Spatial Intelligence Database
* **Engine**: PostgreSQL + PostGIS (Spatial Analytics) & Redis (Real-time Counters)
* **Purpose**: Feeds the 7 Demand Lenses (`Day`, `Hour`, `College`, `Platform`, `Gender`, `Room type`, `Price`), college catchment spatial calculations, and real-time high-intent demand heatmap calculations.
* **Core Tables**:
  - `colleges_landmarks` (id, name, city, location_point, catchment_radius_meters)
  - `demand_heatmaps` (id, property_id, day_of_week, hour_of_day, lens_type, lens_value, signal_count, geo_point)

### C. Financial Ledger & Yield Optimization Database
* **Engine**: PostgreSQL (ACID Financial Ledger) / CockroachDB
* **Purpose**: Powers the `OpportunityLedger` (`Lost Revenue`, `Recoverable Revenue`, `Potential Revenue`, `Protected Revenue`), vacancy cost tracking, partial rent debts, and dynamic price recommendations.
* **Core Tables**:
  - `financial_ledger` (id, property_id, resident_id, transaction_type, amount, due_date, status, deposit_amount)
  - `revenue_opportunities` (id, property_id, category, amount, affected_beds, description, status)

### D. AI Vector & Semantic Memory Store
* **Engine**: pgvector (PostgreSQL extension) / Qdrant
* **Purpose**: Stores vector embeddings of tenant communications, feedback, maintenance issues, and cause-and-effect relationship rules for automated LLM insight generation (`ObservationFeed`).
* **Core Tables**:
  - `ai_observations` (id, property_id, title, evidence, icon, tone, created_at)
  - `causality_embeddings` (id, feature_change, effect_metric, lift_percentage, embedding)

### E. Property, Inventory & Operational Health Database
* **Engine**: PostgreSQL (Relational Core)
* **Purpose**: Stores property master records, room/bed inventory, building health scores, manager/staff assignments, and SLA metrics.
* **Core Tables**:
  - `properties` (id, name, city, locality, occupancy_pct, health_score, availability_count, revenue_monthly, residents_count, total_beds, status)
  - `rooms_beds` (id, property_id, room_number, room_type, floor, price_monthly, status)
  - `managers` (id, name, role, score, tasks_count, verification_pct, response_time_min, rating)

### F. Resident Communications & Ticket Management Database
* **Engine**: MongoDB / PostgreSQL JSONB
* **Purpose**: Real-time chat messages, maintenance ticket workflows (`M-241 In progress`), visitor passes, and sentiment logs.
* **Core Tables / Collections**:
  - `conversations` (id, resident_id, property_id, category, unread_count, priority, agreement_end_date)
  - `maintenance_tickets` (id, ticket_number, property_id, room_id, status, category, reported_at)

---

## 3. Summary Mapping

| AI Feature / Component | Purpose in AI Insights | Required DB Engine |
| :--- | :--- | :--- |
| **`SignalRiver` (Funnel)** | Funnel tracking, drop-off analysis & acquisition channel metrics | **ClickHouse** / TimescaleDB |
| **`DemandField` (Heatmaps)** | Spatial-temporal demand lens aggregation across colleges, price, hour | **PostgreSQL (PostGIS)** + Redis |
| **`OpportunityLedger`** | Revenue leakage classification (Lost/Recoverable/Potential/Protected) | **PostgreSQL** (Financial Ledger) |
| **`ObservationFeed`** | Semantic causality engine & LLM observation generation | **pgvector** / Qdrant |
| **`PortfolioField` (Health)** | Building health scoring, bed occupancy & manager response metrics | **PostgreSQL** (Relational Core) |
| **`Communication / Complaints`** | Ticket classification & tenant sentiment analysis | **MongoDB** / PostgreSQL JSONB |
