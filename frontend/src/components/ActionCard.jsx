import clsx from 'clsx'
import { MessageSquare, Phone, User, Smartphone, Wrench } from 'lucide-react'

const CHANNEL_ICON = {
  whatsapp: MessageSquare,
  ivr: Phone,
  agent: User,
  app: Smartphone,
  field: Wrench,
}

const PRIORITY_STYLE = {
  high: 'border-l-red-500 bg-red-50',
  medium: 'border-l-yellow-400 bg-yellow-50',
  low: 'border-l-blue-400 bg-blue-50',
}

const PRIORITY_BADGE = {
  high: 'bg-red-100 text-red-700',
  medium: 'bg-yellow-100 text-yellow-700',
  low: 'bg-blue-100 text-blue-700',
}

const TEAM_LABEL = {
  collections: 'Collections',
  senior_collections: 'Senior Collections',
  dsm: 'DSM Team',
  field_ops: 'Field Ops',
  cx: 'CX',
  billing: 'Billing Ops',
  digital: 'Digital',
  network_planning: 'Network Planning',
  commercial: 'Commercial',
}

export default function ActionCard({ action, onDispatch, onOutcome, showConsumer = false }) {
  const Icon = CHANNEL_ICON[action.channel] || MessageSquare

  return (
    <div className={clsx(
      'border-l-4 rounded-r-lg p-3 space-y-2',
      PRIORITY_STYLE[action.priority] || 'border-l-gray-300 bg-gray-50'
    )}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          {showConsumer && (
            <div className="font-medium text-sm text-gray-900 truncate">{action.consumer_name}</div>
          )}
          <div className="text-xs font-semibold text-gray-700">{action.scenario_name}</div>
          <div className="text-xs text-gray-600 mt-0.5 line-clamp-2">{action.recommended_action}</div>
        </div>
        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          <span className={clsx('text-xs px-1.5 py-0.5 rounded font-medium', PRIORITY_BADGE[action.priority])}>
            {action.priority}
          </span>
          <span className="text-xs text-gray-400">{TEAM_LABEL[action.team] || action.team}</span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <Icon size={12} />
          <span className="capitalize">{action.channel}</span>
        </div>
        {action.status === 'pending' && (
          <div className="flex gap-1">
            {onDispatch && (
              <button
                onClick={() => onDispatch(action.id)}
                className="text-xs px-2 py-0.5 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Dispatch
              </button>
            )}
            {onOutcome && (
              <button
                onClick={() => onOutcome(action.id)}
                className="text-xs px-2 py-0.5 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Done
              </button>
            )}
          </div>
        )}
        {action.outcome && (
          <span className="text-xs text-green-600 font-medium">{action.outcome}</span>
        )}
      </div>
    </div>
  )
}
