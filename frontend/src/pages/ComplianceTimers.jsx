import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../lib/api'

function CountdownTimer({ remainingSeconds, expired, reported }) {
  const [seconds, setSeconds] = useState(Math.floor(remainingSeconds))

  useEffect(() => {
    if (reported || expired) return
    const timer = setInterval(() => {
      setSeconds(prev => {
        if (prev <= 0) { clearInterval(timer); return 0 }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [reported, expired])

  if (reported) return (
    <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
      <div className="text-green-700 font-bold text-lg">REPORTED</div>
      <div className="text-green-600 text-xs">Submitted to CERT-In</div>
    </div>
  )

  const hrs = Math.floor(seconds / 3600)
  const mins = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60
  const pct = Math.max(0, (seconds / (6 * 3600)) * 100)
  const isUrgent = seconds < 3600
  const isCritical = seconds <= 0

  return (
    <div className={`text-center p-4 rounded-lg border ${isCritical ? 'bg-red-50 border-red-300' : isUrgent ? 'bg-orange-50 border-orange-300' : 'bg-white border-gray-200'}`}>
      <div className={`font-mono text-3xl font-bold ${isCritical ? 'text-red-600 animate-pulse' : isUrgent ? 'text-orange-600' : 'text-gray-900'}`}>
        {isCritical ? 'EXPIRED' : `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`}
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
        <div className={`h-2 rounded-full transition-all ${isCritical ? 'bg-red-500' : isUrgent ? 'bg-orange-500' : 'bg-green-500'}`} style={{ width: `${pct}%` }} />
      </div>
      <div className="text-xs text-gray-500 mt-1">{isCritical ? 'Deadline breached!' : `${hrs}h ${mins}m remaining of 6 hours`}</div>
    </div>
  )
}

function DpdpaTimeline({ steps }) {
  return (
    <div className="space-y-3">
      {steps.map((s) => (
        <div key={s.step} className="flex items-start gap-3">
          <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
            s.status === 'completed' ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'
          }`}>{s.step}</div>
          <div className="flex-1">
            <div className={`text-sm font-medium ${s.status === 'completed' ? 'text-green-700' : 'text-gray-900'}`}>{s.name}</div>
            <div className="text-xs text-gray-500 mt-0.5">{s.description}</div>
          </div>
          <span className={`text-xs px-2 py-0.5 rounded-full ${
            s.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
          }`}>{s.status}</span>
        </div>
      ))}
    </div>
  )
}
export default function ComplianceTimers() {
    const [timers, setTimers] = useState([])
    const [dpdpaData, setDpdpaData] = useState(null)
    const [selectedIncident, setSelectedIncident] = useState(null)
    const navigate = useNavigate()
  
    useEffect(() => {
      api('/api/certin-dpdpa/timers').then(d => setTimers(d.timers || []))
    }, [])
  
    const loadDpdpa = async (incidentId) => {
      setSelectedIncident(incidentId)
      const data = await api(`/api/certin-dpdpa/dpdpa-assessment/${incidentId}`)
      setDpdpaData(data)
    }
  
    const certInTimers = timers.filter(t => t.type === 'cert_in')
    const dpdpaTimers = timers.filter(t => t.type === 'dpdpa')
  
    return (
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Compliance Timers</h1>
          <p className="text-gray-500 mt-1">Live countdown for regulatory reporting deadlines</p>
        </div>
  
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <h2 className="font-semibold text-gray-900">CERT-In 6-Hour Reporting Timers</h2>
            <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">{certInTimers.length} active</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {certInTimers.slice(0, 9).map(t => (
              <div key={t.incidentId + t.type} className="border border-gray-200 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <button onClick={() => navigate(`/app/incidents/${t.incidentId}`)} className="text-sm font-medium text-k7-500 hover:underline">{t.incidentId}</button>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    t.severity === 'critical' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
                  }`}>{t.severity}</span>
                </div>
                <div className="text-xs text-gray-600 mb-2 truncate">{t.title}</div>
                <CountdownTimer remainingSeconds={t.remainingSeconds} expired={t.expired} reported={t.reported} />
              </div>
            ))}
          </div>
        </div>
  
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
            <h2 className="font-semibold text-gray-900">DPDPA 72-Hour Breach Notification</h2>
            <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">{dpdpaTimers.length} active</span>
          </div>
          {dpdpaTimers.length === 0 ? (
            <div className="text-sm text-gray-400">No DPDPA breach assessments required for current incidents</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {dpdpaTimers.map(t => (
                <button key={t.incidentId + t.type} onClick={() => loadDpdpa(t.incidentId)}
                  className={`text-left border rounded-lg p-3 ${selectedIncident === t.incidentId ? 'border-k7-500 bg-k7-50' : 'border-gray-200 hover:border-gray-300'}`}>
                  <div className="text-sm font-medium text-gray-900">{t.incidentId} - {t.title}</div>
                  <div className="text-xs text-gray-500 mt-1">72-hour deadline: {new Date(t.deadline).toLocaleString('en-IN')}</div>
                  <div className={`text-xs mt-1 font-medium ${t.expired ? 'text-red-600' : 'text-orange-600'}`}>
                    {t.expired ? 'DEADLINE BREACHED' : `${Math.floor(t.remainingSeconds / 3600)}h remaining`}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
  
        {dpdpaData && !dpdpaData.error && (
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h2 className="font-semibold text-gray-900 mb-1">DPDPA Breach Assessment: {dpdpaData.incidentId}</h2>
            <p className="text-sm text-gray-500 mb-4">{dpdpaData.title}</p>
  
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              <div className="p-3 rounded-lg bg-gray-50 text-center">
                <div className="text-xs text-gray-500">Personal Data</div>
                <div className={`text-sm font-bold mt-1 ${dpdpaData.dataClassification.personalData ? 'text-red-600' : 'text-green-600'}`}>
                  {dpdpaData.dataClassification.personalData ? 'YES' : 'NO'}
                </div>
              </div>
              <div className="p-3 rounded-lg bg-gray-50 text-center">
                <div className="text-xs text-gray-500">Sensitive Data</div>
                <div className={`text-sm font-bold mt-1 ${dpdpaData.dataClassification.sensitivePersonalData ? 'text-red-600' : 'text-green-600'}`}>
                  {dpdpaData.dataClassification.sensitivePersonalData ? 'YES' : 'NO'}
                </div>
              </div>
              <div className="p-3 rounded-lg bg-gray-50 text-center">
                <div className="text-xs text-gray-500">Risk Level</div>
                <div className={`text-sm font-bold mt-1 ${dpdpaData.riskLevel === 'high' ? 'text-red-600' : 'text-green-600'}`}>
                  {dpdpaData.riskLevel.toUpperCase()}
                </div>
              </div>
              <div className="p-3 rounded-lg bg-gray-50 text-center">
                <div className="text-xs text-gray-500">DPO Notified</div>
                <div className={`text-sm font-bold mt-1 ${dpdpaData.dpoNotified ? 'text-green-600' : 'text-orange-600'}`}>
                  {dpdpaData.dpoNotified ? 'YES' : 'PENDING'}
                </div>
              </div>
            </div>
  
            <h3 className="font-medium text-gray-900 mb-3">Assessment Workflow (DPDPA Section 8)</h3>
            <DpdpaTimeline steps={dpdpaData.steps} />
          </div>
        )}
      </div>
    )
  }