// src/components/EarnerHomeScreen.js
import React, { useState, useEffect, useRef, useCallback } from 'react';
import './AdminHomeScreen.css';
import MapComponent, { calculateDistance, calculateRouteDistance } from './MapComponent';
import { MAP_CONFIG } from '../utils/constants';
import { supabase } from '../config/supabase';
import {
  MapPin,
  Edit3,
  Trash2,
  X,
  Search,
  LogOut,
  Settings,
  Route,
  ArrowLeft,
  Check,
  Plus,
  Filter,
  Clock,
  Bus,
  Info,
  AlertCircle,
  CheckCircle,
  Calendar,
  Wind,
  Wifi,
  Tv,
  Thermometer,
  Package,
  Shield,
  Building,
  Hash,
  Type,
  CalendarDays,
  Layers,
  Phone,
  DollarSign,
  XCircle,
} from 'lucide-react';
import RouteCreationWithMap from './RouteCreationWithMap';
import RouteEditWithMap from './RouteEditWithMap';
import StopForm from './StopForm';
import './StopForm.css';
import CompositeRouteForm from './CompositeRouteForm';
import RouteSelectionModal from './RouteSelectionModal';

// ─── Route Information Form (identical to AdminHomeScreen) ────────────────────
const RouteInfoForm = ({
  routeInfo,
  onInfoChange,
  onAmenityToggle,
  onOperatingHoursChange,
  onOperatingDayToggle,
}) => {
  const vehicleTypes = [
    'Trotro (Minibus)', 'Bus (Large)', 'Shared Taxi',
    'Metro Mass Transit', 'STC Bus', 'VIP Bus', 'Other',
  ];
  const amenitiesList = [
    { id: 'air_conditioning', label: 'Air Conditioning', icon: <Thermometer size={16} /> },
    { id: 'charging_ports',   label: 'Charging Ports',   icon: <Hash size={16} /> },
    { id: 'tv',               label: 'TV',               icon: <Tv size={16} /> },
    { id: 'restroom',         label: 'Restroom',         icon: <Building size={16} /> },
    { id: 'luggage_space',    label: 'Luggage Space (Paid)', icon: <Package size={16} /> },
    { id: 'first_aid',        label: 'First Aid Kit',    icon: <Plus size={16} /> },
  ];
  const daysOfWeek = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
  const frequencyOptions = [
    'Every 5 minutes','Every 10 minutes','Every 15 minutes','Every 20 minutes',
    'Every 30 minutes','Hourly','Every 2 hours','Irregular',
  ];

  return (
    <div className="route-info-form">
      <div className="route-info-header">
        <Info size={20} color="#6b21a8" />
        <h3 className="sub-section-title">Route Information</h3>
      </div>

      <div className="input-group">
        <label className="input-label"><Type size={14} /> Description</label>
        <textarea className="input textarea" rows={3}
          placeholder="Describe this route (e.g., 'Connects residential areas to business district')"
          value={routeInfo.description}
          onChange={(e) => onInfoChange('description', e.target.value)} />
      </div>

      <div className="info-grid">
        <div className="info-column">
          <div className="input-group">
            <label className="input-label"><Clock size={14} /> Travel Time (minutes)</label>
            <input className="input" type="number" min="1" max="300" placeholder="e.g., 45"
              value={routeInfo.travelTimeMinutes}
              onChange={(e) => onInfoChange('travelTimeMinutes', e.target.value)} />
          </div>
          <div className="input-group">
            <label className="input-label"><CalendarDays size={14} /> Frequency</label>
            <select className="input" value={routeInfo.frequency}
              onChange={(e) => onInfoChange('frequency', e.target.value)}>
              <option value="">Select frequency</option>
              {frequencyOptions.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
          <div className="input-group">
            <label className="input-label"><AlertCircle size={14} /> Peak Hours</label>
            <input className="input" placeholder="e.g., '7-9 AM, 4-7 PM'"
              value={routeInfo.peakHours}
              onChange={(e) => onInfoChange('peakHours', e.target.value)} />
          </div>
        </div>

        <div className="info-column">
          <div className="input-group">
            <label className="input-label"><Bus size={14} /> Vehicle Type</label>
            <select className="input" value={routeInfo.vehicleType}
              onChange={(e) => onInfoChange('vehicleType', e.target.value)}>
              <option value="">Select vehicle type</option>
              {vehicleTypes.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="input-group">
            <label className="input-label"><Clock size={14} /> Operating Hours</label>
            <div className="operating-hours-container">
              <div className="time-input-group">
                <input className="time-input" type="time" value={routeInfo.operatingHours.start}
                  onChange={(e) => onOperatingHoursChange('start', e.target.value)} />
                <span className="time-separator">to</span>
                <input className="time-input" type="time" value={routeInfo.operatingHours.end}
                  onChange={(e) => onOperatingHoursChange('end', e.target.value)} />
              </div>
              <div className="days-selection">
                <label className="days-label">Operating Days:</label>
                <div className="days-buttons">
                  {daysOfWeek.map(day => (
                    <button key={day} type="button"
                      className={`day-button ${routeInfo.operatingHours.days.includes(day) ? 'day-selected' : ''}`}
                      onClick={() => onOperatingDayToggle(day)}>
                      {day.substring(0, 3)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="input-group">
        <label className="input-label"><Wind size={14} /> Amenities</label>
        <div className="amenities-grid">
          {amenitiesList.map(a => (
            <button key={a.id} type="button"
              className={`amenity-button ${routeInfo.amenities.includes(a.id) ? 'amenity-selected' : ''}`}
              onClick={() => onAmenityToggle(a.id)}>
              {a.icon}<span>{a.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="input-group">
        <label className="input-label"><Info size={14} /> Additional Notes</label>
        <textarea className="input textarea" rows={2}
          placeholder="Any additional information about this route"
          value={routeInfo.notes}
          onChange={(e) => onInfoChange('notes', e.target.value)} />
      </div>
    </div>
  );
};

// ─── Earner Auth Form ─────────────────────────────────────────────────────────
const AuthForm = ({
  earnerId, authEmail, authPassword,
  onEarnerIdChange, onEmailChange, onPasswordChange,
  onLogin, isLoading, onForgotPassword,
}) => {
  const handleSubmit = (e) => { e.preventDefault(); onLogin(); };
  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">GTT Earner Portal</h1>
        <p className="auth-subtitle">Add stops &amp; routes to earn moneyyy</p>
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="input-group">
            <input className="auth-input" type="text" placeholder="Earner ID (e.g. GTT-EARN3R1ID)"
              value={earnerId} onChange={(e) => onEarnerIdChange(e.target.value)} required />
          </div>
          <div className="input-group">
            <input className="auth-input" type="email" placeholder="Email Address"
              value={authEmail} onChange={(e) => onEmailChange(e.target.value)} required />
          </div>
          <div className="input-group">
            <input className="auth-input" type="password" placeholder="Password"
              value={authPassword} onChange={(e) => onPasswordChange(e.target.value)} required />
          </div>
          <button className={`auth-button ${isLoading ? 'auth-button-disabled' : ''}`}
            type="submit" disabled={isLoading}>
            {isLoading ? <div className="spinner"></div> : 'Sign In'}
          </button>
          <button type="button" onClick={onForgotPassword} disabled={isLoading}
            className="forgot-password-button">
            Forgot Password?
          </button>
        </form>
      </div>
    </div>
  );
};

// ─── Manual Route Form (identical structure to AdminHomeScreen) ───────────────
const RouteForm = ({
  newRoute, onRouteNameChange, searchQuery, onSearchChange, searchResults,
  onAddRouteStop, onFareChange, onRemoveStop, onAddRoute, onCancel, isLoading,
  onRouteInfoChange, onAmenityToggle, onOperatingHoursChange, onOperatingDayToggle,
  matchWholeWord, onMatchWholeWordToggle,
}) => (
  <div className="form-container">
    <h2 className="form-title">Create New Route Manually</h2>
    <div className="input-group">
      <input className="input" placeholder="Route Name (e.g., 'Abladjei to Circle via Atomic')"
        value={newRoute.name} onChange={(e) => onRouteNameChange(e.target.value)} />
    </div>
    <h3 className="sub-section-title">Add Stops to Route</h3>
    <div className="search-box-container">
      <div className="search-container">
        <Search size={20} color="#6b7280" />
        <input className="search-input" placeholder="Search for stops..."
          value={searchQuery} onChange={(e) => onSearchChange(e.target.value)} />
        <button className={`match-word-button ${matchWholeWord ? 'match-word-active' : ''}`}
          onClick={onMatchWholeWordToggle}>
          <Type size={16} />{matchWholeWord ? 'Whole Word' : 'Partial'}
        </button>
      </div>
      {searchResults.length > 0 && (
        <div className="suggestions-container">
          {searchResults.map((stop) => (
            <button key={stop.id} className="suggestion-item" onClick={() => onAddRouteStop(stop)}>
              <MapPin size={16} color="#6b21a8" />
              <span className="suggestion-text">{stop.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
    <h3 className="sub-section-title">Route Stops ({newRoute.stops.length})</h3>
    {newRoute.stops.map((stop, index) => (
      <div key={index} className="selected-stop-item">
        <div className="stop-number"><span className="stop-number-text">{index + 1}</span></div>
        <div className="selected-stop-info">
          <span className="selected-stop-name">{stop.name}</span>
          {index < newRoute.stops.length - 1 && (
            <div className="fare-input-container">
              <input className="fare-input" type="number" step="0.01"
                placeholder="Fare to next (GH₵)" value={newRoute.fares[index]}
                onChange={(e) => onFareChange(e.target.value, index)} />
              <input className="distance-input" placeholder="Distance (km)"
                value={newRoute.distances[index]} readOnly />
            </div>
          )}
        </div>
        <button className="remove-button" onClick={() => onRemoveStop(index)}>
          <X size={16} color="#EF4444" />
        </button>
      </div>
    ))}
    {newRoute.stops.length >= 2 && (
      <RouteInfoForm
        routeInfo={{
          description: newRoute.description,
          travelTimeMinutes: newRoute.travelTimeMinutes,
          peakHours: newRoute.peakHours,
          frequency: newRoute.frequency,
          vehicleType: newRoute.vehicleType,
          notes: newRoute.notes,
          amenities: newRoute.amenities,
          operatingHours: newRoute.operatingHours,
        }}
        onInfoChange={onRouteInfoChange}
        onAmenityToggle={onAmenityToggle}
        onOperatingHoursChange={onOperatingHoursChange}
        onOperatingDayToggle={onOperatingDayToggle}
      />
    )}
    <div className="button-row">
      <button className="cancel-button" onClick={onCancel}>Cancel</button>
      <button className={`save-button ${isLoading ? 'save-button-disabled' : ''}`}
        onClick={onAddRoute} disabled={isLoading || newRoute.stops.length < 2}>
        {isLoading ? <div className="spinner"></div> : 'Save Route'}
      </button>
    </div>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const EarnerHomeScreen = () => {

  // ── Auth ──────────────────────────────────────────────────────────────────
  const [user,         setUser]         = useState(null);
  const [earner,       setEarner]       = useState(null);
  const [showAuth,     setShowAuth]     = useState(true);
  const [earnerId,     setEarnerId]     = useState('');
  const [authEmail,    setAuthEmail]    = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [isLoading,    setIsLoading]    = useState(false);
  const [showPhoneEdit, setShowPhoneEdit] = useState(false);
  const [phoneValue,    setPhoneValue]    = useState('');
  const [isSavingPhone, setIsSavingPhone] = useState(false);

  // ── Data ──────────────────────────────────────────────────────────────────
  const [stops,         setStops]         = useState([]);
  const [routes,        setRoutes]        = useState([]);
  const [filteredStops, setFilteredStops] = useState([]);
  const [filteredRoutes,setFilteredRoutes]= useState([]);

  // ── UI / Sheet ────────────────────────────────────────────────────────────
  const [showBottomSheet, setShowBottomSheet] = useState(false);
  const [activeSection,   setActiveSection]   = useState('stops');
  const [sheetWidth,      setSheetWidth]       = useState(620);
  const isResizing  = useRef(false);
  const startX      = useRef(0);
  const startWidth  = useRef(0);

  // ── Stops state ───────────────────────────────────────────────────────────
  const [newStop,            setNewStop]            = useState({ name: '', latitude: null, longitude: null });
  const [editingStop,        setEditingStop]        = useState(null);
  const [isSelectingLocation,setIsSelectingLocation]= useState(false);
  const [stopSearchQuery,    setStopSearchQuery]    = useState('');
  const [matchWholeWord,     setMatchWholeWord]     = useState(false);
  const [isSearchingStops,   setIsSearchingStops]   = useState(false);

  // ── Routes state ──────────────────────────────────────────────────────────
  const emptyRoute = {
    name: '', stops: [], fares: [], distances: [],
    description: '', travelTimeMinutes: '', peakHours: '',
    frequency: '', vehicleType: '', notes: '', amenities: [],
    operatingHours: {
      start: '06:00', end: '22:00',
      days: ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'],
    },
  };
  const [newRoute,          setNewRoute]          = useState(emptyRoute);
  const [editingRoute,      setEditingRoute]       = useState(null);
  const [editRouteData,     setEditRouteData]      = useState({ ...emptyRoute, operatingHours: { start:'06:00', end:'22:00', days:[] } });
  const [searchQuery,       setSearchQuery]        = useState('');
  const [searchResults,     setSearchResults]      = useState([]);
  const [routeSearchQuery,  setRouteSearchQuery]   = useState('');
  const [isSearchingRoutes, setIsSearchingRoutes]  = useState(false);
  const [showCompositeForm, setShowCompositeForm]  = useState(false);
  const [showManualRouteForm, setShowManualRouteForm] = useState(false);
  const [routeNames,        setRouteNames]         = useState({});

  // ── Route creation with map ───────────────────────────────────────────────
  const [routeCreationMode, setRouteCreationMode] = useState(null);
  const [plottedStops,      setPlottedStops]       = useState([]);
  const [editRouteCreationMode, setEditRouteCreationMode] = useState(null);
  const [editPlottedStops,  setEditPlottedStops]   = useState([]);
  const [editSearchQuery,   setEditSearchQuery]    = useState('');
  const [editSearchResults, setEditSearchResults]  = useState([]);
  const userEditedRouteName = useRef(false);

  // ── Map / spotlight ───────────────────────────────────────────────────────
  const [panToLocation,   setPanToLocation]   = useState(null);
  const [showRoutePaths,  setShowRoutePaths]  = useState(true);
  const [hoveredRouteId,  setHoveredRouteId]  = useState(null);
  const [selectedRouteId, setSelectedRouteId] = useState(null);
  const [hoveredStopId,   setHoveredStopId]   = useState(null);
  const [selectedStopId,  setSelectedStopId]  = useState(null);
  const [spotlightStop,   setSpotlightStop]   = useState(null);
  const [spotlightRoute,  setSpotlightRoute]  = useState(null);

  // ── Pagination ────────────────────────────────────────────────────────────
  const PAGE_SIZE = 100;
  const [totalStopsCount,  setTotalStopsCount]  = useState(0);
  const [stopsPage,        setStopsPage]         = useState(0);
  const [totalRoutesCount, setTotalRoutesCount]  = useState(0);
  const [routesPage,       setRoutesPage]        = useState(0);

  // ── Route Selection Modal (used by CompositeRouteForm) ────────────────────
  const [showRouteSelection, setShowRouteSelection] = useState(false);
  const [foundRoutes,        setFoundRoutes]        = useState([]);
  const [selectedRoutes,     setSelectedRoutes]     = useState([]);
  const [currentPage,        setCurrentPage]        = useState(0);
  const [routesPerPage,      setRoutesPerPage]      = useState(20);
  const [hasMoreRoutes,      setHasMoreRoutes]      = useState(false);

  // ─────────────────────────────────────────────────────────────────────────
  // RESIZE HANDLER (identical to AdminHomeScreen)
  // ─────────────────────────────────────────────────────────────────────────
  const handleResizeMouseDown = useCallback((e) => {
    isResizing.current  = true;
    startX.current      = e.clientX;
    startWidth.current  = sheetWidth;
    document.body.style.cursor     = 'col-resize';
    document.body.style.userSelect = 'none';

    const onMouseMove = (e) => {
      if (!isResizing.current) return;
      const delta    = startX.current - e.clientX;
      const newWidth = startWidth.current + delta;
      const minWidth = 320;
      const maxWidth = Math.floor(window.innerWidth * 0.5);
      setSheetWidth(Math.min(maxWidth, Math.max(minWidth, newWidth)));
    };
    const onMouseUp = () => {
      isResizing.current             = false;
      document.body.style.cursor     = '';
      document.body.style.userSelect = '';
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup',   onMouseUp);
    };
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup',   onMouseUp);
  }, [sheetWidth]);

  const toggleBottomSheet = (forceState) => {
    const next = forceState !== undefined ? forceState : !showBottomSheet;
    setShowBottomSheet(next);
    if (!next) {
      if (editingRoute) setEditingRoute(null);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // BOOTSTRAP
  // ─────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    const storedUser   = localStorage.getItem('earnerUser');
    const storedEarner = localStorage.getItem('earnerData');
    if (storedUser && storedEarner) {
      const parsedUser   = JSON.parse(storedUser);
      const parsedEarner = JSON.parse(storedEarner);
      setUser(parsedUser);
      setEarner(parsedEarner);
      setShowAuth(false);
      loadStops(0, parsedUser, parsedEarner);
      loadRoutes(0, parsedUser, parsedEarner);
      // Always re-fetch earner row on load — triggers may have updated counters
      // since the localStorage snapshot was saved
      supabase
        .from('earners')
        .select('*')
        .eq('earner_id', parsedEarner.earner_id)
        .single()
        .then(({ data }) => {
          if (data) {
            setEarner(data);
            localStorage.setItem('earnerData', JSON.stringify(data));
          }
        })
        .catch(() => {});
    }
  }, []);

  // ── Stop search effect ────────────────────────────────────────────────────
  useEffect(() => {
    if (!stopSearchQuery.trim()) {
      setFilteredStops(stops);
      setSpotlightStop(null);
      return;
    }
    setIsSearchingStops(true);
    const t = setTimeout(async () => {
      try {
        const { data } = await supabase
          .from('stops')
          .select('*')
          .eq('earner_id', earner?.earner_id)
          .ilike('name', `%${stopSearchQuery}%`)
          .order('name')
          .limit(200);
        setFilteredStops(data || []);
      } catch { setFilteredStops([]); }
      finally { setIsSearchingStops(false); }
    }, 350);
    return () => clearTimeout(t);
  }, [stopSearchQuery, stops]);

  // ── Route search effect ───────────────────────────────────────────────────
  useEffect(() => {
    if (!user) return;
    if (!routeSearchQuery.trim()) {
      setFilteredRoutes(routes);
      setSpotlightRoute(null);
      return;
    }
    setIsSearchingRoutes(true);
    const t = setTimeout(async () => {
      try {
        const { data } = await supabase
          .from('routes')
          .select(`*, route_stops(stop_order,fare_to_next,distance_to_next,stops(*)), route_compositions!route_compositions_composite_fkey(composition_order,sub_route_id)`)
          .eq('earner_id', earner?.earner_id)
          .ilike('name', `%${routeSearchQuery}%`)
          .order('created_at', { ascending: false })
          .limit(200);
        setFilteredRoutes(data || []);
      } catch { setFilteredRoutes([]); }
      finally { setIsSearchingRoutes(false); }
    }, 350);
    return () => clearTimeout(t);
  }, [routeSearchQuery, user, routes]);

  // ── Route stop search effect ──────────────────────────────────────────────
  useEffect(() => {
    if (searchQuery.length > 0) {
      searchStopsFromDB(searchQuery, 5).then(setSearchResults);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  // ── Auto-calc distances ───────────────────────────────────────────────────
  useEffect(() => {
    if (newRoute.stops.length > 1) calculateRouteDistances();
  }, [newRoute.stops]);

  useEffect(() => {
    if (editingRoute && editRouteData.stops.length > 1) calculateEditRouteDistances();
  }, [editRouteData.stops, editingRoute]);

  // ── Auto-fill route name ──────────────────────────────────────────────────
  useEffect(() => {
    if (userEditedRouteName.current) return;
    if (plottedStops.length < 2) return;
    const first = plottedStops[0];
    const last  = plottedStops[plottedStops.length - 1];
    const firstName = first.isNew ? (first.tempName?.trim() || null) : first.name;
    const lastName  = last.isNew  ? (last.tempName?.trim()  || null) : last.name;
    if (firstName && lastName) {
      setNewRoute(prev => ({ ...prev, name: `${firstName} to ${lastName}` }));
    }
  }, [plottedStops]);

  // ─────────────────────────────────────────────────────────────────────────
  // DATA HELPERS
  // ─────────────────────────────────────────────────────────────────────────
  const searchStopsFromDB = async (query, limit = 5) => {
    if (!query || query.length < 1) return [];
    try {
      const { data } = await supabase.from('stops').select('*')
        .ilike('name', `%${query}%`).order('name').limit(limit);
      return data || [];
    } catch { return []; }
  };

  const loadStops = async (page = 0, currentUser = user, currentEarner = earner) => {
    const eid = currentEarner?.earner_id;
    if (!eid) return;
    setIsLoading(true);
    try {
      const { count } = await supabase.from('stops')
        .select('*', { count: 'exact', head: true })
        .eq('earner_id', eid);
      setTotalStopsCount(count || 0);

      const { data, error } = await supabase.from('stops').select('*')
        .eq('earner_id', eid)
        .order('name')
        .range(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE - 1);
      if (error) throw error;
      setStops(data || []);
      setStopsPage(page);
      if (!stopSearchQuery.trim()) setFilteredStops(data || []);
    } catch (err) {
      alert('Failed to load stops: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Load only routes created by this earner
  const loadRoutes = async (page = 0, currentUser = user, currentEarner = earner) => {
    const eid = currentEarner?.earner_id;
    if (!eid) return;
    try {
      const { count } = await supabase.from('routes')
        .select('*', { count: 'exact', head: true })
        .eq('earner_id', eid);
      setTotalRoutesCount(count || 0);

      const { data, error } = await supabase.from('routes')
        .select(`*, route_stops(stop_order,fare_to_next,distance_to_next,stops(*)), route_compositions!route_compositions_composite_fkey(composition_order,sub_route_id)`)
        .eq('earner_id', eid)
        .order('created_at', { ascending: false })
        .range(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE - 1);
      if (error) throw error;
      setRoutes(data || []);
      setRoutesPage(page);
      if (!routeSearchQuery.trim()) setFilteredRoutes(data || []);
    } catch (err) {
      console.error('Error loading routes:', err);
    }
  };

  const formatTravelTime = (minutes) => {
    if (!minutes || isNaN(minutes)) return null;
    const m = parseInt(minutes, 10);
    const h = Math.floor(m / 60);
    const rem = m % 60;
    if (h === 0) return `${rem}m`;
    if (rem === 0) return `${h}h`;
    return `${h}h ${rem}m`;
  };

  const getRouteMidpoint = (route) => {
    const rs = (route.route_stops || []).filter(r => r.stops?.latitude);
    if (!rs.length) return null;
    const lat = rs.reduce((s, r) => s + r.stops.latitude,  0) / rs.length;
    const lng = rs.reduce((s, r) => s + r.stops.longitude, 0) / rs.length;
    return { lat, lng };
  };

  // ─────────────────────────────────────────────────────────────────────────
  // AUTH
  // ─────────────────────────────────────────────────────────────────────────
  const handleEarnerLogin = async () => {
    if (!earnerId.trim() || !authEmail.trim() || !authPassword.trim()) {
      alert('Please enter your Earner ID, email, and password.');
      return;
    }
    setIsLoading(true);
    try {
      // 1. Sign in via Supabase Auth first — this establishes the session
      //    so that subsequent queries run with the user's RLS context.
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: authEmail.trim(),
        password: authPassword,
      });
      if (authError) throw authError;

      // 2. Now that we're authenticated, query the earners table.
      //    RLS will allow this because the user session is active.
      const { data: earnerRow, error: earnerError } = await supabase
        .from('earners')
        .select('*')
        .ilike('earner_id', earnerId.trim())   // case-insensitive match
        .single();

      if (earnerError || !earnerRow) {
        // Sign back out — wrong earner ID for this account
        await supabase.auth.signOut();
        throw new Error('Earner ID not found. Please check your ID and try again.');
      }

      // 3. Confirm the earner record belongs to the signed-in email
      if (earnerRow.email.toLowerCase() !== authEmail.trim().toLowerCase()) {
        await supabase.auth.signOut();
        throw new Error('The email address does not match this Earner ID.');
      }

      // 4. All checks passed — store session
      setUser(authData.user);
      setEarner(earnerRow);
      setShowAuth(false);
      localStorage.setItem('earnerUser', JSON.stringify(authData.user));
      localStorage.setItem('earnerData', JSON.stringify(earnerRow));
      loadStops(0, authData.user, earnerRow);
      loadRoutes(0, authData.user, earnerRow);
      // Fetch fresh earner row so DB-computed counters are shown immediately
      supabase
        .from('earners')
        .select('*')
        .eq('earner_id', earnerRow.earner_id)
        .single()
        .then(({ data }) => {
          if (data) {
            setEarner(data);
            localStorage.setItem('earnerData', JSON.stringify(data));
          }
        })
        .catch(() => {});
    } catch (err) {
      alert(err.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!authEmail.trim()) { alert('Please enter your email address first.'); return; }
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(authEmail.trim(), {
        redirectTo: 'https://ghanatrotrotransit.netlify.app/reset-password',
      });
      if (error) throw error;
      alert(`Password reset email sent to ${authEmail}.`);
    } catch (err) {
      alert('Failed to send reset email: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Re-fetch the earner row so counters in the panel stay in sync
  const refreshEarner = async (earnerIdParam = null) => {
    const eid = earnerIdParam ?? earner?.earner_id;
    if (!eid) return;
    try {
      const { data } = await supabase
        .from('earners')
        .select('*')
        .eq('earner_id', eid)
        .single();
      if (data) {
        setEarner(data);
        localStorage.setItem('earnerData', JSON.stringify(data));
      }
    } catch { /* non-critical */ }
  };

  const handleUpdatePhone = async () => {
    if (!phoneValue.trim()) { alert('Please enter a phone number.'); return; }
    setIsSavingPhone(true);
    try {
      const { error } = await supabase
        .from('earners')
        .update({ phone: phoneValue.trim() })
        .eq('earner_id', earner.earner_id);
      if (error) throw error;
      const updated = { ...earner, phone: phoneValue.trim() };
      setEarner(updated);
      localStorage.setItem('earnerData', JSON.stringify(updated));
      setShowPhoneEdit(false);
      alert('Phone number updated successfully!');
    } catch (err) {
      alert('Failed to update phone: ' + err.message);
    } finally {
      setIsSavingPhone(false);
    }
  };

  const handleLogout = async () => {
    if (!window.confirm('Are you sure you want to sign out?')) return;
    try {
      await supabase.auth.signOut();
      setUser(null); setEarner(null);
      setShowAuth(true);
      setStops([]); setRoutes([]);
      setShowBottomSheet(false);
      localStorage.removeItem('earnerUser');
      localStorage.removeItem('earnerData');
    } catch (err) {
      alert('Failed to sign out: ' + err.message);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // STOP HANDLERS
  // ─────────────────────────────────────────────────────────────────────────
  // DB-backed duplicate check — searches the entire stops table, not just the current page.
  const checkDuplicateStop = async (name, lat, lng, excludeId = null) => {
    const COORD_THRESHOLD = 0.0005; // ~55 m

    // Check by name (case-insensitive, global)
    let nameQuery = supabase
      .from('stops')
      .select('id, name')
      .ilike('name', name.trim());
    if (excludeId) nameQuery = nameQuery.neq('id', excludeId);
    const { data: nameData } = await nameQuery.limit(1);

    // Check by coordinates (global). Supabase doesn't support ABS on columns in
    // the JS client filter, so pull a small bounding-box window and filter in JS.
    let coordQuery = supabase
      .from('stops')
      .select('id, name, latitude, longitude')
      .gte('latitude',  lat - COORD_THRESHOLD)
      .lte('latitude',  lat + COORD_THRESHOLD)
      .gte('longitude', lng - COORD_THRESHOLD)
      .lte('longitude', lng + COORD_THRESHOLD);
    if (excludeId) coordQuery = coordQuery.neq('id', excludeId);
    const { data: coordData } = await coordQuery.limit(10);

    const byName   = nameData  || [];
    const byCoords = (coordData || []).filter(s =>
      Math.abs(s.latitude - lat) < COORD_THRESHOLD &&
      Math.abs(s.longitude - lng) < COORD_THRESHOLD
    );

    return { byName, byCoords };
  };

  const handleMapPress = (lat, lng) => {
    if (isSelectingLocation) {
      if (editingStop) {
        setEditingStop(prev => ({ ...prev, latitude: lat, longitude: lng }));
      } else {
        setNewStop(prev => ({ ...prev, latitude: lat, longitude: lng }));
      }
      setIsSelectingLocation(false);
      setActiveSection('stops');
      setShowBottomSheet(true);
    }
  };

  const handleLatChange = (val) => {
    const n = parseFloat(val);
    setNewStop(prev => ({ ...prev, latitude: isNaN(n) ? null : n }));
  };

  const handleLngChange = (val) => {
    const n = parseFloat(val);
    setNewStop(prev => ({ ...prev, longitude: isNaN(n) ? null : n }));
  };

  const handleAddStop = async () => {
    if (!newStop.name || !newStop.latitude || !newStop.longitude) {
      alert('Please fill all fields and select a location on the map.');
      return;
    }
    setIsLoading(true);
    try {
      const { byName, byCoords } = await checkDuplicateStop(newStop.name, newStop.latitude, newStop.longitude);
      if (byName.length > 0) {
        alert(`Cannot add stop — a stop named "${byName[0].name}" already exists in the database.\nPlease use a different name.`);
        return;
      }
      if (byCoords.length > 0) {
        alert(`Cannot add stop — "${byCoords[0].name}" already exists within ~55 m of this location.\nPlease choose a different position.`);
        return;
      }
      const { error } = await supabase.from('stops')
        .insert([{ name: newStop.name, latitude: newStop.latitude, longitude: newStop.longitude, earner_id: earner.earner_id }]);
      if (error) throw error;
      alert('Stop added successfully!');
      setNewStop({ name: '', latitude: null, longitude: null });
      await loadStops();
      await refreshEarner();
    } catch (err) {
      alert('Failed to add stop: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditStop = (stop) => {
    setEditingStop(stop);
    setIsSelectingLocation(true);
    setShowBottomSheet(false);
  };

  const handleUpdateStop = async () => {
    if (!editingStop) return;
    if (!editingStop.name || !editingStop.latitude || !editingStop.longitude) {
      alert('Please fill all fields and select a location.');
      return;
    }
    setIsLoading(true);
    try {
      const { byName, byCoords } = await checkDuplicateStop(editingStop.name, editingStop.latitude, editingStop.longitude, editingStop.id);
      if (byName.length > 0) {
        alert(`Cannot update stop — "${byName[0].name}" already exists in the database.\nPlease choose a different name.`);
        return;
      }
      if (byCoords.length > 0) {
        alert(`Cannot update stop — "${byCoords[0].name}" already exists within ~55 m.\nPlease choose a different location.`);
        return;
      }
      const { error } = await supabase.from('stops')
        .update({ name: editingStop.name, latitude: editingStop.latitude, longitude: editingStop.longitude })
        .eq('id', editingStop.id)
        .eq('earner_id', earner.earner_id);
      if (error) throw error;
      alert('Stop updated successfully!');
      setEditingStop(null);
      setIsSelectingLocation(false);
      loadStops();
    } catch (err) {
      alert('Failed to update stop: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteStop = async (stopId) => {
    if (!window.confirm('Delete this stop? This action cannot be undone.')) return;
    try {
      const { error } = await supabase.from('stops').delete().eq('id', stopId).eq('earner_id', earner.earner_id);
      if (error) throw error;
      alert('Stop deleted successfully!');
      await loadStops();
      await refreshEarner();
    } catch (err) {
      alert('Failed to delete stop: ' + err.message);
    }
  };

  const handleStopClickFromMap = (stop) => {
    setSelectedStopId(stop.id);
    setPanToLocation({ lat: stop.latitude, lng: stop.longitude });
  };

  // ─────────────────────────────────────────────────────────────────────────
  // ROUTE HELPERS
  // ─────────────────────────────────────────────────────────────────────────
  const calculateRouteDistances = () => {
    const dists = [...newRoute.distances];
    for (let i = 0; i < newRoute.stops.length - 1; i++) {
      dists[i] = calculateDistance(
        newRoute.stops[i].latitude, newRoute.stops[i].longitude,
        newRoute.stops[i+1].latitude, newRoute.stops[i+1].longitude
      ).toFixed(2);
    }
    setNewRoute(prev => ({ ...prev, distances: dists }));
  };

  const calculateEditRouteDistances = () => {
    const dists = [...editRouteData.distances];
    for (let i = 0; i < editRouteData.stops.length - 1; i++) {
      dists[i] = calculateDistance(
        editRouteData.stops[i].latitude, editRouteData.stops[i].longitude,
        editRouteData.stops[i+1].latitude, editRouteData.stops[i+1].longitude
      ).toFixed(2);
    }
    setEditRouteData(prev => ({ ...prev, distances: dists }));
  };

  // DB-backed duplicate check — searches the entire routes table globally.
  // For routes: reject if the same name exists OR if the same ordered stop sequence exists
  // OR if the first→last stop pair already appears in any direction in another route.
  const checkDuplicateRoute = async (name, stopIds, excludeId = null) => {
    // 1. Name check (global, case-insensitive)
    let nameQuery = supabase
      .from('routes')
      .select('id, name')
      .ilike('name', name.trim());
    if (excludeId) nameQuery = nameQuery.neq('id', excludeId);
    const { data: nameData } = await nameQuery.limit(1);
    const byName = nameData || [];

    // 2. Stop-sequence check — only meaningful when all stop IDs are real (not temp)
    const realIds = stopIds.filter(Boolean);
    if (realIds.length < 2) return { byName, byStops: [] };

    const firstId = realIds[0];
    const lastId  = realIds[realIds.length - 1];

    // Find all routes that contain both the first and last stop
    // by fetching route_stops for those stop IDs, then cross-matching
    const { data: rsData } = await supabase
      .from('route_stops')
      .select('route_id, stop_id, stop_order')
      .in('stop_id', [firstId, lastId]);

    if (!rsData || rsData.length === 0) return { byName, byStops: [] };

    // Group by route_id
    const byRoute = {};
    rsData.forEach(rs => {
      if (!byRoute[rs.route_id]) byRoute[rs.route_id] = [];
      byRoute[rs.route_id].push(rs);
    });

    // A route is a duplicate if it contains both firstId and lastId
    // (in any order — covers A→B and B→A both being rejected)
    const conflictingRouteIds = Object.entries(byRoute)
      .filter(([routeId, entries]) => {
        if (excludeId && routeId === excludeId) return false;
        const stopIdsInRoute = entries.map(e => e.stop_id);
        return stopIdsInRoute.includes(firstId) && stopIdsInRoute.includes(lastId);
      })
      .map(([routeId]) => routeId);

    if (conflictingRouteIds.length === 0) return { byName, byStops: [] };

    // Fetch the route names for the error message
    const { data: conflictRoutes } = await supabase
      .from('routes')
      .select('id, name')
      .in('id', conflictingRouteIds)
      .limit(1);

    return { byName, byStops: conflictRoutes || [] };
  };

  const saveRouteToDatabase = async (routeObj, routeName, extras = {}) => {
    const totalFare     = routeObj.fares.reduce((s,f) => s+(parseFloat(f)||0), 0);
    const totalDistance = routeObj.distances.reduce((s,d) => s+(parseFloat(d)||0), 0);

    const { data: routeData, error: routeError } = await supabase.from('routes')
      .insert([{
        name:                (routeName||'').trim(),
        total_fare:          totalFare,
        total_distance:      totalDistance,
        approved:            false,       // earner routes need admin approval
        created_by:          user.id,
        earner_id:           earner.earner_id,
        description:         extras.description         || null,
        travel_time_minutes: extras.travelTimeMinutes   ? parseInt(extras.travelTimeMinutes, 10) : null,
        peak_hours:          extras.peakHours           || null,
        frequency:           extras.frequency           || null,
        vehicle_type:        extras.vehicleType         || null,
        notes:               extras.notes               || null,
        amenities:           (extras.amenities||[]).length > 0 ? extras.amenities : null,
        operating_hours:     extras.operatingHours      || null,
        is_composite:        false,
      }]).select();
    if (routeError) throw routeError;

    const savedId = routeData[0].id;
    const { error: stopError } = await supabase.from('route_stops').insert(
      routeObj.stops.map((stop, i) => ({
        route_id:         savedId,
        stop_id:          stop.id,
        stop_order:       i,
        fare_to_next:     i < routeObj.stops.length-1 ? (parseFloat(routeObj.fares[i])||0) : null,
        distance_to_next: i < routeObj.stops.length-1 ? (parseFloat(routeObj.distances[i])||0) : null,
      }))
    );
    if (stopError) throw stopError;
    return savedId;
  };

  // ─────────────────────────────────────────────────────────────────────────
  // ROUTE CREATION — MANUAL (form)
  // ─────────────────────────────────────────────────────────────────────────
  const handleAddRouteStop = (stop) => {
    setNewRoute(prev => ({
      ...prev,
      stops:     [...prev.stops, stop],
      fares:     [...prev.fares, ''],
      distances: [...prev.distances, ''],
    }));
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleRemoveRouteStop = (index) => {
    setNewRoute(prev => ({
      ...prev,
      stops:     prev.stops.filter((_,i) => i !== index),
      fares:     prev.fares.filter((_,i) => i !== index),
      distances: prev.distances.filter((_,i) => i !== index),
    }));
  };

  const handleRouteStopSearch = async (query) => {
    setSearchQuery(query);
    if (query.length > 0) {
      const filtered = await searchStopsFromDB(query, 5);
      setSearchResults(filtered);
    } else {
      setSearchResults([]);
    }
  };

  const handleMatchWholeWordToggle = async () => {
    setMatchWholeWord(prev => !prev);
    if (searchQuery) {
      const filtered = await searchStopsFromDB(searchQuery, 5);
      setSearchResults(filtered);
    }
  };

  const handleAddRoute = async () => {
    if (!newRoute.name.trim()) { alert('Please enter a route name.'); return; }
    if (newRoute.stops.length < 2) { alert('Route must have at least 2 stops.'); return; }

    const missingFares = newRoute.fares.slice(0, newRoute.stops.length-1)
      .reduce((acc, f, i) => { if (!f || isNaN(parseFloat(f))) acc.push(i+1); return acc; }, []);
    if (missingFares.length > 0) {
      alert(`Please enter valid fares for segments: ${missingFares.join(', ')}`);
      return;
    }

    const { byName, byStops } = await checkDuplicateRoute(newRoute.name, newRoute.stops.map(s => s.id));
    if (byName.length > 0) {
      alert(`Cannot create route — "${byName[0].name}" already exists.\nPlease choose a different name.`);
      return;
    }
    if (byStops.length > 0) {
      const first = newRoute.stops[0].name;
      const last  = newRoute.stops[newRoute.stops.length - 1].name;
      alert(`Cannot create route — a route between "${first}" and "${last}" already exists: "${byStops[0].name}".\nRoutes sharing the same start and end points are not allowed.`);
      return;
    }

    setIsLoading(true);
    try {
      await saveRouteToDatabase(
        { stops: newRoute.stops, fares: newRoute.fares, distances: newRoute.distances },
        newRoute.name,
        {
          description: newRoute.description, travelTimeMinutes: newRoute.travelTimeMinutes,
          peakHours: newRoute.peakHours, frequency: newRoute.frequency,
          vehicleType: newRoute.vehicleType, notes: newRoute.notes,
          amenities: newRoute.amenities, operatingHours: newRoute.operatingHours,
        }
      );
      alert('Route submitted for admin review!');
      setNewRoute(emptyRoute);
      await loadRoutes();
      await refreshEarner();
    } catch (err) {
      alert('Failed to save route: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // ROUTE CREATION — MAP PLOTTING
  // ─────────────────────────────────────────────────────────────────────────
  const recalcPlottedDistances = (pts) =>
    pts.map((pt, i) => {
      if (i >= pts.length - 1) return { ...pt, distanceToNext: null };
      return { ...pt, distanceToNext: calculateDistance(pt.latitude, pt.longitude, pts[i+1].latitude, pts[i+1].longitude).toFixed(2) };
    });

  const handleStartRouteCreation = (mode) => {
    setRouteCreationMode(mode);
    setPlottedStops([]);
    userEditedRouteName.current = false;
  };

  const handleMapPressForRoute = (lat, lng) => {
    if (routeCreationMode === 'plotting') {
      const existing = stops.find(s => Math.abs(s.latitude-lat)<0.001 && Math.abs(s.longitude-lng)<0.001);
      const ns = existing
        ? { ...existing, isNew: false, fareToNext: '', distanceToNext: null }
        : { id:`temp-${Date.now()}`, name:'', latitude:lat, longitude:lng, isNew:true, tempName:'', fareToNext:'', distanceToNext:null };
      const updated = recalcPlottedDistances([...plottedStops, ns]);
      setPlottedStops(updated);
      setNewRoute(prev => ({
        ...prev,
        stops:     [...prev.stops, { id:ns.id, name:ns.name||'', latitude:lat, longitude:lng }],
        fares:     [...prev.fares, ''],
        distances: updated.slice(0,-1).map(s => s.distanceToNext ?? '0.00'),
      }));
    } else if (routeCreationMode === 'selecting') {
      let nearest=null, minD=Infinity;
      stops.forEach(s => {
        const d = calculateDistance(lat, lng, s.latitude, s.longitude);
        if (d < 1 && d < minD) { minD=d; nearest=s; }
      });
      if (nearest) {
        if (!plottedStops.some(s => !s.isNew && s.id === nearest.id)) {
          const updated = recalcPlottedDistances([...plottedStops, { ...nearest, isNew:false, fareToNext:'', distanceToNext:null }]);
          setPlottedStops(updated);
          setNewRoute(prev => ({
            ...prev,
            stops:     [...prev.stops, nearest],
            fares:     [...prev.fares, ''],
            distances: updated.slice(0,-1).map(s => s.distanceToNext ?? '0.00'),
          }));
        } else {
          alert(`"${nearest.name}" is already in the route.`);
        }
      } else {
        alert('No existing stop found nearby. Switch to "Plot Stops on Map" mode to add new stops.');
      }
    }
  };

  const handleRemovePlottedStop = (index) => {
    const updated = recalcPlottedDistances(plottedStops.filter((_,i) => i !== index));
    setPlottedStops(updated);
    setNewRoute(prev => ({
      ...prev,
      stops:     prev.stops.filter((_,i) => i !== index),
      fares:     prev.fares.filter((_,i) => i !== index),
      distances: updated.slice(0,-1).map(s => s.distanceToNext||'0.00'),
    }));
  };

  const handleNamePlottedStop = (index, name) => {
    setPlottedStops(prev => {
      const u = [...prev];
      u[index] = { ...u[index], tempName: name, name: name || `Stop ${index+1}` };
      return u;
    });
  };

  const handleAddFare = (index, fare) => {
    setPlottedStops(prev => {
      const u = [...prev];
      if (index < u.length-1) {
        u[index] = { ...u[index], fareToNext: fare };
        setNewRoute(r => { const f=[...r.fares]; f[index]=fare; return {...r,fares:f}; });
      }
      return u;
    });
  };

  const handleSavePlottedRoute = async () => {
    if (plottedStops.length < 2) { alert('Route must have at least 2 stops.'); return; }
    const unnamed = plottedStops.filter(s => s.isNew && (!s.tempName || !s.tempName.trim()));
    if (unnamed.length > 0) { alert('Please name all new stops.'); return; }

    const missingFares = [];
    plottedStops.slice(0,-1).forEach((s, i) => {
      if (s.fareToNext === '' || s.fareToNext == null || isNaN(parseFloat(s.fareToNext))) missingFares.push(i+1);
    });
    if (missingFares.length > 0) { alert(`Please enter fares for segments: ${missingFares.join(', ')}`); return; }
    if (!newRoute.name?.trim()) { alert('Please enter a route name.'); return; }

    // Check for duplicate new stops (name + coordinates) against the global DB
    setIsLoading(true);
    const newStopsList = plottedStops.filter(s => s.isNew);
    for (const ns of newStopsList) {
      try {
        const { byName, byCoords } = await checkDuplicateStop(ns.tempName, ns.latitude, ns.longitude);
        if (byName.length > 0) {
          alert(`Cannot save route — a stop named "${byName[0].name}" already exists.\nPlease rename the new stop "${ns.tempName}".`);
          setIsLoading(false);
          return;
        }
        if (byCoords.length > 0) {
          alert(`Cannot save route — "${byCoords[0].name}" already exists within ~55 m of the new stop "${ns.tempName}".\nPlease reposition it.`);
          setIsLoading(false);
          return;
        }
      } catch (err) {
        alert('Failed to check for duplicate stops: ' + err.message);
        setIsLoading(false);
        return;
      }
    }
    setIsLoading(false);

    const { byName, byStops } = await checkDuplicateRoute(newRoute.name, plottedStops.map(s => s.isNew ? null : s.id));
    if (byName.length > 0) { alert(`Cannot create route — "${byName[0].name}" already exists.`); return; }
    if (byStops.length > 0) {
      const existingIds = plottedStops.filter(s => !s.isNew).map(s => s.id);
      const first = plottedStops.find(s => !s.isNew)?.name || plottedStops[0].tempName;
      const last  = [...plottedStops].reverse().find(s => !s.isNew)?.name || plottedStops[plottedStops.length - 1].tempName;
      alert(`Cannot create route — a route between "${first}" and "${last}" already exists: "${byStops[0].name}".\nRoutes sharing the same start and end points are not allowed.`);
      return;
    }

    setIsLoading(true);
    try {
      // Save new stops first
      const newStopsToSave = plottedStops.filter(s => s.isNew);
      let savedStopsPool = [...stops];
      if (newStopsToSave.length > 0) {
        const { data: inserted, error } = await supabase.from('stops')
          .insert(newStopsToSave.map(s => ({ name:s.tempName, latitude:s.latitude, longitude:s.longitude, earner_id: earner.earner_id })))
          .select();
        if (error) throw error;
        savedStopsPool = [...savedStopsPool, ...inserted];
        setStops(savedStopsPool);
      }
      const finalStops = plottedStops.map(ps => {
        if (!ps.isNew) return ps;
        const saved = savedStopsPool.find(s =>
          Math.abs(s.latitude-ps.latitude)<0.001 && Math.abs(s.longitude-ps.longitude)<0.001 && s.name===ps.tempName
        );
        if (!saved) throw new Error(`Could not find saved record for "${ps.tempName}"`);
        return saved;
      });

      await saveRouteToDatabase(
        { stops:finalStops, fares:plottedStops.slice(0,-1).map(s=>parseFloat(s.fareToNext)), distances:plottedStops.slice(0,-1).map(s=>parseFloat(s.distanceToNext)||0) },
        newRoute.name,
        { description:newRoute.description, travelTimeMinutes:newRoute.travelTimeMinutes, peakHours:newRoute.peakHours, frequency:newRoute.frequency, vehicleType:newRoute.vehicleType, notes:newRoute.notes, amenities:newRoute.amenities, operatingHours:newRoute.operatingHours }
      );

      alert('Route submitted for admin review!');
      setRouteCreationMode(null);
      setPlottedStops([]);
      setNewRoute(emptyRoute);
      userEditedRouteName.current = false;
      await loadRoutes();
      await loadStops();
      await refreshEarner();
    } catch (err) {
      alert('Failed to save route: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // COMPOSITE ROUTE
  // ─────────────────────────────────────────────────────────────────────────
  const handleSaveCompositeRoute = async ({ routeName, selectedRoutes: selRoutes, mergedPreview, routeInfo }) => {
    setIsLoading(true);
    try {
      const { byName } = await checkDuplicateRoute(routeName, []);
      if (byName.length > 0) {
        alert(`Cannot create route — "${byName[0].name}" already exists.\nPlease choose a different name.`);
        setIsLoading(false);
        return;
      }
      const totalFare     = mergedPreview.reduce((s,r) => s+(parseFloat(r.fare_to_next)||0), 0);
      const totalDistance = mergedPreview.reduce((s,r) => s+(parseFloat(r.distance_to_next)||0), 0);

      const { data: routeData, error: routeError } = await supabase.from('routes')
        .insert([{
          name: routeName.trim(), total_fare: totalFare, total_distance: totalDistance,
          is_composite: true, approved: false, created_by: user.id, earner_id: earner.earner_id,
          description:         routeInfo.description        || null,
          travel_time_minutes: routeInfo.travelTimeMinutes  ? parseInt(routeInfo.travelTimeMinutes,10) : null,
          peak_hours:          routeInfo.peakHours          || null,
          frequency:           routeInfo.frequency          || null,
          vehicle_type:        routeInfo.vehicleType        || null,
          notes:               routeInfo.notes              || null,
          amenities:           (routeInfo.amenities||[]).length > 0 ? routeInfo.amenities : null,
          operating_hours:     routeInfo.operatingHours,
        }]).select();
      if (routeError) throw routeError;
      const compositeId = routeData[0].id;

      const { error: compError } = await supabase.from('route_compositions')
        .insert(selRoutes.map((r,i) => ({ composite_route_id:compositeId, sub_route_id:r.id, composition_order:i+1 })));
      if (compError) throw compError;

      const { error: stopsError } = await supabase.from('route_stops')
        .insert(mergedPreview.map((stop, index) => ({
          route_id: compositeId, stop_id: stop.stop_id, stop_order: index,
          fare_to_next:     index < mergedPreview.length-1 ? (parseFloat(stop.fare_to_next)??null) : null,
          distance_to_next: index < mergedPreview.length-1 ? (parseFloat(stop.distance_to_next)??null) : null,
        })));
      if (stopsError) throw stopsError;

      alert(`Composite route "${routeName}" submitted for admin review!\n\nIt spans ${mergedPreview.length} stops across ${selRoutes.length} sub-routes.`);
      setShowCompositeForm(false);
      await loadRoutes();
      await refreshEarner();
    } catch (err) {
      alert('Failed to create composite route: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // DELETE ROUTE
  // ─────────────────────────────────────────────────────────────────────────
  const handleDeleteRoute = async (routeId) => {
    if (!window.confirm('Delete this route? This action cannot be undone.')) return;
    setIsLoading(true);
    try {
      await supabase.from('route_stops').delete().eq('route_id', routeId);
      await supabase.from('route_compositions').delete().eq('composite_route_id', routeId);
      const { error } = await supabase.from('routes').delete().eq('id', routeId).eq('earner_id', earner.earner_id);
      if (error) throw error;
      alert('Route deleted successfully!');
      await loadRoutes();
      await refreshEarner();
    } catch (err) {
      alert('Failed to delete route: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // EDIT SEARCH (for RouteCreationWithMap / RouteEditWithMap)
  // ─────────────────────────────────────────────────────────────────────────
  const handleEditSearchChange = async (query) => {
    setEditSearchQuery(query);
    if (query.length > 0) {
      const filtered = await searchStopsFromDB(query, 5);
      setEditSearchResults(filtered);
    } else {
      setEditSearchResults([]);
    }
  };

  const handleEditAddStopFromSearch = (stop) => {
    const updated = recalcPlottedDistances([
      ...editPlottedStops,
      { ...stop, isNew:false, fareToNext:'', distanceToNext:null }
    ]);
    setEditPlottedStops(updated);
    setEditRouteData(prev => ({
      ...prev,
      stops:     [...prev.stops, stop],
      fares:     [...prev.fares, ''],
      distances: updated.slice(0,-1).map(s => s.distanceToNext||'0.00'),
    }));
    setEditSearchQuery('');
    setEditSearchResults([]);
  };

  const handleEditMapPressForRoute = (lat, lng) => {
    if (editRouteCreationMode === 'plotting') {
      const existing = stops.find(s => Math.abs(s.latitude-lat)<0.001 && Math.abs(s.longitude-lng)<0.001);
      const ns = existing
        ? { ...existing, isNew:false, fareToNext:'', distanceToNext:null }
        : { id:`temp-${Date.now()}`, name:'', latitude:lat, longitude:lng, isNew:true, tempName:'', fareToNext:'', distanceToNext:null };
      const updated = recalcPlottedDistances([...editPlottedStops, ns]);
      setEditPlottedStops(updated);
      setEditRouteData(prev => ({
        ...prev,
        stops:     [...prev.stops, { id:ns.id, name:ns.name||'', latitude:lat, longitude:lng }],
        fares:     [...prev.fares, ''],
        distances: updated.slice(0,-1).map(s => s.distanceToNext??'0.00'),
      }));
    }
  };

  const handleRouteNameChange = (index, name) => {
    setRouteNames(prev => ({ ...prev, [index]: name }));
  };

  // ─────────────────────────────────────────────────────────────────────────
  // AUTH SCREEN
  // ─────────────────────────────────────────────────────────────────────────
  if (showAuth) {
    return (
      <AuthForm
        earnerId={earnerId}        authEmail={authEmail}        authPassword={authPassword}
        onEarnerIdChange={setEarnerId}
        onEmailChange={setAuthEmail}
        onPasswordChange={setAuthPassword}
        onLogin={handleEarnerLogin}
        onForgotPassword={handleForgotPassword}
        isLoading={isLoading}
      />
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // MAP STOPS / ROUTES (same pattern as AdminHomeScreen)
  // ─────────────────────────────────────────────────────────────────────────
  const mapStops = (() => {
    let s = [...stops];
    if (spotlightStop && !s.some(x => x.id === spotlightStop.id)) s = [...s, spotlightStop];
    if (spotlightRoute?.route_stops) {
      spotlightRoute.route_stops.forEach(rs => {
        const st = rs.stops;
        if (st && !s.some(x => x.id === st.id)) s = [...s, st];
      });
    }
    return s;
  })();

  const mapRoutes = spotlightRoute && !routes.some(r => r.id === spotlightRoute.id)
    ? [...routes, spotlightRoute]
    : routes;

  // ─────────────────────────────────────────────────────────────────────────
  // MAIN RENDER (identical layout to AdminHomeScreen)
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="container">

      {/* ── Map ─────────────────────────────────────────────────────────── */}
      <div className="map-container">
        <MapComponent
          center={MAP_CONFIG.center}
          stops={mapStops}
          routes={mapRoutes}
          selectedStop={editingStop || (newStop.latitude ? newStop : null)}
          panToLocation={panToLocation}
          onMapPress={(lat, lng) => {
            if (editRouteCreationMode === 'plotting') {
              handleEditMapPressForRoute(lat, lng);
            } else if (routeCreationMode === 'plotting') {
              handleMapPressForRoute(lat, lng);
            } else if (isSelectingLocation) {
              handleMapPress(lat, lng);
            }
          }}
          isSelectingLocation={isSelectingLocation || routeCreationMode === 'plotting' || editRouteCreationMode === 'plotting'}
          plottedStops={plottedStops}
          routeCreationMode={routeCreationMode}
          onStopClick={handleStopClickFromMap}
          showRoutePaths={showRoutePaths && (routeCreationMode !== null || editRouteCreationMode !== null)}
          hoveredRouteId={hoveredRouteId}
          selectedRouteId={selectedRouteId}
          hoveredStopId={hoveredStopId}
          selectedStopId={selectedStopId}
          editPlottedStops={editPlottedStops}
          editRouteCreationMode={editRouteCreationMode}
          editingRouteId={editingRoute?.id ?? null}
          onEditStopClick={() => {}}
        />
      </div>

      {/* ── Header buttons ──────────────────────────────────────────────── */}
      <div className="header-buttons">
        <button className="profile-button" onClick={handleLogout} title="Sign out">
          <LogOut size={20} />
        </button>
        <button
          className="menu-button"
          title="Edit phone number"
          onClick={() => {
            setPhoneValue(earner?.phone || '');
            setShowPhoneEdit(p => !p);
          }}
        >
          <Phone size={20} />
        </button>
        <button className="menu-button" onClick={toggleBottomSheet} title="Toggle panel">
          <Settings size={20} />
        </button>
      </div>

      {/* ── Phone edit popover ───────────────────────────────────────────── */}
      {showPhoneEdit && (
        <div style={{
          position: 'fixed', top: 56, right: 12, zIndex: 1000,
          background: '#fff', borderRadius: 12, boxShadow: '0 4px 24px rgba(0,0,0,0.15)',
          padding: '14px 16px', minWidth: 260, border: '1px solid #e5e7eb',
        }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
            <span style={{ fontWeight:700, fontSize:13, color:'#1f2937', display:'flex', alignItems:'center', gap:6 }}>
              <Phone size={14} color="#7c3aed" /> Edit Phone Number
            </span>
            <button onClick={() => setShowPhoneEdit(false)}
              style={{ background:'none', border:'none', cursor:'pointer', padding:2, color:'#6b7280' }}>
              <X size={16} />
            </button>
          </div>
          <input
            className="input"
            type="tel"
            placeholder="+233 XX XXX XXXX"
            value={phoneValue}
            onChange={(e) => setPhoneValue(e.target.value)}
            style={{ marginBottom:10, fontSize:13 }}
            autoFocus
          />
          <div style={{ display:'flex', gap:8 }}>
            <button className="cancel-button" style={{ flex:1, fontSize:12 }}
              onClick={() => setShowPhoneEdit(false)}>
              Cancel
            </button>
            <button
              className={`save-button ${isSavingPhone ? 'save-button-disabled' : ''}`}
              style={{ flex:1, fontSize:12 }}
              onClick={handleUpdatePhone}
              disabled={isSavingPhone}
            >
              {isSavingPhone ? <div className="spinner" style={{width:14,height:14}} /> : 'Save'}
            </button>
          </div>
        </div>
      )}

      {/* ── Side panel ──────────────────────────────────────────────────── */}
      {showBottomSheet && (
        <div className={`bottom-sheet ${showBottomSheet ? 'slide-in' : 'slide-out'}`}
          style={{ width: sheetWidth }}>

          <div className="resize-handle" onMouseDown={handleResizeMouseDown}>
            <div className="resize-handle-bar" />
          </div>

          <div className="bottom-sheet-header">
            <div className="user-info-header">
              <div className="user-welcome">
                Welcome, <span className="user-email">{earner?.full_name || user?.email}</span>
                {earner && (
                  <span style={{ fontSize:11, color:'#9ca3af', marginLeft:8 }}>
                    · ID: {earner.earner_id}
                  </span>
                )}
              </div>
              {earner && (
                <div style={{ display:'flex', gap:12, flexWrap:'wrap', marginTop:6, marginBottom:2 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:5, background:'#f0fdf4', border:'1px solid #bbf7d0', borderRadius:8, padding:'4px 10px' }}>
                    <DollarSign size={13} color="#16a34a" />
                    <span style={{ fontSize:12, fontWeight:700, color:'#15803d' }}>GH₵ {Number(earner.earnings || 0).toFixed(2)}</span>
                    <span style={{ fontSize:11, color:'#6b7280' }}>earnings</span>
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:5, background:'#eff6ff', border:'1px solid #bfdbfe', borderRadius:8, padding:'4px 10px' }}>
                    <MapPin size={13} color="#2563eb" />
                    <span style={{ fontSize:12, fontWeight:700, color:'#1d4ed8' }}>{earner.stops_approved ?? 0}</span>
                    <span style={{ fontSize:11, color:'#6b7280' }}>stops approved</span>
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:5, background:'#faf5ff', border:'1px solid #e9d5ff', borderRadius:8, padding:'4px 10px' }}>
                    <Route size={13} color="#7c3aed" />
                    <span style={{ fontSize:12, fontWeight:700, color:'#6d28d9' }}>{earner.routes_approved ?? 0}</span>
                    <span style={{ fontSize:11, color:'#6b7280' }}>routes approved</span>
                  </div>
                </div>
              )}
              <button className="close-button" onClick={() => toggleBottomSheet(false)}>
                <X size={30} />
              </button>
              <div className="tab-container">
                <button className={`tab ${activeSection === 'stops' ? 'active-tab' : ''}`}
                  onClick={() => setActiveSection('stops')}>
                  <MapPin size={16} /> Stops
                </button>
                <button className={`tab ${activeSection === 'routes' ? 'active-tab' : ''}`}
                  onClick={() => setActiveSection('routes')}>
                  <Route size={16} /> My Routes
                </button>
              </div>
            </div>
          </div>

          <div className="bottom-sheet-content">

            {/* ══════════════ STOPS TAB ══════════════ */}
            {activeSection === 'stops' && (
              <div className="management-container">
                {editingStop ? (
                  <div className="form-container">
                    <h2 className="form-title">Edit Stop</h2>
                    <div className="input-group">
                      <input className="input" placeholder="Stop Name"
                        value={editingStop.name}
                        onChange={(e) => setEditingStop(prev => ({ ...prev, name: e.target.value }))} />
                    </div>
                    <button className="location-button" onClick={() => {
                      setIsSelectingLocation(true);
                      setShowBottomSheet(false);
                    }}>
                      <MapPin size={20} /> Update Location on Map
                    </button>
                    <div className="coordinates-container">
                      <p className="location-text">Current Coordinates:</p>
                      <p className="coordinates-text">Lat: {editingStop.latitude.toFixed(6)}</p>
                      <p className="coordinates-text">Lng: {editingStop.longitude.toFixed(6)}</p>
                    </div>
                    <div className="button-row">
                      <button className="cancel-button" onClick={() => setEditingStop(null)}>Cancel</button>
                      <button className={`save-button ${isLoading ? 'save-button-disabled' : ''}`}
                        onClick={handleUpdateStop} disabled={isLoading}>
                        {isLoading ? <div className="spinner"></div> : 'Update Stop'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <StopForm
                    newStop={newStop}
                    onStopNameChange={(text) => setNewStop(prev => ({ ...prev, name: text }))}
                    onLatChange={handleLatChange}
                    onLngChange={handleLngChange}
                    onSelectLocation={() => {
                      setIsSelectingLocation(true);
                      toggleBottomSheet(false);
                    }}
                    onAddStop={handleAddStop}
                    onCancel={() => setNewStop({ name:'', latitude:null, longitude:null })}
                    isLoading={isLoading}
                  />
                )}

                {/* Stops list */}
                <div className="stops-list">
                  <div style={{ display:'flex', alignItems:'baseline', justifyContent:'space-between', flexWrap:'wrap', gap:4, marginBottom:6 }}>
                    <h3 className="list-title" style={{ margin:0 }}>
                      All Stops
                      <span style={{ fontWeight:400, fontSize:13, color:'#6b7280', marginLeft:4 }}>({totalStopsCount} total)</span>
                    </h3>
                    {!stopSearchQuery.trim() && totalStopsCount > 0 && (
                      <span style={{ fontSize:12, color:'#9ca3af' }}>
                        {stopsPage * PAGE_SIZE + 1}–{Math.min((stopsPage+1)*PAGE_SIZE, totalStopsCount)} of {totalStopsCount}
                      </span>
                    )}
                  </div>

                  <div className="search-box-container">
                    <div className="search-container">
                      <Search size={20} color="#6b7280" />
                      <input className="search-input" placeholder="Search all stops in database…"
                        value={stopSearchQuery} onChange={(e) => setStopSearchQuery(e.target.value)} />
                      {isSearchingStops && <div className="spinner-small"></div>}
                      <button className={`match-word-button ${matchWholeWord ? 'match-word-active' : ''}`}
                        onClick={() => setMatchWholeWord(p => !p)}>
                        <Type size={16} />{matchWholeWord ? 'Whole Word' : 'Partial'}
                      </button>
                    </div>
                  </div>

                  <div className="items-container">
                    {filteredStops.map((stop) => (
                      <React.Fragment key={stop.id}>
                        <div
                          className={`item-card${selectedStopId===stop.id ? ' stop-card-selected' : hoveredStopId===stop.id ? ' stop-card-hovered' : ''}`}
                          onMouseEnter={() => { setHoveredStopId(stop.id); setPanToLocation({ lat:stop.latitude, lng:stop.longitude }); }}
                          onMouseLeave={() => setHoveredStopId(null)}
                          onClick={() => {
                            const toggling = selectedStopId === stop.id;
                            setSelectedStopId(toggling ? null : stop.id);
                            setPanToLocation({ lat:stop.latitude, lng:stop.longitude });
                            if (!toggling && !stops.some(s => s.id === stop.id)) setSpotlightStop(stop);
                            else if (toggling) setSpotlightStop(null);
                          }}
                          style={{ cursor:'pointer', userSelect:'none' }}>
                          <div className="item-info">
                            <h4 className="item-name">{stop.name}</h4>
                            <p className="item-coordinates">{stop.latitude.toFixed(6)}, {stop.longitude.toFixed(6)}</p>
                            {/* Approval / rejection badge */}
                            {stop.approved ? (
                              <span style={{ display:'inline-flex', alignItems:'center', gap:3, fontSize:10, fontWeight:600, borderRadius:99, padding:'2px 8px', marginTop:3, background:'#d1fae5', color:'#065f46' }}>
                                <CheckCircle size={10} /> Approved
                              </span>
                            ) : stop.rejection_reason ? (
                              <span style={{ display:'inline-flex', alignItems:'center', gap:3, fontSize:10, fontWeight:600, borderRadius:99, padding:'2px 8px', marginTop:3, background:'#fee2e2', color:'#991b1b' }}>
                                <XCircle size={10} /> Rejected
                              </span>
                            ) : (
                              <span style={{ display:'inline-flex', alignItems:'center', gap:3, fontSize:10, fontWeight:600, borderRadius:99, padding:'2px 8px', marginTop:3, background:'#fef3c7', color:'#92400e' }}>
                                <AlertCircle size={10} /> Pending Review
                              </span>
                            )}
                          </div>
                          <div className="item-actions">
                            <button className="edit-button" onClick={(e) => { e.stopPropagation(); handleEditStop(stop); }}>
                              <Edit3 size={16} />
                            </button>
                            <button className="delete-button" onClick={(e) => { e.stopPropagation(); handleDeleteStop(stop.id); }}>
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                        {selectedStopId === stop.id && (
                          <div className="stop-highlight-panel">
                            <div className="route-highlight-panel-header">
                              <MapPin size={14} color="#6b21a8" />
                              <span className="route-highlight-panel-title">{stop.name}</span>
                              <button className="route-highlight-panel-close"
                                onClick={(e) => { e.stopPropagation(); setSelectedStopId(null); }}>
                                <X size={14} />
                              </button>
                            </div>
                            <div className="stop-highlight-coord">
                              <div>📍 Latitude:  {stop.latitude.toFixed(7)}</div>
                              <div>📍 Longitude: {stop.longitude.toFixed(7)}</div>
                            </div>
                            {stop.rejection_reason && !stop.approved && (
                              <div style={{ marginTop:8, background:'#fef2f2', border:'1px solid #fecaca', borderRadius:6, padding:'6px 10px', fontSize:11, color:'#991b1b', borderLeft:'3px solid #ef4444' }}>
                                <strong>Rejection reason:</strong> {stop.rejection_reason}
                              </div>
                            )}
                          </div>
                        )}
                      </React.Fragment>
                    ))}
                  </div>

                  {/* Stops pagination */}
                  {!stopSearchQuery.trim() && totalStopsCount > PAGE_SIZE && (
                    <div style={{ position:'sticky', bottom:-24, background:'#fff', borderTop:'1px solid #e5e7eb', display:'flex', alignItems:'center', justifyContent:'space-between', gap:8, padding:'8px 0 4px', zIndex:10 }}>
                      <button className="cancel-button" style={{ flex:'none', minWidth:90, opacity:stopsPage===0||isLoading?0.4:1 }}
                        disabled={stopsPage===0||isLoading} onClick={() => loadStops(stopsPage-1)}>
                        ← Previous
                      </button>
                      <span style={{ fontSize:12, color:'#6b7280', textAlign:'center' }}>
                        Page {stopsPage+1} / {Math.ceil(totalStopsCount/PAGE_SIZE)}
                      </span>
                      <button className="save-button" style={{ flex:'none', minWidth:90, opacity:(stopsPage+1)*PAGE_SIZE>=totalStopsCount||isLoading?0.4:1 }}
                        disabled={(stopsPage+1)*PAGE_SIZE>=totalStopsCount||isLoading} onClick={() => loadStops(stopsPage+1)}>
                        Next →
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ══════════════ ROUTES TAB ══════════════ */}
            {activeSection === 'routes' && (
              <div className="management-container">

                {/* Route creation mode — map plotting (same component as Admin) */}
                {routeCreationMode ? (
                  <RouteCreationWithMap
                    onCancel={() => {
                      setRouteCreationMode(null);
                      setPlottedStops([]);
                      userEditedRouteName.current = false;
                    }}
                    onSave={handleSavePlottedRoute}
                    isLoading={isLoading}
                    existingStops={stops}
                    onPlotStop={() => setRouteCreationMode('plotting')}
                    plottedStops={plottedStops}
                    onRemovePlottedStop={handleRemovePlottedStop}
                    onNamePlottedStop={handleNamePlottedStop}
                    onAddFare={handleAddFare}
                    fares={plottedStops.map(s => s.fareToNext)}
                    routeName={newRoute.name}
                    onRouteNameChange={(text) => {
                      userEditedRouteName.current = true;
                      setNewRoute(prev => ({ ...prev, name: text }));
                    }}
                    onSelectExistingStop={() => setRouteCreationMode('selecting')}
                    isSelectingExisting={routeCreationMode === 'selecting'}
                    showRoutePaths={showRoutePaths}
                    onToggleRoutePaths={() => setShowRoutePaths(p => !p)}
                    routeInfo={{
                      description: newRoute.description, travelTimeMinutes: newRoute.travelTimeMinutes,
                      peakHours: newRoute.peakHours, frequency: newRoute.frequency,
                      vehicleType: newRoute.vehicleType, notes: newRoute.notes,
                      amenities: newRoute.amenities, operatingHours: newRoute.operatingHours,
                    }}
                    onRouteInfoChange={(field, value) => setNewRoute(prev => ({ ...prev, [field]: value }))}
                    onAmenityToggle={(amenity) => setNewRoute(prev => ({
                      ...prev,
                      amenities: prev.amenities.includes(amenity)
                        ? prev.amenities.filter(a => a !== amenity)
                        : [...prev.amenities, amenity],
                    }))}
                    onOperatingHoursChange={(field, value) => setNewRoute(prev => ({
                      ...prev, operatingHours: { ...prev.operatingHours, [field]: value },
                    }))}
                    onOperatingDayToggle={(day) => setNewRoute(prev => {
                      const days = prev.operatingHours.days.includes(day)
                        ? prev.operatingHours.days.filter(d => d !== day)
                        : [...prev.operatingHours.days, day];
                      return { ...prev, operatingHours: { ...prev.operatingHours, days } };
                    })}
                    onAddStopFromSearch={(stop) => {
                      const updated = recalcPlottedDistances([...plottedStops, { ...stop, isNew:false, fareToNext:'', distanceToNext:null }]);
                      setPlottedStops(updated);
                      setNewRoute(prev => ({
                        ...prev, stops:[...prev.stops, stop], fares:[...prev.fares, ''],
                        distances: updated.slice(0,-1).map(s => s.distanceToNext??'0.00'),
                      }));
                    }}
                  />

                ) : editingRoute ? (
                  <RouteEditWithMap
                    editingRoute={editingRoute}
                    editRouteData={editRouteData}
                    editPlottedStops={editPlottedStops}
                    existingStops={stops}
                    isLoading={isLoading}
                    onCancel={() => { setEditingRoute(null); setEditRouteCreationMode(null); setEditPlottedStops([]); }}
                    onSave={async () => { setEditingRoute(null); setEditRouteCreationMode(null); setEditPlottedStops([]); loadRoutes(); }}
                    onRouteNameChange={(text) => setEditRouteData(prev => ({ ...prev, name: text }))}
                    isSelectingExisting={editRouteCreationMode === 'selecting'}
                    onPlotStop={() => setEditRouteCreationMode('plotting')}
                    onSelectExistingStop={() => setEditRouteCreationMode('selecting')}
                    searchQuery={editSearchQuery}
                    onSearchChange={handleEditSearchChange}
                    searchResults={editSearchResults}
                    onAddStopFromSearch={handleEditAddStopFromSearch}
                    showRoutePaths={showRoutePaths}
                    onToggleRoutePaths={() => setShowRoutePaths(p => !p)}
                    routeInfo={{
                      description: editRouteData.description, travelTimeMinutes: editRouteData.travelTimeMinutes,
                      peakHours: editRouteData.peakHours, frequency: editRouteData.frequency,
                      vehicleType: editRouteData.vehicleType, notes: editRouteData.notes,
                      amenities: editRouteData.amenities, operatingHours: editRouteData.operatingHours,
                    }}
                    onRouteInfoChange={(field, value) => setEditRouteData(prev => ({ ...prev, [field]: value }))}
                    onAmenityToggle={(amenity) => setEditRouteData(prev => ({
                      ...prev,
                      amenities: prev.amenities.includes(amenity)
                        ? prev.amenities.filter(a => a !== amenity)
                        : [...prev.amenities, amenity],
                    }))}
                    onOperatingHoursChange={(field, value) => setEditRouteData(prev => ({
                      ...prev, operatingHours: { ...prev.operatingHours, [field]: value },
                    }))}
                    onOperatingDayToggle={(day) => setEditRouteData(prev => {
                      const days = prev.operatingHours.days.includes(day)
                        ? prev.operatingHours.days.filter(d => d !== day)
                        : [...prev.operatingHours.days, day];
                      return { ...prev, operatingHours: { ...prev.operatingHours, days } };
                    })}
                  />

                ) : showCompositeForm ? (
                  <CompositeRouteForm
                    onCancel={() => setShowCompositeForm(false)}
                    onSave={handleSaveCompositeRoute}
                    isLoading={isLoading}
                  />

                ) : (
                  /* ── Default routes view ── */
                  <div>
                    {/* Earner approval notice */}
                    <div style={{ background:'#fffbeb', border:'1px solid #fde68a', borderRadius:8, padding:'8px 12px', fontSize:12, color:'#92400e', marginBottom:12, display:'flex', alignItems:'center', gap:6 }}>
                      <AlertCircle size={13} />
                      Routes you submit will be reviewed by an admin before going live.
                    </div>

                    {/* Route creation options */}
                    <div className="route-creation-options">
                      <h2 className="form-title">Select Route Creation Method</h2>

                      <button className="creation-option-button"
                        onClick={() => { setNewRoute(emptyRoute); setShowManualRouteForm(p => !p); }}
                        style={showManualRouteForm ? { background:'linear-gradient(135deg, #ede9fe, #ddd6fe)', borderColor:'#a78bfa' } : {}}>
                        <Route size={20} />
                        <div className="option-content">
                          <h4>Create New Route Manually</h4>
                          <p>Search for existing stops and build a route with fares.</p>
                        </div>
                      </button>

                      <button className="creation-option-button"
                        style={{ background:'linear-gradient(135deg, #ffffff, #b9b6fa50)' }}
                        onClick={() => setShowCompositeForm(true)}>
                        <Layers size={20} />
                        <div className="option-content">
                          <h4>Composite Route</h4>
                          <p>Merge multiple existing routes into one composite route.</p>
                        </div>
                      </button>
                    </div>

                    {/* Inline manual form — shown only when toggled */}
                    {showManualRouteForm && (
                      <RouteForm
                        newRoute={newRoute}
                        onRouteNameChange={(text) => setNewRoute(prev => ({ ...prev, name: text }))}
                        searchQuery={searchQuery}
                        onSearchChange={handleRouteStopSearch}
                        searchResults={searchResults}
                        onAddRouteStop={handleAddRouteStop}
                        onFareChange={(text, index) => {
                          const f = [...newRoute.fares]; f[index] = text;
                          setNewRoute(prev => ({ ...prev, fares: f }));
                        }}
                        onRemoveStop={handleRemoveRouteStop}
                        onAddRoute={handleAddRoute}
                        onCancel={() => { setNewRoute(emptyRoute); setShowManualRouteForm(false); }}
                        isLoading={isLoading}
                        onRouteInfoChange={(field, value) => setNewRoute(prev => ({ ...prev, [field]: value }))}
                        onAmenityToggle={(amenity) => setNewRoute(prev => ({
                          ...prev,
                          amenities: prev.amenities.includes(amenity)
                            ? prev.amenities.filter(a => a !== amenity)
                            : [...prev.amenities, amenity],
                        }))}
                        onOperatingHoursChange={(field, value) => setNewRoute(prev => ({
                          ...prev, operatingHours: { ...prev.operatingHours, [field]: value },
                        }))}
                        onOperatingDayToggle={(day) => setNewRoute(prev => {
                          const days = prev.operatingHours.days.includes(day)
                            ? prev.operatingHours.days.filter(d => d !== day)
                            : [...prev.operatingHours.days, day];
                          return { ...prev, operatingHours: { ...prev.operatingHours, days } };
                        })}
                        matchWholeWord={matchWholeWord}
                        onMatchWholeWordToggle={handleMatchWholeWordToggle}
                      />
                    )}
                  </div>
                )}

                {/* Routes list — only shown when not in a creation/edit mode */}
                {!routeCreationMode && !editingRoute && !showCompositeForm && !showManualRouteForm && (
                  <div className="routes-list">
                    <div style={{ display:'flex', alignItems:'baseline', justifyContent:'space-between', flexWrap:'wrap', gap:4, marginBottom:6 }}>
                      <h3 className="list-title" style={{ margin:0 }}>
                        My Routes
                        <span style={{ fontWeight:400, fontSize:13, color:'#6b7280', marginLeft:4 }}>({totalRoutesCount} total)</span>
                      </h3>
                      {!routeSearchQuery.trim() && totalRoutesCount > 0 && (
                        <span style={{ fontSize:12, color:'#9ca3af' }}>
                          {routesPage * PAGE_SIZE + 1}–{Math.min((routesPage+1)*PAGE_SIZE, totalRoutesCount)} of {totalRoutesCount}
                        </span>
                      )}
                    </div>

                    <div className="search-box-container">
                      <div className="search-container">
                        <Search size={20} color="#6b7280" />
                        <input className="search-input" placeholder="Search my routes…"
                          value={routeSearchQuery} onChange={(e) => setRouteSearchQuery(e.target.value)} />
                        {isSearchingRoutes && <div className="spinner-small"></div>}
                        <button className={`match-word-button ${matchWholeWord ? 'match-word-active' : ''}`}
                          onClick={handleMatchWholeWordToggle}>
                          <Type size={16} />{matchWholeWord ? 'Whole Word' : 'Partial'}
                        </button>
                      </div>
                    </div>

                    <div className="items-container">
                      {filteredRoutes.map((route) => (
                        <React.Fragment key={route.id}>
                          <div
                            className={`item-card route-card${selectedRouteId===route.id ? ' route-card-selected' : hoveredRouteId===route.id ? ' route-card-hovered' : ''}`}
                            onMouseEnter={() => { setHoveredRouteId(route.id); const mid=getRouteMidpoint(route); if(mid) setPanToLocation(mid); }}
                            onMouseLeave={() => setHoveredRouteId(null)}
                            onClick={async () => {
                              const toggling = selectedRouteId === route.id;
                              setSelectedRouteId(toggling ? null : route.id);
                              const mid = getRouteMidpoint(route);
                              if (mid) setPanToLocation(mid);
                              if (!toggling && !routes.some(r => r.id === route.id)) {
                                setSpotlightRoute(route);
                              } else if (toggling) {
                                setSpotlightRoute(null); setSpotlightStop(null);
                              }
                            }}
                            style={{ cursor:'pointer', userSelect:'none' }}>
                            <div className="item-info">
                              <h4 className="item-name">
                                {route.name}
                                {route.is_composite && (
                                  <span style={{ display:'inline-flex', alignItems:'center', gap:3, fontSize:10, fontWeight:700, background:'linear-gradient(135deg,#ede9fe,#ddd6fe)', color:'#5b21b6', border:'1px solid #c4b5fd', borderRadius:4, padding:'1px 6px', marginLeft:6, verticalAlign:'middle' }}>
                                    <Layers size={10} /> Composite
                                  </span>
                                )}
                              </h4>

                              {/* Approval / rejection badge */}
                              {route.approved ? (
                                <span style={{ display:'inline-flex', alignItems:'center', gap:3, fontSize:10, fontWeight:600, borderRadius:99, padding:'2px 8px', marginTop:2, background:'#d1fae5', color:'#065f46' }}>
                                  <CheckCircle size={10} /> Approved
                                </span>
                              ) : route.rejection_reason ? (
                                <span style={{ display:'inline-flex', alignItems:'center', gap:3, fontSize:10, fontWeight:600, borderRadius:99, padding:'2px 8px', marginTop:2, background:'#fee2e2', color:'#991b1b' }}>
                                  <XCircle size={10} /> Rejected
                                </span>
                              ) : (
                                <span style={{ display:'inline-flex', alignItems:'center', gap:3, fontSize:10, fontWeight:600, borderRadius:99, padding:'2px 8px', marginTop:2, background:'#fef3c7', color:'#92400e' }}>
                                  <AlertCircle size={10} /> Pending Review
                                </span>
                              )}
                              {/* Show rejection reason inline below the badge */}
                              {route.rejection_reason && !route.approved && (
                                <div style={{ marginTop:6, background:'#fef2f2', border:'1px solid #fecaca', borderRadius:6, padding:'6px 10px', fontSize:11, color:'#991b1b', borderLeft:'3px solid #ef4444' }}>
                                  <strong>Rejection reason:</strong> {route.rejection_reason}
                                </div>
                              )}

                              {route.description && (
                                <p className="item-description">{route.description}</p>
                              )}
                              <div className="route-details-grid">
                                <div className="detail-item">
                                  <span className="detail-label"><MapPin size={12} />Stops:</span>
                                  <span className="detail-value">{route.route_stops?.length || 0}</span>
                                </div>
                                <div className="detail-item">
                                  <span className="detail-label"><Clock size={12} />Fare:</span>
                                  <span className="detail-value">GH₵ {route.total_fare}</span>
                                </div>
                                <div className="detail-item">
                                  <span className="detail-label"><Route size={12} />Distance:</span>
                                  <span className="detail-value">{route.total_distance}km</span>
                                </div>
                                {route.travel_time_minutes && (
                                  <div className="detail-item">
                                    <span className="detail-label"><Clock size={12} />Time:</span>
                                    <span className="detail-value">{formatTravelTime(route.travel_time_minutes)}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="item-actions">
                              <button className="delete-button"
                                onClick={(e) => { e.stopPropagation(); handleDeleteRoute(route.id); }}>
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        </React.Fragment>
                      ))}
                    </div>

                    {/* Routes pagination */}
                    {!routeSearchQuery.trim() && totalRoutesCount > PAGE_SIZE && (
                      <div style={{ position:'sticky', bottom:-22, background:'#fff', borderTop:'1px solid #e5e7eb', display:'flex', alignItems:'center', justifyContent:'space-between', gap:8, padding:'8px 0 4px', zIndex:10 }}>
                        <button className="cancel-button" style={{ flex:'none', minWidth:90, opacity:routesPage===0||isLoading?0.4:1 }}
                          disabled={routesPage===0||isLoading} onClick={() => loadRoutes(routesPage-1)}>
                          ← Previous
                        </button>
                        <span style={{ fontSize:12, color:'#6b7280', textAlign:'center' }}>
                          Page {routesPage+1} / {Math.ceil(totalRoutesCount/PAGE_SIZE)}
                        </span>
                        <button className="save-button" style={{ flex:'none', minWidth:90, opacity:(routesPage+1)*PAGE_SIZE>=totalRoutesCount||isLoading?0.4:1 }}
                          disabled={(routesPage+1)*PAGE_SIZE>=totalRoutesCount||isLoading} onClick={() => loadRoutes(routesPage+1)}>
                          Next →
                        </button>
                      </div>
                    )}
                  </div>
                )}

              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Location selection overlay ───────────────────────────────────── */}
      {isSelectingLocation && (
        <div className="overlay">
          <p className="overlay-text">
            <MapPin size={20} />
            Click anywhere on the map to select location
          </p>
          <button className="overlay-button" onClick={() => {
            setIsSelectingLocation(false);
            if (editingStop) setEditingStop(null);
            toggleBottomSheet(true);
          }}>
            Cancel Selection
          </button>
        </div>
      )}

      <RouteSelectionModal
        visible={showRouteSelection}
        foundRoutes={foundRoutes}
        selectedRoutes={selectedRoutes}
        onRouteToggle={(r) => setSelectedRoutes(prev => prev.find(x=>x.id===r.id) ? prev.filter(x=>x.id!==r.id) : [...prev,r])}
        onFareChange={(id, fare) => setSelectedRoutes(prev => prev.map(r => r.id===id ? {...r,fare} : r))}
        onSaveRoutes={() => setShowRouteSelection(false)}
        onCancel={() => { setShowRouteSelection(false); setCurrentPage(0); }}
        isLoading={isLoading}
        onAddReverseRoute={() => {}}
        onCloseReverseRoute={() => {}}
        currentPage={currentPage}
        routesPerPage={routesPerPage}
        onLoadMore={() => {}}
        hasMoreRoutes={hasMoreRoutes}
        onRoutesPerPageChange={setRoutesPerPage}
        routeNames={routeNames}
        onRouteNameChange={handleRouteNameChange}
      />

    </div>
  );
};

export default EarnerHomeScreen;