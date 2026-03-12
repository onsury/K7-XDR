import React from 'react'
import { useNavigate } from 'react-router-dom'
export default function About() {
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
      <div className="max-w-4xl mx-auto px-8 py-16">
        <h1 className="text-4xl font-bold text-white mb-6">About K7 Computing</h1>
        <div className="bg-white/10 rounded-2xl p-8 border border-white/20 mb-8">
          <p className="text-blue-100 text-lg leading-relaxed mb-4">K7 Computing Private Limited is one of India's pioneering cybersecurity companies, founded in 1991 in Chennai. For over 25 years, K7 has protected millions of users and enterprises across India and globally with award-winning security products.</p>
          <p className="text-blue-100 text-lg leading-relaxed mb-4">K7's proprietary threat research lab analyses hundreds of thousands of malware samples daily, powering both consumer and enterprise security products with unmatched detection accuracy — validated by independent test labs including AV-TEST, AV-Comparatives, and Virus Bulletin.</p>
          <p className="text-blue-100 text-lg leading-relaxed">K7 XDR is K7's enterprise Extended Detection & Response platform — built in India for Indian enterprises — with native support for CERT-In, DPDPA, RBI CSF, and SEBI CSCRF compliance frameworks.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-center">
            <div className="text-4xl font-bold text-blue-300 mb-2">1991</div>
            <div className="text-white font-medium">Founded in Chennai</div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-center">
            <div className="text-4xl font-bold text-green-400 mb-2">25M+</div>
            <div className="text-white font-medium">Users Protected</div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-center">
            <div className="text-4xl font-bold text-yellow-400 mb-2">150+</div>
            <div className="text-white font-medium">Countries Served</div>
          </div>
        </div>
        <div className="bg-white/10 rounded-2xl p-8 border border-white/20">
          <h2 className="text-2xl font-bold text-white mb-6">Leadership</h2>
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">JK</div>
            <div>
              <div className="text-white font-semibold text-lg">J. Kesavardhanan</div>
              <div className="text-blue-200 mb-3">Founder & CEO, K7 Computing Private Limited</div>
              <p className="text-blue-100 text-sm leading-relaxed">Visionary cybersecurity entrepreneur who built K7 Computing from the ground up into India's most trusted security brand over three decades. A thought leader in Indian cybersecurity policy, enterprise security architecture, and indigenous technology development.</p>
            </div>
          </div>
        </div>
        <div className="mt-8 text-center">
          <p className="text-blue-200 mb-4">Visit the official K7 Computing website</p>
          <a href="https://www.k7computing.com" target="_blank" rel="noopener noreferrer" className="inline-block border border-white/30 text-white px-8 py-3 rounded-lg hover:bg-white/10">k7computing.com ↗</a>
        </div>
      </div>
      <Footer />
    </div>
  )
}
