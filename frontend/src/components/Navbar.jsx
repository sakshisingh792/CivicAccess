// 💡 Receiving userRole and setter function from parent
function Navbar({ userRole, onRoleChange }) {
  return (
    <header className="bg-slate-900 text-white px-6 py-4 shadow-md flex justify-between items-center shrink-0">
      <div className="flex items-center gap-3">
        <h1 className="text-xl font-bold tracking-wide">CivicAccess Portal</h1>
        <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider ${
          userRole === 'authority' ? 'bg-amber-500 text-slate-950' : 'bg-emerald-500 text-white'
        }`}>
          {userRole === 'authority' ? 'Administrative Mode' : 'Public Access'}
        </span>
      </div>

      {/* 💡 Professional Portal System Switcher */}
      <div className="flex items-center gap-2">
        <label className="text-xs font-medium text-slate-400">Current View:</label>
        <select
          value={userRole}
          onChange={(e) => onRoleChange(e.target.value)}
          className="bg-slate-800 text-white border border-slate-700 rounded-md px-3 py-1 text-xs font-semibold focus:outline-hidden focus:border-blue-500 cursor-pointer"
        >
          <option value="citizen">Citizen Dashboard</option>
          <option value="authority">Municipality Dashboard</option>
        </select>
      </div>
    </header>
  )
}

export default Navbar