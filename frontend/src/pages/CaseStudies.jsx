import React from 'react'
import { useNavigate } from 'react-router-dom'
export default function CaseStudies() {
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-k7-700 via-k7-800 to-k7-900">
      <Nav />
      <div className="max-w-5xl mx-auto px-8 py-16 text-center">
        <h1 className="text-4xl font-bold text-white mb-4">Case Studies</h1>
        <p className="text-blue-200 mb-16">How Indian enterprises achieved security and compliance with K7 XDR</p>
        <div className="bg-white/10 border border-white/20 rounded-2xl p-16">
          <div className="text-6xl mb-6">📋</div>
          <h2 className="text-white text-2xl font-semibold mb-3">Coming Soon</h2>
          <p className="text-blue-200">Customer success stories and deployment case studies will be published here.</p>
        </div>
      </div>
      <Footer />
    </div>
  )
}
