import Link from 'next/link'
import { LayoutDashboard, Sparkles, FileText, Check, ArrowRight } from 'lucide-react'
import './landing.css'

export default function LandingPage() {
  return (
    <div className="landing-page">
      <nav className="landing-nav flex items-center w-full px-6" style={{ position: 'relative' }}>
        <div className="w-1/3"></div>
        
        {/* Absolutely centered logo */}
        <div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', display: 'flex', justifyContent: 'center', textAlign: 'center' }}>
          <span className="gradient-text tracking-tight" style={{ fontSize: '3.5rem', fontWeight: 900, lineHeight: 1 }}>JobCanvas</span>
        </div>

        <div className="w-1/3 flex justify-end gap-4" style={{ marginLeft: 'auto' }}>
          <Link href="/login" className="btn-ghost">Log in</Link>
          <Link href="/signup" className="btn-primary">Sign up</Link>
        </div>
      </nav>



      <main>
        <section className="landing-hero container">
          <div className="animate-slide-up w-full flex flex-col items-center justify-center">
            <div className="badge badge-indigo mx-auto mb-6 flex-center w-max">
              <Sparkles size={14} className="mr-2" /> AI-Powered Application Tracking
            </div>
            <h1>
              Track Applications.<br />
              Get <span className="gradient-text">AI Feedback.</span><br />
              Land Your Dream Job.
            </h1>
            <p className="landing-hero-subtitle mt-6">
              The ultimate Kanban board for developers. Automatically analyze your resume against job descriptions to discover missing skills before you apply.
            </p>
            <div className="landing-hero-cta mt-10">
              <Link href="/signup" className="btn-primary btn-lg shadow-glow">
                Get Started Free <ArrowRight size={18} />
              </Link>
              <Link href="#how-it-works" className="btn-secondary btn-lg">
                See How It Works
              </Link>
            </div>
          </div>
        </section>

        <section className="landing-features" id="features" style={{ marginTop: '80px' }}>
          <div className="container">
            <h2 className="landing-section-title animate-slide-up">Everything you need to get hired</h2>
            
            <div className="landing-features-grid mt-12">
              <div className="landing-feature-card animate-slide-up" style={{ animationDelay: '0.1s' }}>
                <div className="landing-feature-icon">
                  <LayoutDashboard size={28} className="text-white" />
                </div>
                <h3>Visual Kanban Board</h3>
                <p>Drag and drop applications across custom stages. Keep your job search organized and never miss a follow-up.</p>
              </div>

              <div className="landing-feature-card animate-slide-up" style={{ animationDelay: '0.2s' }}>
                <div className="landing-feature-icon" style={{ background: 'linear-gradient(135deg, var(--accent-violet), #d946ef)' }}>
                  <Sparkles size={28} className="text-white" />
                </div>
                <h3>AI Gap Analysis</h3>
                <p>Our AI compares your resume to the job description, scores your match, and tells you exactly what skills are missing.</p>
              </div>

              <div className="landing-feature-card animate-slide-up" style={{ animationDelay: '0.3s' }}>
                <div className="landing-feature-icon" style={{ background: 'linear-gradient(135deg, #0ea5e9, var(--accent-cyan))' }}>
                  <FileText size={28} className="text-white" />
                </div>
                <h3>Client-Side PDF Parsing</h3>
                <p>Your resume is parsed securely in your browser. Fast, private, and works flawlessly with developer resumes.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="landing-how-it-works py-20" id="how-it-works">
          <div className="container">
            <h2 className="landing-section-title">How Dashboard Works</h2>
            
            <div className="landing-features-grid" style={{ marginTop: '64px', marginBottom: '80px' }}>
              {[
                { step: 1, title: 'Upload Your Resume', desc: 'Drag and drop your PDF resume. We extract the text instantly.', icon: <FileText size={24} /> },
                { step: 2, title: 'Add Job Applications', desc: 'Paste the job description and company details into your board.', icon: <LayoutDashboard size={24} /> },
                { step: 3, title: 'Get AI Insights', desc: 'Click analyze to see your match score and actionable recommendations.', icon: <Sparkles size={24} /> },
              ].map((s, i) => (
                <div key={i} className="landing-feature-card relative overflow-hidden animate-slide-up" style={{ animationDelay: `${i * 0.1}s` }}>
                  <div className="landing-feature-icon" style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-subtle)', color: 'var(--accent-indigo)' }}>
                    {s.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-3">{s.step}. {s.title}</h3>
                  <p className="text-secondary">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="landing-footer border-t border-subtle relative overflow-hidden flex flex-col items-center justify-center w-full" style={{ padding: '40px 32px', marginTop: '40px', maxWidth: '1280px', margin: '80px auto 0 auto', textAlign: 'center' }}>
        <div className="absolute inset-0 bg-secondary/30 backdrop-blur-xl -z-10" />
        <div className="text-center w-full flex-center flex-col md:flex-row gap-2 md:gap-4">
          <p className="text-secondary font-medium tracking-wide text-lg">
            © {new Date().getFullYear()} <span className="gradient-text font-black">JobCanvas</span>. All rights reserved.
          </p>
          <span className="hidden md:inline text-secondary text-lg">•</span>
          <p className="text-muted text-lg">Empowering developers to land their dream roles.</p>
        </div>
      </footer>
    </div>
  )
}
