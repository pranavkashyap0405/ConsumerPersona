from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app import models

router = APIRouter(prefix="/kpis", tags=["kpis"])


@router.get("")
def get_kpis(db: Session = Depends(get_db)):
    kpis = db.query(models.KPITracking).filter_by(month="2026-04").all()
    return [
        {
            "kpi_key": k.kpi_key,
            "kpi_name": k.kpi_name,
            "month": k.month,
            "target": k.target,
            "actual": k.actual,
            "unit": k.unit,
            "domain": k.domain,
            "rag_status": k.rag_status,
        }
        for k in kpis
    ]
