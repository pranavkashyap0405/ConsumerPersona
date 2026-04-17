from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import os
from dotenv import load_dotenv

load_dotenv()

from app.database import engine, Base, get_db
from app.routers import consumers, portfolio, actions, dt, kpis, chat
import app.models  # ensure models are registered

Base.metadata.create_all(bind=engine)

# Auto-seed on startup if database is empty (needed for Render cold starts)
def _auto_seed():
    from app.database import SessionLocal
    from app import models as m
    from app.seed import seed_dts, seed_consumers
    db = SessionLocal()
    try:
        if db.query(m.ConsumerMaster).count() == 0:
            dts = seed_dts(db)
            seed_consumers(db, dts, total=200)
    finally:
        db.close()

_auto_seed()

app = FastAPI(
    title="DISCOM Consumer Persona Intelligence API",
    version="1.0.0",
    description="Consumer scoring, persona assignment, action routing, and LLM chatbot for DISCOM operations.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Restrict to your Netlify URL in production via FRONTEND_URL env var
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(consumers.router, prefix="/api")
app.include_router(portfolio.router, prefix="/api")
app.include_router(actions.router, prefix="/api")
app.include_router(dt.router, prefix="/api")
app.include_router(kpis.router, prefix="/api")
app.include_router(chat.router, prefix="/api")


@app.get("/")
def root():
    return {"status": "DISCOM Persona Intelligence API running", "docs": "/docs"}


@app.post("/api/seed")
def seed_data(db: Session = Depends(get_db)):
    from app.seed import seed_dts, seed_consumers
    # Check if already seeded
    from app import models as m
    if db.query(m.ConsumerMaster).count() > 0:
        return {"status": "already_seeded", "consumers": db.query(m.ConsumerMaster).count()}
    dts = seed_dts(db)
    result = seed_consumers(db, dts, total=200)
    return result


@app.delete("/api/seed")
def clear_data(db: Session = Depends(get_db)):
    """Clear all data for re-seeding."""
    from app import models as m
    db.query(m.ActionQueue).delete()
    db.query(m.ConsumerPersona).delete()
    db.query(m.ConsumerScore).delete()
    db.query(m.EngagementLog).delete()
    db.query(m.MeterReading).delete()
    db.query(m.ComplaintLog).delete()
    db.query(m.PaymentHistory).delete()
    db.query(m.BillingMonthly).delete()
    db.query(m.ConsumerMaster).delete()
    db.query(m.DTMaster).delete()
    db.query(m.KPITracking).delete()
    db.commit()
    return {"status": "cleared"}
