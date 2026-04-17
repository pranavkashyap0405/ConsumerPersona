from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app import models

router = APIRouter(prefix="/portfolio", tags=["portfolio"])
MONTH = "2026-04"


@router.get("/summary")
def portfolio_summary(db: Session = Depends(get_db)):
    total = db.query(models.ConsumerMaster).count()

    # Persona distribution
    persona_dist = db.query(
        models.ConsumerPersona.primary_persona_key,
        models.ConsumerPersona.primary_persona,
        func.count(models.ConsumerPersona.id).label("count")
    ).filter_by(billing_month=MONTH).group_by(
        models.ConsumerPersona.primary_persona_key,
        models.ConsumerPersona.primary_persona
    ).all()

    # Revenue risk breakdown
    scores = db.query(models.ConsumerScore).filter_by(billing_month=MONTH).all()
    rev_breakdown = {"safe": 0, "watch": 0, "enforce": 0}
    eng_breakdown = {"offline": 0, "partial_digital": 0, "digital_first": 0}
    total_overdue = 0
    overdue_count = 0
    reg_risk_count = 0

    for s in scores:
        if s.revenue_risk_score <= 30:
            rev_breakdown["safe"] += 1
        elif s.revenue_risk_score <= 65:
            rev_breakdown["watch"] += 1
        else:
            rev_breakdown["enforce"] += 1

        if s.engagement_score <= 30:
            eng_breakdown["offline"] += 1
        elif s.engagement_score <= 65:
            eng_breakdown["partial_digital"] += 1
        else:
            eng_breakdown["digital_first"] += 1

        if s.total_arrears > 0:
            total_overdue += s.total_arrears
            overdue_count += 1

        if s.regulatory_risk_flag:
            reg_risk_count += 1

    # Pending actions by team
    actions_by_team = db.query(
        models.ActionQueue.team,
        func.count(models.ActionQueue.id).label("count")
    ).filter_by(status="pending").group_by(models.ActionQueue.team).all()

    # Top scenarios
    top_scenarios = db.query(
        models.ActionQueue.scenario_id,
        models.ActionQueue.scenario_name,
        func.count(models.ActionQueue.id).label("count")
    ).filter_by(status="pending").group_by(
        models.ActionQueue.scenario_id,
        models.ActionQueue.scenario_name
    ).order_by(func.count(models.ActionQueue.id).desc()).limit(5).all()

    return {
        "total_consumers": total,
        "persona_distribution": [
            {"key": p.primary_persona_key, "name": p.primary_persona, "count": p.count}
            for p in persona_dist
        ],
        "revenue_risk_breakdown": rev_breakdown,
        "engagement_breakdown": eng_breakdown,
        "total_overdue_amount": round(total_overdue, 2),
        "consumers_overdue": overdue_count,
        "regulatory_risk_count": reg_risk_count,
        "pending_actions_by_team": {a.team: a.count for a in actions_by_team},
        "top_scenarios_triggered": [
            {"scenario_id": s.scenario_id, "name": s.scenario_name, "count": s.count}
            for s in top_scenarios
        ],
    }


@router.get("/circles")
def circles_summary(db: Session = Depends(get_db)):
    circles = db.query(
        models.ConsumerMaster.circle,
        func.count(models.ConsumerMaster.id).label("consumer_count")
    ).group_by(models.ConsumerMaster.circle).all()

    result = []
    for c in circles:
        overdue = db.query(func.sum(models.ConsumerScore.total_arrears)).join(
            models.ConsumerMaster,
            models.ConsumerScore.consumer_id == models.ConsumerMaster.id
        ).filter(
            models.ConsumerMaster.circle == c.circle,
            models.ConsumerScore.billing_month == MONTH
        ).scalar() or 0

        reg_risk = db.query(func.count(models.ConsumerScore.id)).join(
            models.ConsumerMaster,
            models.ConsumerScore.consumer_id == models.ConsumerMaster.id
        ).filter(
            models.ConsumerMaster.circle == c.circle,
            models.ConsumerScore.billing_month == MONTH,
            models.ConsumerScore.regulatory_risk_flag == True
        ).scalar() or 0

        result.append({
            "circle": c.circle,
            "consumer_count": c.consumer_count,
            "total_overdue": round(overdue, 2),
            "regulatory_risk_count": reg_risk,
        })
    return result
