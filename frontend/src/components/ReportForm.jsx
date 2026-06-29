import { useState, useEffect } from 'react'
import axios from 'axios'

function ReportForm({ clickedLocation, onIssueAdded, onCancel }) {
  const [description, setDescription] = useState('')
  const [latitude, setLatitude] = useState('')
  const [longitude, setLongitude] = useState('')
  const [category, setCategory] = useState('other')
  const [imageBefore, setImageBefore] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  // 💡 Real-time telemetry sink: Automatically pulls live tracking or map click coordinates
  useEffect(() => {
    if (clickedLocation) {
      setLatitude(clickedLocation.lat.toFixed(6))
      setLongitude(clickedLocation.lng.toFixed(6))
    }
  }, [clickedLocation])

  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      setImageBefore(e.target.files[0])
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!description || !latitude || !longitude || !category || !imageBefore) {
      alert("Validation Error: Please fill in all required fields and upload an image.")
      return
    }

    setSubmitting(true)

    const formData = new FormData()
    formData.append('description', description)
    formData.append('latitude', parseFloat(latitude))
    formData.append('longitude', parseFloat(longitude))
    formData.append('full_address', resolvedAddressFromMapState) // 💡 New Address attribute block
    formData.append('place_name', placeNameFromMapState)
    formData.append('category', category)
    formData.append('image_before', imageBefore)

    axios.post('http://127.0.0.1:8000/api/issues/', formData, {
      headers: {
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
    <div className="w-96 bg-white border-r border-slate-200 flex flex-col p-6 overflow-y-auto shrink-0 h-full shadow-xs">
      
      {/* Form Header Segment */}
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100">
        <div>
          <h2 className="text-base font-bold text-slate-900">Report Issue</h2>
          <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider mt-0.5">Asset Registry Node</p>
        </div>
        <button 
          onClick={onCancel}
          className="text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-600 px-3 py-1.5 rounded-lg transition-all cursor-pointer"
        >
          Cancel
        </button>
      </div>

      {/* Form Content Engine */}
      <form onSubmit={handleSubmit} className="space-y-5 flex-1">
        
        {/* Field: Category */}
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
            Issue Category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full border border-slate-200 bg-white rounded-xl p-2.5 text-xs font-semibold text-slate-700 focus:outline-none focus:border-blue-500 cursor-pointer shadow-2xs"
          >
            <option value="ramp">Wheelchair Ramp</option>
            <option value="tactile">Tactile Paving</option>
            <option value="lift">Elevator / Lift</option>
            <option value="other">Other Infrastructure Issue</option>
          </select>
        </div>

        {/* Field: Description */}
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
            Detailed Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Provide details regarding the structural barrier..."
            rows="4"
            className="w-full border border-slate-200 rounded-xl p-3 text-xs font-medium text-slate-700 focus:outline-none focus:border-blue-500 placeholder:text-slate-300 shadow-2xs resize-none"
          />
        </div>

        {/* Field: Evidence Upload */}
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
            Evidence Photo (Required)
          </label>
          <div className="border border-dashed border-slate-200 hover:border-blue-500 rounded-xl p-3 bg-slate-50/50 transition-colors">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-[11px] file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
            />
          </div>
        </div>

        {/* Information Notification Banner */}
        <div className="bg-slate-50 text-slate-600 text-[11px] p-3.5 rounded-xl border border-slate-100 leading-relaxed font-medium">
          ℹ️ Turn on <span className="font-bold text-blue-600">Live GPS tracking</span> on the map menu or click anywhere on the grid canvas to stream geographic positioning logs instantly.
        </div>

        {/* Coordinate Readouts Matrix */}
        <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100 space-y-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Telemetry Feeds</span>
            {clickedLocation && (
              <span className="text-[9px] font-extrabold uppercase bg-emerald-50 text-emerald-600 border border-emerald-200 px-1.5 py-0.5 rounded-md animate-pulse">
                ● GPS Synced
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Latitude
              </label>
              <input
                type="number"
                step="any"
                readOnly
                value={latitude}
                className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-mono font-semibold text-slate-600 focus:outline-none cursor-not-allowed"
                placeholder="0.000000"
              />
            </div>

            <div>
              <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Longitude
              </label>
              <input
                type="number"
                step="any"
                readOnly
                value={longitude}
                className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-mono font-semibold text-slate-600 focus:outline-none cursor-not-allowed"
                placeholder="0.000000"
              />
            </div>
          </div>
        </div>

        {/* Execution Submit Button */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-slate-950 hover:bg-slate-800 text-white font-bold py-3 rounded-xl transition-all shadow-xs cursor-pointer disabled:bg-slate-400 text-xs uppercase tracking-wider active:scale-[0.99]"
        >
          {submitting ? 'Uploading Data Assets...' : 'Submit Structural Report'}
        </button>
      </form>
    </div>
  )
}

export default ReportForm