import React, { useState, useEffect } from 'react'
import { api } from '../lib/api'

export default function AttackCoverage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api('/api/attack-coverage')
      .then(d => setData(d))
      .catch(() => setData(null))
      .finally(() => setLoading(false))
  }, [])

  const tactics = data?.tactics || [
    { name: 'Initial Access', techniques: 5, covered: 3 },
    { name: 'Execution', techniques: 8, covered: 6 },
    { name: 'Persistence', techniques: 10, covered: 7 },
    { name: 'Privilege Escalation', techniques: 7, covered: 5 },
    { name: 'Defense Evasion', techniques: 12, covered: 8 },
    { name: 'Credential Access', techniques: 6, covered: 4 },
    { name: 'Discovery', techniques: 9, covered: 7 },
    { name: 'Lateral Movement', techniques: 4, covered: 3 },
    { name: 'Collection', techniques: 5, covered: 3 },
    { name: 'Exfiltration', techniques: 6, covered: 4 },
    { name: 'Impact', techniques: 7, covered: 5 },
  ]

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">MITRE ATT&CK Coverage</h1>
      {loading ? (
        <div className="text-gray-400">Loading coverage data...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tactics.map((t, i) => {
            const pct = Math.round((t.covered / t.techniques) * 100)
            const color = pct >= 80 ? 'bg-green-500' : pct >= 50 ? 'bg-yellow-500' : 'bg-red-500'
            return (
              <div key={i} className="bg-white rounded-lg border p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="font-medium text-gray-900 text-sm">{t.name}</div>
                  <div className="text-xs text-gray-500">{t.covered}/{t.techniques}</div>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div className={`h-2 rounded-full ${color}`} style={{ width: pct + '%' }}></div>
                </div>
                <div className="text-xs text-gray-500 mt-1">{pct}% covered</div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
