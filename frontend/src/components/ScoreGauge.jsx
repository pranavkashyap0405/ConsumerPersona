import { RadialBarChart, RadialBar, ResponsiveContainer } from 'recharts'

const TIER_COLOR = (score, inverted = false) => {
  if (inverted) {
    if (score >= 66) return '#22c55e'
    if (score >= 31) return '#f59e0b'
    return '#ef4444'
  }
  if (score <= 30) return '#22c55e'
  if (score <= 65) return '#f59e0b'
  return '#ef4444'
}

export default function ScoreGauge({ label, score = 0, tier, inverted = false, flag = false, flagValue }) {
  if (flag) {
    return (
      <div className="flex flex-col items-center gap-1">
        <div className={`w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-sm ${flagValue ? 'bg-red-500' : 'bg-green-500'}`}>
          {flagValue ? 'YES' : 'NO'}
        </div>
        <span className="text-xs text-gray-500 text-center leading-tight">{label}</span>
      </div>
    )
  }

  const color = TIER_COLOR(score, inverted)
  const data = [{ value: score, fill: color }]

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative w-16 h-16">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart
            cx="50%" cy="50%"
            innerRadius="65%" outerRadius="90%"
            startAngle={90} endAngle={-270}
            data={[{ value: 100, fill: '#e5e7eb' }, ...data]}
          >
            <RadialBar dataKey="value" cornerRadius={4} background={false} />
          </RadialBarChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-bold" style={{ color }}>{Math.round(score)}</span>
        </div>
      </div>
      <span className="text-xs text-gray-500 text-center leading-tight">{label}</span>
      {tier && (
        <span className="text-xs font-medium" style={{ color }}>{tier}</span>
      )}
    </div>
  )
}
