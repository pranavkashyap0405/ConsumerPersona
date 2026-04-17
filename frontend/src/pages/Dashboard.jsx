import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Users, AlertTriangle, TrendingUp, Zap, ClipboardList, ShieldAlert } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import { api } from '../api/client'

const PERSONA_COLORS = [
  '#3b82f6','#ef4444','#f59e0b','#22c55e','#8b5cf6','#ec4899','#14b8a6','#f97316',
  '#64748b','#a855f7','#06b6d4','#84cc16','#e11d48','#0ea5e9','#d97706','#10b981',
]

function StatCard({ icon: Icon, label, value, sub, color = 'blue', onClick }) {
  const colors = {
    blue: 'bg-blue-50 text-blue-600',
    red: 'bg-red-50 text-red-600',
    green: 'bg-green-50 text-green-600',
    amber: 'bg-amber-50 text-amber-600',
  }
  return (
    <div
      className={`bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-4 shadow-sm ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
      onClick={onClick}
    >
      <div className={`p-3 rounded-xl ${colors[color]}`}>
        <Icon size={22} />
      </div>
      <div>
        <div className="text-2xl font-bold text-gray-900">{value}</div>
        <div className="text-sm text-gray-500">{label}</div>
        {sub && <div className="text-xs text-gray-400 mt-0.5">{sub}</div>}
      </div>
    </div>
  )
}

export default function Dashboard() {
  const [portfolio, setPortfolio] = useState(null)
  const [kpis, setKpis] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    Promise.all([api.getPortfolio(), api.getKPIs()])
      .then(([p, k]) => { setPortfolio(p); setKpis(k) })
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <div className="text-gray-400 text-sm">Loading dashboard...</div>
    </div>
  )

  if (!portfolio) return (
    <div className="p-8 text-center">
      <div className="text-gray-500 mb-4">No data yet. Seed the database to get started.</div>
      <button
        onClick={() => api.seed().then(() => window.location.reload())}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm"
      >
        Seed Demo Data
      </button>
    </div>
  )

  const pieData = portfolio.persona_distribution.slice(0, 8).map((p, i) => ({
    name: p.name?.replace('Consumer', '').replace('Payer', '').trim(),
    value: p.count,
    color: PERSONA_COLORS[i],
  }))

  const teamActions = Object.entries(portfolio.pending_actions_by_team || {}).map(([team, count]) => ({
    team: team.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
    count,
  })).sort((a, b) => b.count - a.count)

  const ragKpis = {
    green: kpis.filter(k => k.rag_status === 'green').length,
    amber: kpis.filter(k => k.rag_status === 'amber').length,
    red: kpis.filter(k => k.rag_status === 'red').length,
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Operations Dashboard</h1>
        <p className="text-sm text-gray-500">Billing month: April 2026 · {portfolio.total_consumers} consumers</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Users}
          label="Total Consumers"
          value={portfolio.total_consumers.toLocaleString()}
          color="blue"
          onClick={() => navigate('/consumers')}
        />
        <StatCard
          icon={AlertTriangle}
          label="With Arrears"
          value={portfolio.consumers_overdue.toLocaleString()}
          sub={`₹${(portfolio.total_overdue_amount / 100000).toFixed(1)}L overdue`}
          color="red"
          onClick={() => navigate('/consumers?min_rev_risk=66')}
        />
        <StatCard
          icon={ShieldAlert}
          label="Regulatory Risk"
          value={portfolio.regulatory_risk_count}
          sub="Active flag — senior officer needed"
          color="red"
          onClick={() => navigate('/consumers?regulatory=true')}
        />
        <StatCard
          icon={ClipboardList}
          label="Pending Actions"
          value={Object.values(portfolio.pending_actions_by_team || {}).reduce((a, b) => a + b, 0)}
          sub={`${Object.keys(portfolio.pending_actions_by_team || {}).length} teams`}
          color="amber"
          onClick={() => navigate('/actions')}
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Persona distribution */}
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm lg:col-span-2">
          <h2 className="font-semibold text-gray-800 mb-3 text-sm">Persona Distribution</h2>
          <div className="flex items-center gap-4">
            <ResponsiveContainer width={180} height={180}>
              <PieChart>
                <Pie data={pieData} dataKey="value" cx="50%" cy="50%" outerRadius={80} innerRadius={45}>
                  {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip formatter={(v, n) => [v, n]} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 grid grid-cols-2 gap-1">
              {pieData.map((p, i) => (
                <div key={i} className="flex items-center gap-1.5 text-xs text-gray-600">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: p.color }} />
                  <span className="truncate">{p.name}</span>
                  <span className="ml-auto font-medium text-gray-800">{p.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Revenue risk breakdown */}
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <h2 className="font-semibold text-gray-800 mb-3 text-sm">Revenue Risk Tiers</h2>
          <div className="space-y-3">
            {[
              { label: 'Safe (0–30)', key: 'safe', color: 'bg-green-500' },
              { label: 'Watch (31–65)', key: 'watch', color: 'bg-yellow-400' },
              { label: 'Enforce (66–100)', key: 'enforce', color: 'bg-red-500' },
            ].map(({ label, key, color }) => {
              const val = portfolio.revenue_risk_breakdown[key] || 0
              const pct = Math.round((val / portfolio.total_consumers) * 100)
              return (
                <div key={key}>
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>{label}</span>
                    <span className="font-medium">{val} ({pct}%)</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full ${color} rounded-full`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>

          <h2 className="font-semibold text-gray-800 mt-5 mb-3 text-sm">Engagement Tiers</h2>
          <div className="space-y-3">
            {[
              { label: 'Digital First', key: 'digital_first', color: 'bg-blue-500' },
              { label: 'Partial Digital', key: 'partial_digital', color: 'bg-blue-300' },
              { label: 'Offline', key: 'offline', color: 'bg-gray-400' },
            ].map(({ label, key, color }) => {
              const val = portfolio.engagement_breakdown[key] || 0
              const pct = Math.round((val / portfolio.total_consumers) * 100)
              return (
                <div key={key}>
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>{label}</span>
                    <span className="font-medium">{val} ({pct}%)</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full ${color} rounded-full`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Action queue by team + KPI summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-gray-800 text-sm">Pending Actions by Team</h2>
            <button onClick={() => navigate('/actions')} className="text-xs text-blue-600 hover:underline">View all</button>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={teamActions} layout="vertical">
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="team" width={110} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-gray-800 text-sm">KPI Health</h2>
            <button onClick={() => navigate('/kpis')} className="text-xs text-blue-600 hover:underline">Full tracker</button>
          </div>
          <div className="flex gap-4 mb-4">
            {[
              { label: 'On Track', count: ragKpis.green, color: 'text-green-600 bg-green-50' },
              { label: 'At Risk', count: ragKpis.amber, color: 'text-amber-600 bg-amber-50' },
              { label: 'Off Track', count: ragKpis.red, color: 'text-red-600 bg-red-50' },
            ].map(({ label, count, color }) => (
              <div key={label} className={`flex-1 text-center py-3 rounded-lg ${color}`}>
                <div className="text-2xl font-bold">{count}</div>
                <div className="text-xs font-medium">{label}</div>
              </div>
            ))}
          </div>
          <div className="space-y-2">
            {kpis.filter(k => k.rag_status !== 'green').slice(0, 4).map(k => (
              <div key={k.kpi_key} className="flex justify-between items-center text-xs">
                <span className="text-gray-600 truncate flex-1">{k.kpi_name}</span>
                <span className={`font-medium ml-2 ${k.rag_status === 'red' ? 'text-red-600' : 'text-amber-600'}`}>
                  {k.actual}{k.unit} / {k.target}{k.unit}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top triggered scenarios */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
        <h2 className="font-semibold text-gray-800 mb-3 text-sm">Top Triggered Scenarios This Month</h2>
        <div className="flex flex-wrap gap-2">
          {portfolio.top_scenarios_triggered.map((s, i) => (
            <div key={i} className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5">
              <span className="text-xs font-bold text-blue-600">#{s.scenario_id}</span>
              <span className="text-xs text-gray-700">{s.name}</span>
              <span className="text-xs font-semibold text-gray-900 bg-gray-200 px-1.5 py-0.5 rounded-full">{s.count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
