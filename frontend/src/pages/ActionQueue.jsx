import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api/client'
import ActionCard from '../components/ActionCard'

const TEAMS = [
  { key: '', label: 'All Teams' },
  { key: 'collections', label: 'Collections' },
  { key: 'senior_collections', label: 'Senior Collections' },
  { key: 'field_ops', label: 'Field Ops' },
  { key: 'cx', label: 'CX' },
  { key: 'billing', label: 'Billing Ops' },
  { key: 'dsm', label: 'DSM' },
  { key: 'digital', label: 'Digital' },
]

const PRIORITIES = [
  { key: '', label: 'All Priorities' },
  { key: 'high', label: 'High' },
  { key: 'medium', label: 'Medium' },
  { key: 'low', label: 'Low' },
]

export default function ActionQueue() {
  const [actions, setActions] = useState([])
  const [total, setTotal] = useState(0)
  const [team, setTeam] = useState('')
  const [priority, setPriority] = useState('')
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  const fetchActions = () => {
    setLoading(true)
    const params = { limit: 100 }
    if (team) params.team = team
    if (priority) params.priority = priority
    api.listActions(params)
      .then(d => { setActions(d.actions); setTotal(d.total) })
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchActions() }, [team, priority])

  const handleDispatch = (id) => api.dispatchAction(id).then(fetchActions)
  const handleOutcome = (id) => {
    const outcome = prompt('Enter outcome: paid / enrolled / resolved / no_response / escalated')
    if (outcome) api.logOutcome(id, outcome).then(fetchActions)
  }

  // Group by team if "All Teams" selected
  const grouped = team
    ? { [team]: actions }
    : actions.reduce((acc, a) => {
        acc[a.team] = acc[a.team] || []
        acc[a.team].push(a)
        return acc
      }, {})

  const TEAM_ORDER = ['senior_collections', 'collections', 'cx', 'billing', 'field_ops', 'dsm', 'digital']
  const orderedKeys = team ? [team] : TEAM_ORDER.filter(t => grouped[t]?.length > 0)

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Action Queue</h1>
          <p className="text-sm text-gray-500">{total.toLocaleString()} pending actions · April 2026</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <div className="flex rounded-lg border border-gray-200 overflow-hidden bg-white">
          {TEAMS.map(t => (
            <button
              key={t.key}
              onClick={() => setTeam(t.key)}
              className={`px-3 py-2 text-xs font-medium transition-colors ${team === t.key ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="flex rounded-lg border border-gray-200 overflow-hidden bg-white">
          {PRIORITIES.map(p => (
            <button
              key={p.key}
              onClick={() => setPriority(p.key)}
              className={`px-3 py-2 text-xs font-medium transition-colors ${priority === p.key ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400 text-sm">Loading actions...</div>
      ) : (
        <div className={`grid gap-4 ${!team ? 'grid-cols-1 lg:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1 max-w-2xl'}`}>
          {orderedKeys.map(t => (
            <div key={t} className="space-y-2">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-gray-700 text-sm capitalize">
                  {t.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </h2>
                <span className="text-xs text-gray-400">{grouped[t]?.length || 0} actions</span>
              </div>
              <div className="space-y-2 max-h-[60vh] overflow-y-auto scrollbar-thin pr-1">
                {(grouped[t] || []).map(a => (
                  <div
                    key={a.id}
                    onClick={() => navigate(`/consumers/${a.consumer_id}`)}
                    className="cursor-pointer"
                  >
                    <ActionCard
                      action={a}
                      showConsumer
                      onDispatch={(id) => { handleDispatch(id) }}
                      onOutcome={(id) => { handleOutcome(id) }}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
          {orderedKeys.length === 0 && (
            <div className="col-span-3 text-center py-12 text-gray-400 text-sm">
              No pending actions for the selected filters.
            </div>
          )}
        </div>
      )}
    </div>
  )
}
