import React from 'react'
import { useNavigate } from 'react-router-dom'
export default function EnterprisePortfolio() {
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

  const products = [
    {
      name: "K7 XDR",
      tag: "Extended Detection & Response",
      desc: "India's only XDR platform with native CERT-In reporting, DPDPA compliance automation, and RBI/SEBI cybersecurity framework support. Full IT/OT/IoT visibility with 25+ years of K7 threat intelligence.",
      link: "/login",
      linkLabel: "Launch Platform",
      badge: "Now Live"
    },
    {
      name: "K7 Endpoint Security — Advanced",
      tag: "Enterprise Endpoint Protection",
      desc: "Multi-layered endpoint security with AI-enhanced ransomware protection, HIDS/HIPS firewall, application control, web filtering, device control, and centralised management via cloud or on-premises console.",
      link: "https://www.k7computing.com/in/business/endpoint-security",
      linkLabel: "Learn More ↗",
      badge: "Available"
    },
    {
      name: "K7 Endpoint Security — Standard",
      tag: "SME Endpoint Protection",
      desc: "Core endpoint protection for small and medium enterprises — antivirus, anti-ransomware, firewall, and web protection with lightweight centralised management.",
      link: "https://www.k7computing.com/in/business/endpoint-security",
      linkLabel: "Learn More ↗",
      badge: "Available"
    },
    {
      name: "K7 Cloud Endpoint Security",
      tag: "Cloud-Managed Endpoint Security",
      desc: "100% cloud-managed endpoint security enabling anytime, anywhere protection management for distributed enterprises. Rapid rollout with zero on-premises infrastructure required.",
      link: "https://www.k7computing.com/in/business/endpoint-security/k7-cloud-EPS",
      linkLabel: "Learn More ↗",
      badge: "Available"
    },
    {
      name: "K7 Unified Threat Management",
      tag: "Network Security",
      desc: "Secure, scalable hardware gateway security for enterprise network perimeter defence — firewall, VPN, web filtering, and intrusion prevention in a single unified appliance.",
      link: "https://www.k7computing.com/in/business/network-security",
      linkLabel: "Learn More ↗",
      badge: "Available"
    },
  ]
  return (
    <div className="min-h-screen bg-gradient-to-b from-k7-700 via-k7-800 to-k7-900">
      <Nav />
      <div className="max-w-6xl mx-auto px-8 py-16">
        <h1 className="text-4xl font-bold text-white mb-2">Enterprise Product Portfolio</h1>
        <p className="text-blue-200 mb-10">Comprehensive cybersecurity solutions for Indian enterprises — from endpoint to network to extended detection & response</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((p, i) => (
            <div key={i} className="bg-white/10 border border-white/20 rounded-2xl p-6 hover:bg-white/15 flex flex-col">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center"><span className="text-k7-700 font-black">K7</span></div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${p.badge === 'Now Live' ? 'bg-blue-500 text-white' : 'bg-green-500 text-white'}`}>{p.badge}</span>
              </div>
              <h3 className="text-white font-bold text-lg mb-1">{p.name}</h3>
              <div className="text-blue-300 text-xs mb-3">{p.tag}</div>
              <p className="text-blue-100 text-sm leading-relaxed flex-1">{p.desc}</p>
              <div className="mt-4">
                {p.link.startsWith('/') ?
                  <button onClick={() => navigate(p.link)} className="w-full bg-white text-k7-700 py-2 rounded-lg font-medium text-sm hover:bg-blue-50">{p.linkLabel}</button> :
                  <a href={p.link} target="_blank" rel="noopener noreferrer" className="block w-full text-center border border-white/30 text-white py-2 rounded-lg text-sm hover:bg-white/10">{p.linkLabel}</a>
                }
              </div>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  )
}
