import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import 'leaflet-routing-machine';
import { Route, MapPin, Search, Layers } from 'lucide-react';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// ─── Inject pulse keyframe once ───────────────────────────────────────────────
if (!document.getElementById('map-highlight-styles')) {
  const style = document.createElement('style');
  style.id = 'map-highlight-styles';
  style.textContent = `
    @keyframes stopPulse {
      0%,100% { transform: scale(1);   opacity: 0.6; }
      50%      { transform: scale(1.9); opacity: 0;   }
    }
  `;
  document.head.appendChild(style);
}

// ─── Icon factories ───────────────────────────────────────────────────────────

const createCustomIcon = (color = '#6b21a8', isSelected = false, isPreview = false) => {
  const size = isSelected || isPreview ? 24 : 20;
  const emoji = isPreview ? '👁️' : (isSelected ? '📍' : '');
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      background:${color};border:3px solid #fff;border-radius:50%;
      width:${size}px;height:${size}px;box-shadow:0 2px 6px rgba(0,0,0,0.3);
      display:flex;align-items:center;justify-content:center;
      color:white;font-weight:bold;font-size:${isSelected || isPreview ? '12px' : '10px'};
    ">${emoji}</div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
};

// Pulsing icon for a hovered/selected stop card
const createHighlightedStopIcon = (color = '#6b21a8') => {
  const size = 36;
  return L.divIcon({
    className: 'highlighted-stop-marker',
    html: `
      <div style="position:relative;width:${size}px;height:${size}px;">
        <div style="
          position:absolute;inset:0;border-radius:50%;
          background:${color}44;
          animation:stopPulse 1.6s ease-in-out infinite;
        "></div>
        <div style="
          position:absolute;inset:5px;background:${color};
          border:3px solid #fff;border-radius:50%;
          box-shadow:0 0 0 3px ${color}55,0 4px 12px rgba(0,0,0,0.35);
          display:flex;align-items:center;justify-content:center;
          color:white;font-weight:bold;font-size:11px;
        ">📍</div>
      </div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
};

// Numbered icon for stops within a highlighted route
const createRouteHighlightStopIcon = (color, number, isFirst = false, isLast = false) => {
  const size = 30;
  const borderColor = isFirst ? '#10b981' : isLast ? '#ef4444' : '#fff';
  return L.divIcon({
    className: 'route-highlight-stop-marker',
    html: `<div style="
      background:${color};border:3px solid ${borderColor};border-radius:50%;
      width:${size}px;height:${size}px;
      box-shadow:0 0 0 3px ${color}55,0 3px 8px rgba(0,0,0,0.3);
      display:flex;align-items:center;justify-content:center;
      color:white;font-weight:bold;font-size:12px;
    ">${number}</div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
};

// Custom icon for route stops with numbers (used during route creation)
const createRouteStopIcon = (color, number, isNew = false) => {
  const size = 28;
  return L.divIcon({
    className: 'route-stop-marker',
    html: `<div style="
      background:${color};border:3px solid #fff;border-radius:50%;
      width:${size}px;height:${size}px;box-shadow:0 2px 6px rgba(0,0,0,0.3);
      display:flex;align-items:center;justify-content:center;
      color:white;font-weight:bold;font-size:12px;position:relative;
    ">
      ${number}
      ${isNew ? '<div style="position:absolute;top:-5px;right:-5px;background:#F59E0B;color:white;font-size:10px;padding:2px 4px;border-radius:4px;">N</div>' : ''}
    </div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
};

// ─── Distance helpers ─────────────────────────────────────────────────────────

// Helper function to calculate distance between two points
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

// Helper function to calculate total route distance
export const calculateRouteDistance = (stops) => {
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

// ─── Routing Control ──────────────────────────────────────────────────────────
function RoutingControl({ waypoints, routeColor = '#6b21a8', showRoute }) {
  const map = useMap();
  const routingControlRef = useRef(null);

  useEffect(() => {
    if (!showRoute || waypoints.length < 2) {
      if (routingControlRef.current) {
        try { map.removeControl(routingControlRef.current); } catch (error) {
          console.warn('Error removing routing control:', error);
        }
        routingControlRef.current = null;
      }
      return;
    }

    if (routingControlRef.current) {
      try { map.removeControl(routingControlRef.current); } catch (error) {
        console.warn('Error removing existing routing control:', error);
      }
    }

    try {
      const control = L.Routing.control({
        waypoints: waypoints.map(wp => L.latLng(wp.lat, wp.lng)),
        routeWhileDragging: false,
        showAlternatives: false,
        fitSelectedRoutes: false,
        show: false,
        lineOptions: {
          styles: [{ color: routeColor, opacity: 0.8, weight: 6 }],
          extendToWaypoints: true,
          missingRouteTolerance: 10,
        },
        createMarker: function(i, wp) { return null; },
        router: L.Routing.osrmv1({
          serviceUrl: 'https://router.project-osrm.org/route/v1',
          profile: 'driving',
          timeout: 10000,
        }),
      }).addTo(map);

      control.on('routingerror', function(e) {
        console.warn('Routing error (non-critical):', e.error);
      });
      routingControlRef.current = control;

      setTimeout(() => {
        try {
          const bounds = L.latLngBounds(waypoints.map(wp => [wp.lat, wp.lng]));
          map.fitBounds(bounds.pad(0.1));
        } catch (error) {
          console.warn('Error fitting bounds:', error);
        }
      }, 100);
    } catch (error) {
      console.error('Error creating routing control:', error);
    }

    return () => {
      if (routingControlRef.current) {
        try {
          map.removeControl(routingControlRef.current);
          routingControlRef.current = null;
        } catch (error) {
          console.warn('Error cleaning up routing control:', error);
        }
      }
    };
  }, [map, waypoints, showRoute, routeColor]);

  return null;
}

// ─── Highlighted route path — follows actual roads via OSRM ──────────────────
function HighlightedRoutePath({ route, isSelected }) {
  const map = useMap();
  const layerRef = useRef(null);

  useEffect(() => {
    // Clean up any existing layer first
    if (layerRef.current) {
      try { map.removeLayer(layerRef.current); } catch (e) {}
      layerRef.current = null;
    }

    if (!route?.route_stops || route.route_stops.length < 2) return;

    // Build ordered coordinate list from route stops
    const sorted = [...route.route_stops].sort(
      (a, b) => (a.stop_order ?? 0) - (b.stop_order ?? 0)
    );
    const waypoints = sorted
      .map(rs => {
        const lat = rs.stops?.latitude;
        const lng = rs.stops?.longitude;
        return lat != null && lng != null ? { lat, lng } : null;
      })
      .filter(Boolean);

    if (waypoints.length < 2) return;

    const straightCoords = waypoints.map(w => [w.lat, w.lng]);

    // ── Step 1: draw a dashed fallback line immediately ──────────────────
    const fallbackLine = L.polyline(straightCoords, {
      color: isSelected ? '#7c3aed' : '#a855f7',
      weight: isSelected ? 5 : 3,
      opacity: 0.45,
      dashArray: '10, 8',
      lineCap: 'round',
    }).addTo(map);
    layerRef.current = fallbackLine;

    if (isSelected) {
      try { map.fitBounds(L.latLngBounds(straightCoords).pad(0.18)); } catch (e) {}
    }

    // ── Step 2: fetch road geometry from OSRM ────────────────────────────
    // OSRM expects coordinates as "lng,lat;lng,lat;..."
    const coordString = waypoints.map(w => `${w.lng},${w.lat}`).join(';');
    const osrmUrl =
      `https://router.project-osrm.org/route/v1/driving/${coordString}` +
      `?overview=full&geometries=geojson&continue_straight=false`;

    let cancelled = false;

    fetch(osrmUrl, { signal: AbortSignal.timeout ? AbortSignal.timeout(10000) : undefined })
      .then(res => res.json())
      .then(data => {
        if (cancelled) return;
        if (data.code !== 'Ok' || !data.routes?.[0]?.geometry?.coordinates) {
          console.warn('OSRM returned no route, keeping fallback line');
          return;
        }

        // GeoJSON coordinates are [lng, lat] — flip to [lat, lng] for Leaflet
        const roadCoords = data.routes[0].geometry.coordinates.map(
          ([lng, lat]) => [lat, lng]
        );

        // Remove the fallback straight line
        if (layerRef.current) {
          try { map.removeLayer(layerRef.current); } catch (e) {}
          layerRef.current = null;
        }

        // Draw the road-following line
        const roadLine = L.polyline(roadCoords, {
          color: isSelected ? '#7c3aed' : '#a855f7',
          weight: isSelected ? 7 : 4,
          opacity: isSelected ? 0.92 : 0.65,
          dashArray: isSelected ? null : '14, 8',
          lineCap: 'round',
          lineJoin: 'round',
        }).addTo(map);

        layerRef.current = roadLine;

        // Fit map to the actual road bounds when selected
        if (isSelected) {
          try { map.fitBounds(roadLine.getBounds().pad(0.18)); } catch (e) {}
        }
      })
      .catch(err => {
        if (!cancelled) {
          console.warn('OSRM road routing failed, using straight-line fallback:', err);
          // Upgrade the fallback to look more intentional
          if (layerRef.current) {
            try { map.removeLayer(layerRef.current); } catch (e) {}
          }
          const upgradedFallback = L.polyline(straightCoords, {
            color: isSelected ? '#7c3aed' : '#a855f7',
            weight: isSelected ? 6 : 4,
            opacity: isSelected ? 0.85 : 0.6,
            dashArray: '14, 8',
            lineCap: 'round',
            lineJoin: 'round',
          }).addTo(map);
          layerRef.current = upgradedFallback;
        }
      });

    return () => {
      cancelled = true;
      if (layerRef.current) {
        try { map.removeLayer(layerRef.current); } catch (e) {}
        layerRef.current = null;
      }
    };
  }, [map, route, isSelected]);

  return null;
}

// ─── Map Events ───────────────────────────────────────────────────────────────
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
      map.flyTo([center.lat, center.lng], zoom || map.getZoom(), {
        animate: true,
        duration: 0.8,
      });
    }
  }, [center, zoom, map]);
  return null;
}

// Fits the map to a list of lat/lng points — used when edit mode starts
function MapFitBounds({ positions }) {
  const map = useMap();
  useEffect(() => {
    if (!positions || positions.length < 2) return;
    try {
      const bounds = L.latLngBounds(positions);
      map.flyToBounds(bounds.pad(0.18), { animate: true, duration: 0.9 });
    } catch (e) {}
  }, [map, positions]);
  return null;
}

// ─── Polyline (fallback dashed lines for route creation) ─────────────────────
const Polyline = ({ positions, color, opacity, weight, dashArray }) => {
  const map = useMap();
  useEffect(() => {
    const polyline = L.polyline(positions, { color, opacity, weight, dashArray }).addTo(map);
    return () => {
      // map.removeLayer(polyline);
    };
  }, [map, positions, color, opacity, weight, dashArray]);
  return null;
};

// ─── Main MapComponent ────────────────────────────────────────────────────────
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
  showRoutePaths = false,
  // ── New highlight props ──
  routes = [],
  hoveredRouteId = null,
  selectedRouteId = null,
  hoveredStopId = null,
  selectedStopId = null,
  // ── Edit-mode props ──
  editPlottedStops = [],
  editRouteCreationMode = null,
  editingRouteId = null,
  onEditStopClick = null,
}) => {
  const mapRef = useRef();
  const [isSatellite, setIsSatellite] = useState(true);

  // ── Derived highlight state ──────────────────────────────────────────────
  // When actively editing a route, highlight that route; otherwise use hover/select
  const activeRouteId   = editingRouteId || selectedRouteId || hoveredRouteId;
  const activeRoute     = activeRouteId ? routes.find(r => r.id === activeRouteId) : null;
  const activeStopId    = selectedStopId || hoveredStopId;
  const isRouteSelected = !!(editingRouteId || selectedRouteId);
  const isEditingRoute  = !!editingRouteId;

  // Set of stop IDs that belong to the highlighted route
  const highlightedRouteStopIds = activeRoute
    ? new Set(
        (activeRoute.route_stops || [])
          .map(rs => rs.stop_id || rs.stops?.id)
          .filter(Boolean)
      )
    : null;

  // Only render stops relevant to the current highlight state
  const visibleStops = (() => {
    if (activeRoute)  return stops.filter(s => highlightedRouteStopIds.has(s.id));
    if (activeStopId) return stops.filter(s => s.id === activeStopId);
    return stops;
  })();

  // Ordered stops of the active route (for numbered icons)
  const sortedActiveRouteStops = activeRoute
    ? [...(activeRoute.route_stops || [])]
        .sort((a, b) => (a.stop_order ?? 0) - (b.stop_order ?? 0))
        .map(rs => rs.stops)
        .filter(Boolean)
    : [];

  // ── Stop marker click (route creation / edit selecting mode) ───────────
  const handleStopClick = (stop, event) => {
    event.originalEvent.preventDefault();
    event.originalEvent.stopPropagation();
    if (editRouteCreationMode === 'selecting' && onEditStopClick) {
      onEditStopClick(stop);
    } else if (routeCreationMode === 'selecting' && onStopClick) {
      onStopClick(stop);
    }
  };

  // ── Waypoints for route creation path ───────────────────────────────────
  const routeWaypoints     = plottedStops.map(s => ({ lat: s.latitude, lng: s.longitude }));
  const editRouteWaypoints = editPlottedStops.map(s => ({ lat: s.latitude, lng: s.longitude }));

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>

      {/* ── Route creation mode banners ── */}
      {routeCreationMode === 'plotting' && (
        <div style={bannerStyle('#6b21a8')}>
          <MapPin size={20} />
          Route Creation Mode: Click on map to add stops
        </div>
      )}

      {routeCreationMode === 'selecting' && (
        <div style={bannerStyle('#10B981')}>
          <Search size={20} />
          Click on existing stops to select them for your route
        </div>
      )}

      {/* ── Route edit mode banners ── */}
      {editRouteCreationMode === 'plotting' && (
        <div style={bannerStyle('#D97706')}>
          <MapPin size={20} />
          Edit Mode: Click on map to add a stop to this route
        </div>
      )}

      {editRouteCreationMode === 'selecting' && (
        <div style={bannerStyle('#0891B2')}>
          <Search size={20} />
          Edit Mode: Click an existing stop on the map to add it to this route
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
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '13px',
        }}>
          <Route size={18} />
          Route Distance: {calculateRouteDistance(plottedStops).toFixed(2)} km •&nbsp;
          Stops: {plottedStops.length}
        </div>
      )}

      {/* Edit mode: show live distance counter */}
      {editRouteCreationMode && editPlottedStops.length >= 2 && (
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
          color: '#D97706',
          pointerEvents: 'none',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '13px',
        }}>
          <Route size={18} />
          Updated Route: {calculateRouteDistance(editPlottedStops).toFixed(2)} km •&nbsp;
          Stops: {editPlottedStops.length}
        </div>
      )}

      {/* ── Highlight hint banner ── */}
      {!routeCreationMode && !editRouteCreationMode && activeRoute && (
        <div style={{
          ...bannerStyle(isEditingRoute ? '#D97706' : '#7c3aed'),
          top: '10px',
          fontSize: '13px',
          padding: '10px 20px',
        }}>
          <Route size={16} />
          {isEditingRoute ? 'Editing: ' : ''}{activeRoute.name}
          {isRouteSelected && !isEditingRoute ? ' — click card again to deselect' : ''}
        </div>
      )}

      <MapContainer
        center={center}
        zoom={13}
        style={{ width: '100%', height: '100%' }}
        ref={mapRef}
      >
        {isSatellite ? (
          <TileLayer
            key="satellite"
            attribution='Tiles &copy; Esri, Maxar, Earthstar Geographics'
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          />
        ) : (
          <TileLayer
            key="osm"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
        )}

        <MapEvents
          onMapPress={onMapPress}
          isSelectingLocation={isSelectingLocation || routeCreationMode === 'plotting' || editRouteCreationMode === 'plotting'}
          routeCreationMode={routeCreationMode}
          onStopClick={onStopClick}
        />

        <MapPanController center={panToLocation} zoom={16} />

        {/* ── Fit map to editing route bounds on edit start ── */}
        {editingRouteId && editPlottedStops.length >= 2 && (
          <MapFitBounds
            positions={editPlottedStops.map(s => [s.latitude, s.longitude])}
          />
        )}

        {/* ── Highlighted route path (hover / selected from list) ── */}
        {activeRoute && (
          <HighlightedRoutePath route={activeRoute} isSelected={isRouteSelected} />
        )}

        {/* ── OSRM routing for route creation ── */}
        <RoutingControl
          waypoints={routeWaypoints}
          routeColor={routeCreationMode === 'plotting' ? '#6b21a8' : '#10B981'}
          showRoute={showRoutePaths && plottedStops.length >= 2}
        />

        {/* ── OSRM routing for route editing ── */}
        <RoutingControl
          waypoints={editRouteWaypoints}
          routeColor="#D97706"
          showRoute={showRoutePaths && editPlottedStops.length >= 2}
        />

        {/* ── Existing stops (filtered by highlight state) ── */}
        {visibleStops.map((stop) => {
          const isPlotted     = plottedStops.some(s => !s.isNew && s.id === stop.id);
          const isHighlighted = activeStopId === stop.id;

          const routePos = sortedActiveRouteStops.findIndex(s => s.id === stop.id);
          const isFirst  = routePos === 0;
          const isLast   = routePos === sortedActiveRouteStops.length - 1;

          let icon;
          if (isHighlighted) {
            icon = createHighlightedStopIcon('#6b21a8');
          } else if (activeRoute && routePos !== -1) {
            icon = createRouteHighlightStopIcon('#7c3aed', routePos + 1, isFirst, isLast);
          } else {
            icon = createCustomIcon(isPlotted ? '#EF4444' : '#6b21a8', isPlotted, false);
          }

          return (
            <Marker
              key={stop.id}
              position={[stop.latitude, stop.longitude]}
              icon={icon}
              eventHandlers={{
                click:     (e) => handleStopClick(stop, e),
                mouseover: (e) => e.target.openPopup(),
                mouseout:  (e) => e.target.closePopup(),
              }}
            >
              <Popup>
                <div style={{ minWidth: '160px' }}>
                  <b style={{ color: '#6b21a8', fontSize: '14px' }}>{stop.name}</b>

                  {activeRoute && routePos !== -1 && (
                    <div style={{ marginTop: '4px', fontSize: '12px' }}>
                      <span style={{
                        background: isFirst ? '#10b981' : isLast ? '#ef4444' : '#6b21a8',
                        color: 'white', padding: '2px 6px', borderRadius: '4px', marginRight: '4px',
                      }}>
                        Stop {routePos + 1}
                      </span>
                      {isFirst && <span style={{ color: '#10b981' }}>Start</span>}
                      {isLast  && <span style={{ color: '#ef4444' }}>End</span>}
                    </div>
                  )}

                  <div style={{ marginTop: '6px', fontSize: '11px', color: '#6b7280' }}>
                    <div>Lat: {stop.latitude.toFixed(6)}</div>
                    <div>Lng: {stop.longitude.toFixed(6)}</div>
                  </div>

                  {isPlotted ? (
                    <span style={{ color: '#EF4444', fontWeight: 'bold', fontSize: '12px' }}>
                      ✓ Added to route
                    </span>
                  ) : editRouteCreationMode === 'selecting' ? (
                    <>
                      <div style={{ color: '#0891B2', fontSize: '12px', marginTop: '4px' }}>
                        Click to add to edited route
                      </div>
                      <button
                        style={{ ...addButtonStyle, background: '#0891B2' }}
                        onClick={(e) => { e.stopPropagation(); if (onEditStopClick) onEditStopClick(stop); }}
                      >
                        Add to Route
                      </button>
                    </>
                  ) : routeCreationMode === 'selecting' ? (
                    <>
                      <div style={{ color: '#10B981', fontSize: '12px', marginTop: '4px' }}>
                        Click to add to route
                      </div>
                      <button
                        style={addButtonStyle}
                        onClick={(e) => { e.stopPropagation(); if (onStopClick) onStopClick(stop); }}
                      >
                        Add to Route
                      </button>
                    </>
                  ) : null}
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* ── Selected / editing stop ── */}
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

        {/* ── Preview stop ── */}
        {previewStop && (
          <Marker
            position={[previewStop.latitude, previewStop.longitude]}
            icon={createCustomIcon(
              previewStop.source === 'amenity' ? '#10B981' : '#6b21a8',
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

        {/* ── Searched location ── */}
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

        {/* ── Plotted stops with order numbers (route creation) ── */}
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
                <b>{stop.isNew ? (stop.tempName || 'Unnamed Stop') : stop.name}</b><br />
                {stop.isNew
                  ? <span style={{ color: '#F59E0B' }}>New Stop #{index + 1}</span>
                  : <span style={{ color: '#EF4444' }}>Stop #{index + 1} in Route</span>
                }<br />
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

        {/* ── Edit plotted stops with order numbers (route editing) ── */}
        {editPlottedStops.map((stop, index) => (
          <Marker
            key={`edit-plotted-${stop.id || index}`}
            position={[stop.latitude, stop.longitude]}
            icon={createRouteStopIcon(
              stop.isNew ? '#F59E0B' : '#D97706',
              index + 1,
              stop.isNew
            )}
          >
            <Popup>
              <div>
                <b>{stop.isNew ? (stop.tempName || 'Unnamed Stop') : stop.name}</b><br />
                {stop.isNew
                  ? <span style={{ color: '#F59E0B' }}>New Stop #{index + 1}</span>
                  : <span style={{ color: '#D97706' }}>✏️ Stop #{index + 1} (editing)</span>
                }<br />
                {stop.fareToNext && <span>Fare to next: GH₵ {stop.fareToNext}<br /></span>}
                {index < editPlottedStops.length - 1 && (
                  <span>Distance to next: {stop.distanceToNext || 'Calculating...'} km<br /></span>
                )}
                Lat: {Number(stop.latitude).toFixed(6)}<br />
                Lng: {Number(stop.longitude).toFixed(6)}
              </div>
            </Popup>
          </Marker>
        ))}

        {/* ── Fallback dashed lines between plotted stops ── */}
        {plottedStops.length >= 2 && showRoutePaths && (
          <>
            {plottedStops.slice(0, -1).map((stop, index) => {
              const nextStop = plottedStops[index + 1];
              return (
                <Polyline
                  key={`line-${index}`}
                  positions={[
                    [stop.latitude, stop.longitude],
                    [nextStop.latitude, nextStop.longitude],
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

        {/* ── Fallback dashed lines between edit plotted stops ── */}
        {editPlottedStops.length >= 2 && showRoutePaths && (
          <>
            {editPlottedStops.slice(0, -1).map((stop, index) => {
              const nextStop = editPlottedStops[index + 1];
              return (
                <Polyline
                  key={`edit-line-${index}`}
                  positions={[
                    [stop.latitude, stop.longitude],
                    [nextStop.latitude, nextStop.longitude],
                  ]}
                  color="#D97706"
                  opacity={0.6}
                  weight={3}
                  dashArray="10, 10"
                />
              );
            })}
          </>
        )}
      </MapContainer>

      {/* ── Layer toggle button ── */}
      <button
        onClick={() => setIsSatellite(prev => !prev)}
        title={isSatellite ? 'Switch to Map view' : 'Switch to Satellite view'}
        style={{
          position: 'absolute',
          bottom: '24px',
          left: '16px',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          background: 'rgba(255,255,255,0.95)',
          border: '2px solid rgba(0,0,0,0.15)',
          borderRadius: '10px',
          padding: '8px 14px',
          cursor: 'pointer',
          fontWeight: '600',
          fontSize: '13px',
          color: '#333',
          boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
          backdropFilter: 'blur(4px)',
          transition: 'background 0.2s, box-shadow 0.2s',
        }}
        onMouseEnter={e => e.currentTarget.style.background = 'rgba(240,240,240,0.98)'}
        onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.95)'}
      >
        <Layers size={16} color="#6b21a8" />
        {isSatellite ? 'Map View' : 'Satellite'}
      </button>
    </div>
  );
};

// ─── Style helpers ────────────────────────────────────────────────────────────
const bannerStyle = (color) => ({
  position: 'absolute',
  top: '10px',
  left: '50%',
  transform: 'translateX(-50%)',
  background: 'rgba(255,255,255,0.96)',
  padding: '12px 24px',
  borderRadius: '20px',
  boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
  zIndex: 1000,
  fontWeight: '600',
  color,
  pointerEvents: 'none',
  border: `2px solid ${color}`,
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  whiteSpace: 'nowrap',
});

const addButtonStyle = {
  marginTop: '8px',
  background: '#10B981',
  color: 'white',
  border: 'none',
  padding: '6px 12px',
  borderRadius: '4px',
  cursor: 'pointer',
  fontSize: '12px',
  width: '100%',
};

export default MapComponent;