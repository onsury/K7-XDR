ATT&CK Coverage — very visual, great for demos. Open frontend/src/pages/AttackCoverage.jsx, select all, delete, paste:
javascriptimport React, { useState, useEffect } from 'react'
import { api } from '../lib/api'

const TACTIC_COLORS = {
  'Reconnaissance': '#6366f1', 'Resource Development': '#8b5cf6', 'Initial Access': '#ef4444',
  'Execution': '#f97316', 'Persistence': '#f59e0b', 'Privilege Escalation': '#eab308',
  'Defense Evasion': '#84cc16', 'Credential Access': '#22c55e', 'Discovery': '#14b8a6',
  'Lateral Movement': '#06b6d4', 'Collection': '#3b82f6', 'Command and Control': '#6366f1',
  'Exfiltration': '#a855f7', 'Impact': '#ec4899'
}

function CoverageBar({ label, covered, total, color }) {
  const pct = total > 0 ? Math.round((covered / total) * 100) : 0
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-gray-700 font-medium truncate pr-2">{label}</span>
        <span className="font-bold" style={{ color }}>{pct}%</span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-3">
        <div className="h-3 rounded-full transition-all relative" style={{ width: `${pct}%`, backgroundColor: color }}>
          {pct > 15 && <span className="absolute right-1 top-0 text-[9px] text-white font-bold leading-3">{covered}/{total}</span>}
        </div>
      </div>
    </div>
  )
}

export default function AttackCoverage() {
  const [data, setData] = useState(null)
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    api('/api/attack-coverage').then(setData)
  }, [])

  if (!data) return <div className="p-6 text-gray-500">Loading ATT&CK coverage...</div>

  const tactics = data.tactics || data.coverage || []
  const totalTechniques = tactics.reduce((s, t) => s + (t.total || t.techniques?.length || 0), 0)
  const coveredTechniques = tactics.reduce((s, t) => s + (t.covered || t.detected || 0), 0)
  const overallPct = totalTechniques > 0 ? Math.round((coveredTechniques / totalTechniques) * 100) : 0

  return (
    <div className="p-5 space-y-5 bg-gray-50 min-h-full">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">MITRE ATT&CK Coverage</h1>
        <p className="text-sm text-gray-400">Detection coverage mapped to ATT&CK framework</p>
      </div>

      {/* Overall Score */}
      <div className="bg-gradient-to-r from-k7-700 to-k7-800 rounded-xl p-5 text-white">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-blue-200">Overall Detection Coverage</div>
            <div className="text-4xl font-bold mt-1">{overallPct}%</div>
            <div className="text-sm text-blue-200 mt-1">{coveredTechniques} of {totalTechniques} techniques covered across {tactics.length} tactics</div>
          </div>
          <div className="text-right space-y-1">
            <div className="flex items-center gap-2 text-sm">
              <div className="w-3 h-3 rounded bg-green-400" />
              <span className="text-blue-200">Covered ({coveredTechniques})</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-3 h-3 rounded bg-gray-500" />
              <span className="text-blue-200">Gap ({totalTechniques - coveredTechniques})</span>
            </div>
          </div>
        </div>
        {/* Overall bar */}
        <div className="w-full bg-white/20 rounded-full h-3 mt-4">
          <div className="h-3 rounded-full bg-green-400 transition-all" style={{ width: `${overallPct}%` }} />
        </div>
      </div>

      {/* Tactic Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tactics.map((tactic, i) => {
          const name = tactic.tactic || tactic.name
          const covered = tactic.covered || tactic.detected || 0
          const total = tactic.total || tactic.techniques?.length || 0
          const pct = total > 0 ? Math.round((covered / total) * 100) : 0
          const color = TACTIC_COLORS[name] || '#6366f1'
          const techniques = tactic.techniques || []
          const isSelected = selected === i

          return (
            <div key={i} className={`bg-white rounded-xl border-2 transition-all cursor-pointer ${isSelected ? 'border-k7-500 shadow-lg' : 'border-gray-200 hover:shadow-md'}`}
              onClick={() => setSelected(isSelected ? null : i)}>
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-900 text-sm">{name}</h3>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: color + '20', color }}>{pct}%</span>
                </div>
                <CoverageBar label="" covered={covered} total={total} color={color} />
                <div className="text-xs text-gray-400 mt-1">{covered} detected / {total} total techniques</div>
              </div>

              {isSelected && techniques.length > 0 && (
                <div className="border-t border-gray-100 p-3 bg-gray-50/50 max-h-48 overflow-y-auto">
                  <div className="space-y-1">
                    {techniques.map((tech, j) => (
                      <div key={j} className="flex items-center justify-between text-xs p-1.5 rounded bg-white">
                        <span className="text-gray-700">{tech.id || ''} {tech.name || tech}</span>
                        <span className={`font-medium px-1.5 py-0.5 rounded ${
                          (tech.detected || tech.covered) ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
                        }`}>{(tech.detected || tech.covered) ? '● Covered' : '○ Gap'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}