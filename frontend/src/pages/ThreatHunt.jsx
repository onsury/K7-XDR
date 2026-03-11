import React, { useState, useEffect } from 'react'
import { api } from '../lib/api'

const SAMPLE_QUERIES = [
  { label: 'Ransomware indicators', query: 'ransomware' },
  { label: 'PowerShell execution', query: 'powershell' },
  { label: 'Lateral movement', query: 'lateral movement' },
  { label: 'Data exfiltration', query: 'exfiltration' },
  { label: 'C2 communication', query: 'command and control' },
  { label: 'Privilege escalation', query: 'privilege escalation' },
]

export default function ThreatHunt() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState(null)
  const [hunting, setHunting] = useState(false)
  const [history, setHistory] = useState([])
  const [saved, setSaved] = useState([])

  useEffect(() => {
    api('/api/threat-hunt/saved-queries').then(d => setSaved(d.queries || d.savedQueries || [])).catch(() => {})
  }, [])

  const hunt = (q) => {
    const searchQuery = q || query
    if (!searchQuery.trim()) return
    setQuery(searchQuery)
    setHunting(true)
    setResults(null)

    api(`/api/threat-hunt?query=${encodeURIComponent(searchQuery)}`).then(d => {
      setResults(d)
      setHunting(false)
      setHistory(prev => [{ query: searchQuery, time: new Date().toLocaleTimeString('en-IN'), count: d.results?.length || d.matches?.length || 0 }, ...prev.slice(0, 9)])
    }).catch(() => {
      setResults({ results: [], message: 'No threats found matching query' })
      setHunting(false)
    })
  }

  const matches = results?.results || results?.matches || []

  return (
    <div className="p-5 space-y-5 bg-gray-50 min-h-full">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Threat Hunt</h1>
        <p className="text-sm text-gray-400">Proactive threat hunting across all telemetry</p>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex gap-2">
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && hunt()}
            placeholder="Enter threat hypothesis... (e.g., ransomware, powershell, lateral movement)"
            className="flex-1 text-sm border border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-k7-500 focus:border-transparent outline-none"
          />
          <button onClick={() => hunt()} disabled={hunting}
            className={`px-6 py-3 font-medium rounded-lg transition-all text-sm ${hunting ? 'bg-gray-200 text-gray-400' : 'bg-k7-600 text-white hover:bg-k7-700'}`}>
            {hunting ? '⟳ Hunting...' : '🔍 Hunt'}
          </button>
        </div>

        {/* Quick Queries */}
        <div className="flex flex-wrap gap-2 mt-3">
          {SAMPLE_QUERIES.map(sq => (
            <button key={sq.query} onClick={() => hunt(sq.query)}
              className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-k7-100 hover:text-k7-700 rounded-full transition-colors text-gray-600">
              {sq.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Results */}
        <div className="lg:col-span-2 space-y-4">
          {hunting && (
            <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
              <div className="text-4xl mb-3 animate-pulse">🔍</div>
              <div className="text-gray-500">Hunting across endpoints, network, and identity telemetry...</div>
              <div className="flex justify-center gap-1 mt-3">
                {['Endpoints', 'Network', 'Identity', 'Email'].map(s => (
                  <span key={s} className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded animate-pulse">{s}</span>
                ))}
              </div>
            </div>
          )}

          {results && !hunting && (
            <>
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-semibold text-gray-900">Hunt Results</h3>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${matches.length > 0 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                    {matches.length} {matches.length === 1 ? 'match' : 'matches'}
                  </span>
                </div>
                <div className="text-xs text-gray-400">Query: "{query}"</div>
              </div>

              {matches.length > 0 ? (
                <div className="space-y-3">
                  {matches.map((m, i) => {
                    const sevColor = { critical: 'border-red-400 bg-red-50', high: 'border-orange-400 bg-orange-50', medium: 'border-yellow-400 bg-yellow-50', low: 'border-blue-400 bg-blue-50' }
                    return (
                      <div key={i} className={`bg-white rounded-xl border-l-4 border border-gray-200 p-4 ${sevColor[m.severity] || ''}`}>
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-medium text-gray-900 text-sm">{m.title || m.description || m.indicator}</h4>
                            {m.source && <div className="text-xs text-gray-400 mt-1">Source: {m.source}</div>}
                            {m.device && <div className="text-xs text-gray-400">Device: {m.device}</div>}
                            {m.timestamp && <div className="text-xs text-gray-400">{new Date(m.timestamp).toLocaleString('en-IN')}</div>}
                          </div>
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                            m.severity === 'critical' ? 'bg-red-100 text-red-700' :
                            m.severity === 'high' ? 'bg-orange-100 text-orange-700' :
                            m.severity === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-blue-100 text-blue-700'
                          }`}>{m.severity}</span>
                        </div>
                        {m.details && <div className="text-xs text-gray-500 mt-2 bg-gray-50 p-2 rounded font-mono">{m.details}</div>}
                        {m.mitre && <div className="flex gap-1 mt-2">{(Array.isArray(m.mitre) ? m.mitre : [m.mitre]).map(t => <span key={t} className="text-xs bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded">{t}</span>)}</div>}
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
                  <div className="text-3xl mb-2">✅</div>
                  <div className="text-gray-500">No matching threats found</div>
                  <div className="text-xs text-gray-400 mt-1">Try a different search query</div>
                </div>
              )}
            </>
          )}

          {!results && !hunting && (
            <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
              <div className="text-4xl mb-3">🎯</div>
              <div className="font-medium text-gray-700">Start a Threat Hunt</div>
              <div className="text-sm text-gray-400 mt-1">Enter a hypothesis or click a quick query above</div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Hunt History */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Hunt History</h3>
            {history.length === 0 ? (
              <div className="text-sm text-gray-400 italic">No hunts yet this session</div>
            ) : (
              <div className="space-y-2">
                {history.map((h, i) => (
                  <button key={i} onClick={() => hunt(h.query)} className="w-full text-left p-2 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="text-sm text-gray-700">{h.query}</div>
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span>{h.time}</span>
                      <span className={h.count > 0 ? 'text-red-500 font-medium' : 'text-green-500'}>{h.count} hits</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Saved Queries */}
          {saved.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Saved Queries</h3>
              <div className="space-y-1">
                {saved.map((sq, i) => (
                  <button key={i} onClick={() => hunt(sq.query || sq.name || sq)} className="w-full text-left p-2 rounded-lg hover:bg-gray-50 text-sm text-gray-700">
                    {sq.name || sq.query || sq}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Tips */}
          <div className="bg-gradient-to-br from-k7-700 to-k7-800 rounded-xl p-4 text-white">
            <h3 className="font-semibold mb-2">Hunt Tips</h3>
            <ul className="space-y-1.5 text-sm text-blue-200">
              <li>• Search by IOC, technique, or behavior</li>
              <li>• Combine terms: "powershell encoded"</li>
              <li>• Hunt runs across all data sources</li>
              <li>• Results mapped to MITRE ATT&CK</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}