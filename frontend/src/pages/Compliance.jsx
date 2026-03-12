import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../lib/api'

const FW_ICONS = { 'CERT-In': '🇮🇳', 'DPDPA': '🛡️', 'ISO 27001': '📋', 'NIST CSF': '🔒', 'PCI DSS': '💳', 'SEBI': '📊' }
const STATUS_COLORS = { compliant: 'bg-green-100 text-green-700', partial: 'bg-yellow-100 text-yellow-700', 'non-compliant': 'bg-red-100 text-red-700', 'not-applicable': 'bg-gray-100 text-gray-500' }

function ScoreRing({ score, size = 80 }) {
  const r = size / 2 - 6, c = 2 * Math.PI * r
  const color = score >= 80 ? '#22c55e' : score >= 50 ? '#f59e0b' : '#ef4444'
  return (
    <svg width={size} height={size}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#e5e7eb" strokeWidth="5" />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="5"
        strokeDasharray={c} strokeDashoffset={c * (1 - score / 100)} strokeLinecap="round"
        transform={`rotate(-90 ${size/2} ${size/2})`} />
      <text x={size/2} y={size/2 + 5} textAnchor="middle" className="text-lg font-bold" fill={color}>{score}%</text>
    </svg>
  )
}

export default function Compliance() {
  const [data, setData] = useState(null)
  const [selected, setSelected] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    api('/api/compliance').then(setData)
  }, [])

  if (!data) return <div className="p-6 text-gray-500">Loading compliance data...</div>

  const frameworks = data.frameworks || data
  const overall = frameworks.length > 0 ? Math.round(frameworks.reduce((s, f) => s + (f.score || f.complianceScore || 0), 0) / frameworks.length) : 0

  return (
    <div className="p-5 space-y-5 bg-gray-50 min-h-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Compliance</h1>
          <p className="text-sm text-gray-400">{frameworks.length} regulatory frameworks tracked</p>
        </div>
        <button onClick={() => navigate('/app/certin-dpdpa')} className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors">
          🇮🇳 CERT-In / DPDPA Timers →
        </button>
      </div>

      {/* Overall Score */}
      <div className="bg-gradient-to-r from-k7-700 to-k7-800 rounded-xl p-5 text-white flex items-center justify-between">
        <div>
          <div className="text-sm text-blue-200">Overall Compliance Score</div>
          <div className="text-4xl font-bold mt-1">{overall}%</div>
          <div className="text-sm text-blue-200 mt-1">{frameworks.filter(f => (f.score || f.complianceScore || 0) >= 80).length} of {frameworks.length} frameworks compliant</div>
        </div>
        <ScoreRing score={overall} size={100} />
      </div>

      {/* Framework Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {frameworks.map((fw, i) => {
          const score = fw.score || fw.complianceScore || 0
          const name = fw.name || fw.framework
          const icon = FW_ICONS[name] || '📋'
          const controls = fw.controls || fw.requirements || []
          const isSelected = selected === i

          return (
            <div key={i} className={`bg-white rounded-xl border-2 transition-all cursor-pointer ${isSelected ? 'border-k7-500 shadow-lg' : 'border-gray-200 hover:shadow-md'}`}
              onClick={() => setSelected(isSelected ? null : i)}>
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{icon}</span>
                    <h3 className="font-semibold text-gray-900">{name}</h3>
                  </div>
                  <ScoreRing score={score} size={56} />
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-gray-100 rounded-full h-2 mb-2">
                  <div className="h-2 rounded-full transition-all" style={{ width: `${score}%`, backgroundColor: score >= 80 ? '#22c55e' : score >= 50 ? '#f59e0b' : '#ef4444' }} />
                </div>

                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>{controls.length} controls</span>
                  <span>{fw.status || (score >= 80 ? 'Compliant' : score >= 50 ? 'Partial' : 'Non-compliant')}</span>
                </div>

                {fw.lastAudit && (
                  <div className="text-xs text-gray-400 mt-1">Last audit: {new Date(fw.lastAudit).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                )}
              </div>

              {/* Expanded Controls */}
              {isSelected && controls.length > 0 && (
                <div className="border-t border-gray-100 p-4 bg-gray-50/50">
                  <div className="text-xs font-semibold text-gray-500 uppercase mb-2">Controls</div>
                  <div className="space-y-1.5 max-h-48 overflow-y-auto">
                    {controls.map((ctrl, j) => (
                      <div key={j} className="flex items-center justify-between text-sm p-1.5 rounded bg-white">
                        <span className="text-gray-700 text-xs">{ctrl.name || ctrl.control || ctrl}</span>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[ctrl.status] || 'bg-gray-100 text-gray-500'}`}>
                          {ctrl.status || 'pending'}
                        </span>
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