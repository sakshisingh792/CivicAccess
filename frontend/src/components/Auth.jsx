import { useState } from 'react'
import axios from 'axios'

function Auth({ onAuthSuccess }) {
  const [isLogin, setIsLogin] = useState(true)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('CITIZEN')
  const [errorMessage, setErrorMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleAuthSubmission = (e) => {
    e.preventDefault()
    setErrorMessage('')
    setIsLoading(true)

    const targetUrl = isLogin 
      ? 'http://127.0.0.1:8000/api/auth/login/' 
      : 'http://127.0.0.1:8000/api/auth/register/'

    const authenticationPayload = isLogin 
      ? { username, password } 
      : { username, password, email, role }

    axios.post(targetUrl, authenticationPayload)
      .then(response => {
        setIsLoading(false)
        if (isLogin) {
          const accessToken = response.data.access
          localStorage.setItem('civic_token', accessToken)
          
          const base64Url = accessToken.split('.')[1]
          const decodedPayload = JSON.parse(window.atob(base64Url))
          
          localStorage.setItem('civic_role', decodedPayload.role)
          localStorage.setItem('civic_user', decodedPayload.username)

          onAuthSuccess()
        } else {
          alert("Registration successful! Proceeding to Login.")
          setIsLogin(true)
        }
      })
      .catch(error => {
        setIsLoading(false)
        console.error("Auth transaction exception:", error)
        
        // 💡 SMART ERROR PARSER: Extracts field specific validation dictionaries from Django REST Framework
        if (error.response?.data) {
          const serverData = error.response.data
          if (typeof serverData === 'object') {
            // Agar dictionary hai (jaise {"email": ["..."]}), toh use readable string me badlo
            const errorPairs = Object.entries(serverData).map(([key, val]) => `${key}: ${Array.isArray(val) ? val[0] : val}`)
            setErrorMessage(errorPairs.join(' | '))
            return
          }
          setErrorMessage(serverData.error || serverData.detail || "Verification pipeline fault.")
          return
        }
        setErrorMessage("Network error: Cannot establish communication link with backend server.")
      })
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-100 flex items-center justify-center p-4">
      {/* 💡 Explicit inline width limits prevent horizontal stretching loops across layouts */}
      <div 
        className="bg-white w-full rounded-2xl shadow-lg border border-slate-200 p-8 flex flex-col relative"
        style={{ maxWidth: '400px' }}
      >
        
        {/* Top Accent Stripe */}
        <div className="absolute top-0 inset-x-0 h-1 bg-blue-600 rounded-t-2xl" />

        {/* Branding Header Block */}
        <div className="mb-6 text-center">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-blue-50 text-blue-600 mb-3 text-lg font-bold">
            🛡️
          </div>
          <h2 className="text-xl font-bold text-slate-800">
            {isLogin ? 'Welcome to CivicAccess' : 'Create Civic Identity'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">Infrastructure Verification Hub</p>
        </div>

        {/* Form Elements Mapping */}
        <form onSubmit={handleAuthSubmission} className="space-y-4">
          
          {/* Simple Tab Switcher Matrix */}
          {!isLogin && (
            <div className="p-1 bg-slate-100 rounded-lg grid grid-cols-2 gap-1 mb-2">
              <button 
                type="button"
                onClick={() => setRole('CITIZEN')}
                className={`py-1.5 text-[11px] font-bold uppercase rounded-md cursor-pointer transition-all ${role === 'CITIZEN' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
              >
                Citizen Role
              </button>
              <button 
                type="button"
                onClick={() => setRole('AUTHORITY')}
                className={`py-1.5 text-[11px] font-bold uppercase rounded-md cursor-pointer transition-all ${role === 'AUTHORITY' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
              >
                Municipal Worker
              </button>
            </div>
          )}

          {/* Field: Username */}
          <div>
            <label className=" px-2 block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">User Name</label>
            <input 
              type="text" 
              required 
              value={username} 
              onChange={e => setUsername(e.target.value)} 
              className="w-full border border-slate-300 px-3 py-2 text-xs focus:outline-none focus:border-blue-500 bg-slate-50 text-slate-800 font-medium" 
              placeholder="Enter username" 
            />
          </div>

          {/* Field: Email Address (Conditional) */}
          {!isLogin && (
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Email Address:</label>
              <input 
                type="email" 
                required 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                className="w-full border border-slate-300  px-3 py-2 text-xs focus:outline-none focus:border-blue-500 bg-slate-50 text-slate-800 font-medium" 
                placeholder="name@domain.com" 
              />
            </div>
          )}

          {/* Field: Password */}
          <div>
            <label className=" px-2 block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Secure Passkey </label>
            <input 
              type="password" 
              required 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              className="w-full border border-slate-300 px-3 py-2 text-xs focus:outline-none focus:border-blue-500 bg-slate-50 text-slate-800 font-medium" 
              placeholder="••••••••••••" 
            />
          </div>

          {/* Errors Ingestion Box */}
          {errorMessage && (
            <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg text-[10px] font-semibold text-red-600">
              🚨 {errorMessage}
            </div>
          )}

          {/* Submit Action Trigger */}
          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 rounded-lg transition-all cursor-pointer text-center text-xs uppercase tracking-wider shadow-sm disabled:opacity-50"
          >
            {isLoading ? "Validating Ledger..." : isLogin ? 'Access Core Dashboard' : 'Initialize Account'}
          </button>
        </form>

        {/* Bottom Interface Structural Link Toggle */}
        <div className="mt-5 pt-3 border-t border-slate-100 text-center">
          <button 
            type="button" 
            onClick={() => { setIsLogin(!isLogin); setErrorMessage(''); }}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors cursor-pointer"
          >
            {isLogin ? "New user? Request account registration" : "Have an account? Launch login gateway"}
          </button>
        </div>

      </div>
    </div>
  )
}

export default Auth