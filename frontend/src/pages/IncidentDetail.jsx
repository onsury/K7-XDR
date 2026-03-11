import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '../lib/api'

const STATUS_FLOW = ['new', 'investigating', 'contained', 'resolved']
const ANALYSTS = ['Vikram Patel', 'Deepa Nair', 'Venkat Raghavan', 'Ananya Iyer', 'Rajesh Kumar', 'Priya Sharma']

function Badge({ text, color }) {
  return <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${color}`}>{text}</span>
}

function sevColor(s) {
  return { critical: 'bg-red-100 text-red-700', high: 'bg-orange-100 text-orange-700', medium: 'bg-yellow-100 text-yellow-700', low: 'bg-blue-100 text-blue-700' }[s] || 'bg-gray-100 text-gray-600'
}

function statusColor(s) {
  return { new: 'bg-blue-100 text-blue-700', investigating: 'bg-yellow-100 text-yellow-700', contained: 'bg-orange-100 text-orange-700', resolved: 'bg-green-100 text-green-700' }[s] || 'bg-gray-100'
}

export default function IncidentDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [inc, setInc] = useState(null)
  const [status, setStatus] = useState('')
  const [assignee, setAssignee] = useState('')
  const [notes, setNotes] = useState([])
  const [newNote, setNewNote] = useState('')
  const [showAssign, setShowAssign] = useState(false)

  useEffect(() => {
    api(`/api/incidents/${id}`).then(d => {
      const data = d.incident || d
      setInc(data)
      setStatus(data.status)
      setAssignee(data.assignedTo || 'Unassigned')
    })
  }, [id])

  const advanceStatus = () => {
    const idx = STATUS_FLOW.indexOf(status)
    if (idx < STATUS_FLOW.length - 1) {
      const next = STATUS_FLOW[idx + 1]
      setStatus(next)
      setNotes(prev => [...prev, { time: new Date().toLocaleTimeString('en-IN'), text: `Status changed: ${status} → ${next}`, type: 'status' }])
    }
  }

  const assignAnalyst = (name) => {
    setAssignee(name)
    setShowAssign(false)
    setNotes(prev => [...prev, { time: new Date().toLocaleTimeString('en-IN'), text: `Assigned to ${name}`, type: 'assign' }])
  }

  const addNote = () => {
    if (!newNote.trim()) return
    setNotes(prev => [...prev, { time: new Date().toLocaleTimeString('en-IN'), text: newNote, type: 'note' }])
    setNewNote('')
  }

  if (!inc) return <div className="p-6 text-gray-500">Loading incident...</div>

  const mitre = inc.mitre || {}
  const timeline = inc.timeline || []
  const response = inc.responseActions || []
  const nextStatus = STATUS_FLOW[STATUS_FLOW.indexOf(status) + 1]

  return (
    <div className="p-5 space-y-5 bg-gray-50 min-h-full">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <button onClick={() => navigate('/incidents')} className="text-sm text-k7-600 hover:underline mb-2 block">← Back to Incidents</button>
          <h1 className="text-xl font-bold text-gray-900">{inc.title}</h1>
          <div className="flex items-center gap-2 mt-2">
            <Badge text={inc.severity} color={sevColor(inc.severity)} />
            <Badge text={status} color={statusColor(status)} />
            <span className="text-sm text-gray-400">{inc.id}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {nextStatus && (
            <button onClick={advanceStatus} className="px-4 py-2 bg-k7-600 text-white text-sm font-medium rounded-lg hover:bg-k7-700 transition-colors">
              Move to → {nextStatus}
            </button>
          )}
          {status === 'resolved' && (
            <span className="px-4 py-2 bg-green-100 text-green-700 text-sm font-medium rounded-lg">✓ Resolved</span>
          )}
        </div>
      </div>

      {/* Action Bar */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-4 flex-wrap">
        <div className="relative">
          <button onClick={() => setShowAssign(!showAssign)} className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 flex items-center gap-2">
            <span className="text-gray-400">Assigned:</span>
            <span className="font-medium">{assignee}</span>
            <span className="text-gray-400">▼</span>
          </button>
          {showAssign && (
            <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 w-48">
              {ANALYSTS.map(name => (
                <button key={name} onClick={() => assignAnalyst(name)} className={`w-full text-left px-3 py-2 text-sm hover:bg-blue-50 ${name === assignee ? 'bg-blue-50 font-medium text-k7-600' : ''}`}>
                  {name}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-1 text-sm text-gray-500">
          <span>Status Pipeline:</span>
          {STATUS_FLOW.map((s, i) => (
            <span key={s} className="flex items-center">
              <span className={`px-2 py-0.5 rounded text-xs font-medium ${s === status ? 'bg-k7-600 text-white' : STATUS_FLOW.indexOf(s) < STATUS_FLOW.indexOf(status) ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>{s}</span>
              {i < STATUS_FLOW.length - 1 && <span className="mx-1 text-gray-300">→</span>}
            </span>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left: Details + Timeline */}
        <div className="lg:col-span-2 space-y-4">
          {/* Description */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
            <p className="text-sm text-gray-600">{inc.description}</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
              <div><div className="text-xs text-gray-400">Source</div><div className="text-sm font-medium">{inc.source}</div></div>
              <div><div className="text-xs text-gray-400">Category</div><div className="text-sm font-medium">{inc.category}</div></div>
              <div><div className="text-xs text-gray-400">Created</div><div className="text-sm font-medium">{new Date(inc.createdAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</div></div>
              <div><div className="text-xs text-gray-400">Affected</div><div className="text-sm font-medium">{inc.affectedAssets?.join(', ') || 'N/A'}</div></div>
            </div>
          </div>

          {/* MITRE ATT&CK */}
          {mitre.tactics && (
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <h3 className="font-semibold text-gray-900 mb-3">MITRE ATT&CK Mapping</h3>
              <div className="space-y-2">
                <div>
                  <div className="text-xs text-gray-400 mb-1">Tactics</div>
                  <div className="flex flex-wrap gap-1">{mitre.tactics.map(t => <Badge key={t} text={t} color="bg-purple-100 text-purple-700" />)}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-400 mb-1">Techniques</div>
                  <div className="flex flex-wrap gap-1">{mitre.techniques.map(t => <Badge key={t} text={t} color="bg-indigo-100 text-indigo-700" />)}</div>
                </div>
              </div>
            </div>
          )}

          {/* Timeline */}
          {timeline.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Investigation Timeline</h3>
              <div className="relative pl-6 space-y-3 border-l-2 border-gray-200">
                {timeline.map((t, i) => (
                  <div key={i} className="relative">
                    <div className="absolute -left-8 w-3 h-3 rounded-full bg-k7-500 border-2 border-white" />
                    <div className="text-xs text-gray-400">{t.time || t.timestamp}</div>
                    <div className="text-sm text-gray-700">{t.event || t.action}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Response Actions */}
          {response.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Response Actions</h3>
              <div className="space-y-2">
                {response.map((r, i) => (
                  <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-gray-50">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${r.status === 'completed' ? 'bg-green-500' : r.status === 'in_progress' ? 'bg-yellow-500' : 'bg-gray-400'}`} />
                      <span className="text-sm">{r.action || r.name}</span>
                    </div>
                    <Badge text={r.status} color={r.status === 'completed' ? 'bg-green-100 text-green-700' : r.status === 'in_progress' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-500'} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          {/* Analyst Notes */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Analyst Notes & Activity</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto mb-3">
              {notes.length === 0 && <div className="text-sm text-gray-400 italic">No notes yet</div>}
              {notes.map((n, i) => (
                <div key={i} className={`text-sm p-2 rounded-lg ${n.type === 'status' ? 'bg-blue-50 text-blue-700' : n.type === 'assign' ? 'bg-purple-50 text-purple-700' : 'bg-gray-50 text-gray-700'}`}>
                  <span className="text-xs text-gray-400">{n.time}</span> — {n.text}
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                value={newNote}
                onChange={e => setNewNote(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addNote()}
                placeholder="Add investigation note..."
                className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-k7-500 focus:border-transparent outline-none"
              />
              <button onClick={addNote} className="px-3 py-2 bg-k7-600 text-white text-sm rounded-lg hover:bg-k7-700">Add</button>
            </div>
          </div>

          {/* Compliance */}
          {inc.compliance && (
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Compliance Impact</h3>
              <div className="space-y-2">
                {Object.entries(inc.compliance).map(([key, val]) => (
                  <div key={key} className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">{key}</span>
                    <Badge text={val ? 'Triggered' : 'N/A'} color={val ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-500'} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Indicators */}
          {inc.indicators && inc.indicators.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Indicators of Compromise</h3>
              <div className="space-y-1">
                {inc.indicators.map((ioc, i) => (
                  <div key={i} className="text-xs font-mono bg-gray-50 p-1.5 rounded text-gray-600 break-all">{ioc.type}: {ioc.value}</div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Stats */}
          <div className="bg-gradient-to-br from-k7-700 to-k7-800 rounded-xl p-4 text-white">
            <h3 className="font-semibold mb-3">Quick Stats</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-blue-200">Severity</span><span className="font-bold">{inc.severity}</span></div>
              <div className="flex justify-between"><span className="text-blue-200">Status</span><span className="font-bold">{status}</span></div>
              <div className="flex justify-between"><span className="text-blue-200">Assigned</span><span className="font-bold">{assignee}</span></div>
              <div className="flex justify-between"><span className="text-blue-200">Timeline Events</span><span className="font-bold">{timeline.length}</span></div>
              <div className="flex justify-between"><span className="text-blue-200">Response Actions</span><span className="font-bold">{response.length}</span></div>
              <div className="flex justify-between"><span className="text-blue-200">Notes</span><span className="font-bold">{notes.length}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}