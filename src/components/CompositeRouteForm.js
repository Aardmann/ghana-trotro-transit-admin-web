import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Search,
  X,
  Route,
  ArrowUp,
  ArrowDown,
  AlertCircle,
  Plus,
  CheckCircle,
  Info,
  Layers,
  Link,
} from 'lucide-react';
import { supabase } from '../config/supabase';
import RouteInfoForm from './RouteInfoForm';


/**
 * Given an ordered array of full route objects (each with a .route_stops array),
 * merge their stops into a single flat list, deduplicating junction stops.
 *
 * Returns an array of:
 *   { stop_id, stop_name, latitude, longitude, fare_to_next,
 *     distance_to_next, stop_order, from_route_name, from_route_id }
 */
const mergeSubRouteStops = (routes) => {
  const merged = [];
  let globalOrder = 0;
  let lastStopId = null;

  for (const route of routes) {
    const sorted = (route.route_stops || [])
      .slice()
      .sort((a, b) => (a.stop_order ?? 0) - (b.stop_order ?? 0));

    for (let i = 0; i < sorted.length; i++) {
      const rs = sorted[i];
      const stopId = rs.stops?.id ?? rs.stop_id;

      // Deduplicate junction: skip the first stop of sub-routes 2..N
      // when it matches the last stop already in our merged list.
      // IMPORTANT: carry its fare_to_next / distance_to_next over to the
      // already-merged copy of the junction stop, because that copy came
      // from the previous route where it was the *last* stop (fare = null).
      if (i === 0 && lastStopId !== null && stopId === lastStopId) {
        if (merged.length > 0) {
          const junction = merged[merged.length - 1];
          if (rs.fare_to_next != null)     junction.fare_to_next     = rs.fare_to_next;
          if (rs.distance_to_next != null) junction.distance_to_next = rs.distance_to_next;
        }
        continue;
      }

      merged.push({
        stop_id:          stopId,
        stop_name:        rs.stops?.name ?? 'Unknown',
        latitude:         rs.stops?.latitude,
        longitude:        rs.stops?.longitude,
        fare_to_next:     rs.fare_to_next,
        distance_to_next: rs.distance_to_next,
        stop_order:       globalOrder,
        from_route_name:  route.name,
        from_route_id:    route.id,
      });

      lastStopId = stopId;
      globalOrder++;
    }
  }

  return merged;
};

/**
 * Validate that every consecutive pair of sub-routes share a junction stop:
 * the last stop of route[i] must be the same stop as the first stop of route[i+1].
 *
 * Returns an array of error strings (empty = all good).
 */
const validateJunctions = (routes) => {
  const errors = [];

  for (let i = 0; i < routes.length - 1; i++) {
    const current = routes[i];
    const next    = routes[i + 1];

    const currentSorted = (current.route_stops || [])
      .slice()
      .sort((a, b) => (a.stop_order ?? 0) - (b.stop_order ?? 0));
    const nextSorted = (next.route_stops || [])
      .slice()
      .sort((a, b) => (a.stop_order ?? 0) - (b.stop_order ?? 0));

    const lastStop  = currentSorted[currentSorted.length - 1];
    const firstStop = nextSorted[0];

    const lastId  = lastStop?.stops?.id  ?? lastStop?.stop_id;
    const firstId = firstStop?.stops?.id ?? firstStop?.stop_id;

    if (!lastId || !firstId || lastId !== firstId) {
      const lastName  = lastStop?.stops?.name  ?? '?';
      const firstName = firstStop?.stops?.name ?? '?';
      errors.push(
        `"${current.name}" ends at "${lastName}" but "${next.name}" starts at "${firstName}". ` +
        `These must be the same stop.`
      );
    }
  }

  return errors;
};

// ─────────────────────────────────────────────────────────────────────────────
//  Component
// ─────────────────────────────────────────────────────────────────────────────

const EMPTY_ROUTE_INFO = {
  description:        '',
  travelTimeMinutes:  '',
  peakHours:          '',
  frequency:          '',
  vehicleType:        '',
  notes:              '',
  amenities:          [],
  operatingHours: {
    start: '06:00',
    end:   '22:00',
    days:  ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
  },
};

const CompositeRouteForm = ({ onCancel, onSave, isLoading }) => {
  // ── Local state ────────────────────────────────────────────────────────────
  const [routeName,       setRouteName]       = useState('');
  const [availableRoutes, setAvailableRoutes] = useState([]);
  const [selectedRoutes,  setSelectedRoutes]  = useState([]);  // ordered sub-routes
  const [searchQuery,     setSearchQuery]     = useState('');
  const [searchResults,   setSearchResults]   = useState([]);
  const [mergedPreview,   setMergedPreview]   = useState([]);
  const [junctionErrors,  setJunctionErrors]  = useState([]);
  const [routeInfo,       setRouteInfo]       = useState(EMPTY_ROUTE_INFO);
  const [fetching,        setFetching]        = useState(false);

  // Track whether the admin manually typed a route name so auto-fill doesn't
  // overwrite their custom text (mirrors the pattern in AdminHomeScreen).
  const userEditedName = useRef(false);


  // ── Auto-fill route name as "First Stop to Last Stop" ─────────────────────
  useEffect(() => {
    // Don't overwrite if the user has typed something manually
    if (userEditedName.current) return;
    // Need at least two routes with no junction errors
    if (selectedRoutes.length < 2 || junctionErrors.length > 0) return;

    const firstRoute = selectedRoutes[0];
    const lastRoute  = selectedRoutes[selectedRoutes.length - 1];

    const firstSorted = (firstRoute.route_stops || [])
      .slice()
      .sort((a, b) => (a.stop_order ?? 0) - (b.stop_order ?? 0));
    const lastSorted = (lastRoute.route_stops || [])
      .slice()
      .sort((a, b) => (a.stop_order ?? 0) - (b.stop_order ?? 0));

    const firstName = firstSorted[0]?.stops?.name;
    const lastName  = lastSorted[lastSorted.length - 1]?.stops?.name;

    if (firstName && lastName) {
      setRouteName(`${firstName} to ${lastName}`);
    }
  }, [selectedRoutes, junctionErrors]);


  // ── Fetch all non-composite routes with their stops ────────────────────────
  useEffect(() => {
    const load = async () => {
      setFetching(true);
      try {
        const { data, error } = await supabase
          .from('routes')
          .select(`
            id,
            name,
            total_fare,
            total_distance,
            route_stops (
              id,
              stop_order,
              fare_to_next,
              distance_to_next,
              stops ( id, name, latitude, longitude )
            )
          `)
          .eq('is_composite', false)
          .eq('approved', true)
          .order('name');

        if (error) throw error;
        setAvailableRoutes(data || []);
      } catch (err) {
        console.error('CompositeRouteForm: failed to load routes', err);
      } finally {
        setFetching(false);
      }
    };
    load();
  }, []);


  // ── Live search filter ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const q   = searchQuery.toLowerCase();
    const ids = new Set(selectedRoutes.map(r => r.id));
    const hits = availableRoutes
      .filter(r => r.name.toLowerCase().includes(q) && !ids.has(r.id))
      .slice(0, 8);
    setSearchResults(hits);
  }, [searchQuery, availableRoutes, selectedRoutes]);


  // ── Recompute merged preview whenever the selection changes ───────────────
  useEffect(() => {
    if (selectedRoutes.length === 0) {
      setMergedPreview([]);
      setJunctionErrors([]);
      return;
    }
    const errors  = validateJunctions(selectedRoutes);
    const preview = errors.length === 0 ? mergeSubRouteStops(selectedRoutes) : [];
    setJunctionErrors(errors);
    setMergedPreview(preview);
  }, [selectedRoutes]);


  // ── Handlers ───────────────────────────────────────────────────────────────
  const addRoute = useCallback((route) => {
    setSelectedRoutes(prev => [...prev, route]);
    setSearchQuery('');
    setSearchResults([]);
  }, []);

  const removeRoute = useCallback((routeId) => {
    setSelectedRoutes(prev => prev.filter(r => r.id !== routeId));
  }, []);

  const moveRoute = useCallback((index, delta) => {
    setSelectedRoutes(prev => {
      const next = [...prev];
      const target = index + delta;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }, []);

  const handleInfoChange = useCallback((field, value) => {
    setRouteInfo(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleAmenityToggle = useCallback((amenity) => {
    setRouteInfo(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity],
    }));
  }, []);

  const handleHoursChange = useCallback((field, value) => {
    setRouteInfo(prev => ({
      ...prev,
      operatingHours: { ...prev.operatingHours, [field]: value },
    }));
  }, []);

  const handleDayToggle = useCallback((day) => {
    setRouteInfo(prev => ({
      ...prev,
      operatingHours: {
        ...prev.operatingHours,
        days: prev.operatingHours.days.includes(day)
          ? prev.operatingHours.days.filter(d => d !== day)
          : [...prev.operatingHours.days, day],
      },
    }));
  }, []);

  const handleSave = () => {
    if (!canSave) return;
    onSave({ routeName, selectedRoutes, mergedPreview, routeInfo });
  };


  // ── Derived values ─────────────────────────────────────────────────────────
  const totalFare = mergedPreview
    .reduce((s, r) => s + (parseFloat(r.fare_to_next) || 0), 0)
    .toFixed(2);

  const totalDistance = mergedPreview
    .reduce((s, r) => s + (parseFloat(r.distance_to_next) || 0), 0)
    .toFixed(2);

  const canSave =
    !isLoading &&
    routeName.trim() !== '' &&
    selectedRoutes.length >= 2 &&
    junctionErrors.length === 0 &&
    mergedPreview.length >= 2;


  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="form-container">

      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
        <Layers size={22} color="#6b21a8" />
        <h1 className="form-title" style={{ margin: 0 }}>Create Composite Route</h1>
      </div>
      <p className="form-subtitle" style={{ marginBottom: '20px' }}>
        Chain existing routes together. Any future fare, stop, or distance changes
        to a sub-route will <strong>automatically update</strong> this composite route.
      </p>


      {/* ── Route name ── */}
      <div className="input-group">
        <input
          className="input"
          placeholder="Composite Route Name (e.g., 'Circle to Tema via Accra Mall')"
          value={routeName}
          onChange={e => {
            userEditedName.current = true;
            setRouteName(e.target.value);
          }}
        />
      </div>


      {/* ── Sub-route search ── */}
      <h3 className="sub-section-title">
        <Link size={14} style={{ marginRight: 4 }} />
        Add Sub-Routes
      </h3>

      <div className="search-box-container">
        <div className="search-container">
          <Search size={20} color="#6b7280" />
          <input
            className="search-input"
            placeholder={fetching ? 'Loading routes…' : 'Search for a route to add…'}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            disabled={fetching}
          />
        </div>

        {searchResults.length > 0 && (
          <div className="suggestions-container">
            {searchResults.map(route => {
              const sorted  = (route.route_stops || [])
                .slice().sort((a, b) => (a.stop_order ?? 0) - (b.stop_order ?? 0));
              const first   = sorted[0]?.stops?.name ?? '?';
              const last    = sorted[sorted.length - 1]?.stops?.name ?? '?';
              return (
                <button
                  key={route.id}
                  className="suggestion-item"
                  onClick={() => addRoute(route)}
                >
                  <Route size={16} color="#6b21a8" />
                  <div style={{ flex: 1, textAlign: 'left' }}>
                    <span className="suggestion-text">{route.name}</span>
                    <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '1px' }}>
                      {first} → {last} • GH₵ {route.total_fare} • {route.total_distance} km
                    </div>
                  </div>
                  <Plus size={16} color="#10b981" />
                </button>
              );
            })}
          </div>
        )}
      </div>

      {availableRoutes.length === 0 && !fetching && (
        <div className="validation-error" style={{ marginTop: '8px' }}>
          <AlertCircle size={14} />
          No approved non-composite routes found. Create some regular routes first.
        </div>
      )}


      {/* ── Selected sub-routes (ordered) ── */}
      {selectedRoutes.length > 0 && (
        <>
          <h3 className="sub-section-title" style={{ marginTop: '20px' }}>
            Composition Order ({selectedRoutes.length} sub-routes)
          </h3>

          <div className="plotted-stops-list">
            {selectedRoutes.map((route, index) => {
              const sorted = (route.route_stops || [])
                .slice().sort((a, b) => (a.stop_order ?? 0) - (b.stop_order ?? 0));
              const firstStop = sorted[0]?.stops?.name ?? '?';
              const lastStop  = sorted[sorted.length - 1]?.stops?.name ?? '?';

              // Highlight any junction errors for this pair
              const hasError =
                junctionErrors.length > 0 && index < selectedRoutes.length - 1 &&
                junctionErrors.some((_, ei) => ei === index);

              return (
                <div
                  key={route.id}
                  className="plotted-stop-item"
                  style={hasError ? { borderLeft: '3px solid #ef4444' } : {}}
                >
                  {/* Position badge */}
                  <div className="stop-number">
                    <span className="stop-number-text">{index + 1}</span>
                  </div>

                  {/* Route info */}
                  <div className="plotted-stop-info" style={{ flex: 1, minWidth: 0 }}>
                    <div className="existing-stop-display">
                      <span className="existing-stop-name" style={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}>
                        {route.name}
                      </span>
                      <span className="existing-badge">{sorted.length} stops</span>
                    </div>
                    <div style={{ fontSize: '11px', color: '#6b21a8', marginTop: '2px' }}>
                      {firstStop} → {lastStop}
                    </div>
                    <div className="stop-coordinates">
                      GH₵ {route.total_fare} &nbsp;•&nbsp; {route.total_distance} km
                    </div>
                  </div>

                  {/* Reorder buttons */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginRight: '4px' }}>
                    <button
                      className="remove-button"
                      style={{ color: index === 0 ? '#d1d5db' : '#6b7280' }}
                      onClick={() => moveRoute(index, -1)}
                      disabled={index === 0}
                      title="Move up"
                    >
                      <ArrowUp size={13} />
                    </button>
                    <button
                      className="remove-button"
                      style={{ color: index === selectedRoutes.length - 1 ? '#d1d5db' : '#6b7280' }}
                      onClick={() => moveRoute(index, 1)}
                      disabled={index === selectedRoutes.length - 1}
                      title="Move down"
                    >
                      <ArrowDown size={13} />
                    </button>
                  </div>

                  {/* Remove */}
                  <button className="remove-button" onClick={() => removeRoute(route.id)}>
                    <X size={16} color="#EF4444" />
                  </button>
                </div>
              );
            })}
          </div>
        </>
      )}


      {/* ── Junction validation errors ── */}
      {junctionErrors.length > 0 && (
        <div className="validation-messages" style={{ marginTop: '12px' }}>
          <div style={{
            fontSize: '12px', fontWeight: 600, color: '#dc2626',
            marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px',
          }}>
            <AlertCircle size={14} />
            Junction mismatch — sub-routes must connect at a shared stop:
          </div>
          {junctionErrors.map((err, i) => (
            <div key={i} className="validation-error">{err}</div>
          ))}
          <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '6px', fontStyle: 'italic' }}>
            Tip: reorder the sub-routes or choose routes whose endpoints match.
          </div>
        </div>
      )}


      {/* ── Merged stop preview ── */}
      {mergedPreview.length >= 2 && junctionErrors.length === 0 && (
        <>
          <h3 className="sub-section-title" style={{ marginTop: '20px' }}>
            Merged Route Preview
            <span className="route-distance-badge">
              <Route size={14} />
              {totalDistance} km &nbsp;•&nbsp; GH₵ {totalFare}
            </span>
          </h3>

          {/* "Changes auto-sync" info banner */}
          <div style={{
            display: 'flex', alignItems: 'flex-start', gap: '8px',
            background: '#ede9fe', border: '1px solid #c4b5fd',
            borderRadius: '8px', padding: '10px 14px', marginBottom: '14px',
          }}>
            <Info size={15} color="#6b21a8" style={{ flexShrink: 0, marginTop: '1px' }} />
            <span style={{ fontSize: '12px', color: '#5b21b6', lineHeight: '1.5' }}>
              This preview reflects the <strong>current</strong> fares and distances of
              each sub-route. If a sub-route is edited later, the composite route will
              update <strong>automatically</strong> via a database trigger — no manual
              action needed.
            </span>
          </div>

          <div style={{
            background: '#f9fafb',
            border: '1px solid #e5e7eb',
            borderRadius: '10px',
            padding: '12px 14px',
            marginBottom: '16px',
            maxHeight: '260px',
            overflowY: 'auto',
          }}>
            {mergedPreview.map((stop, index) => {
              const isFirst = index === 0;
              const isLast  = index === mergedPreview.length - 1;
              const dotColor = isFirst ? '#10b981' : isLast ? '#ef4444' : '#7c3aed';

              return (
                <div
                  key={`${stop.stop_id}-${index}`}
                  style={{
                    display: 'flex', alignItems: 'flex-start',
                    gap: '10px', padding: '5px 0',
                    borderBottom: index < mergedPreview.length - 1 ? '1px solid #f3f4f6' : 'none',
                  }}
                >
                  {/* Dot */}
                  <div style={{
                    width: '22px', height: '22px',
                    background: dotColor,
                    borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontSize: '10px', fontWeight: 700, flexShrink: 0,
                    marginTop: '1px',
                  }}>
                    {index + 1}
                  </div>

                  {/* Stop name + fare */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ fontSize: '13px', fontWeight: 500, color: '#111827' }}>
                      {stop.stop_name}
                    </span>
                    {!isLast && stop.fare_to_next != null && (
                      <span style={{ fontSize: '11px', color: '#6b7280', marginLeft: '8px' }}>
                        → GH₵ {stop.fare_to_next}
                        {stop.distance_to_next != null && ` (${stop.distance_to_next} km)`}
                      </span>
                    )}
                  </div>

                  {/* Sub-route attribution */}
                  <span style={{
                    fontSize: '10px', color: '#9ca3af',
                    fontStyle: 'italic', flexShrink: 0, textAlign: 'right',
                    maxWidth: '100px', overflow: 'hidden',
                    textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {stop.from_route_name}
                  </span>
                </div>
              );
            })}
          </div>

          {/* ── Route info form ── */}
          <RouteInfoForm
            routeInfo={routeInfo}
            onInfoChange={handleInfoChange}
            onAmenityToggle={handleAmenityToggle}
            onOperatingHoursChange={handleHoursChange}
            onOperatingDayToggle={handleDayToggle}
          />
        </>
      )}


      {/* ── Validation hint when fewer than 2 routes selected ── */}
      {selectedRoutes.length === 1 && (
        <div style={{
          fontSize: '12px', color: '#6b7280', marginTop: '12px',
          fontStyle: 'italic', textAlign: 'center',
        }}>
          Add at least one more sub-route to build a composite.
        </div>
      )}


      {/* ── Action buttons ── */}
      <div className="button-row" style={{ marginTop: '20px' }}>
        <button className="cancel-button" onClick={onCancel}>
          Cancel
        </button>
        <button
          className={`save-button ${!canSave ? 'save-button-disabled' : ''}`}
          onClick={handleSave}
          disabled={!canSave}
        >
          {isLoading
            ? <div className="spinner" />
            : (
              <>
                <Layers size={16} style={{ marginRight: '6px' }} />
                Create Route
              </>
            )
          }
        </button>
      </div>

    </div>
  );
};

export default CompositeRouteForm;