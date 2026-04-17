import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Zap, Users, TrendingUp, ChevronRight } from 'lucide-react'
import { api } from '../api/client'
import PersonaBadge from '../components/PersonaBadge'

function LoadBar({ pct }) {
  const color = pct >= 90 ? 'bg-red-500' : pct >= 75 ? 'bg-amber-400' : 'bg-green-500'
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${Math.min(pct, 100)}%` }} />
      </div>
      <span className={`text-sm font-bold w-12 text-right ${pct >= 90 ? 'text-red-600' : pct >= 75 ? 'text-amber-600' : 'text-green-600'}`}>
        {pct?.toFixed(0)}%
      </span>
    </div>
  )
}

function DTCard({ dt, onClick }) {
  const isRed = dt.current_peak_load_pct >= 90
  const isAmber = dt.current_peak_load_pct >= 75 && !isRed
  const dsmFirst = dt.recommended_protocol?.includes('DSM-first')
  const upgrade = dt.recommended_protocol?.includes('upgrade')

  return (
    <div
      className={`bg-white rounded-xl border shadow-sm p-4 cursor-pointer hover:shadow-md transition-all ${isRed ? 'border-red-200' : isAmber ? 'border-amber-200' : 'border-gray-100'}`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-gray-900 text-sm">{dt.name}</span>
            {isRed && <span className="text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded font-semibold">Overloaded</span>}
            {isAmber && <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-semibold">Watch</span>}
          </div>
          <div className="text-xs text-gray-400 mt-0.5">{dt.dt_code} · {dt.area}, {dt.circle}</div>
        </div>
        <ChevronRight size={16} className="text-gray-300 mt-1" />
      </div>

      <LoadBar pct={dt.current_peak_load_pct} />

      <div className="grid grid-cols-3 gap-2 mt-3 text-center">
        <div className="bg-gray-50 rounded-lg p-2">
          <div className="text-sm font-bold text-gray-800">{dt.consumer_count}</div>
          <div className="text-xs text-gray-400">Consumers</div>
        </div>
        <div className="bg-blue-50 rounded-lg p-2">
          <div className="text-sm font-bold text-blue-700">{dt.dr_candidates}</div>
          <div className="text-xs text-blue-500">DR Candidates</div>
        </div>
        <div className="bg-orange-50 rounded-lg p-2">
          <div className="text-sm font-bold text-orange-700">{dt.peak_stressors}</div>
          <div className="text-xs text-orange-500">Peak Stressors</div>
        </div>
      </div>

      <div className="mt-3 text-xs text-gray-500 line-clamp-2">
        <span className={`font-medium ${dsmFirst ? 'text-blue-600' : upgrade ? 'text-red-600' : 'text-green-600'}`}>
          {dsmFirst ? '▶ ' : upgrade ? '⚠ ' : '✓ '}
        </span>
        {dt.recommended_protocol}
      </div>
    </div>
  )
}

export default function DTView() {
  const [dts, setDts] = useState([])
  const [selected, setSelected] = useState(null)
  const [detail, setDetail] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    api.listDTs().then(d => { setDts(d); setLoading(false) })
  }, [])

  const openDT = async (dt) => {
    setSelected(dt)
    const d = await api.getDT(dt.id)
    setDetail(d)
  }

  return (
    <div className="p-6 space-y-4">
      <div>
        <h1 className="text-xl font-bold text-gray-900">DT / Network View</h1>
        <p className="text-sm text-gray-500">Distribution transformer status and DSM opportunities</p>
      </div>

      <div className="flex gap-4">
        {/* DT list */}
        <div className={`${selected ? 'w-96' : 'flex-1'} transition-all`}>
          {loading ? (
            <div className="text-gray-400 text-sm text-center py-8">Loading...</div>
          ) : (
            <div className={`${selected ? 'space-y-2' : 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3'}`}>
              {dts.map(dt => (
                <DTCard key={dt.id} dt={dt} onClick={() => openDT(dt)} />
              ))}
            </div>
          )}
        </div>

        {/* DT detail */}
        {selected && detail && (
          <div className="flex-1 bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-bold text-gray-900">{detail.name}</h2>
                <div className="text-xs text-gray-400">{detail.dt_code} · {detail.area}, {detail.circle} · {detail.capacity_kva} kVA · {detail.age_years} yrs old</div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-gray-800">{detail.current_peak_load_pct?.toFixed(0)}%</div>
                <div className="text-xs text-gray-400">peak load</div>
              </div>
            </div>

            <div className="text-sm text-gray-600 bg-blue-50 border border-blue-100 rounded-lg p-3">
              <span className="font-semibold text-blue-700">Protocol: </span>
              {selected.recommended_protocol}
            </div>

            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Consumers ({detail.consumers?.length})
              </h3>
              <div className="space-y-1 max-h-[60vh] overflow-y-auto scrollbar-thin">
                {detail.consumers?.sort((a, b) => b.peak_impact_score - a.peak_impact_score).map(c => (
                  <div
                    key={c.id}
                    className="flex items-center gap-3 py-1.5 px-2 hover:bg-gray-50 rounded-lg cursor-pointer"
                    onClick={() => navigate(`/consumers/${c.id}`)}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-800 truncate">{c.name}</div>
                      {c.primary_persona && (
                        <PersonaBadge personaKey={c.primary_persona_key} personaName={c.primary_persona} size="sm" />
                      )}
                    </div>
                    <div className="text-right flex-shrink-0 text-xs">
                      <div className="text-orange-600 font-medium">Peak {Math.round(c.peak_impact_score)}</div>
                      <div className="text-blue-600">DR {Math.round(c.dsm_readiness_score)}</div>
                    </div>
                    {c.days_overdue > 0 && (
                      <div className="text-red-500 text-xs font-medium">{c.days_overdue}d</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
