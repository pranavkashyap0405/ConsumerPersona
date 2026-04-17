from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import Optional, List
from app.database import get_db
from app import models

router = APIRouter(prefix="/consumers", tags=["consumers"])


@router.get("")
def list_consumers(
    db: Session = Depends(get_db),
    circle: Optional[str] = None,
    area: Optional[str] = None,
    persona: Optional[str] = None,
    team: Optional[str] = None,
    min_rev_risk: Optional[float] = None,
    search: Optional[str] = None,
    limit: int = Query(50, le=200),
    offset: int = 0,
):
    q = db.query(
        models.ConsumerMaster,
        models.ConsumerPersona,
        models.ConsumerScore,
    ).outerjoin(
        models.ConsumerPersona,
        (models.ConsumerPersona.consumer_id == models.ConsumerMaster.id) &
        (models.ConsumerPersona.billing_month == "2026-04")
    ).outerjoin(
        models.ConsumerScore,
        (models.ConsumerScore.consumer_id == models.ConsumerMaster.id) &
        (models.ConsumerScore.billing_month == "2026-04")
    )

    if circle:
        q = q.filter(models.ConsumerMaster.circle == circle)
    if area:
        q = q.filter(models.ConsumerMaster.area == area)
    if persona:
        q = q.filter(models.ConsumerPersona.primary_persona_key == persona)
    if min_rev_risk is not None:
        q = q.filter(models.ConsumerScore.revenue_risk_score >= min_rev_risk)
    if search:
        q = q.filter(
            models.ConsumerMaster.name.ilike(f"%{search}%") |
            models.ConsumerMaster.consumer_number.ilike(f"%{search}%")
        )

    total = q.count()
    results = q.offset(offset).limit(limit).all()

    consumers = []
    for c, p, s in results:
        consumers.append({
            "id": c.id,
            "consumer_number": c.consumer_number,
            "name": c.name,
            "circle": c.circle,
            "area": c.area,
            "consumer_type": c.consumer_type,
            "monthly_bill_bucket": c.monthly_bill_bucket,
            "primary_persona": p.primary_persona if p else None,
            "primary_persona_key": p.primary_persona_key if p else None,
            "revenue_risk_score": s.revenue_risk_score if s else None,
            "engagement_score": s.engagement_score if s else None,
            "days_overdue": s.days_overdue if s else 0,
            "total_arrears": s.total_arrears if s else 0,
            "regulatory_risk_flag": s.regulatory_risk_flag if s else False,
        })

    return {"total": total, "consumers": consumers}


@router.get("/{consumer_id}")
def get_consumer_360(consumer_id: int, db: Session = Depends(get_db)):
    consumer = db.query(models.ConsumerMaster).filter_by(id=consumer_id).first()
    if not consumer:
        raise HTTPException(404, "Consumer not found")

    dt = db.query(models.DTMaster).filter_by(id=consumer.dt_id).first()

    score = db.query(models.ConsumerScore).filter_by(
        consumer_id=consumer_id, billing_month="2026-04"
    ).first()

    persona = db.query(models.ConsumerPersona).filter_by(
        consumer_id=consumer_id, billing_month="2026-04"
    ).first()

    actions = db.query(models.ActionQueue).filter_by(
        consumer_id=consumer_id, status="pending"
    ).order_by(desc(models.ActionQueue.created_at)).limit(10).all()

    # Payment trend (last 12 months)
    payments = db.query(models.PaymentHistory, models.BillingMonthly).join(
        models.BillingMonthly,
        (models.BillingMonthly.consumer_id == models.PaymentHistory.consumer_id) &
        (models.BillingMonthly.billing_month == models.PaymentHistory.billing_month)
    ).filter(
        models.PaymentHistory.consumer_id == consumer_id
    ).order_by(models.PaymentHistory.billing_month).all()

    payment_trend = [
        {
            "month": p.billing_month,
            "bill_amount": b.bill_amount,
            "amount_paid": p.amount_paid,
            "days_after_due": p.days_after_due,
            "channel": p.payment_channel,
        }
        for p, b in payments[-12:]
    ]

    # Complaint summary
    complaints = db.query(models.ComplaintLog).filter_by(consumer_id=consumer_id).all()
    open_complaints = [c for c in complaints if c.status == "open"]
    avg_tat = sum(c.days_to_resolve or 0 for c in complaints if c.days_to_resolve) / max(len(complaints), 1)

    # Engagement
    engagement = db.query(models.EngagementLog).filter_by(
        consumer_id=consumer_id, month="2026-04"
    ).first()

    def score_tiers(s):
        if not s:
            return {}
        from app.scoring.engine import (
            revenue_risk_tier, peak_impact_tier, complaint_risk_tier,
            engagement_tier, dsm_readiness_tier
        )
        return {
            "revenue_risk_tier": revenue_risk_tier(s.revenue_risk_score),
            "peak_impact_tier": peak_impact_tier(s.peak_impact_score),
            "complaint_risk_tier": complaint_risk_tier(s.complaint_risk_score),
            "engagement_tier": engagement_tier(s.engagement_score),
            "dsm_readiness_tier": dsm_readiness_tier(s.dsm_readiness_score),
        }

    tiers = score_tiers(score)

    return {
        "id": consumer.id,
        "consumer_number": consumer.consumer_number,
        "name": consumer.name,
        "address": consumer.address,
        "circle": consumer.circle,
        "area": consumer.area,
        "consumer_type": consumer.consumer_type,
        "sanctioned_load_kw": consumer.sanctioned_load_kw,
        "phone": consumer.phone,
        "has_smartphone": consumer.has_smartphone,
        "property_type": consumer.property_type,
        "monthly_bill_bucket": consumer.monthly_bill_bucket,
        "dt_name": dt.name if dt else None,
        "dt_code": dt.dt_code if dt else None,
        "latest_scores": {
            "revenue_risk_score": score.revenue_risk_score if score else 0,
            "peak_impact_score": score.peak_impact_score if score else 0,
            "complaint_risk_score": score.complaint_risk_score if score else 0,
            "engagement_score": score.engagement_score if score else 0,
            "dsm_readiness_score": score.dsm_readiness_score if score else 0,
            "regulatory_risk_flag": score.regulatory_risk_flag if score else False,
            "bill_shock_flag": score.bill_shock_flag if score else False,
            "bill_variance_pct": score.bill_variance_pct if score else 0,
            "days_overdue": score.days_overdue if score else 0,
            "total_arrears": score.total_arrears if score else 0,
            "billing_month": "2026-04",
            **tiers,
        } if score else None,
        "latest_persona": {
            "primary_persona": persona.primary_persona,
            "primary_persona_key": persona.primary_persona_key,
            "secondary_persona": persona.secondary_persona,
            "secondary_persona_key": persona.secondary_persona_key,
            "billing_month": persona.billing_month,
        } if persona else None,
        "active_actions": [
            {
                "id": a.id,
                "scenario_id": a.scenario_id,
                "scenario_name": a.scenario_name,
                "recommended_action": a.recommended_action,
                "team": a.team,
                "priority": a.priority,
                "channel": a.channel,
                "status": a.status,
                "billing_month": a.billing_month,
                "created_at": a.created_at.isoformat(),
                "outcome": a.outcome,
            }
            for a in actions
        ],
        "payment_trend": payment_trend,
        "complaint_summary": {
            "total": len(complaints),
            "open": len(open_complaints),
            "avg_resolution_days": round(avg_tat, 1),
            "has_escalation": any(c.escalation_flag for c in complaints),
            "repeat": any(c.repeat_flag for c in complaints),
        },
        "engagement_summary": {
            "app_logins": engagement.app_logins if engagement else 0,
            "notification_opens": engagement.notification_opens if engagement else 0,
            "preferred_channel": engagement.preferred_channel if engagement else "unknown",
            "best_contact_time": engagement.best_contact_time if engagement else "evening",
            "digital_payment": engagement.digital_payment_flag if engagement else False,
            "whatsapp_responsive": engagement.whatsapp_responsive if engagement else False,
        },
    }
