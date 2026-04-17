from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import Optional
from datetime import datetime
from app.database import get_db
from app import models

router = APIRouter(prefix="/actions", tags=["actions"])


@router.get("")
def list_actions(
    db: Session = Depends(get_db),
    team: Optional[str] = None,
    priority: Optional[str] = None,
    status: str = "pending",
    scenario_id: Optional[int] = None,
    limit: int = Query(100, le=500),
    offset: int = 0,
):
    q = db.query(models.ActionQueue, models.ConsumerMaster).join(
        models.ConsumerMaster,
        models.ActionQueue.consumer_id == models.ConsumerMaster.id
    ).filter(models.ActionQueue.status == status)

    if team:
        q = q.filter(models.ActionQueue.team == team)
    if priority:
        q = q.filter(models.ActionQueue.priority == priority)
    if scenario_id:
        q = q.filter(models.ActionQueue.scenario_id == scenario_id)

    total = q.count()
    results = q.order_by(
        models.ActionQueue.priority.desc(),
        desc(models.ActionQueue.created_at)
    ).offset(offset).limit(limit).all()

    return {
        "total": total,
        "actions": [
            {
                "id": a.id,
                "consumer_id": a.consumer_id,
                "consumer_name": c.name,
                "consumer_number": c.consumer_number,
                "circle": c.circle,
                "area": c.area,
                "monthly_bill_bucket": c.monthly_bill_bucket,
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
            for a, c in results
        ],
    }


@router.post("/{action_id}/dispatch")
def dispatch_action(action_id: int, db: Session = Depends(get_db)):
    action = db.query(models.ActionQueue).filter_by(id=action_id).first()
    if not action:
        return {"error": "Not found"}
    action.status = "dispatched"
    action.dispatched_at = datetime.utcnow()
    db.commit()
    return {"status": "dispatched", "id": action_id}


@router.post("/{action_id}/outcome")
def log_outcome(action_id: int, outcome: str, notes: Optional[str] = None, db: Session = Depends(get_db)):
    action = db.query(models.ActionQueue).filter_by(id=action_id).first()
    if not action:
        return {"error": "Not found"}
    action.status = "completed"
    action.outcome = outcome
    action.outcome_notes = notes
    action.completed_at = datetime.utcnow()
    db.commit()
    return {"status": "completed", "outcome": outcome}
