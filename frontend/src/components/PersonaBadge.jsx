import clsx from 'clsx'

const PERSONA_STYLES = {
  prompt_payer: 'bg-green-100 text-green-800',
  accidental_late_payer: 'bg-yellow-100 text-yellow-800',
  cashflow_constrained: 'bg-orange-100 text-orange-800',
  chronic_defaulter: 'bg-red-100 text-red-800',
  dispute_withholder: 'bg-red-100 text-red-800',
  vacant_premises: 'bg-gray-100 text-gray-700',
  high_coincident_peak: 'bg-orange-100 text-orange-800',
  flexible_load_consumer: 'bg-blue-100 text-blue-800',
  ev_adopter: 'bg-teal-100 text-teal-800',
  renewable_adopter: 'bg-green-100 text-green-800',
  load_violator: 'bg-red-100 text-red-800',
  efficient_user: 'bg-green-100 text-green-800',
  repeat_complainant: 'bg-red-100 text-red-800',
  ombudsman_escalator: 'bg-red-200 text-red-900',
  bill_shock_prone: 'bg-yellow-100 text-yellow-800',
  digital_champion: 'bg-blue-100 text-blue-800',
  whatsapp_active: 'bg-teal-100 text-teal-800',
  offline_user: 'bg-gray-100 text-gray-700',
  digital_high_value: 'bg-blue-100 text-blue-800',
  at_risk_high_value: 'bg-red-100 text-red-800',
  complaint_prone_defaulter: 'bg-red-100 text-red-800',
  base_load: 'bg-gray-100 text-gray-600',
}

export default function PersonaBadge({ personaKey, personaName, size = 'sm' }) {
  if (!personaName) return null
  const style = PERSONA_STYLES[personaKey] || 'bg-gray-100 text-gray-700'
  return (
    <span className={clsx(
      'inline-flex items-center rounded-full font-medium',
      size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm',
      style
    )}>
      {personaName}
    </span>
  )
}
