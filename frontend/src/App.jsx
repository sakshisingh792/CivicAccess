import { useEffect, useState } from 'react'
import axios from 'axios'
import Navbar from './components/Navbar'
import IssuesSidebar from './components/IssuesSidebar'
import MapView from './components/MapView'
import ReportForm from './components/ReportForm'

function App() {
  const [issues, setIssues] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedIssue, setSelectedIssue] = useState(null)
  const [viewMode, setViewMode] = useState('list')
  const [clickedLocation, setClickedLocation] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  const fetchIssuesFromServer = () => {
    setLoading(true)
    axios.get('http://127.0.0.1:8000/api/issues/')
      .then(response => {
        setIssues(response.data)
        setLoading(false)
      })
      .catch(error => {
        console.error("Database communication error:", error)
        setLoading(false)
      })
  }

  useEffect(() => {
    fetchIssuesFromServer()
  }, [])

  const handleIssueAddedSuccess = () => {
    fetchIssuesFromServer()
    setClickedLocation(null)
    setViewMode('list')
  }

  const handleUpdateIssueStatus = (issueId, updatedStatus, proofFile) => {
    if (updatedStatus === 'RESOLVED' && !proofFile) {
      alert("Validation Error: Structural closure requires an image verification file asset.")
      return
    }

    const formData = new FormData()
    formData.append('status', updatedStatus)
    if (proofFile) {
      formData.append('image_after', proofFile)
    }

    axios.patch(`http://127.0.0.1:8000/api/issues/${issueId}/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
      .then(() => {
        alert("Verification data submitted. Running geographic coordinate proximity validation audit.")
        fetchIssuesFromServer()
      })
      .catch(error => {
        console.error("Status transaction exception:", error)
        if (error.response && error.response.data) {
          // 💡 FIXED: Dynamically auditing if error payload is a structured array or direct text string
          const errorData = error.response.data.image_after;
          const serverMessage = Array.isArray(errorData) 
            ? errorData[0] 
            : (typeof errorData === 'string' ? errorData : JSON.stringify(error.response.data));
            
          alert(`Security Audit Failure: ${serverMessage}`)
        } else {
          alert("Error: Failed network interface execution pass.")
        }
      })
  }

  const handleCommunityVoteSubmit = (issueId, actionType) => {
    axios.post(`http://127.0.0.1:8000/api/issues/${issueId}/vote/`, { vote_action: actionType })
      .then(response => {
        alert(response.data.success || response.data.warning)
        fetchIssuesFromServer()
      })
      .catch(error => console.error("Voting processing error:", error))
  }

  const filteredIssues = issues.filter(issue => {
    const matchesSearch = issue.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === 'all' || issue.category === categoryFilter
    
    if (statusFilter === 'all') return matchesSearch && matchesCategory
    if (statusFilter === 'REPORTED') return matchesSearch && matchesCategory && issue.status === 'REPORTED'
    if (statusFilter === 'PROVISIONALLY_RESOLVED') return matchesSearch && matchesCategory && issue.status === 'PROVISIONALLY_RESOLVED'
    if (statusFilter === 'RESOLVED') return matchesSearch && matchesCategory && issue.status === 'RESOLVED'
    return matchesSearch && matchesCategory
  })

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-50 overflow-hidden font-sans">
      <Navbar 
        userRole={localStorage.getItem('sim_role') || 'citizen'} 
        onRoleChange={(role) => {
          localStorage.setItem('sim_role', role)
          window.location.reload()
        }} 
      />
      
      <main className="flex flex-1 overflow-hidden">
        {viewMode === 'list' ? (
          <IssuesSidebar 
            issues={filteredIssues} 
            loading={loading} 
            onSelectIssue={setSelectedIssue} 
            onToggleReportForm={() => setViewMode('report')} 
            selectedIssue={selectedIssue}
            onUpdateStatus={handleUpdateIssueStatus}
            onCommunityVote={handleCommunityVoteSubmit}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            categoryFilter={categoryFilter}
            setCategoryFilter={setCategoryFilter}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            userRole={localStorage.getItem('sim_role') || 'citizen'}
          />
        ) : (
          <ReportForm 
            clickedLocation={clickedLocation}
            onIssueAdded={handleIssueAddedSuccess}
            onCancel={() => setViewMode('list')}
          />
        )}
        <MapView issues={filteredIssues} selectedIssue={selectedIssue} viewMode={viewMode} clickedLocation={clickedLocation} onMapClick={setClickedLocation} onMarkerClick={setSelectedIssue} />
      </main>
    </div>
  )
}

export default App