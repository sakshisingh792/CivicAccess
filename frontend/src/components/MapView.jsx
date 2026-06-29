import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// 💡 Vite/Leaflet Asset Fix: Prevents missing marker icons during runtime transitions
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

// 🌐 CAMERA CONTROLLER: Center pans cleanly when location streams activate
function ChangeMapView({ center }) {
  const map = useMap()
  useEffect(() => {
    if (center) {
      map.panTo(center)
    }
  }, [center, map])
  return null
}

// 🗺️ GRID TAP LISTENER: Allows users to manually place a pin anywhere on the canvas
function MapClickHandler({ onMapClick }) {
  useMapEvents({
    click(e) {
      onMapClick({ 
        lat: e.latlng.lat, 
        lng: e.latlng.lng, 
        address: "Location Pinpointed on Map Grid", 
        place: "Selected Coordinate Zone" 
      })
    },
  })
  return null
}

function MapView({ issues, selectedIssue, viewMode, clickedLocation, onMapClick, onMarkerClick }) {
  const defaultCenter = [23.2599, 77.4126] // Fallback Central Bhopal Coords
  const [mapCenter, setMapCenter] = useState(defaultCenter)
  const [isTracking, setIsTracking] = useState(false)
  const [geoWatchId, setGeoWatchId] = useState(null)

  // Sync camera viewport if an existing issue is clicked from the sidebar list
  useEffect(() => {
    if (selectedIssue) {
      setMapCenter([parseFloat(selectedIssue.latitude), parseFloat(selectedIssue.longitude)])
    }
  }, [selectedIssue])

  // 📡 CORE GEOLOCATION HARDWARE STREAM TELEMETRY
  useEffect(() => {
    if (isTracking) {
      if (!navigator.geolocation) {
        alert("Your modern web client browser lacks standard GPS positioning telemetry components.")
        setIsTracking(false)
        return
      }

      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          const liveCoords = { lat: latitude, lng: longitude }
          
          // Continuously stream hardware telemetry straight down into form inputs
          onMapClick({ 
            lat: latitude, 
            lng: longitude, 
            address: "Live GPS Telemetry Sync Active", 
            place: "Current Live Coordinates Location" 
          })
          setMapCenter([latitude, longitude])
        },
        (error) => {
          console.error("GPS telemetry access failure:", error)
          alert("Location streaming access dropped. Verify terminal parameters permission flags.")
          setIsTracking(false)
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      )
      setGeoWatchId(watchId)
    } else {
      if (geoWatchId) {
        navigator.geolocation.clearWatch(geoWatchId)
        setGeoWatchId(null)
      }
    }

    return () => {
      if (geoWatchId) navigator.geolocation.clearWatch(geoWatchId)
    }
  }, [isTracking])

  return (
    <div className="flex-1 h-full relative bg-slate-100 overflow-hidden flex flex-col">
      
      {/* 🚀 SIMPLIFIED FLOATING CONTROLS: Pure Live Tracking Toggle Mechanism Switch */}
      <div className="absolute top-4 right-4 z-[999]">
        <button
          type="button"
          onClick={() => setIsTracking(!isTracking)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider shadow-md border cursor-pointer transition-all ${
            isTracking 
              ? 'bg-emerald-600 border-emerald-500 text-white animate-pulse' 
              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <span>🎯</span>
          {isTracking ? 'Live GPS: Tracking Active' : 'Enable Live GPS Tracking'}
        </button>
      </div>

      {/* 🗺️ ACTIVE OPENSTREETMAP LEAFLET INSTANCE CANVAS */}
      <MapContainer 
        center={mapCenter} 
        zoom={14} 
        className="w-full h-full z-10"
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <ChangeMapView center={mapCenter} />
        <MapClickHandler onMapClick={onMapClick} />

        {/* Dynamic Placement Pin Flag: Follows active tracking or manual grid selections */}
        {clickedLocation && (
          <Marker position={[clickedLocation.lat, clickedLocation.lng]} />
        )}

        {/* Global Complaints Loop Database Markers Rendering Pins */}
        {issues.map((issue) => (
          <Marker 
            key={issue.id} 
            position={[parseFloat(issue.latitude), parseFloat(issue.longitude)]}
            eventHandlers={{
              click: () => onMarkerClick(issue)
            }}
          />
        ))}
      </MapContainer>

      {/* 📊 UBER STYLE BOTTOM TELEMETRY META READOUT DESIGN DISPLAY BOX */}
      <div className="absolute bottom-4 inset-x-4 z-[999] max-w-sm mx-auto bg-white rounded-2xl shadow-xl border border-slate-200 p-4 flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-sm border ${isTracking ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
            📍
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-bold text-slate-800 truncate">
              {isTracking ? 'Streaming Hardware GPS' : 'Manual Placement Coords'}
            </h4>
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5">
              {clickedLocation ? 'Coordinate lock acquired' : 'Awaiting position feedback log'}
            </p>
          </div>
        </div>

        {/* High Precision Coordinate Value Panels */}
        <div className="grid grid-cols-2 gap-2 text-[10px] font-mono font-bold text-slate-500 bg-slate-50 border border-slate-100 p-2 rounded-lg">
          <div>LAT: {clickedLocation?.lat ? clickedLocation.lat.toFixed(6) : mapCenter[0].toFixed(6)}</div>
          <div>LNG: {clickedLocation?.lng ? clickedLocation.lng.toFixed(6) : mapCenter[1].toFixed(6)}</div>
        </div>

        {/* Confirm Trigger Button Overlay Boundary for Report Operations View */}
        {viewMode === 'report' && (
          <button
            type="button"
            className="w-full bg-slate-950 hover:bg-slate-800 text-white text-[10px] font-bold py-2.5 uppercase tracking-wider rounded-xl transition-all shadow-xs cursor-pointer text-center"
            onClick={() => alert("Coordinates successfully registered inside your complaint log!")}
          >
            Confirm Anchor Coordinates
          </button>
        )}
      </div>

    </div>
  )
}

export default MapView