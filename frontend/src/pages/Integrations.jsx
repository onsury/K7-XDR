import React, { useState, useEffect } from 'react'
import { api } from '../lib/api'

export default function Integrations() {
  const [data, setData] = useState(null)

  useEffect(() => {
    api('/api/integrations').then(setData)
  }, [])

  if (!data) return <div className="p-6 text-gray-500">Loading integrations...</div>

  return (
    <div className="p-6 space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Integrations</h1>
        <p className="text-gray-500 mt-1">Connected security tools and data sources</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {data.integrations.map(int => (
          <div key={int.id} className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium text-gray-900">{int.name}</div>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                int.status === 'connected' ? 'bg-green-100 text-green-700' :
                int.status === 'standby' ? 'bg-yellow-100 text-yellow-700' :
                'bg-gray-100 text-gray-500'
              }`}>{int.status}</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">{int.description}</p>
            <div className="flex items-center gap-3 mt-3 text-xs text-gray-400">
              <span className="px-2 py-0.5 bg-gray-100 rounded">{int.type}</span>
              {int.lastSync && <span>Last sync: {new Date(int.lastSync).toLocaleString('en-IN')}</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}