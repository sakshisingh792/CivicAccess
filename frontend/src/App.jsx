import { useEffect, useState } from 'react'
import axios from 'axios'
import Navbar from './components/Navbar'
import IssuesSidebar from './components/IssuesSidebar'
import MapView from './components/MapView'
import ReportForm from './components/ReportForm'
import Auth from './components/Auth' // 💡 Connected the secure auth interface gateway

// Global Axios Interceptor: Automatically appends the JWT bearer token to every outbound API call
axios.interceptors.request.use(
  config => {
    const token = localStorage.getItem('civic_token')
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  error => Promise.reject(error)
)

function App() {
  // 💡 Real-time token existence verification switch
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('civic_token'))
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
        // 💡 Security Fallback: Automatically log out user if token expires or is manipulated (401 Unauthorized)
        if (error.response?.status === 401) {
          handleUserLogOut()
        }
        setLoading(false)
      })
  }

  useEffect(() => {
    if (isAuthenticated) {
      fetchIssuesFromServer()
    }
  }, [isAuthenticated])

  const handleAuthSuccessTrigger = () => {
    setIsAuthenticated(true)
  }

  const handleUserLogOut = () => {
    localStorage.clear()
    setIsAuthenticated(false)
    setSelectedIssue(null)
    setViewMode('list')
  }

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
          const errorData = error.response.data.image_after || error.response.data.error;
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
      .catch(error => {
        console.error("Voting processing error:", error)
        const serverErr = error.response?.data?.error || "Failed server validation passes."
        alert(`Voting Rejected: ${serverErr}`)
      })
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

  // 💡 CORE GATEWAY GUARD: If no authentic crypto token is found, render the login panel exclusively
  if (!isAuthenticated) {
    return <Auth onAuthSuccess={handleAuthSuccessTrigger} />
  }

  // Render main dashboard logic only if verified user identity matches passport parameters
  return (
    <div className="flex flex-col h-screen w-screen bg-slate-50 overflow-hidden font-sans">
      <Navbar 
        userRole={localStorage.getItem('civic_role') || 'CITIZEN'} 
        userName={localStorage.getItem('civic_user') || 'User'}
        onLogOut={handleUserLogOut} 
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
            userRole={localStorage.getItem('civic_role') || 'CITIZEN'}
          />
        ) : (
          <ReportForm 
            clickedLocation={clickedLocation}
            onIssueAdded={handleIssueAddedSuccess}
            onCancel={() => setViewMode('list')}
          />
        )}
        <MapView 
          issues={filteredIssues} 
          selectedIssue={selectedIssue} 
          viewMode={viewMode} 
          clickedLocation={clickedLocation} 
          onMapClick={setClickedLocation} 
          onMarkerClick={setSelectedIssue} 
        />
      </main>
    </div>
  )
}

export default App