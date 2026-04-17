"""
Action Routing Engine — 24 scenarios.
Each scenario evaluates conditions and returns a list of action records to create.
"""
from typing import List
from datetime import datetime, timedelta


SCENARIOS = {
    1: {
        "name": "Accidental Default Prevention",
        "team": "collections",
        "channel": "whatsapp",
        "priority": "medium",
        "domain": "Revenue & Collections",
    },
    2: {
        "name": "Digital vs Field Visit Triage",
        "team": "collections",
        "channel": "whatsapp",
        "priority": "high",
        "domain": "Revenue & Collections",
    },
    3: {
        "name": "High-Value Defaulter Priority",
        "team": "senior_collections",
        "channel": "agent",
        "priority": "high",
        "domain": "Revenue & Collections",
    },
    4: {
        "name": "Dispute-Linked Default Resolution",
        "team": "billing",
        "channel": "agent",
        "priority": "high",
        "domain": "Revenue & Collections",
    },
    5: {
        "name": "Cash-Flow Instalment Offer",
        "team": "collections",
        "channel": "whatsapp",
        "priority": "medium",
        "domain": "Revenue & Collections",
    },
    6: {
        "name": "Pre-Payment Meter Conversion",
        "team": "field_ops",
        "channel": "field",
        "priority": "high",
        "domain": "Revenue & Collections",
    },
    7: {
        "name": "DT Overload — Consumer DSM Targeting",
        "team": "dsm",
        "channel": "app",
        "priority": "high",
        "domain": "DSM & Network",
    },
    8: {
        "name": "EV Night Tariff Conversion",
        "team": "dsm",
        "channel": "app",
        "priority": "medium",
        "domain": "DSM & Network",
    },
    9: {
        "name": "DSM vs Infrastructure Upgrade Decision",
        "team": "network_planning",
        "channel": "agent",
        "priority": "high",
        "domain": "DSM & Network",
    },
    10: {
        "name": "Rooftop Solar Scheme Targeting",
        "team": "dsm",
        "channel": "app",
        "priority": "low",
        "domain": "DSM & Network",
    },
    11: {
        "name": "Load Violation Revenue Recovery",
        "team": "field_ops",
        "channel": "field",
        "priority": "high",
        "domain": "DSM & Network",
    },
    12: {
        "name": "TOD Tariff Migration",
        "team": "commercial",
        "channel": "whatsapp",
        "priority": "low",
        "domain": "DSM & Network",
    },
    13: {
        "name": "Regulatory Escalation Pre-emption",
        "team": "cx",
        "channel": "agent",
        "priority": "high",
        "domain": "CX & Complaints",
    },
    14: {
        "name": "Bill Shock Surge Detection",
        "team": "billing",
        "channel": "whatsapp",
        "priority": "high",
        "domain": "CX & Complaints",
    },
    15: {
        "name": "Repeat Complaint + Consumption Surge",
        "team": "billing",
        "channel": "agent",
        "priority": "high",
        "domain": "CX & Complaints",
    },
    16: {
        "name": "Estimated Billing Elimination",
        "team": "field_ops",
        "channel": "field",
        "priority": "medium",
        "domain": "CX & Complaints",
    },
    17: {
        "name": "Field Visit Priority Routing",
        "team": "field_ops",
        "channel": "field",
        "priority": "high",
        "domain": "Field Operations",
    },
    18: {
        "name": "Repeat Field Visit Elimination",
        "team": "field_ops",
        "channel": "field",
        "priority": "medium",
        "domain": "Field Operations",
    },
    19: {
        "name": "Pre-Disconnection Final Nudge",
        "team": "collections",
        "channel": "whatsapp",
        "priority": "high",
        "domain": "Field Operations",
    },
    20: {
        "name": "Auto-Debit Conversion Campaign",
        "team": "digital",
        "channel": "app",
        "priority": "low",
        "domain": "Engagement",
    },
    21: {
        "name": "Digital Channel Migration",
        "team": "field_ops",
        "channel": "field",
        "priority": "low",
        "domain": "Engagement",
    },
    22: {
        "name": "Best Contact Time Optimisation",
        "team": "digital",
        "channel": "whatsapp",
        "priority": "low",
        "domain": "Engagement",
    },
    23: {
        "name": "High Complaint + Consumption Surge",
        "team": "billing",
        "channel": "agent",
        "priority": "high",
        "domain": "Multi-Persona",
    },
    24: {
        "name": "EV + Peak Stressor + DR Opportunity",
        "team": "dsm",
        "channel": "app",
        "priority": "high",
        "domain": "Multi-Persona",
    },
}


def _action(scenario_id: int, consumer_id: int, action_text: str, billing_month: str) -> dict:
    s = SCENARIOS[scenario_id]
    return {
        "consumer_id": consumer_id,
        "scenario_id": scenario_id,
        "scenario_name": s["name"],
        "recommended_action": action_text,
        "team": s["team"],
        "priority": s["priority"],
        "channel": s["channel"],
        "status": "pending",
        "billing_month": billing_month,
        "expires_at": datetime.utcnow() + timedelta(days=7),
    }


def route_actions(consumer_id: int, scores: dict, consumer: dict, billing_month: str) -> list:
    """
    Evaluates all 24 scenario conditions and returns a list of action records to create.
    """
    actions = []

    rev_risk = scores.get("revenue_risk_score", 0)
    complaint_risk = scores.get("complaint_risk_score", 0)
    peak_impact = scores.get("peak_impact_score", 0)
    engagement = scores.get("engagement_score", 0)
    dsm_readiness = scores.get("dsm_readiness_score", 0)
    reg_risk = scores.get("regulatory_risk_flag", False)
    bill_shock = scores.get("bill_shock_flag", False)
    bill_variance = scores.get("bill_variance_pct", 0)
    days_overdue = scores.get("days_overdue", 0)

    bill_value = consumer.get("monthly_bill_bucket", "low")
    nilm_ev = consumer.get("nilm_ev", False)
    nilm_ac = consumer.get("nilm_ac", False)
    load_violation = consumer.get("load_violation_flag", False)
    flexible_load = consumer.get("flexible_load_score", 30)
    escalation_flag = consumer.get("escalation_flag", False)
    field_visits = consumer.get("field_visits_last_6m", 0)
    digital_payment = consumer.get("digital_payment", False)
    auto_debit = consumer.get("auto_debit_setup", False)
    avg_resolution_tat = consumer.get("avg_resolution_tat", 0)
    oldest_complaint_days = consumer.get("oldest_open_complaint_days", 0)
    has_active_complaint = consumer.get("has_active_complaint", False)
    dt_peak_loading = consumer.get("dt_peak_loading_pct", 70)
    consumer_name = consumer.get("name", "Consumer")
    renewable_score = consumer.get("renewable_score", 0)
    avg_monthly_kwh = consumer.get("avg_monthly_kwh", 150)
    consecutive_estimated = consumer.get("consecutive_estimated_bills", 0)
    smart_meter = consumer.get("has_smart_meter", False)
    tod_sensitivity = consumer.get("tod_sensitivity", "low")
    payment_channel = consumer.get("payment_channel", "cash")
    repeat_complaint = consumer.get("repeat_complaint_flag", False)
    consumption_spike_pct = consumer.get("consumption_spike_pct", 0)
    coin_factor = consumer.get("coincidence_factor", 0.3)
    has_smartphone = consumer.get("has_smartphone", True)

    # ── Revenue & Collections ──────────────────────────────────────

    # Scenario 1: Accidental Default Prevention
    if 25 <= rev_risk <= 55 and engagement > 40 and not has_active_complaint and days_overdue <= 3:
        actions.append(_action(1, consumer_id,
            f"Send WhatsApp D-3 pre-due reminder to {consumer_name} with exact bill amount and UPI deep link. No human intervention required.",
            billing_month))

    # Scenario 2: Digital vs Field Visit Triage
    if rev_risk > 55 and days_overdue > 15:
        if engagement > 50:
            actions.append(_action(2, consumer_id,
                f"Digital path: Send WhatsApp + IVR outbound call to {consumer_name}. Overdue {days_overdue} days.",
                billing_month))
        elif engagement < 30:
            actions.append(_action(2, consumer_id,
                f"Field path: Schedule field agent visit for {consumer_name}. Send WhatsApp 30 minutes before arrival. Rev Risk {rev_risk:.0f}, Engagement {engagement:.0f}.",
                billing_month))

    # Scenario 3: High-Value Defaulter Priority
    if rev_risk > 65 and bill_value == "high" and days_overdue > 15:
        actions.append(_action(3, consumer_id,
            f"Assign senior collections agent for {consumer_name}. Outbound call with name + amount. Offer part-payment to break all-or-nothing barrier. Structure instalment plan.",
            billing_month))

    # Scenario 4: Dispute-Linked Default Resolution
    if rev_risk > 50 and complaint_risk > 60 and bill_shock and has_active_complaint:
        actions.append(_action(4, consumer_id,
            f"ENFORCE FREEZE for {consumer_name}: no field visit, no disconnection notice while complaint is open. Billing team investigates within 7 days. Collections resumes only after resolution.",
            billing_month))

    # Scenario 5: Cash-Flow Instalment Offer
    if 45 <= rev_risk <= 70 and 15 <= days_overdue <= 30 and not auto_debit and field_visits < 2:
        actions.append(_action(5, consumer_id,
            f"Offer {consumer_name} a 2–3 month instalment plan via WhatsApp. Consumer replies '1' to accept. UPI mandate set up in-flow. Minimum 50% upfront.",
            billing_month))

    # Scenario 6: Pre-Payment Meter Conversion
    if rev_risk > 70 and field_visits >= 3:
        actions.append(_action(6, consumer_id,
            f"Initiate pre-payment meter installation for {consumer_name}. Review security deposit. Brief consumer on credit loading process.",
            billing_month))

    # ── DSM & Network ─────────────────────────────────────────────

    # Scenario 7: DT Overload DSM Targeting
    if dt_peak_loading > 90 and peak_impact > 70 and flexible_load > 55 and engagement > 45:
        actions.append(_action(7, consumer_id,
            f"Send DR enrolment offer with incentive to {consumer_name} via app notification. DT loading at {dt_peak_loading:.0f}%. Consumer Flex Score {flexible_load:.0f}.",
            billing_month))

    # Scenario 8: EV Night Tariff Conversion
    if nilm_ev and coin_factor > 0.6 and engagement > 50:
        actions.append(_action(8, consumer_id,
            f"Send EV night tariff offer + smart charging schedule to {consumer_name}. Shift charging from 6–10pm to 11pm–6am. Reduces peak coincidence by 60–80%.",
            billing_month))

    # Scenario 9: DSM vs Infrastructure Upgrade
    if dt_peak_loading > 85 and peak_impact > 65:
        if flexible_load > 60:
            actions.append(_action(9, consumer_id,
                f"{consumer_name} is on an overloaded DT ({dt_peak_loading:.0f}%). DSM-first: consumer has Flex Score {flexible_load:.0f}. Enrol in DR programme for 3 months before upgrade decision.",
                billing_month))
        else:
            actions.append(_action(9, consumer_id,
                f"{consumer_name} is on an overloaded DT ({dt_peak_loading:.0f}%). Flex Score {flexible_load:.0f} — non-shiftable load. Flag DT for network planning capex review.",
                billing_month))

    # Scenario 10: Rooftop Solar Targeting
    if renewable_score > 60 and avg_monthly_kwh > 250 and engagement > 45:
        actions.append(_action(10, consumer_id,
            f"Send rooftop solar subsidy scheme offer to {consumer_name}. Monthly consumption {avg_monthly_kwh:.0f} kWh makes solar economically viable. Include net metering guide.",
            billing_month))

    # Scenario 11: Load Violation Recovery
    if load_violation:
        actions.append(_action(11, consumer_id,
            f"Schedule field survey for {consumer_name} to formally reassess sanctioned load. Issue load enhancement notice. Recover additional charges retrospectively.",
            billing_month))

    # Scenario 12: TOD Tariff Migration
    if coin_factor > 0.7 and tod_sensitivity in ("medium", "high") and smart_meter and engagement > 50:
        actions.append(_action(12, consumer_id,
            f"Send {consumer_name} a personalised WhatsApp showing estimated TOD savings based on usage pattern. Facilitate tariff change application.",
            billing_month))

    # ── CX & Complaints ───────────────────────────────────────────

    # Scenario 13: Regulatory Escalation Pre-emption
    if complaint_risk > 75 and escalation_flag and avg_resolution_tat > 15 and oldest_complaint_days > 20:
        actions.append(_action(13, consumer_id,
            f"REGULATORY RISK: Senior officer direct outreach to {consumer_name} within 24 hours. Fast-track resolution SLA. Compensation consideration. Formal written response required. Loop in legal team.",
            billing_month))

    # Scenario 14: Bill Shock Surge Detection
    if bill_shock and bill_variance > 30:
        actions.append(_action(14, consumer_id,
            f"Send proactive WhatsApp to {consumer_name} before they call. Plain-language slab explanation: units used, tariff applied per slab. Reduces dispute calls by ~35%.",
            billing_month))

    # Scenario 15: Repeat Complaint + Consumption Surge
    if complaint_risk > 65 and repeat_complaint and bill_shock and consumption_spike_pct > 40:
        actions.append(_action(15, consumer_id,
            f"Initiate meter accuracy test and full billing audit for {consumer_name}. Consumption spike {consumption_spike_pct:.0f}% vs average. Do NOT send collections notice until resolved.",
            billing_month))

    # Scenario 16: Estimated Billing Elimination
    if consecutive_estimated >= 2 and complaint_risk > 40:
        actions.append(_action(16, consumer_id,
            f"Priority schedule meter reading appointment for {consumer_name}. {consecutive_estimated} consecutive estimated bills. Flag for smart meter installation.",
            billing_month))

    # ── Field Operations ─────────────────────────────────────────

    # Scenario 17: Field Visit Priority Routing
    if rev_risk > 70 and engagement < 25 and days_overdue > 20:
        actions.append(_action(17, consumer_id,
            f"Schedule priority field visit for {consumer_name}. Cluster with nearby consumers by DT/area. Agent WhatsApps 30 min before arrival with name + amount + resolution options.",
            billing_month))

    # Scenario 18: Repeat Field Visit Elimination
    if field_visits >= 3 and rev_risk > 65:
        actions.append(_action(18, consumer_id,
            f"Root cause analysis required for {consumer_name}: {field_visits} field visits in 6 months. If wilful: pre-pay meter. If tenant/landlord access issue: registered letter + landlord contact.",
            billing_month))

    # Scenario 19: Pre-Disconnection Final Nudge
    if 28 <= days_overdue <= 29 and rev_risk > 70:
        actions.append(_action(19, consumer_id,
            f"Final WhatsApp + SMS to {consumer_name}: exact amount due + payment link. State disconnection will occur tomorrow if unpaid. Highest-conversion moment.",
            billing_month))

    # ── Engagement ────────────────────────────────────────────────

    # Scenario 20: Auto-Debit Conversion
    if payment_channel == "UPI" and not auto_debit and 0 < field_visits <= 3:
        actions.append(_action(20, consumer_id,
            f"Guide {consumer_name} through auto-debit setup in utility app or BBPS. Include monthly cap consent. Eliminates accidental defaults entirely once enrolled.",
            billing_month))

    # Scenario 21: Digital Channel Migration
    if payment_channel == "cash" and 20 <= engagement <= 40 and has_smartphone:
        actions.append(_action(21, consumer_id,
            f"Field agent or CSC staff guides {consumer_name} to make first digital payment on-site. Follow up with WhatsApp setup. Progressive digital adoption pathway.",
            billing_month))

    # Scenario 22: Best Contact Time Optimisation
    best_time = consumer.get("best_contact_time", "evening")
    if engagement > 0 and best_time:
        actions.append(_action(22, consumer_id,
            f"Schedule all reminders and outreach for {consumer_name} at known best contact time: {best_time}. Increases open rate by 25–35%.",
            billing_month))

    # ── Multi-Persona ─────────────────────────────────────────────

    # Scenario 23: High Complaint + Consumption Surge
    if complaint_risk > 65 and bill_shock and consumption_spike_pct > 50 and repeat_complaint:
        actions.append(_action(23, consumer_id,
            f"COMBINED ALERT for {consumer_name}: complaint risk {complaint_risk:.0f} + consumption spike {consumption_spike_pct:.0f}%. Do NOT send collections notice. Meter test + billing audit + senior billing officer outreach. Prevent regulatory escalation.",
            billing_month))

    # Scenario 24: EV + Peak Stressor + DR Opportunity
    if nilm_ev and peak_impact > 75 and flexible_load > 60 and engagement > 55:
        actions.append(_action(24, consumer_id,
            f"Highest-value DSM opportunity for {consumer_name}: EV consumer causing peak stress but with flexibility to shift. Offer night tariff + smart charging + DR enrolment simultaneously. Include personalised savings projection.",
            billing_month))

    return actions
