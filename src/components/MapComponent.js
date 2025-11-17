// src/components/MapComponent.js
import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icons
const createCustomIcon = (color = '#6b21a8', isSelected = false) => {
  const size = isSelected ? 24 : 20;
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      background: ${color};
      border: 3px solid #fff;
      border-radius: 50%;
      width: ${size}px;
      height: ${size}px;
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: bold;
      font-size: ${isSelected ? '12px' : '10px'};
    ">${isSelected ? '📍' : ''}</div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
};

function MapEvents({ onMapPress, isSelectingLocation }) {
  useMapEvents({
    click: (e) => {
      if (isSelectingLocation && onMapPress) {
        onMapPress(e.latlng.lat, e.latlng.lng);
      }
    },
  });
  return null;
}

const MapComponent = ({ 
  center, 
  stops = [], 
  selectedStop = null,
  onMapPress = null,
  isSelectingLocation = false 
}) => {
  const mapRef = useRef();

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      {isSelectingLocation && (
        <div style={{
          position: 'absolute',
          top: '10px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(255,255,255,0.9)',
          padding: '10px 20px',
          borderRadius: '20px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
          zIndex: 1000,
          fontWeight: '500',
          color: '#6b21a8',
          pointerEvents: 'none',
        }}>
          📍 Click on map to select location
        </div>
      )}
      
      <MapContainer
        center={center}
        zoom={13}
        style={{ width: '100%', height: '100%' }}
        ref={mapRef}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapEvents 
          onMapPress={onMapPress} 
          isSelectingLocation={isSelectingLocation} 
        />
        
        {/* Render stops */}
        {stops.map((stop, index) => (
          <Marker
            key={stop.id}
            position={[stop.latitude, stop.longitude]}
            icon={createCustomIcon('#6b21a8', false)}
          >
            <Popup>
              <div>
                <b>{stop.name}</b><br />
                Lat: {stop.latitude}<br />
                Lng: {stop.longitude}
              </div>
            </Popup>
          </Marker>
        ))}
        
        {/* Render selected stop */}
        {selectedStop && (
          <Marker
            position={[selectedStop.latitude, selectedStop.longitude]}
            icon={createCustomIcon('#EF4444', true)}
          >
            <Popup>
              <div>
                <b>Selected: {selectedStop.name}</b><br />
                Lat: {selectedStop.latitude}<br />
                Lng: {selectedStop.longitude}
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
};

export default MapComponent;