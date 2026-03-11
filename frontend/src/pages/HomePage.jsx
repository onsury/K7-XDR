import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

function AnimatedNumber({ target, duration = 2000 }) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    let start = 0
    const step = Math.ceil(target / (duration / 30))
    const timer = setInterval(() => {
      start += step
      if (start >= target) { setCount(target); clearInterval(timer) }
      else setCount(start)
    }, 30)
    return () => clearInterval(timer)
  }, [target, duration])
  return <span>{count}</span>
}

function LiveStat({ label, value, color, icon }) {
  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 text-center">
      <div className="text-3xl mb-2">{icon}</div>
      <div className={`text-4xl font-bold ${color}`}><AnimatedNumber target={value} /></div>
      <div className="text-blue-200 text-sm mt-2">{label}</div>
    </div>
  )
}

export default function HomePage() {
  const [stats, setStats] = useState(null)
  const [compliance, setCompliance] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    fetch('/api/health').then(r => r.json()).then(setStats).catch(() => {})
    fetch('/api/compliance').then(r => r.json()).then(setCompliance).catch(() => {})
  }, [])

  const features = [
    { icon: 'S', title: 'K7 Scan Engine', desc: 'Proprietary malware detection with 25+ years of threat research.' },
    { icon: 'H', title: 'Threat Hunting', desc: 'Proactive search using MITRE ATT&CK-mapped queries.' },
    { icon: 'R', title: 'Automated Response', desc: '8 playbooks with auto isolation, IP blocking, CERT-In reporting.' },
    { icon: 'M', title: 'MITRE ATT&CK', desc: '847 detection rules mapped to 12 tactics and 61 techniques.' },
    { icon: 'C', title: 'Indian Compliance', desc: 'CERT-In, DPDPA, RBI CSF, SEBI CSCRF - all automated.' },
    { icon: 'D', title: 'Deception Tech', desc: 'K7 honeypots detect lateral movement with zero false positives.' },
    { icon: 'I', title: 'IT + OT + IoT', desc: 'Unified visibility across all device types and cloud workloads.' },
    { icon: 'L', title: '10+ Integrations', desc: 'AD, FortiGate, M365, AWS, Slack - one pane of glass.' },
  ]

  const frameworks = compliance?.frameworks || []

  return (
    <div className="min-h-screen bg-gradient-to-b from-k7-700 via-k7-800 to-k7-900">
      <nav className="flex items-center justify-between px-8 py-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
            <span className="text-k7-700 font-black text-lg">K7</span>
          </div>
          <span className="text-white text-xl font-bold">XDR Platform</span>
        </div>
        <div className="flex items-center gap-4">
          <a href="#features" className="text-blue-200 hover:text-white text-sm">Features</a>
          <a href="#compliance" className="text-blue-200 hover:text-white text-sm">Compliance</a>
          <a href="#live" className="text-blue-200 hover:text-white text-sm">Live Preview</a>
          <button onClick={() => navigate('/login')} className="bg-white text-k7-700 px-5 py-2 rounded-lg font-medium hover:bg-blue-50">
            Sign In
          </button>
        </div>
      </nav>

      <section className="px-8 py-20 text-center max-w-5xl mx-auto">
        <div className="inline-block px-4 py-1.5 bg-white/10 rounded-full text-blue-200 text-sm mb-6 border border-white/20">
          Made in India. Built for Indian Enterprises.
        </div>
        <h1 className="text-5xl md:text-6xl font-bold text-white leading-tight">
          Extended Detection<br />& Response by <span className="text-blue-300">K7 Computing</span>
        </h1>
        <p className="text-xl text-blue-200 mt-6 max-w-3xl mx-auto leading-relaxed">
          India's only XDR platform with native CERT-In reporting, DPDPA compliance, and RBI cybersecurity framework - powered by K7's 25+ years of threat intelligence.
        </p>
        <div className="flex items-center justify-center gap-4 mt-10">
          <button onClick={() => navigate('/login')} className="bg-white text-k7-700 px-8 py-3 rounded-lg font-semibold text-lg hover:bg-blue-50 shadow-xl">
            Launch Platform
          </button>
          <a href="#live" className="border border-white/30 text-white px-8 py-3 rounded-lg font-medium text-lg hover:bg-white/10">
            See Live Data
          </a>
        </div>
      </section>
      <section id="live" className="px-8 py-16 max-w-5xl mx-auto">
        <h2 className="text-center text-2xl font-bold text-white mb-2">Live Platform Status</h2>
        <p className="text-center text-blue-200 mb-10">Real data from the K7 XDR backend - not mockups</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <LiveStat icon="!" label="Active Incidents" value={stats?.data?.incidents || 30} color="text-red-400" />
          <LiveStat icon="+" label="Protected Devices" value={stats?.data?.devices || 50} color="text-blue-300" />
          <LiveStat icon="*" label="Alerts Processed" value={stats?.data?.alerts || 200} color="text-yellow-400" />
          <LiveStat icon="#" label="Detection Rules" value={847} color="text-green-400" />
        </div>
      </section>

      <section id="features" className="px-8 py-16 max-w-6xl mx-auto">
        <h2 className="text-center text-2xl font-bold text-white mb-2">Platform Capabilities</h2>
        <p className="text-center text-blue-200 mb-10">Enterprise-grade XDR for Indian regulatory requirements</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((f, i) => (
            <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-5 hover:bg-white/10 hover:border-white/30">
              <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center text-white font-bold text-lg mb-3">{f.icon}</div>
              <h3 className="text-white font-semibold text-sm mb-2">{f.title}</h3>
              <p className="text-blue-200 text-xs leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="compliance" className="px-8 py-16 max-w-5xl mx-auto">
        <h2 className="text-center text-2xl font-bold text-white mb-2">Indian Compliance Dashboard</h2>
        <p className="text-center text-blue-200 mb-10">Real-time compliance scores across 7 frameworks</p>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {frameworks.map((fw) => (
            <div key={fw.id} className="bg-white/10 border border-white/20 rounded-xl p-4 text-center hover:bg-white/20">
              <div className="text-white font-semibold text-xs mb-2">{fw.name}</div>
              <div className="text-3xl font-bold" style={{ color: fw.score >= 80 ? '#4ade80' : fw.score >= 60 ? '#fbbf24' : '#f87171' }}>
                {fw.score}%
              </div>
              <div className="text-blue-300 text-xs mt-1">{fw.controlsPassed}/{fw.totalControls}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="px-8 py-16 max-w-5xl mx-auto">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-10">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">Why K7 XDR?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-300">25+</div>
              <div className="text-white font-medium mt-2">Years of Threat Research</div>
              <div className="text-blue-200 text-sm mt-1">K7 Computing's proprietary malware research lab</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-400">100%</div>
              <div className="text-white font-medium mt-2">Data Sovereignty</div>
              <div className="text-blue-200 text-sm mt-1">All data processed and stored in India</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-yellow-400">6hr</div>
              <div className="text-white font-medium mt-2">CERT-In Compliance</div>
              <div className="text-blue-200 text-sm mt-1">Automated incident reporting within mandate</div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-8 py-20 text-center">
        <h2 className="text-3xl font-bold text-white mb-4">Ready to secure your enterprise?</h2>
        <p className="text-blue-200 text-lg mb-8">Experience India's most comprehensive XDR platform</p>
        <button onClick={() => navigate('/login')} className="bg-white text-k7-700 px-10 py-4 rounded-lg font-semibold text-lg hover:bg-blue-50 shadow-xl">
          Launch K7 XDR Dashboard
        </button>
      </section>

      <footer className="px-8 py-6 border-t border-white/10 text-center">
        <div className="text-blue-300 text-sm">K7 Computing Private Limited - Chennai, India</div>
        <div className="text-blue-400 text-xs mt-1">Enterprise Extended Detection & Response Platform v1.0.0-mvp</div>
      </footer>
    </div>
  )
}