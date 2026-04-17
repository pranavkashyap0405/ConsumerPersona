# DISCOM Consumer Persona Intelligence — Application Build Plan
> Based on: Consumer Persona & Scenario Intelligence Framework v1.0 — April 2026
> Classification: Confidential — Internal Use Only

---

## Table of Contents

1. [What We Are Building](#1-what-we-are-building)
2. [Architecture Overview](#2-architecture-overview)
3. [Tech Stack](#3-tech-stack)
4. [User Roles](#4-user-roles)
5. [User Flows](#5-user-flows)
6. [Build Phases](#6-build-phases)
   - [Phase 1 — Data Foundation](#phase-1--data-foundation)
   - [Phase 2 — Scoring Engine](#phase-2--scoring-engine)
   - [Phase 3 — Persona Assignment Engine](#phase-3--persona-assignment-engine)
   - [Phase 4 — Action Routing Engine](#phase-4--action-routing-engine)
   - [Phase 5 — Dashboard](#phase-5--dashboard-react-frontend)
   - [Phase 6 — Chatbot LLM Layer](#phase-6--chatbot-llm-layer)
   - [Phase 7 — Action Execution Layer](#phase-7--action-execution-layer)
   - [Phase 8 — Feedback Loop](#phase-8--feedback-loop--continuous-improvement)
7. [Build Sequence & Timeline](#7-build-sequence--timeline)
8. [KPIs to Track](#8-kpis-to-track)

---

## 1. What We Are Building

A web application for DISCOM operations teams that:

- Ingests consumer data from MDMS, billing, payment, CRM, and app systems
- Runs 6 scoring algorithms monthly to score every consumer across revenue risk, peak impact, complaint risk, engagement, DSM readiness, and regulatory risk
- Assigns each consumer one of 18 personas using a priority rule engine
- Triggers 24 action scenarios routing the right action to the right team
- Surfaces consumer intelligence through a role-based dashboard
- Integrates a chatbot (LLM) that lets any team member query consumer, DT, feeder, and area-level insights in natural language and initiate actions from the chat interface

**The outcome:** Every team — collections, DSM, field ops, CX, billing, network planning — works from the same consumer intelligence layer, with a clear recommended action per consumer, updated every billing month.

---

## 2. Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        DATA SOURCES                             │
│  MDMS │ Billing System │ Payment Records │ CRM │ Consumer App   │
└───────────────────────┬─────────────────────────────────────────┘
                        │ (monthly batch + real-time events)
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│              CONSUMER 360 DATA LAYER  (PostgreSQL)              │
│  consumer_master │ billing_monthly │ payment_history            │
│  meter_readings  │ complaint_log   │ engagement_log             │
└───────────────────────┬─────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│                    SCORING ENGINE  (Python)                      │
│  Revenue Risk │ Peak Impact │ Complaint Risk │ CX Engagement    │
│  DSM Readiness │ Regulatory Risk Flag                           │
└───────────────────────┬─────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│              PERSONA ASSIGNMENT ENGINE  (Rule Engine)           │
│  18 Personas │ 12 priority rules │ Primary + Secondary persona  │
└───────────────────────┬─────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│              ACTION ROUTING ENGINE  (24 Scenarios)              │
│  Collections │ DSM/Network │ CX/Complaints │ Field Ops          │
│  Auto-Debit  │ Multi-Persona combos                             │
└────────┬──────────────────────────────┬─────────────────────────┘
         │                              │
         ▼                              ▼
┌─────────────────────┐    ┌────────────────────────────────────┐
│   DASHBOARD (React) │    │     CHATBOT (LLM — Claude API)     │
│  Consumer view      │    │  Natural language Q&A              │
│  Portfolio view     │    │  Consumer / DT / Area queries      │
│  DT/Feeder view     │    │  Action recommendations            │
│  KPI tracking       │    │  Scenario simulation               │
└────────┬────────────┘    └────────────────┬───────────────────┘
         │                                  │
         └──────────────┬───────────────────┘
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│                    ACTION EXECUTION LAYER                        │
│  WhatsApp API │ IVR Trigger │ Field Visit Scheduler │ CRM Push  │
└─────────────────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│                    FEEDBACK LOOP                                 │
│  Intervention outcome logging │ KPI dashboard │ Threshold tuner │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. Tech Stack

| Layer | Choice | Reason |
|-------|--------|--------|
| Database | PostgreSQL | Structured scoring data, JSONB for flexible attributes |
| Scoring engine | Python (pandas, scikit-learn) | Data pipeline and statistical scoring |
| Persona / rule engine | Python (business-rules or custom evaluator) | Explainable, auditable, no black-box |
| API layer | FastAPI | Async, fast, OpenAPI docs auto-generated |
| Dashboard | React + Recharts / Tremor | Rich charts, KPI cards, decision matrices |
| Chatbot LLM | Claude API (claude-sonnet-4-6) with tool use | Natural language + structured tool-call architecture |
| Job scheduler | Celery + Redis | Monthly batch scoring + event-driven action triggers |
| Messaging | WhatsApp Business API + Twilio IVR | Action execution channels |
| Auth | Role-based (per team) | Each team sees only their action queue |
| Deployment | Docker + Nginx | Containerised, deployable on-premise or cloud |

---

## 4. User Roles

| Role | Primary Goal | Primary Entry Point |
|------|-------------|---------------------|
| Collections Officer | Recover overdue payments efficiently | Action queue + chatbot |
| DSM / Network Planner | Manage peak load, target DR enrolment | DT/Feeder view + chatbot |
| Field Operations Agent | Execute field visits with right context | Mobile action list |
| CX / Billing Officer | Resolve complaints before escalation | Alerts queue + consumer view |
| Operations Manager | Monitor KPIs, make strategic decisions | Portfolio dashboard |

---

## 5. User Flows

### 5.1 Collections Officer — Daily Use

**Entry point:** Action Queue (Collections tab)

1. Logs in and lands on the Action Queue, showing today's prioritised consumer list segmented by urgency.
2. Sees three types of items:
   - High-value defaulters needing senior agent call
   - Accidental late payers due in 3 days — batch WhatsApp candidates
   - Dispute-driven withholders — enforce freeze, no collection action
3. Clicks a consumer card → opens Consumer 360 View showing:
   - 6 score gauges
   - Persona badge with plain-English description
   - Single recommended action
   - Payment history (12 months)
   - Active complaints
   - Best contact time
4. Takes action directly from the view:
   - [Send WhatsApp reminder] — pre-filled with name, amount, UPI deep link
   - [Offer instalment plan] — triggers WhatsApp flow, logs action
   - [Schedule field visit] — adds to Field Ops queue
5. Or opens the chatbot:
   - "Show me all chronic defaulters in Circle 4 where field visits haven't worked in the last 6 months"
   - Chatbot returns list with scores and recommendation: pre-pay meter candidates vs enforce-freeze cases
   - [Bulk action: Flag for pre-pay meter] → dispatched to Field Ops queue

**Key chatbot queries for this role:**
- "Who should I call first this morning?"
- "Which consumers have ignored all digital reminders?"
- "Show me all high-value defaulters overdue more than 15 days"
- "Can I send the instalment offer to the cash-flow constrained segment in Batch 2?"

---

### 5.2 DSM / Network Planner — Weekly Use

**Entry point:** DT / Feeder Dashboard

1. Logs in and sees a list of DTs with aggregate peak load status and DR candidate count.
2. Red DTs (>90% peak load) are highlighted at the top.
3. Clicks DT-47 → opens DT Detail View showing:
   - List of all consumers on the DT with their Peak Impact and Flex Load scores
   - Decision matrix cell: what proportion are DR-ready vs infrastructure triggers
   - Estimated capex deferral amount if DSM succeeds
   - Recommended protocol: DSM-first or upgrade review
4. Triggers DR enrolment campaign directly from the DT view — selects flexible consumers, sends app notification.
5. Opens chatbot for complex questions:
   - "Should I upgrade DT-47 or can DSM fix the overload?"
   - "Which DTs across Circle 3 can avoid upgrade this quarter if DSM runs?"
   - "Show me all EV consumers causing daytime peak stress"
6. Chatbot responses always cite the decision matrix logic and the scenario rule that fired.

**Key chatbot queries for this role:**
- "Which DTs can I defer capex on this quarter?"
- "How many EV consumers are charging during peak hours?"
- "Simulate: if I enrol 50 flexible consumers on DT-47 in DR, what is the projected peak reduction?"
- "Which consumers are TOD tariff candidates in my network?"

---

### 5.3 Field Operations Agent — Mobile Daily Use

**Entry point:** Today's Visit List (mobile, assigned area)

1. Logs in on mobile and sees a route-optimised visit list for their assigned area.
2. Each item shows: distance, overdue amount, persona in plain English, key script points.
3. Taps a consumer → Visit Brief View showing:
   - Consumer name, address, phone number
   - What they owe and why (plain English, no score jargon)
   - Recommended script lines for the doorstep conversation
   - One-tap [Send WhatsApp 30 min before arrival]
4. Logs outcome after each visit:
   - [Paid on visit]
   - [Agreed instalment plan]
   - [Not home — reschedule]
   - [Pre-pay meter agreed — raise work order]
5. Outcomes feed directly into KPI tracker and update the consumer's record.

**Design principle:** Field agents never see raw scores. They see plain-language context and a single next action.

---

### 5.4 CX / Billing Officer — Event-Driven

**Entry point:** Alert notification (dashboard bell or email)

1. Receives alert: "3 consumers are at Regulatory Risk today."
2. Lands on Alerts Queue (CX tab) — two types of alerts:
   - Ombudsman / Forum Escalator: complaint open >30 days, senior officer action required within 24 hours
   - Bill Shock Prone: new bill generated today with >30% variance, proactive WhatsApp required before consumer calls
3. Opens Ombudsman-risk consumer:
   - Full complaint timeline
   - Why the Regulatory Risk Flag fired (exact trigger conditions shown)
   - Recommended action: senior officer outreach, fast-track SLA, formal written response, legal loop-in
   - Action buttons: [Assign to CX Head] [Escalate to Legal] [Send formal response]
4. Opens Bill Shock consumer:
   - Pre-generated plain-language bill explanation: "You used 230 units. First 100 at Rs.3.50, next 130 at Rs.5.50."
   - [Send WhatsApp now] — one click, before consumer calls helpline
5. Asks chatbot for root cause analysis:
   - "Why is consumer 2201 bill-shocked? Is this a meter fault?"
   - Chatbot checks MDMS, billing history, area pattern — returns diagnostic with confidence

**Key chatbot queries for this role:**
- "Any complaints about to hit the Ombudsman today?"
- "Which consumers have both a dispute open and an overdue amount?"
- "Show me all estimated billing consumers — complaint risk is rising"
- "Is the spike in Circle 7 complaints linked to a meter batch or a tariff change?"

---

### 5.5 Operations Manager — Weekly / Monthly

**Entry point:** Portfolio Dashboard

1. Logs in to see the full KPI scorecard and persona distribution for the month.
2. KPIs shown against targets — green/amber/red RAG status.
3. Drills into any off-target KPI:
   - Clicks "Accidental default rate: 6.2% vs 5% target"
   - Sees: 2,340 consumers in Accidental Late Payer persona, 1,890 without auto-debit
   - Recommended fix: auto-debit conversion campaign
4. Reviews persona drift alerts:
   - "14 consumers moved from Prompt Payer → At-Risk Defaulter this month — unusual spike in Sector 7"
   - Investigates root cause (billing migration, area outage, tariff change)
5. Uses chatbot for strategic questions:
   - "What is the biggest lever to reduce DSO this quarter?"
   - "Which team's action queue has the most backlog?"
   - "Show the month-on-month trend of Chronic Defaulters in each circle"

**Key chatbot queries for this role:**
- "What is the biggest lever to reduce DSO this quarter?"
- "Why did DR enrolment rate drop last month?"
- "Which circle has the highest regulatory escalation risk right now?"
- "Project the revenue recovery impact if we run a pre-pay meter conversion drive on all chronic defaulters"

---

### 5.6 The Chatbot as a Consistent Thread

The chatbot is available on every screen. The core interaction loop is:

```
Dashboard surfaces WHAT is happening
        +
Chatbot explains WHY and recommends WHAT TO DO
        +
Action buttons execute the recommendation
        +
Outcome is logged and feeds back to KPIs
```

**Chatbot capabilities:**
- **Consumer-level:** "Why is consumer 12345 flagged as high risk?" → score breakdown + rule that fired
- **Portfolio-level:** "Show all Ombudsman-risk consumers in Circle 3" → filtered list with scores
- **DT/Area-level:** "Which DTs in Whitefield are overloaded but DSM-addressable?" → DT × scenario answer
- **Simulation:** "If we enrol these 50 consumers in DR, what is the projected peak reduction on DT-47?"
- **Action initiation:** "Send WhatsApp reminder to all Accidental Late Payers in Batch 3 due today" → confirms → triggers
- **Explainability:** Every answer cites the exact score inputs and rule that fired — fully auditable

---

## 6. Build Phases

---

### Phase 1 — Data Foundation

| # | Action | Detail |
|---|--------|--------|
| 1.1 | Design Consumer 360 schema | 6 PostgreSQL tables: `consumer_master`, `billing_monthly`, `payment_history`, `complaint_log`, `meter_readings`, `engagement_log` |
| 1.2 | Build data ingestion connectors | Adapters for MDMS CSV/API, billing system export, payment gateway webhook, CRM API |
| 1.3 | Build attribute extraction pipeline | Derive: payment consistency score, arrears status, peak hour usage, NILM flags, complaint TAT, bill variance %, flexible load score, TOD sensitivity, digital payment flag, renewable score |
| 1.4 | Monthly batch scheduler | Airflow/Celery job aligned to billing cycle — refreshes all attributes monthly |
| 1.5 | Mock data generator | Synthetic consumer dataset covering all 18 persona types for dev and testing before live data is available |
| 1.6 | Data validation layer | Schema checks, null handling, outlier flags — runs before scoring engine on each cycle |

---

### Phase 2 — Scoring Engine

| # | Action | Score | Inputs | Tiers |
|---|--------|-------|--------|-------|
| 2.1 | Revenue Risk Score | 0–100 | Payment delays, default probability, consistency score, arrears status | 0–30 Safe / 31–65 Watch / 66–100 Enforce |
| 2.2 | Peak Impact Score | 0–100 | Peak hour usage, DT coincidence level, NILM AC/EV/pump flags | 0–40 Low / 41–70 Medium / 71–100 High |
| 2.3 | Complaint Risk Score | 0–100 | Complaint frequency, TAT history, escalation flags, bill shock, repeat flag | 0–30 Low / 31–65 Monitor / 66–100 Priority |
| 2.4 | CX Engagement Score | 0–100 | App logins, notification open rate, digital payment flag, preferred channel, best contact time | 0–30 Offline / 31–65 Partial / 66–100 Digital-first |
| 2.5 | DSM Readiness Score | 0–100 | Flexible load score, NILM flags, TOD sensitivity, peak coincidence level | 0–35 Non-flexible / 36–65 Partial / 66–100 DR-ready |
| 2.6 | Regulatory Risk Flag | Y/N | Complaint open >30 days OR escalation flag set OR (Complaint Risk >70 AND TAT >15 days) | N — no action / Y — senior officer escalation |
| 2.7 | Shadow scoring validation | — | Run 2 billing cycles in parallel with existing system. Validate score distributions and thresholds against known outcomes before go-live | — |

---

### Phase 3 — Persona Assignment Engine

| # | Action | Detail |
|---|--------|--------|
| 3.1 | Implement 12 priority rules | Rule-based evaluator run in priority order. First matching rule sets primary persona. |
| 3.2 | Secondary persona logic | Evaluate remaining rules after primary assignment; set secondary persona if second-highest signal crosses threshold |
| 3.3 | Implement all 18 personas | Revenue/Payment (6) + Network/DSM (6) + CX/Complaint (3) + Digital Engagement (3) + High-Value Composite (3) |
| 3.4 | Persona history table | Store primary + secondary persona per consumer per billing month for trend tracking and drift alerts |
| 3.5 | Decision matrix engine | Implement 3 matrices: Revenue Risk × Engagement, Complaint Risk × Revenue Risk, Peak Impact × Flexible Load |

**Priority Rule Order:**

| Priority | Condition | Assigned Persona |
|----------|-----------|-----------------|
| 1 | Revenue Risk > 65 | At-Risk Defaulter |
| 2 | Revenue Risk > 65 AND Bill Value = High | At-Risk High-Value Defaulter |
| 3 | Complaint Risk > 70 AND Escalation Flag = Y | Ombudsman / Forum Escalator |
| 4 | Complaint Risk > 70 AND Revenue Risk > 50 | Complaint-Prone Defaulter |
| 5 | Peak Impact > 70 AND Flexible Load > 55 | Flexible Peak Contributor |
| 6 | Peak Impact > 70 AND Flexible Load < 35 | Infrastructure Upgrade Trigger |
| 7 | NILM EV = Y AND Engagement > 50 | EV-Ready Consumer |
| 8 | Renewable Score > 65 AND Consumption > 250 kWh | Renewable Adopter |
| 9 | Engagement > 75 AND Revenue Risk < 30 | Digital High-Value |
| 10 | Bill Shock Flag = Y AND Complaint Risk > 45 | Bill Shock Prone |
| 11 | Revenue Risk 25–55 AND Engagement > 40 | Accidental Late Payer |
| 12 | All scores below thresholds | Base Load / No Action |

---

### Phase 4 — Action Routing Engine

24 scenarios across 6 domains. Each scenario creates an action record with: consumer ID, scenario ID, recommended action text, owning team, priority, channel, and expiry time.

#### 4.1 Revenue & Collections Scenarios

| # | Scenario | Trigger Condition | Action | Owner |
|---|----------|------------------|--------|-------|
| 1 | Accidental default prevention | Rev Risk 25–55, Engagement >40, no complaint, due in 3 days | WhatsApp D-3 reminder with UPI deep link | Digital Collections |
| 2 | Digital vs field visit triage | Rev Risk >55, overdue >15 days | Digital (Engagement >50): WhatsApp + IVR. Field (Engagement <30): scheduled visit | Collections + Field Ops |
| 3 | High-value defaulter priority | Rev Risk >65, Bill Value >Rs.5,000, overdue >15 days | Senior agent call, part-payment offer, instalment plan | Senior Collections |
| 4 | Dispute-linked default resolution | Rev Risk >50, Complaint Risk >60, Bill Shock = Y, active complaint | Enforce freeze: no field visit, no disconnection. Resolve billing dispute within 7 days. Collections resumes after resolution. | Billing Ops + CX |
| 5 | Cash-flow instalment offer | Rev Risk 45–70, overdue 15–30 days, no prior plan, first or second default this year | 2–3 month instalment plan via WhatsApp. Consumer replies '1' to accept. UPI mandate set up in-flow. | Collections |
| 6 | Pre-payment meter conversion | Rev Risk >70, field visits >3 in last 6 months, chronic pattern | Pre-pay meter installation, security deposit top-up, consumer briefed on credit loading | Field Ops + Collections |

#### 4.2 DSM & Network Scenarios

| # | Scenario | Trigger Condition | Action | Owner |
|---|----------|------------------|--------|-------|
| 7 | DT overload DSM targeting | DT peak loading >90%, consumer Peak Impact >70, Flex Load >55, Engagement >45 | DR enrolment offer with incentive via app. Target flexible consumers on overloaded DTs first. | DSM Team |
| 8 | EV night tariff conversion | NILM EV = Y, peak coincidence High, Engagement >50, daytime charging detected | EV night tariff offer + smart charging schedule. Shift charging to 11pm–6am. | DSM / Commercial |
| 9 | DSM vs infrastructure upgrade decision | DT loading >85% | DSM path (>40% consumers Flex Score >60): run DR for 3 months, measure 15% peak reduction. Upgrade path (infra age >15 yrs + all loads non-flexible): trigger capex review. | Network Planning |
| 10 | Rooftop solar scheme targeting | Renewable Score >60, consumption >250 kWh, Engagement >45, residential own property | Solar subsidy offer via app. Net metering guide. State scheme eligibility check. | DSM / Commercial |
| 11 | Load violation revenue recovery | Load Violation = Y (3+ consecutive months), actual load >130% sanctioned | Field survey, load enhancement notice, retrospective charge recovery | Field Ops / Billing |
| 12 | TOD tariff migration | Peak Coincidence High, TOD Sensitivity Medium-High, smart meter installed, Engagement >50 | Personalised WhatsApp showing estimated TOD savings. Facilitate tariff change application. | Commercial / DSM |

#### 4.3 Customer Experience & Complaint Scenarios

| # | Scenario | Trigger Condition | Action | Owner |
|---|----------|------------------|--------|-------|
| 13 | Regulatory escalation pre-emption | Complaint Risk >75, Escalation Flag = Y, TAT >15 days, complaint open >20 days | Senior officer outreach within 24 hours. Fast-track SLA. Compensation consideration. Formal written response. Legal loop-in. | CX Head / Legal |
| 14 | Bill shock surge detection | Bill Shock = Y, bill variance vs 6-month avg >30%, new bill generated today | Proactive WhatsApp before consumer calls with plain-language slab breakdown | Billing Ops |
| 15 | Repeat complaint + consumption surge | Complaint Risk >65, Repeat = Y, Bill Shock = Y, consumption variance >40% | Meter accuracy test. Full billing audit. Senior billing officer outreach. Do not send collections notice. | Billing + Metering |
| 16 | Estimated billing elimination | Estimated bills ≥2 consecutive cycles, Complaint Risk >40 | Priority meter reading scheduling. Flag for smart meter installation. | Metering / Field Ops |

#### 4.4 Field Operations Scenarios

| # | Scenario | Trigger Condition | Action | Owner |
|---|----------|------------------|--------|-------|
| 17 | Field visit priority and routing | Rev Risk >70, Engagement <25, overdue >20 days, all digital channels exhausted | Cluster visits by DT/area. Agent sends WhatsApp 30 min before. Script includes name + amount + resolution options. | Field Ops |
| 18 | Repeat field visit elimination | Field visits >3 in last 6 months, Rev Risk consistently >65 | Root cause: willful (pre-pay meter) or structural access issue (registered letter + landlord contact) | Field Ops + Collections |
| 19 | Pre-disconnection final nudge | Overdue = Day 28–29, Rev Risk >70 | Final WhatsApp + SMS with amount and payment link. State disconnection occurs tomorrow. Highest conversion moment. | Collections |

#### 4.5 Auto-Debit & Engagement Scenarios

| # | Scenario | Trigger Condition | Action | Owner |
|---|----------|------------------|--------|-------|
| 20 | Auto-debit conversion | UPI regular user, auto-debit not set up, 1–3 defaults/year | Guided setup flow in app or BBPS with monthly cap consent | Digital / CX |
| 21 | Digital channel migration | Payment: cash/counter, Engagement 20–40, smartphone in CRM | Field agent or CSC staff guides first digital payment on-site. Follow up with WhatsApp setup. | Field Ops / Digital |
| 22 | Best contact time optimisation | Engagement: Any, best contact time available from app data | Schedule all reminders at known best contact time window | Digital / Collections |

#### 4.6 Combined Multi-Persona Scenarios

| # | Scenario | Trigger Condition | Action | Owner |
|---|----------|------------------|--------|-------|
| 23 | High complaint + consumption surge | Complaint Risk >65, Bill Shock = Y, consumption >150% of 6-month avg, Repeat = Y | Do not send collections notice. Meter test + billing audit. Senior officer outreach. Prevent regulatory escalation. | Billing + CX + Collections |
| 24 | EV + peak stressor + DR opportunity | NILM EV = Y, Peak Impact >75, Flex Load >60, Engagement >55 | EV night tariff + smart charging + DR enrolment simultaneously. Personalised savings projection. | DSM + Commercial |

---

### Phase 5 — Dashboard (React Frontend)

| # | Screen | What It Shows |
|---|--------|---------------|
| 5.1 | Consumer 360 View | 6 score gauges, persona badge, active action, payment trend (12 months), complaint history, engagement trend, best contact time, action buttons |
| 5.2 | Portfolio Overview | Persona distribution across full consumer base, KPI summary cards, area/DT heat map, month-on-month segment trends |
| 5.3 | Action Queue Board | Kanban board of pending actions per team. Columns: Collections, DSM, Field Ops, CX, Billing. Priority sort. Bulk action capability. |
| 5.4 | DT / Feeder View | Per-DT: consumer list with Peak Impact scores, DR candidate count, load status, DSM vs upgrade recommendation, capex deferral estimate |
| 5.5 | KPI Tracker | 12 KPIs with targets, actuals, trend sparklines. RAG status. Updated after each billing cycle. |
| 5.6 | Persona Drill-Down | Per-persona: consumer count, score distribution, top triggered scenarios, recent intervention outcomes, month-on-month trend |
| 5.7 | Decision Matrix Visualiser | Interactive 3×3 grid for each of the 3 matrices. Click any cell to see all consumers in that quadrant with recommended actions. |
| 5.8 | Intervention Log | Every action dispatched: timestamp, channel, consumer, scenario, agent/system. Outcome recorded after resolution. |

**UX Principles:**
- No score jargon surfaced to field and CX users — show plain English context and a single next action
- One recommended action per consumer — the engine decides; officers can override with reason logged
- Act from wherever you are — every consumer card has action buttons without requiring navigation
- Chatbot is context-aware — if you are on DT-47's page and ask a question, the chatbot knows which DT you mean
- Every AI answer shows its reasoning — score inputs and rule that fired, so teams trust and can override

---

### Phase 6 — Chatbot LLM Layer

| # | Action | Detail |
|---|--------|--------|
| 6.1 | LLM architecture | Claude API (claude-sonnet-4-6) with tool use. System prompt encodes the full persona framework rules, score definitions, and action scenarios. |
| 6.2 | Tool definitions | `get_consumer_profile(consumer_id)`, `list_consumers_by_persona(persona, filters)`, `get_dt_summary(dt_id)`, `get_area_summary(circle, area)`, `get_pending_actions(team, priority)`, `trigger_action(consumer_id, scenario_id, channel)`, `get_kpi_status()`, `simulate_dsm_impact(dt_id, consumer_ids)` |
| 6.3 | Consumer-level queries | "Why is consumer 12345 flagged as high risk?" → returns score breakdown + rule that fired + recommended action |
| 6.4 | Portfolio-level queries | "Show all Ombudsman-risk consumers in Circle 3" → filtered, ranked list |
| 6.5 | Action recommendation queries | "What should field ops do today in Whitefield?" → ranked action list from scenario engine |
| 6.6 | DSM/network queries | "Which DTs are overloaded and have DSM-addressable load?" → DT × scenario matrix answer |
| 6.7 | Simulation queries | "If we enrol these 50 consumers in DR, what is the projected peak reduction on DT-47?" |
| 6.8 | Action initiation via chat | "Send WhatsApp reminder to all Accidental Late Payers in Batch 3 due today" → chatbot confirms count and cost → user approves → action dispatched |
| 6.9 | Explainability standard | Every response cites exact score inputs and the rule that fired. No recommendation without a traceable reason. |
| 6.10 | Chat UI | Embedded panel in dashboard sidebar. Context-aware (knows current page). Suggested quick prompts per page. Persistent session history. |

---

### Phase 7 — Action Execution Layer

| # | Action | Detail |
|---|--------|--------|
| 7.1 | WhatsApp integration | WhatsApp Business API connector for D-3 reminders, instalment offers, EV tariff offers, bill shock explanations, pre-disconnection nudges |
| 7.2 | IVR trigger | Outbound IVR via Twilio for medium/low engagement defaulters who do not respond to WhatsApp |
| 7.3 | Field visit scheduler | Assigns field agents to visit clusters by DT/area. Generates route-optimised daily list. Integrates with mobile app. |
| 7.4 | CRM push | Writes persona, scores, active scenario, and recommended action back to DISCOM CRM so call centre agents see consistent view |
| 7.5 | App push notifications | For DR enrolment offers, rooftop solar scheme, EV night tariff, loyalty rewards |
| 7.6 | Execution audit log | Every action dispatch logged: timestamp, channel, consumer ID, scenario ID, agent or system, message content hash |

---

### Phase 8 — Feedback Loop & Continuous Improvement

| # | Action | Detail |
|---|--------|--------|
| 8.1 | Intervention outcome capture | Each action tagged with result: paid within 48h, enrolled in DR, complaint resolved, escalated, not responded. Feeds KPI tracker. |
| 8.2 | KPI measurement automation | Monthly automated report vs targets for all 12 KPIs. Trend analysis. Alert if KPI crosses amber threshold. |
| 8.3 | Threshold tuning module | Admin interface to adjust score thresholds and re-run shadow scoring — no code deployment required |
| 8.4 | A/B testing framework | Split consumers within a persona to test two action variants. Measure conversion difference. Promote winner after statistical significance. |
| 8.5 | Persona drift alerts | Flag any consumer whose primary persona changes by 2+ tiers month-on-month. Surfaces unusual patterns for investigation. |

---

## 7. Build Sequence & Timeline

| Week | Milestone |
|------|-----------|
| 1–2 | Consumer 360 data schema + mock data generator covering all 18 persona types |
| 3–4 | 6 scoring algorithms with unit tests using known consumer scenarios |
| 5–6 | 18 persona rules + 24 scenario triggers with decision matrices |
| 7–8 | FastAPI layer: consumer profile, persona, action queue, DT summary endpoints |
| 9–11 | React dashboard: Consumer 360 + Portfolio + Action Queue + DT view |
| 12–13 | Chatbot: LLM tool-use layer + chat UI panel embedded in dashboard |
| 14–15 | Action execution: WhatsApp, IVR, CRM push connectors |
| 16 | Feedback loop: outcome logger + KPI tracker + threshold tuning admin |
| 17–18 | Shadow scoring on live data for 2 billing cycles. Threshold validation. |
| 19–20 | Rollout to pilot circle. Training. KPI baseline measurement. |

---

## 8. KPIs to Track

| KPI | Target | Domain | Notes |
|-----|--------|--------|-------|
| Days Sales Outstanding (DSO) | < 30 days | Collections | Overall collection health indicator |
| Accidental default rate | < 5% per month | Collections | Pre-due-date communication effectiveness |
| Day 15 message payment conversion | > 55% | Collections | % who pay within 48 hrs of Day 15 overdue notice |
| Field visit resolution rate | > 70% | Field Ops | % of field visits resulting in same-visit payment or plan |
| DR programme enrolment rate | > 15% of eligible consumers | DSM | Flexible load consumers enrolled in Demand Response |
| DT peak load reduction post-DSM | > 15% within 3 months | DSM / Network | Validates DSM-first protocol before upgrade approval |
| Dispute resolution time | < 15 days | CX / Billing | Days from ticket raise to revised bill issuance |
| Regulatory escalation rate | < 0.5% of complaints | CX / Legal | Complaints that reach Ombudsman or SERC |
| Reconnection time (urban) | < 24 hours | Field Ops | Post-payment reconnection SLA |
| Auto-debit enrolment rate | > 20% of consumer base | Digital | Best long-term default prevention metric |
| Write-off ratio | < 0.8% of billed revenue | Finance | Uncollectable debt as % of revenue |
| Persona drift alert response time | < 48 hours | Operations | Time from drift alert to investigation initiated |

---

*Document version: 1.0 — April 2026*
*Framework source: Consumer Persona & Scenario Intelligence Framework v1.0*
*For implementation queries contact: Revenue Assurance & CX Strategy team*
