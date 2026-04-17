from pydantic import BaseModel
from typing import Optional, List
from datetime import date, datetime


class ScoreOut(BaseModel):
    revenue_risk_score: float
    peak_impact_score: float
    complaint_risk_score: float
    engagement_score: float
    dsm_readiness_score: float
    regulatory_risk_flag: bool
    bill_shock_flag: bool
    bill_variance_pct: float
    days_overdue: int
    total_arrears: float
    billing_month: str

    # Score tier labels
    revenue_risk_tier: str = ""
    peak_impact_tier: str = ""
    complaint_risk_tier: str = ""
    engagement_tier: str = ""
    dsm_readiness_tier: str = ""

    model_config = {"from_attributes": True}


class PersonaOut(BaseModel):
    primary_persona: str
    primary_persona_key: str
    secondary_persona: Optional[str]
    secondary_persona_key: Optional[str]
    billing_month: str

    model_config = {"from_attributes": True}


class ActionOut(BaseModel):
    id: int
    scenario_id: int
    scenario_name: str
    recommended_action: str
    team: str
    priority: str
    channel: str
    status: str
    billing_month: str
    created_at: datetime
    outcome: Optional[str]

    model_config = {"from_attributes": True}


class ConsumerSummary(BaseModel):
    id: int
    consumer_number: str
    name: str
    circle: str
    area: str
    consumer_type: str
    monthly_bill_bucket: str
    primary_persona: Optional[str]
    primary_persona_key: Optional[str]
    revenue_risk_score: Optional[float]
    engagement_score: Optional[float]
    days_overdue: Optional[int]
    total_arrears: Optional[float]

    model_config = {"from_attributes": True}


class Consumer360(BaseModel):
    id: int
    consumer_number: str
    name: str
    address: str
    circle: str
    area: str
    consumer_type: str
    sanctioned_load_kw: float
    phone: str
    has_smartphone: bool
    property_type: str
    monthly_bill_bucket: str
    dt_name: Optional[str]
    latest_scores: Optional[ScoreOut]
    latest_persona: Optional[PersonaOut]
    active_actions: List[ActionOut]
    payment_trend: List[dict]
    complaint_summary: dict
    engagement_summary: dict

    model_config = {"from_attributes": True}


class DTSummary(BaseModel):
    id: int
    dt_code: str
    name: str
    circle: str
    area: str
    capacity_kva: float
    current_peak_load_pct: float
    age_years: int
    consumer_count: int
    dr_candidates: int
    peak_stressors: int
    infrastructure_triggers: int
    avg_peak_impact: float
    recommended_protocol: str

    model_config = {"from_attributes": True}


class KPIOut(BaseModel):
    kpi_key: str
    kpi_name: str
    month: str
    target: float
    actual: Optional[float]
    unit: str
    domain: str
    rag_status: Optional[str]

    model_config = {"from_attributes": True}


class ActionOutcomeIn(BaseModel):
    outcome: str
    outcome_notes: Optional[str] = None


class ChatMessage(BaseModel):
    message: str
    session_id: Optional[str] = None


class ChatResponse(BaseModel):
    response: str
    session_id: str
    tool_calls_made: List[str] = []


class PortfolioSummary(BaseModel):
    total_consumers: int
    persona_distribution: dict
    revenue_risk_breakdown: dict
    engagement_breakdown: dict
    total_overdue_amount: float
    consumers_overdue: int
    regulatory_risk_count: int
    pending_actions_by_team: dict
    top_scenarios_triggered: List[dict]
