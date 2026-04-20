// ── Static mock data — no backend required ──────────────────────────────────

const CONSUMERS = [
  { id: 1,  name: 'Rajan Mehta',         consumer_number: 'DL-N-001423', circle: 'North', area: 'Rohini',      dt_name: 'DT-N-04', phone: '9811001423', consumer_type: 'residential', monthly_bill_bucket: 'medium', sanctioned_load_kw: 5,  primary_persona_key: 'chronic_defaulter',         primary_persona: 'Chronic Defaulter',         revenue_risk_score: 87, engagement_score: 22, peak_impact_score: 55, complaint_risk_score: 68, dsm_readiness_score: 15, regulatory_risk_flag: false, total_arrears: 18400, days_overdue: 112 },
  { id: 2,  name: 'Priya Sharma',         consumer_number: 'DL-S-002187', circle: 'South', area: 'Saket',       dt_name: 'DT-S-11', phone: '9810002187', consumer_type: 'residential', monthly_bill_bucket: 'medium', sanctioned_load_kw: 3,  primary_persona_key: 'prompt_payer',              primary_persona: 'Prompt Payer',              revenue_risk_score: 8,  engagement_score: 91, peak_impact_score: 22, complaint_risk_score: 10, dsm_readiness_score: 82, regulatory_risk_flag: false, total_arrears: 0,     days_overdue: 0   },
  { id: 3,  name: 'Vikram Industries',    consumer_number: 'DL-E-003055', circle: 'East',  area: 'Patparganj',  dt_name: 'DT-E-02', phone: '9810003055', consumer_type: 'industrial',  monthly_bill_bucket: 'high',   sanctioned_load_kw: 75, primary_persona_key: 'industrial_peak_contributor', primary_persona: 'Industrial Peak Contributor', revenue_risk_score: 18, engagement_score: 65, peak_impact_score: 91, complaint_risk_score: 28, dsm_readiness_score: 55, regulatory_risk_flag: false, total_arrears: 0,     days_overdue: 0   },
  { id: 4,  name: 'Sunita Devi',          consumer_number: 'DL-W-004812', circle: 'West',  area: 'Dwarka',      dt_name: 'DT-W-07', phone: '9811004812', consumer_type: 'residential', monthly_bill_bucket: 'low',    sanctioned_load_kw: 1,  primary_persona_key: 'low_income_subsidized',     primary_persona: 'Low Income / Subsidized',   revenue_risk_score: 42, engagement_score: 31, peak_impact_score: 12, complaint_risk_score: 38, dsm_readiness_score: 20, regulatory_risk_flag: false, total_arrears: 3200,  days_overdue: 58  },
  { id: 5,  name: 'Abdul Karim',          consumer_number: 'DL-N-005341', circle: 'North', area: 'Karol Bagh',  dt_name: 'DT-N-09', phone: '9811005341', consumer_type: 'residential', monthly_bill_bucket: 'high',   sanctioned_load_kw: 10, primary_persona_key: 'at_risk_high_value',        primary_persona: 'At-Risk High Value',        revenue_risk_score: 71, engagement_score: 44, peak_impact_score: 63, complaint_risk_score: 52, dsm_readiness_score: 38, regulatory_risk_flag: false, total_arrears: 42000, days_overdue: 84  },
  { id: 6,  name: 'Kavya Nair',           consumer_number: 'DL-S-006009', circle: 'South', area: 'Malviya Nagar', dt_name: 'DT-S-03', phone: '9810006009', consumer_type: 'residential', monthly_bill_bucket: 'medium', sanctioned_load_kw: 4,  primary_persona_key: 'digital_champion',          primary_persona: 'Digital Champion',          revenue_risk_score: 5,  engagement_score: 97, peak_impact_score: 30, complaint_risk_score: 8,  dsm_readiness_score: 90, regulatory_risk_flag: false, total_arrears: 0,     days_overdue: 0   },
  { id: 7,  name: 'Mohan Lal Verma',      consumer_number: 'DL-E-007234', circle: 'East',  area: 'Laxmi Nagar', dt_name: 'DT-E-06', phone: '9810007234', consumer_type: 'residential', monthly_bill_bucket: 'medium', sanctioned_load_kw: 3,  primary_persona_key: 'accidental_late_payer',     primary_persona: 'Accidental Late Payer',     revenue_risk_score: 38, engagement_score: 55, peak_impact_score: 25, complaint_risk_score: 22, dsm_readiness_score: 48, regulatory_risk_flag: false, total_arrears: 2800,  days_overdue: 35  },
  { id: 8,  name: 'Seema Gupta',          consumer_number: 'DL-W-008761', circle: 'West',  area: 'Janakpuri',   dt_name: 'DT-W-02', phone: '9811008761', consumer_type: 'residential', monthly_bill_bucket: 'medium', sanctioned_load_kw: 5,  primary_persona_key: 'bill_shock_prone',          primary_persona: 'Bill Shock Prone',          revenue_risk_score: 52, engagement_score: 60, peak_impact_score: 38, complaint_risk_score: 61, dsm_readiness_score: 44, regulatory_risk_flag: false, total_arrears: 7100,  days_overdue: 48  },
  { id: 9,  name: 'Ahmed Khan',           consumer_number: 'DL-N-009128', circle: 'North', area: 'Pitampura',   dt_name: 'DT-N-12', phone: '9811009128', consumer_type: 'residential', monthly_bill_bucket: 'medium', sanctioned_load_kw: 4,  primary_persona_key: 'ombudsman_escalator',       primary_persona: 'Ombudsman Escalator',       revenue_risk_score: 63, engagement_score: 38, peak_impact_score: 28, complaint_risk_score: 88, dsm_readiness_score: 22, regulatory_risk_flag: true,  total_arrears: 9500,  days_overdue: 67  },
  { id: 10, name: 'Raj Solar Pvt Ltd',    consumer_number: 'DL-S-010445', circle: 'South', area: 'Vasant Kunj', dt_name: 'DT-S-08', phone: '9810010445', consumer_type: 'commercial',  monthly_bill_bucket: 'high',   sanctioned_load_kw: 20, primary_persona_key: 'rooftop_solar',             primary_persona: 'Rooftop Solar / Prosumer',  revenue_risk_score: 12, engagement_score: 83, peak_impact_score: 18, complaint_risk_score: 15, dsm_readiness_score: 92, regulatory_risk_flag: false, total_arrears: 0,     days_overdue: 0   },
  { id: 11, name: 'Harish Chandra',       consumer_number: 'DL-E-011882', circle: 'East',  area: 'Shahdara',    dt_name: 'DT-E-09', phone: '9810011882', consumer_type: 'residential', monthly_bill_bucket: 'low',    sanctioned_load_kw: 2,  primary_persona_key: 'chronic_defaulter',         primary_persona: 'Chronic Defaulter',         revenue_risk_score: 91, engagement_score: 18, peak_impact_score: 14, complaint_risk_score: 72, dsm_readiness_score: 10, regulatory_risk_flag: true,  total_arrears: 24600, days_overdue: 145 },
  { id: 12, name: 'Deepa Krishnan',       consumer_number: 'DL-W-012344', circle: 'West',  area: 'Uttam Nagar', dt_name: 'DT-W-11', phone: '9811012344', consumer_type: 'residential', monthly_bill_bucket: 'medium', sanctioned_load_kw: 3,  primary_persona_key: 'loyal_long_tenure',         primary_persona: 'Loyal Long-Tenure',         revenue_risk_score: 11, engagement_score: 74, peak_impact_score: 20, complaint_risk_score: 14, dsm_readiness_score: 68, regulatory_risk_flag: false, total_arrears: 0,     days_overdue: 0   },
  { id: 13, name: 'Suresh Auto Works',    consumer_number: 'DL-N-013671', circle: 'North', area: 'Wazirpur',    dt_name: 'DT-N-06', phone: '9811013671', consumer_type: 'commercial',  monthly_bill_bucket: 'high',   sanctioned_load_kw: 15, primary_persona_key: 'strategic_defaulter',       primary_persona: 'Strategic Defaulter',       revenue_risk_score: 79, engagement_score: 42, peak_impact_score: 58, complaint_risk_score: 44, dsm_readiness_score: 28, regulatory_risk_flag: true,  total_arrears: 61000, days_overdue: 180 },
  { id: 14, name: 'Anita Bose',           consumer_number: 'DL-S-014920', circle: 'South', area: 'Lajpat Nagar', dt_name: 'DT-S-06', phone: '9810014920', consumer_type: 'residential', monthly_bill_bucket: 'medium', sanctioned_load_kw: 4,  primary_persona_key: 'seasonal_defaulter',        primary_persona: 'Seasonal Defaulter',        revenue_risk_score: 55, engagement_score: 50, peak_impact_score: 32, complaint_risk_score: 35, dsm_readiness_score: 42, regulatory_risk_flag: false, total_arrears: 5400,  days_overdue: 44  },
  { id: 15, name: 'EV Charge Hub',        consumer_number: 'DL-E-015203', circle: 'East',  area: 'Mayur Vihar', dt_name: 'DT-E-04', phone: '9810015203', consumer_type: 'commercial',  monthly_bill_bucket: 'high',   sanctioned_load_kw: 30, primary_persona_key: 'ev_adopter',                primary_persona: 'EV Adopter',                revenue_risk_score: 9,  engagement_score: 88, peak_impact_score: 77, complaint_risk_score: 11, dsm_readiness_score: 85, regulatory_risk_flag: false, total_arrears: 0,     days_overdue: 0   },
  { id: 16, name: 'Omega Mall',           consumer_number: 'DL-W-016588', circle: 'West',  area: 'Rajouri Garden', dt_name: 'DT-W-04', phone: '9811016588', consumer_type: 'commercial', monthly_bill_bucket: 'high',  sanctioned_load_kw: 60, primary_persona_key: 'commercial_nighttime',      primary_persona: 'Commercial Nighttime',      revenue_risk_score: 22, engagement_score: 70, peak_impact_score: 45, complaint_risk_score: 18, dsm_readiness_score: 61, regulatory_risk_flag: false, total_arrears: 0,     days_overdue: 0   },
  { id: 17, name: 'Ramesh Prasad',        consumer_number: 'DL-N-017041', circle: 'North', area: 'Shalimar Bagh', dt_name: 'DT-N-03', phone: '9811017041', consumer_type: 'residential', monthly_bill_bucket: 'low',   sanctioned_load_kw: 1,  primary_persona_key: 'new_consumer',              primary_persona: 'New Consumer',              revenue_risk_score: 28, engagement_score: 68, peak_impact_score: 10, complaint_risk_score: 20, dsm_readiness_score: 62, regulatory_risk_flag: false, total_arrears: 0,     days_overdue: 0   },
  { id: 18, name: 'Sunrise Apartments',   consumer_number: 'DL-S-018729', circle: 'South', area: 'Dwarka Sec 12', dt_name: 'DT-S-14', phone: '9810018729', consumer_type: 'residential', monthly_bill_bucket: 'high',  sanctioned_load_kw: 40, primary_persona_key: 'large_apartment_complex',   primary_persona: 'Large Apartment Complex',   revenue_risk_score: 33, engagement_score: 72, peak_impact_score: 68, complaint_risk_score: 40, dsm_readiness_score: 74, regulatory_risk_flag: false, total_arrears: 8200,  days_overdue: 30  },
  { id: 19, name: 'Naveen Kumar',         consumer_number: 'DL-E-019314', circle: 'East',  area: 'Dilshad Garden', dt_name: 'DT-E-07', phone: '9810019314', consumer_type: 'residential', monthly_bill_bucket: 'medium', sanctioned_load_kw: 3,  primary_persona_key: 'flexible_load_consumer',    primary_persona: 'Flexible Load Consumer',    revenue_risk_score: 16, engagement_score: 79, peak_impact_score: 36, complaint_risk_score: 13, dsm_readiness_score: 88, regulatory_risk_flag: false, total_arrears: 0,     days_overdue: 0   },
  { id: 20, name: 'Pankaj Singh',         consumer_number: 'DL-W-020655', circle: 'West',  area: 'Palam',        dt_name: 'DT-W-09', phone: '9811020655', consumer_type: 'residential', monthly_bill_bucket: 'medium', sanctioned_load_kw: 5,  primary_persona_key: 'chronic_defaulter',         primary_persona: 'Chronic Defaulter',         revenue_risk_score: 84, engagement_score: 20, peak_impact_score: 42, complaint_risk_score: 60, dsm_readiness_score: 12, regulatory_risk_flag: false, total_arrears: 16800, days_overdue: 98  },
  { id: 21, name: 'Lalita Devi',          consumer_number: 'DL-N-021088', circle: 'North', area: 'Rohini',       dt_name: 'DT-N-04', phone: '9811021088', consumer_type: 'residential', monthly_bill_bucket: 'low',    sanctioned_load_kw: 1,  primary_persona_key: 'low_income_subsidized',     primary_persona: 'Low Income / Subsidized',   revenue_risk_score: 48, engagement_score: 25, peak_impact_score: 8,  complaint_risk_score: 44, dsm_readiness_score: 15, regulatory_risk_flag: false, total_arrears: 4100,  days_overdue: 62  },
  { id: 22, name: 'Metro Cold Storage',   consumer_number: 'DL-S-022417', circle: 'South', area: 'Okhla',        dt_name: 'DT-S-10', phone: '9810022417', consumer_type: 'industrial',  monthly_bill_bucket: 'high',   sanctioned_load_kw: 80, primary_persona_key: 'industrial_peak_contributor', primary_persona: 'Industrial Peak Contributor', revenue_risk_score: 24, engagement_score: 60, peak_impact_score: 94, complaint_risk_score: 20, dsm_readiness_score: 50, regulatory_risk_flag: false, total_arrears: 0,     days_overdue: 0   },
  { id: 23, name: 'Rekha Aggarwal',       consumer_number: 'DL-E-023780', circle: 'East',  area: 'Preet Vihar',  dt_name: 'DT-E-05', phone: '9810023780', consumer_type: 'residential', monthly_bill_bucket: 'medium', sanctioned_load_kw: 4,  primary_persona_key: 'prompt_payer',              primary_persona: 'Prompt Payer',              revenue_risk_score: 7,  engagement_score: 85, peak_impact_score: 26, complaint_risk_score: 9,  dsm_readiness_score: 78, regulatory_risk_flag: false, total_arrears: 0,     days_overdue: 0   },
  { id: 24, name: 'Vijay Textiles',       consumer_number: 'DL-W-024109', circle: 'West',  area: 'Tilak Nagar',  dt_name: 'DT-W-06', phone: '9811024109', consumer_type: 'commercial',  monthly_bill_bucket: 'high',   sanctioned_load_kw: 25, primary_persona_key: 'at_risk_high_value',        primary_persona: 'At-Risk High Value',        revenue_risk_score: 68, engagement_score: 48, peak_impact_score: 60, complaint_risk_score: 50, dsm_readiness_score: 34, regulatory_risk_flag: false, total_arrears: 38500, days_overdue: 76  },
  { id: 25, name: 'Sanjay Malhotra',      consumer_number: 'DL-N-025334', circle: 'North', area: 'Ashok Vihar',  dt_name: 'DT-N-08', phone: '9811025334', consumer_type: 'residential', monthly_bill_bucket: 'medium', sanctioned_load_kw: 5,  primary_persona_key: 'bill_shock_prone',          primary_persona: 'Bill Shock Prone',          revenue_risk_score: 49, engagement_score: 58, peak_impact_score: 35, complaint_risk_score: 58, dsm_readiness_score: 40, regulatory_risk_flag: false, total_arrears: 6300,  days_overdue: 41  },
  { id: 26, name: 'Meena Joshi',          consumer_number: 'DL-S-026771', circle: 'South', area: 'Green Park',   dt_name: 'DT-S-02', phone: '9810026771', consumer_type: 'residential', monthly_bill_bucket: 'medium', sanctioned_load_kw: 3,  primary_persona_key: 'accidental_late_payer',     primary_persona: 'Accidental Late Payer',     revenue_risk_score: 35, engagement_score: 62, peak_impact_score: 22, complaint_risk_score: 28, dsm_readiness_score: 55, regulatory_risk_flag: false, total_arrears: 3100,  days_overdue: 32  },
  { id: 27, name: 'Delhi Bakery Chain',   consumer_number: 'DL-E-027445', circle: 'East',  area: 'Vishwas Nagar', dt_name: 'DT-E-08', phone: '9810027445', consumer_type: 'commercial', monthly_bill_bucket: 'high',   sanctioned_load_kw: 18, primary_persona_key: 'commercial_nighttime',      primary_persona: 'Commercial Nighttime',      revenue_risk_score: 19, engagement_score: 67, peak_impact_score: 42, complaint_risk_score: 16, dsm_readiness_score: 60, regulatory_risk_flag: false, total_arrears: 0,     days_overdue: 0   },
  { id: 28, name: 'Furqan Ahmed',         consumer_number: 'DL-W-028918', circle: 'West',  area: 'Najafgarh',    dt_name: 'DT-W-12', phone: '9811028918', consumer_type: 'residential', monthly_bill_bucket: 'low',    sanctioned_load_kw: 2,  primary_persona_key: 'chronic_defaulter',         primary_persona: 'Chronic Defaulter',         revenue_risk_score: 88, engagement_score: 15, peak_impact_score: 18, complaint_risk_score: 65, dsm_readiness_score: 8,  regulatory_risk_flag: true,  total_arrears: 21300, days_overdue: 130 },
  { id: 29, name: 'Tara Singh',           consumer_number: 'DL-N-029201', circle: 'North', area: 'Model Town',   dt_name: 'DT-N-01', phone: '9811029201', consumer_type: 'residential', monthly_bill_bucket: 'medium', sanctioned_load_kw: 4,  primary_persona_key: 'loyal_long_tenure',         primary_persona: 'Loyal Long-Tenure',         revenue_risk_score: 9,  engagement_score: 76, peak_impact_score: 28, complaint_risk_score: 12, dsm_readiness_score: 72, regulatory_risk_flag: false, total_arrears: 0,     days_overdue: 0   },
  { id: 30, name: 'Gita Rani',            consumer_number: 'DL-S-030589', circle: 'South', area: 'Tughlakabad',  dt_name: 'DT-S-12', phone: '9810030589', consumer_type: 'residential', monthly_bill_bucket: 'low',    sanctioned_load_kw: 1,  primary_persona_key: 'low_income_subsidized',     primary_persona: 'Low Income / Subsidized',   revenue_risk_score: 44, engagement_score: 29, peak_impact_score: 9,  complaint_risk_score: 36, dsm_readiness_score: 18, regulatory_risk_flag: false, total_arrears: 3800,  days_overdue: 55  },
  { id: 31, name: 'Power Weave Mills',    consumer_number: 'DL-E-031044', circle: 'East',  area: 'Mandoli',      dt_name: 'DT-E-01', phone: '9810031044', consumer_type: 'industrial',  monthly_bill_bucket: 'high',   sanctioned_load_kw: 100,primary_persona_key: 'industrial_peak_contributor', primary_persona: 'Industrial Peak Contributor', revenue_risk_score: 15, engagement_score: 58, peak_impact_score: 96, complaint_risk_score: 22, dsm_readiness_score: 48, regulatory_risk_flag: false, total_arrears: 0,     days_overdue: 0   },
  { id: 32, name: 'Rohit Kapoor',         consumer_number: 'DL-W-032417', circle: 'West',  area: 'Subhash Nagar', dt_name: 'DT-W-03', phone: '9811032417', consumer_type: 'residential', monthly_bill_bucket: 'medium', sanctioned_load_kw: 3,  primary_persona_key: 'digital_champion',          primary_persona: 'Digital Champion',          revenue_risk_score: 6,  engagement_score: 94, peak_impact_score: 24, complaint_risk_score: 7,  dsm_readiness_score: 88, regulatory_risk_flag: false, total_arrears: 0,     days_overdue: 0   },
  { id: 33, name: 'SunGreen Homes',       consumer_number: 'DL-N-033780', circle: 'North', area: 'Dwarka Sec 10', dt_name: 'DT-N-11', phone: '9811033780', consumer_type: 'residential', monthly_bill_bucket: 'high',  sanctioned_load_kw: 8,  primary_persona_key: 'rooftop_solar',             primary_persona: 'Rooftop Solar / Prosumer',  revenue_risk_score: 10, engagement_score: 87, peak_impact_score: 16, complaint_risk_score: 12, dsm_readiness_score: 91, regulatory_risk_flag: false, total_arrears: 0,     days_overdue: 0   },
  { id: 34, name: 'Charanjit Dhillon',    consumer_number: 'DL-S-034122', circle: 'South', area: 'Mehrauli',     dt_name: 'DT-S-07', phone: '9810034122', consumer_type: 'residential', monthly_bill_bucket: 'medium', sanctioned_load_kw: 4,  primary_persona_key: 'seasonal_defaulter',        primary_persona: 'Seasonal Defaulter',        revenue_risk_score: 51, engagement_score: 52, peak_impact_score: 30, complaint_risk_score: 34, dsm_readiness_score: 44, regulatory_risk_flag: false, total_arrears: 4900,  days_overdue: 40  },
  { id: 35, name: 'Nisha Pillai',         consumer_number: 'DL-E-035488', circle: 'East',  area: 'Geeta Colony', dt_name: 'DT-E-03', phone: '9810035488', consumer_type: 'residential', monthly_bill_bucket: 'medium', sanctioned_load_kw: 3,  primary_persona_key: 'flexible_load_consumer',    primary_persona: 'Flexible Load Consumer',    revenue_risk_score: 14, engagement_score: 82, peak_impact_score: 34, complaint_risk_score: 11, dsm_readiness_score: 86, regulatory_risk_flag: false, total_arrears: 0,     days_overdue: 0   },
  { id: 36, name: 'Zara Boutique',        consumer_number: 'DL-W-036801', circle: 'West',  area: 'Punjabi Bagh', dt_name: 'DT-W-05', phone: '9811036801', consumer_type: 'commercial',  monthly_bill_bucket: 'medium', sanctioned_load_kw: 8,  primary_persona_key: 'strategic_defaulter',       primary_persona: 'Strategic Defaulter',       revenue_risk_score: 76, engagement_score: 44, peak_impact_score: 48, complaint_risk_score: 42, dsm_readiness_score: 26, regulatory_risk_flag: true,  total_arrears: 52000, days_overdue: 160 },
  { id: 37, name: 'Ramakrishna Iyer',     consumer_number: 'DL-N-037144', circle: 'North', area: 'Pitampura',    dt_name: 'DT-N-12', phone: '9811037144', consumer_type: 'residential', monthly_bill_bucket: 'medium', sanctioned_load_kw: 5,  primary_persona_key: 'prompt_payer',              primary_persona: 'Prompt Payer',              revenue_risk_score: 10, engagement_score: 88, peak_impact_score: 24, complaint_risk_score: 11, dsm_readiness_score: 80, regulatory_risk_flag: false, total_arrears: 0,     days_overdue: 0   },
  { id: 38, name: 'Bhavna Thakkar',       consumer_number: 'DL-S-038507', circle: 'South', area: 'CR Park',      dt_name: 'DT-S-05', phone: '9810038507', consumer_type: 'residential', monthly_bill_bucket: 'medium', sanctioned_load_kw: 3,  primary_persona_key: 'accidental_late_payer',     primary_persona: 'Accidental Late Payer',     revenue_risk_score: 32, engagement_score: 64, peak_impact_score: 21, complaint_risk_score: 26, dsm_readiness_score: 58, regulatory_risk_flag: false, total_arrears: 2400,  days_overdue: 28  },
  { id: 39, name: 'Icon EV Charging',     consumer_number: 'DL-E-039870', circle: 'East',  area: 'Noida Link Rd', dt_name: 'DT-E-04', phone: '9810039870', consumer_type: 'commercial', monthly_bill_bucket: 'high',   sanctioned_load_kw: 45, primary_persona_key: 'ev_adopter',                primary_persona: 'EV Adopter',                revenue_risk_score: 7,  engagement_score: 91, peak_impact_score: 80, complaint_risk_score: 9,  dsm_readiness_score: 88, regulatory_risk_flag: false, total_arrears: 0,     days_overdue: 0   },
  { id: 40, name: 'Himanshu Rawat',       consumer_number: 'DL-W-040213', circle: 'West',  area: 'Vikaspuri',    dt_name: 'DT-W-08', phone: '9811040213', consumer_type: 'residential', monthly_bill_bucket: 'medium', sanctioned_load_kw: 4,  primary_persona_key: 'new_consumer',              primary_persona: 'New Consumer',              revenue_risk_score: 20, engagement_score: 72, peak_impact_score: 16, complaint_risk_score: 18, dsm_readiness_score: 65, regulatory_risk_flag: false, total_arrears: 0,     days_overdue: 0   },
  { id: 41, name: 'Paradise Towers RWA',  consumer_number: 'DL-N-041556', circle: 'North', area: 'Rohini Sec 7', dt_name: 'DT-N-04', phone: '9811041556', consumer_type: 'residential', monthly_bill_bucket: 'high',   sanctioned_load_kw: 50, primary_persona_key: 'large_apartment_complex',   primary_persona: 'Large Apartment Complex',   revenue_risk_score: 30, engagement_score: 68, peak_impact_score: 62, complaint_risk_score: 38, dsm_readiness_score: 71, regulatory_risk_flag: false, total_arrears: 6800,  days_overdue: 25  },
  { id: 42, name: 'Laleh Fashions',       consumer_number: 'DL-S-042899', circle: 'South', area: 'Hauz Khas',    dt_name: 'DT-S-01', phone: '9810042899', consumer_type: 'commercial',  monthly_bill_bucket: 'medium', sanctioned_load_kw: 6,  primary_persona_key: 'at_risk_high_value',        primary_persona: 'At-Risk High Value',        revenue_risk_score: 66, engagement_score: 46, peak_impact_score: 44, complaint_risk_score: 48, dsm_readiness_score: 32, regulatory_risk_flag: false, total_arrears: 29000, days_overdue: 65  },
  { id: 43, name: 'Om Prakash',           consumer_number: 'DL-E-043172', circle: 'East',  area: 'Shakarpur',    dt_name: 'DT-E-06', phone: '9810043172', consumer_type: 'residential', monthly_bill_bucket: 'low',    sanctioned_load_kw: 1,  primary_persona_key: 'chronic_defaulter',         primary_persona: 'Chronic Defaulter',         revenue_risk_score: 93, engagement_score: 12, peak_impact_score: 11, complaint_risk_score: 70, dsm_readiness_score: 8,  regulatory_risk_flag: true,  total_arrears: 31400, days_overdue: 158 },
  { id: 44, name: 'Sarla Watts',          consumer_number: 'DL-W-044515', circle: 'West',  area: 'Tilak Nagar',  dt_name: 'DT-W-06', phone: '9811044515', consumer_type: 'residential', monthly_bill_bucket: 'medium', sanctioned_load_kw: 3,  primary_persona_key: 'bill_shock_prone',          primary_persona: 'Bill Shock Prone',          revenue_risk_score: 54, engagement_score: 57, peak_impact_score: 33, complaint_risk_score: 62, dsm_readiness_score: 42, regulatory_risk_flag: false, total_arrears: 7800,  days_overdue: 50  },
  { id: 45, name: 'Greenfield Nursery',   consumer_number: 'DL-N-045858', circle: 'North', area: 'Narela',       dt_name: 'DT-N-10', phone: '9811045858', consumer_type: 'commercial',  monthly_bill_bucket: 'medium', sanctioned_load_kw: 10, primary_persona_key: 'flexible_load_consumer',    primary_persona: 'Flexible Load Consumer',    revenue_risk_score: 17, engagement_score: 77, peak_impact_score: 38, complaint_risk_score: 14, dsm_readiness_score: 84, regulatory_risk_flag: false, total_arrears: 0,     days_overdue: 0   },
  { id: 46, name: 'Pradeep Chauhan',      consumer_number: 'DL-S-046191', circle: 'South', area: 'Sangam Vihar', dt_name: 'DT-S-13', phone: '9810046191', consumer_type: 'residential', monthly_bill_bucket: 'low',    sanctioned_load_kw: 2,  primary_persona_key: 'low_income_subsidized',     primary_persona: 'Low Income / Subsidized',   revenue_risk_score: 46, engagement_score: 28, peak_impact_score: 10, complaint_risk_score: 40, dsm_readiness_score: 16, regulatory_risk_flag: false, total_arrears: 3500,  days_overdue: 52  },
  { id: 47, name: 'Moonlight Hotel',      consumer_number: 'DL-E-047534', circle: 'East',  area: 'Karkardooma',  dt_name: 'DT-E-10', phone: '9810047534', consumer_type: 'commercial',  monthly_bill_bucket: 'high',   sanctioned_load_kw: 35, primary_persona_key: 'commercial_nighttime',      primary_persona: 'Commercial Nighttime',      revenue_risk_score: 21, engagement_score: 71, peak_impact_score: 50, complaint_risk_score: 17, dsm_readiness_score: 63, regulatory_risk_flag: false, total_arrears: 0,     days_overdue: 0   },
  { id: 48, name: 'Ashok Kumar Goel',     consumer_number: 'DL-W-048877', circle: 'West',  area: 'Paschim Vihar', dt_name: 'DT-W-10', phone: '9811048877', consumer_type: 'residential', monthly_bill_bucket: 'medium', sanctioned_load_kw: 5,  primary_persona_key: 'loyal_long_tenure',         primary_persona: 'Loyal Long-Tenure',         revenue_risk_score: 12, engagement_score: 75, peak_impact_score: 25, complaint_risk_score: 13, dsm_readiness_score: 70, regulatory_risk_flag: false, total_arrears: 0,     days_overdue: 0   },
  { id: 49, name: 'Nandini Rao',          consumer_number: 'DL-N-049220', circle: 'North', area: 'Mukherjee Nagar', dt_name: 'DT-N-07', phone: '9811049220', consumer_type: 'residential', monthly_bill_bucket: 'medium', sanctioned_load_kw: 3, primary_persona_key: 'digital_champion',          primary_persona: 'Digital Champion',          revenue_risk_score: 4,  engagement_score: 96, peak_impact_score: 20, complaint_risk_score: 6,  dsm_readiness_score: 92, regulatory_risk_flag: false, total_arrears: 0,     days_overdue: 0   },
  { id: 50, name: 'Shiv Pharma',          consumer_number: 'DL-S-050563', circle: 'South', area: 'Okhla Phase II', dt_name: 'DT-S-10', phone: '9810050563', consumer_type: 'industrial', monthly_bill_bucket: 'high',   sanctioned_load_kw: 55, primary_persona_key: 'industrial_peak_contributor', primary_persona: 'Industrial Peak Contributor', revenue_risk_score: 20, engagement_score: 62, peak_impact_score: 88, complaint_risk_score: 24, dsm_readiness_score: 52, regulatory_risk_flag: false, total_arrears: 0,     days_overdue: 0   },
]

const ACTIONS = [
  // Collections
  { id: 101, consumer_id: 1,  consumer_name: 'Rajan Mehta',       scenario_id: 1,  scenario_name: 'Multi-Cycle Default Recovery',    team: 'collections',        priority: 'high',   action_type: 'sms_reminder',    status: 'pending', due_date: '2026-04-22', notes: 'Send legal warning + payment link' },
  { id: 102, consumer_id: 11, consumer_name: 'Harish Chandra',    scenario_id: 1,  scenario_name: 'Multi-Cycle Default Recovery',    team: 'senior_collections', priority: 'high',   action_type: 'legal_notice',    status: 'pending', due_date: '2026-04-21', notes: 'Prepare legal notice for 145-day default' },
  { id: 103, consumer_id: 28, consumer_name: 'Furqan Ahmed',      scenario_id: 1,  scenario_name: 'Multi-Cycle Default Recovery',    team: 'senior_collections', priority: 'high',   action_type: 'legal_notice',    status: 'pending', due_date: '2026-04-21', notes: 'Regulatory flag — escalate to senior officer' },
  { id: 104, consumer_id: 43, consumer_name: 'Om Prakash',        scenario_id: 1,  scenario_name: 'Multi-Cycle Default Recovery',    team: 'senior_collections', priority: 'high',   action_type: 'disconnection',   status: 'pending', due_date: '2026-04-20', notes: 'Disconnection order ready' },
  { id: 105, consumer_id: 13, consumer_name: 'Suresh Auto Works', scenario_id: 2,  scenario_name: 'Strategic Defaulter Escalation', team: 'senior_collections', priority: 'high',   action_type: 'legal_notice',    status: 'pending', due_date: '2026-04-22', notes: 'Commercial entity — coordinate with legal' },
  { id: 106, consumer_id: 36, consumer_name: 'Zara Boutique',     scenario_id: 2,  scenario_name: 'Strategic Defaulter Escalation', team: 'senior_collections', priority: 'high',   action_type: 'legal_notice',    status: 'pending', due_date: '2026-04-22', notes: 'Attach asset enquiry request' },
  { id: 107, consumer_id: 20, consumer_name: 'Pankaj Singh',      scenario_id: 3,  scenario_name: 'Chronic Low-Value Recovery',      team: 'collections',        priority: 'medium', action_type: 'field_visit',     status: 'pending', due_date: '2026-04-25', notes: 'Door collection + payment plan offer' },
  { id: 108, consumer_id: 4,  consumer_name: 'Sunita Devi',       scenario_id: 8,  scenario_name: 'Subsidized Consumer Hardship',    team: 'cx',                 priority: 'medium', action_type: 'outreach_call',   status: 'pending', due_date: '2026-04-24', notes: 'Offer installment plan, check subsidy eligibility' },
  { id: 109, consumer_id: 21, consumer_name: 'Lalita Devi',       scenario_id: 8,  scenario_name: 'Subsidized Consumer Hardship',    team: 'cx',                 priority: 'medium', action_type: 'outreach_call',   status: 'pending', due_date: '2026-04-24', notes: 'Offer installment plan' },
  { id: 110, consumer_id: 30, consumer_name: 'Gita Rani',         scenario_id: 8,  scenario_name: 'Subsidized Consumer Hardship',    team: 'cx',                 priority: 'medium', action_type: 'outreach_call',   status: 'pending', due_date: '2026-04-25', notes: 'Arrange field counsellor visit' },
  { id: 111, consumer_id: 5,  consumer_name: 'Abdul Karim',       scenario_id: 4,  scenario_name: 'High-Value At-Risk Recovery',     team: 'senior_collections', priority: 'high',   action_type: 'personal_visit',  status: 'pending', due_date: '2026-04-21', notes: 'Senior officer personal visit + restructuring proposal' },
  { id: 112, consumer_id: 24, consumer_name: 'Vijay Textiles',    scenario_id: 4,  scenario_name: 'High-Value At-Risk Recovery',     team: 'senior_collections', priority: 'high',   action_type: 'personal_visit',  status: 'pending', due_date: '2026-04-21', notes: 'Dedicated account manager call' },
  { id: 113, consumer_id: 42, consumer_name: 'Laleh Fashions',    scenario_id: 4,  scenario_name: 'High-Value At-Risk Recovery',     team: 'collections',        priority: 'high',   action_type: 'sms_reminder',    status: 'pending', due_date: '2026-04-22', notes: 'WhatsApp payment link + EMI offer' },
  { id: 114, consumer_id: 9,  consumer_name: 'Ahmed Khan',        scenario_id: 6,  scenario_name: 'Ombudsman Risk De-escalation',    team: 'cx',                 priority: 'high',   action_type: 'grievance_review', status: 'pending', due_date: '2026-04-21', notes: 'CX head to personally handle — 30 day resolution window' },
  { id: 115, consumer_id: 7,  consumer_name: 'Mohan Lal Verma',   scenario_id: 7,  scenario_name: 'Gentle Reminder — Accidental',    team: 'digital',            priority: 'low',    action_type: 'push_notification', status: 'pending', due_date: '2026-04-26', notes: 'Friendly reminder + auto-debit enrolment nudge' },
  { id: 116, consumer_id: 26, consumer_name: 'Meena Joshi',       scenario_id: 7,  scenario_name: 'Gentle Reminder — Accidental',    team: 'digital',            priority: 'low',    action_type: 'push_notification', status: 'pending', due_date: '2026-04-26', notes: 'Auto-debit enrolment offer' },
  { id: 117, consumer_id: 38, consumer_name: 'Bhavna Thakkar',    scenario_id: 7,  scenario_name: 'Gentle Reminder — Accidental',    team: 'digital',            priority: 'low',    action_type: 'push_notification', status: 'pending', due_date: '2026-04-27', notes: 'Send payment reminder' },
  { id: 118, consumer_id: 8,  consumer_name: 'Seema Gupta',       scenario_id: 9,  scenario_name: 'Bill Shock Resolution',           team: 'billing',            priority: 'medium', action_type: 'bill_review',     status: 'pending', due_date: '2026-04-23', notes: 'Billing officer to call + explain variance, offer EMI' },
  { id: 119, consumer_id: 25, consumer_name: 'Sanjay Malhotra',   scenario_id: 9,  scenario_name: 'Bill Shock Resolution',           team: 'billing',            priority: 'medium', action_type: 'bill_review',     status: 'pending', due_date: '2026-04-23', notes: 'Review meter readings, send breakdown SMS' },
  { id: 120, consumer_id: 44, consumer_name: 'Sarla Watts',       scenario_id: 9,  scenario_name: 'Bill Shock Resolution',           team: 'billing',            priority: 'medium', action_type: 'bill_review',     status: 'pending', due_date: '2026-04-24', notes: 'Compare 6-month trend, offer corrected bill' },
  { id: 121, consumer_id: 14, consumer_name: 'Anita Bose',        scenario_id: 11, scenario_name: 'Seasonal Default Pre-Emption',    team: 'collections',        priority: 'medium', action_type: 'sms_reminder',    status: 'pending', due_date: '2026-04-24', notes: 'Pre-summer reminder + easy pay link' },
  { id: 122, consumer_id: 34, consumer_name: 'Charanjit Dhillon', scenario_id: 11, scenario_name: 'Seasonal Default Pre-Emption',    team: 'collections',        priority: 'medium', action_type: 'sms_reminder',    status: 'pending', due_date: '2026-04-25', notes: 'Flag seasonal pattern, offer auto-debit' },
  // DSM actions
  { id: 123, consumer_id: 3,  consumer_name: 'Vikram Industries',  scenario_id: 17, scenario_name: 'Industrial DSM Enrollment',      team: 'dsm',                priority: 'high',   action_type: 'dsm_outreach',    status: 'pending', due_date: '2026-04-22', notes: 'Enrol in demand response programme, assess flexible load' },
  { id: 124, consumer_id: 22, consumer_name: 'Metro Cold Storage', scenario_id: 17, scenario_name: 'Industrial DSM Enrollment',      team: 'dsm',                priority: 'high',   action_type: 'dsm_outreach',    status: 'pending', due_date: '2026-04-22', notes: 'Cold storage load shift potential — high priority' },
  { id: 125, consumer_id: 31, consumer_name: 'Power Weave Mills',  scenario_id: 17, scenario_name: 'Industrial DSM Enrollment',      team: 'dsm',                priority: 'high',   action_type: 'dsm_outreach',    status: 'pending', due_date: '2026-04-21', notes: 'Largest peak contributor — immediate DR enrolment' },
  { id: 126, consumer_id: 15, consumer_name: 'EV Charge Hub',      scenario_id: 20, scenario_name: 'EV Smart Charging Enrolment',    team: 'dsm',                priority: 'medium', action_type: 'dsm_outreach',    status: 'pending', due_date: '2026-04-24', notes: 'Off-peak charging incentive offer' },
  { id: 127, consumer_id: 39, consumer_name: 'Icon EV Charging',   scenario_id: 20, scenario_name: 'EV Smart Charging Enrolment',    team: 'dsm',                priority: 'medium', action_type: 'dsm_outreach',    status: 'pending', due_date: '2026-04-25', notes: 'Smart charging API integration proposal' },
  { id: 128, consumer_id: 19, consumer_name: 'Naveen Kumar',       scenario_id: 15, scenario_name: 'Demand Response Enrollment',     team: 'dsm',                priority: 'medium', action_type: 'dsm_outreach',    status: 'pending', due_date: '2026-04-25', notes: 'Flexible load profile — DR candidate' },
  { id: 129, consumer_id: 35, consumer_name: 'Nisha Pillai',       scenario_id: 15, scenario_name: 'Demand Response Enrollment',     team: 'dsm',                priority: 'medium', action_type: 'dsm_outreach',    status: 'pending', due_date: '2026-04-26', notes: 'Smart meter upgrade + DR enrolment' },
  // Field ops
  { id: 130, consumer_id: 11, consumer_name: 'Harish Chandra',    scenario_id: 1,  scenario_name: 'Multi-Cycle Default Recovery',    team: 'field_ops',          priority: 'high',   action_type: 'disconnection',   status: 'pending', due_date: '2026-04-21', notes: 'Execute disconnection if payment not received by 21st' },
  { id: 131, consumer_id: 43, consumer_name: 'Om Prakash',        scenario_id: 1,  scenario_name: 'Multi-Cycle Default Recovery',    team: 'field_ops',          priority: 'high',   action_type: 'meter_inspection', status: 'pending', due_date: '2026-04-21', notes: 'Verify meter and conduct inspection before disconnection' },
  { id: 132, consumer_id: 18, consumer_name: 'Sunrise Apartments', scenario_id: 5, scenario_name: 'Bulk Consumer Coordination',      team: 'field_ops',          priority: 'medium', action_type: 'field_visit',     status: 'pending', due_date: '2026-04-24', notes: 'Meet RWA committee for bulk payment arrangement' },
  { id: 133, consumer_id: 41, consumer_name: 'Paradise Towers RWA', scenario_id: 5, scenario_name: 'Bulk Consumer Coordination',     team: 'field_ops',          priority: 'medium', action_type: 'field_visit',     status: 'pending', due_date: '2026-04-25', notes: 'Coordinate with facility manager' },
  // CX
  { id: 134, consumer_id: 17, consumer_name: 'Ramesh Prasad',     scenario_id: 13, scenario_name: 'New Consumer Welcome',            team: 'cx',                 priority: 'low',    action_type: 'welcome_call',    status: 'pending', due_date: '2026-04-28', notes: 'Welcome call + app onboarding guidance' },
  { id: 135, consumer_id: 40, consumer_name: 'Himanshu Rawat',    scenario_id: 13, scenario_name: 'New Consumer Welcome',            team: 'cx',                 priority: 'low',    action_type: 'welcome_call',    status: 'pending', due_date: '2026-04-28', notes: 'App registration + billing cycle explanation' },
  { id: 136, consumer_id: 46, consumer_name: 'Pradeep Chauhan',   scenario_id: 8,  scenario_name: 'Subsidized Consumer Hardship',    team: 'cx',                 priority: 'medium', action_type: 'outreach_call',   status: 'pending', due_date: '2026-04-24', notes: 'Hardship assessment + welfare scheme referral' },
]

const KPIS = [
  { kpi_key: 'day15_conversion',      kpi_name: '15-Day Payment Conversion',       domain: 'Collections', actual: 71, target: 80, unit: '%',  rag_status: 'amber', trend: 'up'   },
  { kpi_key: 'overdue_amount_pcm',    kpi_name: 'Overdue Amount per Consumer',     domain: 'Collections', actual: 2.8,target: 2.0,unit: 'k₹', rag_status: 'red',   trend: 'down' },
  { kpi_key: 'chronic_default_rate',  kpi_name: 'Chronic Default Rate',            domain: 'Collections', actual: 8.2, target: 6.0, unit: '%', rag_status: 'red',   trend: 'down' },
  { kpi_key: 'field_visit_resolution',kpi_name: 'Field Visit Resolution Rate',     domain: 'Field Ops',   actual: 64, target: 70, unit: '%',  rag_status: 'amber', trend: 'flat' },
  { kpi_key: 'complaint_closure_days',kpi_name: 'Avg Complaint Closure (Days)',    domain: 'CX',          actual: 8.4, target: 7.0, unit: 'd', rag_status: 'amber', trend: 'flat' },
  { kpi_key: 'ombudsman_cases',       kpi_name: 'Ombudsman Cases This Month',      domain: 'CX',          actual: 3,  target: 2,  unit: '',   rag_status: 'amber', trend: 'up'   },
  { kpi_key: 'dr_enrolment_rate',     kpi_name: 'Demand Response Enrolment',       domain: 'DSM',         actual: 18, target: 25, unit: '%',  rag_status: 'red',   trend: 'up'   },
  { kpi_key: 'dt_peak_reduction',     kpi_name: 'DT Peak Load Reduction via DSM',  domain: 'DSM',         actual: 6.2, target: 8.0, unit: '%', rag_status: 'amber', trend: 'up'   },
  { kpi_key: 'autodebit_enrolment',   kpi_name: 'Auto-Debit Enrolment Rate',       domain: 'Digital',     actual: 43, target: 55, unit: '%',  rag_status: 'red',   trend: 'up'   },
  { kpi_key: 'app_active_users',      kpi_name: 'App Monthly Active Users',        domain: 'Digital',     actual: 62, target: 60, unit: '%',  rag_status: 'green', trend: 'up'   },
  { kpi_key: 'billing_accuracy',      kpi_name: 'Billing Accuracy Rate',           domain: 'Billing',     actual: 97.4, target: 98.0, unit: '%', rag_status: 'amber', trend: 'flat' },
  { kpi_key: 'revenue_collection_pct',kpi_name: 'Monthly Revenue Collection %',    domain: 'Collections', actual: 88, target: 95, unit: '%',  rag_status: 'red',   trend: 'down' },
]

const DTS = [
  { id: 1,  name: 'DT-N-01', dt_code: 'DT-N-01', area: 'Model Town',    circle: 'North', capacity_kva: 250, age_years: 8,  current_peak_load_pct: 68, consumer_count: 6,  dr_candidates: 2, peak_stressors: 1, recommended_protocol: 'Stable — schedule DSM awareness campaign next quarter' },
  { id: 2,  name: 'DT-N-04', dt_code: 'DT-N-04', area: 'Rohini',        circle: 'North', capacity_kva: 400, age_years: 12, current_peak_load_pct: 88, consumer_count: 8,  dr_candidates: 3, peak_stressors: 3, recommended_protocol: 'DSM-first: enrol industrial and EV consumers in DR programme immediately' },
  { id: 3,  name: 'DT-S-01', dt_code: 'DT-S-01', area: 'Hauz Khas',     circle: 'South', capacity_kva: 315, age_years: 6,  current_peak_load_pct: 55, consumer_count: 4,  dr_candidates: 2, peak_stressors: 1, recommended_protocol: 'Stable — no immediate action needed' },
  { id: 4,  name: 'DT-S-10', dt_code: 'DT-S-10', area: 'Okhla',         circle: 'South', capacity_kva: 630, age_years: 15, current_peak_load_pct: 96, consumer_count: 5,  dr_candidates: 1, peak_stressors: 4, recommended_protocol: '⚠ Upgrade required: capacity at 96% — initiate upgrade procurement and DSM as bridge' },
  { id: 5,  name: 'DT-E-01', dt_code: 'DT-E-01', area: 'Mandoli',       circle: 'East',  capacity_kva: 800, age_years: 10, current_peak_load_pct: 91, consumer_count: 4,  dr_candidates: 2, peak_stressors: 3, recommended_protocol: 'DSM-first: Power Weave Mills load-shift critical — negotiate off-peak incentive' },
  { id: 6,  name: 'DT-E-04', dt_code: 'DT-E-04', area: 'Mayur Vihar',   circle: 'East',  capacity_kva: 500, age_years: 7,  current_peak_load_pct: 82, consumer_count: 5,  dr_candidates: 4, peak_stressors: 3, recommended_protocol: 'DSM-first: EV charging staggering required — enrol in smart charging programme' },
  { id: 7,  name: 'DT-W-05', dt_code: 'DT-W-05', area: 'Punjabi Bagh',  circle: 'West',  capacity_kva: 315, age_years: 18, current_peak_load_pct: 73, consumer_count: 4,  dr_candidates: 1, peak_stressors: 2, recommended_protocol: 'Watch: age concerns — schedule inspection, DSM enrolment for commercial loads' },
  { id: 8,  name: 'DT-W-07', dt_code: 'DT-W-07', area: 'Dwarka',        circle: 'West',  capacity_kva: 400, age_years: 9,  current_peak_load_pct: 48, consumer_count: 5,  dr_candidates: 2, peak_stressors: 1, recommended_protocol: 'Stable — good DR candidate base for proactive enrolment' },
]

// Add consumers to DTs for detail view
const DT_CONSUMERS = {
  1: [29, 37, 48],
  2: [1, 21, 41, 33, 49, 17, 20],
  3: [42],
  4: [22, 50],
  5: [31],
  6: [15, 39, 7, 43, 19],
  7: [36],
  8: [4, 46],
}

const PORTFOLIO = {
  total_consumers: 200,
  consumers_overdue: 67,
  total_overdue_amount: 1860000,
  regulatory_risk_count: 8,
  pending_actions_by_team: {
    collections: 45,
    senior_collections: 18,
    cx: 28,
    billing: 22,
    field_ops: 31,
    dsm: 24,
    digital: 15,
  },
  persona_distribution: [
    { name: 'Chronic Defaulter',          count: 22 },
    { name: 'Prompt Payer',               count: 31 },
    { name: 'At-Risk High Value',         count: 14 },
    { name: 'Digital Champion',           count: 18 },
    { name: 'Low Income / Subsidized',    count: 19 },
    { name: 'Industrial Peak Contrib.',   count: 12 },
    { name: 'Accidental Late Payer',      count: 16 },
    { name: 'Bill Shock Prone',           count: 13 },
    { name: 'Flexible Load Consumer',     count: 11 },
    { name: 'Loyal Long-Tenure',          count: 15 },
    { name: 'EV Adopter',                 count: 8  },
    { name: 'Rooftop Solar',              count: 7  },
    { name: 'Commercial Nighttime',       count: 6  },
    { name: 'Strategic Defaulter',        count: 5  },
    { name: 'New Consumer',               count: 9  },
    { name: 'Large Apartment Complex',    count: 6  },
    { name: 'Seasonal Defaulter',         count: 5  },
    { name: 'Ombudsman Escalator',        count: 3  },
  ],
  revenue_risk_breakdown: { safe: 112, watch: 56, enforce: 32 },
  engagement_breakdown: { digital_first: 80, partial_digital: 82, offline: 38 },
  top_scenarios_triggered: [
    { scenario_id: 1,  name: 'Multi-Cycle Default Recovery',  count: 34 },
    { scenario_id: 17, name: 'Industrial DSM Enrollment',     count: 28 },
    { scenario_id: 9,  name: 'Bill Shock Resolution',         count: 21 },
    { scenario_id: 4,  name: 'High-Value At-Risk Recovery',   count: 18 },
    { scenario_id: 20, name: 'EV Smart Charging Enrolment',   count: 14 },
    { scenario_id: 8,  name: 'Subsidized Hardship Relief',    count: 13 },
    { scenario_id: 13, name: 'New Consumer Welcome',          count: 11 },
    { scenario_id: 7,  name: 'Gentle Reminder — Accidental',  count: 16 },
  ],
}

// ── Payment trend generator ─────────────────────────────────────────────────
function paymentTrend(arrears, daysOverdue) {
  const months = ['2025-05','2025-06','2025-07','2025-08','2025-09','2025-10',
                  '2025-11','2025-12','2026-01','2026-02','2026-03','2026-04']
  const base = 1200 + Math.random() * 3000
  return months.map((m, i) => {
    const bill = Math.round(base + (Math.random() - 0.5) * 400)
    const late = daysOverdue > 60 && i >= 10 ? 30 + Math.floor(Math.random() * 60) : daysOverdue > 30 && i >= 11 ? daysOverdue : 0
    const paid = late > 0 ? 0 : bill - Math.round(Math.random() * 100)
    return { month: m, bill_amount: bill, amount_paid: paid, days_after_due: late }
  })
}

// ── Build consumer detail (Consumer360) ─────────────────────────────────────
function buildDetail(id) {
  const c = CONSUMERS.find(x => x.id === parseInt(id))
  if (!c) return null
  const actions = ACTIONS.filter(a => a.consumer_id === c.id)
  return {
    ...c,
    latest_scores: {
      revenue_risk_score: c.revenue_risk_score,
      revenue_risk_tier: c.revenue_risk_score >= 66 ? 'Enforce' : c.revenue_risk_score >= 31 ? 'Watch' : 'Safe',
      peak_impact_score: c.peak_impact_score,
      peak_impact_tier: c.peak_impact_score >= 66 ? 'High' : c.peak_impact_score >= 31 ? 'Medium' : 'Low',
      complaint_risk_score: c.complaint_risk_score,
      complaint_risk_tier: c.complaint_risk_score >= 66 ? 'High' : c.complaint_risk_score >= 31 ? 'Medium' : 'Low',
      engagement_score: c.engagement_score,
      engagement_tier: c.engagement_score >= 66 ? 'Digital First' : c.engagement_score >= 31 ? 'Partial' : 'Offline',
      dsm_readiness_score: c.dsm_readiness_score,
      dsm_readiness_tier: c.dsm_readiness_score >= 66 ? 'Ready' : c.dsm_readiness_score >= 31 ? 'Partial' : 'Not Ready',
      regulatory_risk_flag: c.regulatory_risk_flag,
      days_overdue: c.days_overdue,
      total_arrears: c.total_arrears,
      bill_shock_flag: c.primary_persona_key === 'bill_shock_prone',
      bill_variance_pct: c.primary_persona_key === 'bill_shock_prone' ? 42 : 0,
    },
    latest_persona: {
      primary_persona_key: c.primary_persona_key,
      primary_persona: c.primary_persona,
      secondary_persona_key: null,
      secondary_persona: null,
    },
    engagement_summary: {
      preferred_channel: c.engagement_score > 70 ? 'app' : c.engagement_score > 40 ? 'sms' : 'field',
      best_contact_time: c.consumer_type === 'commercial' ? 'Weekday 10AM-12PM' : 'Evening 6PM-8PM',
      app_logins: c.engagement_score > 70 ? Math.floor(c.engagement_score / 10) : Math.floor(c.engagement_score / 20),
      notification_opens: Math.floor(c.engagement_score * 0.6) + '%',
      digital_payment: c.engagement_score > 55,
      whatsapp_responsive: c.engagement_score > 45,
    },
    complaint_summary: {
      total: c.complaint_risk_score > 70 ? 8 : c.complaint_risk_score > 40 ? 4 : 1,
      open: c.complaint_risk_score > 70 ? 2 : 0,
      avg_resolution_days: Math.round(c.complaint_risk_score / 10),
      has_escalation: c.regulatory_risk_flag,
      repeat: c.complaint_risk_score > 65,
    },
    active_actions: actions,
    payment_trend: paymentTrend(c.total_arrears, c.days_overdue),
  }
}

// ── Mock API — same interface as the real client ────────────────────────────
export const api = {
  listConsumers: ({ search = '', circle = '', persona_key = '', limit = 50 } = {}) => {
    let list = [...CONSUMERS]
    if (search) list = list.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.consumer_number.includes(search))
    if (circle) list = list.filter(c => c.circle === circle)
    if (persona_key) list = list.filter(c => c.primary_persona_key === persona_key)
    return Promise.resolve({ consumers: list.slice(0, limit), total: list.length })
  },

  getConsumer: (id) => Promise.resolve(buildDetail(id)),

  getPortfolio: () => Promise.resolve(PORTFOLIO),
  getCircles: () => Promise.resolve(['North', 'South', 'East', 'West']),

  listActions: ({ team = '', priority = '', limit = 100 } = {}) => {
    let list = [...ACTIONS]
    if (team) list = list.filter(a => a.team === team)
    if (priority) list = list.filter(a => a.priority === priority)
    return Promise.resolve({ actions: list.slice(0, limit), total: list.length })
  },
  dispatchAction: (id) => Promise.resolve({ status: 'dispatched', id }),
  logOutcome: (id, outcome) => Promise.resolve({ status: 'logged', id, outcome }),

  listDTs: () => Promise.resolve(DTS),
  getDT: (id) => {
    const dt = DTS.find(d => d.id === parseInt(id))
    if (!dt) return Promise.resolve(null)
    const consumerIds = DT_CONSUMERS[dt.id] || []
    const consumers = consumerIds.map(cid => CONSUMERS.find(c => c.id === cid)).filter(Boolean)
    return Promise.resolve({ ...dt, consumers })
  },

  getKPIs: () => Promise.resolve(KPIS),

  chat: () => Promise.resolve({ response: 'Chatbot is not available in demo mode.' }),
  seed: () => Promise.resolve({ status: 'demo_mode' }),
}
