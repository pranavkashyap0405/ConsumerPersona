from sqlalchemy import Column, Integer, String, Float, Boolean, Date, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base


class DTMaster(Base):
    __tablename__ = "dt_master"

    id = Column(Integer, primary_key=True, index=True)
    dt_code = Column(String, unique=True, index=True)
    name = Column(String)
    circle = Column(String)
    area = Column(String)
    capacity_kva = Column(Float)
    current_peak_load_pct = Column(Float)
    age_years = Column(Integer)
    consumer_count = Column(Integer, default=0)

    consumers = relationship("ConsumerMaster", back_populates="dt")


class ConsumerMaster(Base):
    __tablename__ = "consumer_master"

    id = Column(Integer, primary_key=True, index=True)
    consumer_number = Column(String, unique=True, index=True)
    name = Column(String)
    address = Column(String)
    circle = Column(String)
    area = Column(String)
    dt_id = Column(Integer, ForeignKey("dt_master.id"))
    consumer_type = Column(String)  # residential / commercial / industrial
    sanctioned_load_kw = Column(Float)
    connection_date = Column(Date)
    phone = Column(String)
    email = Column(String, nullable=True)
    has_smartphone = Column(Boolean, default=True)
    property_type = Column(String)  # own / rented
    monthly_bill_bucket = Column(String)  # low / medium / high (>5000)

    dt = relationship("DTMaster", back_populates="consumers")
    billing = relationship("BillingMonthly", back_populates="consumer")
    payments = relationship("PaymentHistory", back_populates="consumer")
    complaints = relationship("ComplaintLog", back_populates="consumer")
    meter_readings = relationship("MeterReading", back_populates="consumer")
    engagement = relationship("EngagementLog", back_populates="consumer")
    scores = relationship("ConsumerScore", back_populates="consumer")
    personas = relationship("ConsumerPersona", back_populates="consumer")
    actions = relationship("ActionQueue", back_populates="consumer")


class BillingMonthly(Base):
    __tablename__ = "billing_monthly"

    id = Column(Integer, primary_key=True, index=True)
    consumer_id = Column(Integer, ForeignKey("consumer_master.id"))
    billing_month = Column(String)  # YYYY-MM
    units_consumed = Column(Float)
    bill_amount = Column(Float)
    bill_type = Column(String)  # actual / estimated
    due_date = Column(Date)
    bill_generated_date = Column(Date)
    slab_1_units = Column(Float, default=0)
    slab_2_units = Column(Float, default=0)
    slab_3_units = Column(Float, default=0)

    consumer = relationship("ConsumerMaster", back_populates="billing")


class PaymentHistory(Base):
    __tablename__ = "payment_history"

    id = Column(Integer, primary_key=True, index=True)
    consumer_id = Column(Integer, ForeignKey("consumer_master.id"))
    billing_month = Column(String)
    amount_paid = Column(Float)
    payment_date = Column(Date, nullable=True)
    days_after_due = Column(Integer, nullable=True)  # negative = before due
    payment_channel = Column(String)  # UPI / cash / NEFT / auto-debit / unpaid
    auto_debit_setup = Column(Boolean, default=False)
    amount_overdue = Column(Float, default=0)

    consumer = relationship("ConsumerMaster", back_populates="payments")


class ComplaintLog(Base):
    __tablename__ = "complaint_log"

    id = Column(Integer, primary_key=True, index=True)
    consumer_id = Column(Integer, ForeignKey("consumer_master.id"))
    complaint_date = Column(Date)
    category = Column(String)  # billing / metering / supply / other
    description = Column(Text)
    status = Column(String)  # open / resolved / escalated
    resolution_date = Column(Date, nullable=True)
    days_to_resolve = Column(Integer, nullable=True)
    escalation_flag = Column(Boolean, default=False)
    repeat_flag = Column(Boolean, default=False)

    consumer = relationship("ConsumerMaster", back_populates="complaints")


class MeterReading(Base):
    __tablename__ = "meter_readings"

    id = Column(Integer, primary_key=True, index=True)
    consumer_id = Column(Integer, ForeignKey("consumer_master.id"))
    reading_month = Column(String)
    peak_usage_kwh = Column(Float)
    off_peak_usage_kwh = Column(Float)
    coincidence_factor = Column(Float)  # 0.0 - 1.0, how aligned with DT peak
    load_violation_flag = Column(Boolean, default=False)
    nilm_ac_flag = Column(Boolean, default=False)
    nilm_ev_flag = Column(Boolean, default=False)
    nilm_pump_flag = Column(Boolean, default=False)
    estimated_reading = Column(Boolean, default=False)
    flexible_load_score = Column(Float, default=0)  # 0-100
    renewable_score = Column(Float, default=0)  # 0-100

    consumer = relationship("ConsumerMaster", back_populates="meter_readings")


class EngagementLog(Base):
    __tablename__ = "engagement_log"

    id = Column(Integer, primary_key=True, index=True)
    consumer_id = Column(Integer, ForeignKey("consumer_master.id"))
    month = Column(String)
    app_logins = Column(Integer, default=0)
    notification_opens = Column(Integer, default=0)
    preferred_channel = Column(String)  # app / whatsapp / ivr / field
    best_contact_time = Column(String)  # morning / afternoon / evening
    digital_payment_flag = Column(Boolean, default=False)
    whatsapp_responsive = Column(Boolean, default=False)
    field_visits_count = Column(Integer, default=0)

    consumer = relationship("ConsumerMaster", back_populates="engagement")


class ConsumerScore(Base):
    __tablename__ = "consumer_scores"

    id = Column(Integer, primary_key=True, index=True)
    consumer_id = Column(Integer, ForeignKey("consumer_master.id"))
    billing_month = Column(String)
    revenue_risk_score = Column(Float, default=0)
    peak_impact_score = Column(Float, default=0)
    complaint_risk_score = Column(Float, default=0)
    engagement_score = Column(Float, default=0)
    dsm_readiness_score = Column(Float, default=0)
    regulatory_risk_flag = Column(Boolean, default=False)
    bill_shock_flag = Column(Boolean, default=False)
    bill_variance_pct = Column(Float, default=0)
    days_overdue = Column(Integer, default=0)
    total_arrears = Column(Float, default=0)
    consecutive_estimated_bills = Column(Integer, default=0)
    computed_at = Column(DateTime, default=datetime.utcnow)

    consumer = relationship("ConsumerMaster", back_populates="scores")


class ConsumerPersona(Base):
    __tablename__ = "consumer_personas"

    id = Column(Integer, primary_key=True, index=True)
    consumer_id = Column(Integer, ForeignKey("consumer_master.id"))
    billing_month = Column(String)
    primary_persona = Column(String)
    secondary_persona = Column(String, nullable=True)
    primary_persona_key = Column(String)
    secondary_persona_key = Column(String, nullable=True)
    assigned_at = Column(DateTime, default=datetime.utcnow)

    consumer = relationship("ConsumerMaster", back_populates="personas")


class ActionQueue(Base):
    __tablename__ = "action_queue"

    id = Column(Integer, primary_key=True, index=True)
    consumer_id = Column(Integer, ForeignKey("consumer_master.id"))
    scenario_id = Column(Integer)  # 1-24
    scenario_name = Column(String)
    recommended_action = Column(Text)
    team = Column(String)  # collections / dsm / field_ops / cx / billing / digital
    priority = Column(String)  # high / medium / low
    channel = Column(String)  # whatsapp / ivr / field / app / agent
    status = Column(String, default="pending")  # pending / dispatched / completed / cancelled
    billing_month = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime, nullable=True)
    dispatched_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    outcome = Column(String, nullable=True)  # paid / enrolled / resolved / no_response / escalated
    outcome_notes = Column(Text, nullable=True)

    consumer = relationship("ConsumerMaster", back_populates="actions")


class KPITracking(Base):
    __tablename__ = "kpi_tracking"

    id = Column(Integer, primary_key=True, index=True)
    kpi_key = Column(String)
    kpi_name = Column(String)
    month = Column(String)
    target = Column(Float)
    actual = Column(Float, nullable=True)
    unit = Column(String)
    domain = Column(String)
    rag_status = Column(String, nullable=True)  # green / amber / red
