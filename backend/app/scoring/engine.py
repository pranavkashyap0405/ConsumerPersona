"""
Scoring Engine — 6 scoring dimensions per the framework.
Each function receives raw consumer data and returns a score (0-100) or flag (Y/N).
"""
from typing import List, Optional
import math


# ─────────────────────────────────────────────
# 1. Revenue Risk Score (0-100)
# Tiers: 0-30 Safe | 31-65 Watch | 66-100 Enforce
# ─────────────────────────────────────────────

def compute_revenue_risk(
    payment_records: List[dict],  # last 12 months: {days_after_due, amount_paid, amount_overdue}
    current_arrears: float,
    current_days_overdue: int,
) -> float:
    score = 0.0

    if not payment_records:
        return 50.0

    # Default frequency (each default in last 12 months adds to risk)
    defaults = sum(1 for p in payment_records if p.get("days_after_due", 0) > 15 or p.get("amount_paid", 1) == 0)
    score += min(defaults * 12, 48)

    # Current overdue severity
    if current_days_overdue > 45:
        score += 30
    elif current_days_overdue > 30:
        score += 22
    elif current_days_overdue > 15:
        score += 14
    elif current_days_overdue > 7:
        score += 7

    # Arrears relative to average bill
    bills = [p.get("bill_amount", 0) for p in payment_records if p.get("bill_amount", 0) > 0]
    avg_bill = sum(bills) / len(bills) if bills else 500
    if avg_bill > 0:
        arrears_ratio = current_arrears / avg_bill
        if arrears_ratio > 3:
            score += 20
        elif arrears_ratio > 2:
            score += 12
        elif arrears_ratio > 1:
            score += 6

    # Recent payment consistency (last 3 months)
    recent = payment_records[-3:] if len(payment_records) >= 3 else payment_records
    on_time_recent = sum(1 for p in recent if p.get("days_after_due", 99) <= 3 and p.get("amount_paid", 0) > 0)
    if on_time_recent == len(recent):
        score = max(score - 15, 0)

    return min(round(score, 1), 100.0)


def revenue_risk_tier(score: float) -> str:
    if score <= 30:
        return "Safe"
    elif score <= 65:
        return "Watch"
    return "Enforce"


# ─────────────────────────────────────────────
# 2. Peak Impact Score (0-100)
# Tiers: 0-40 Low | 41-70 Medium | 71-100 High
# ─────────────────────────────────────────────

def compute_peak_impact(
    coincidence_factor: float,  # 0.0-1.0
    peak_usage_kwh: float,
    avg_monthly_kwh: float,
    nilm_ac: bool,
    nilm_ev: bool,
    nilm_pump: bool,
) -> float:
    score = 0.0

    # Coincidence factor (how aligned with DT/feeder peak)
    score += coincidence_factor * 45

    # Peak as share of total consumption
    if avg_monthly_kwh > 0:
        peak_ratio = peak_usage_kwh / avg_monthly_kwh
        score += min(peak_ratio * 25, 30)

    # NILM appliance flags — high-draw devices increase peak risk
    if nilm_ac:
        score += 10
    if nilm_ev:
        score += 12
    if nilm_pump:
        score += 8

    return min(round(score, 1), 100.0)


def peak_impact_tier(score: float) -> str:
    if score <= 40:
        return "Low"
    elif score <= 70:
        return "Medium"
    return "High"


# ─────────────────────────────────────────────
# 3. Complaint Risk Score (0-100)
# Tiers: 0-30 Low | 31-65 Monitor | 66-100 Priority
# ─────────────────────────────────────────────

def compute_complaint_risk(
    complaints_last_12m: List[dict],  # {status, days_to_resolve, escalation_flag, repeat_flag, category}
    bill_shock_flag: bool,
    avg_resolution_tat: float,
) -> float:
    score = 0.0

    # Volume of complaints
    count = len(complaints_last_12m)
    score += min(count * 15, 45)

    # Escalation presence
    if any(c.get("escalation_flag") for c in complaints_last_12m):
        score += 25

    # Repeat complaint flag
    if any(c.get("repeat_flag") for c in complaints_last_12m):
        score += 15

    # Bill shock adds complaint likelihood
    if bill_shock_flag:
        score += 12

    # Poor TAT history
    if avg_resolution_tat > 20:
        score += 10
    elif avg_resolution_tat > 10:
        score += 5

    # Open complaints add immediate risk
    open_count = sum(1 for c in complaints_last_12m if c.get("status") == "open")
    score += open_count * 8

    return min(round(score, 1), 100.0)


def complaint_risk_tier(score: float) -> str:
    if score <= 30:
        return "Low"
    elif score <= 65:
        return "Monitor"
    return "Priority"


# ─────────────────────────────────────────────
# 4. CX Engagement Score (0-100)
# Tiers: 0-30 Offline | 31-65 Partial Digital | 66-100 Digital First
# ─────────────────────────────────────────────

def compute_engagement(
    app_logins_last_month: int,
    notification_opens: int,
    digital_payment: bool,
    whatsapp_responsive: bool,
    has_smartphone: bool,
    preferred_channel: str,
) -> float:
    score = 0.0

    if not has_smartphone:
        return 10.0

    # App engagement
    if app_logins_last_month >= 15:
        score += 30
    elif app_logins_last_month >= 5:
        score += 18
    elif app_logins_last_month >= 1:
        score += 8

    # Notification responsiveness
    if notification_opens >= 5:
        score += 20
    elif notification_opens >= 2:
        score += 12
    elif notification_opens >= 1:
        score += 6

    # Digital payment
    if digital_payment:
        score += 25

    # WhatsApp responsiveness
    if whatsapp_responsive:
        score += 15

    # Channel preference bonus
    if preferred_channel == "app":
        score += 10
    elif preferred_channel == "whatsapp":
        score += 5

    return min(round(score, 1), 100.0)


def engagement_tier(score: float) -> str:
    if score <= 30:
        return "Offline"
    elif score <= 65:
        return "Partial Digital"
    return "Digital First"


# ─────────────────────────────────────────────
# 5. DSM Readiness Score (0-100)
# Tiers: 0-35 Non-flexible | 36-65 Partial | 66-100 DR Ready
# ─────────────────────────────────────────────

def compute_dsm_readiness(
    flexible_load_score: float,  # 0-100, from meter data
    nilm_ac: bool,
    nilm_ev: bool,
    peak_coincidence: float,  # 0.0-1.0
    engagement_score: float,
    tod_sensitivity: str,  # low / medium / high
) -> float:
    score = 0.0

    # Base from flexible load
    score += flexible_load_score * 0.45

    # Shiftable appliances (can be moved off-peak)
    if nilm_ev:
        score += 18  # EV charging is highly shiftable
    if nilm_ac:
        score += 10  # AC has some flexibility

    # High peak coincidence + flexibility = best DR candidate
    if peak_coincidence > 0.7:
        score += 12
    elif peak_coincidence > 0.4:
        score += 6

    # TOD sensitivity
    if tod_sensitivity == "high":
        score += 10
    elif tod_sensitivity == "medium":
        score += 5

    # Engagement needed to participate in DR
    if engagement_score > 60:
        score += 10
    elif engagement_score > 35:
        score += 5

    return min(round(score, 1), 100.0)


def dsm_readiness_tier(score: float) -> str:
    if score <= 35:
        return "Non-flexible"
    elif score <= 65:
        return "Partial"
    return "DR Ready"


# ─────────────────────────────────────────────
# 6. Regulatory Risk Flag (Y/N)
# ─────────────────────────────────────────────

def compute_regulatory_risk(
    complaint_risk_score: float,
    escalation_flag: bool,
    avg_resolution_tat: float,
    oldest_open_complaint_days: int,
) -> bool:
    # Trigger 1: complaint open >30 days
    if oldest_open_complaint_days > 30:
        return True
    # Trigger 2: escalation flag already set
    if escalation_flag:
        return True
    # Trigger 3: predictive — high complaint risk + poor TAT
    if complaint_risk_score > 70 and avg_resolution_tat > 15:
        return True
    return False


# ─────────────────────────────────────────────
# Bill Shock Detection
# ─────────────────────────────────────────────

def compute_bill_shock(
    current_bill: float,
    bills_last_6m: List[float],
) -> tuple[bool, float]:
    """Returns (is_shocked, variance_pct)"""
    if not bills_last_6m:
        return False, 0.0
    avg = sum(bills_last_6m) / len(bills_last_6m)
    if avg == 0:
        return False, 0.0
    variance_pct = ((current_bill - avg) / avg) * 100
    return variance_pct > 30, round(variance_pct, 1)


# ─────────────────────────────────────────────
# Unified scorer — runs all 6 on a consumer record
# ─────────────────────────────────────────────

def score_consumer(consumer_data: dict) -> dict:
    """
    Accepts a dict of raw consumer attributes and returns all 6 scores.
    consumer_data keys:
        payment_records, current_arrears, current_days_overdue,
        coincidence_factor, peak_usage_kwh, avg_monthly_kwh, nilm_ac, nilm_ev, nilm_pump,
        complaints_last_12m, bill_shock_flag, avg_resolution_tat,
        app_logins, notification_opens, digital_payment, whatsapp_responsive, has_smartphone, preferred_channel,
        flexible_load_score, peak_coincidence, engagement_score_raw, tod_sensitivity,
        escalation_flag, oldest_open_complaint_days,
        current_bill, bills_last_6m
    """
    payment_records = consumer_data.get("payment_records", [])
    current_arrears = consumer_data.get("current_arrears", 0)
    current_days_overdue = consumer_data.get("current_days_overdue", 0)

    rev_risk = compute_revenue_risk(payment_records, current_arrears, current_days_overdue)

    coincidence_factor = consumer_data.get("coincidence_factor", 0.3)
    peak_usage_kwh = consumer_data.get("peak_usage_kwh", 50)
    avg_monthly_kwh = consumer_data.get("avg_monthly_kwh", 150)
    nilm_ac = consumer_data.get("nilm_ac", False)
    nilm_ev = consumer_data.get("nilm_ev", False)
    nilm_pump = consumer_data.get("nilm_pump", False)

    peak_impact = compute_peak_impact(
        coincidence_factor, peak_usage_kwh, avg_monthly_kwh, nilm_ac, nilm_ev, nilm_pump
    )

    complaints_last_12m = consumer_data.get("complaints_last_12m", [])
    avg_resolution_tat = consumer_data.get("avg_resolution_tat", 0)
    current_bill = consumer_data.get("current_bill", 500)
    bills_last_6m = consumer_data.get("bills_last_6m", [])
    bill_shock, bill_variance_pct = compute_bill_shock(current_bill, bills_last_6m)

    complaint_risk = compute_complaint_risk(complaints_last_12m, bill_shock, avg_resolution_tat)

    app_logins = consumer_data.get("app_logins", 0)
    notification_opens = consumer_data.get("notification_opens", 0)
    digital_payment = consumer_data.get("digital_payment", False)
    whatsapp_responsive = consumer_data.get("whatsapp_responsive", False)
    has_smartphone = consumer_data.get("has_smartphone", True)
    preferred_channel = consumer_data.get("preferred_channel", "field")

    engagement = compute_engagement(
        app_logins, notification_opens, digital_payment, whatsapp_responsive, has_smartphone, preferred_channel
    )

    flexible_load_score = consumer_data.get("flexible_load_score", 30)
    peak_coincidence = consumer_data.get("peak_coincidence", coincidence_factor)
    tod_sensitivity = consumer_data.get("tod_sensitivity", "low")

    dsm_readiness = compute_dsm_readiness(
        flexible_load_score, nilm_ac, nilm_ev, peak_coincidence, engagement, tod_sensitivity
    )

    escalation_flag = consumer_data.get("escalation_flag", False)
    oldest_open_complaint_days = consumer_data.get("oldest_open_complaint_days", 0)

    reg_risk = compute_regulatory_risk(
        complaint_risk, escalation_flag, avg_resolution_tat, oldest_open_complaint_days
    )

    return {
        "revenue_risk_score": rev_risk,
        "revenue_risk_tier": revenue_risk_tier(rev_risk),
        "peak_impact_score": peak_impact,
        "peak_impact_tier": peak_impact_tier(peak_impact),
        "complaint_risk_score": complaint_risk,
        "complaint_risk_tier": complaint_risk_tier(complaint_risk),
        "engagement_score": engagement,
        "engagement_tier": engagement_tier(engagement),
        "dsm_readiness_score": dsm_readiness,
        "dsm_readiness_tier": dsm_readiness_tier(dsm_readiness),
        "regulatory_risk_flag": reg_risk,
        "bill_shock_flag": bill_shock,
        "bill_variance_pct": bill_variance_pct,
        "days_overdue": current_days_overdue,
        "total_arrears": current_arrears,
    }
