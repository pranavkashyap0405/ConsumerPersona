export default function ScoringMethodology() {
  return (
    <div className="p-6 space-y-6 max-w-5xl">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Scoring Methodology</h1>
        <p className="text-sm text-gray-500 mt-1">
          All 6 scores are computed per consumer per billing cycle from three data sources:
          <span className="font-medium text-blue-700"> MDM System</span> (BLP / DLP / BPP / Events) ·
          <span className="font-medium text-green-700"> Billing System</span> ·
          <span className="font-medium text-orange-700"> IVRS / CCnB Complaints</span>
        </p>
      </div>

      {/* Score 1 — Revenue Risk */}
      <ScoreCard
        title="1. Revenue Risk Score"
        range="0 – 100"
        color="blue"
        source="Billing System"
        note="Higher score = higher risk of non-payment."
        tiers={[
          { label: 'Safe',    range: '0 – 30',   color: 'bg-green-500' },
          { label: 'Watch',   range: '31 – 65',  color: 'bg-yellow-400' },
          { label: 'Enforce', range: '66 – 100', color: 'bg-red-500' },
        ]}
        rows={[
          { component: 'Arrear Ratio',    formula: 'min(ARRS / NET_BILL_1,  3) / 3  ×  40',              pts: 40, source: 'ARRS, NET_BILL_1' },
          { component: 'Overdue Days',    formula: 'min(today − CSH_DATE_1,  180) / 180  ×  30',         pts: 30, source: 'CSH_DATE_1' },
          { component: 'Penalty Flag',    formula: '15  if  PENAL_CH > 0  else  0',                      pts: 15, source: 'PENAL_CH' },
          { component: 'Surcharge Flag',  formula: '10  if  SURCH > 0  else  0',                         pts: 10, source: 'SURCH' },
          { component: 'SAMADHAN Arrear', formula: '5  if  SAMADHAN_ARR > 0  else  0',                   pts: 5,  source: 'SAMADHAN_ARR' },
        ]}
      />

      {/* Score 2 — Peak Impact */}
      <ScoreCard
        title="2. Peak Impact Score"
        range="0 – 100"
        color="orange"
        source="MDM System"
        note="SL (Sanctioned Load) from R_Consumer_all. Higher score = greater stress on the distribution transformer."
        tiers={[
          { label: 'Low',    range: '0 – 30',   color: 'bg-green-500' },
          { label: 'Medium', range: '31 – 65',  color: 'bg-yellow-400' },
          { label: 'High',   range: '66 – 100', color: 'bg-red-500' },
        ]}
        rows={[
          { component: 'Load Ratio',        formula: 'min(max(kW from BLP) / SL,  1.5) / 1.5  ×  35',                          pts: 35, source: 't_blp_tp + R_Consumer_all' },
          { component: 'Monthly kWh Trend', formula: 'min((avg last 3 BPP Kwh_imp / avg prev 3) − 1,  0.5) / 0.5  ×  25',      pts: 25, source: 't_bpp_agg' },
          { component: 'Peak Hour %',       formula: '(DLP Kwh_imp 6pm–10pm / total daily Kwh_imp)  ×  20',                    pts: 20, source: 't_dlp_agg' },
          { component: 'Power Factor',      formula: '(1 − avg(pf from BLP))  ×  20',                                          pts: 20, source: 't_blp_tp / t_blp_sp' },
        ]}
        footnote="BLP = 15/30-min interval readings  ·  DLP = Daily aggregated  ·  BPP = Monthly aggregated"
      />

      {/* Score 3 — Complaint Risk */}
      <ScoreCard
        title="3. Complaint Risk Score"
        range="0 – 100"
        color="amber"
        source="IVRS / CCnB Complaints"
        note="Joined via CA Number → CONS_NO_1. Higher score = higher likelihood of escalation or ombudsman filing."
        tiers={[
          { label: 'Low',    range: '0 – 30',   color: 'bg-green-500' },
          { label: 'Medium', range: '31 – 65',  color: 'bg-yellow-400' },
          { label: 'High',   range: '66 – 100', color: 'bg-red-500' },
        ]}
        rows={[
          { component: 'Open / In-Progress',   formula: 'min(count(Status = Open or In Progress),  2) / 2  ×  40',   pts: 40, source: 'Status' },
          { component: 'TAT Breached Count',   formula: 'min(count(TAT_Status = Breached),  3) / 3  ×  30',          pts: 30, source: 'TAT Status' },
          { component: 'Critical Priority',    formula: 'min(count(Priority = Critical),  4) / 4  ×  20',            pts: 20, source: 'Priority' },
          { component: 'Repeat Pattern Flag',  formula: '10  if  total complaint count > 3  else  0',                pts: 10, source: 'Complaint ID' },
        ]}
      />

      {/* Complaint Type Mapping */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Complaint Type → Risk Signal</h3>
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-amber-700 text-white">
              <th className="text-left px-3 py-2 rounded-tl font-semibold">Complaint Type</th>
              <th className="text-left px-3 py-2 font-semibold">Subcategory</th>
              <th className="text-left px-3 py-2 rounded-tr font-semibold">Risk Signal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {[
              { type: 'Supply Failure',   sub: 'Complete outage, Feeder tripped, DTR tripped', signal: 'Peak Impact + Complaint Risk' },
              { type: 'Supply Failure',   sub: 'Neutral fault, Partial supply',                signal: 'Field Ops escalation' },
              { type: 'Voltage Related',  sub: 'Low voltage, High voltage',                   signal: 'Peak Impact signal + DT stress' },
              { type: 'Voltage Related',  sub: 'Voltage fluctuation, Unbalanced phases',       signal: 'Complaint Risk + Regulatory flag risk' },
              { type: 'Billing Related',  sub: 'High bill complaint',                          signal: 'Bill Shock validation' },
              { type: 'Billing Related',  sub: 'Wrong meter reading, Meter defective',         signal: 'Regulatory Risk trigger' },
              { type: 'Billing Related',  sub: 'Billing dispute (unresolved > TAT)',           signal: 'Ombudsman Escalator persona trigger' },
              { type: 'Billing Related',  sub: 'No bill received',                             signal: 'Low Engagement signal' },
            ].map((r, i) => (
              <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="px-3 py-2 font-medium text-gray-700">{r.type}</td>
                <td className="px-3 py-2 text-gray-500">{r.sub}</td>
                <td className="px-3 py-2 text-amber-700 font-medium">{r.signal}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Score 4 — DSM Readiness */}
      <ScoreCard
        title="4. DSM Readiness Score"
        range="0 – 100"
        color="purple"
        source="MDM + Billing"
        note="Higher score = better candidate for Demand Response / DSM programmes."
        tiers={[
          { label: 'Not Ready', range: '0 – 30',   color: 'bg-gray-400' },
          { label: 'Partial',   range: '31 – 65',  color: 'bg-blue-400' },
          { label: 'DR Ready',  range: '66 – 100', color: 'bg-purple-500' },
        ]}
        rows={[
          { component: 'Flexible Load (TOD)', formula: '(TOD_UNITS / MTR_UNITS)  ×  30',              pts: 30, source: 'Billing — TOD_UNITS, MTR_UNITS' },
          { component: 'Solar / Export',      formula: '25  if  wh_exp > 0  else  0',                 pts: 25, source: 'MDM — t_blp_tp (wh_exp)' },
          { component: 'Power Factor',        formula: '20  if  avg(pf) > 0.90  else  0',             pts: 20, source: 'MDM — t_blp_tp / t_blp_sp' },
          { component: 'Phase Type',          formula: '15  if  PHASE = 3-phase  else  0',            pts: 15, source: 'Billing — PHASE' },
          { component: 'Max Demand',          formula: '10  if  md_w_imp > 5000  else  0',            pts: 10, source: 'MDM — t_ip_tp / t_ip_sp' },
        ]}
      />

      {/* Score 5 — Engagement */}
      <ScoreCard
        title="5. Engagement Score"
        range="0 – 100"
        color="teal"
        source="Billing + MDM"
        note="Higher score = consumer is more digitally engaged and reachable."
        tiers={[
          { label: 'Offline',        range: '0 – 30',   color: 'bg-gray-400' },
          { label: 'Partial Digital',range: '31 – 65',  color: 'bg-blue-300' },
          { label: 'Digital First',  range: '66 – 100', color: 'bg-blue-600' },
        ]}
        rows={[
          { component: 'Digital Payment',       formula: '40  if  CSH_DATE_1 populated  else  0',           pts: 40, source: 'Billing — CSH_DATE_1' },
          { component: 'On-Time Payment',       formula: '25  if  overdue days = 0  else  0',               pts: 25, source: 'Billing — CSH_DATE_1' },
          { component: 'Mobile Registered',     formula: '20  if  MOBILE populated  else  0',               pts: 20, source: 'Billing — MOBILE' },
          { component: 'Meter Communication',   formula: '15  if  communication_status = active  else  0',  pts: 15, source: 'MDM — t_communication_status' },
        ]}
      />

      {/* Score 6 — Regulatory Risk */}
      <div className="bg-white rounded-xl border border-red-100 shadow-sm overflow-hidden">
        <div className="bg-red-700 px-4 py-3 flex items-center justify-between">
          <div>
            <span className="text-white font-bold text-sm">6. Regulatory Risk Flag</span>
            <span className="ml-2 text-red-200 text-xs">Boolean — 0 or 1</span>
          </div>
          <span className="text-xs text-red-200">Billing + MDM + Complaints</span>
        </div>
        <div className="p-4">
          <p className="text-xs text-gray-500 mb-3 italic">
            Flag = 1 if ANY ONE trigger is true. Consumer requires senior officer handling.
          </p>
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-red-50">
                <th className="text-left px-3 py-2 font-semibold text-red-800">Trigger</th>
                <th className="text-left px-3 py-2 font-semibold text-red-800">Condition</th>
                <th className="text-left px-3 py-2 font-semibold text-red-800">Source</th>
                <th className="text-left px-3 py-2 font-semibold text-red-800">Column</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {[
                { trigger: 'BPL Consumer',               condition: "BPL_FLAG = 'Y'",                                  source: 'Billing',    col: 'BPL_FLAG' },
                { trigger: 'Govt Scheme Beneficiary',     condition: "SARAL_FLAG = 'Y'",                                source: 'Billing',    col: 'SARAL_FLAG' },
                { trigger: 'Settlement Scheme',           condition: 'SAMADHAN_ARR > 0',                                source: 'Billing',    col: 'SAMADHAN_ARR' },
                { trigger: 'Contested Arrear',            condition: 'ARRS > 3 × NET_BILL_1',                          source: 'Billing',    col: 'ARRS, NET_BILL_1' },
                { trigger: 'Tamper Event',                condition: 'evnt_id IN tamper codes (M_Event)',               source: 'MDM',        col: 't_event_sp / t_event_tp' },
                { trigger: 'Billing Dispute TAT Breach',  condition: 'Billing dispute + TAT Breached',                  source: 'Complaints', col: 'Complaint Type, TAT Status' },
                { trigger: 'Critical Complaint Unresolved',condition: 'Critical complaint open > 30 days',             source: 'Complaints', col: 'Priority, Status, Created Date' },
              ].map((r, i) => (
                <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-3 py-2 font-medium text-gray-800">{r.trigger}</td>
                  <td className="px-3 py-2 font-mono text-red-700 text-xs">{r.condition}</td>
                  <td className="px-3 py-2">
                    <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                      r.source === 'Billing' ? 'bg-green-100 text-green-700' :
                      r.source === 'MDM' ? 'bg-blue-100 text-blue-700' :
                      'bg-orange-100 text-orange-700'
                    }`}>{r.source}</span>
                  </td>
                  <td className="px-3 py-2 font-mono text-gray-500 text-xs">{r.col}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Data Source Join Map */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Data Source Join Map</h3>
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-gray-800 text-white">
              <th className="text-left px-3 py-2 rounded-tl font-semibold">System</th>
              <th className="text-left px-3 py-2 font-semibold">Key Column</th>
              <th className="text-left px-3 py-2 font-semibold">Joins To</th>
              <th className="text-left px-3 py-2 rounded-tr font-semibold">Via</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {[
              { sys: 'Billing',    key: 'CONS_NO_1',  to: 'MDM — R_Consumer_all',      via: 'CA Number = MSN mapping' },
              { sys: 'Billing',    key: 'CONS_NO_1',  to: 'Complaints',                 via: 'CA Number = CONS_NO_1' },
              { sys: 'MDM',        key: 'MSN',        to: 'BLP / DLP / BPP tables',     via: 'MSN_ID' },
              { sys: 'MDM',        key: 'MSN',        to: 'DT Network',                 via: 'L_Network_Lookup' },
              { sys: 'Complaints', key: 'CA Number',  to: 'Billing',                    via: 'CONS_NO_1' },
              { sys: 'Complaints', key: 'CA Number',  to: 'MDM',                        via: 'via Billing → MDM join' },
            ].map((r, i) => (
              <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="px-3 py-2">
                  <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                    r.sys === 'Billing' ? 'bg-green-100 text-green-700' :
                    r.sys === 'MDM' ? 'bg-blue-100 text-blue-700' :
                    'bg-orange-100 text-orange-700'
                  }`}>{r.sys}</span>
                </td>
                <td className="px-3 py-2 font-mono text-gray-700">{r.key}</td>
                <td className="px-3 py-2 text-gray-600">{r.to}</td>
                <td className="px-3 py-2 text-gray-400 italic">{r.via}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  )
}

// ── Reusable ScoreCard component ─────────────────────────────────────────────

const COLOR_MAP = {
  blue:   { header: 'bg-blue-800',   badge: 'bg-blue-100 text-blue-700' },
  orange: { header: 'bg-orange-700', badge: 'bg-orange-100 text-orange-700' },
  amber:  { header: 'bg-amber-700',  badge: 'bg-amber-100 text-amber-700' },
  purple: { header: 'bg-purple-700', badge: 'bg-purple-100 text-purple-700' },
  teal:   { header: 'bg-teal-700',   badge: 'bg-teal-100 text-teal-700' },
  red:    { header: 'bg-red-700',    badge: 'bg-red-100 text-red-700' },
}

function ScoreCard({ title, range, color, source, note, tiers, rows, footnote }) {
  const c = COLOR_MAP[color] || COLOR_MAP.blue
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className={`${c.header} px-4 py-3 flex items-center justify-between`}>
        <div>
          <span className="text-white font-bold text-sm">{title}</span>
          <span className="ml-2 text-white/60 text-xs">{range}</span>
        </div>
        <span className={`text-xs px-2 py-0.5 rounded font-medium ${c.badge}`}>{source}</span>
      </div>

      <div className="p-4 space-y-3">
        {/* Note */}
        <p className="text-xs text-gray-500 italic">{note}</p>

        {/* Tiers */}
        <div className="flex gap-2">
          {tiers.map(t => (
            <div key={t.label} className="flex items-center gap-1.5">
              <span className={`w-2.5 h-2.5 rounded-full ${t.color}`} />
              <span className="text-xs text-gray-600 font-medium">{t.label}</span>
              <span className="text-xs text-gray-400">{t.range}</span>
            </div>
          ))}
        </div>

        {/* Formula table */}
        <table className="w-full text-xs">
          <thead>
            <tr className={`${c.header} text-white`}>
              <th className="text-left px-3 py-2 font-semibold w-40">Component</th>
              <th className="text-left px-3 py-2 font-semibold">Formula</th>
              <th className="text-left px-3 py-2 font-semibold w-16">Max Pts</th>
              <th className="text-left px-3 py-2 font-semibold w-56">Source Column</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {rows.map((r, i) => (
              <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="px-3 py-2 font-medium text-gray-700">{r.component}</td>
                <td className="px-3 py-2 font-mono text-gray-600">{r.formula}</td>
                <td className="px-3 py-2 font-bold text-gray-800">{r.pts}</td>
                <td className="px-3 py-2 text-gray-400">{r.source}</td>
              </tr>
            ))}
            <tr className="bg-gray-100">
              <td className="px-3 py-2 font-bold text-gray-800">TOTAL</td>
              <td className="px-3 py-2" />
              <td className="px-3 py-2 font-bold text-gray-800">100</td>
              <td className="px-3 py-2" />
            </tr>
          </tbody>
        </table>

        {footnote && <p className="text-xs text-gray-400 italic">{footnote}</p>}
      </div>
    </div>
  )
}
