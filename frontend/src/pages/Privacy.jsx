import React from 'react'
import { useNavigate } from 'react-router-dom'
export default function Privacy() {
  const navigate = useNavigate()

  const Nav = () => (
    <nav className="flex items-center justify-between px-8 py-4 border-b border-white/10">
      <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center"><span className="text-k7-700 font-black text-lg">K7</span></div>
        <span className="text-white text-xl font-bold">XDR Platform</span>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-blue-200 text-sm cursor-pointer hover:text-white" onClick={() => navigate('/about')}>About</span>
        <span className="text-blue-200 text-sm cursor-pointer hover:text-white" onClick={() => navigate('/enterprise')}>Enterprise</span>
        <span className="text-blue-200 text-sm cursor-pointer hover:text-white" onClick={() => navigate('/consumer')}>Consumer</span>
        <button onClick={() => navigate('/login')} className="bg-white text-k7-700 px-5 py-2 rounded-lg font-medium hover:bg-blue-50">Sign In</button>
      </div>
    </nav>
  )


  const Footer = () => (
    <footer className="px-8 py-10 border-t border-white/10 mt-10">
      <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
        <div>
          <div className="text-white font-semibold mb-3">Platform</div>
          <div className="space-y-2">
            <div className="text-blue-300 text-sm cursor-pointer hover:text-white" onClick={() => navigate('/enterprise')}>Enterprise Portfolio</div>
            <div className="text-blue-300 text-sm cursor-pointer hover:text-white" onClick={() => navigate('/consumer')}>Consumer Portfolio</div>
            <div className="text-blue-300 text-sm cursor-pointer hover:text-white" onClick={() => navigate('/login')}>Sign In to XDR</div>
          </div>
        </div>
        <div>
          <div className="text-white font-semibold mb-3">Resources</div>
          <div className="space-y-2">
            <div className="text-blue-300 text-sm cursor-pointer hover:text-white" onClick={() => navigate('/whitepapers')}>Whitepapers</div>
            <div className="text-blue-300 text-sm cursor-pointer hover:text-white" onClick={() => navigate('/case-studies')}>Case Studies</div>
          </div>
        </div>
        <div>
          <div className="text-white font-semibold mb-3">Company</div>
          <div className="space-y-2">
            <div className="text-blue-300 text-sm cursor-pointer hover:text-white" onClick={() => navigate('/about')}>About K7 Computing</div>
            <div className="text-blue-300 text-sm cursor-pointer hover:text-white" onClick={() => navigate('/privacy')}>Privacy Policy</div>
            <div className="text-blue-300 text-sm cursor-pointer hover:text-white" onClick={() => navigate('/terms')}>Terms of Use</div>
          </div>
        </div>
        <div>
          <div className="text-white font-semibold mb-3">Support</div>
          <div className="text-blue-300 text-sm">enterprise@k7computing.com</div>
          <div className="text-blue-300 text-sm">1800 419 0077</div>
          <div className="text-blue-300 text-sm mt-2">Chennai, Tamil Nadu, India</div>
        </div>
      </div>
      <div className="border-t border-white/10 pt-6 text-center">
        <div className="text-blue-300 text-sm">© 2026 K7 Computing Private Limited. All rights reserved.</div>
      </div>
    </footer>
  )

  const sections = [
    { title: "Data We Collect", content: "K7 XDR collects security telemetry including network logs, endpoint events, user activity logs, and incident data from your environment. We also collect account information such as name, email, and role." },
    { title: "How We Use Your Data", content: "Data is used exclusively to provide threat detection, incident response, and compliance reporting services. We do not sell, share, or use your data for advertising purposes." },
    { title: "Data Residency", content: "All data is stored and processed in India on Google Cloud infrastructure in the Mumbai (asia-south1) region. No data is transferred outside India without explicit consent." },
    { title: "DPDPA Compliance", content: "K7 XDR is aligned with the Digital Personal Data Protection Act, 2023. We act as a Data Processor on your behalf. You retain all rights as Data Fiduciary." },
    { title: "Data Retention", content: "Security events are retained for 90 days by default. Incident records are retained for 1 year. Compliance audit logs are retained for 3 years as required by CERT-In mandates." },
    { title: "Security", content: "All data is encrypted in transit (TLS 1.3) and at rest (AES-256). Access is role-based and all administrative actions are logged in the immutable audit trail." },
    { title: "Your Rights", content: "You have the right to access, correct, export, and delete your organisation's data. Submit requests to privacy@k7computing.com. We will respond within 72 hours." },
    { title: "Contact", content: "For privacy-related queries, contact our Data Protection Officer at dpo@k7computing.com or write to K7 Computing Private Limited, Chennai, Tamil Nadu, India." },
  ]
  return (
    <div className="min-h-screen bg-gradient-to-b from-k7-700 via-k7-800 to-k7-900">
      <Nav />
      <div className="max-w-3xl mx-auto px-8 py-16">
        <h1 className="text-4xl font-bold text-white mb-2">Privacy Policy</h1>
        <p className="text-blue-200 mb-10">Last updated: March 2026</p>
        <div className="space-y-4">
          {sections.map((s, i) => (
            <div key={i} className="bg-white/10 rounded-xl p-6 border border-white/20">
              <h2 className="text-white font-semibold mb-2">{s.title}</h2>
              <p className="text-blue-100 leading-relaxed text-sm">{s.content}</p>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  )
}
