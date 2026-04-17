import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Phone, MapPin, Zap, Home } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { api } from '../api/client'
import ScoreGauge from '../components/ScoreGauge'
import PersonaBadge from '../components/PersonaBadge'
import ActionCard from '../components/ActionCard'

export default function Consumer360() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getConsumer(id).then(setData).finally(() => setLoading(false))
  }, [id])

  const handleDispatch = (actionId) => {
    api.dispatchAction(actionId).then(() => api.getConsumer(id).then(setData))
  }
  const handleOutcome = (actionId) => {
    const outcome = prompt('Enter outcome: paid / enrolled / resolved / no_response / escalated')
    if (outcome) api.logOutcome(actionId, outcome).then(() => api.getConsumer(id).then(setData))
  }

  if (loading) return <div className="flex items-center justify-center h-full text-gray-400 text-sm">Loading...</div>
  if (!data) return <div className="p-8 text-gray-500">Consumer not found.</div>

  const s = data.latest_scores || {}
  const p = data.latest_persona || {}

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-gray-600">
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-gray-900">{data.name}</h1>
            {p.primary_persona_key && (
              <PersonaBadge personaKey={p.primary_persona_key} personaName={p.primary_persona} size="md" />
            )}
            {p.secondary_persona_key && (
              <PersonaBadge personaKey={p.secondary_persona_key} personaName={p.secondary_persona} size="sm" />
            )}
            {s.regulatory_risk_flag && (
              <span className="bg-red-600 text-white text-xs px-2 py-0.5 rounded-full font-semibold animate-pulse">
                REGULATORY RISK
              </span>
            )}
          </div>
          <div className="flex gap-4 text-xs text-gray-500 mt-1">
            <span>{data.consumer_number}</span>
            <span className="flex items-center gap-1"><MapPin size={10} />{data.area}, {data.circle}</span>
            <span className="flex items-center gap-1"><Zap size={10} />{data.dt_name}</span>
            <span className="flex items-center gap-1"><Phone size={10} />{data.phone}</span>
          </div>
        </div>
        <div className="text-right">
          <div className={`text-lg font-bold ${data.monthly_bill_bucket === 'high' ? 'text-purple-600' : 'text-gray-700'}`}>
            {data.monthly_bill_bucket === 'high' ? 'High Value' : data.monthly_bill_bucket === 'medium' ? 'Medium' : 'Standard'}
          </div>
          <div className="text-xs text-gray-400 capitalize">{data.consumer_type} · {data.sanctioned_load_kw}kW sanctioned</div>
        </div>
      </div>

      {/* Score gauges */}
      <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Scores — April 2026</h2>
        <div className="flex flex-wrap justify-around gap-4">
          <ScoreGauge label="Revenue Risk" score={s.revenue_risk_score} tier={s.revenue_risk_tier} />
          <ScoreGauge label="Peak Impact" score={s.peak_impact_score} tier={s.peak_impact_tier} />
          <ScoreGauge label="Complaint Risk" score={s.complaint_risk_score} tier={s.complaint_risk_tier} />
          <ScoreGauge label="Engagement" score={s.engagement_score} tier={s.engagement_tier} inverted />
          <ScoreGauge label="DSM Readiness" score={s.dsm_readiness_score} tier={s.dsm_readiness_tier} inverted />
          <ScoreGauge label="Regulatory Risk" flag flagValue={s.regulatory_risk_flag} />
        </div>

        {(s.days_overdue > 0 || s.total_arrears > 0) && (
          <div className="mt-4 flex gap-4 p-3 bg-red-50 rounded-lg border border-red-100">
            <div>
              <div className="text-xs text-gray-500">Days Overdue</div>
              <div className="text-lg font-bold text-red-600">{s.days_overdue}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Arrears</div>
              <div className="text-lg font-bold text-red-600">₹{(s.total_arrears || 0).toLocaleString()}</div>
            </div>
            {s.bill_shock_flag && (
              <div className="flex items-center">
                <span className="bg-amber-100 text-amber-800 text-xs font-semibold px-2 py-1 rounded">
                  Bill Shock +{Math.round(s.bill_variance_pct || 0)}%
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Main 3-col grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Active Actions */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">
            Active Actions ({data.active_actions.length})
          </h2>
          {data.active_actions.length === 0 ? (
            <p className="text-sm text-gray-400">No pending actions this cycle.</p>
          ) : (
            <div className="space-y-2">
              {data.active_actions.map(a => (
                <ActionCard
                  key={a.id}
                  action={a}
                  onDispatch={handleDispatch}
                  onOutcome={handleOutcome}
                />
              ))}
            </div>
          )}
        </div>

        {/* Consumer detail */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-700 mb-3">Engagement</h2>
            <div className="space-y-2 text-sm">
              {[
                ['Preferred channel', data.engagement_summary.preferred_channel],
                ['Best contact time', data.engagement_summary.best_contact_time],
                ['App logins / month', data.engagement_summary.app_logins],
                ['Notif opens', data.engagement_summary.notification_opens],
                ['Digital payment', data.engagement_summary.digital_payment ? '✓ Yes' : '✗ No'],
                ['WhatsApp responsive', data.engagement_summary.whatsapp_responsive ? '✓ Yes' : '✗ No'],
              ].map(([label, val]) => (
                <div key={label} className="flex justify-between">
                  <span className="text-gray-500">{label}</span>
                  <span className="font-medium text-gray-800 capitalize">{val}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-700 mb-3">Complaints</h2>
            <div className="space-y-2 text-sm">
              {[
                ['Total complaints', data.complaint_summary.total],
                ['Currently open', data.complaint_summary.open],
                ['Avg resolution', `${data.complaint_summary.avg_resolution_days} days`],
                ['Escalation flag', data.complaint_summary.has_escalation ? '🔴 Yes' : '🟢 No'],
                ['Repeat pattern', data.complaint_summary.repeat ? '🔴 Yes' : '🟢 No'],
              ].map(([label, val]) => (
                <div key={label} className="flex justify-between">
                  <span className="text-gray-500">{label}</span>
                  <span className="font-medium text-gray-800">{val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Payment trend */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Payment Trend (last 12 months)</h2>
        <ResponsiveContainer width="100%" height={160}>
          <LineChart data={data.payment_trend.map(p => ({
            month: p.month?.slice(2),
            Bill: Math.round(p.bill_amount),
            Paid: Math.round(p.amount_paid),
            Late: p.days_after_due > 3 ? p.days_after_due : null,
          }))}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} />
            <Tooltip />
            <Line type="monotone" dataKey="Bill" stroke="#94a3b8" strokeWidth={1.5} dot={false} />
            <Line type="monotone" dataKey="Paid" stroke="#3b82f6" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
