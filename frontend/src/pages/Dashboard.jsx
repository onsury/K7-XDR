import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../lib/api'

/* ─── Mini SVG Charts ─── */
function DonutChart({ data, size = 120 }) {
  const total = data.reduce((s, d) => s + d.value, 0)
  let cum = 0
  const r = size / 2 - 8, cx = size / 2, cy = size / 2
  const arcs = data.map(d => {
    const pct = d.value / total
    const start = cum * 2 * Math.PI - Math.PI / 2
    cum += pct
    const end = cum * 2 * Math.PI - Math.PI / 2
    const large = pct > 0.5 ? 1 : 0
    const x1 = cx + r * Math.cos(start), y1 = cy + r * Math.sin(start)
    const x2 = cx + r * Math.cos(end), y2 = cy + r * Math.sin(end)
    return { ...d, path: `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z` }
  })
  return (
    <svg width={size} height={size}>
      {arcs.map((a, i) => <path key={i} d={a.path} fill={a.color} opacity="0.85" />)}
      <circle cx={cx} cy={cy} r={r * 0.55} fill="white" />
      <text x={cx} y={cy - 4} textAnchor="middle" className="text-lg font-bold" fill="#1e293b">{total}</text>
      <text x={cx} y={cy + 12} textAnchor="middle" className="text-xs" fill="#94a3b8">Total</text>
    </svg>
  )
}

function GaugeChart({ value, max = 100, label, size = 130 }) {
  const pct = Math.min(value / max, 1)
  const r = size / 2 - 12, cx = size / 2, cy = size / 2 + 10
  const startAngle = Math.PI, endAngle = 2 * Math.PI
  const valAngle = startAngle + pct * Math.PI
  const color = value >= 70 ? '#ef4444' : value >= 40 ? '#f59e0b' : '#22c55e'
  const bgPath = `M ${cx + r * Math.cos(startAngle)} ${cy + r * Math.sin(startAngle)} A ${r} ${r} 0 0 1 ${cx + r * Math.cos(endAngle)} ${cy + r * Math.sin(endAngle)}`
  const valPath = `M ${cx + r * Math.cos(startAngle)} ${cy + r * Math.sin(startAngle)} A ${r} ${r} 0 ${pct > 0.5 ? 1 : 0} 1 ${cx + r * Math.cos(valAngle)} ${cy + r * Math.sin(valAngle)}`
  return (
    <svg width={size} height={size / 2 + 25}>
      <path d={bgPath} fill="none" stroke="#e2e8f0" strokeWidth="10" strokeLinecap="round" />
      <path d={valPath} fill="none" stroke={color} strokeWidth="10" strokeLinecap="round" />
      <text x={cx} y={cy - 8} textAnchor="middle" className="text-2xl font-bold" fill={color}>{value}</text>
      <text x={cx} y={cy + 8} textAnchor="middle" className="text-xs" fill="#94a3b8">{label}</text>
    </svg>
  )
}

function SparkBar({ data, height = 50, barWidth = 6 }) {
  const max = Math.max(...data.map(d => d.value), 1)
  const w = data.length * (barWidth + 3)
  return (
    <svg width={w} height={height}>
      {data.map((d, i) => {
        const h = (d.value / max) * (height - 4)
        return (
          <g key={i}>
            <rect x={i * (barWidth + 3)} y={height - h - 2} width={barWidth} height={h} rx="1" fill={d.color || '#3b82f6'} opacity="0.8" />
          </g>
        )
      })}
    </svg>
  )
}

function HBar({ label, value, max, color }) {
  const pct = max > 0 ? (value / max) * 100 : 0
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="w-20 text-gray-500 text-xs truncate">{label}</span>
      <div className="flex-1 bg-gray-100 rounded-full h-2.5">
        <div className="h-2.5 rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
      <span className="w-8 text-right font-semibold text-gray-700">{value}</span>
    </div>
  )
}

/* ─── Stat Card ─── */
function StatCard({ label, value, sub, icon, accent, onClick }) {
  return (
    <button onClick={onClick} className="bg-white rounded-xl border border-gray-200 p-4 text-left hover:shadow-lg transition-all group w-full">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs font-medium text-gray-400 uppercase tracking-wide">{label}</div>
          <div className={`text-3xl font-bold mt-1 ${accent || 'text-gray-900'}`}>{value}</div>
          {sub && <div className="text-xs text-gray-400 mt-1">{sub}</div>}
        </div>
        <div className={`text-2xl opacity-60 group-hover:opacity-100 transition-opacity`}>{icon}</div>
      </div>
    </button>
  )
}

function SeverityBadge({ severity }) {
  const c = { critical: 'bg-red-100 text-red-700', high: 'bg-orange-100 text-orange-700', medium: 'bg-yellow-100 text-yellow-700', low: 'bg-blue-100 text-blue-700' }
  return <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${c[severity] || 'bg-gray-100'}`}>{severity}</span>
}

/* ─── Main Dashboard ─── */
export default function Dashboard() {
  const [data, setData] = useState(null)
  const [timers, setTimers] = useState(null)
  const [clock, setClock] = useState(new Date())
  const navigate = useNavigate()

  useEffect(() => {
    api('/api/dashboard').then(setData)
    api('/api/certin-dpdpa/timers').then(setTimers).catch(() => {})
    const t = setInterval(() => setClock(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  if (!data) return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <div className="text-4xl mb-2">⟳</div>
        <div className="text-gray-500">Loading K7 XDR Dashboard...</div>
      </div>
    </div>
  )

  const s = data.summary
  const sev = s.severityBreakdown
  const sevColors = { critical: '#ef4444', high: '#f97316', medium: '#eab308', low: '#3b82f6' }

  const donutData = Object.entries(sev).map(([k, v]) => ({ label: k, value: v, color: sevColors[k] }))
  const alertMax = Math.max(...Object.values(s.alertsBySource))

  /* Simulated 7-day trend */
  const trendDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const trendData = [12, 18, 9, 25, 15, 8, 22].map((v, i) => ({
    day: trendDays[i], value: v,
    color: v > 20 ? '#ef4444' : v > 14 ? '#f97316' : '#3b82f6'
  }))

  /* CERT-In timer summary */
  const certinExpired = timers ? timers.timers.filter(t => t.type === 'cert_in' && t.expired && !t.reported).length : 0
  const dpdpaActive = timers ? timers.timers.filter(t => t.type === 'dpdpa' && !t.expired).length : 0

  return (
    <div className="p-5 space-y-5 bg-gray-50 min-h-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">SOC Command Center</h1>
          <p className="text-sm text-gray-400">K7 XDR Platform — Real-time Security Operations</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-mono font-bold text-k7-600">{clock.toLocaleTimeString('en-IN', { hour12: false })}</div>
          <div className="text-xs text-gray-400">{clock.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })}</div>
        </div>
      </div>

      {/* Stat Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard label="Incidents" value={s.totalIncidents} sub={`${sev.critical} critical`} icon="🚨" accent="text-red-600" onClick={() => navigate('/incidents')} />
        <StatCard label="Devices" value={s.totalDevices} sub={`${s.activeAgents} active agents`} icon="💻" accent="text-blue-600" onClick={() => navigate('/devices')} />
        <StatCard label="Alerts" value={s.totalAlerts} sub="Last 7 days" icon="🔔" accent="text-orange-600" onClick={() => navigate('/alerts')} />
        <StatCard label="High Risk" value={s.highRiskDevices} sub="Risk ≥ 70" icon="⚠️" accent="text-red-500" onClick={() => navigate('/devices')} />
        <StatCard label="CERT-In" value={`${certinExpired} overdue`} sub="6-hour deadline" icon="🇮🇳" accent={certinExpired > 0 ? 'text-red-600' : 'text-green-600'} onClick={() => navigate('/certin-dpdpa')} />
        <StatCard label="DPDPA" value={`${dpdpaActive} active`} sub="72-hour window" icon="🛡️" accent="text-orange-500" onClick={() => navigate('/certin-dpdpa')} />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Severity Donut */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Incident Severity</h3>
          <div className="flex items-center justify-center">
            <DonutChart data={donutData} />
          </div>
          <div className="flex justify-center gap-3 mt-2">
            {donutData.map(d => (
              <div key={d.label} className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
                <span className="text-xs text-gray-500">{d.label} ({d.value})</span>
              </div>
            ))}
          </div>
        </div>

        {/* Risk Gauge */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Organization Risk Score</h3>
          <div className="flex justify-center">
            <GaugeChart value={data.riskScore.overall} label={data.riskScore.trend} />
          </div>
          <div className="space-y-1 mt-2">
            {data.riskScore.factors.map(f => (
              <HBar key={f.name} label={f.name} value={f.score} max={100} color={f.score >= 70 ? '#ef4444' : f.score >= 40 ? '#f59e0b' : '#22c55e'} />
            ))}
          </div>
        </div>

        {/* 7-Day Trend */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Incident Trend (7 days)</h3>
          <div className="flex items-end justify-center gap-1 h-16 mt-3">
            {trendData.map((d, i) => (
              <div key={i} className="flex flex-col items-center">
                <div className="rounded-t" style={{ width: 18, height: `${(d.value / 25) * 48}px`, backgroundColor: d.color, minHeight: 4 }} />
                <span className="text-[10px] text-gray-400 mt-1">{d.day}</span>
              </div>
            ))}
          </div>
          <div className="text-center mt-3">
            <span className="text-xs text-gray-400">Total: {trendData.reduce((s, d) => s + d.value, 0)} incidents this week</span>
          </div>
        </div>

        {/* Alerts by Source */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Alerts by Source</h3>
          <div className="space-y-2">
            {Object.entries(s.alertsBySource).map(([key, val]) => (
              <HBar key={key} label={key} value={val} max={alertMax} color="#2563eb" />
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Recent Incidents */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Recent Incidents</h2>
            <button onClick={() => navigate('/incidents')} className="text-xs text-k7-600 hover:underline">View all →</button>
          </div>
          <div className="divide-y divide-gray-50">
            {data.recentIncidents.slice(0, 8).map(inc => (
              <button
                key={inc.id}
                onClick={() => navigate(`/incidents/${inc.id}`)}
                className="w-full text-left px-4 py-2.5 hover:bg-gray-50 flex items-center justify-between transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate">{inc.title}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{inc.id} — {new Date(inc.createdAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</div>
                </div>
                <div className="flex items-center gap-2 ml-3">
                  <SeverityBadge severity={inc.severity} />
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    inc.status === 'new' ? 'bg-blue-50 text-blue-600' :
                    inc.status === 'investigating' ? 'bg-yellow-50 text-yellow-600' :
                    inc.status === 'contained' ? 'bg-orange-50 text-orange-600' :
                    'bg-green-50 text-green-600'
                  }`}>{inc.status}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          {/* K7 Engine Status */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="font-semibold text-gray-900 mb-3">K7 Engine Status</h3>
            <div className="space-y-3">
              {Object.entries(data.k7EngineStatus).map(([key, val]) => (
                <div key={key} className="flex items-center justify-between">
                  <div>
                    <span className="text-sm text-gray-700 font-medium">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                    {val.version && <span className="text-xs text-gray-400 ml-2">v{val.version}</span>}
                  </div>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                    val.status === 'connected' ? 'bg-green-100 text-green-700' :
                    val.status === 'standby' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {val.status === 'connected' ? '● Connected' : val.status === 'standby' ? '◐ Standby' : val.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Status Breakdown */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Incident Pipeline</h3>
            <div className="space-y-2">
              {Object.entries(s.statusBreakdown).map(([key, val]) => {
                const colors = { new: '#3b82f6', investigating: '#f59e0b', contained: '#f97316', resolved: '#22c55e' }
                return <HBar key={key} label={key} value={val} max={s.totalIncidents} color={colors[key] || '#94a3b8'} />
              })}
            </div>
          </div>

          {/* Compliance Quick View */}
          {timers && (
            <div className="bg-gradient-to-br from-k7-700 to-k7-800 rounded-xl p-4 text-white">
              <h3 className="font-semibold mb-3">Compliance Status</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-blue-200">CERT-In Overdue</span>
                  <span className={`text-sm font-bold ${certinExpired > 0 ? 'text-red-300' : 'text-green-300'}`}>{certinExpired}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-blue-200">DPDPA Active</span>
                  <span className="text-sm font-bold text-yellow-300">{dpdpaActive}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-blue-200">CERT-In Reported</span>
                  <span className="text-sm font-bold text-green-300">{timers.timers.filter(t => t.reported).length}</span>
                </div>
              </div>
              <button onClick={() => navigate('/certin-dpdpa')} className="mt-3 w-full text-center text-xs bg-white/10 hover:bg-white/20 rounded py-1.5 transition-colors">
                View Timers →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}