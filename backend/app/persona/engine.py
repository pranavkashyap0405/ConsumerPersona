"""
Persona Assignment Engine — 18 personas, 12 priority rules.
Rules evaluated in order. First match = primary persona.
Second-highest signal = secondary persona.
"""
from typing import Optional, Tuple

PERSONAS = {
    # Revenue & Payment
    "prompt_payer": {
        "name": "Prompt Payer",
        "category": "Revenue & Payment",
        "tier": "Green",
        "description": "Pays within 3 days of bill receipt. Never defaults. High payment consistency.",
        "action": "Auto-debit nudge + loyalty offer. No enforcement action required.",
        "team": "digital",
    },
    "accidental_late_payer": {
        "name": "Accidental Late Payer",
        "category": "Revenue & Payment",
        "tier": "Yellow",
        "description": "Pays 8–18 days after due date. Forgets due dates — not wilful. Responds immediately to reminders.",
        "action": "WhatsApp D-3 pre-due reminder with UPI deep link.",
        "team": "digital_collections",
    },
    "cashflow_constrained": {
        "name": "Cash-Flow Constrained Payer",
        "category": "Revenue & Payment",
        "tier": "Orange",
        "description": "Seasonal delays linked to festival season, rent, or salary cycle. Pays eventually.",
        "action": "60-day instalment plan via WhatsApp. Flexible due date opt-in.",
        "team": "collections",
    },
    "chronic_defaulter": {
        "name": "Chronic Defaulter",
        "category": "Revenue & Payment",
        "tier": "Red",
        "description": "Pays only after field visit or formal notice. Habitual pattern across 4+ cycles.",
        "action": "Pre-payment meter installation + security deposit review.",
        "team": "field_ops",
    },
    "dispute_withholder": {
        "name": "Dispute-Driven Withholder",
        "category": "Revenue & Payment",
        "tier": "Red",
        "description": "Payment deliberately withheld due to billing dispute. Active complaint on file.",
        "action": "Freeze enforcement. Resolve billing dispute first. Collect only after resolution.",
        "team": "billing",
    },
    "vacant_premises": {
        "name": "Vacant / Abandoned Premises",
        "category": "Revenue & Payment",
        "tier": "Special",
        "description": "Tenant has vacated. Landlord unreachable. Bills accruing with no engagement.",
        "action": "Disconnect supply. Issue legal notice. Adjust security deposit against arrears.",
        "team": "field_ops",
    },
    # Network & DSM
    "high_coincident_peak": {
        "name": "High Coincident Peak User",
        "category": "Network & DSM",
        "tier": "Peak Stressor",
        "description": "Peak usage aligns precisely with DT/feeder peak. Contributes directly to overload risk.",
        "action": "DR enrolment offer with financial incentive. TOD tariff information.",
        "team": "dsm",
    },
    "flexible_load_consumer": {
        "name": "Flexible Load Consumer",
        "category": "Network & DSM",
        "tier": "DR Candidate",
        "description": "High flexible load score. Usage pattern can be shifted off-peak. Ideal DSM target.",
        "action": "DR programme enrolment + incentive offer via app notification.",
        "team": "dsm",
    },
    "ev_adopter": {
        "name": "EV Adopter / Night Charger",
        "category": "Network & DSM",
        "tier": "EV-Ready",
        "description": "NILM algorithm detected EV charging signature. Daytime charging increasing peak coincidence.",
        "action": "EV night tariff offer + smart charging schedule guidance.",
        "team": "dsm",
    },
    "renewable_adopter": {
        "name": "Renewable Adopter",
        "category": "Network & DSM",
        "tier": "Solar Ready",
        "description": "High renewable score. High monthly consumption makes rooftop solar economically viable.",
        "action": "Rooftop solar subsidy scheme offer. Net metering application guidance.",
        "team": "dsm",
    },
    "load_violator": {
        "name": "Sanctioned Load Exceeder",
        "category": "Network & DSM",
        "tier": "Load Violator",
        "description": "Consistently drawing more kW than sanctioned load. Equipment damage and DT overload risk.",
        "action": "Load enhancement notice + field survey for formal load revision.",
        "team": "field_ops",
    },
    "efficient_user": {
        "name": "Low-Consumption Efficient User",
        "category": "Network & DSM",
        "tier": "Efficient",
        "description": "Below-average consumption. Low peak contribution. Good network citizen.",
        "action": "Efficiency certification acknowledgement. Loyalty reward.",
        "team": "cx",
    },
    # CX & Complaint
    "repeat_complainant": {
        "name": "Repeat Complainant",
        "category": "CX & Complaint",
        "tier": "High Risk",
        "description": "Three or more complaints in a quarter. Same issue recurring. Escalation flag active.",
        "action": "Dedicated case manager. Root cause investigation. Compensation consideration.",
        "team": "cx",
    },
    "ombudsman_escalator": {
        "name": "Ombudsman / Forum Escalator",
        "category": "CX & Complaint",
        "tier": "Regulatory Risk",
        "description": "Complaint has been or is about to be escalated to SERC, Ombudsman, or State Consumer Forum.",
        "action": "Senior officer direct outreach. Fast-track resolution. Legal team loop-in.",
        "team": "cx",
    },
    "bill_shock_prone": {
        "name": "Bill Shock Prone Consumer",
        "category": "CX & Complaint",
        "tier": "Watch",
        "description": "Frequent bill shock. Slab-crossing confusion. Likely to dispute without proactive explanation.",
        "action": "Proactive plain-language slab explanation via WhatsApp before due date.",
        "team": "billing",
    },
    # Digital Engagement
    "digital_champion": {
        "name": "Digital Champion",
        "category": "Digital Engagement",
        "tier": "High Engagement",
        "description": "Daily app user. Opens notifications within minutes. UPI-first. Self-service capable.",
        "action": "App-first all communications. Auto-debit setup nudge. No field contact.",
        "team": "digital",
    },
    "whatsapp_active": {
        "name": "WhatsApp-Active / App-Passive",
        "category": "Digital Engagement",
        "tier": "Partial Digital",
        "description": "Responds reliably to WhatsApp. Ignores app push notifications.",
        "action": "WhatsApp-led all journeys. Embed UPI deep link in message.",
        "team": "digital",
    },
    "offline_user": {
        "name": "Non-Digital / Cash Payer",
        "category": "Digital Engagement",
        "tier": "Offline",
        "description": "Cash payment at counter. Does not use app. IVR or field agent is primary channel.",
        "action": "IVR reminder + CSC payment guidance. Field agent visit for recovery.",
        "team": "field_ops",
    },
    # High-Value Composite
    "digital_high_value": {
        "name": "Digital High-Value Payer",
        "category": "High-Value Composite",
        "tier": "Top Tier",
        "description": "Low revenue risk + high bill value + high engagement. Most commercially valuable segment.",
        "action": "Premium CX channel. Proactive consumption insights. First access to new tariff offers.",
        "team": "cx",
    },
    "at_risk_high_value": {
        "name": "At-Risk High-Value Defaulter",
        "category": "High-Value Composite",
        "tier": "High Priority",
        "description": "High monthly bill + high revenue risk = maximum revenue exposure. Dedicated senior collections.",
        "action": "Senior collections agent. Part-payment offer. Weekly follow-up until resolved.",
        "team": "senior_collections",
    },
    "complaint_prone_defaulter": {
        "name": "Complaint-Prone Defaulter",
        "category": "High-Value Composite",
        "tier": "Complex Case",
        "description": "Active default AND active complaint. Billing dispute likely root cause of payment withholding.",
        "action": "Collections pauses. CX resolves complaint. Joint handoff after resolution.",
        "team": "cx",
    },
    "base_load": {
        "name": "Base Load Consumer",
        "category": "General",
        "tier": "Stable",
        "description": "All scores below action thresholds. No intervention required this cycle.",
        "action": "No intervention. Monitor monthly.",
        "team": "none",
    },
}


def assign_persona(scores: dict, consumer: dict) -> Tuple[str, Optional[str]]:
    """
    Evaluates 12 priority rules in order.
    Returns (primary_persona_key, secondary_persona_key).
    """
    rev_risk = scores.get("revenue_risk_score", 0)
    complaint_risk = scores.get("complaint_risk_score", 0)
    peak_impact = scores.get("peak_impact_score", 0)
    engagement = scores.get("engagement_score", 0)
    dsm_readiness = scores.get("dsm_readiness_score", 0)
    reg_risk = scores.get("regulatory_risk_flag", False)
    bill_shock = scores.get("bill_shock_flag", False)
    bill_value = consumer.get("monthly_bill_bucket", "low")
    nilm_ev = consumer.get("nilm_ev", False)
    renewable_score = consumer.get("renewable_score", 0)
    avg_monthly_kwh = consumer.get("avg_monthly_kwh", 150)
    load_violation = consumer.get("load_violation_flag", False)
    flexible_load = consumer.get("flexible_load_score", 30)
    escalation_flag = consumer.get("escalation_flag", False)
    field_visits = consumer.get("field_visits_last_6m", 0)
    days_overdue = scores.get("days_overdue", 0)
    digital_payment = consumer.get("digital_payment", False)

    matched = []

    # Rule 1: At-Risk High-Value Defaulter
    if rev_risk > 65 and bill_value == "high" and days_overdue > 15:
        matched.append("at_risk_high_value")

    # Rule 2: Complaint-Prone Defaulter
    if rev_risk > 60 and complaint_risk > 65 and bill_shock:
        matched.append("complaint_prone_defaulter")

    # Rule 3: Ombudsman / Forum Escalator
    if reg_risk or (complaint_risk > 80 and escalation_flag):
        matched.append("ombudsman_escalator")

    # Rule 4: Chronic Defaulter
    if rev_risk > 70 and engagement < 25 and field_visits >= 3:
        matched.append("chronic_defaulter")

    # Rule 5: At-Risk Defaulter (general)
    if rev_risk > 65 and "at_risk_high_value" not in matched and "chronic_defaulter" not in matched:
        matched.append("dispute_withholder" if complaint_risk > 60 and bill_shock else "cashflow_constrained" if days_overdue < 30 else "chronic_defaulter")

    # Rule 6: Repeat Complainant
    if complaint_risk > 70 and escalation_flag:
        matched.append("repeat_complainant")

    # Rule 7: Flexible Peak Contributor (DR candidate)
    if peak_impact > 70 and flexible_load > 55:
        matched.append("flexible_load_consumer")

    # Rule 8: Infrastructure trigger
    if peak_impact > 70 and flexible_load < 35:
        matched.append("high_coincident_peak")

    # Rule 9: EV Adopter
    if nilm_ev and engagement > 50:
        matched.append("ev_adopter")

    # Rule 10: Renewable Adopter
    if renewable_score > 60 and avg_monthly_kwh > 250:
        matched.append("renewable_adopter")

    # Rule 11: Digital High-Value
    if engagement > 75 and rev_risk < 30 and bill_value == "high":
        matched.append("digital_high_value")

    # Rule 12: Bill Shock Prone
    if bill_shock and complaint_risk > 45:
        matched.append("bill_shock_prone")

    # Rule 13: Accidental Late Payer
    if 25 <= rev_risk <= 55 and engagement > 40 and "cashflow_constrained" not in matched:
        matched.append("accidental_late_payer")

    # Rule 14: Load Violator
    if load_violation:
        matched.append("load_violator")

    # Digital engagement tier
    if engagement > 75 and "digital_champion" not in matched and "digital_high_value" not in matched:
        matched.append("digital_champion")
    elif 35 <= engagement <= 65:
        matched.append("whatsapp_active")
    elif engagement < 25 and not digital_payment:
        matched.append("offline_user")

    # Efficient user
    if peak_impact < 20 and avg_monthly_kwh < 100:
        matched.append("efficient_user")

    # Prompt payer
    if rev_risk < 15 and "digital_high_value" not in matched:
        matched.append("prompt_payer")

    if not matched:
        return "base_load", None

    primary = matched[0]
    secondary = matched[1] if len(matched) > 1 else None

    return primary, secondary


def get_persona_info(key: str) -> dict:
    return PERSONAS.get(key, PERSONAS["base_load"])
