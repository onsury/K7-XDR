import React from 'react'
import { useNavigate } from 'react-router-dom'
export default function ConsumerPortfolio() {
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
    { name: "K7 Total Security", platforms: ["Windows"], desc: "Complete protection — antivirus, firewall, web protection, parental controls, and identity protection for your PC.", url: "https://www.k7computing.com/in/home-users/total-security" },
    { name: "K7 Ultimate Security", platforms: ["Windows", "Mac", "Android"], desc: "Multi-device protection for the entire family under a single subscription.", url: "https://www.k7computing.com/in/home-users/ultimate-security" },
    { name: "K7 Ultimate Security Infiniti", platforms: ["Windows", "Mac", "Android"], desc: "Unlimited device coverage with K7's most comprehensive consumer protection suite.", url: "https://www.k7computing.com/in/home-users" },
    { name: "K7 Antivirus Premium", platforms: ["Windows"], desc: "Award-winning antivirus with real-time protection, ransomware defence, and cloud-based threat intelligence.", url: "https://www.k7computing.com/in/home-users/antivirus-premium" },
    { name: "K7 Antivirus for Mac", platforms: ["Mac"], desc: "Lightweight, powerful protection built specifically for macOS with real-time scanning and phishing protection.", url: "https://www.k7computing.com/in/home-users/antivirus-for-mac" },
    { name: "K7 Mobile Security — Android", platforms: ["Android"], desc: "Comprehensive Android protection with call blocking, anti-theft, web protection and privacy advisor.", url: "https://www.k7computing.com/in/home-users/mobile-security-android" },
    { name: "K7 Mobile Security — iOS", platforms: ["iOS"], desc: "Privacy and web protection for iPhone and iPad users.", url: "https://www.k7computing.com/in/home-users/mobile-security-ios" },
  ]
  return (
    <div className="min-h-screen bg-gradient-to-b from-k7-700 via-k7-800 to-k7-900">
      <Nav />
      <div className="max-w-6xl mx-auto px-8 py-16">
        <h1 className="text-4xl font-bold text-white mb-2">Consumer Product Portfolio</h1>
        <p className="text-blue-200 mb-10">Award-winning security products trusted by millions — available at k7computing.com</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((p, i) => (
            <div key={i} className="bg-white/10 border border-white/20 rounded-2xl p-6 hover:bg-white/15 flex flex-col">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mb-4"><span className="text-k7-700 font-black">K7</span></div>
              <h3 className="text-white font-bold text-lg mb-2">{p.name}</h3>
              <p className="text-blue-100 text-sm leading-relaxed flex-1">{p.desc}</p>
              <div className="flex gap-2 flex-wrap mt-3 mb-4">
                {p.platforms.map((pl, j) => <span key={j} className="px-2 py-1 bg-white/10 text-blue-200 text-xs rounded">{pl}</span>)}
              </div>
              <a href={p.url} target="_blank" rel="noopener noreferrer" className="block w-full text-center border border-white/30 text-white py-2 rounded-lg text-sm hover:bg-white/10">View on k7computing.com ↗</a>
            </div>
          ))}
        </div>
        <div className="mt-10 text-center">
          <p className="text-blue-200 mb-4">Need enterprise-grade protection?</p>
          <button onClick={() => navigate('/enterprise')} className="bg-white text-k7-700 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50">View Enterprise Portfolio</button>
        </div>
      </div>
      <Footer />
    </div>
  )
}
