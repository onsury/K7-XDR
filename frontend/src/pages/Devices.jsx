import React, { useState, useEffect } from 'react'
import { api } from '../lib/api'

function RiskBar({ score }) {
  const color = score >= 70 ? '#ef4444' : score >= 40 ? '#f59e0b' : '#22c55e'
  return (
    <div className="flex items-center gap-2">
      <div className="w-16 bg-gray-100 rounded-full h-2">
        <div className="h-2 rounded-full" style={{ width: `${score}%`, backgroundColor: color }} />
      </div>
      <span className="text-xs font-bold" style={{ color }}>{score}</span>
    </div>
  )
}

function StatusDot({ status }) {
  const c = { active: 'bg-green-500', inactive: 'bg-gray-400', isolated: 'bg-red-500', warning: 'bg-yellow-500' }
  return (
    <div className="flex items-center gap-1.5">
      <div className={`w-2 h-2 rounded-full ${c[status] || 'bg-gray-400'}`} />
      <span className="text-xs text-gray-600">{status}</span>
    </div>
  )
}

export default function Devices() {
  const [devices, setDevices] = useState([])
  const [filtered, setFiltered] = useState([])
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortBy, setSortBy] = useState('risk')

  useEffect(() => {
    api('/api/devices').then(d => {
      const list = d.devices || d
      setDevices(list)
    })
  }, [])

  useEffect(() => {
    let f = [...devices]
    if (typeFilter !== 'all') f = f.filter(d => (d.type || d.deviceType) === typeFilter)
    if (statusFilter !== 'all') f = f.filter(d => d.agentStatus === statusFilter)
    if (search) f = f.filter(d => (d.hostname || d.name || '').toLowerCase().includes(search.toLowerCase()) || (d.ip || d.ipAddress || '').includes(search))
    if (sortBy === 'risk') f.sort((a, b) => (b.riskScore || 0) - (a.riskScore || 0))
    else f.sort((a, b) => (a.hostname || a.name || '').localeCompare(b.hostname || b.name || ''))
    setFiltered(f)
  }, [typeFilter, statusFilter, search, sortBy, devices])

  const types = [...new Set(devices.map(d => d.type || d.deviceType))].filter(Boolean)
  const statuses = [...new Set(devices.map(d => d.agentStatus))].filter(Boolean)
  const activeCount = devices.filter(d => d.agentStatus === 'active').length
  const highRisk = devices.filter(d => (d.riskScore || 0) >= 70).length
  const avgRisk = devices.length > 0 ? Math.round(devices.reduce((s, d) => s + (d.riskScore || 0), 0) / devices.length) : 0

  return (
    <div className="p-5 space-y-4 bg-gray-50 min-h-full">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Devices</h1>
        <p className="text-sm text-gray-400">{filtered.length} of {devices.length} devices</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="text-xs uppercase text-gray-400">Total</div>
          <div className="text-2xl font-bold text-gray-900">{devices.length}</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="text-xs uppercase text-gray-400">Active Agents</div>
          <div className="text-2xl font-bold text-green-600">{activeCount}</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="text-xs uppercase text-gray-400">High Risk</div>
          <div className="text-2xl font-bold text-red-600">{highRisk}</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="text-xs uppercase text-gray-400">Avg Risk</div>
          <div className={`text-2xl font-bold ${avgRisk >= 70 ? 'text-red-600' : avgRisk >= 40 ? 'text-yellow-600' : 'text-green-600'}`}>{avgRisk}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-3 flex flex-wrap items-center gap-3">
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search hostname or IP..."
          className="flex-1 min-w-48 text-sm border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-k7-500 outline-none" />
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none">
          <option value="all">All Types</option>
          {types.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none">
          <option value="all">All Agents</option>
          {statuses.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none">
          <option value="risk">Risk: High→Low</option>
          <option value="name">Name: A→Z</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase">
              <th className="px-4 py-3">Device</th>
              <th className="px-4 py-3 w-24">Type</th>
              <th className="px-4 py-3 w-32">IP</th>
              <th className="px-4 py-3 w-28">OS</th>
              <th className="px-4 py-3 w-24">Agent</th>
              <th className="px-4 py-3 w-32">Risk Score</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.map((dev, i) => (
              <tr key={dev.id || i} className={`hover:bg-gray-50 transition-colors ${(dev.riskScore || 0) >= 70 ? 'bg-red-50/40' : ''}`}>
                <td className="px-4 py-3">
                  <div className="text-sm font-medium text-gray-900">{dev.hostname || dev.name}</div>
                  {dev.department && <div className="text-xs text-gray-400">{dev.department}</div>}
                </td>
                <td className="px-4 py-3"><span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{dev.type || dev.deviceType}</span></td>
                <td className="px-4 py-3 text-xs font-mono text-gray-600">{dev.ip || dev.ipAddress}</td>
                <td className="px-4 py-3 text-xs text-gray-500">{dev.os?.name} {dev.os?.version}</td>
                <td className="px-4 py-3"><StatusDot status={dev.agentStatus} /></td>
                <td className="px-4 py-3"><RiskBar score={dev.riskScore || 0} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}