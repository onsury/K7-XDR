import React, { useState, useEffect } from 'react'
import { api } from '../lib/api'

const SEV_COLORS = { critical: 'bg-red-100 text-red-700', high: 'bg-orange-100 text-orange-700', medium: 'bg-yellow-100 text-yellow-700', low: 'bg-blue-100 text-blue-700' }

export default function Playbooks() {
  const [playbooks, setPlaybooks] = useState([])
  const [expanded, setExpanded] = useState(null)
  const [running, setRunning] = useState(null)
  const [completed, setCompleted] = useState({})

  useEffect(() => {
    api('/api/playbooks').then(d => setPlaybooks(d.playbooks || d))
  }, [])

  const runPlaybook = (id) => {
    setRunning(id)
    let step = 0
    const pb = playbooks.find(p => p.id === id)
    const steps = pb?.steps || pb?.actions || []
    const interval = setInterval(() => {
      step++
      setCompleted(prev => ({ ...prev, [id]: step }))
      if (step >= steps.length) {
        clearInterval(interval)
        setTimeout(() => setRunning(null), 500)
      }
    }, 800)
  }

  return (
    <div className="p-5 space-y-5 bg-gray-50 min-h-full">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Playbooks</h1>
        <p className="text-sm text-gray-400">{playbooks.length} automated response playbooks</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {playbooks.map((pb, i) => {
          const steps = pb.steps || pb.actions || []
          const isExpanded = expanded === i
          const isRunning = running === pb.id
          const doneSteps = completed[pb.id] || 0

          return (
            <div key={pb.id || i} className={`bg-white rounded-xl border-2 transition-all ${isExpanded ? 'border-k7-500 shadow-lg' : 'border-gray-200 hover:shadow-md'}`}>
              <div className="p-4 cursor-pointer" onClick={() => setExpanded(isExpanded ? null : i)}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{pb.name}</h3>
                    {pb.description && <p className="text-xs text-gray-400 mt-1">{pb.description}</p>}
                    <div className="flex items-center gap-2 mt-2">
                      {pb.severity && <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${SEV_COLORS[pb.severity] || 'bg-gray-100'}`}>{pb.severity}</span>}
                      <span className="text-xs text-gray-400">{steps.length} steps</span>
                      {pb.automated && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Automated</span>}
                    </div>
                  </div>
                  <span className="text-gray-400 text-lg">{isExpanded ? '▲' : '▼'}</span>
                </div>

                {/* Progress bar when running */}
                {doneSteps > 0 && (
                  <div className="mt-3">
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div className="h-2 rounded-full bg-green-500 transition-all" style={{ width: `${(doneSteps / steps.length) * 100}%` }} />
                    </div>
                    <div className="text-xs text-gray-400 mt-1">{doneSteps}/{steps.length} steps complete</div>
                  </div>
                )}
              </div>

              {isExpanded && (
                <div className="border-t border-gray-100 p-4 bg-gray-50/50">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-gray-500 uppercase">Response Steps</span>
                    <button
                      onClick={(e) => { e.stopPropagation(); runPlaybook(pb.id) }}
                      disabled={isRunning}
                      className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${
                        isRunning ? 'bg-gray-100 text-gray-400' : 'bg-k7-600 text-white hover:bg-k7-700'
                      }`}
                    >
                      {isRunning ? '⟳ Running...' : '▶ Execute Playbook'}
                    </button>
                  </div>

                  <div className="relative pl-6 space-y-2 border-l-2 border-gray-200">
                    {steps.map((step, j) => {
                      const stepDone = doneSteps > j
                      const stepActive = isRunning && doneSteps === j
                      return (
                        <div key={j} className="relative">
                          <div className={`absolute -left-7 w-3 h-3 rounded-full border-2 ${
                            stepDone ? 'bg-green-500 border-green-500' :
                            stepActive ? 'bg-yellow-400 border-yellow-400 animate-pulse' :
                            'bg-white border-gray-300'
                          }`} />
                          <div className={`text-sm p-2 rounded-lg ${stepDone ? 'bg-green-50 text-green-700' : stepActive ? 'bg-yellow-50 text-yellow-700' : 'text-gray-600'}`}>
                            <span className="font-medium">Step {j + 1}:</span> {step.action || step.name || step.description || step}
                            {stepDone && <span className="ml-2 text-green-500">✓</span>}
                          </div>
                        </div>
                      )
                    })}
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