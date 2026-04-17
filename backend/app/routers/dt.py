from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app import models

router = APIRouter(prefix="/dt", tags=["dt"])
MONTH = "2026-04"


@router.get("")
def list_dts(db: Session = Depends(get_db)):
    dts = db.query(models.DTMaster).all()
    result = []
    for dt in dts:
        consumers = db.query(models.ConsumerMaster).filter_by(dt_id=dt.id).all()
        consumer_ids = [c.id for c in consumers]

        if not consumer_ids:
            result.append({
                "id": dt.id, "dt_code": dt.dt_code, "name": dt.name,
                "circle": dt.circle, "area": dt.area,
                "capacity_kva": dt.capacity_kva,
                "current_peak_load_pct": dt.current_peak_load_pct,
                "age_years": dt.age_years,
                "consumer_count": 0,
                "dr_candidates": 0, "peak_stressors": 0,
                "infrastructure_triggers": 0, "avg_peak_impact": 0,
                "recommended_protocol": "monitor",
            })
            continue

        scores = db.query(models.ConsumerScore).filter(
            models.ConsumerScore.consumer_id.in_(consumer_ids),
            models.ConsumerScore.billing_month == MONTH
        ).all()

        dr_candidates = sum(1 for s in scores if s.dsm_readiness_score >= 60 and s.peak_impact_score > 40)
        peak_stressors = sum(1 for s in scores if s.peak_impact_score > 70)
        infra_triggers = sum(1 for s in scores if s.peak_impact_score > 70 and s.dsm_readiness_score < 35)
        avg_peak = sum(s.peak_impact_score for s in scores) / max(len(scores), 1)

        # Recommend protocol
        flex_fraction = dr_candidates / max(len(scores), 1)
        if dt.current_peak_load_pct > 90 and flex_fraction >= 0.4:
            protocol = "DSM-first: Run DR programme for 3 months before capex decision"
        elif dt.current_peak_load_pct > 85 and dt.age_years > 15 and flex_fraction < 0.2:
            protocol = "Infrastructure upgrade review recommended"
        elif dt.current_peak_load_pct > 75:
            protocol = "DSM-first: Monitor and enrol flexible consumers"
        else:
            protocol = "Stable — no immediate action"

        result.append({
            "id": dt.id,
            "dt_code": dt.dt_code,
            "name": dt.name,
            "circle": dt.circle,
            "area": dt.area,
            "capacity_kva": dt.capacity_kva,
            "current_peak_load_pct": dt.current_peak_load_pct,
            "age_years": dt.age_years,
            "consumer_count": len(consumers),
            "dr_candidates": dr_candidates,
            "peak_stressors": peak_stressors,
            "infrastructure_triggers": infra_triggers,
            "avg_peak_impact": round(avg_peak, 1),
            "recommended_protocol": protocol,
        })

    return sorted(result, key=lambda x: x["current_peak_load_pct"], reverse=True)


@router.get("/{dt_id}")
def get_dt_detail(dt_id: int, db: Session = Depends(get_db)):
    dt = db.query(models.DTMaster).filter_by(id=dt_id).first()
    if not dt:
        return {"error": "DT not found"}

    consumers = db.query(
        models.ConsumerMaster,
        models.ConsumerScore,
        models.ConsumerPersona,
    ).outerjoin(
        models.ConsumerScore,
        (models.ConsumerScore.consumer_id == models.ConsumerMaster.id) &
        (models.ConsumerScore.billing_month == MONTH)
    ).outerjoin(
        models.ConsumerPersona,
        (models.ConsumerPersona.consumer_id == models.ConsumerMaster.id) &
        (models.ConsumerPersona.billing_month == MONTH)
    ).filter(models.ConsumerMaster.dt_id == dt_id).all()

    consumer_list = [
        {
            "id": c.id,
            "name": c.name,
            "consumer_number": c.consumer_number,
            "peak_impact_score": s.peak_impact_score if s else 0,
            "dsm_readiness_score": s.dsm_readiness_score if s else 0,
            "revenue_risk_score": s.revenue_risk_score if s else 0,
            "engagement_score": s.engagement_score if s else 0,
            "primary_persona": p.primary_persona if p else None,
            "primary_persona_key": p.primary_persona_key if p else None,
            "days_overdue": s.days_overdue if s else 0,
        }
        for c, s, p in consumers
    ]

    return {
        "id": dt.id,
        "dt_code": dt.dt_code,
        "name": dt.name,
        "circle": dt.circle,
        "area": dt.area,
        "capacity_kva": dt.capacity_kva,
        "current_peak_load_pct": dt.current_peak_load_pct,
        "age_years": dt.age_years,
        "consumers": consumer_list,
    }
