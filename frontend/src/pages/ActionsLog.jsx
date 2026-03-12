import React, { useState, useEffect } from 'react'
import { api } from '../lib/api'

export default function ActionsLog() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api('/api/actions-log')
      .then(d => setLogs(d.logs || d || []))
      .catch(() => setLogs([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Actions Log</h1>
      <div className="bg-white rounded-lg border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Time</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Action</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">User</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Target</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">Loading...</td></tr>
            ) : logs.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">No actions logged</td></tr>
            ) : logs.map((log, i) => (
              <tr key={i} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-500">{log.timestamp ? new Date(log.timestamp).toLocaleString() : '-'}</td>
                <td className="px-4 py-3 font-medium text-gray-900">{log.action || log.type}</td>
                <td className="px-4 py-3 text-gray-600">{log.user || log.performed_by}</td>
                <td className="px-4 py-3 text-gray-600">{log.target || log.resource}</td>
                <td className="px-4 py-3 font-medium">{log.status || log.severity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
