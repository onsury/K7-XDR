import React, { useState, useEffect } from 'react'
import { api } from '../lib/api'

const TYPE_COLORS = {
  compliance: 'bg-red-100 text-red-700',
  scheduled: 'bg-blue-100 text-blue-700',
  executive: 'bg-purple-100 text-purple-700',
  operational: 'bg-green-100 text-green-700',
  strategic: 'bg-indigo-100 text-indigo-700',
  tactical: 'bg-orange-100 text-orange-700',
}

export default function Reports() {
  const [reports, setReports] = useState([])
  const [generating, setGenerating] = useState(null)
  const [generated, setGenerated] = useState({})
  const [typeFilter, setTypeFilter] = useState('all')

  useEffect(() => {
    api('/api/reports').then(d => setReports(d.reports || d))
  }, [])

  const generate = (id, name) => {
    setGenerating(id)
    setTimeout(() => {
      setGenerating(null)
      setGenerated(prev => ({ ...prev, [id]: { time: new Date().toLocaleTimeString('en-IN'), name } }))
    }, 2000)
  }

  const types = [...new Set(reports.map(r => r.type))].filter(Boolean)
  const filtered = typeFilter === 'all' ? reports : reports.filter(r => r.type === typeFilter)

  return (
    <div className="p-5 space-y-4 bg-gray-50 min-h-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
          <p className="text-sm text-gray-400">{reports.length} report templates available</p>
        </div>
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none">
          <option value="all">All Types</option>
          {types.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {types.map(t => (
          <button key={t} onClick={() => setTypeFilter(typeFilter === t ? 'all' : t)}
            className={`p-3 rounded-xl border-2 text-left transition-all ${typeFilter === t ? 'ring-2 ring-k7-500 ' + (TYPE_COLORS[t] || 'bg-gray-100') : 'bg-white border-gray-200 hover:shadow'}`}>
            <div className="text-xs uppercase text-gray-400">{t}</div>
            <div className="text-xl font-bold text-gray-900">{reports.filter(r => r.type === t).length}</div>
          </button>
        ))}
      </div>

      {/* Report Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map(report => (
          <div key={report.id} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{report.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${TYPE_COLORS[report.type] || 'bg-gray-100 text-gray-600'}`}>{report.type}</span>
                  <span className="text-xs text-gray-400">{report.frequency}</span>
                  <span className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">{report.format?.toUpperCase()}</span>
                </div>
              </div>
            </div>

            <div className="text-xs text-gray-400 mb-4">
              Last generated: {new Date(report.lastGenerated).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => generate(report.id, report.name)}
                disabled={generating === report.id}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                  generating === report.id
                    ? 'bg-gray-100 text-gray-400 cursor-wait'
                    : 'bg-k7-600 text-white hover:bg-k7-700'
                }`}
              >
                {generating === report.id ? '⟳ Generating...' : '▶ Generate Now'}
              </button>
              <button className="px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                📥 Download
              </button>
            </div>

            {generated[report.id] && (
              <div className="mt-2 text-xs bg-green-50 text-green-700 p-2 rounded-lg">
                ✓ Generated at {generated[report.id].time}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      {Object.keys(generated).length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="font-semibold text-gray-900 mb-3">Generation Activity</h3>
          <div className="space-y-2">
            {Object.entries(generated).map(([id, info]) => (
              <div key={id} className="flex items-center justify-between text-sm p-2 bg-green-50 rounded-lg">
                <span className="text-green-700">✓ {info.name}</span>
                <span className="text-xs text-green-500">{info.time}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}