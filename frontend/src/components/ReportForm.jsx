import { useState, useEffect } from 'react'
import axios from 'axios'

function ReportForm({ clickedLocation, onIssueAdded, onCancel }) {
  const [description, setDescription] = useState('')
  const [latitude, setLatitude] = useState('')
  const [longitude, setLongitude] = useState('')
  const [category, setCategory] = useState('other')
  
  // 💡 1. New State to store the actual binary image file object
  const [imageBefore, setImageBefore] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (clickedLocation) {
      setLatitude(clickedLocation.lat.toFixed(6))
      setLongitude(clickedLocation.lng.toFixed(6))
    }
  }, [clickedLocation])

  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      setImageBefore(e.target.files[0]) // Capturing the selected file meta data
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    // Explicit system level validation
    if (!description || !latitude || !longitude || !category || !imageBefore) {
      alert("Validation Error: Please fill in all required fields and upload an image.")
      return
    }

    setSubmitting(true)

    // 💡 2. Pro Level Move: Constructing FormData instead of basic JSON payload
    const formData = new FormData()
    formData.append('description', description)
    formData.append('latitude', parseFloat(latitude))
    formData.append('longitude', parseFloat(longitude))
    formData.append('category', category)
    formData.append('image_before', imageBefore) // Appending binary image chunk

    axios.post('http://127.0.0.1:8000/api/issues/', formData, {
      headers: {
        // Explicitly telling the backend ecosystem to expect file parts
        'Content-Type': 'multipart/form-data'
      }
    })
      .then(response => {
        alert("Success: The accessibility issue has been successfully reported with image payload.")
        setDescription('')
        setCategory('other')
        setImageBefore(null)
        onIssueAdded()
      })
      .catch(error => {
        console.error("API Upload Error details:", error)
        if (error.response && error.response.data) {
          alert(`Backend Rejected Data: ${JSON.stringify(error.response.data)}`)
        } else {
          alert("Error: Failed to process the upload request on server side.")
        }
      })
      .finally(() => {
        setSubmitting(false)
      })
  }

  return (
    <div className="w-1/3 bg-white border-r border-slate-200 flex flex-col p-4 overflow-y-auto animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-bold text-slate-800">Report Accessibility Issue</h2>
        <button 
          onClick={onCancel}
          className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 px-3 py-1.5 rounded-lg transition-all cursor-pointer font-medium"
        >
          Cancel
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
            Issue Category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full border border-slate-300 bg-white rounded-lg p-2 text-sm focus:outline-hidden focus:border-blue-500 text-slate-700 cursor-pointer"
          >
            <option value="ramp">Wheelchair Ramp</option>
            <option value="tactile">Tactile Paving</option>
            <option value="lift">Elevator / Lift</option>
            <option value="other">Other Infrastructure Issue</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
            Detailed Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Provide explicit details regarding the structural barrier..."
            rows="3"
            className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:outline-hidden focus:border-blue-500"
          />
        </div>

        {/* 💡 3. New File Input Element Section */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
            Evidence Photo (Required)
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
          />
        </div>

        <div className="bg-blue-50 text-blue-800 text-xs p-3 rounded-lg border border-blue-100 leading-relaxed">
          ℹ️ **System Instruction:** Click anywhere on the map interface to auto-populate the geographic coordinates fields below.
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
              Latitude
            </label>
            <input
              type="number"
              step="any"
              value={latitude}
              onChange={(e) => setLatitude(e.target.value)}
              placeholder="0.000000"
              className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-sm focus:outline-hidden focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
              Longitude
            </label>
            <input
              type="number"
              step="any"
              value={longitude}
              onChange={(e) => setLongitude(e.target.value)}
              placeholder="0.000000"
              className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-sm focus:outline-hidden focus:border-blue-500"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition-all shadow-sm cursor-pointer disabled:bg-blue-400 mt-4 text-sm"
        >
          {submitting ? 'Uploading Data Assets...' : 'Submit Structural Report'}
        </button>
      </form>
    </div>
  )
}

export default ReportForm