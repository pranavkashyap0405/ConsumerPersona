import { useEffect, useState } from 'react'
import { api } from '../api/client'

const RAG = {
  green: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', dot: 'bg-green-500', label: 'On Track' },
  amber: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', dot: 'bg-amber-400', label: 'At Risk' },
  red: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', dot: 'bg-red-500', label: 'Off Track' },
}

function KPICard({ kpi }) {
  const style = RAG[kpi.rag_status] || RAG.amber
  const pct = kpi.target > 0 ? Math.min(Math.round((kpi.actual / kpi.target) * 100), 150) : 0
  const barPct = Math.min(pct, 100)
  const isHigherBetter = ['day15_conversion', 'field_visit_resolution', 'dr_enrolment_rate',
    'dt_peak_reduction', 'autodebit_enrolment'].includes(kpi.kpi_key)
  const barColor = kpi.rag_status === 'green' ? 'bg-green-500' : kpi.rag_status === 'amber' ? 'bg-amber-400' : 'bg-red-500'

  return (
    <div className={`bg-white rounded-xl border ${style.border} p-4 shadow-sm space-y-3`}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="text-sm font-semibold text-gray-800 leading-tight">{kpi.kpi_name}</div>
          <div className="text-xs text-gray-400 mt-0.5">{kpi.domain}</div>
        </div>
        <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${style.bg} ${style.text}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
          {style.label}
        </div>
      </div>

      <div className="flex items-end gap-3">
        <div>
          <div className="text-2xl font-bold text-gray-900">{kpi.actual}{kpi.unit}</div>
          <div className="text-xs text-gray-400">Actual</div>
        </div>
        <div className="text-gray-300 text-lg">vs</div>
        <div>
          <div className="text-lg font-semibold text-gray-500">{kpi.target}{kpi.unit}</div>
          <div className="text-xs text-gray-400">Target</div>
        </div>
      </div>

      <div className="space-y-1">
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div className={`h-full ${barColor} rounded-full transition-all`} style={{ width: `${barPct}%` }} />
        </div>
        <div className="flex justify-between text-xs text-gray-400">
          <span>0</span>
          <span>Target: {kpi.target}{kpi.unit}</span>
        </div>
      </div>
    </div>
  )
}

export default function KPITracker() {
  const [kpis, setKpis] = useState([])
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getKPIs().then(setKpis).finally(() => setLoading(false))
  }, [])

  const domains = ['all', ...new Set(kpis.map(k => k.domain))]
  const filtered = filter === 'all' ? kpis : kpis.filter(k => k.domain === filter)

  const summary = {
    green: kpis.filter(k => k.rag_status === 'green').length,
    amber: kpis.filter(k => k.rag_status === 'amber').length,
    red: kpis.filter(k => k.rag_status === 'red').length,
  }

  return (
    <div className="p-6 space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-900">KPI Tracker</h1>
        <p className="text-sm text-gray-500">April 2026 — all operational domains</p>
      </div>

      {/* Summary */}
      <div className="flex gap-4">
        {[
          { label: 'On Track', count: summary.green, ...RAG.green },
          { label: 'At Risk', count: summary.amber, ...RAG.amber },
          { label: 'Off Track', count: summary.red, ...RAG.red },
        ].map(({ label, count, bg, text, border, dot }) => (
          <div key={label} className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${bg} ${border}`}>
            <span className={`w-3 h-3 rounded-full ${dot}`} />
            <div>
              <div className={`text-2xl font-bold ${text}`}>{count}</div>
              <div className={`text-xs ${text}`}>{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Domain filter */}
      <div className="flex gap-2 flex-wrap">
        {domains.map(d => (
          <button
            key={d}
            onClick={() => setFilter(d)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${
              filter === d ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {d}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-gray-400 text-sm text-center py-8">Loading KPIs...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(k => <KPICard key={k.kpi_key} kpi={k} />)}
        </div>
      )}
    </div>
  )
}
