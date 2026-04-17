# DISCOM Consumer Persona Intelligence Application

Full-stack application implementing the Consumer Persona & Scenario Intelligence Framework v1.0.

## Quick Start

```
Double-click start.bat
```

Or manually:

```bash
# Backend
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000

# Frontend (new terminal)
cd frontend
npm install
npm run dev
```

Then open http://localhost:5173 and click **Seed Demo Data**.

## Add the AI Chatbot

Add your Anthropic API key to `backend/.env`:
```
ANTHROPIC_API_KEY=sk-ant-...
```

## Structure

```
backend/
  app/
    main.py              — FastAPI app entry point
    models.py            — SQLAlchemy ORM models
    seed.py              — Mock data generator (200 consumers, all 18 personas)
    scoring/engine.py    — 6 scoring algorithms
    persona/engine.py    — 18 personas, 12 priority rules
    scenarios/engine.py  — 24 action routing scenarios
    chatbot/agent.py     — Claude API tool-use agent
    routers/             — FastAPI route handlers

frontend/
  src/
    pages/
      Dashboard.jsx      — Portfolio overview + KPI summary
      ConsumerList.jsx   — Searchable consumer table
      Consumer360.jsx    — Full consumer profile with scores + actions
      ActionQueue.jsx    — Kanban by team (Collections, DSM, Field Ops, CX...)
      DTView.jsx         — DT/Feeder load + DR candidate view
      KPITracker.jsx     — 12 KPIs with RAG status
    components/
      Chatbot.jsx        — AI assistant panel (Claude API)
      ScoreGauge.jsx     — Radial score visualiser
      PersonaBadge.jsx   — Colour-coded persona tag
      ActionCard.jsx     — Action item with dispatch/outcome buttons
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | /api/consumers | List consumers with filters |
| GET | /api/consumers/{id} | Consumer 360 view |
| GET | /api/portfolio/summary | Portfolio stats |
| GET | /api/actions | Action queue |
| POST | /api/actions/{id}/dispatch | Dispatch an action |
| POST | /api/actions/{id}/outcome | Log outcome |
| GET | /api/dt | DT list with load status |
| GET | /api/dt/{id} | DT detail with consumer list |
| GET | /api/kpis | KPI tracker |
| POST | /api/chat | Chatbot (requires API key) |
| POST | /api/seed | Seed 200 mock consumers |
