// src/components/AdminHomeScreen.js
import React, { useState, useEffect } from 'react';
import './AdminHomeScreen.css';
import MapComponent from './MapComponent';
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
  Check
} from 'lucide-react';

const AuthForm = ({ 
  authEmail, 
  authPassword, 
  onEmailChange, 
  onPasswordChange, 
  onLogin, 
  isLoading,
  onForgotPassword
}) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin();
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">Trotro Admin</h1>
        <p className="auth-subtitle">Ghana Trotro Transit Administration</p>
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="input-group">
            <input
              className="auth-input"
              placeholder="Admin Email"
              value={authEmail}
              onChange={(e) => onEmailChange(e.target.value)}
              type="email"
              required
            />
          </div>
          
          <div className="input-group">
            <input
              className="auth-input"
              placeholder="Password"
              value={authPassword}
              onChange={(e) => onPasswordChange(e.target.value)}
              type="password"
              required
            />
          </div>
          
          <button 
            className={`auth-button ${isLoading ? 'auth-button-disabled' : ''}`}
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? <div className="spinner"></div> : 'Sign In'}
          </button>

          <button 
  type="button"
  onClick={onForgotPassword}
  disabled={isLoading}
  className="forgot-password-button"
>
  {isLoading ? 'Sending...' : 'Forgot Password?'}
</button>
        </form>
      </div>
    </div>
  );
};

const StopForm = ({ 
  newStop, 
  onStopNameChange, 
  onSelectLocation, 
  onAddStop, 
  onCancel, 
  isLoading,
}) => {
  return (
    <div className="form-container">
      <h2 className="form-title">Add New Stop</h2>
      
      <div className="input-group">
        <input
          className="input"
          placeholder="Stop Name (e.g., 'Circle', 'Madina')"
          value={newStop.name}
          onChange={(e) => onStopNameChange(e.target.value)}
        />
      </div>
      
      <button 
        className="location-button"
        onClick={onSelectLocation}
      >
        <MapPin size={20} />
        {newStop.latitude ? 'Location Selected ✓' : 'Select Location on Map'}
      </button>
      
      {newStop.latitude && (
        <div className="coordinates-container">
          <p className="location-text">Selected Coordinates:</p>
          <p className="coordinates-text">Lat: {newStop.latitude.toFixed(6)}</p>
          <p className="coordinates-text">Lng: {newStop.longitude.toFixed(6)}</p>
        </div>
      )}
      
      <div className="button-row">
        <button 
          className="cancel-button"
          onClick={onCancel}
        >
          Cancel
        </button>
        
        <button 
          className={`save-button ${isLoading ? 'save-button-disabled' : ''}`}
          onClick={onAddStop}
          disabled={isLoading || !newStop.latitude}
        >
          {isLoading ? <div className="spinner"></div> : 'Save Stop'}
        </button>
      </div>
    </div>
  );
};

const RouteFinder = ({
  startPoint,
  destinationPoint,
  onStartPointChange,
  onDestinationPointChange,
  onFindRoutes,
  onCancel,
  isLoading,
  stopSuggestions,
  onStopSuggestionSelect
}) => {
  return (
    <div className="form-container">
      <h2 className="form-title">Find Routes Automatically</h2>
      <p className="form-subtitle">Enter start and destination to find diverse routes including shortest and alternative paths</p>
      
      <div className="input-group">
        <div className="search-container">
          <MapPin size={20} color="#6b21a8" />
          <input
            className="search-input"
            placeholder="Start Point (e.g., 'Circle')"
            value={startPoint}
            onChange={(e) => onStartPointChange(e.target.value)}
          />
        </div>
        
        {stopSuggestions.start.length > 0 && (
          <div className="suggestions-container">
            {stopSuggestions.start.map((stop) => (
              <button
                key={stop.id}
                className="suggestion-item"
                onClick={() => onStopSuggestionSelect(stop.name, 'start')}
              >
                <MapPin size={16} color="#6b21a8" />
                <span className="suggestion-text">{stop.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="input-group">
        <div className="search-container">
          <MapPin size={20} color="#EF4444" />
          <input
            className="search-input"
            placeholder="Destination Point (e.g., 'Madina')"
            value={destinationPoint}
            onChange={(e) => onDestinationPointChange(e.target.value)}
          />
        </div>

        {stopSuggestions.destination.length > 0 && (
          <div className="suggestions-container">
            {stopSuggestions.destination.map((stop) => (
              <button
                key={stop.id}
                className="suggestion-item"
                onClick={() => onStopSuggestionSelect(stop.name, 'destination')}
              >
                <MapPin size={16} color="#EF4444" />
                <span className="suggestion-text">{stop.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>
      
      <div className="button-row">
        <button 
          className="cancel-button"
          onClick={onCancel}
        >
          Cancel
        </button>
        
        <button 
          className={`save-button ${isLoading ? 'save-button-disabled' : ''}`}
          onClick={onFindRoutes}
          disabled={isLoading || !startPoint || !destinationPoint}
        >
          {isLoading ? <div className="spinner"></div> : 'Find Routes'}
        </button>
      </div>
    </div>
  );
};

const RouteForm = ({
  newRoute,
  onRouteNameChange,
  searchQuery,
  onSearchChange,
  searchResults,
  onAddRouteStop,
  onFareChange,
  onRemoveStop,
  onAddRoute,
  onCancel,
  onOpenRouteFinder,
  isLoading
}) => {
  return (
    <div className="form-container">
      <h2 className="form-title">Create New Route</h2>
      
      <button 
        className="route-finder-button"
        onClick={onOpenRouteFinder}
      >
        <Route size={20} />
        Find Routes Automatically
      </button>
      
      <p className="divider-text">OR</p>
      
      <div className="input-group">
        <input
          className="input"
          placeholder="Route Name (e.g., 'Abladjei to Circle via Atomic')"
          value={newRoute.name}
          onChange={(e) => onRouteNameChange(e.target.value)}
        />
      </div>
      
      <h3 className="sub-section-title">Add Stops to Route</h3>
      
      <div className="search-container">
        <Search size={20} color="#6b7280" />
        <input
          className="search-input"
          placeholder="Search for stops..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      {searchResults.length > 0 && (
        <div className="suggestions-container">
          {searchResults.map((stop) => (
            <button
              key={stop.id}
              className="suggestion-item"
              onClick={() => onAddRouteStop(stop)}
            >
              <MapPin size={16} color="#6b21a8" />
              <span className="suggestion-text">{stop.name}</span>
            </button>
          ))}
        </div>
      )}

      <h3 className="sub-section-title">
        Route Stops ({newRoute.stops.length})
      </h3>
      
      {newRoute.stops.map((stop, index) => (
        <div key={index} className="selected-stop-item">
          <div className="stop-number">
            <span className="stop-number-text">{index + 1}</span>
          </div>
          <div className="selected-stop-info">
            <span className="selected-stop-name">{stop.name}</span>
            {index < newRoute.stops.length - 1 && (
              <div className="fare-input-container">
                <input
                  className="fare-input"
                  placeholder="Fare to next (GH₵)"
                  value={newRoute.fares[index]}
                  onChange={(e) => onFareChange(e.target.value, index)}
                  type="number"
                  step="0.01"
                />
                <input
                  className="distance-input"
                  placeholder="Distance (km)"
                  value={newRoute.distances[index]}
                  readOnly
                />
              </div>
            )}
          </div>
          <button 
            className="remove-button"
            onClick={() => onRemoveStop(index)}
          >
            <X size={16} color="#EF4444" />
          </button>
        </div>
      ))}

      <div className="button-row">
        <button 
          className="cancel-button"
          onClick={onCancel}
        >
          Cancel
        </button>
        
        <button 
          className={`save-button ${isLoading ? 'save-button-disabled' : ''}`}
          onClick={onAddRoute}
          disabled={isLoading || newRoute.stops.length < 2}
        >
          {isLoading ? <div className="spinner"></div> : 'Save Route'}
        </button>
      </div>
    </div>
  );
};

const RouteSelectionModal = ({
  visible,
  foundRoutes,
  selectedRoutes,
  onRouteToggle,
  onFareChange,
  onSaveRoutes,
  onCancel,
  isLoading
}) => {
  if (!visible) return null;

  const getRouteTypeLabel = (type) => {
    switch (type) {
      case 'direct': return 'Direct Route';
      case '1_intermediate': return '1 Stop Route';
      default: return 'Standard Route';
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <button className="back-button" onClick={onCancel}>
            <ArrowLeft size={24} />
          </button>
          <h2 className="modal-title">Select Routes</h2>
          <div style={{ width: 24 }} />
        </div>

        <div className="modal-content">
          <h3 className="section-title">
            Found {foundRoutes.length} Route(s)
          </h3>
          
          {foundRoutes.map((route, index) => (
            <div key={route.id || index} className="route-option-container">
              <button
                className="route-checkbox"
                onClick={() => onRouteToggle(index)}
              >
                <div className={`checkbox ${selectedRoutes.includes(index) ? 'checkbox-selected' : ''}`}>
                  {selectedRoutes.includes(index) && (
                    <Check size={16} color="#FFFFFF" />
                  )}
                </div>
                <div className="route-header-info">
                  <span className="route-option-title">
                    Route {index + 1} • {route.totalDistance} km
                  </span>
                  <span className="route-type">
                    {getRouteTypeLabel(route.type)} • {route.stops.length - 2} intermediate stops
                  </span>
                </div>
              </button>
              
              {selectedRoutes.includes(index) && (
                <div className="fare-section">
                  <span className="fare-section-title">Set Fares:</span>
                  {route.stops.map((stop, stopIndex) => (
                    stopIndex < route.stops.length - 1 && (
                      <div key={stopIndex} className="fare-input-row">
                        <span className="fare-label">
                          {stop.name} → {route.stops[stopIndex + 1].name}
                        </span>
                        <input
                          className="fare-input-small"
                          placeholder="GH₵ 0.00"
                          value={route.fares[stopIndex]}
                          onChange={(e) => onFareChange(index, stopIndex, e.target.value)}
                          type="number"
                          step="0.01"
                        />
                      </div>
                    )
                  ))}
                </div>
              )}
              
              <span className="route-path">
                {route.stops.map(stop => stop.name).join(' → ')}
              </span>
            </div>
          ))}
          
          {foundRoutes.length > 0 && (
            <div className="button-row">
              <button 
                className="cancel-button"
                onClick={onCancel}
              >
                Cancel
              </button>
              
              <button 
                className={`save-button ${isLoading ? 'save-button-disabled' : ''}`}
                onClick={onSaveRoutes}
                disabled={isLoading || selectedRoutes.length === 0}
              >
                {isLoading ? <div className="spinner"></div> : `Save (${selectedRoutes.length}) Routes`}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const AdminHomeScreen = () => {
  const [user, setUser] = useState(null);
  const [showAuth, setShowAuth] = useState(true);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [stops, setStops] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [isSelectingLocation, setIsSelectingLocation] = useState(false);
  const [newStop, setNewStop] = useState({ name: '', latitude: null, longitude: null });
  
  // Bottom sheet state
  const [showBottomSheet, setShowBottomSheet] = useState(false);
  const [activeSection, setActiveSection] = useState('stops');

  // Stop editing state
  const [editingStop, setEditingStop] = useState(null);
  const [stopSearchQuery, setStopSearchQuery] = useState('');
  const [filteredStops, setFilteredStops] = useState([]);

  // Route management state
  const [newRoute, setNewRoute] = useState({
    name: '',
    stops: [],
    fares: [],
    distances: []
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [editingRoute, setEditingRoute] = useState(null);
  const [editRouteData, setEditRouteData] = useState({
    name: '',
    stops: [],
    fares: [],
    distances: []
  });
  const [routeSearchQuery, setRouteSearchQuery] = useState('');
  const [filteredRoutes, setFilteredRoutes] = useState([]);

  // Route finder state
  const [showRouteFinder, setShowRouteFinder] = useState(false);
  const [startPoint, setStartPoint] = useState('');
  const [destinationPoint, setDestinationPoint] = useState('');
  const [foundRoutes, setFoundRoutes] = useState([]);
  const [selectedRoutes, setSelectedRoutes] = useState([]);
  const [showRouteSelection, setShowRouteSelection] = useState(false);
  const [stopSuggestions, setStopSuggestions] = useState({
    start: [],
    destination: []
  });

  // Check authentication on component mount
  useEffect(() => {
    const storedUser = localStorage.getItem('adminUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      setShowAuth(false);
      loadStops();
      loadRoutes();
    }
  }, []);

  // Filter stops when search query changes
  useEffect(() => {
    if (stopSearchQuery) {
      const filtered = stops.filter(stop =>
        stop.name.toLowerCase().includes(stopSearchQuery.toLowerCase())
      );
      setFilteredStops(filtered);
    } else {
      setFilteredStops(stops);
    }
  }, [stopSearchQuery, stops]);

  // Filter routes when search query changes
  useEffect(() => {
    if (routeSearchQuery) {
      const filtered = routes.filter(route =>
        route.name.toLowerCase().includes(routeSearchQuery.toLowerCase())
      );
      setFilteredRoutes(filtered);
    } else {
      setFilteredRoutes(routes);
    }
  }, [routeSearchQuery, routes]);

  // Search stops for route creation
  useEffect(() => {
    if (searchQuery.length > 0) {
      const filtered = stops.filter(stop =>
        stop.name.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 5);
      setSearchResults(filtered);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, stops]);

  // Auto-calculate distances when stops change
  useEffect(() => {
    if (newRoute.stops.length > 1) {
      calculateRouteDistances();
    }
  }, [newRoute.stops]);

  // Auto-calculate distances when editing route stops change
  useEffect(() => {
    if (editingRoute && editRouteData.stops.length > 1) {
      calculateEditRouteDistances();
    }
  }, [editRouteData.stops, editingRoute]);

  // Calculate distance between two coordinates using Haversine formula
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    return distance;
  };

  // Auto-calculate distances for route
  const calculateRouteDistances = () => {
    const updatedDistances = [...newRoute.distances];
    
    for (let i = 0; i < newRoute.stops.length - 1; i++) {
      const currentStop = newRoute.stops[i];
      const nextStop = newRoute.stops[i + 1];
      
      const distance = calculateDistance(
        currentStop.latitude,
        currentStop.longitude,
        nextStop.latitude,
        nextStop.longitude
      );
      
      updatedDistances[i] = distance.toFixed(2);
    }
    
    setNewRoute(prev => ({ ...prev, distances: updatedDistances }));
  };

  // Auto-calculate distances for editing route
  const calculateEditRouteDistances = () => {
    const updatedDistances = [...editRouteData.distances];
    
    for (let i = 0; i < editRouteData.stops.length - 1; i++) {
      const currentStop = editRouteData.stops[i];
      const nextStop = editRouteData.stops[i + 1];
      
      const distance = calculateDistance(
        currentStop.latitude,
        currentStop.longitude,
        nextStop.latitude,
        nextStop.longitude
      );
      
      updatedDistances[i] = distance.toFixed(2);
    }
    
    setEditRouteData(prev => ({ ...prev, distances: updatedDistances }));
  };

  // Load functions
  const loadStops = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('stops')
        .select('*')
        .order('name');
      
      if (error) throw error;
      setStops(data || []);
    } catch (error) {
      alert('Failed to load stops');
    } finally {
      setIsLoading(false);
    }
  };

  const loadRoutes = async () => {
    try {
      const { data, error } = await supabase
        .from('routes')
        .select(`
          *,
          route_stops(
            stop_order,
            fare_to_next,
            distance_to_next,
            stops(*)
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setRoutes(data || []);
    } catch (error) {
      console.error('Error loading routes:', error);
    }
  };

const handleAdminLogin = async () => {
  if (!authEmail || !authPassword) {
    alert('Please enter both email and password');
    return;
  }

  setIsLoading(true);
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: authEmail,
      password: authPassword,
    });

    if (error) throw error;
    
    if (data.user) {
      // Check if user has admin role
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single();

      if (profileError) throw profileError;

      if (profile.role !== 'admin') {
        throw new Error('Access denied. Admin privileges required.');
      }

      setUser(data.user);
      setShowAuth(false);
      localStorage.setItem('adminUser', JSON.stringify(data.user));
      loadStops();
      loadRoutes();
    }
  } catch (error) {
    console.error('Login error:', error);
    alert(error.message || 'Login failed');
  } finally {
    setIsLoading(false);
  }
};

// Add this new function for password reset
const handleForgotPassword = async () => {
  if (!authEmail) {
    alert('Please enter your email address to reset password');
    return;
  }

  setIsLoading(true);
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(authEmail, {
        redirectTo: 'https://ghanatrotrotransit.netlify.app/reset-password',
      });

      if (error) throw error;
      
      alert(
        'Password Reset Email Sent',
        `Check ${authEmail} for the password reset link. The link will expire in 24 hours.`
      );    
  } catch (error) {
    console.error('Unexpected error:', error);
    alert('An unexpected error occurred. Please try again.');
  } finally {
    setIsLoading(false);
  }
};

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to logout?')) {
      try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        
        setUser(null);
        setShowAuth(true);
        setStops([]);
        setRoutes([]);
        setShowBottomSheet(false);
        localStorage.removeItem('adminUser');
      } catch (error) {
        console.error('Logout error:', error);
        alert('Failed to logout');
      }
    }
  };

  const handleMapPress = (lat, lng) => {
    if (isSelectingLocation) {
      if (editingStop) {
        setEditingStop(prev => ({
          ...prev,
          latitude: lat,
          longitude: lng
        }));
      } else {
        setNewStop(prev => ({
          ...prev,
          latitude: lat,
          longitude: lng
        }));
      }
      setIsSelectingLocation(false);
    }
  };

  const handleAddStop = async () => {
    if (!newStop.name || !newStop.latitude || !newStop.longitude) {
      alert('Please fill all fields and select a location');
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('stops')
        .insert([{
          name: newStop.name,
          latitude: newStop.latitude,
          longitude: newStop.longitude
        }])
        .select();

      if (error) throw error;
      
      alert('Stop added successfully!');
      setNewStop({ name: '', latitude: null, longitude: null });
      loadStops();
    } catch (error) {
      console.error('Error adding stop:', error);
      alert('Failed to add stop');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditStop = (stop) => {
    setEditingStop(stop);
    setIsSelectingLocation(true);
  };

  const handleUpdateStop = async () => {
    if (!editingStop) return;

    if (!editingStop.name || !editingStop.latitude || !editingStop.longitude) {
      alert('Please fill all fields and select a location');
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('stops')
        .update({
          name: editingStop.name,
          latitude: editingStop.latitude,
          longitude: editingStop.longitude
        })
        .eq('id', editingStop.id);

      if (error) throw error;
      
      alert('Stop updated successfully!');
      setEditingStop(null);
      setIsSelectingLocation(false);
      loadStops();
    } catch (error) {
      console.error('Error updating stop:', error);
      alert('Failed to update stop');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteStop = async (stopId) => {
    if (window.confirm('Are you sure you want to delete this stop? This action cannot be undone.')) {
      try {
        const { error } = await supabase
          .from('stops')
          .delete()
          .eq('id', stopId);

        if (error) throw error;
        
        alert('Stop deleted successfully!');
        loadStops();
      } catch (error) {
        alert('Failed to delete stop');
      }
    }
  };

  // Route management functions
  const handleAddRouteStop = (stop) => {
    setNewRoute(prev => ({
      ...prev,
      stops: [...prev.stops, stop],
      fares: [...prev.fares, ''],
      distances: [...prev.distances, '']
    }));
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleRemoveRouteStop = (index) => {
    const newStops = newRoute.stops.filter((_, i) => i !== index);
    const newFares = newRoute.fares.filter((_, i) => i !== index);
    const newDistances = newRoute.distances.filter((_, i) => i !== index);
    setNewRoute(prev => ({ 
      ...prev, 
      stops: newStops,
      fares: newFares,
      distances: newDistances
    }));
  };

  const handleAddRoute = async () => {
    if (newRoute.stops.length < 2) {
      alert('A route must have at least 2 stops');
      return;
    }

    if (!newRoute.name) {
      alert('Please enter a route name');
      return;
    }

    for (let i = 0; i < newRoute.stops.length - 1; i++) {
      if (!newRoute.fares[i]) {
        alert('Please enter fare for all segments');
        return;
      }
    }

    setIsLoading(true);
    try {
      const total_distance = newRoute.distances.reduce((sum, dist) => sum + parseFloat(dist || 0), 0);
      const total_fare = newRoute.fares.reduce((sum, fare) => sum + parseFloat(fare || 0), 0);

      const { data: routeData, error: routeError } = await supabase
        .from('routes')
        .insert([{
          name: newRoute.name,
          total_distance,
          total_fare
        }])
        .select();

      if (routeError) throw routeError;

      const routeStops = newRoute.stops.map((stop, index) => ({
        route_id: routeData[0].id,
        stop_id: stop.id,
        stop_order: index,
        fare_to_next: index < newRoute.fares.length ? parseFloat(newRoute.fares[index]) : null,
        distance_to_next: index < newRoute.distances.length ? parseFloat(newRoute.distances[index]) : null
      }));

      const { error: stopsError } = await supabase
        .from('route_stops')
        .insert(routeStops);

      if (stopsError) throw stopsError;

      alert('Route added successfully!');
      setNewRoute({ name: '', stops: [], fares: [], distances: [] });
      loadRoutes();
    } catch (error) {
      console.error('Error adding route:', error);
      alert('Failed to add route');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditRoute = (route) => {
    setEditingRoute(route);
    setEditRouteData({
      name: route.name,
      stops: route.route_stops.map(rs => rs.stops),
      fares: route.route_stops.map(rs => rs.fare_to_next?.toString() || ''),
      distances: route.route_stops.map(rs => rs.distance_to_next?.toString() || '')
    });
  };

  const handleRemoveEditRouteStop = (index) => {
    const newStops = editRouteData.stops.filter((_, i) => i !== index);
    const newFares = editRouteData.fares.filter((_, i) => i !== index);
    const newDistances = editRouteData.distances.filter((_, i) => i !== index);
    
    setEditRouteData(prev => ({ 
      ...prev, 
      stops: newStops,
      fares: newFares,
      distances: newDistances
    }));
  };

  const handleUpdateRoute = async () => {
    if (!editingRoute) return;

    if (editRouteData.stops.length < 2) {
      alert('A route must have at least 2 stops');
      return;
    }

    if (!editRouteData.name) {
      alert('Please enter a route name');
      return;
    }

    setIsLoading(true);
    try {
      const total_distance = editRouteData.distances.reduce((sum, dist) => sum + parseFloat(dist || 0), 0);
      const total_fare = editRouteData.fares.reduce((sum, fare) => sum + parseFloat(fare || 0), 0);

      const { error: routeError } = await supabase
        .from('routes')
        .update({
          name: editRouteData.name,
          total_distance,
          total_fare
        })
        .eq('id', editingRoute.id);

      if (routeError) throw routeError;

      const { error: deleteError } = await supabase
        .from('route_stops')
        .delete()
        .eq('route_id', editingRoute.id);

      if (deleteError) throw deleteError;

      const routeStops = editRouteData.stops.map((stop, index) => ({
        route_id: editingRoute.id,
        stop_id: stop.id,
        stop_order: index,
        fare_to_next: index < editRouteData.fares.length ? parseFloat(editRouteData.fares[index]) : null,
        distance_to_next: index < editRouteData.distances.length ? parseFloat(editRouteData.distances[index]) : null
      }));

      const { error: stopsError } = await supabase
        .from('route_stops')
        .insert(routeStops);

      if (stopsError) throw stopsError;

      alert('Route updated successfully!');
      setEditingRoute(null);
      setEditRouteData({ name: '', stops: [], fares: [], distances: [] });
      loadRoutes();
    } catch (error) {
      console.error('Error updating route:', error);
      alert('Failed to update route');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteRoute = async (routeId) => {
    if (window.confirm('Are you sure you want to delete this route? This action cannot be undone.')) {
      try {
        const { error } = await supabase
          .from('routes')
          .delete()
          .eq('id', routeId);

        if (error) throw error;
        
        alert('Route deleted successfully!');
        loadRoutes();
      } catch (error) {
        alert('Failed to delete route');
      }
    }
  };

  // Route Finder functions
  const handleStopSearch = (query, field) => {
    if (query.length < 1) {
      setStopSuggestions({ start: [], destination: [] });
      return;
    }

    const filtered = stops.filter(stop =>
      stop.name.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 5);

    setStopSuggestions(prev => ({
      ...prev,
      [field]: filtered
    }));
  };

  const handleStartPointChange = (text) => {
    setStartPoint(text);
    handleStopSearch(text, 'start');
  };

  const handleDestinationPointChange = (text) => {
    setDestinationPoint(text);
    handleStopSearch(text, 'destination');
  };

  const handleStopSuggestionSelect = (stopName, field) => {
    if (field === 'start') {
      setStartPoint(stopName);
    } else {
      setDestinationPoint(stopName);
    }
    setStopSuggestions({ start: [], destination: [] });
  };

  // UPDATED: Enhanced route finding algorithm with diverse route options
const findRoutesBetweenStops = async (startName, destinationName) => {
  try {
    setIsLoading(true);
    
    console.log('🔍 Finding routes between:', startName, 'and', destinationName);
    console.log('📊 Total stops in database:', stops.length);
    
    // Find start and destination stops with exact or partial matching
    const startStop = stops.find(stop => 
      stop.name.toLowerCase().includes(startName.toLowerCase()) ||
      startName.toLowerCase().includes(stop.name.toLowerCase())
    );
    
    const destinationStop = stops.find(stop => 
      stop.name.toLowerCase().includes(destinationName.toLowerCase()) ||
      destinationName.toLowerCase().includes(stop.name.toLowerCase())
    );

    console.log('📍 Found stops:', { startStop, destinationStop });

    if (!startStop || !destinationStop) {
      alert('Start or destination stop not found in database');
      return;
    }

    if (startStop.id === destinationStop.id) {
      alert('Start and destination cannot be the same stop');
      return;
    }

    // Generate diverse route options
    const foundRoutes = generateDiverseRouteOptions(startStop, destinationStop, stops);
    
    console.log('🛣️ Found routes:', foundRoutes.length);

    if (foundRoutes.length === 0) {
      alert('Could not generate routes between these stops. Please ensure you have enough stops in your database.');
      return;
    }

    setFoundRoutes(foundRoutes);
    setSelectedRoutes([]);
    setShowRouteSelection(true);
    setShowRouteFinder(false);

  } catch (error) {
    console.error('❌ Error finding routes:', error);
    alert('Failed to find routes: ' + error.message);
  } finally {
    setIsLoading(false);
  }
};

// NEW: Generate diverse route options including both shortest and alternative routes
const generateDiverseRouteOptions = (startStop, destinationStop, allStops) => {
  const routes = [];
  
  // Filter out start and destination stops for intermediate options
  const availableStops = allStops.filter(stop => 
    stop.id !== startStop.id && stop.id !== destinationStop.id
  );
  
  console.log('🔄 Available intermediate stops:', availableStops.length);
  
  // Route generation helpers with different intermediate stop counts
  const directRoute = createDirectRoute(startStop, destinationStop);
  if (directRoute) routes.push(directRoute);
  
  const oneStopRoutes = generateRoutesWithNStops(startStop, destinationStop, availableStops, 1);
  routes.push(...oneStopRoutes.slice(0, 20));
  
  const twoStopRoutes = generateRoutesWithNStops(startStop, destinationStop, availableStops, 2);
  routes.push(...twoStopRoutes.slice(0, 20));
  
  const threeStopRoutes = generateRoutesWithNStops(startStop, destinationStop, availableStops, 3);
  routes.push(...threeStopRoutes.slice(0, 20));

  const fourStopRoutes = generateRoutesWithNStops(startStop, destinationStop, availableStops, 4);
  routes.push(...fourStopRoutes.slice(0, 20));

  const fiveStopRoutes = generateRoutesWithNStops(startStop, destinationStop, availableStops, 5);
  routes.push(...fiveStopRoutes.slice(0, 15));

  const sixStopRoutes = generateRoutesWithNStops(startStop, destinationStop, availableStops, 6);
  routes.push(...sixStopRoutes.slice(0, 15));

  const sevenStopRoutes = generateRoutesWithNStops(startStop, destinationStop, availableStops, 7);
  routes.push(...sevenStopRoutes.slice(0, 10));

  const eightStopRoutes = generateRoutesWithNStops(startStop, destinationStop, availableStops, 8);
  routes.push(...eightStopRoutes.slice(0, 5));
  
  // Remove duplicates and sort by distance
  const uniqueRoutes = removeDuplicateRoutes(routes);
  
  // Sort by distance and take top 20 routes for variety
  const sortedRoutes = uniqueRoutes
    .sort((a, b) => parseFloat(a.totalDistance) - parseFloat(b.totalDistance))
    .slice(0, 80)
    .map((route, index) => ({
      ...route,
      name: `${startStop.name} to ${destinationStop.name}`,
      id: `found-route-${Date.now()}-${index}`
    }));
  
  console.log('✅ Generated diverse routes:', sortedRoutes.length);
  return sortedRoutes;
};

// NEW: Generate routes with exactly N intermediate stops
const generateRoutesWithNStops = (startStop, destinationStop, availableStops, intermediateCount) => {
  const routes = [];
  
  if (availableStops.length < intermediateCount) {
    return routes;
  }
  
  // Calculate direct distance for reference
  const directDistance = calculateDistance(
    startStop.latitude, startStop.longitude,
    destinationStop.latitude, destinationStop.longitude
  );
  
  // Get stops that are geographically reasonable
  const reasonableStops = availableStops
    .map(stop => ({
      stop,
      distanceToStart: calculateDistance(startStop.latitude, startStop.longitude, stop.latitude, stop.longitude),
      distanceToDest: calculateDistance(stop.latitude, stop.longitude, destinationStop.latitude, destinationStop.longitude),
      totalDetour: calculateDistance(startStop.latitude, startStop.longitude, stop.latitude, stop.longitude) +
                   calculateDistance(stop.latitude, stop.longitude, destinationStop.latitude, destinationStop.longitude)
    }))
    // Include stops that create reasonable detours (not too far from direct path)
    .filter(intermediate => intermediate.totalDetour < directDistance * 3) // Allow up to 3x detour
    .sort((a, b) => a.totalDetour - b.totalDetour); // Sort by least detour first
  
  console.log(`📍 Reasonable stops for ${intermediateCount} intermediates:`, reasonableStops.length);
  
  // For 1 intermediate stop
  if (intermediateCount === 1) {
    // Take both shortest and some alternative routes
    const shortestOptions = reasonableStops.slice(0, 10); // Top 8 shortest
    const alternativeOptions = getAlternativeStops(reasonableStops, 6); // 4 alternative routes
    
    [...shortestOptions, ...alternativeOptions].forEach(({ stop }) => {
      const routeStops = [startStop, stop, destinationStop];
      const totalDistance = calculateRouteDistance(routeStops);
      
      routes.push({
        stops: routeStops,
        totalDistance: totalDistance.toFixed(2),
        fares: Array(routeStops.length - 1).fill(''),
        type: '1_intermediate'
      });
    });
  }
  
  // For 2 intermediate stops
  else if (intermediateCount === 2) {
    const selectedRoutes = [];
    
    // Generate combinations of 2 stops from reasonable stops
    for (let i = 0; i < Math.min(reasonableStops.length - 1, 10); i++) {
      for (let j = i + 1; j < Math.min(reasonableStops.length, 15); j++) {
        const stop1 = reasonableStops[i].stop;
        const stop2 = reasonableStops[j].stop;
        
        // Try different orderings
        const order1 = [startStop, stop1, stop2, destinationStop];
        const order2 = [startStop, stop2, stop1, destinationStop];
        
        const distance1 = calculateRouteDistance(order1);
        const distance2 = calculateRouteDistance(order2);
        
        // Take the better ordering
        const bestOrder = distance1 <= distance2 ? order1 : order2;
        const bestDistance = Math.min(distance1, distance2);
        
        selectedRoutes.push({
          stops: bestOrder,
          distance: bestDistance,
          type: '2_intermediate'
        });
      }
    }
    
    // Sort by distance and take diverse options
    selectedRoutes.sort((a, b) => a.distance - b.distance);
    
    // Take shortest routes and some alternatives
    const shortest = selectedRoutes.slice(0, 10);
    const alternatives = getAlternativeRoutes(selectedRoutes, 10);
    
    [...shortest, ...alternatives].forEach(route => {
      routes.push({
        stops: route.stops,
        totalDistance: route.distance.toFixed(2),
        fares: Array(route.stops.length - 1).fill(''),
        type: route.type
      });
    });
  }
  
  // For 3+ intermediate stops
  else if (intermediateCount >= 3) {
    const selectedRoutes = [];
    
    // Generate combinations focusing on alternative paths
    for (let i = 0; i < Math.min(reasonableStops.length - 2, 8); i++) {
      for (let j = i + 1; j < Math.min(reasonableStops.length - 1, 12); j++) {
        for (let k = j + 1; k < Math.min(reasonableStops.length, 15); k++) {
          const stops = [reasonableStops[i].stop, reasonableStops[j].stop, reasonableStops[k].stop];
          
          // Generate different permutations for route diversity
          const permutations = generateStopPermutations(startStop, destinationStop, stops);
          
          permutations.forEach(routeStops => {
            const distance = calculateRouteDistance(routeStops);
            
            // Include routes that are alternative paths (not necessarily shortest)
            if (distance < directDistance * 5) { // Allow longer alternative routes
              selectedRoutes.push({
                stops: routeStops,
                distance: distance,
                type: `${intermediateCount}_intermediate`
              });
            }
          });
        }
      }
    }
    
    // Sort and take diverse options
    selectedRoutes.sort((a, b) => a.distance - b.distance);
    
    // Mix of shortest and alternative routes
    const shortest = selectedRoutes.slice(0, 10);
    const alternatives = getAlternativeRoutes(selectedRoutes, 10);
    
    [...shortest, ...alternatives].forEach(route => {
      routes.push({
        stops: route.stops,
        totalDistance: route.distance.toFixed(2),
        fares: Array(route.stops.length - 1).fill(''),
        type: route.type
      });
    });
  }
  
  return routes;
};

// NEW: Helper function to get alternative stops (not just the shortest)
const getAlternativeStops = (stops, count) => {
  if (stops.length <= count) return stops;
  
  // Take some from the middle and end of the sorted list for diversity
  const alternativeIndices = [];
  const step = Math.max(1, Math.floor(stops.length / count));
  
  for (let i = 0; i < count; i++) {
    const index = Math.min(stops.length - 1, (i + 1) * step);
    alternativeIndices.push(index);
  }
  
  return alternativeIndices.map(index => stops[index]);
};

// NEW: Helper function to get alternative routes
const getAlternativeRoutes = (routes, count) => {
  if (routes.length <= count) return routes;
  
  const alternatives = [];
  const step = Math.max(1, Math.floor(routes.length / count));
  
  for (let i = 0; i < count; i++) {
    const index = Math.min(routes.length - 1, (i + 1) * step);
    alternatives.push(routes[index]);
  }
  
  return alternatives;
};

// NEW: Generate different stop permutations for route diversity
const generateStopPermutations = (start, destination, intermediateStops) => {
  const permutations = [];
  
  // Simple approach: try a few different orderings
  if (intermediateStops.length === 3) {
    const [a, b, c] = intermediateStops;
    
    // Different logical orderings
    permutations.push(
      [start, a, b, c, destination],
      [start, a, c, b, destination],
      [start, b, a, c, destination],
      [start, c, a, b, destination]
    );
  }
  
  return permutations;
};

// NEW: Remove duplicate routes
const removeDuplicateRoutes = (routes) => {
  const seen = new Set();
  const unique = [];
  
  routes.forEach(route => {
    const key = route.stops.map(stop => stop.id).join('-');
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(route);
    }
  });
  
  return unique;
};

// Create direct route between two stops
const createDirectRoute = (startStop, destinationStop) => {
  const stops = [startStop, destinationStop];
  const totalDistance = calculateDistance(
    startStop.latitude,
    startStop.longitude,
    destinationStop.latitude,
    destinationStop.longitude
  );
  
  return {
    stops,
    totalDistance: totalDistance.toFixed(2),
    fares: Array(stops.length - 1).fill(''),
    type: 'direct'
  };
};

// Calculate total distance for a route
const calculateRouteDistance = (stops) => {
  let totalDistance = 0;
  for (let i = 0; i < stops.length - 1; i++) {
    totalDistance += calculateDistance(
      stops[i].latitude,
      stops[i].longitude,
      stops[i + 1].latitude,
      stops[i + 1].longitude
    );
  }
  return totalDistance;
};

  const handleRouteToggle = (routeIndex) => {
    setSelectedRoutes(prev => 
      prev.includes(routeIndex)
        ? prev.filter(idx => idx !== routeIndex)
        : [...prev, routeIndex]
    );
  };

  const handleRouteFareChange = (routeIndex, stopIndex, fare) => {
    setFoundRoutes(prev => {
      const updated = [...prev];
      updated[routeIndex].fares[stopIndex] = fare;
      return updated;
    });
  };

  const handleSaveSelectedRoutes = async () => {
    if (selectedRoutes.length === 0) {
      alert('Please select at least one route');
      return;
    }

    setIsLoading(true);
    try {
      let savedCount = 0;
      
      for (const routeIndex of selectedRoutes) {
        const route = foundRoutes[routeIndex];
        
        // Validate fares
        const hasEmptyFares = route.fares.some(fare => !fare || fare === '');
        if (hasEmptyFares) {
          alert(`Please fill all fares for Route ${routeIndex + 1}`);
          return;
        }

        const total_distance = calculateRouteDistance(route.stops);
        const total_fare = route.fares.reduce((sum, fare) => sum + parseFloat(fare || 0), 0);

        // Insert route
        const { data: routeData, error: routeError } = await supabase
          .from('routes')
          .insert([{
            name: `${route.stops[0].name} to ${route.stops[route.stops.length - 1].name}`,
            total_distance,
            total_fare
          }])
          .select();

        if (routeError) throw routeError;

        // Insert route stops
        const routeStops = route.stops.map((stop, index) => ({
          route_id: routeData[0].id,
          stop_id: stop.id,
          stop_order: index,
          fare_to_next: index < route.fares.length ? parseFloat(route.fares[index]) : null,
          distance_to_next: index < route.stops.length - 1 ? 
            calculateDistance(
              stop.latitude,
              stop.longitude,
              route.stops[index + 1].latitude,
              route.stops[index + 1].longitude
            ) : null
        }));

        const { error: stopsError } = await supabase
          .from('route_stops')
          .insert(routeStops);

        if (stopsError) throw stopsError;

        savedCount++;
      }

      alert(`${savedCount} route(s) added successfully!`);
      setShowRouteSelection(false);
      setFoundRoutes([]);
      setSelectedRoutes([]);
      loadRoutes();
      
    } catch (error) {
      console.error('Error saving routes:', error);
      alert('Failed to save routes: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleBottomSheet = () => {
    setShowBottomSheet(!showBottomSheet);
    if (editingStop) {
      setEditingStop(null);
    }
    if (editingRoute) {
      setEditingRoute(null);
    }
    if (showRouteFinder) {
      setShowRouteFinder(false);
    }
  };

  if (showAuth) {
  return (
    <AuthForm
      authEmail={authEmail}
      authPassword={authPassword}
      onEmailChange={setAuthEmail}
      onPasswordChange={setAuthPassword}
      onLogin={handleAdminLogin}
      onForgotPassword={handleForgotPassword}
      isLoading={isLoading}
    />
  );
}

  return (
    <div className="container">
      <div className="map-container">
        <MapComponent 
          center={MAP_CONFIG.center}
          stops={stops}
          selectedStop={editingStop || (newStop.latitude ? newStop : null)}
          onMapPress={handleMapPress}
          isSelectingLocation={isSelectingLocation}
        />
      </div>

      <div className="header-buttons">
        <button className="profile-button" onClick={handleLogout}>
          <LogOut size={20} />
        </button>
        <button className="menu-button" onClick={toggleBottomSheet}>
          <Settings size={20} />
        </button>
      </div>

      {showBottomSheet && (
        <div className={`bottom-sheet ${showBottomSheet ? 'slide-in' : 'slide-out'}`}>
          <div className="bottom-sheet-header">
            <div className="tab-container">
              <button 
                className={`tab ${activeSection === 'stops' ? 'active-tab' : ''}`}
                onClick={() => {
                  setActiveSection('stops');
                  setShowRouteFinder(false);
                }}
              >
                <MapPin size={16} />
                Stops
              </button>
              <button 
                className={`tab ${activeSection === 'routes' ? 'active-tab' : ''}`}
                onClick={() => {
                  setActiveSection('routes');
                  setShowRouteFinder(false);
                }}
              >
                <Route size={16} />
                Routes
              </button>
            </div>
            <button className="close-button" onClick={toggleBottomSheet}>
              <X size={20} />
            </button>
          </div>

          <div className="bottom-sheet-content">
            {activeSection === 'stops' && (
              <div className="management-container">
                {editingStop ? (
                  <div className="form-container">
                    <h2 className="form-title">Edit Stop</h2>
                    
                    <div className="input-group">
                      <input
                        className="input"
                        placeholder="Stop Name"
                        value={editingStop.name}
                        onChange={(e) => setEditingStop(prev => ({ ...prev, name: e.target.value }))}
                      />
                    </div>
                    
                    <button 
                      className="location-button"
                      onClick={() => setIsSelectingLocation(true)}
                    >
                      <MapPin size={20} />
                      Update Location on Map
                    </button>
                    
                    <div className="coordinates-container">
                      <p className="location-text">Current Coordinates:</p>
                      <p className="coordinates-text">Lat: {editingStop.latitude.toFixed(6)}</p>
                      <p className="coordinates-text">Lng: {editingStop.longitude.toFixed(6)}</p>
                    </div>
                    
                    <div className="button-row">
                      <button 
                        className="cancel-button"
                        onClick={() => setEditingStop(null)}
                      >
                        Cancel
                      </button>
                      
                      <button 
                        className={`save-button ${isLoading ? 'save-button-disabled' : ''}`}
                        onClick={handleUpdateStop}
                        disabled={isLoading}
                      >
                        {isLoading ? <div className="spinner"></div> : 'Update Stop'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <StopForm
                    newStop={newStop}
                    onStopNameChange={(text) => setNewStop(prev => ({ ...prev, name: text }))}
                    onSelectLocation={() => setIsSelectingLocation(true)}
                    onAddStop={handleAddStop}
                    onCancel={() => setNewStop({ name: '', latitude: null, longitude: null })}
                    isLoading={isLoading}
                  />
                )}

                <div className="stops-list">
                  <h3 className="list-title">Existing Stops ({stops.length})</h3>
                  <div className="search-container">
                    <Search size={20} color="#6b7280" />
                    <input
                      className="search-input"
                      placeholder="Search stops..."
                      value={stopSearchQuery}
                      onChange={(e) => setStopSearchQuery(e.target.value)}
                    />
                  </div>
                  <div className="items-container">
                    {filteredStops.map((stop) => (
                      <div key={stop.id} className="item-card">
                        <div className="item-info">
                          <h4 className="item-name">{stop.name}</h4>
                          <p className="item-coordinates">
                            {stop.latitude.toFixed(6)}, {stop.longitude.toFixed(6)}
                          </p>
                        </div>
                        <div className="item-actions">
                          <button 
                            className="edit-button"
                            onClick={() => handleEditStop(stop)}
                          >
                            <Edit3 size={16} />
                          </button>
                          <button 
                            className="delete-button"
                            onClick={() => handleDeleteStop(stop.id)}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'routes' && (
              <div className="management-container">
                {editingRoute ? (
                  <div className="form-container">
                    <h2 className="form-title">Edit Route</h2>
                    
                    <div className="input-group">
                      <input
                        className="input"
                        placeholder="Route Name"
                        value={editRouteData.name}
                        onChange={(e) => setEditRouteData(prev => ({ ...prev, name: e.target.value }))}
                      />
                    </div>

                    <h3 className="sub-section-title">
                      Route Stops ({editRouteData.stops.length})
                    </h3>
                    
                    {editRouteData.stops.map((stop, index) => (
                      <div key={index} className="selected-stop-item">
                        <div className="stop-number">
                          <span className="stop-number-text">{index + 1}</span>
                        </div>
                        <div className="selected-stop-info">
                          <span className="selected-stop-name">{stop.name}</span>
                          {index < editRouteData.stops.length - 1 && (
                            <div className="fare-input-container">
                              <input
                                className="fare-input"
                                placeholder="Fare to next (GH₵)"
                                value={editRouteData.fares[index]}
                                onChange={(e) => {
                                  const newFares = [...editRouteData.fares];
                                  newFares[index] = e.target.value;
                                  setEditRouteData(prev => ({ ...prev, fares: newFares }));
                                }}
                                type="number"
                                step="0.01"
                              />
                              <input
                                className="distance-input"
                                placeholder="Distance (km)"
                                value={editRouteData.distances[index]}
                                readOnly
                              />
                            </div>
                          )}
                        </div>
                        <button 
                          className="remove-button"
                          onClick={() => handleRemoveEditRouteStop(index)}
                        >
                          <X size={16} color="#EF4444" />
                        </button>
                      </div>
                    ))}

                    <div className="button-row">
                      <button 
                        className="cancel-button"
                        onClick={() => setEditingRoute(null)}
                      >
                        Cancel
                      </button>
                      
                      <button 
                        className={`save-button ${isLoading ? 'save-button-disabled' : ''}`}
                        onClick={handleUpdateRoute}
                        disabled={isLoading}
                      >
                        {isLoading ? <div className="spinner"></div> : 'Update Route'}
                      </button>
                    </div>
                  </div>
                ) : showRouteFinder ? (
                  <RouteFinder
                    startPoint={startPoint}
                    destinationPoint={destinationPoint}
                    onStartPointChange={handleStartPointChange}
                    onDestinationPointChange={handleDestinationPointChange}
                    onFindRoutes={() => findRoutesBetweenStops(startPoint, destinationPoint)}
                    onCancel={() => setShowRouteFinder(false)}
                    isLoading={isLoading}
                    stopSuggestions={stopSuggestions}
                    onStopSuggestionSelect={handleStopSuggestionSelect}
                  />
                ) : (
                  <RouteForm
                    newRoute={newRoute}
                    onRouteNameChange={(text) => setNewRoute(prev => ({ ...prev, name: text }))}
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    searchResults={searchResults}
                    onAddRouteStop={handleAddRouteStop}
                    onFareChange={(text, index) => {
                      const newFares = [...newRoute.fares];
                      newFares[index] = text;
                      setNewRoute(prev => ({ ...prev, fares: newFares }));
                    }}
                    onRemoveStop={handleRemoveRouteStop}
                    onAddRoute={handleAddRoute}
                    onCancel={() => setNewRoute({ name: '', stops: [], fares: [], distances: [] })}
                    onOpenRouteFinder={() => setShowRouteFinder(true)}
                    isLoading={isLoading}
                  />
                )}

                {!editingRoute && !showRouteFinder && (
                  <div className="routes-list">
                    <h3 className="list-title">Existing Routes ({routes.length})</h3>
                    <div className="search-container">
                      <Search size={20} color="#6b7280" />
                      <input
                        className="search-input"
                        placeholder="Search routes..."
                        value={routeSearchQuery}
                        onChange={(e) => setRouteSearchQuery(e.target.value)}
                      />
                    </div>
                    <div className="items-container">
                      {filteredRoutes.map((route) => (
                        <div key={route.id} className="item-card">
                          <div className="item-info">
                            <h4 className="item-name">{route.name}</h4>
                            <p className="item-details">
                              {route.route_stops?.length || 0} stops • 
                              GH₵ {route.total_fare} • 
                              {route.total_distance}km
                            </p>
                            <p className="item-path">
                              {route.route_stops?.map(rs => rs.stops.name).join(' → ')}
                            </p>
                          </div>
                          <div className="item-actions">
                            <button 
                              className="edit-button"
                              onClick={() => handleEditRoute(route)}
                            >
                              <Edit3 size={16} />
                            </button>
                            <button 
                              className="delete-button"
                              onClick={() => handleDeleteRoute(route.id)}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      <RouteSelectionModal
        visible={showRouteSelection}
        foundRoutes={foundRoutes}
        selectedRoutes={selectedRoutes}
        onRouteToggle={handleRouteToggle}
        onFareChange={handleRouteFareChange}
        onSaveRoutes={handleSaveSelectedRoutes}
        onCancel={() => setShowRouteSelection(false)}
        isLoading={isLoading}
      />

      {isSelectingLocation && (
        <div className="overlay">
          <p className="overlay-text">
            <MapPin size={20} />
            Click anywhere on the map to select location
          </p>
          <button 
            className="overlay-button"
            onClick={() => {
              setIsSelectingLocation(false);
              if (editingStop) setEditingStop(null);
            }}
          >
            Cancel Selection
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminHomeScreen;