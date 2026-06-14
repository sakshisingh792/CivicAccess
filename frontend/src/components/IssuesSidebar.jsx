import { useState } from 'react'

function IssuesSidebar({ 
  issues, loading, onSelectIssue, onToggleReportForm, selectedIssue, 
  onUpdateStatus, onCommunityVote, searchTerm, setSearchTerm, 
  categoryFilter, setCategoryFilter, statusFilter, setStatusFilter, userRole
}) {
  
  const [selectedFiles, setSelectedFiles] = useState({})
  const [openComparisonId, setOpenComparisonId] = useState(null)
  
  // 💡 New Core States: Tracking active modal image stream and mathematical zoom matrices
  const [modalImageUrl, setModalImageUrl] = useState(null)
  const [zoomScale, setZoomScale] = useState(1)

  const handleFileMapChange = (issueId, file) => {
    setSelectedFiles(prev => ({
      ...prev,
      [issueId]: file
    }))
  }

  const getCategoryLabel = (cat) => {
    const mapping = { 
      'ramp': 'Wheelchair Ramp', 
      'tactile': 'Tactile Paving', 
      'lift': 'Elevator / Lift', 
      'other': 'Other Barrier' 
    }
    return mapping[cat] || 'General'
  }

  // 💡 Helper actions to constraint scale boundaries securely between 1x and 4x
  const handleZoomIn = (e) => {
    e.stopPropagation()
    setZoomScale(prev => Math.min(prev + 0.3, 4))
  }

  const handleZoomOut = (e) => {
    e.stopPropagation()
    setZoomScale(prev => Math.max(prev - 0.3, 1))
  }

  return (
    <div className="w-1/3 bg-white border-r border-slate-200 flex flex-col overflow-hidden p-4 relative">
      {/* Header Panel */}
      <div className="flex justify-between items-center mb-4 shrink-0">
        <h2 className="text-lg font-bold text-slate-800">Accessibility Inventory</h2>
        {userRole !== 'authority' && (
          <button onClick={onToggleReportForm} className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-xs transition-all cursor-pointer">
            + Report Issue
          </button>
        )}
      </div>

      {/* Advanced Filter Layer Block */}
      <div className="space-y-2 mb-4 shrink-0">
        <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search logs by keywords..." className="w-full border border-slate-200 rounded-lg p-2 text-xs focus:outline-hidden bg-slate-50" />
        <div className="grid grid-cols-2 gap-2">
          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="w-full border border-slate-200 rounded-lg p-2 text-xs bg-slate-50 text-slate-600 cursor-pointer">
            <option value="all">All Categories</option>
            <option value="ramp">Wheelchairs Ramps</option>
            <option value="tactile">Tactile Paving</option>
            <option value="lift">Elevators / Lifts</option>
            <option value="other">Other Infrastructure</option>
          </select>

          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full border border-slate-200 rounded-lg p-2 text-xs bg-slate-50 text-slate-600 cursor-pointer">
            <option value="all">All Statuses</option>
            <option value="REPORTED">Unresolved / Pending</option>
            <option value="PROVISIONALLY_RESOLVED">Pending Verification</option>
            <option value="RESOLVED">Permanently Resolved</option>
          </select>
        </div>
      </div>

      {/* Container List Render Block */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {loading ? (
          <div className="text-slate-500 text-xs animate-pulse">Synchronizing data stream...</div>
        ) : issues.length === 0 ? (
          <div className="text-slate-400 text-xs text-center py-8">No matching records found in this perimeter.</div>
        ) : (
          issues.map(issue => {
            const isSelected = selectedIssue && selectedIssue.id === issue.id;
            const isPendingVerification = issue.status === 'PROVISIONALLY_RESOLVED';
            const isFullyResolved = issue.status === 'RESOLVED';
            const isPendingReport = issue.status === 'REPORTED';
            
            const hasAlreadyVotedFromThisBrowser = localStorage.getItem(`voted_token_${issue.id}`) === 'true';

            return (
              <div key={issue.id} onClick={() => onSelectIssue(issue)} className={`p-3 border rounded-lg transition-all cursor-pointer ${isSelected ? 'bg-blue-50/80 border-blue-500 ring-2 ring-blue-100' : 'bg-slate-50 border-slate-200 hover:border-slate-300'}`}>
                <div className="flex justify-between items-center gap-2 mb-2">
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-200 text-slate-700">{getCategoryLabel(issue.category)}</span>
                  
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide border ${
                    isFullyResolved ? 'bg-green-100 text-green-800 border-green-300' :
                    isPendingVerification ? 'bg-amber-100 text-amber-800 border-amber-300 animate-pulse' :
                    'bg-red-50 text-red-600 border-red-100'
                  }`}>
                    {isFullyResolved ? '✓ Resolved' : isPendingVerification ? '⚠ Audit Vote Loop' : '● Pending'}
                  </span>
                </div>

                <p className="text-xs text-slate-700 font-medium mb-2 leading-relaxed">{issue.description}</p>

                {issue.ai_severity_score && (
                  <div className="mb-2 p-1.5 bg-slate-900 rounded text-white flex justify-between text-[10px]">
                    <span className="truncate text-slate-300">AI Tag: {issue.ai_category_tag}</span>
                    <span className="font-bold shrink-0 text-amber-400">Sev: {issue.ai_severity_score}/5</span>
                  </div>
                )}

                {/* CITIZEN TRANSPARENCY VISUAL AUDIT ACCORDION BOX */}
                {(isPendingVerification || isFullyResolved) && (
                  <div className="mt-1 mb-2" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => setOpenComparisonId(openComparisonId === issue.id ? null : issue.id)}
                      className="w-full text-left bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded px-2 py-1 text-[10px] font-bold text-slate-700 flex justify-between items-center transition-all cursor-pointer"
                    >
                      <span>👁 {openComparisonId === issue.id ? 'Hide Remediation Comparison' : 'View Before / After Images'}</span>
                      <span className="text-slate-400 text-[8px]">{openComparisonId === issue.id ? '▲' : '▼'}</span>
                    </button>

                    {openComparisonId === issue.id && (
                      <div className="mt-2 p-2 bg-white border border-slate-200 rounded-lg grid grid-cols-2 gap-2 shadow-inner">
                        {/* 💡 Upgraded onClick hooks to map state and open modal layout */}
                        <div className="group relative" onClick={() => { setModalImageUrl(issue.image_before); setZoomScale(1); }}>
                          <span className="block text-[8px] font-bold uppercase text-slate-400 mb-1">Before Report:</span>
                          <img src={issue.image_before} alt="Before" className="w-full h-20 object-cover rounded border border-slate-100 transition-all group-hover:opacity-85" />
                          <div className="absolute bottom-1 right-1 bg-slate-900/70 px-1 rounded text-[7px] text-white opacity-0 group-hover:opacity-100 transition-all">🔍 Click to Zoom</div>
                        </div>
                        
                        <div className="group relative" onClick={() => { if(issue.image_after) { setModalImageUrl(issue.image_after); setZoomScale(1); } }}>
                          <span className="block text-[8px] font-bold uppercase text-emerald-500 mb-1">After Fix Proof:</span>
                          {issue.image_after ? (
                            <>
                              <img src={issue.image_after} alt="After Proof" className="w-full h-20 object-cover rounded border border-emerald-100 transition-all group-hover:opacity-85" />
                              <div className="absolute bottom-1 right-1 bg-slate-900/70 px-1 rounded text-[7px] text-white opacity-0 group-hover:opacity-100 transition-all">🔍 Click to Zoom</div>
                            </>
                          ) : (
                            <div className="w-full h-20 bg-slate-100 rounded text-[9px] text-slate-400 flex items-center justify-center border border-dashed">No asset data</div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* AUTHORITY DIRECT IMAGE UPLOAD OPTION FOR PENDING ISSUES */}
                {userRole === 'authority' && isPendingReport && (
                  <div className="mt-3 p-2.5 bg-blue-50/50 rounded-lg border border-blue-200 text-[10px] space-y-2 animate-fade-in" onClick={e => e.stopPropagation()}>
                    <span className="font-bold text-slate-700 block uppercase tracking-wider text-[8px]">
                      📤 Upload Verification Image (Proof of Fix)
                    </span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={e => handleFileMapChange(issue.id, e.target.files[0])} 
                      className="w-full text-[10px] text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-[10px] file:font-semibold file:bg-slate-200 file:text-slate-800 cursor-pointer" 
                    />
                    <button 
                      onClick={() => {
                        const targetFile = selectedFiles[issue.id];
                        if (!targetFile) {
                          alert("Validation Error: Please select an image proof file before triggering remediation updates.");
                          return;
                        }
                        onUpdateStatus(issue.id, 'RESOLVED', targetFile);
                      }} 
                      className="w-full bg-slate-900 hover:bg-green-600 text-white font-bold py-1.5 rounded transition-all cursor-pointer text-center text-[10px] shadow-xs uppercase tracking-wide"
                    >
                      Submit Verification Proof
                    </button>
                  </div>
                )}

                {/* SECURED CITIZEN VOTE PLATFORM MATRIX */}
                {userRole === 'citizen' && isPendingVerification && (
                  <div className="mt-2 p-2 bg-amber-50 rounded border border-amber-200 text-[10px] space-y-2" onClick={e => e.stopPropagation()}>
                    <div className="flex justify-between text-[9px] font-bold text-amber-800">
                      <span>📢 Community Auditing Pool:</span>
                      <span className="bg-amber-200 px-1.5 py-0.5 rounded text-amber-950 font-mono">Approved: {issue.community_votes} / 3</span>
                    </div>

                    {hasAlreadyVotedFromThisBrowser ? (
                      <div className="text-center py-1 text-slate-500 font-medium text-[9px] bg-slate-200/60 rounded border border-slate-300 select-none">
                        🔒 Security Lock: Your ballot entry has been recorded for this log.
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <button 
                          onClick={() => { 
                            localStorage.setItem(`voted_token_${issue.id}`, 'true'); 
                            onCommunityVote(issue.id, 'confirm'); 
                          }} 
                          className="bg-emerald-600 text-white font-bold px-2 py-1 rounded cursor-pointer hover:bg-emerald-700 transition-all flex-1 text-center text-[9px]"
                        >
                          👍 Confirm Fix
                        </button>
                        <button 
                          onClick={() => { 
                            localStorage.setItem(`voted_token_${issue.id}`, 'true'); 
                            onCommunityVote(issue.id, 'dispute'); 
                          }} 
                          className="bg-rose-600 text-white font-bold px-2 py-1 rounded cursor-pointer hover:bg-rose-700 transition-all flex-1 text-center text-[9px]"
                        >
                          👎 Report Fraud Proof
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Base Geographical Coordinate Footer Tray */}
                <div className="mt-2 pt-2 border-t border-slate-200 text-[9px] text-slate-400 font-mono">
                  COORD: {issue.latitude}, {issue.longitude}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 💡 INTERACTIVE LIGHTBOX ZOOM MODAL COMPONENT GRID */}
      {modalImageUrl && (
        <div 
          className="fixed inset-0 bg-slate-950/90 z-50 flex flex-col items-center justify-between p-6 animate-fade-in"
          onClick={() => setModalImageUrl(null)}
        >
          {/* Top Control Bar header */}
          <div className="w-full max-w-2xl flex justify-between items-center text-white shrink-0" onClick={e => e.stopPropagation()}>
            <span className="text-xs bg-slate-800 px-2 py-1 rounded-sm font-mono tracking-wider text-slate-300">
              Current Magnification: {zoomScale.toFixed(1)}x
            </span>
            <button 
              onClick={() => setModalImageUrl(null)}
              className="text-white hover:text-rose-400 text-sm font-bold bg-slate-800 hover:bg-slate-700 px-3 py-1 rounded-lg cursor-pointer transition-all"
            >
              ✕ Close Overlay
            </button>
          </div>

          {/* Center Scrollable Frame View */}
          <div className="flex-1 w-full flex items-center justify-center overflow-auto my-4 p-2 select-none">
            <img 
              src={modalImageUrl} 
              alt="Magnified Proof" 
              className="max-w-full max-h-[70vh] rounded-lg shadow-2xl object-contain transition-transform duration-200 ease-out"
              style={{ transform: `scale(${zoomScale})` }}
              onClick={e => e.stopPropagation()}
            />
          </div>

          {/* Bottom Precision Floating Panel Controls */}
          <div 
            className="bg-slate-900 border border-slate-800 rounded-full px-6 py-2.5 flex items-center gap-6 shadow-xl text-white select-none shrink-0"
            onClick={e => e.stopPropagation()}
          >
            <button 
              onClick={handleZoomOut} 
              disabled={zoomScale <= 1}
              className="text-base font-bold bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 px-3 py-1 rounded-full cursor-pointer transition-all"
            >
              −
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); setZoomScale(1); }}
              className="text-xs font-semibold uppercase tracking-wider text-slate-400 hover:text-white px-2 cursor-pointer transition-all"
            >
              Reset Scale
            </button>
            <button 
              onClick={handleZoomIn} 
              disabled={zoomScale >= 4}
              className="text-base font-bold bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 px-3 py-1 rounded-full cursor-pointer transition-all"
            >
              +
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default IssuesSidebar