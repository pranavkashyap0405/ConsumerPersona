"""
Mock data generator — creates realistic consumer data covering all 18 persona types.
Run via: POST /api/seed
"""
import random
from datetime import date, timedelta
from faker import Faker
from sqlalchemy.orm import Session
from app import models
from app.scoring.engine import score_consumer
from app.persona.engine import assign_persona, get_persona_info
from app.scenarios.engine import route_actions

fake = Faker("en_IN")
random.seed(42)

CIRCLES = ["North", "South", "East", "West"]
AREAS = {
    "North": ["Koramangala", "Indiranagar", "Whitefield"],
    "South": ["JP Nagar", "Banashankari", "Jayanagar"],
    "East": ["Marathahalli", "Bellandur", "Sarjapur"],
    "West": ["Rajajinagar", "Malleshwaram", "Yeshwanthpur"],
}
CURRENT_MONTH = "2026-04"


def _random_date(start_days_ago: int, end_days_ago: int = 0) -> date:
    delta = random.randint(end_days_ago, start_days_ago)
    return date.today() - timedelta(days=delta)


def seed_dts(db: Session):
    dts = []
    for circle in CIRCLES:
        for area in AREAS[circle]:
            for i in range(1, 4):
                dt = models.DTMaster(
                    dt_code=f"DT-{circle[:1]}{area[:3].upper()}-{i:02d}",
                    name=f"{area} DT-{i}",
                    circle=circle,
                    area=area,
                    capacity_kva=random.choice([100, 200, 315, 500]),
                    current_peak_load_pct=round(random.uniform(55, 98), 1),
                    age_years=random.randint(3, 22),
                    consumer_count=0,
                )
                db.add(dt)
                dts.append(dt)
    db.commit()
    for dt in dts:
        db.refresh(dt)
    return dts


def _make_payment_records(persona_type: str, num_months: int = 12) -> list:
    records = []
    for i in range(num_months):
        bill = round(random.uniform(300, 8000), 2)
        if persona_type == "prompt_payer":
            days_late = random.choice([-5, -3, -2, -1, 0, 1])
            paid = bill
            channel = random.choice(["auto-debit", "UPI", "UPI"])
        elif persona_type == "accidental_late":
            days_late = random.choice([8, 10, 14, 16, 18, 5, 3])
            paid = bill
            channel = "UPI"
        elif persona_type == "cashflow_constrained":
            days_late = random.choice([20, 25, 30, 35, 15, 40])
            paid = bill * random.choice([1.0, 0.8, 1.0])
            channel = "cash"
        elif persona_type == "chronic_defaulter":
            days_late = random.choice([45, 50, 60, 35, 70, 0])
            paid = bill if days_late > 0 else 0
            channel = "cash"
        elif persona_type == "dispute_withholder":
            days_late = random.choice([30, 60, 0, 45])
            paid = 0 if days_late == 0 else bill
            channel = "cash"
        elif persona_type == "high_value":
            days_late = random.choice([-3, -1, 0, 2])
            bill = round(random.uniform(5000, 15000), 2)
            paid = bill
            channel = random.choice(["auto-debit", "UPI"])
        else:
            days_late = random.randint(-2, 20)
            paid = bill if days_late >= 0 else 0
            channel = random.choice(["UPI", "cash", "NEFT"])
        records.append({
            "days_after_due": days_late,
            "amount_paid": paid,
            "bill_amount": bill,
            "payment_channel": channel,
        })
    return records


def seed_consumers(db: Session, dts: list, total: int = 200):
    """Create synthetic consumers covering all persona types."""

    persona_configs = [
        # (type_key, weight, rev_risk_range, engagement_range, extra_flags)
        ("prompt_payer", 12, (5, 25), (70, 100), {}),
        ("accidental_late", 14, (25, 55), (40, 75), {}),
        ("cashflow_constrained", 10, (45, 65), (20, 50), {}),
        ("chronic_defaulter", 8, (72, 95), (5, 22), {"field_visits": (3, 7)}),
        ("dispute_withholder", 6, (55, 80), (20, 50), {"has_active_complaint": True, "bill_shock": True}),
        ("vacant_premises", 3, (87, 99), (0, 8), {}),
        ("high_coincident_peak", 7, (10, 45), (30, 65), {"coincidence_factor": (0.75, 1.0), "nilm_ac": True}),
        ("flexible_load", 7, (10, 40), (45, 80), {"flexible_load": (65, 90)}),
        ("ev_adopter", 5, (5, 35), (55, 90), {"nilm_ev": True}),
        ("renewable_adopter", 4, (5, 30), (45, 75), {"renewable_score": (65, 90), "high_kwh": True}),
        ("load_violator", 4, (20, 60), (20, 55), {"load_violation": True}),
        ("efficient_user", 5, (5, 25), (20, 60), {"low_kwh": True}),
        ("repeat_complainant", 4, (30, 65), (35, 65), {"complaints": (3, 6), "escalation": True}),
        ("ombudsman_escalator", 3, (40, 80), (30, 60), {"escalation": True, "reg_risk": True}),
        ("bill_shock_prone", 5, (35, 65), (35, 65), {"bill_shock": True}),
        ("digital_champion", 6, (5, 30), (78, 100), {"digital": True}),
        ("whatsapp_active", 6, (15, 50), (38, 62), {}),
        ("offline_cash", 5, (25, 65), (5, 22), {"cash_payer": True}),
        ("at_risk_high_value", 4, (68, 90), (35, 65), {"high_bill": True}),
        ("digital_high_value", 3, (3, 20), (78, 100), {"high_bill": True, "digital": True}),
    ]

    weights = [p[1] for p in persona_configs]
    total_weight = sum(weights)
    counts = [max(1, round(total * w / total_weight)) for w in weights]

    consumer_list = []
    for config, count in zip(persona_configs, counts):
        ptype = config[0]
        _, _, rev_range, eng_range, flags = config
        for _ in range(count):
            consumer_list.append((ptype, rev_range, eng_range, flags))

    random.shuffle(consumer_list)

    for ptype, rev_range, eng_range, flags in consumer_list[:total]:
        circle = random.choice(CIRCLES)
        area = random.choice(AREAS[circle])
        dt = random.choice([d for d in dts if d.circle == circle])

        high_bill = flags.get("high_bill", False)
        low_kwh = flags.get("low_kwh", False)
        high_kwh = flags.get("high_kwh", False)

        avg_kwh = (
            random.uniform(400, 900) if high_kwh
            else random.uniform(50, 100) if low_kwh
            else random.uniform(100, 400)
        )
        bill_amount = avg_kwh * random.uniform(4.5, 7.0) if not high_bill else random.uniform(5500, 15000)
        bill_bucket = "high" if bill_amount > 5000 else "medium" if bill_amount > 1500 else "low"

        digital = flags.get("digital", False)
        cash_payer = flags.get("cash_payer", False)
        payment_channel = "UPI" if digital else "cash" if cash_payer else random.choice(["UPI", "cash", "NEFT"])

        consumer = models.ConsumerMaster(
            consumer_number=f"DISC{random.randint(100000, 999999)}",
            name=fake.name(),
            address=fake.address()[:100],
            circle=circle,
            area=area,
            dt_id=dt.id,
            consumer_type=random.choices(
                ["residential", "commercial", "industrial"], weights=[75, 20, 5]
            )[0],
            sanctioned_load_kw=round(random.uniform(1, 15), 1),
            connection_date=_random_date(3650, 365),
            phone=fake.phone_number()[:15],
            email=fake.email() if random.random() > 0.3 else None,
            has_smartphone=False if cash_payer and random.random() > 0.3 else True,
            property_type=random.choice(["own", "rented"]),
            monthly_bill_bucket=bill_bucket,
        )
        db.add(consumer)
        db.flush()

        # Billing
        for m in range(12, 0, -1):
            bill_date = date.today().replace(day=1) - timedelta(days=30 * m)
            bill_month = bill_date.strftime("%Y-%m")
            variation = random.uniform(0.7, 1.4)
            month_bill = round(bill_amount * variation, 2)
            due = bill_date + timedelta(days=15)
            db.add(models.BillingMonthly(
                consumer_id=consumer.id,
                billing_month=bill_month,
                units_consumed=round(avg_kwh * variation, 1),
                bill_amount=month_bill,
                bill_type="actual" if random.random() > 0.15 else "estimated",
                due_date=due,
                bill_generated_date=bill_date,
                slab_1_units=min(avg_kwh * variation, 100),
                slab_2_units=max(0, min(avg_kwh * variation - 100, 200)),
                slab_3_units=max(0, avg_kwh * variation - 300),
            ))

        # Payments
        payment_records = _make_payment_records(ptype)
        days_overdue = 0
        current_arrears = 0.0
        for i, rec in enumerate(payment_records):
            m = 12 - i
            bill_date = date.today().replace(day=1) - timedelta(days=30 * m)
            bill_month = bill_date.strftime("%Y-%m")
            due = bill_date + timedelta(days=15)
            paid = rec["amount_paid"]
            days_late = rec["days_after_due"]
            payment_date = (due + timedelta(days=days_late)) if paid > 0 else None
            if i == 0:
                days_overdue = max(0, days_late) if paid == 0 else max(0, days_late)
                current_arrears = rec["bill_amount"] if paid == 0 else 0
            db.add(models.PaymentHistory(
                consumer_id=consumer.id,
                billing_month=bill_month,
                amount_paid=paid,
                payment_date=payment_date,
                days_after_due=days_late,
                payment_channel=rec["payment_channel"],
                auto_debit_setup=(rec["payment_channel"] == "auto-debit"),
                amount_overdue=rec["bill_amount"] - paid if paid < rec["bill_amount"] else 0,
            ))

        # Complaints
        num_complaints = random.randint(*flags.get("complaints", (0, 1)))
        escalation = flags.get("escalation", False)
        oldest_complaint_days = 0
        has_active_complaint = flags.get("has_active_complaint", False)
        avg_tat = 0
        total_tat = 0
        for c_idx in range(num_complaints):
            c_age = random.randint(5, 90)
            c_date = date.today() - timedelta(days=c_age)
            is_open = (c_idx == 0 and has_active_complaint) or (random.random() > 0.6)
            res_days = random.randint(3, 40) if not is_open else None
            total_tat += res_days or 0
            if is_open and c_age > oldest_complaint_days:
                oldest_complaint_days = c_age
            db.add(models.ComplaintLog(
                consumer_id=consumer.id,
                complaint_date=c_date,
                category=random.choice(["billing", "metering", "supply", "other"]),
                description=fake.sentence(),
                status="open" if is_open else "resolved",
                resolution_date=None if is_open else c_date + timedelta(days=res_days or 7),
                days_to_resolve=res_days,
                escalation_flag=escalation and c_idx == 0,
                repeat_flag=num_complaints >= 3,
            ))
        avg_tat = total_tat / num_complaints if num_complaints > 0 else 0

        # Meter readings
        nilm_ev = flags.get("nilm_ev", False)
        nilm_ac = flags.get("nilm_ac", random.random() > 0.5)
        nilm_pump = random.random() > 0.8
        coincidence_factor = random.uniform(*flags.get("coincidence_factor", (0.1, 0.8)))
        flexible_load = random.uniform(*flags.get("flexible_load", (10, 70)))
        renewable_score = flags.get("renewable_score", None)
        if renewable_score:
            renewable_score = random.uniform(*renewable_score)
        else:
            renewable_score = random.uniform(10, 50)
        load_violation = flags.get("load_violation", False)
        tod_sensitivity = random.choice(["low", "medium", "high"])
        smart_meter = random.random() > 0.4

        for m in range(12, 0, -1):
            read_date = date.today().replace(day=1) - timedelta(days=30 * m)
            read_month = read_date.strftime("%Y-%m")
            peak = avg_kwh * coincidence_factor * random.uniform(0.8, 1.2)
            db.add(models.MeterReading(
                consumer_id=consumer.id,
                reading_month=read_month,
                peak_usage_kwh=round(peak, 1),
                off_peak_usage_kwh=round(avg_kwh - peak, 1),
                coincidence_factor=round(coincidence_factor, 2),
                load_violation_flag=load_violation,
                nilm_ac_flag=nilm_ac,
                nilm_ev_flag=nilm_ev,
                nilm_pump_flag=nilm_pump,
                estimated_reading=random.random() > 0.9,
                flexible_load_score=round(flexible_load, 1),
                renewable_score=round(renewable_score, 1),
            ))

        # Engagement
        app_logins = random.randint(15, 30) if digital else random.randint(0, 3) if cash_payer else random.randint(1, 10)
        notif_opens = random.randint(5, 15) if digital else random.randint(0, 2)
        whatsapp_responsive = not cash_payer and random.random() > 0.4
        preferred_channel = "app" if digital else "field" if cash_payer else random.choice(["whatsapp", "ivr", "app"])
        best_contact_time = random.choice(["morning", "afternoon", "evening"])
        field_visits = random.randint(*flags.get("field_visits", (0, 2)))

        db.add(models.EngagementLog(
            consumer_id=consumer.id,
            month=CURRENT_MONTH,
            app_logins=app_logins,
            notification_opens=notif_opens,
            preferred_channel=preferred_channel,
            best_contact_time=best_contact_time,
            digital_payment_flag=(payment_channel in ("UPI", "auto-debit")),
            whatsapp_responsive=whatsapp_responsive,
            field_visits_count=field_visits,
        ))

        # ── Compute Scores ──────────────────────────────────────────
        bills_last_6m = [bill_amount * random.uniform(0.7, 1.3) for _ in range(6)]
        current_bill = bills_last_6m[-1]
        if flags.get("bill_shock"):
            current_bill = bills_last_6m[0] * 2.0

        consumer_data = {
            "payment_records": payment_records,
            "current_arrears": current_arrears,
            "current_days_overdue": days_overdue,
            "coincidence_factor": coincidence_factor,
            "peak_usage_kwh": avg_kwh * coincidence_factor,
            "avg_monthly_kwh": avg_kwh,
            "nilm_ac": nilm_ac,
            "nilm_ev": nilm_ev,
            "nilm_pump": nilm_pump,
            "complaints_last_12m": [
                {"status": "open" if has_active_complaint and i == 0 else "resolved",
                 "escalation_flag": escalation and i == 0,
                 "repeat_flag": num_complaints >= 3,
                 "days_to_resolve": random.randint(3, 40)}
                for i in range(num_complaints)
            ],
            "bill_shock_flag": flags.get("bill_shock", False),
            "avg_resolution_tat": avg_tat,
            "app_logins": app_logins,
            "notification_opens": notif_opens,
            "digital_payment": payment_channel in ("UPI", "auto-debit"),
            "whatsapp_responsive": whatsapp_responsive,
            "has_smartphone": not cash_payer,
            "preferred_channel": preferred_channel,
            "flexible_load_score": flexible_load,
            "peak_coincidence": coincidence_factor,
            "engagement_score_raw": None,
            "tod_sensitivity": tod_sensitivity,
            "escalation_flag": escalation,
            "oldest_open_complaint_days": oldest_complaint_days,
            "current_bill": current_bill,
            "bills_last_6m": bills_last_6m,
        }

        computed = score_consumer(consumer_data)
        bill_shock_computed, bill_variance = computed["bill_shock_flag"], computed["bill_variance_pct"]

        score_record = models.ConsumerScore(
            consumer_id=consumer.id,
            billing_month=CURRENT_MONTH,
            revenue_risk_score=computed["revenue_risk_score"],
            peak_impact_score=computed["peak_impact_score"],
            complaint_risk_score=computed["complaint_risk_score"],
            engagement_score=computed["engagement_score"],
            dsm_readiness_score=computed["dsm_readiness_score"],
            regulatory_risk_flag=computed["regulatory_risk_flag"],
            bill_shock_flag=computed["bill_shock_flag"],
            bill_variance_pct=computed["bill_variance_pct"],
            days_overdue=days_overdue,
            total_arrears=current_arrears,
            consecutive_estimated_bills=random.randint(0, 3) if ptype in ("chronic_defaulter", "vacant_premises") else 0,
        )
        db.add(score_record)
        db.flush()

        # ── Assign Persona ──────────────────────────────────────────
        consumer_context = {
            "monthly_bill_bucket": bill_bucket,
            "nilm_ev": nilm_ev,
            "renewable_score": renewable_score,
            "avg_monthly_kwh": avg_kwh,
            "load_violation_flag": load_violation,
            "flexible_load_score": flexible_load,
            "escalation_flag": escalation,
            "field_visits_last_6m": field_visits,
            "digital_payment": payment_channel in ("UPI", "auto-debit"),
            "auto_debit_setup": payment_channel == "auto-debit",
            "payment_channel": payment_channel,
        }

        primary_key, secondary_key = assign_persona(computed, consumer_context)
        primary_info = get_persona_info(primary_key)
        secondary_info = get_persona_info(secondary_key) if secondary_key else None

        db.add(models.ConsumerPersona(
            consumer_id=consumer.id,
            billing_month=CURRENT_MONTH,
            primary_persona=primary_info["name"],
            primary_persona_key=primary_key,
            secondary_persona=secondary_info["name"] if secondary_info else None,
            secondary_persona_key=secondary_key,
        ))

        # ── Route Actions ───────────────────────────────────────────
        dt_obj = next((d for d in dts if d.id == dt.id), None)
        action_context = {
            **consumer_context,
            "name": consumer.name,
            "nilm_ac": nilm_ac,
            "coincidence_factor": coincidence_factor,
            "dt_peak_loading_pct": dt_obj.current_peak_load_pct if dt_obj else 70,
            "has_active_complaint": has_active_complaint,
            "avg_resolution_tat": avg_tat,
            "oldest_open_complaint_days": oldest_complaint_days,
            "bill_shock_flag": computed["bill_shock_flag"],
            "bill_variance_pct": computed["bill_variance_pct"],
            "repeat_complaint_flag": num_complaints >= 3,
            "consumption_spike_pct": max(0, computed["bill_variance_pct"]),
            "has_smart_meter": smart_meter,
            "tod_sensitivity": tod_sensitivity,
            "best_contact_time": best_contact_time,
            "whatsapp_responsive": whatsapp_responsive,
            "consecutive_estimated_bills": score_record.consecutive_estimated_bills,
        }

        action_records = route_actions(consumer.id, computed, action_context, CURRENT_MONTH)
        for ar in action_records[:5]:  # cap at 5 actions per consumer
            db.add(models.ActionQueue(**ar))

    # Update DT consumer counts
    for dt in dts:
        count = db.query(models.ConsumerMaster).filter_by(dt_id=dt.id).count()
        dt.consumer_count = count

    # Seed KPIs
    kpi_defs = [
        ("dso", "Days Sales Outstanding (DSO)", 30, 27.4, "days", "Collections"),
        ("accidental_default_rate", "Accidental Default Rate", 5, 6.2, "%", "Collections"),
        ("day15_conversion", "Day 15 Message Payment Conversion", 55, 58.3, "%", "Collections"),
        ("field_visit_resolution", "Field Visit Resolution Rate", 70, 67.1, "%", "Field Ops"),
        ("dr_enrolment_rate", "DR Programme Enrolment Rate", 15, 18.4, "%", "DSM"),
        ("dt_peak_reduction", "DT Peak Load Reduction Post-DSM", 15, 11.2, "%", "DSM/Network"),
        ("dispute_resolution_time", "Dispute Resolution Time", 15, 12.8, "days", "CX/Billing"),
        ("regulatory_escalation_rate", "Regulatory Escalation Rate", 0.5, 0.3, "%", "CX/Legal"),
        ("reconnection_time", "Reconnection Time (Urban)", 24, 18.5, "hours", "Field Ops"),
        ("autodebit_enrolment", "Auto-Debit Enrolment Rate", 20, 14.7, "%", "Digital"),
        ("writeoff_ratio", "Write-Off Ratio", 0.8, 0.6, "%", "Finance"),
        ("persona_drift_response", "Persona Drift Alert Response Time", 48, 31.0, "hours", "Operations"),
    ]
    for key, name, target, actual, unit, domain in kpi_defs:
        rag = "green" if actual <= target else ("amber" if actual <= target * 1.2 else "red")
        if key in ("accidental_default_rate", "day15_conversion", "field_visit_resolution",
                    "dr_enrolment_rate", "dt_peak_reduction", "autodebit_enrolment"):
            rag = "green" if actual >= target else ("amber" if actual >= target * 0.8 else "red")
        db.add(models.KPITracking(
            kpi_key=key,
            kpi_name=name,
            month=CURRENT_MONTH,
            target=target,
            actual=actual,
            unit=unit,
            domain=domain,
            rag_status=rag,
        ))

    db.commit()
    return {"status": "seeded", "consumers": total}
