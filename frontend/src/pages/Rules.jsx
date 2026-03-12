import React, { useState, useEffect } from 'react'
import { api } from '../lib/api'

export default function Rules() {
  const [data, setData] = useState({rules: []})

  useEffect(() => {
    api('/api/rules').then(setData)
  }, [])

  if (!data) return <div className="p-6 text-gray-500">Loading rules...</div>

  return (
    <div className="p-6 space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Detection Rules</h1>
        <p className="text-gray-500 mt-1">{data.total} rules configured</p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left p-3 text-xs font-medium text-gray-500 uppercase">ID</th>
              <th className="text-left p-3 text-xs font-medium text-gray-500 uppercase">Rule Name</th>
              <th className="text-left p-3 text-xs font-medium text-gray-500 uppercase">Severity</th>
              <th className="text-left p-3 text-xs font-medium text-gray-500 uppercase">Source</th>
              <th className="text-left p-3 text-xs font-medium text-gray-500 uppercase">MITRE</th>
              <th className="text-left p-3 text-xs font-medium text-gray-500 uppercase">Hits (30d)</th>
              <th className="text-left p-3 text-xs font-medium text-gray-500 uppercase">Status</th>
            </tr>
          </thead>
          <tbody>
            {data.rules.map(r => (
              <tr key={r.id} className="border-b border-gray-50 hover:bg-blue-50">
                <td className="p-3 text-sm font-mono text-gray-600">{r.id}</td>
                <td className="p-3 text-sm font-medium text-gray-900">{r.name}</td>
                <td className="p-3">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    r.severity === 'critical' ? 'bg-red-100 text-red-700' :
                    r.severity === 'high' ? 'bg-orange-100 text-orange-700' :
                    r.severity === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>{r.severity}</span>
                </td>
                <td className="p-3 text-xs text-gray-500">{r.source}</td>
                <td className="p-3 text-xs font-mono text-red-500">{r.mitre}</td>
                <td className="p-3 text-sm font-bold text-gray-700">{r.hits30d}</td>
                <td className="p-3">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    r.enabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                  }`}>{r.enabled ? 'Enabled' : 'Disabled'}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}