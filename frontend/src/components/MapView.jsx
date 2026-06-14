import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

let DefaultIcon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// Custom sub-component to handle automatic fly-to logic
function RecenterMap({ selectedIssue }) {
  const map = useMap()
  useEffect(() => {
    if (selectedIssue) {
      map.flyTo([selectedIssue.latitude, selectedIssue.longitude], 16, {
        animate: true,
        duration: 1.5
      })
    }
  }, [selectedIssue, map])
  return null
}

// 💡 1. Naya Custom Component: Yeh click events capture karega
function MapClickHandler({ viewMode, onMapClick }) {
  useMapEvents({
    click(e) {
      // Jab sirf report form khula ho, tabhi clicks registers karo
      if (viewMode === 'report') {
        onMapClick({
          lat: e.latlng.lat,
          lng: e.latlng.lng
        })
      }
    }
  })
  return null
}

function MapView({ issues, selectedIssue, viewMode, clickedLocation, onMapClick }) {
  const bhopalCenter = [23.2599, 77.4126]

  return (
    <div className="w-2/3 h-full bg-slate-200 relative">
      <MapContainer center={bhopalCenter} zoom={13} className="h-full w-full z-0">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <RecenterMap selectedIssue={selectedIssue} />
        
        {/* 💡 2. Click Handler hook context inject kiya */}
        <MapClickHandler viewMode={viewMode} onMapClick={onMapClick} />

        {/* Existing active database markers */}
        {issues.map(issue => (
          <Marker key={issue.id} position={[issue.latitude, issue.longitude]}>
            <Popup>
              <div className="text-sm">
                <strong>Issue #{issue.id}</strong>
                <p className="mt-1">{issue.description}</p>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* 💡 3. Temporary Selection Pin: Agar user ne map par click kiya hai toh naya temporary pin dikhao */}
        {viewMode === 'report' && clickedLocation && (
          <Marker position={[clickedLocation.lat, clickedLocation.lng]}>
            <Popup>
              <div className="text-xs font-semibold text-blue-600">Selected Location Pin</div>
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  )
}

export default MapView