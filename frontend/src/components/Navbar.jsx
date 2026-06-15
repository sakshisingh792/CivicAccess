import React from 'react'

function Navbar({ userRole, userName, onLogOut }) {
  return (
    <nav className="bg-slate-950 text-white h-16 px-6 flex items-center justify-between border-b border-slate-800 shrink-0 w-full">
      
      {/* Left Side: Platform Identity Branding */}
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-sm">
          🛡️
        </div>
        <div className="flex flex-col">
          <span className="font-extrabold tracking-wider text-xs uppercase text-slate-100">CivicAccess</span>
          <span className="text-[9px] font-medium tracking-tight text-slate-500">Auditing Network Node</span>
        </div>
      </div>

      {/* Right Side: Identity Monitor & Session Kill Switch */}
      <div className="flex items-center gap-4">
        
        {/* User Status Badges */}
        <div className="text-right hidden sm:block">
          <p className="text-xs font-bold text-slate-200">{userName}</p>
          <p className="text-[9px] font-extrabold uppercase tracking-widest text-blue-400 mt-0.5">
            {userRole === 'AUTHORITY' ? 'Municipal Staff' : 'Verified Citizen'}
          </p>
        </div>

        {/* Vertical Divider */}
        <div className="h-6 w-px bg-slate-800 hidden sm:block" />
        
        {/* Session Termination Trigger */}
        <button 
          onClick={onLogOut}
          className="bg-slate-900 hover:bg-red-950/40 text-slate-400 hover:text-red-400 border border-slate-800 hover:border-red-900/50 text-[10px] font-bold py-1.5 px-3 rounded-lg transition-all duration-200 cursor-pointer uppercase tracking-wider"
        >
          Logout
        </button>
        
      </div>
    </nav>
  )
}

export default Navbar