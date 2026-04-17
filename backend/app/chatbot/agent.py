"""
Chatbot agent using Claude API with tool use.
Tools give the LLM structured access to the consumer database.
"""
import os
import json
from typing import Optional
from anthropic import Anthropic
from sqlalchemy.orm import Session
from sqlalchemy import func, desc

from app import models

client = Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY", ""))

SYSTEM_PROMPT = """You are the DISCOM Consumer Intelligence Assistant — an expert operations advisor for an electricity distribution company (DISCOM).

You have deep knowledge of the Consumer Persona & Scenario Intelligence Framework:

SCORING DIMENSIONS (0-100 each):
- Revenue Risk Score: 0-30 Safe | 31-65 Watch | 66-100 Enforce
- Peak Impact Score: 0-40 Low | 41-70 Medium | 71-100 High
- Complaint Risk Score: 0-30 Low | 31-65 Monitor | 66-100 Priority
- CX Engagement Score: 0-30 Offline | 31-65 Partial Digital | 66-100 Digital First
- DSM Readiness Score: 0-35 Non-flexible | 36-65 Partial | 66-100 DR Ready
- Regulatory Risk Flag: Y/N binary

18 PERSONAS across 5 categories:
Revenue & Payment: Prompt Payer, Accidental Late Payer, Cash-Flow Constrained, Chronic Defaulter, Dispute-Driven Withholder, Vacant Premises
Network & DSM: High Coincident Peak User, Flexible Load Consumer, EV Adopter, Renewable Adopter, Load Violator, Efficient User
CX & Complaint: Repeat Complainant, Ombudsman/Forum Escalator, Bill Shock Prone
Digital Engagement: Digital Champion, WhatsApp-Active, Non-Digital/Cash Payer
High-Value Composite: Digital High-Value Payer, At-Risk High-Value Defaulter, Complaint-Prone Defaulter

24 ACTION SCENARIOS across 6 domains:
Revenue & Collections (1-6), DSM & Network (7-12), CX & Complaints (13-16), Field Operations (17-19), Engagement (20-22), Multi-Persona (23-24)

KEY DECISION RULES:
- High complaint risk ALWAYS takes precedence over collections in action sequence
- When complaint is open + default exists: freeze enforcement, resolve complaint first
- DSM-first protocol: run DR for 3 months before authorising DT upgrade capex
- Pre-pay meter threshold: Rev Risk >70 + field visits >3 in last 6 months
- Regulatory risk triggers: complaint open >30 days OR escalation flag OR (Complaint Risk >70 AND TAT >15 days)

Always:
1. Use the available tools to fetch real data before answering
2. Cite the specific score values and rule that triggered your recommendation
3. Be concise and actionable — give one clear recommendation, not a list of options
4. Flag regulatory risk situations with urgency
5. When asked about actions, check if there are pending actions already in the queue before recommending new ones"""

TOOLS = [
    {
        "name": "get_consumer_profile",
        "description": "Get complete 360-degree profile for a specific consumer including all scores, persona, active actions, and history.",
        "input_schema": {
            "type": "object",
            "properties": {
                "consumer_id": {"type": "integer", "description": "The consumer's database ID"},
                "consumer_number": {"type": "string", "description": "The consumer's account number (alternative to ID)"},
            },
        },
    },
    {
        "name": "search_consumers",
        "description": "Search and filter consumers by persona, circle, area, revenue risk threshold, or free text.",
        "input_schema": {
            "type": "object",
            "properties": {
                "persona_key": {"type": "string", "description": "Filter by persona key e.g. chronic_defaulter, accidental_late_payer"},
                "circle": {"type": "string", "description": "Circle name e.g. North, South, East, West"},
                "area": {"type": "string", "description": "Area name"},
                "min_revenue_risk": {"type": "number", "description": "Minimum revenue risk score"},
                "regulatory_risk_only": {"type": "boolean", "description": "Return only consumers with regulatory risk flag"},
                "limit": {"type": "integer", "description": "Max results to return", "default": 20},
            },
        },
    },
    {
        "name": "get_dt_summary",
        "description": "Get summary of a distribution transformer including peak load, DR candidates, and recommended protocol.",
        "input_schema": {
            "type": "object",
            "properties": {
                "dt_code": {"type": "string", "description": "DT code e.g. DT-NKor-01"},
                "circle": {"type": "string", "description": "Circle to filter DTs"},
                "overloaded_only": {"type": "boolean", "description": "Return only DTs with peak load >85%"},
            },
        },
    },
    {
        "name": "get_action_queue",
        "description": "Get pending actions for a specific team or scenario.",
        "input_schema": {
            "type": "object",
            "properties": {
                "team": {"type": "string", "description": "Team name: collections, dsm, field_ops, cx, billing, digital, senior_collections"},
                "priority": {"type": "string", "description": "Filter by priority: high, medium, low"},
                "scenario_id": {"type": "integer", "description": "Filter by specific scenario number (1-24)"},
                "limit": {"type": "integer", "default": 15},
            },
        },
    },
    {
        "name": "get_kpi_status",
        "description": "Get current KPI performance vs targets across all operational domains.",
        "input_schema": {
            "type": "object",
            "properties": {
                "domain": {"type": "string", "description": "Filter by domain: Collections, DSM, Field Ops, CX/Billing, Digital, Finance"},
            },
        },
    },
    {
        "name": "get_portfolio_summary",
        "description": "Get high-level portfolio statistics: persona distribution, revenue risk breakdown, overdue amounts, regulatory risk count.",
        "input_schema": {"type": "object", "properties": {}},
    },
]


def _run_tool(tool_name: str, tool_input: dict, db: Session) -> str:
    MONTH = "2026-04"

    if tool_name == "get_consumer_profile":
        consumer_id = tool_input.get("consumer_id")
        consumer_number = tool_input.get("consumer_number")

        q = db.query(models.ConsumerMaster)
        if consumer_id:
            consumer = q.filter_by(id=consumer_id).first()
        elif consumer_number:
            consumer = q.filter_by(consumer_number=consumer_number).first()
        else:
            return json.dumps({"error": "Provide consumer_id or consumer_number"})

        if not consumer:
            return json.dumps({"error": "Consumer not found"})

        score = db.query(models.ConsumerScore).filter_by(consumer_id=consumer.id, billing_month=MONTH).first()
        persona = db.query(models.ConsumerPersona).filter_by(consumer_id=consumer.id, billing_month=MONTH).first()
        actions = db.query(models.ActionQueue).filter_by(consumer_id=consumer.id, status="pending").limit(5).all()
        complaints = db.query(models.ComplaintLog).filter_by(consumer_id=consumer.id).all()
        engagement = db.query(models.EngagementLog).filter_by(consumer_id=consumer.id, month=MONTH).first()

        return json.dumps({
            "id": consumer.id,
            "consumer_number": consumer.consumer_number,
            "name": consumer.name,
            "circle": consumer.circle,
            "area": consumer.area,
            "bill_bucket": consumer.monthly_bill_bucket,
            "scores": {
                "revenue_risk": score.revenue_risk_score if score else None,
                "peak_impact": score.peak_impact_score if score else None,
                "complaint_risk": score.complaint_risk_score if score else None,
                "engagement": score.engagement_score if score else None,
                "dsm_readiness": score.dsm_readiness_score if score else None,
                "regulatory_risk_flag": score.regulatory_risk_flag if score else None,
                "bill_shock_flag": score.bill_shock_flag if score else None,
                "days_overdue": score.days_overdue if score else 0,
                "total_arrears": score.total_arrears if score else 0,
            } if score else None,
            "primary_persona": persona.primary_persona if persona else None,
            "primary_persona_key": persona.primary_persona_key if persona else None,
            "secondary_persona": persona.secondary_persona if persona else None,
            "active_actions": [{"id": a.id, "name": a.scenario_name, "action": a.recommended_action, "team": a.team} for a in actions],
            "open_complaints": sum(1 for c in complaints if c.status == "open"),
            "total_complaints": len(complaints),
            "has_escalation": any(c.escalation_flag for c in complaints),
            "preferred_channel": engagement.preferred_channel if engagement else "unknown",
            "best_contact_time": engagement.best_contact_time if engagement else None,
        })

    elif tool_name == "search_consumers":
        q = db.query(models.ConsumerMaster, models.ConsumerPersona, models.ConsumerScore).outerjoin(
            models.ConsumerPersona,
            (models.ConsumerPersona.consumer_id == models.ConsumerMaster.id) &
            (models.ConsumerPersona.billing_month == MONTH)
        ).outerjoin(
            models.ConsumerScore,
            (models.ConsumerScore.consumer_id == models.ConsumerMaster.id) &
            (models.ConsumerScore.billing_month == MONTH)
        )

        if tool_input.get("persona_key"):
            q = q.filter(models.ConsumerPersona.primary_persona_key == tool_input["persona_key"])
        if tool_input.get("circle"):
            q = q.filter(models.ConsumerMaster.circle == tool_input["circle"])
        if tool_input.get("area"):
            q = q.filter(models.ConsumerMaster.area == tool_input["area"])
        if tool_input.get("min_revenue_risk"):
            q = q.filter(models.ConsumerScore.revenue_risk_score >= tool_input["min_revenue_risk"])
        if tool_input.get("regulatory_risk_only"):
            q = q.filter(models.ConsumerScore.regulatory_risk_flag == True)

        limit = tool_input.get("limit", 20)
        results = q.limit(limit).all()

        return json.dumps({
            "count": len(results),
            "consumers": [
                {
                    "id": c.id,
                    "name": c.name,
                    "consumer_number": c.consumer_number,
                    "circle": c.circle,
                    "area": c.area,
                    "persona": p.primary_persona if p else None,
                    "revenue_risk": s.revenue_risk_score if s else None,
                    "engagement": s.engagement_score if s else None,
                    "days_overdue": s.days_overdue if s else 0,
                    "arrears": s.total_arrears if s else 0,
                    "regulatory_risk": s.regulatory_risk_flag if s else False,
                }
                for c, p, s in results
            ]
        })

    elif tool_name == "get_dt_summary":
        q = db.query(models.DTMaster)
        if tool_input.get("dt_code"):
            q = q.filter(models.DTMaster.dt_code.ilike(f"%{tool_input['dt_code']}%"))
        if tool_input.get("circle"):
            q = q.filter_by(circle=tool_input["circle"])
        if tool_input.get("overloaded_only"):
            q = q.filter(models.DTMaster.current_peak_load_pct > 85)

        dts = q.limit(10).all()
        result = []
        for dt in dts:
            consumer_ids = [c.id for c in db.query(models.ConsumerMaster).filter_by(dt_id=dt.id).all()]
            scores = db.query(models.ConsumerScore).filter(
                models.ConsumerScore.consumer_id.in_(consumer_ids),
                models.ConsumerScore.billing_month == MONTH
            ).all() if consumer_ids else []

            dr_ready = sum(1 for s in scores if s.dsm_readiness_score >= 60)
            flex_fraction = dr_ready / max(len(scores), 1)
            result.append({
                "dt_code": dt.dt_code,
                "name": dt.name,
                "circle": dt.circle,
                "area": dt.area,
                "peak_load_pct": dt.current_peak_load_pct,
                "age_years": dt.age_years,
                "consumer_count": len(consumer_ids),
                "dr_candidates": dr_ready,
                "flex_fraction": round(flex_fraction, 2),
                "protocol": "DSM-first" if flex_fraction >= 0.4 and dt.current_peak_load_pct > 85 else "Upgrade review" if dt.age_years > 15 and dt.current_peak_load_pct > 85 else "Monitor",
            })

        return json.dumps({"dts": result})

    elif tool_name == "get_action_queue":
        q = db.query(models.ActionQueue, models.ConsumerMaster).join(
            models.ConsumerMaster,
            models.ActionQueue.consumer_id == models.ConsumerMaster.id
        ).filter(models.ActionQueue.status == "pending")

        if tool_input.get("team"):
            q = q.filter(models.ActionQueue.team == tool_input["team"])
        if tool_input.get("priority"):
            q = q.filter(models.ActionQueue.priority == tool_input["priority"])
        if tool_input.get("scenario_id"):
            q = q.filter(models.ActionQueue.scenario_id == tool_input["scenario_id"])

        limit = tool_input.get("limit", 15)
        results = q.order_by(desc(models.ActionQueue.priority)).limit(limit).all()

        return json.dumps({
            "total_pending": q.count(),
            "actions": [
                {
                    "id": a.id,
                    "consumer": c.name,
                    "consumer_number": c.consumer_number,
                    "circle": c.circle,
                    "scenario": a.scenario_name,
                    "action": a.recommended_action[:120] + "..." if len(a.recommended_action) > 120 else a.recommended_action,
                    "priority": a.priority,
                    "channel": a.channel,
                }
                for a, c in results
            ]
        })

    elif tool_name == "get_kpi_status":
        q = db.query(models.KPITracking).filter_by(month=MONTH)
        if tool_input.get("domain"):
            q = q.filter(models.KPITracking.domain.ilike(f"%{tool_input['domain']}%"))
        kpis = q.all()
        return json.dumps({
            "kpis": [
                {
                    "name": k.kpi_name,
                    "target": k.target,
                    "actual": k.actual,
                    "unit": k.unit,
                    "domain": k.domain,
                    "rag": k.rag_status,
                }
                for k in kpis
            ]
        })

    elif tool_name == "get_portfolio_summary":
        total = db.query(models.ConsumerMaster).count()
        scores = db.query(models.ConsumerScore).filter_by(billing_month=MONTH).all()
        reg_risk = sum(1 for s in scores if s.regulatory_risk_flag)
        overdue = sum(s.total_arrears for s in scores if s.total_arrears > 0)
        persona_dist = db.query(
            models.ConsumerPersona.primary_persona_key,
            func.count().label("cnt")
        ).filter_by(billing_month=MONTH).group_by(models.ConsumerPersona.primary_persona_key).all()

        pending_actions = db.query(
            models.ActionQueue.team,
            func.count().label("cnt")
        ).filter_by(status="pending").group_by(models.ActionQueue.team).all()

        return json.dumps({
            "total_consumers": total,
            "regulatory_risk_count": reg_risk,
            "total_overdue_rs": round(overdue, 2),
            "consumers_with_arrears": sum(1 for s in scores if s.total_arrears > 0),
            "persona_distribution": {p.primary_persona_key: p.cnt for p in persona_dist},
            "pending_actions_by_team": {a.team: a.cnt for a in pending_actions},
        })

    return json.dumps({"error": f"Unknown tool: {tool_name}"})


# Simple in-memory session store
_sessions: dict = {}


def chat(message: str, session_id: str, db: Session) -> dict:
    if session_id not in _sessions:
        _sessions[session_id] = []

    history = _sessions[session_id]
    history.append({"role": "user", "content": message})

    tool_calls_made = []
    max_iterations = 5
    iteration = 0

    while iteration < max_iterations:
        iteration += 1
        response = client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=2048,
            system=SYSTEM_PROMPT,
            tools=TOOLS,
            messages=history,
        )

        if response.stop_reason == "tool_use":
            # Process tool calls
            assistant_content = response.content
            history.append({"role": "assistant", "content": assistant_content})

            tool_results = []
            for block in assistant_content:
                if block.type == "tool_use":
                    tool_calls_made.append(block.name)
                    result = _run_tool(block.name, block.input, db)
                    tool_results.append({
                        "type": "tool_result",
                        "tool_use_id": block.id,
                        "content": result,
                    })

            history.append({"role": "user", "content": tool_results})

        elif response.stop_reason == "end_turn":
            # Extract text response
            text = ""
            for block in response.content:
                if hasattr(block, "text"):
                    text += block.text
            history.append({"role": "assistant", "content": text})

            # Trim history to last 20 exchanges
            if len(history) > 40:
                _sessions[session_id] = history[-40:]

            return {
                "response": text,
                "session_id": session_id,
                "tool_calls_made": tool_calls_made,
            }
        else:
            break

    return {
        "response": "I encountered an issue processing your request. Please try again.",
        "session_id": session_id,
        "tool_calls_made": tool_calls_made,
    }
