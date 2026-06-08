import './auth.css'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="auth-layout">

      <div className="auth-container animate-scale-in">
        <div className="auth-logo">
          <h1 className="gradient-text">JobCanvas</h1>
          <p>AI-Powered Job Application Tracker</p>
        </div>
        {children}
      </div>
    </div>
  )
}
