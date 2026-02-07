import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import 'leaflet-routing-machine';
import { Route, MapPin, Search } from 'lucide-react';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icons
const createCustomIcon = (color = '#6b21a8', isSelected = false, isPreview = false) => {
  const size = isSelected || isPreview ? 24 : 20;
  const emoji = isPreview ? '👁️' : (isSelected ? '📍' : '');
  
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
      font-size: ${isSelected || isPreview ? '12px' : '10px'};
    ">${emoji}</div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
};

// Routing Control Component
function RoutingControl({ waypoints, routeColor = '#6b21a8', showRoute }) {
  const map = useMap();
  const [routingControl, setRoutingControl] = useState(null);

  useEffect(() => {
    if (!showRoute || waypoints.length < 2) {
      if (routingControl) {
        map.removeControl(routingControl);
        setRoutingControl(null);
      }
      return;
    }

    // Create routing control
    const control = L.Routing.control({
      waypoints: waypoints.map(wp => L.latLng(wp.lat, wp.lng)),
      routeWhileDragging: false,
      showAlternatives: false,
      fitSelectedRoutes: true,
      show: false, // Hide the instructions panel
      lineOptions: {
        styles: [
          {
            color: routeColor,
            opacity: 0.8,
            weight: 6
          }
        ],
        extendToWaypoints: true,
        missingRouteTolerance: 10
      },
      createMarker: function(i, wp) {
        // Don't create default markers since we have our own
        return null;
      },
      router: L.Routing.osrmv1({
        serviceUrl: 'https://router.project-osrm.org/route/v1',
        profile: 'driving'
      })
    }).addTo(map);

    // Handle routing errors
    control.on('routingerror', function(e) {
      console.error('Routing error:', e.error);
    });

    setRoutingControl(control);

    return () => {
      if (control) {
        map.removeControl(control);
      }
    };
  }, [map, waypoints, showRoute, routeColor]);

  return null;
}

function MapEvents({ onMapPress, isSelectingLocation, routeCreationMode, onStopClick }) {
  useMapEvents({
    click: (e) => {
      if (isSelectingLocation && onMapPress) {
        onMapPress(e.latlng.lat, e.latlng.lng);
      }
    },
  });
  return null;
}

function MapPanController({ center, zoom }) {
  const map = useMap();
  
  useEffect(() => {
    if (center && center.lat && center.lng) {
      map.setView([center.lat, center.lng], zoom || map.getZoom());
    }
  }, [center, zoom, map]);

  return null;
}

const MapComponent = ({ 
  center, 
  stops = [], 
  selectedStop = null,
  previewStop = null,
  searchedLocation = null,
  panToLocation = null,
  onMapPress = null,
  isSelectingLocation = false,
  plottedStops = [],
  routeCreationMode = null,
  onStopClick = null,
  showRoutePaths = false // New prop to control route display
}) => {
  const mapRef = useRef();

  // Function to handle stop marker click
  const handleStopClick = (stop, event) => {
    event.originalEvent.preventDefault();
    event.originalEvent.stopPropagation();
    
    if (routeCreationMode === 'selecting' && onStopClick) {
      onStopClick(stop);
      return;
    }
  };

  // Convert plotted stops to waypoints for routing
  const routeWaypoints = plottedStops.map(stop => ({
    lat: stop.latitude,
    lng: stop.longitude
  }));

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      {routeCreationMode === 'plotting' && (
        <div style={{
          position: 'absolute',
          top: '10px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(255,255,255,0.95)',
          padding: '12px 24px',
          borderRadius: '20px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
          zIndex: 1000,
          fontWeight: '600',
          color: '#6b21a8',
          pointerEvents: 'none',
          border: '2px solid #6b21a8',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <MapPin size={20} />
          Route Creation Mode: Click on map to add stops
        </div>
      )}

      {routeCreationMode === 'selecting' && (
        <div style={{
          position: 'absolute',
          top: '10px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(255,255,255,0.95)',
          padding: '12px 24px',
          borderRadius: '20px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
          zIndex: 1000,
          fontWeight: '600',
          color: '#10B981',
          pointerEvents: 'none',
          border: '2px solid #10B981',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <Search size={20} />
          Click on existing stops to select them for your route
        </div>
      )}
      
      {routeCreationMode && plottedStops.length >= 2 && (
        <div style={{
          position: 'absolute',
          top: '60px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(255,255,255,0.95)',
          padding: '10px 20px',
          borderRadius: '15px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
          zIndex: 1000,
          fontWeight: '500',
          color: '#EF4444',
          pointerEvents: 'none',
          border: '2px solid #EF4444',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <Route size={18} />
          Route Distance: {calculateRouteDistance(plottedStops).toFixed(2)} km • 
          Stops: {plottedStops.length}
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
        
        {/* Add road routing between plotted stops */}
        <RoutingControl 
          waypoints={routeWaypoints}
          routeColor={routeCreationMode === 'plotting' ? '#6b21a8' : '#10B981'}
          showRoute={showRoutePaths && plottedStops.length >= 2}
        />
        
        <MapPanController center={panToLocation} zoom={16} />
        
        <MapEvents 
          onMapPress={onMapPress} 
          isSelectingLocation={isSelectingLocation || routeCreationMode === 'plotting'}
          routeCreationMode={routeCreationMode}
          onStopClick={onStopClick}
        />
        
        {/* Render existing stops */}
        {stops.map((stop) => {
          const isPlotted = plottedStops.some(s => !s.isNew && s.id === stop.id);
          
          return (
            <Marker
              key={stop.id}
              position={[stop.latitude, stop.longitude]}
              icon={createCustomIcon(
                isPlotted ? '#EF4444' : '#6b21a8',
                isPlotted,
                false
              )}
              eventHandlers={{
                click: (e) => handleStopClick(stop, e),
                mouseover: (e) => {
                  e.target.openPopup();
                },
                mouseout: (e) => {
                  e.target.closePopup();
                }
              }}
            >
              <Popup>
                <div>
                  <b>{stop.name}</b>
                  <br />
                  {isPlotted ? (
                    <span style={{color: '#EF4444', fontWeight: 'bold'}}>✓ Added to route</span>
                  ) : routeCreationMode === 'selecting' ? (
                    <span style={{color: '#10B981'}}>Click to add to route</span>
                  ) : null}
                  <br />
                  Lat: {stop.latitude.toFixed(6)}<br />
                  Lng: {stop.longitude.toFixed(6)}
                  {routeCreationMode === 'selecting' && !isPlotted && (
                    <div style={{marginTop: '8px'}}>
                      <button 
                        style={{
                          background: '#10B981',
                          color: 'white',
                          border: 'none',
                          padding: '6px 12px',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onStopClick) onStopClick(stop);
                        }}
                      >
                        Add to Route
                      </button>
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
        
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
        
        {/* Render preview stop */}
        {previewStop && (
          <Marker
            position={[previewStop.latitude, previewStop.longitude]}
            icon={createCustomIcon(
              previewStop.source === 'amenity' ? '#10B981' : '#3B82F6', 
              false, 
              true
            )}
          >
            <Popup>
              <div>
                <b>Preview: {previewStop.name}</b><br />
                Type: {previewStop.type}<br />
                {previewStop.source === 'amenity' && <span>🚍 Found by icon<br /></span>}
                Lat: {previewStop.latitude.toFixed(6)}<br />
                Lng: {previewStop.longitude.toFixed(6)}
              </div>
            </Popup>
          </Marker>
        )}
        
        {/* Render searched location */}
        {searchedLocation && (
          <Marker
            position={[searchedLocation.latitude, searchedLocation.longitude]}
            icon={createCustomIcon('#F59E0B', false, true)}
          >
            <Popup>
              <div>
                <b>Searched: {searchedLocation.name.split(',')[0]}</b><br />
                Full: {searchedLocation.name}<br />
                Lat: {searchedLocation.latitude.toFixed(6)}<br />
                Lng: {searchedLocation.longitude.toFixed(6)}
              </div>
            </Popup>
          </Marker>
        )}

        {/* Render plotted stops with order numbers */}
        {plottedStops.map((stop, index) => (
          <Marker
            key={`plotted-${stop.id || index}`}
            position={[stop.latitude, stop.longitude]}
            icon={createRouteStopIcon(
              stop.isNew ? '#F59E0B' : '#EF4444',
              index + 1,
              stop.isNew
            )}
          >
            <Popup>
              <div>
                <b>{stop.isNew ? (stop.tempName || 'Unnamed Stop') : stop.name}</b>
                <br />
                {stop.isNew ? (
                  <span style={{color: '#F59E0B'}}>New Stop #{index + 1}</span>
                ) : (
                  <span style={{color: '#EF4444'}}>Stop #{index + 1} in Route</span>
                )}
                <br />
                {stop.fareToNext && <span>Fare to next: GH₵ {stop.fareToNext}<br /></span>}
                {index < plottedStops.length - 1 && (
                  <span>Distance to next: {stop.distanceToNext || 'Calculating...'} km<br /></span>
                )}
                Lat: {stop.latitude.toFixed(6)}<br />
                Lng: {stop.longitude.toFixed(6)}
              </div>
            </Popup>
          </Marker>
        ))}
        
        {/* Draw straight lines between stops if routing fails or as fallback */}
        {plottedStops.length >= 2 && showRoutePaths && (
          <>
            {plottedStops.slice(0, -1).map((stop, index) => {
              const nextStop = plottedStops[index + 1];
              return (
                <Polyline
                  key={`line-${index}`}
                  positions={[
                    [stop.latitude, stop.longitude],
                    [nextStop.latitude, nextStop.longitude]
                  ]}
                  color={routeCreationMode === 'plotting' ? '#6b21a8' : '#10B981'}
                  opacity={0.5}
                  weight={3}
                  dashArray="10, 10"
                />
              );
            })}
          </>
        )}
      </MapContainer>
    </div>
  );
};

// Helper function to calculate total route distance
const calculateRouteDistance = (stops) => {
  let totalDistance = 0;
  for (let i = 0; i < stops.length - 1; i++) {
    const distance = calculateDistance(
      stops[i].latitude,
      stops[i].longitude,
      stops[i + 1].latitude,
      stops[i + 1].longitude
    );
    totalDistance += distance;
  }
  return totalDistance;
};

// Helper function to calculate distance between two points
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

// Custom icon for route stops with numbers
const createRouteStopIcon = (color, number, isNew = false) => {
  const size = 28;
  return L.divIcon({
    className: 'route-stop-marker',
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
      font-size: 12px;
      position: relative;
    ">
      ${number}
      ${isNew ? '<div style="position: absolute; top: -5px; right: -5px; background: #F59E0B; color: white; font-size: 10px; padding: 2px 4px; border-radius: 4px;">N</div>' : ''}
    </div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
};

// Add Polyline component for fallback lines
const Polyline = ({ positions, color, opacity, weight, dashArray }) => {
  const map = useMap();
  
  useEffect(() => {
    const polyline = L.polyline(positions, {
      color,
      opacity,
      weight,
      dashArray
    }).addTo(map);
    
    return () => {
      map.removeLayer(polyline);
    };
  }, [map, positions, color, opacity, weight, dashArray]);
  
  return null;
};

export default MapComponent;