
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
  Check,
  Plus,
  Filter,
  Download,
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
  CalendarDays
} from 'lucide-react';

// Ghana regions
const GHANA_REGIONS = [
  { name: 'Greater Accra' },
  { name: 'Ashanti' },
  { name: 'Western' },
  { name: 'Central' },
  { name: 'Eastern'},
  { name: 'Volta' },
  { name: 'Northern' },
  { name: 'Upper East' },
  { name: 'Upper West'},
  { name: 'Brong-Ahafo' },
  { name: 'Western North' },
  { name: 'Oti'},
  { name: 'Ahafo' },
  { name: 'Bono East' },
  { name: 'Savannah' },
  { name: 'North East'}
];

// Route Information Form Component
const RouteInfoForm = ({
  routeInfo,
  onInfoChange,
  onAmenityToggle,
  onOperatingHoursChange,
  onOperatingDayToggle
}) => {
  const vehicleTypes = [
    'Trotro (Minibus)',
    'Bus (Large)',
    'Shared Taxi',
    'Metro Mass Transit',
    'STC Bus',
    'VIP Bus',
    'Other'
  ];

  const amenitiesList = [
    { id: 'air_conditioning', label: 'Air Conditioning', icon: <Thermometer size={16} /> },
    { id: 'charging_ports', label: 'Charging Ports', icon: <Hash size={16} /> },
    { id: 'tv', label: 'TV', icon: <Tv size={16} /> },
    { id: 'restroom', label: 'Restroom', icon: <Building size={16} /> },
    { id: 'luggage_space', label: 'Luggage Space (Paid)', icon: <Package size={16} /> },
    { id: 'first_aid', label: 'First Aid Kit', icon: <Plus size={16} /> }
  ];

  const daysOfWeek = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday'
  ];

  const frequencyOptions = [
    'Every 5 minutes',
    'Every 10 minutes',
    'Every 15 minutes',
    'Every 20 minutes',
    'Every 30 minutes',
    'Hourly',
    'Every 2 hours',
    'Irregular'
  ];

  return (
    <div className="route-info-form">
      <div className="route-info-header">
        <Info size={20} color="#6b21a8" />
        <h3 className="sub-section-title">Route Information</h3>
      </div>

      <div className="input-group">
            <label className="input-label">
              <Type size={14} />
              Description
            </label>
            <textarea
              className="input textarea"
              placeholder="Describe this route (e.g., 'Connects residential areas to business district via main highways')"
              value={routeInfo.description}
              onChange={(e) => onInfoChange('description', e.target.value)}
              rows={3}
            />
          </div>
      
      <div className="info-grid">
        {/* Left Column */}
        <div className="info-column">

          <div className="input-group">
            <label className="input-label">
              <Clock size={14} />
              Travel Time (minutes)
            </label>
            <input
              className="input"
              placeholder="e.g., 45"
              value={routeInfo.travelTimeMinutes}
              onChange={(e) => onInfoChange('travelTimeMinutes', e.target.value)}
              type="number"
              min="1"
              max="300"
            />
          </div>

          <div className="input-group">
            <label className="input-label">
              <CalendarDays size={14} />
              Frequency
            </label>
            <select
              className="input"
              value={routeInfo.frequency}
              onChange={(e) => onInfoChange('frequency', e.target.value)}
            >
              <option value="">Select frequency</option>
              {frequencyOptions.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>

          <div className="input-group">
            <label className="input-label">
              <AlertCircle size={14} />
              Peak Hours
            </label>
            <input
              className="input"
              placeholder="e.g., '7-9 AM, 4-7 PM'"
              value={routeInfo.peakHours}
              onChange={(e) => onInfoChange('peakHours', e.target.value)}
            />
          </div>
        </div>

        {/* Right Column */}
        <div className="info-column">
          <div className="input-group">
            <label className="input-label">
              <Bus size={14} />
              Vehicle Type
            </label>
            <select
              className="input"
              value={routeInfo.vehicleType}
              onChange={(e) => onInfoChange('vehicleType', e.target.value)}
            >
              <option value="">Select vehicle type</option>
              {vehicleTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div className="input-group">
            <label className="input-label">
              <Clock size={14} />
              Operating Hours
            </label>
            <div className="operating-hours-container">
              <div className="time-input-group">
                <input
                  className="time-input"
                  type="time"
                  value={routeInfo.operatingHours.start}
                  onChange={(e) => onOperatingHoursChange('start', e.target.value)}
                />
                <span className="time-separator">to</span>
                <input
                  className="time-input"
                  type="time"
                  value={routeInfo.operatingHours.end}
                  onChange={(e) => onOperatingHoursChange('end', e.target.value)}
                />
              </div>
              
              <div className="days-selection">
                <label className="days-label">Operating Days:</label>
                <div className="days-buttons">
                  {daysOfWeek.map(day => (
                    <button
                      key={day}
                      type="button"
                      className={`day-button ${routeInfo.operatingHours.days.includes(day) ? 'day-selected' : ''}`}
                      onClick={() => onOperatingDayToggle(day)}
                    >
                      {day.substring(0, 3)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">
              <Wind size={14} />
              Amenities
            </label>
            <div className="amenities-grid">
              {amenitiesList.map(amenity => (
                <button
                  key={amenity.id}
                  type="button"
                  className={`amenity-button ${routeInfo.amenities.includes(amenity.id) ? 'amenity-selected' : ''}`}
                  onClick={() => onAmenityToggle(amenity.id)}
                >
                  {amenity.icon}
                  <span>{amenity.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="input-group">
        <label className="input-label">
          <Info size={14} />
          Additional Notes
        </label>
        <textarea
          className="input textarea"
          placeholder="Any additional information about this route (road conditions, special services, etc.)"
          value={routeInfo.notes}
          onChange={(e) => onInfoChange('notes', e.target.value)}
          rows={2}
        />
      </div>
    </div>
  );
};

// Search Box with Match Whole Word Toggle
const SearchBox = ({ 
  value, 
  onChange, 
  placeholder, 
  suggestions = [], 
  onSuggestionSelect,
  matchWholeWord = false,
  onMatchWholeWordToggle,
  icon: Icon = Search,
  iconColor = "#6b7280"
}) => {
  return (
    <div className="search-box-container">
      <div className="search-container">
        <Icon size={20} color={iconColor} />
        <input
          className="search-input"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        <button
          className={`match-word-button ${matchWholeWord ? 'match-word-active' : ''}`}
          onClick={onMatchWholeWordToggle}
          title={matchWholeWord ? "Matching whole words only" : "Match partial words"}
        >
          <Type size={16} />
          {matchWholeWord ? 'Whole Word' : 'Partial'}
        </button>
      </div>
      
      {suggestions.length > 0 && (
        <div className="suggestions-container">
          {suggestions.map((stop) => (
            <button
              key={stop.id}
              className="suggestion-item"
              onClick={() => onSuggestionSelect(stop)}
            >
              <MapPin size={16} color="#6b21a8" />
              <span className="suggestion-text">{stop.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

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
  onOpenAutoFinder
}) => {
  return (
    <div className="form-container">
      <h2 className="form-title">Add New Stop</h2>
      
      <button 
        className="auto-finder-button"
        onClick={onOpenAutoFinder}
      >
        <Search size={20} />
        Find Stops Automatically
      </button>
      
      <p className="divider-text">OR</p>
      
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
  onStopSuggestionSelect,
  matchWholeWord,
  onMatchWholeWordToggle
}) => {
  return (
    <div className="form-container">
      <h2 className="form-title">Find Routes Automatically</h2>
      <p className="form-subtitle">Enter start and destination to find diverse routes including shortest and alternative paths</p>
      
      <div className="input-group">
        <SearchBox
          value={startPoint}
          onChange={onStartPointChange}
          placeholder="Start Point (e.g., 'Circle')"
          suggestions={stopSuggestions.start}
          onSuggestionSelect={(stop) => onStopSuggestionSelect(stop.name, 'start')}
          matchWholeWord={matchWholeWord}
          onMatchWholeWordToggle={onMatchWholeWordToggle}
          icon={MapPin}
          iconColor="#6b21a8"
        />
      </div>

      <div className="input-group">
        <SearchBox
          value={destinationPoint}
          onChange={onDestinationPointChange}
          placeholder="Destination Point (e.g., 'Madina')"
          suggestions={stopSuggestions.destination}
          onSuggestionSelect={(stop) => onStopSuggestionSelect(stop.name, 'destination')}
          matchWholeWord={matchWholeWord}
          onMatchWholeWordToggle={onMatchWholeWordToggle}
          icon={MapPin}
          iconColor="#EF4444"
        />
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
  isLoading,
  onRouteInfoChange,
  onAmenityToggle,
  onOperatingHoursChange,
  onOperatingDayToggle,
  matchWholeWord,
  onMatchWholeWordToggle
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
      
      <div className="search-box-container">
        <div className="search-container">
          <Search size={20} color="#6b7280" />
          <input
            className="search-input"
            placeholder="Search for stops..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          <button
            className={`match-word-button ${matchWholeWord ? 'match-word-active' : ''}`}
            onClick={onMatchWholeWordToggle}
            title={matchWholeWord ? "Matching whole words only" : "Match partial words"}
          >
            <Type size={16} />
            {matchWholeWord ? 'Whole Word' : 'Partial'}
          </button>
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
      </div>

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

      {/* Add Route Information Form */}
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
            operatingHours: newRoute.operatingHours
          }}
          onInfoChange={(field, value) => {
            onRouteInfoChange(field, value);
          }}
          onAmenityToggle={(amenity) => {
            onAmenityToggle(amenity);
          }}
          onOperatingHoursChange={(field, value) => {
            onOperatingHoursChange(field, value);
          }}
          onOperatingDayToggle={(day) => {
            onOperatingDayToggle(day);
          }}
        />
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
  isLoading,
  onAddReverseRoute,
  onCloseReverseRoute,
  currentPage,
  routesPerPage,
  onLoadMore,
  hasMoreRoutes,
  onRoutesPerPageChange,
  currentSearchKey,
  routeCache
}) => {
  if (!visible) return null;

  const getRouteTypeLabel = (type) => {
    switch (type) {
      case 'direct': 
      case 'direct_with_station':
        return 'Direct Route';
      case '1_intermediate': 
      case '1_intermediate_with_station':
        return '1 Stop Route';
      case '2_intermediate': 
      case '2_intermediate_with_station':
        return '2 Stop Route';
      case '3_intermediate': 
      case '3_intermediate_with_station':
        return '3 Stop Route';
      default: 
        if (type.includes('direct')) return 'Direct Route';
        if (type.includes('intermediate')) {
          const count = type.match(/\d+/)?.[0] || 'Unknown';
          return `${count} Stop Route`;
        }
        return 'Standard Route';
    }
  };

  const hasStations = (type) => {
    return type.includes('_with_station');
  };

  const startIndex = 0;
  const endIndex = (currentPage + 1) * routesPerPage;
  const currentRoutes = foundRoutes.slice(0, endIndex);

  return (
    <div className="modal-overlay">
      <div className="modal-container large-modal">
        <div className="modal-header sticky-header">
          <button className="back-button" onClick={onCancel}>
            <ArrowLeft size={24} />
          </button>
          <h2 className="modal-title">
            Select Routes ({foundRoutes.length} total, showing {currentRoutes.length})
          </h2>
          <div style={{ width: 24 }} />
        </div>
        
        <div className="search-info">
          <Search size={16} color="#6b7280" />
          <span className="search-info-text">
            Showing {foundRoutes.length} routes • {routeCache.has(currentSearchKey) ? 'Cached results' : 'New search'}
          </span>
        </div>

        <div className="batch-size-selector">
          <label className="batch-size-label">Show per batch:</label>
          <select 
            className="batch-size-select"
            value={routesPerPage}
            onChange={(e) => onRoutesPerPageChange(parseInt(e.target.value))}
          >
            <option value={20}>20 routes</option>
            <option value={50}>50 routes</option>
            <option value={100}>100 routes</option>
          </select>
          <span className="batch-info">
            Page {currentPage + 1} • Showing {Math.min((currentPage + 1) * routesPerPage, foundRoutes.length)} of {foundRoutes.length}
          </span>
        </div>

        <div className="modal-actions-sticky">
          <div className="selected-count">
            {selectedRoutes.length} route(s) selected
          </div>
          <div className="sticky-buttons">
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
              {isLoading ? <div className="spinner"></div> : `Save ${selectedRoutes.length}`}
            </button>
          </div>
        </div>

        <div className="modal-content-with-sticky">
          {currentRoutes.map((route, index) => (
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
                    {hasStations(route.type) && (
                      <span className="route-type-with-station">🚍 Station</span>
                    )}
                    {route.isDuplicate && (
                      <span className="duplicate-badge">⚠️ Duplicate</span>
                    )}
                    {route.hasSubRoutes && (
                      <span className="subroute-badge">🔗 Sub-routes</span>
                    )}
                  </span>
                  <span className="route-type">
                    {getRouteTypeLabel(route.type)} • {route.stops.length - 2} intermediate stops
                  </span>
                </div>
              </button>
              
              {selectedRoutes.includes(index) && (
                <div className="fare-section">
                  <div className="fare-section-header">
                    <span className="fare-section-title">Set Fares:</span>
                    <div className="fare-section-actions">
                      {!route.reverseRoute ? (
                        <button
                          className="reverse-route-button"
                          onClick={() => onAddReverseRoute(index)}
                        >
                          <Route size={16} />
                          Add Reverse Route
                        </button>
                      ) : (
                        <button
                          className="close-reverse-route-button"
                          onClick={() => onCloseReverseRoute(index)}
                        >
                          <X size={16} />
                          Remove Reverse
                        </button>
                      )}
                    </div>
                  </div>
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
                  
                  {route.reverseRoute && (
                    <div className="reverse-route-section">
                      <div className="reverse-route-header">
                        <h4 className="reverse-route-title">Reverse Route</h4>
                        <button
                          className="close-reverse-button"
                          onClick={() => onCloseReverseRoute(index)}
                        >
                          <X size={14} />
                        </button>
                      </div>
                      {route.reverseRoute.stops.map((stop, stopIndex) => (
                        stopIndex < route.reverseRoute.stops.length - 1 && (
                          <div key={stopIndex} className="fare-input-row reverse">
                            <span className="fare-label">
                              {stop.name} → {route.reverseRoute.stops[stopIndex + 1].name}
                            </span>
                            <input
                              className="fare-input-small"
                              placeholder="GH₵ 0.00"
                              value={route.reverseRoute.fares[stopIndex]}
                              onChange={(e) => onFareChange(index, stopIndex, e.target.value, true)}
                              type="number"
                              step="0.01"
                            />
                          </div>
                        )
                      ))}
                    </div>
                  )}
                </div>
              )}
              
              <span className="route-path">
                {route.stops.map(stop => stop.name).join(' → ')}
              </span>
            </div>
          ))}
        </div>

        {hasMoreRoutes && (
          <div className="load-more-section">
            <button 
              className="load-more-button"
              onClick={onLoadMore}
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="spinner"></div>
              ) : (
                <>
                  <ArrowLeft size={20} className="load-more-icon" />
                  Load Next {Math.min(routesPerPage, foundRoutes.length - currentRoutes.length)} Routes
                  <ArrowLeft size={20} className="load-more-icon" />
                </>
              )}
            </button>
            <div className="progress-text">
              Showing {currentRoutes.length} of {foundRoutes.length} routes
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const AutomaticStopFinder = ({
  selectedRegion,
  onRegionChange,
  foundStops,
  selectedStops,
  onStopToggle,
  onStopRename,
  onSaveStops,
  onCancel,
  isLoading,
  onFindStops,
  onStopPreview,
  onSelectAll,
  onDeselectAll
}) => {
  const allSelected = foundStops.length > 0 && selectedStops.length === foundStops.length;
  const someSelected = selectedStops.length > 0 && !allSelected;

  return (
    <div className="form-container">
      <div className="finder-header">
        <h2 className="form-title">Automatic Stop Finder</h2>
        <p className="form-subtitle">Find bus stops, stations, taxi ranks, and junctions in Ghana</p>
      </div>
      
      <div className="input-group">
        <label className="input-label">Select Region</label>
        <select
          className="region-select"
          value={selectedRegion}
          onChange={(e) => onRegionChange(e.target.value)}
        >
          <option value="">Select a region</option>
          {GHANA_REGIONS.map(region => (
            <option key={region.name} value={region.name}>
              {region.name}
            </option>
          ))}
        </select>
      </div>

      <div className="finder-controls">
        <button 
          className={`find-button ${isLoading ? 'find-button-disabled' : ''}`}
          onClick={onFindStops}
          disabled={isLoading || !selectedRegion}
        >
          {isLoading ? <div className="spinner"></div> : 'Find Stops Automatically'}
        </button>
        
        {foundStops.length > 0 && (
          <div className="results-info">
            <span className="results-count">Found {foundStops.length} stops</span>
            <span className="selected-count">{selectedStops.length} selected</span>
          </div>
        )}
      </div>

      {foundStops.length > 0 && (
        <div className="found-stops-container">
          <div className="selection-controls">
            <h3 className="sub-section-title">Found Stops</h3>
            <div className="bulk-actions">
              {!allSelected ? (
                <button 
                  className="select-all-button"
                  onClick={onSelectAll}
                >
                  <Check size={16} />
                  Select All
                </button>
              ) : (
                <button 
                  className="deselect-all-button"
                  onClick={onDeselectAll}
                >
                  <X size={16} />
                  Deselect All
                </button>
              )}
              {someSelected && (
                <span className="partial-selection">
                  {selectedStops.length} of {foundStops.length} selected
                </span>
              )}
            </div>
          </div>
          
          <p className="info-text">
            Click on stops to preview location on map. Green markers show bus/taxi icons found.
          </p>
          
          <div className="found-stops-list">
            {foundStops.map((stop, index) => (
              <div key={stop.id} className={`found-stop-item ${selectedStops.includes(index) ? 'selected' : ''}`}>
                <button
                  className="stop-checkbox"
                  onClick={() => onStopToggle(index)}
                >
                  <div className={`checkbox ${selectedStops.includes(index) ? 'checkbox-selected' : ''}`}>
                    {selectedStops.includes(index) && (
                      <Check size={16} color="#FFFFFF" />
                    )}
                  </div>
                </button>
                
                <div className="stop-details">
                  <input
                    className="stop-name-input"
                    value={stop.name}
                    onChange={(e) => onStopRename(index, e.target.value)}
                    placeholder="Enter stop name"
                  />
                  <div className="stop-coordinates">
                    Lat: {stop.latitude.toFixed(6)}, Lng: {stop.longitude.toFixed(6)}
                  </div>
                  <div className="stop-type">
                    <span className={`type-badge type-${stop.type.toLowerCase().replace(' ', '-')}`}>
                      {stop.type}
                    </span>
                    {stop.source === 'amenity' && (
                      <span className="icon-badge">🚍 Icon Found</span>
                    )}
                  </div>
                </div>
                
                <button
                  className="preview-button"
                  onClick={() => onStopPreview(stop)}
                >
                  <MapPin size={16} />
                  View
                </button>
              </div>
            ))}
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
              onClick={onSaveStops}
              disabled={isLoading || selectedStops.length === 0}
            >
              {isLoading ? <div className="spinner"></div> : `Save ${selectedStops.length} Stops`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const EnhancedRouteFinder = ({
  startPoints,
  destinationPoints,
  onStartPointChange,
  onDestinationPointChange,
  onAddStartPoint,
  onAddDestinationPoint,
  onRemoveStartPoint,
  onRemoveDestinationPoint,
  onFindRoutes,
  onFindAutomaticRoutes,
  onCancel,
  isLoading,
  stopSuggestions,
  onStopSuggestionSelect,
  routeConfig,
  onRouteConfigChange,
  onAddStopCount,
  onRemoveStopCount,
  selectedRegion,
  onRegionChange,
  automaticMode,
  onToggleAutomaticMode,
  routeCache,
  currentSearchKey,
  matchWholeWord,
  onMatchWholeWordToggle
}) => {
  const currentCacheKey = generateCacheKey(startPoints, destinationPoints, routeConfig, selectedRegion, automaticMode);
  const hasCachedResults = routeCache.has(currentCacheKey);
  const cachedRouteCount = routeCache.get(currentCacheKey)?.length || 0;

  return (
    <div className="form-container">
      <h2 className="form-title">Auto Route Finder</h2>

      {hasCachedResults && (
        <div className="cache-indicator">
          <div className="cache-icon">📦</div>
          <div className="cache-info">
            <span className="cache-text">Cached results available</span>
            <span className="cache-count">{cachedRouteCount} routes from previous search</span>
          </div>
        </div>
      )}
      
      <div className="mode-toggle">
        <button
          className={`mode-button ${!automaticMode ? 'mode-active' : ''}`}
          onClick={() => onToggleAutomaticMode(false)}
        >
          <MapPin size={16} />
          Manual Search
        </button>
        <button
          className={`mode-button ${automaticMode ? 'mode-active' : ''}`}
          onClick={() => onToggleAutomaticMode(true)}
        >
          <Route size={16} />
          Automatic Discovery
        </button>
      </div>

      {!automaticMode ? (
        <>
          <p className="form-subtitle">Find routes between multiple start and destination points</p>
          
          <div className="input-group">
            <label className="input-label">Search Region</label>
            <select
              className="region-select"
              value={selectedRegion}
              onChange={(e) => onRegionChange(e.target.value)}
            >
              <option value="">All Regions</option>
              {GHANA_REGIONS.map(region => (
                <option key={region.name} value={region.name}>
                  {region.name}
                </option>
              ))}
            </select>
          </div>

          <div className="multiple-points-section">
            <div className="points-header">
              <label className="input-label">Start Points</label>
              <button 
                className="add-point-button"
                onClick={onAddStartPoint}
                type="button"
              >
                <Plus size={16} />
                Add Start Point
              </button>
            </div>
            
            {startPoints.map((point, index) => (
              <div key={index} className="point-input-group">
                <div className="search-box-container">
                  <div className="search-container">
                    <MapPin size={20} color="#6b21a8" />
                    <input
                      className="search-input"
                      placeholder={`Start Point ${index + 1} (e.g., 'Circle')`}
                      value={point}
                      onChange={(e) => onStartPointChange(e.target.value, index)}
                    />
                    {startPoints.length > 1 && (
                      <button
                        className="remove-point-button"
                        onClick={() => onRemoveStartPoint(index)}
                        type="button"
                      >
                        <X size={16} />
                      </button>
                    )}
                    <button
                      className={`match-word-button ${matchWholeWord ? 'match-word-active' : ''}`}
                      onClick={onMatchWholeWordToggle}
                      title={matchWholeWord ? "Matching whole words only" : "Match partial words"}
                    >
                      <Type size={16} />
                      {matchWholeWord ? 'Whole Word' : 'Partial'}
                    </button>
                  </div>
                  
                  {stopSuggestions.start[index]?.length > 0 && (
                    <div className="suggestions-container">
                      {stopSuggestions.start[index].map((stop) => (
                        <button
                          key={stop.id}
                          className="suggestion-item"
                          onClick={() => onStopSuggestionSelect(stop.name, 'start', index)}
                        >
                          <MapPin size={16} color="#6b21a8" />
                          <span className="suggestion-text">{stop.name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="multiple-points-section">
            <div className="points-header">
              <label className="input-label">Destination Points</label>
              <button 
                className="add-point-button"
                onClick={onAddDestinationPoint}
                type="button"
              >
                <Plus size={16} />
                Add Destination
              </button>
            </div>
            
            {destinationPoints.map((point, index) => (
              <div key={index} className="point-input-group">
                <div className="search-box-container">
                  <div className="search-container">
                    <MapPin size={20} color="#EF4444" />
                    <input
                      className="search-input"
                      placeholder={`Destination Point ${index + 1} (e.g., 'Madina')`}
                      value={point}
                      onChange={(e) => onDestinationPointChange(e.target.value, index)}
                    />
                    {destinationPoints.length > 1 && (
                      <button
                        className="remove-point-button"
                        onClick={() => onRemoveDestinationPoint(index)}
                        type="button"
                      >
                        <X size={16} />
                      </button>
                    )}
                    <button
                      className={`match-word-button ${matchWholeWord ? 'match-word-active' : ''}`}
                      onClick={onMatchWholeWordToggle}
                      title={matchWholeWord ? "Matching whole words only" : "Match partial words"}
                    >
                      <Type size={16} />
                      {matchWholeWord ? 'Whole Word' : 'Partial'}
                    </button>
                  </div>

                  {stopSuggestions.destination[index]?.length > 0 && (
                    <div className="suggestions-container">
                      {stopSuggestions.destination[index].map((stop) => (
                        <button
                          key={stop.id}
                          className="suggestion-item"
                          onClick={() => onStopSuggestionSelect(stop.name, 'destination', index)}
                        >
                          <MapPin size={16} color="#EF4444" />
                          <span className="suggestion-text">{stop.name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <>
          <p className="form-subtitle">Automatically discover routes based on your parameters</p>
          
          <div className="auto-info-card">
            <div className="auto-info-icon">
              <Route size={24} color="#10b981" />
            </div>
            <div className="auto-info-content">
              <h4 className="auto-info-title">Automatic Route Discovery</h4>
              <p className="auto-info-text">
                The system will automatically generate routes between popular stops in the selected region 
                based on your configuration below. No need to specify start and end points!
              </p>
            </div>
          </div>
        </>
      )}

      <div className="config-section">
        <h3 className="sub-section-title">Route Configuration</h3>
        
        <div className="config-grid">
          <div className="config-item">
            <label className="config-label">Max Routes to Find</label>
            <select
              className="config-select"
              value={routeConfig.maxRoutes}
              onChange={(e) => onRouteConfigChange('maxRoutes', parseInt(e.target.value))}
            >
              <option value={20}>20 Routes</option>
              <option value={50}>50 Routes</option>
              <option value={100}>100 Routes</option>
            </select>
          </div>
          
          <div className="config-item">
            <label className="config-label">Include Station Routes</label>
            <div className="checkbox-container">
              <input
                type="checkbox"
                checked={routeConfig.includeStations}
                onChange={(e) => onRouteConfigChange('includeStations', e.target.checked)}
                className="checkbox-input"
              />
              <span className="checkbox-label">Find routes with stations</span>
            </div>
          </div>

          <div className="config-item">
            <label className="config-label">Route Diversity</label>
            <select
              className="config-select"
              value={routeConfig.diversity}
              onChange={(e) => onRouteConfigChange('diversity', e.target.value)}
            >
              <option value="balanced">Balanced</option>
              <option value="shortest">Prioritize Shortest</option>
              <option value="alternative">Prioritize Alternative</option>
              <option value="stations">Prioritize Stations</option>
              <option value="random">Randomized</option>
            </select>
          </div>

          <div className="config-item">
            <label className="config-label">Min Route Distance</label>
            <select
              className="config-select"
              value={routeConfig.minDistance}
              onChange={(e) => onRouteConfigChange('minDistance', parseFloat(e.target.value))}
            >
              <option value={0}>Any Distance</option>
              <option value={2}>2+ km</option>
              <option value={5}>5+ km</option>
              <option value={10}>10+ km</option>
            </select>
          </div>
        </div>

        <div className="stop-count-section">
          <label className="config-label">Find Routes With These Stop Counts:</label>
          <div className="stop-counts-container">
            {routeConfig.stopCounts.map((count, index) => (
              <div key={index} className="stop-count-item">
                <span className="stop-count-text">
                  {count === 0 ? 'Direct' : `${count} stops`}
                </span>
                <button
                  className="remove-stop-count"
                  onClick={() => onRemoveStopCount(index)}
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
          
          <div className="add-stop-count">
            <select
              className="stop-count-select"
              value={routeConfig.newStopCount}
              onChange={(e) => onRouteConfigChange('newStopCount', parseInt(e.target.value))}
            >
              {[0, 1, 2, 3, 4, 5, 6, 7, 8].map(count => (
                <option key={count} value={count}>
                  {count === 0 ? 'Direct routes' : `${count} stops`}
                </option>
              ))}
            </select>
            <button
              className="add-stop-count-button"
              onClick={onAddStopCount}
            >
              <Plus size={16} />
              Add
            </button>
          </div>
        </div>

        {automaticMode && (
          <div className="input-group">
            <label className="input-label">Target Region for Discovery</label>
            <select
              className="region-select"
              value={selectedRegion}
              onChange={(e) => onRegionChange(e.target.value)}
            >
              <option value="">All Regions</option>
              {GHANA_REGIONS.map(region => (
                <option key={region.name} value={region.name}>
                  {region.name}
                </option>
              ))}
            </select>
            <p className="input-help">
              Routes will be discovered between popular stops in this region
            </p>
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
        
        {automaticMode ? (
          <button 
            className={`auto-discovery-button ${isLoading ? 'save-button-disabled' : ''}`}
            onClick={onFindAutomaticRoutes}
            disabled={isLoading}
          >
            {isLoading ? <div className="spinner"></div> : (
              <>
                <Route size={20} />
                {hasCachedResults ? 'Reload Routes (500 max)' : 'Discover Routes (500 max)'}
              </>
            )}
          </button>
        ) : (
          <button 
            className={`save-button ${isLoading ? 'save-button-disabled' : ''}`}
            onClick={onFindRoutes}
            disabled={isLoading || startPoints.filter(p => p.trim()).length === 0 || destinationPoints.filter(p => p.trim()).length === 0}
          >
            {isLoading ? <div className="spinner"></div> : 
              hasCachedResults ? 'Reload Routes (500 max)' : 'Find Routes (500 max)'
            }
          </button>
        )}
      </div>
    </div>
  );
};

const generateCacheKey = (startPoints, destinationPoints, config, region, automaticMode) => {
  if (automaticMode) {
    return `auto_${region}_${config.stopCounts.join('-')}_${config.includeStations}_${config.minDistance}`;
  } else {
    const starts = startPoints.filter(p => p.trim()).sort().join(',');
    const dests = destinationPoints.filter(p => p.trim()).sort().join(',');
    return `manual_${starts}_${dests}_${config.stopCounts.join('-')}_${region}`;
  }
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
  
  const [showAutoStopFinder, setShowAutoStopFinder] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState('');
  const [foundStops, setFoundStops] = useState([]);
  const [selectedFoundStops, setSelectedFoundStops] = useState([]);
  const [previewStop, setPreviewStop] = useState(null);

  // Bottom sheet state
  const [showBottomSheet, setShowBottomSheet] = useState(false);
  const [activeSection, setActiveSection] = useState('stops');

  // Stop editing state
  const [editingStop, setEditingStop] = useState(null);
  const [stopSearchQuery, setStopSearchQuery] = useState('');
  const [filteredStops, setFilteredStops] = useState([]);
  const [matchWholeWord, setMatchWholeWord] = useState(false);

  // Route management state
  const [newRoute, setNewRoute] = useState({
    name: '',
    stops: [],
    fares: [],
    distances: [],
    description: '',
    travelTimeMinutes: '',
    peakHours: '',
    frequency: '',
    vehicleType: '',
    notes: '',
    amenities: [],
    operatingHours: {
      start: '06:00',
      end: '22:00',
      days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    }
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [editingRoute, setEditingRoute] = useState(null);
  const [editRouteData, setEditRouteData] = useState({
    name: '',
    stops: [],
    fares: [],
    distances: [],
    description: '',
    travelTimeMinutes: '',
    peakHours: '',
    frequency: '',
    vehicleType: '',
    notes: '',
    amenities: [],
    operatingHours: {
      start: '06:00',
      end: '22:00',
      days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    }
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
    start: [[]],
    destination: [[]]
  });
  const [showEnhancedRouteFinder, setShowEnhancedRouteFinder] = useState(false);
  const [automaticMode, setAutomaticMode] = useState(false);
  const [startPoints, setStartPoints] = useState(['']);
  const [destinationPoints, setDestinationPoints] = useState(['']);
  const [routeFinderConfig, setRouteFinderConfig] = useState({
    maxRoutes: 100,
    includeStations: true,
    stopCounts: [0, 1, 2, 3],
    newStopCount: 0,
    diversity: 'balanced',
    minDistance: 0,
    excludeExisting: true
  });
  const [routeFinderRegion, setRouteFinderRegion] = useState('');
  const [usedRoutePairs, setUsedRoutePairs] = useState(new Set());

  const [panToLocation, setPanToLocation] = useState(null);
  const [searchLocationQuery, setSearchLocationQuery] = useState('');
  const [searchLocationResults, setSearchLocationResults] = useState([]);
  const [searchedLocation, setSearchedLocation] = useState(null);
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);

  const [currentPage, setCurrentPage] = useState(0);
  const [routesPerPage, setRoutesPerPage] = useState(20);
  const [displayedRoutes, setDisplayedRoutes] = useState([]);

  const [routeCache, setRouteCache] = useState(new Map());
  const [currentSearchKey, setCurrentSearchKey] = useState('');

  // Filter stops based on match whole word setting
  const filterStopsByName = (stopsList, query, wholeWord = false) => {
    if (!query.trim()) return stopsList;
    
    const lowerQuery = query.toLowerCase();
    if (wholeWord) {
      // Match whole words only (exact match for each word)
      const queryWords = lowerQuery.split(/\s+/).filter(word => word.length > 0);
      return stopsList.filter(stop => {
        const stopName = stop.name.toLowerCase();
        return queryWords.every(word => 
          stopName === word || 
          stopName.includes(` ${word} `) || 
          stopName.startsWith(`${word} `) || 
          stopName.endsWith(` ${word}`)
        );
      });
    } else {
      // Partial match (default)
      return stopsList.filter(stop =>
        stop.name.toLowerCase().includes(lowerQuery)
      );
    }
  };

  // Handle stop search with match whole word
  const handleStopSearch = (query, field, index) => {
    if (query.length < 1) {
      setStopSuggestions(prev => ({
        ...prev,
        [field]: prev[field].map((arr, i) => i === index ? [] : arr)
      }));
      return;
    }

    const filtered = filterStopsByName(stops, query, matchWholeWord).slice(0, 5);

    setStopSuggestions(prev => ({
      ...prev,
      [field]: prev[field].map((arr, i) => i === index ? filtered : arr)
    }));
  };

  // Handle route stop search
  const handleRouteStopSearch = (query) => {
    setSearchQuery(query);
    if (query.length > 0) {
      const filtered = filterStopsByName(stops, query, matchWholeWord).slice(0, 5);
      setSearchResults(filtered);
    } else {
      setSearchResults([]);
    }
  };

  // Toggle match whole word
  const handleMatchWholeWordToggle = () => {
    setMatchWholeWord(!matchWholeWord);
    // Re-filter current search results
    if (searchQuery) {
      const filtered = filterStopsByName(stops, searchQuery, !matchWholeWord).slice(0, 5);
      setSearchResults(filtered);
    }
  };

  // Filter stops list
  useEffect(() => {
    const filtered = filterStopsByName(stops, stopSearchQuery, matchWholeWord);
    setFilteredStops(filtered);
  }, [stopSearchQuery, stops, matchWholeWord]);

  // Filter routes list
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
      const filtered = filterStopsByName(stops, searchQuery, matchWholeWord).slice(0, 5);
      setSearchResults(filtered);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, stops, matchWholeWord]);

  // Initialize suggestions arrays
  useEffect(() => {
    setStopSuggestions(prev => ({
      start: Array(startPoints.length).fill().map((_, i) => prev.start[i] || []),
      destination: Array(destinationPoints.length).fill().map((_, i) => prev.destination[i] || [])
    }));
  }, [startPoints.length, destinationPoints.length]);

const handleAddStartPoint = () => {
    setStartPoints(prev => [...prev, '']);
  };

  const handleRemoveStartPoint = (index) => {
    if (startPoints.length > 1) {
      setStartPoints(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleAddDestinationPoint = () => {
    setDestinationPoints(prev => [...prev, '']);
  };

  const handleRemoveDestinationPoint = (index) => {
    if (destinationPoints.length > 1) {
      setDestinationPoints(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleStartPointChange = (text, index) => {
    const newStartPoints = [...startPoints];
    newStartPoints[index] = text;
    setStartPoints(newStartPoints);
    handleStopSearch(text, 'start', index);
  };

  const handleDestinationPointChange = (text, index) => {
    const newDestinationPoints = [...destinationPoints];
    newDestinationPoints[index] = text;
    setDestinationPoints(newDestinationPoints);
    handleStopSearch(text, 'destination', index);
  };


  // Location search functions
const handleSearchLocation = async (query) => {
  if (!query.trim()) {
    setSearchLocationResults([]);
    setSearchedLocation(null);
    return;
  }

  setIsSearchingLocation(true);
  try {
    // Search using Nominatim (OpenStreetMap)
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=10&countrycodes=gh`
    );
    
    if (response.ok) {
      const data = await response.json();
      console.log('Location search results:', data);
      
      const results = data.map((item, index) => ({
        id: `search-${item.place_id}-${index}`,
        name: item.display_name,
        latitude: parseFloat(item.lat),
        longitude: parseFloat(item.lon),
        type: 'Searched Location',
        source: 'search',
        importance: item.importance,
        place_id: item.place_id
      }));
      
      setSearchLocationResults(results);
    } else {
      setSearchLocationResults([]);
    }
  } catch (error) {
    console.error('Location search error:', error);
    setSearchLocationResults([]);
  } finally {
    setIsSearchingLocation(false);
  }
};

const handleLocationResultSelect = (location) => {
  setSearchedLocation(location);
  setSearchLocationQuery(location.name.split(',')[0]); // Show short name in input
  setSearchLocationResults([]);
  
  // Pan to the selected location
  setPanToLocation({
    lat: location.latitude,
    lng: location.longitude
  });
};

const handleAddSearchedLocation = () => {
  if (!searchedLocation) {
    alert('Please search and select a location first');
    return;
  }

  // Pre-fill the new stop form with searched location
  setNewStop({
    name: searchedLocation.name.split(',')[0], // Use short name
    latitude: searchedLocation.latitude,
    longitude: searchedLocation.longitude
  });
  
  // Clear search
  setSearchedLocation(null);
  setSearchLocationQuery('');
  setSearchLocationResults([]);
  
  // Show success message
  alert('Location added to stop form! Please review the name and click "Save Stop" to add it to the database.');
};

   const handleStopPreview = (stop) => {
    setPreviewStop(stop);
    // Pan to the stop location
    setPanToLocation({
      lat: stop.latitude,
      lng: stop.longitude
    });
  };

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

  useEffect(() => {
    // Initialize suggestions arrays to match the number of points
    setStopSuggestions(prev => ({
      start: Array(startPoints.length).fill().map((_, i) => prev.start[i] || []),
      destination: Array(destinationPoints.length).fill().map((_, i) => prev.destination[i] || [])
    }));
  }, [startPoints.length, destinationPoints.length]);

const handleFindStopsAutomatically = async () => {
  if (!selectedRegion) {
    alert('Please select a region');
    return;
  }

  setIsLoading(true);
  setFoundStops([]);
  
  try {
    console.log('Starting comprehensive transport location search for:', selectedRegion);
    
    // Use both Overpass and Nominatim for comprehensive results
    const [overpassStops, nominatimStops] = await Promise.allSettled([
      findStopsUsingOverpassAPI(selectedRegion),
      findStopsUsingNominatim(selectedRegion)
    ]);

    let allStops = [];
    
    if (overpassStops.status === 'fulfilled') {
      console.log('Overpass results:', overpassStops.value.length);
      allStops = [...allStops, ...overpassStops.value];
    }
    
    if (nominatimStops.status === 'fulfilled') {
      console.log('Nominatim results:', nominatimStops.value.length);
      allStops = [...allStops, ...nominatimStops.value];
    }

    console.log('Total combined results before filtering:', allStops.length);

    // Remove duplicates based on coordinates and name similarity
    const uniqueStops = allStops.filter((stop, index, self) => {
      const firstIndex = self.findIndex(s => 
        Math.abs(s.latitude - stop.latitude) < 0.001 &&
        Math.abs(s.longitude - stop.longitude) < 0.001
      );
      return index === firstIndex;
    });

    console.log('Unique stops after deduplication:', uniqueStops.length);

    // Filter out stops that might already exist in database
    const filteredStops = uniqueStops.filter(foundStop => {
      return !stops.some(existingStop => 
        Math.abs(existingStop.latitude - foundStop.latitude) < 0.001 &&
        Math.abs(existingStop.longitude - foundStop.longitude) < 0.001
      );
    }).slice(0, 100); // Limit to 100 stops

    console.log('Final stops after database filtering:', filteredStops.length);

    if (filteredStops.length === 0) {
      if (allStops.length > 0) {
        alert('All found transport locations already exist in your database. Try a different region.');
      } else {
        alert('No transport locations found in this region. This might be because:\n\n• Limited OpenStreetMap data for this region\n• Try "Greater Accra" which has better data\n• Check your internet connection\n• The search might need more specific location names');
      }
      return;
    }

    setFoundStops(filteredStops);
    setSelectedFoundStops([]);

  } catch (error) {
    console.error('Error in automatic stop finding:', error);
    alert('Search failed: ' + error.message + '\n\nTrying fallback data...');
    
    // Fallback to comprehensive mock data
    setSelectedFoundStops([]);
  } finally {
    setIsLoading(false);
  }
};

const handleSelectAllStops = () => {
  setSelectedFoundStops(Array.from({ length: foundStops.length }, (_, i) => i));
};

const handleDeselectAllStops = () => {
  setSelectedFoundStops([]);
};


const findStopsUsingOverpassAPI = async (region) => {
  try {
    // Expanded region bounding boxes for Ghana (wider coverage)
    const regionBounds = {
      'Greater Accra': [5.333, -0.537, 5.873, 0.163],
      'Ashanti': [6.433, -2.017, 7.133, -1.217],
      'Western': [4.733, -3.017, 5.933, -1.817],
      'Central': [4.933, -1.517, 5.633, -0.617],
      'Eastern': [5.833, -0.717, 6.833, 0.083],
      'Volta': [5.633, 0.033, 7.333, 1.183],
      'Northern': [8.333, -2.517, 10.533, -0.317],
      'Upper East': [10.433, -3.017, 11.333, -0.217],
      'Upper West': [9.633, -3.117, 10.633, -1.817],
      'Brong-Ahafo': [6.933, -3.017, 8.533, -1.217],
      'Western North': [5.733, -3.017, 6.833, -2.117],
      'Oti': [7.333, 0.033, 8.533, 0.983],
      'Ahafo': [6.633, -2.617, 7.433, -1.817],
      'Bono East': [7.233, -2.017, 8.333, -0.617],
      'Savannah': [8.333, -2.517, 9.833, -1.217],
      'North East': [9.633, -2.017, 10.633, -0.617]
    };

    const bounds = regionBounds[region] || [5.333, -0.537, 5.873, 0.163];
    const [south, west, north, east] = bounds;

    console.log('Searching for locations with specific name endings in region:', region);

    // Enhanced query to search for names ending with specific terms
    const overpassQuery = `
      [out:json][timeout:35];
      (
        // Search for nodes with names ending with specific terms
        node["name"~".*(?i)(bus stop|bus station|taxi rank|taxi station|trotro station|trotro stop|junction|traffic light|traffic|first|second|market|night market|roundabout|market station|terminal|stc|vip|hospital|station|police station|post office|gate)$"](${south},${west},${north},${east});
        
        // Search for ways with names ending with specific terms
        way["name"~".*(?i)(bus stop|bus station|taxi rank|taxi station|trotro station|trotro stop|junction|traffic light|traffic|first|second|market|night market|roundabout|market station|terminal|stc|vip|hospital|station|police station|post office|gate)$"](${south},${west},${north},${east});
        
        // Search for amenities that are transport-related (ICONS) - even without names
        node["amenity"~"bus_station|taxi|ferry_terminal"](${south},${west},${north},${east});
        way["amenity"~"bus_station|taxi|ferry_terminal"](${south},${west},${north},${east});
        
        // Search for public transport nodes (ICONS)
        node["public_transport"~"station|stop_position|platform"](${south},${west},${north},${east});
        way["public_transport"~"station|stop_position|platform"](${south},${west},${north},${east});
        
        // Search for highway bus stops (ICONS)
        node["highway"="bus_stop"](${south},${west},${north},${east});
        
        // Search for specific amenities
        node["amenity"~"hospital|police|post_office"](${south},${west},${north},${east});
        way["amenity"~"hospital|police|post_office"](${south},${west},${north},${east});
        
        // Search for traffic infrastructure
        node["highway"="traffic_signals"](${south},${west},${north},${east});
        node["highway"="crossing"](${south},${west},${north},${east});
        node["highway"="stop"](${south},${west},${north},${east});
        node["highway"="give_way"](${south},${west},${north},${east});
        
        // Search for roundabouts
        node["junction"="roundabout"](${south},${west},${north},${east});
        way["junction"="roundabout"](${south},${west},${north},${east});
      );
      out center;
      >;
      out skel qt;
    `;

    const response = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      body: `data=${encodeURIComponent(overpassQuery)}`,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    if (!response.ok) {
      throw new Error(`Overpass API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('Raw API response elements:', data.elements);

    // Process the results
    const stops = data.elements
      .filter(element => {
        // Include elements with coordinates
        const hasCoords = element.lat && element.lon || 
                         (element.center && element.center.lat && element.center.lon);
        return hasCoords;
      })
      .map((element, index) => {
        // Get coordinates
        let lat, lon;
        if (element.lat && element.lon) {
          lat = element.lat;
          lon = element.lon;
        } else if (element.center) {
          lat = element.center.lat;
          lon = element.center.lon;
        } else if (element.bounds) {
          lat = (element.bounds.minlat + element.bounds.maxlat) / 2;
          lon = (element.bounds.minlon + element.bounds.maxlon) / 2;
        }

        // Generate name based on available information
        let name = 'Unnamed Location';
        let stopType = 'Location';
        let source = 'overpass';
        
        if (element.tags && element.tags.name) {
          name = element.tags.name;
          
          // Determine type based on name ending
          const lowerName = name.toLowerCase();
          
          if (lowerName.endsWith('bus station')) stopType = 'Bus Station';
          else if (lowerName.endsWith('bus stop')) stopType = 'Bus Stop';
          else if (lowerName.endsWith('taxi rank') || lowerName.endsWith('taxi station')) stopType = 'Taxi Station';
          else if (lowerName.endsWith('trotro station') || lowerName.endsWith('trotro stop')) stopType = 'Trotro Station';
          else if (lowerName.endsWith('junction')) stopType = 'Junction';
          else if (lowerName.endsWith('traffic light')) stopType = 'Traffic Light';
          else if (lowerName.endsWith('traffic')) stopType = 'Traffic Point';
          else if (lowerName.endsWith('first')) stopType = 'First Stop';
          else if (lowerName.endsWith('second')) stopType = 'Second Stop';
          else if (lowerName.endsWith('market') || lowerName.endsWith('night market')) stopType = 'Market';
          else if (lowerName.endsWith('roundabout')) stopType = 'Roundabout';
          else if (lowerName.endsWith('market station')) stopType = 'Market Station';
          else if (lowerName.endsWith('terminal')) stopType = 'Terminal';
          else if (lowerName.endsWith('stc')) stopType = 'STC Station';
          else if (lowerName.endsWith('vip')) stopType = 'VIP Station';
          else if (lowerName.endsWith('hospital')) stopType = 'Hospital';
          else if (lowerName.endsWith('station')) stopType = 'Station';
          else if (lowerName.endsWith('police station')) stopType = 'Police Station';
          else if (lowerName.endsWith('post office')) stopType = 'Post Office';
          else if (lowerName.endsWith('gate')) stopType = 'Gate';
          
        } else {
          // Create descriptive name for amenities without names
          if (element.tags) {
            if (element.tags.amenity === 'bus_station') {
              name = 'Bus Station';
              stopType = 'Bus Station';
              source = 'amenity';
            } else if (element.tags.amenity === 'taxi') {
              name = 'Taxi Stand';
              stopType = 'Taxi Station';
              source = 'amenity';
            } else if (element.tags.public_transport) {
              name = `Public Transport ${element.tags.public_transport}`;
              stopType = 'Public Transport';
              source = 'amenity';
            } else if (element.tags.highway === 'bus_stop') {
              name = 'Bus Stop';
              stopType = 'Bus Stop';
              source = 'amenity';
            } else if (element.tags.amenity === 'ferry_terminal') {
              name = 'Ferry Terminal';
              stopType = 'Ferry Terminal';
              source = 'amenity';
            } else if (element.tags.highway === 'traffic_signals') {
              name = 'Traffic Light';
              stopType = 'Traffic Light';
              source = 'amenity';
            } else if (element.tags.highway === 'crossing') {
              name = 'Pedestrian Crossing';
              stopType = 'Crossing';
              source = 'amenity';
            } else if (element.tags.highway === 'stop') {
              name = 'Stop Sign';
              stopType = 'Stop Sign';
              source = 'amenity';
            } else if (element.tags.highway === 'give_way') {
              name = 'Give Way';
              stopType = 'Traffic Sign';
              source = 'amenity';
            } else if (element.tags.junction === 'roundabout') {
              name = 'Roundabout';
              stopType = 'Roundabout';
              source = 'amenity';
            } else if (element.tags.amenity === 'hospital') {
              name = 'Hospital';
              stopType = 'Hospital';
              source = 'amenity';
            } else if (element.tags.amenity === 'police') {
              name = 'Police Station';
              stopType = 'Police Station';
              source = 'amenity';
            } else if (element.tags.amenity === 'post_office') {
              name = 'Post Office';
              stopType = 'Post Office';
              source = 'amenity';
            }
          }
        }

        // If type not determined by name ending, use tags
        if (stopType === 'Location' && element.tags) {
          if (element.tags.amenity === 'bus_station') stopType = 'Bus Station';
          else if (element.tags.amenity === 'taxi') stopType = 'Taxi Station';
          else if (element.tags.highway === 'bus_stop') stopType = 'Bus Stop';
          else if (element.tags.public_transport) stopType = 'Public Transport';
          else if (element.tags.highway === 'traffic_signals') stopType = 'Traffic Light';
          else if (element.tags.junction === 'roundabout') stopType = 'Roundabout';
          else if (element.tags.amenity === 'hospital') stopType = 'Hospital';
          else if (element.tags.amenity === 'police') stopType = 'Police Station';
          else if (element.tags.amenity === 'post_office') stopType = 'Post Office';
        }

        return {
          id: `found-stop-${element.id || Date.now()}-${index}`,
          name: name,
          latitude: lat,
          longitude: lon,
          type: stopType,
          tags: element.tags || {},
          osm_id: element.id,
          element_type: element.type,
          source: source
        };
      })
      .filter(stop => stop.latitude && stop.longitude)
      .slice(0, 200); // Increased limit for wider search

    console.log(`Found ${stops.length} locations in ${region} (including ${stops.filter(s => s.source === 'amenity').length} amenities)`);
    return stops;

  } catch (error) {
    console.error('Overpass API error:', error);
    throw new Error(`Failed to fetch locations: ${error.message}`);
  }
};

const findStopsUsingNominatim = async (region) => {
  try {
    console.log('Searching Nominatim for locations with specific name endings in:', region);
    
    // Enhanced search terms including all specified endings
    const searchTerms = [
      'bus stop',
      'bus station', 
      'taxi rank',
      'taxi station',
      'trotro station',
      'motor park',
      'transport station',
      'lorry station',
      'junction',
      'traffic light',
      'traffic',
      'first',
      'second',
      'market',
      'night market',
      'roundabout',
      'market station',
      'terminal',
      'stc',
      'vip',
      'hospital',
      'station',
      'police station',
      'post office',
      'gate'
    ];

    let allResults = [];
    
    // Search for each term
    for (const term of searchTerms) {
      const query = `${term} ${region} Ghana`;
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=25&countrycodes=gh`
        );
        
        if (response.ok) {
          const data = await response.json();
          console.log(`Found ${data.length} results for "${term}"`);
          
          const transportResults = data.map((item, index) => {
            // Determine type based on search term and display name
            let stopType = 'Location';
            const lowerName = item.display_name.toLowerCase();
            
            // Check name endings for type determination
            if (term.endsWith('bus station') || lowerName.endsWith('bus station')) stopType = 'Bus Station';
            else if (term.endsWith('bus stop') || lowerName.endsWith('bus stop')) stopType = 'Bus Stop';
            else if (term.endsWith('taxi rank') || term.endsWith('taxi station') || lowerName.endsWith('taxi rank') || lowerName.endsWith('taxi station')) stopType = 'Taxi Station';
            else if (term.endsWith('trotro station') || lowerName.endsWith('trotro station')) stopType = 'Trotro Station';
            else if (term.endsWith('junction') || lowerName.endsWith('junction')) stopType = 'Junction';
            else if (term.endsWith('traffic light') || lowerName.endsWith('traffic light')) stopType = 'Traffic Light';
            else if (term.endsWith('traffic') || lowerName.endsWith('traffic')) stopType = 'Traffic Point';
            else if (term.endsWith('first') || lowerName.endsWith('first')) stopType = 'First Stop';
            else if (term.endsWith('second') || lowerName.endsWith('second')) stopType = 'Second Stop';
            else if (term.endsWith('market') || term.endsWith('night market') || lowerName.endsWith('market') || lowerName.endsWith('night market')) stopType = 'Market';
            else if (term.endsWith('roundabout') || lowerName.endsWith('roundabout')) stopType = 'Roundabout';
            else if (term.endsWith('market station') || lowerName.endsWith('market station')) stopType = 'Market Station';
            else if (term.endsWith('terminal') || lowerName.endsWith('terminal')) stopType = 'Terminal';
            else if (term.endsWith('stc') || lowerName.endsWith('stc')) stopType = 'STC Station';
            else if (term.endsWith('vip') || lowerName.endsWith('vip')) stopType = 'VIP Station';
            else if (term.endsWith('hospital') || lowerName.endsWith('hospital')) stopType = 'Hospital';
            else if (term.endsWith('station') || lowerName.endsWith('station')) stopType = 'Station';
            else if (term.endsWith('police station') || lowerName.endsWith('police station')) stopType = 'Police Station';
            else if (term.endsWith('post office') || lowerName.endsWith('post office')) stopType = 'Post Office';
            else if (term.endsWith('gate') || lowerName.endsWith('gate')) stopType = 'Gate';

            return {
              id: `nominatim-${item.place_id}-${index}`,
              name: item.display_name.split(',')[0] || `${stopType} ${index + 1}`,
              latitude: parseFloat(item.lat),
              longitude: parseFloat(item.lon),
              type: stopType,
              source: 'nominatim',
              full_name: item.display_name
            };
          });
          
          allResults = [...allResults, ...transportResults];
        }
        
        // Small delay to be respectful to the API
        await new Promise(resolve => setTimeout(resolve, 400));
        
      } catch (termError) {
        console.error(`Error searching for "${term}":`, termError);
      }
    }

    console.log(`Total Nominatim results: ${allResults.length}`);
    return allResults;

  } catch (error) {
    console.error('Nominatim API error:', error);
    return [];
  }
};

  const handleFoundStopToggle = (stopIndex) => {
    setSelectedFoundStops(prev => 
      prev.includes(stopIndex)
        ? prev.filter(idx => idx !== stopIndex)
        : [...prev, stopIndex]
    );
  };

  const handleFoundStopRename = (stopIndex, newName) => {
    setFoundStops(prev => {
      const updated = [...prev];
      updated[stopIndex] = { ...updated[stopIndex], name: newName };
      return updated;
    });
  };

  const handleSaveFoundStops = async () => {
    if (selectedFoundStops.length === 0) {
      alert('Please select at least one stop');
      return;
    }

    setIsLoading(true);
    try {
      const stopsToSave = selectedFoundStops.map(index => foundStops[index]);
      
      const { data, error } = await supabase
        .from('stops')
        .insert(
          stopsToSave.map(stop => ({
            name: stop.name,
            latitude: stop.latitude,
            longitude: stop.longitude
          }))
        )
        .select();

      if (error) throw error;
      
      alert(`${stopsToSave.length} stops added successfully!`);
      setFoundStops([]);
      setSelectedFoundStops([]);
      setShowAutoStopFinder(false);
      loadStops();
    } catch (error) {
      console.error('Error saving stops:', error);
      alert('Failed to save stops: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

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
          total_fare,
          description: newRoute.description || null,
          travel_time_minutes: newRoute.travelTimeMinutes ? parseInt(newRoute.travelTimeMinutes) : null,
          peak_hours: newRoute.peakHours || null,
          frequency: newRoute.frequency || null,
          vehicle_type: newRoute.vehicleType || null,
          notes: newRoute.notes || null,
          amenities: newRoute.amenities.length > 0 ? newRoute.amenities : null,
          operating_hours: newRoute.operatingHours
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
      setNewRoute({
        name: '',
        stops: [],
        fares: [],
        distances: [],
        description: '',
        travelTimeMinutes: '',
        peakHours: '',
        frequency: '',
        vehicleType: '',
        notes: '',
        amenities: [],
        operatingHours: {
          start: '06:00',
          end: '22:00',
          days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
        }
      });
      loadRoutes();
    } catch (error) {
      console.error('Error adding route:', error);
      alert('Failed to add route');
    } finally {
      setIsLoading(false);
    }
  };

  // Update handleEditRoute to include route information
  const handleEditRoute = (route) => {
    setEditingRoute(route);
    setEditRouteData({
      name: route.name,
      stops: route.route_stops.map(rs => rs.stops),
      fares: route.route_stops.map(rs => rs.fare_to_next?.toString() || ''),
      distances: route.route_stops.map(rs => rs.distance_to_next?.toString() || ''),
      description: route.description || '',
      travelTimeMinutes: route.travel_time_minutes?.toString() || '',
      peakHours: route.peak_hours || '',
      frequency: route.frequency || '',
      vehicleType: route.vehicle_type || '',
      notes: route.notes || '',
      amenities: route.amenities || [],
      operatingHours: route.operating_hours || {
        start: '06:00',
        end: '22:00',
        days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
      }
    });
  };

 const findEnhancedRoutesBetweenStops = async () => {
  try {
    setIsLoading(true);
    
    console.log('🔍 Finding enhanced routes with multiple points');
    console.log('📊 Start points:', startPoints);
    console.log('📊 Destination points:', destinationPoints);
    
    const cacheKey = generateCacheKey(startPoints, destinationPoints, routeFinderConfig, routeFinderRegion, automaticMode);
    setCurrentSearchKey(cacheKey);
    
    // Check cache first
    const cachedRoutes = routeCache.get(cacheKey);
    if (cachedRoutes) {
      console.log('📦 Using cached routes:', cachedRoutes.length);
      handleShowRouteSelection(cachedRoutes);
      setShowEnhancedRouteFinder(false);
      return;
    }
    
    const allRoutes = [];
    
    // Generate routes for all combinations of start and destination points
    for (const startName of startPoints.filter(name => name.trim())) {
      for (const destinationName of destinationPoints.filter(name => name.trim())) {
        // Find start and destination stops
        const startStop = stops.find(stop => 
          stop.name.toLowerCase().includes(startName.toLowerCase()) ||
          startName.toLowerCase().includes(stop.name.toLowerCase())
        );
        
        const destinationStop = stops.find(stop => 
          stop.name.toLowerCase().includes(destinationName.toLowerCase()) ||
          destinationName.toLowerCase().includes(stop.name.toLowerCase())
        );

        if (!startStop || !destinationStop) {
          console.log('Stop not found:', startName, destinationName);
          continue;
        }

        if (startStop.id === destinationStop.id) {
          continue;
        }

        // Generate routes for this pair
        const routesForPair = await generateEnhancedRouteOptions(
          startStop, 
          destinationStop, 
          stops,
          routeFinderConfig
        );
        
        allRoutes.push(...routesForPair);
        
        // Early exit if we have enough routes
        if (allRoutes.length >= 1000) break;
      }
      if (allRoutes.length >= 1000) break;
    }

    // Remove duplicates and randomize
    const uniqueRoutes = removeDuplicateRoutes(allRoutes);
    const randomizedRoutes = randomizeRoutes(uniqueRoutes, routeFinderConfig.diversity);
    
    console.log('🛣️ Final routes found:', randomizedRoutes.length);

    if (randomizedRoutes.length === 0) {
      alert('No routes found matching your criteria. Try adjusting your parameters.');
      return;
    }

    // Limit to 500 routes maximum
    const limitedRoutes = randomizedRoutes.slice(0, 500);
    
    // Cache the results
    setRouteCache(prev => new Map(prev).set(cacheKey, limitedRoutes));
    
    // Use the new pagination handler
    handleShowRouteSelection(limitedRoutes);
    setShowEnhancedRouteFinder(false);

  } catch (error) {
    console.error('❌ Error finding enhanced routes:', error);
    alert('Failed to find routes: ' + error.message);
  } finally {
    setIsLoading(false);
  }
};

  // NEW: Randomize routes based on diversity setting
  const randomizeRoutes = (routes, diversity) => {
    if (diversity !== 'random') {
      return sortRoutesByDiversity(routes, diversity);
    }
    
    // Fisher-Yates shuffle for true randomization
    const shuffled = [...routes];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    
    // Filter out recently used routes
    const filtered = shuffled.filter(route => {
      const routeKey = getRoutePairKey(route.stops);
      return !usedRoutePairs.has(routeKey);
    });
    
    return filtered.length > 0 ? filtered : shuffled; // Fallback to all routes if no new ones
  };

  // NEW: Enhanced route generation with station support and diverse options
 const generateEnhancedRouteOptions = async (startStop, destinationStop, allStops, config) => {
    const routes = [];
    const maxRoutesPerType = Math.floor(config.maxRoutes / Math.max(1, config.stopCounts.length));
    
    console.log('🎯 Generating routes for stop counts:', config.stopCounts);
    
    // Generate routes for each specified stop count
    for (const stopCount of config.stopCounts) {
      const routesForCount = await generateRoutesForStopCount(
        startStop, 
        destinationStop, 
        allStops, 
        stopCount, 
        maxRoutesPerType,
        config
      );
      routes.push(...routesForCount);
    }

    // Check for duplicates in database
    const routesWithDuplicateCheck = await Promise.all(
      routes.map(async (route) => ({
        ...route,
        isDuplicate: config.excludeExisting ? await checkRouteExists(route.stops) : false
      }))
    );

    // Filter out duplicates if configured
    const filteredRoutes = config.excludeExisting 
      ? routesWithDuplicateCheck.filter(route => !route.isDuplicate)
      : routesWithDuplicateCheck;

    console.log('✅ Routes after duplicate check:', filteredRoutes.length);
    return filteredRoutes;
  };

  // NEW: Generate routes for specific stop count with station support
const generateRoutesForStopCount = (startStop, destinationStop, allStops, intermediateCount, maxRoutes, includeStations) => {
    const routes = [];
    
    // Handle direct routes (0 intermediate stops)
    if (intermediateCount === 0) {
      const directRoute = createDirectRoute(startStop, destinationStop);
      if (directRoute) {
        routes.push(directRoute);
        console.log('🛣️ Added direct route');
      }
      return routes;
    }

    // Filter available stops for intermediate routes
    const availableStops = allStops.filter(stop => 
      stop.id !== startStop.id && stop.id !== destinationStop.id
    );

    console.log(`📍 Total available stops for intermediates: ${availableStops.length}`);

    // If stations are required, prioritize station stops but don't exclude others
    let candidateStops = availableStops;
    if (includeStations) {
      // Separate station stops and non-station stops
      const stationStops = availableStops.filter(stop => 
        stop.name.toLowerCase().includes('station') || 
        stop.name.toLowerCase().includes('bus station') ||
        stop.name.toLowerCase().includes('terminal') ||
        stop.name.toLowerCase().includes('stc') ||
        stop.name.toLowerCase().includes('vip')
      );
      
      const nonStationStops = availableStops.filter(stop => 
        !stationStops.includes(stop)
      );

      console.log(`🏢 Station stops: ${stationStops.length}, Non-station stops: ${nonStationStops.length}`);

      // Mix station stops with other stops for diversity
      // Take all station stops and add some non-station stops
      const mixedStops = [
        ...stationStops,
        ...nonStationStops.slice(0, Math.max(10, stationStops.length)) // Ensure we have enough stops
      ];
      
      if (mixedStops.length >= intermediateCount) {
        candidateStops = mixedStops;
        console.log(`🔀 Using mixed stops: ${candidateStops.length} total (${stationStops.length} stations)`);
      } else {
        // If not enough mixed stops, use all available stops
        candidateStops = availableStops;
        console.log(`📋 Using all available stops: ${candidateStops.length}`);
      }
    } else {
      // If stations are not required, use all stops
      candidateStops = availableStops;
      console.log(`📋 Using all stops (stations not required): ${candidateStops.length}`);
    }

    if (candidateStops.length < intermediateCount) {
      console.log(`⚠️ Not enough candidate stops for ${intermediateCount} intermediates`);
      return routes;
    }

    // Calculate direct distance for reference
    const directDistance = calculateDistance(
      startStop.latitude, startStop.longitude,
      destinationStop.latitude, destinationStop.longitude
    );

    // Get stops that create reasonable routes (include all stops, not just reasonable ones)
    const scoredStops = candidateStops
      .map(stop => ({
        stop,
        distanceToStart: calculateDistance(startStop.latitude, startStop.longitude, stop.latitude, stop.longitude),
        distanceToDest: calculateDistance(stop.latitude, stop.longitude, destinationStop.latitude, destinationStop.longitude),
        totalDetour: calculateDistance(startStop.latitude, startStop.longitude, stop.latitude, stop.longitude) +
                     calculateDistance(stop.latitude, stop.longitude, destinationStop.latitude, destinationStop.longitude),
        isStation: stop.name.toLowerCase().includes('station') || stop.name.toLowerCase().includes('bus station'),
        // Score based on various factors
        score: calculateStopScore(stop, startStop, destinationStop, directDistance, includeStations)
      }))
      .sort((a, b) => b.score - a.score); // Sort by score descending

    console.log(`🎯 Scored stops for ${intermediateCount} intermediates: ${scoredStops.length}`);

    // Generate routes based on intermediate count
    if (intermediateCount === 1) {
      routes.push(...generateOneIntermediateRoutes(startStop, destinationStop, scoredStops, maxRoutes, includeStations));
    }
    else {
      routes.push(...generateMultipleIntermediateRoutes(startStop, destinationStop, scoredStops, intermediateCount, maxRoutes, includeStations));
    }

    return routes;
  };

  // NEW: Calculate stop score for better route diversity
  const calculateStopScore = (stop, startStop, destinationStop, directDistance, includeStations) => {
    let score = 0;
    
    // Distance-based scoring (closer to direct path is better)
    const detourDistance = calculateDistance(startStop.latitude, startStop.longitude, stop.latitude, stop.longitude) +
                          calculateDistance(stop.latitude, stop.longitude, destinationStop.latitude, destinationStop.longitude);
    const detourRatio = detourDistance / directDistance;
    
    if (detourRatio < 1.5) score += 50; // Excellent detour ratio
    else if (detourRatio < 2) score += 30; // Good detour ratio
    else if (detourRatio < 3) score += 10; // Acceptable detour ratio
    
    // Station bonus if configured
    if (includeStations && (
      stop.name.toLowerCase().includes('station') || 
      stop.name.toLowerCase().includes('bus station')
    )) {
      score += 20;
    }
    
    // Major location bonus
    if (stop.name.toLowerCase().includes('market') || 
        stop.name.toLowerCase().includes('circle') ||
        stop.name.toLowerCase().includes('terminal') ||
        stop.name.toLowerCase().includes('junction') ||
        stop.name.toLowerCase().includes('hospital')) {
      score += 15;
    }
    
    // Popular stop names bonus
    const popularNames = ['accra', 'kumasi', 'tema', 'takoradi', 'cape coast', 'sunyani'];
    if (popularNames.some(name => stop.name.toLowerCase().includes(name))) {
      score += 10;
    }
    
    return score;
  };


const generateOneIntermediateRoutes = (startStop, destinationStop, scoredStops, maxRoutes, includeStations) => {
    const routes = [];
    
    // Take top scored stops (mix of stations and non-stations)
    const topStops = scoredStops.slice(0, maxRoutes * 3); // Get more stops for diversity
    
    console.log(`🎯 Using ${topStops.length} top-scored stops for 1 intermediate route`);
    
    // Ensure we have a good mix
    const stationStops = topStops.filter(s => s.isStation);
    const nonStationStops = topStops.filter(s => !s.isStation);
    
    console.log(`🏢 Station stops in selection: ${stationStops.length}`);
    console.log(`📋 Non-station stops in selection: ${nonStationStops.length}`);
    
    // Create balanced selection
    let selectedStops = [];
    
    // Always include some station stops if available and configured
    if (includeStations && stationStops.length > 0) {
      selectedStops.push(...stationStops.slice(0, Math.ceil(maxRoutes / 2)));
    }
    
    // Add non-station stops to fill the quota
    const remainingSlots = maxRoutes - selectedStops.length;
    if (remainingSlots > 0 && nonStationStops.length > 0) {
      selectedStops.push(...nonStationStops.slice(0, remainingSlots));
    }
    
    // If we still need more stops, take from the general pool
    if (selectedStops.length < maxRoutes) {
      const additionalNeeded = maxRoutes - selectedStops.length;
      selectedStops.push(...topStops.slice(selectedStops.length, selectedStops.length + additionalNeeded));
    }
    
    console.log(`🛣️ Generating ${selectedStops.length} routes with 1 intermediate stop`);
    
    selectedStops.forEach(({ stop }) => {
      const routeStops = [startStop, stop, destinationStop];
      const totalDistance = calculateRouteDistance(routeStops);
      
      routes.push({
        stops: routeStops,
        totalDistance: totalDistance.toFixed(2),
        fares: Array(routeStops.length - 1).fill(''),
        type: getRouteType(routeStops, 1)
      });
    });
    
    return routes;
  };

  // UPDATED: Generate routes with multiple intermediate stops (includes all stops)
  const generateMultipleIntermediateRoutes = (startStop, destinationStop, scoredStops, intermediateCount, maxRoutes, includeStations) => {
    const routes = [];
    const generatedRoutes = new Set();
    
    const stops = scoredStops.map(s => s.stop);
    
    console.log(`🎯 Generating routes with ${intermediateCount} intermediate stops from ${stops.length} stops`);
    
    // Generate combinations focusing on diversity
    for (let i = 0; i < Math.min(stops.length, 15); i++) {
      if (routes.length >= maxRoutes) break;
      
      const combinations = generateIntermediateCombinations(stops, intermediateCount, i);
      
      combinations.forEach(intermediateStops => {
        if (routes.length >= maxRoutes) return;
        
        const routeStops = [startStop, ...intermediateStops, destinationStop];
        const routeKey = routeStops.map(s => s.id).join('-');
        
        if (!generatedRoutes.has(routeKey)) {
          generatedRoutes.add(routeKey);
          
          const totalDistance = calculateRouteDistance(routeStops);
          routes.push({
            stops: routeStops,
            totalDistance: totalDistance.toFixed(2),
            fares: Array(routeStops.length - 1).fill(''),
            type: getRouteType(routeStops, intermediateCount)
          });
        }
      });
    }
    
    console.log(`🛣️ Generated ${routes.length} routes with ${intermediateCount} intermediate stops`);
    return routes;
  };

  const generateStopCombinations = (stops, count, seed) => {
    if (count === 1) {
      return stops.slice(seed, seed + 1).map(stop => [stop]);
    }
    
    const combinations = [];
    // Simple combination generation - in a real app you'd want more sophisticated logic
    for (let i = seed; i < Math.min(stops.length, seed + 3); i++) {
      for (let j = i + 1; j < Math.min(stops.length, i + 4); j++) {
        if (count === 2) {
          combinations.push([stops[i], stops[j]]);
        } else {
          for (let k = j + 1; k < Math.min(stops.length, j + 3); k++) {
            combinations.push([stops[i], stops[j], stops[k]]);
          }
        }
      }
    }
    
    return combinations.slice(0, 5); // Limit combinations
  };

  // NEW: Get route type with station information
  const getRouteType = (stops, intermediateCount) => {
    const hasStation = stops.some(stop => 
      stop.name.toLowerCase().includes('station') || 
      stop.name.toLowerCase().includes('bus station')
    );
    
    const stationSuffix = hasStation ? '_with_station' : '';
    
    if (intermediateCount === 0) return 'direct' + stationSuffix;
    if (intermediateCount === 1) return '1_intermediate' + stationSuffix;
    return `${intermediateCount}_intermediate` + stationSuffix;
  };

  // NEW: Configuration handlers
  const handleRouteFinderConfigChange = (key, value) => {
    setRouteFinderConfig(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleAddStopCount = () => {
    const newCount = routeFinderConfig.newStopCount;
    if (!routeFinderConfig.stopCounts.includes(newCount)) {
      setRouteFinderConfig(prev => ({
        ...prev,
        stopCounts: [...prev.stopCounts, newCount].sort()
      }));
    }
  };

  const handleRemoveStopCount = (index) => {
    setRouteFinderConfig(prev => ({
      ...prev,
      stopCounts: prev.stopCounts.filter((_, i) => i !== index)
    }));
  };


const discoverAutomaticRoutes = async () => {
  try {
    setIsLoading(true);
    
    console.log('🚀 Starting automatic route discovery with config:', routeFinderConfig);
    console.log('📍 Target region:', routeFinderRegion || 'All regions');
    
    const cacheKey = generateCacheKey([], [], routeFinderConfig, routeFinderRegion, true);
    setCurrentSearchKey(cacheKey);
    
    // Check cache first
    const cachedRoutes = routeCache.get(cacheKey);
    if (cachedRoutes) {
      console.log('📦 Using cached automatic routes:', cachedRoutes.length);
      handleShowRouteSelection(cachedRoutes);
      setShowEnhancedRouteFinder(false);
      return;
    }
    
    // Get stops based on region filter
    let availableStops = stops;
    if (routeFinderRegion) {
      // In a real implementation, you would filter stops by region
      // For now, we'll use all stops and simulate regional filtering
      console.log('Region-based filtering would be implemented here');
    }

    if (availableStops.length < 2) {
      alert('Need at least 2 stops in the database to generate routes');
      return;
    }

    // Generate automatic routes with increased limit
    const foundRoutes = generateAutomaticRoutes(availableStops, {
      ...routeFinderConfig,
      maxRoutes: 500 // Increased to 500
    });
    
    console.log('🛣️ Automatically discovered routes:', foundRoutes.length);

    if (foundRoutes.length === 0) {
      alert('No routes could be generated with the current parameters. Try adjusting stop counts or region.');
      return;
    }

    // Limit to 500 and cache
    const limitedRoutes = foundRoutes.slice(0, 500);
    setRouteCache(prev => new Map(prev).set(cacheKey, limitedRoutes));
    
    // Use the new pagination handler
    handleShowRouteSelection(limitedRoutes);
    setShowEnhancedRouteFinder(false);

  } catch (error) {
    console.error('❌ Error in automatic route discovery:', error);
    alert('Failed to discover routes: ' + error.message);
  } finally {
    setIsLoading(false);
  }
};

// UPDATED: Enhanced route generation to produce up to 500 routes
const generateAutomaticRoutes = (allStops, config) => {
  const routes = [];
  const usedPairs = new Set();
  
  console.log('🎯 Generating automatic routes from', allStops.length, 'stops');
  
  // Identify popular stops (stations, major stops)
  const popularStops = identifyPopularStops(allStops, config);
  console.log('📍 Popular stops identified:', popularStops.length);
  
  // Generate direct routes
  if (config.stopCounts.includes(0)) {
    const directRoutes = generateMultipleDirectRoutes(popularStops, config);
    routes.push(...directRoutes);
    console.log(`📍 Generated ${directRoutes.length} direct routes`);
  }
  
  // Generate routes between popular stop pairs with variations
  for (let i = 0; i < popularStops.length; i++) {
    if (routes.length >= config.maxRoutes) break;
    
    for (let j = i + 1; j < popularStops.length; j++) {
      if (routes.length >= config.maxRoutes) break;
      
      const startStop = popularStops[i];
      const destinationStop = popularStops[j];
      const pairKey = `${startStop.id}-${destinationStop.id}`;
      const reversePairKey = `${destinationStop.id}-${startStop.id}`;
      
      // Skip if we've already used this pair (in either direction)
      if (usedPairs.has(pairKey) || usedPairs.has(reversePairKey)) continue;
      
      // Check minimum distance requirement
      const directDistance = calculateDistance(
        startStop.latitude, startStop.longitude,
        destinationStop.latitude, destinationStop.longitude
      );
      
      if (directDistance < config.minDistance) continue;
      
      usedPairs.add(pairKey);
      
      // Generate routes for this pair with variations
      const routesForPair = generateRoutesForPair(
        startStop, 
        destinationStop, 
        allStops, 
        config
      );
      
      routes.push(...routesForPair);
    }
  }
  
  // Remove duplicates and sort based on diversity preference
  const uniqueRoutes = removeDuplicateRoutes(routes);
  const sortedRoutes = sortRoutesByDiversity(uniqueRoutes, config.diversity);
  
  console.log('✅ Final automatic routes:', sortedRoutes.length);
  return sortedRoutes.slice(0, config.maxRoutes);
};

// NEW: Function to combine cached and new routes
const combineRoutes = (cachedRoutes, newRoutes, maxRoutes = 500) => {
  const combined = [...cachedRoutes];
  const cachedKeys = new Set(cachedRoutes.map(route => 
    route.stops.map(stop => stop.id).join('-')
  ));
  
  // Add only new routes that aren't in cache
  for (const route of newRoutes) {
    if (combined.length >= maxRoutes) break;
    
    const routeKey = route.stops.map(stop => stop.id).join('-');
    if (!cachedKeys.has(routeKey)) {
      combined.push(route);
      cachedKeys.add(routeKey);
    }
  }
  
  console.log(`🔄 Combined routes: ${cachedRoutes.length} cached + ${newRoutes.length} new = ${combined.length} total`);
  return combined;
};

  //Add reverse route handler
const handleAddReverseRoute = (routeIndex) => {
    setFoundRoutes(prev => {
      const updated = [...prev];
      const route = updated[routeIndex];
      
      // Create reverse route with the same fares as main route (but reversed)
      const reverseStops = [...route.stops].reverse();
      const reverseFares = [...route.fares].reverse().map(fare => fare || '0');
      const reverseDistance = calculateRouteDistance(reverseStops);
      
      updated[routeIndex] = {
        ...route,
        reverseRoute: {
          stops: reverseStops,
          fares: reverseFares, // Start with same fares as main route
          totalDistance: reverseDistance.toFixed(2),
          type: `reverse_${route.type}`
        }
      };
      
      return updated;
    });
  };

  // NEW: Identify popular stops for automatic route generation
  const identifyPopularStops = (allStops, config) => {
  let popularStops = [...allStops];
  
  // Prioritize stations if configured
  if (config.includeStations) {
    const stationStops = allStops.filter(stop => 
      stop.name.toLowerCase().includes('station') || 
      stop.name.toLowerCase().includes('bus station') ||
      stop.name.toLowerCase().includes('terminal') ||
      stop.name.toLowerCase().includes('stc') ||
      stop.name.toLowerCase().includes('vip') ||
      stop.name.toLowerCase().includes('market')
    );
    
    if (stationStops.length >= 10) {
      popularStops = stationStops;
    } else {
      // Mix stations with other popular stops
      const nonStationStops = allStops.filter(stop => !stationStops.includes(stop));
      popularStops = [...stationStops, ...nonStationStops.slice(0, 20)];
    }
  }
  
  // NEW: Group stops by geographic clusters to ensure adjacency
  const clusteredStops = groupStopsByProximity(popularStops, 2); // Group stops within 2km
  
  // Flatten clusters and take unique stops
  const uniqueStops = [];
  const usedStopIds = new Set();
  
  clusteredStops.forEach(cluster => {
    cluster.forEach(stop => {
      if (!usedStopIds.has(stop.id)) {
        usedStopIds.add(stop.id);
        uniqueStops.push(stop);
      }
    });
  });
  
  // Limit to top stops for performance
  return uniqueStops.slice(0, 30);
};

// NEW: Group stops by geographic proximity
const groupStopsByProximity = (stops, maxDistanceKm) => {
  const clusters = [];
  const usedStops = new Set();
  
  stops.forEach(stop => {
    if (usedStops.has(stop.id)) return;
    
    const cluster = [stop];
    usedStops.add(stop.id);
    
    // Find all stops within the maximum distance
    stops.forEach(otherStop => {
      if (usedStops.has(otherStop.id)) return;
      
      const distance = calculateDistance(
        stop.latitude, stop.longitude,
        otherStop.latitude, otherStop.longitude
      );
      
      if (distance <= maxDistanceKm) {
        cluster.push(otherStop);
        usedStops.add(otherStop.id);
      }
    });
    
    clusters.push(cluster);
  });
  
  console.log(`📍 Created ${clusters.length} geographic clusters`);
  return clusters;
};

// NEW: Generate multiple direct routes using different strategies
const generateMultipleDirectRoutes = (popularStops, config) => {
  const directRoutes = [];
  const usedDirectPairs = new Set();
  const maxDirectDistance = 8; // Increased to 8km for more direct routes
  
  // Strategy 1: Generate direct routes between nearby popular stops
  for (let i = 0; i < popularStops.length; i++) {
    for (let j = i + 1; j < popularStops.length; j++) {
      if (directRoutes.length >= 100) break; // Increased limit for more direct routes
      
      const startStop = popularStops[i];
      const destinationStop = popularStops[j];
      const pairKey = `${startStop.id}-${destinationStop.id}`;
      
      if (usedDirectPairs.has(pairKey)) continue;
      
      const directDistance = calculateDistance(
        startStop.latitude, startStop.longitude,
        destinationStop.latitude, destinationStop.longitude
      );
      
      // Create direct route if stops are within reasonable distance
      if (directDistance <= maxDirectDistance && directDistance >= config.minDistance) {
        const directRoute = createDirectRoute(startStop, destinationStop);
        if (directRoute) {
          directRoutes.push(directRoute);
          usedDirectPairs.add(pairKey);
        }
      }
    }
  }
  
  // Strategy 2: Use geographic clustering to find more direct routes
  const clusters = groupStopsByProximity(popularStops, 3); // 3km clusters
  clusters.forEach(cluster => {
    if (cluster.length >= 2) {
      // Generate direct routes within each cluster
      for (let i = 0; i < cluster.length; i++) {
        for (let j = i + 1; j < cluster.length; j++) {
          if (directRoutes.length >= 150) break;
          
          const startStop = cluster[i];
          const destinationStop = cluster[j];
          const pairKey = `${startStop.id}-${destinationStop.id}`;
          
          if (usedDirectPairs.has(pairKey)) continue;
          
          const directDistance = calculateDistance(
            startStop.latitude, startStop.longitude,
            destinationStop.latitude, destinationStop.longitude
          );
          
          if (directDistance <= maxDirectDistance && directDistance >= config.minDistance) {
            const directRoute = createDirectRoute(startStop, destinationStop);
            if (directRoute) {
              directRoutes.push(directRoute);
              usedDirectPairs.add(pairKey);
            }
          }
        }
      }
    }
  });
  
  // Strategy 3: Generate hub-and-spoke direct routes from major stations
  const majorStations = popularStops.filter(stop => 
    stop.name.toLowerCase().includes('station') || 
    stop.name.toLowerCase().includes('terminal') ||
    stop.name.toLowerCase().includes('stc') ||
    stop.name.toLowerCase().includes('vip')
  );
  
  majorStations.forEach(station => {
    // Find nearby stops to create direct routes from this station
    const nearbyStops = popularStops.filter(stop => {
      if (stop.id === station.id) return false;
      const distance = calculateDistance(
        station.latitude, station.longitude,
        stop.latitude, stop.longitude
      );
      return distance <= maxDirectDistance && distance >= config.minDistance;
    });
    
    // Create direct routes from station to nearby stops
    nearbyStops.forEach(stop => {
      if (directRoutes.length >= 200) return;
      
      const pairKey = `${station.id}-${stop.id}`;
      if (!usedDirectPairs.has(pairKey)) {
        const directRoute = createDirectRoute(station, stop);
        if (directRoute) {
          directRoutes.push(directRoute);
          usedDirectPairs.add(pairKey);
        }
      }
    });
  });
  
  console.log(`🛣️ Generated ${directRoutes.length} direct routes using multiple strategies`);
  return directRoutes;
};

  // NEW: Generate multiple route options for a stop pair
  const generateRoutesForPair = (startStop, destinationStop, allStops, config) => {
  const routes = [];
  
  config.stopCounts.forEach(stopCount => {
    const intermediateCount = stopCount;
    const maxRoutesPerType = Math.floor(config.maxRoutes / Math.max(1, config.stopCounts.length));
    
    if (intermediateCount === 0) {
      // Direct route - use enhanced logic
      const directDistance = calculateDistance(
        startStop.latitude, startStop.longitude,
        destinationStop.latitude, destinationStop.longitude
      );
      
      const maxAdjacentDistance = 8; // Increased to 8km for more direct routes
      if (directDistance <= maxAdjacentDistance && directDistance >= config.minDistance) {
        const directRoute = createDirectRoute(startStop, destinationStop);
        if (directRoute) {
          routes.push(directRoute);
        }
      }
    } else {
      // For routes with intermediate stops, generate more variations
      const routesWithStops = generateRoutesWithIntermediateStops(
        startStop, 
        destinationStop, 
        allStops, 
        intermediateCount, 
        maxRoutesPerType * 2, // Double the variations
        config
      );
      routes.push(...routesWithStops);
    }
  });
  
  return routes;
};

// NEW: Enhanced route generation with more variations
const generateRoutesWithIntermediateStops = (startStop, destinationStop, allStops, intermediateCount, maxRoutes, config) => {
  const routes = [];
  
  // Handle direct routes with adjacency check
  if (intermediateCount === 0) {
    const directDistance = calculateDistance(
      startStop.latitude, startStop.longitude,
      destinationStop.latitude, destinationStop.longitude
    );
    
    const maxAdjacentDistance = 8; // Increased for more routes
    if (directDistance <= maxAdjacentDistance && directDistance >= config.minDistance) {
      const directRoute = createDirectRoute(startStop, destinationStop);
      if (directRoute) {
        routes.push(directRoute);
      }
    }
    return routes;
  }

  const availableStops = allStops.filter(stop => 
    stop.id !== startStop.id && stop.id !== destinationStop.id
  );

  if (availableStops.length < intermediateCount) {
    return routes;
  }

  // Get more candidate stops for better variations
  const candidateStops = availableStops
    .map(stop => ({
      stop,
      relevance: calculateStopRelevance(stop, startStop, destinationStop, config),
      distanceToStart: calculateDistance(startStop.latitude, startStop.longitude, stop.latitude, stop.longitude),
      distanceToDest: calculateDistance(stop.latitude, stop.longitude, destinationStop.latitude, destinationStop.longitude)
    }))
    .filter(item => item.distanceToStart <= 15 && item.distanceToDest <= 15) // Filter by reasonable distance
    .sort((a, b) => b.relevance - a.relevance)
    .slice(0, 40) // Increased from 20 to 40 for more variations
    .map(item => item.stop);

  console.log(`🎯 Using ${candidateStops.length} candidate stops for ${intermediateCount} intermediates`);

  // Generate more variations using different strategies
  const strategies = [
    generateShortestRoutes,
    generateAlternativeRoutes,
    generateStationRoutes,
    generateGeographicRoutes
  ];

  strategies.forEach((strategy, index) => {
    if (routes.length >= maxRoutes) return;
    
    const strategyRoutes = strategy(
      startStop, 
      destinationStop, 
      candidateStops, 
      intermediateCount, 
      Math.floor(maxRoutes / strategies.length),
      config
    );
    
    routes.push(...strategyRoutes);
    console.log(`🛣️ Strategy ${index + 1} generated ${strategyRoutes.length} routes`);
  });

  console.log(`🛣️ Total generated ${routes.length} routes for ${intermediateCount} intermediates`);
  return routes.slice(0, maxRoutes);
};

// NEW: Different route generation strategies for variations
const generateShortestRoutes = (startStop, destinationStop, candidateStops, intermediateCount, maxRoutes, config) => {
  const routes = [];
  // Implementation for shortest routes strategy
  // ... (similar to existing logic but optimized for shortest paths)
  return routes;
};

const generateAlternativeRoutes = (startStop, destinationStop, candidateStops, intermediateCount, maxRoutes, config) => {
  const routes = [];
  // Implementation for alternative routes strategy
  // Uses different stop combinations to create varied paths
  return routes;
};

const generateStationRoutes = (startStop, destinationStop, candidateStops, intermediateCount, maxRoutes, config) => {
  const routes = [];
  // Implementation focusing on routes that include stations
  return routes;
};

const generateGeographicRoutes = (startStop, destinationStop, candidateStops, intermediateCount, maxRoutes, config) => {
  const routes = [];
  // Implementation using geographic distribution of stops
  return routes;
};


  // NEW: Calculate stop relevance for automatic selection
 const calculateStopRelevance = (stop, startStop, destinationStop, config) => {
    let relevance = 0;
    
    // Distance-based relevance
    const directDistance = calculateDistance(startStop.latitude, startStop.longitude, destinationStop.latitude, destinationStop.longitude);
    const detourDistance = calculateDistance(startStop.latitude, startStop.longitude, stop.latitude, stop.longitude) +
                          calculateDistance(stop.latitude, stop.longitude, destinationStop.latitude, destinationStop.longitude);
    const detourRatio = detourDistance / directDistance;
    
    if (detourRatio < 1.5) relevance += 60; // Excellent detour
    else if (detourRatio < 2) relevance += 40; // Good detour
    else if (detourRatio < 3) relevance += 20; // Acceptable detour
    
    // Station relevance if configured
    if (config.includeStations && (
      stop.name.toLowerCase().includes('station') || 
      stop.name.toLowerCase().includes('bus station')
    )) {
      relevance += 30;
    } else {
      // Non-station stops still get some relevance
      relevance += 10;
    }
    
    // Major location relevance
    if (stop.name.toLowerCase().includes('market') || 
        stop.name.toLowerCase().includes('circle') ||
        stop.name.toLowerCase().includes('terminal') ||
        stop.name.toLowerCase().includes('junction') ||
        stop.name.toLowerCase().includes('hospital') ||
        stop.name.toLowerCase().includes('police')) {
      relevance += 15;
    }
    
    return relevance;
  };

  // NEW: Sort routes based on diversity preference
  const sortRoutesByDiversity = (routes, diversity) => {
    switch (diversity) {
      case 'shortest':
        return routes.sort((a, b) => parseFloat(a.totalDistance) - parseFloat(b.totalDistance));
      
      case 'stations':
        return routes.sort((a, b) => {
          const aHasStation = a.stops.some(s => s.name.toLowerCase().includes('station'));
          const bHasStation = b.stops.some(s => s.name.toLowerCase().includes('station'));
          if (aHasStation && !bHasStation) return -1;
          if (!aHasStation && bHasStation) return 1;
          return parseFloat(a.totalDistance) - parseFloat(b.totalDistance);
        });
      
      case 'alternative':
        // Mix of route lengths and types
        return routes.sort((a, b) => {
          const aStops = a.stops.length;
          const bStops = b.stops.length;
          if (aStops !== bStops) return bStops - aStops; // Prefer more stops for alternatives
          return parseFloat(b.totalDistance) - parseFloat(a.totalDistance); // Prefer longer routes
        });
      
      case 'balanced':
      default:
        // Balanced approach - mix of everything
        return routes.sort((a, b) => {
          const aScore = calculateRouteScore(a);
          const bScore = calculateRouteScore(b);
          return bScore - aScore;
        });
    }
  };

  // NEW: Calculate balanced route score
  const calculateRouteScore = (route) => {
    let score = 0;
    
    // Distance score (medium distances are good)
    const distance = parseFloat(route.totalDistance);
    if (distance > 2 && distance < 20) score += 30;
    if (distance >= 20) score += 10;
    
    // Station score
    const hasStation = route.stops.some(s => s.name.toLowerCase().includes('station'));
    if (hasStation) score += 25;
    
    // Stop count diversity
    const stopCount = route.stops.length;
    if (stopCount >= 3 && stopCount <= 5) score += 20;
    if (stopCount > 5) score += 10;
    
    return score;
  };

  const generateIntermediateCombinations = (stops, count, seed) => {
    if (count === 1) {
      return stops.slice(seed, seed + 1).map(stop => [stop]);
    }
    
    const combinations = [];
    
    // Simple combination generation for 2 stops
    if (count === 2) {
      for (let i = seed; i < Math.min(stops.length, seed + 3); i++) {
        for (let j = i + 1; j < Math.min(stops.length, i + 4); j++) {
          combinations.push([stops[i], stops[j]]);
        }
      }
    } 
    // For 3+ stops, use a more efficient approach
    else if (count >= 3) {
      for (let i = seed; i < Math.min(stops.length, seed + 2); i++) {
        for (let j = i + 1; j < Math.min(stops.length, i + 3); j++) {
          for (let k = j + 1; k < Math.min(stops.length, j + 3); k++) {
            if (count === 3) {
              combinations.push([stops[i], stops[j], stops[k]]);
            } else {
              // For more than 3 stops, add additional stops
              for (let l = k + 1; l < Math.min(stops.length, k + 2); l++) {
                combinations.push([stops[i], stops[j], stops[k], stops[l]]);
              }
            }
          }
        }
      }
    }
    
    return combinations.slice(0, 5); // Limit combinations for performance
  };

  const checkRouteExists = async (stops) => {
    try {
      const stopIds = stops.map(stop => stop.id);
      
      // Get all routes that contain any of these stops
      const { data, error } = await supabase
        .from('route_stops')
        .select(`
          route_id,
          stop_id,
          stop_order,
          routes!inner(name)
        `)
        .in('stop_id', stopIds)
        .order('stop_order');

      if (error) throw error;

      // Group by route_id and check for exact sequence match
      const routesMap = {};
      data.forEach(rs => {
        if (!routesMap[rs.route_id]) {
          routesMap[rs.route_id] = [];
        }
        routesMap[rs.route_id].push({
          stop_id: rs.stop_id,
          stop_order: rs.stop_order
        });
      });

      // Check if any route has the exact same sequence
      for (const routeId in routesMap) {
        const routeStops = routesMap[routeId]
          .sort((a, b) => a.stop_order - b.stop_order)
          .map(rs => rs.stop_id);
        
        if (routeStops.join('-') === stopIds.join('-')) {
          return true;
        }
      }

      return false;
    } catch (error) {
      console.error('Error checking route existence:', error);
      return false;
    }
  };

  // NEW: Get route pair key for tracking used routes
  const getRoutePairKey = (stops) => {
    return stops.map(stop => stop.id).join('-');
  };

  const generateSubRoutes = (mainRoute) => {
  const subRoutes = [];
  const stops = mainRoute.stops;
  const mainRouteKey = stops.map(stop => stop.id).join('-');
  
  // Generate all possible consecutive sub-routes
  for (let startIndex = 0; startIndex < stops.length - 1; startIndex++) {
    for (let endIndex = startIndex + 1; endIndex < stops.length; endIndex++) {
      // Only create sub-routes with at least 2 stops
      if (endIndex - startIndex >= 1) {
        const subRouteStops = stops.slice(startIndex, endIndex + 1);
        const subRouteKey = subRouteStops.map(stop => stop.id).join('-');
        
        // NEW: Skip if sub-route is identical to the main route
        if (subRouteKey === mainRouteKey) {
          continue;
        }
        
        // NEW: Skip if sub-route covers the entire main route (just different start/end)
        if (startIndex === 0 && endIndex === stops.length - 1) {
          continue;
        }
        
        const subRouteDistance = calculateRouteDistance(subRouteStops);
        
        // Calculate fares for sub-route (sum of relevant segments)
        let subRouteFares = [];
        for (let i = startIndex; i < endIndex; i++) {
          subRouteFares.push(mainRoute.fares[i] || '0');
        }
        
        subRoutes.push({
          stops: subRouteStops,
          fares: subRouteFares,
          totalDistance: subRouteDistance.toFixed(2),
          type: `subroute_${startIndex}_${endIndex}`,
          isSubRoute: true,
          parentRouteIndex: mainRoute.parentRouteIndex,
          subRouteKey: subRouteKey // NEW: Store key for duplicate checking
        });
      }
    }
  }
  
  console.log(`🔗 Generated ${subRoutes.length} sub-routes (excluding duplicates of main route)`);
  return subRoutes;
};

  const handleCloseReverseRoute = (routeIndex) => {
    setFoundRoutes(prev => {
      const updated = [...prev];
      updated[routeIndex] = {
        ...updated[routeIndex],
        reverseRoute: null
      };
      return updated;
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

   const markRoutesWithSubRoutes = (routes) => {
    return routes.map(route => ({
      ...route,
      hasSubRoutes: route.stops.length > 1 
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
          total_fare,
          description: editRouteData.description || null,
          travel_time_minutes: editRouteData.travelTimeMinutes ? parseInt(editRouteData.travelTimeMinutes) : null,
          peak_hours: editRouteData.peakHours || null,
          frequency: editRouteData.frequency || null,
          vehicle_type: editRouteData.vehicleType || null,
          notes: editRouteData.notes || null,
          amenities: editRouteData.amenities.length > 0 ? editRouteData.amenities : null,
          operating_hours: editRouteData.operatingHours
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
      setEditRouteData({
        name: '',
        stops: [],
        fares: [],
        distances: [],
        description: '',
        travelTimeMinutes: '',
        peakHours: '',
        frequency: '',
        vehicleType: '',
        notes: '',
        amenities: [],
        operatingHours: {
          start: '06:00',
          end: '22:00',
          days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
        }
      });
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


  const handleStopSuggestionSelect = (stopName, field, index) => {
    if (field === 'start') {
      const newStartPoints = [...startPoints];
      newStartPoints[index] = stopName;
      setStartPoints(newStartPoints);
    } else {
      const newDestinationPoints = [...destinationPoints];
      newDestinationPoints[index] = stopName;
      setDestinationPoints(newDestinationPoints);
    }
    
    // Clear suggestions for this specific field and index
    setStopSuggestions(prev => ({
      ...prev,
      [field]: prev[field].map((arr, i) => i === index ? [] : arr)
    }));
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

  const handleRouteFareChange = (routeIndex, stopIndex, fare, isReverse = false) => {
    setFoundRoutes(prev => {
      const updated = [...prev];
      
      if (isReverse) {
        // Update reverse route fare
        updated[routeIndex] = {
          ...updated[routeIndex],
          reverseRoute: {
            ...updated[routeIndex].reverseRoute,
            fares: updated[routeIndex].reverseRoute.fares.map((f, i) => 
              i === stopIndex ? fare : f
            )
          }
        };
      } else {
        // Update main route fare
        updated[routeIndex] = {
          ...updated[routeIndex],
          fares: updated[routeIndex].fares.map((f, i) => 
            i === stopIndex ? fare : f
          )
        };
      }
      
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
    let allRoutesToSave = [];
    const newUsedPairs = new Set(usedRoutePairs);
    const mainRouteKeys = new Set(); // NEW: Track main route keys
    
    // First, validate all fares and collect routes
    for (const routeIndex of selectedRoutes) {
      const route = foundRoutes[routeIndex];
      const mainRouteKey = route.stops.map(stop => stop.id).join('-');
      mainRouteKeys.add(mainRouteKey);
      
      // Validate fares for main route
      const hasEmptyMainFares = route.fares.some(fare => !fare || fare === '');
      if (hasEmptyMainFares) {
        alert(`Please fill all fares for main route of Route ${routeIndex + 1}`);
        return;
      }

      // Validate fares for reverse route if it exists
      if (route.reverseRoute) {
        const hasEmptyReverseFares = route.reverseRoute.fares.some(fare => !fare || fare === '');
        if (hasEmptyReverseFares) {
          alert(`Please fill all fares for reverse route of Route ${routeIndex + 1}`);
          return;
        }
      }

      // Add main route
      allRoutesToSave.push({
        route,
        name: `${route.stops[0].name} to ${route.stops[route.stops.length - 1].name}`,
        type: 'main',
        routeKey: mainRouteKey
      });

      // Add reverse route if exists
      if (route.reverseRoute) {
        const reverseRouteKey = route.reverseRoute.stops.map(stop => stop.id).join('-');
        allRoutesToSave.push({
          route: route.reverseRoute,
          name: `${route.reverseRoute.stops[0].name} to ${route.reverseRoute.stops[route.reverseRoute.stops.length - 1].name}`,
          type: 'reverse',
          routeKey: reverseRouteKey
        });
      }

      // Generate and add sub-routes (excluding duplicates of main routes)
      const subRoutes = generateSubRoutes(route);
      subRoutes.forEach((subRoute, subIndex) => {
        // NEW: Skip if sub-route key matches any main route key
        if (mainRouteKeys.has(subRoute.subRouteKey)) {
          console.log(`⏭️ Skipping sub-route identical to main route: ${subRoute.subRouteKey}`);
          return;
        }
        
        allRoutesToSave.push({
          route: subRoute,
          name: `${subRoute.stops[0].name} to ${subRoute.stops[subRoute.stops.length - 1].name}`,
          type: 'subroute',
          parentRoute: `${route.stops[0].name} to ${route.stops[route.stops.length - 1].name}`,
          routeKey: subRoute.subRouteKey
        });
      });
    }

    // Check for duplicates in database
    const routesWithDuplicateInfo = await Promise.all(
      allRoutesToSave.map(async (routeData) => ({
        ...routeData,
        isDuplicate: await checkRouteExists(routeData.route.stops),
        routeKey: routeData.routeKey
      }))
    );

    // Separate duplicates and non-duplicates
    const duplicateRoutes = routesWithDuplicateInfo.filter(r => r.isDuplicate);
    const nonDuplicateRoutes = routesWithDuplicateInfo.filter(r => !r.isDuplicate);

    // NEW: Additional filtering - remove sub-routes that are identical to any main route being saved
    const finalRoutesToSave = nonDuplicateRoutes.filter(routeData => {
      if (routeData.type === 'subroute') {
        // Check if this sub-route is identical to any main route being saved
        const isIdenticalToMain = nonDuplicateRoutes.some(mainRoute => 
          mainRoute.type === 'main' && mainRoute.routeKey === routeData.routeKey
        );
        
        if (isIdenticalToMain) {
          console.log(`⏭️ Skipping sub-route identical to main route: ${routeData.name}`);
          return false;
        }
      }
      return true;
    });

    // Show duplicate warning if any duplicates found
    if (duplicateRoutes.length > 0) {
      const duplicateNames = duplicateRoutes.map(r => `${r.name} (${r.type})`).join('\n• ');
      const shouldProceed = window.confirm(
        `The following routes already exist in the database:\n\n• ${duplicateNames}\n\nDo you want to save only the new routes?`
      );
      
      if (!shouldProceed) {
        return; // User canceled
      }
    }

    // Save only non-duplicate routes
    let savedCount = 0;
    for (const routeData of finalRoutesToSave) {
      await saveRouteToDatabase(routeData.route, routeData.name);
      savedCount++;
      
      // Add to used pairs
      newUsedPairs.add(routeData.routeKey);
    }

    // Update used pairs
    setUsedRoutePairs(newUsedPairs);

    // Show success message with details
    const mainCount = finalRoutesToSave.filter(r => r.type === 'main').length;
    const reverseCount = finalRoutesToSave.filter(r => r.type === 'reverse').length;
    const subrouteCount = finalRoutesToSave.filter(r => r.type === 'subroute').length;
    const duplicateCount = duplicateRoutes.length;
    const filteredCount = nonDuplicateRoutes.length - finalRoutesToSave.length;

    let message = `${savedCount} route(s) saved successfully!`;
    if (mainCount > 0) message += `\n• ${mainCount} main route(s)`;
    if (reverseCount > 0) message += `\n• ${reverseCount} reverse route(s)`;
    if (subrouteCount > 0) message += `\n• ${subrouteCount} sub-route(s)`;
    if (duplicateCount > 0) message += `\n• ${duplicateCount} duplicate route(s) skipped`;
    if (filteredCount > 0) message += `\n• ${filteredCount} sub-route(s) filtered (identical to main routes)`;

    alert(message);

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

const handleLoadMoreRoutes = () => {
  setCurrentPage(prev => prev + 1);
};

const handleRoutesPerPageChange = (newPerPage) => {
  setRoutesPerPage(newPerPage);
  setCurrentPage(0); // Reset to first page when changing batch size
};

const hasMoreRoutes = foundRoutes.length > ((currentPage + 1) * routesPerPage);

// NEW: Reset pagination when showing route selection
const handleShowRouteSelection = (routes) => {
  setFoundRoutes(routes);
  setSelectedRoutes([]);
  setCurrentPage(0); // Reset to first page
  setShowRouteSelection(true);
};


  // NEW: Save route to database helper
  const saveRouteToDatabase = async (route, routeName) => {
    const total_distance = calculateRouteDistance(route.stops);
    const total_fare = route.fares.reduce((sum, fare) => sum + parseFloat(fare || 0), 0);

    // Insert route
    const { data: routeData, error: routeError } = await supabase
      .from('routes')
      .insert([{
        name: routeName,
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
            searchedLocation={searchedLocation}
            selectedStop={editingStop || (newStop.latitude ? newStop : null)}
            previewStop={previewStop} 
            panToLocation={panToLocation} 
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
            <div className="user-info-header">
              <div className="user-welcome">
                Welcome, <span className="user-email">{user?.email}</span>
              </div>
              <div className="tab-container">
                <button 
                  className={`tab ${activeSection === 'stops' ? 'active-tab' : ''}`}
                  onClick={() => {
                    setActiveSection('stops');
                    setShowRouteFinder(false);
                    setShowAutoStopFinder(false);
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
                    setShowAutoStopFinder(false);
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
          </div>

          <div className="bottom-sheet-content">
            {activeSection === 'stops' && (
              <div className="management-container">
                <div className="search-location-container">
                  <h3 className="sub-section-title">Search Locations on Map</h3>
                  <p className="info-text">
                    Search for any location in Ghana. Results will show on the map and can be added as stops.
                  </p>
                  
                  <div className="search-location-input-container">
                    <div className="search-container">
                      <Search size={20} color="#6b7280" />
                      <input
                        className="search-input"
                        placeholder="Search for any location in Ghana (e.g., 'Circle', 'Madina Market', '37 Hospital')"
                        value={searchLocationQuery}
                        onChange={(e) => {
                          const value = e.target.value;
                          setSearchLocationQuery(value);
                          
                          if (window.searchLocationTimeout) {
                            clearTimeout(window.searchLocationTimeout);
                          }
                          
                          window.searchLocationTimeout = setTimeout(() => {
                            if (value.trim()) {
                              handleSearchLocation(value);
                            } else {
                              setSearchLocationResults([]);
                            }
                          }, 500);
                        }}
                        onFocus={() => {
                          if (searchLocationQuery && searchLocationResults.length === 0) {
                            handleSearchLocation(searchLocationQuery);
                          }
                        }}
                      />
                      {isSearchingLocation && (
                        <div className="spinner-small"></div>
                      )}
                    </div>

                    {searchLocationResults.length > 0 && (
                      <div className="search-results-container">
                        {searchLocationResults.map((location) => (
                          <button
                            key={location.id}
                            className="search-result-item"
                            onClick={() => handleLocationResultSelect(location)}
                          >
                            <MapPin size={16} color="#6b21a8" />
                            <div className="search-result-info">
                              <span className="search-result-name">
                                {location.name.split(',')[0]}
                              </span>
                              <span className="search-result-fullname">
                                {location.name.length > 60 
                                  ? location.name.substring(0, 60) + '...' 
                                  : location.name
                                }
                              </span>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}

                    {searchedLocation && (
                      <div className="selected-location-container">
                        <div className="selected-location-info">
                          <h4 className="selected-location-name">
                            {searchedLocation.name.split(',')[0]}
                          </h4>
                          <p className="selected-location-coordinates">
                            Lat: {searchedLocation.latitude.toFixed(6)}, Lng: {searchedLocation.longitude.toFixed(6)}
                          </p>
                        </div>
                        <button 
                          className="add-location-button"
                          onClick={handleAddSearchedLocation}
                        >
                          <Plus size={16} />
                          Add to Stops
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {showAutoStopFinder ? (
                  <AutomaticStopFinder
                    selectedRegion={selectedRegion}
                    onRegionChange={setSelectedRegion}
                    foundStops={foundStops}
                    selectedStops={selectedFoundStops}
                    onStopToggle={handleFoundStopToggle}
                    onStopRename={handleFoundStopRename}
                    onSaveStops={handleSaveFoundStops}
                    onCancel={() => {
                      setShowAutoStopFinder(false);
                      setFoundStops([]);
                      setSelectedFoundStops([]);
                    }}
                    isLoading={isLoading}
                    onFindStops={handleFindStopsAutomatically}
                    onStopPreview={handleStopPreview}
                    onSelectAll={handleSelectAllStops}
                    onDeselectAll={handleDeselectAllStops}
                  />
                ) : editingStop ? (
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
                    onOpenAutoFinder={() => setShowAutoStopFinder(true)}
                  />
                )}

                <div className="stops-list">
                  <h3 className="list-title">Existing Stops ({stops.length})</h3>
                  <div className="search-box-container">
                    <div className="search-container">
                      <Search size={20} color="#6b7280" />
                      <input
                        className="search-input"
                        placeholder="Search stops..."
                        value={stopSearchQuery}
                        onChange={(e) => setStopSearchQuery(e.target.value)}
                      />
                      <button
                        className={`match-word-button ${matchWholeWord ? 'match-word-active' : ''}`}
                        onClick={() => setMatchWholeWord(!matchWholeWord)}
                        title={matchWholeWord ? "Matching whole words only" : "Match partial words"}
                      >
                        <Type size={16} />
                        {matchWholeWord ? 'Whole Word' : 'Partial'}
                      </button>
                    </div>
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

                    <RouteInfoForm
                      routeInfo={{
                        description: editRouteData.description,
                        travelTimeMinutes: editRouteData.travelTimeMinutes,
                        peakHours: editRouteData.peakHours,
                        frequency: editRouteData.frequency,
                        vehicleType: editRouteData.vehicleType,
                        notes: editRouteData.notes,
                        amenities: editRouteData.amenities,
                        operatingHours: editRouteData.operatingHours
                      }}
                      onInfoChange={(field, value) => {
                        setEditRouteData(prev => ({ ...prev, [field]: value }));
                      }}
                      onAmenityToggle={(amenity) => {
                        setEditRouteData(prev => ({
                          ...prev,
                          amenities: prev.amenities.includes(amenity)
                            ? prev.amenities.filter(a => a !== amenity)
                            : [...prev.amenities, amenity]
                        }));
                      }}
                      onOperatingHoursChange={(field, value) => {
                        setEditRouteData(prev => ({
                          ...prev,
                          operatingHours: {
                            ...prev.operatingHours,
                            [field]: value
                          }
                        }));
                      }}
                      onOperatingDayToggle={(day) => {
                        setEditRouteData(prev => {
                          const newDays = prev.operatingHours.days.includes(day)
                            ? prev.operatingHours.days.filter(d => d !== day)
                            : [...prev.operatingHours.days, day];
                          return {
                            ...prev,
                            operatingHours: {
                              ...prev.operatingHours,
                              days: newDays
                            }
                          };
                        });
                      }}
                    />

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
                ) : showEnhancedRouteFinder ? (
                  <EnhancedRouteFinder
                    startPoints={startPoints}
                    destinationPoints={destinationPoints}
                    onStartPointChange={handleStartPointChange}
                    onDestinationPointChange={handleDestinationPointChange}
                    onAddStartPoint={handleAddStartPoint}
                    onAddDestinationPoint={handleAddDestinationPoint}
                    onRemoveStartPoint={handleRemoveStartPoint}
                    onRemoveDestinationPoint={handleRemoveDestinationPoint}
                    onFindRoutes={findEnhancedRoutesBetweenStops}
                    onFindAutomaticRoutes={discoverAutomaticRoutes}
                    onCancel={() => {
                      setShowEnhancedRouteFinder(false);
                      setStartPoints(['']);
                      setDestinationPoints(['']);
                    }}
                    isLoading={isLoading}
                    stopSuggestions={stopSuggestions}
                    onStopSuggestionSelect={handleStopSuggestionSelect}
                    routeConfig={routeFinderConfig}
                    onRouteConfigChange={handleRouteFinderConfigChange}
                    onAddStopCount={handleAddStopCount}
                    onRemoveStopCount={handleRemoveStopCount}
                    selectedRegion={routeFinderRegion}
                    onRegionChange={setRouteFinderRegion}
                    automaticMode={automaticMode}
                    onToggleAutomaticMode={setAutomaticMode}
                    routeCache={routeCache}
                    currentSearchKey={currentSearchKey}
                    matchWholeWord={matchWholeWord}
                    onMatchWholeWordToggle={handleMatchWholeWordToggle}
                  />
                ) : (
                  <RouteForm
                    newRoute={newRoute}
                    onRouteNameChange={(text) => setNewRoute(prev => ({ ...prev, name: text }))}
                    searchQuery={searchQuery}
                    onSearchChange={handleRouteStopSearch}
                    searchResults={searchResults}
                    onAddRouteStop={handleAddRouteStop}
                    onFareChange={(text, index) => {
                      const newFares = [...newRoute.fares];
                      newFares[index] = text;
                      setNewRoute(prev => ({ ...prev, fares: newFares }));
                    }}
                    onRemoveStop={handleRemoveRouteStop}
                    onAddRoute={handleAddRoute}
                    onCancel={() => setNewRoute({
                      name: '',
                      stops: [],
                      fares: [],
                      distances: [],
                      description: '',
                      travelTimeMinutes: '',
                      peakHours: '',
                      frequency: '',
                      vehicleType: '',
                      notes: '',
                      amenities: [],
                      operatingHours: {
                        start: '06:00',
                        end: '22:00',
                        days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
                      }
                    })}
                    onOpenRouteFinder={() => setShowEnhancedRouteFinder(true)}
                    isLoading={isLoading}
                    onRouteInfoChange={(field, value) => {
                      setNewRoute(prev => ({ ...prev, [field]: value }));
                    }}
                    onAmenityToggle={(amenity) => {
                      setNewRoute(prev => ({
                        ...prev,
                        amenities: prev.amenities.includes(amenity)
                          ? prev.amenities.filter(a => a !== amenity)
                          : [...prev.amenities, amenity]
                      }));
                    }}
                    onOperatingHoursChange={(field, value) => {
                      setNewRoute(prev => ({
                        ...prev,
                        operatingHours: {
                          ...prev.operatingHours,
                          [field]: value
                        }
                      }));
                    }}
                    onOperatingDayToggle={(day) => {
                      setNewRoute(prev => {
                        const newDays = prev.operatingHours.days.includes(day)
                          ? prev.operatingHours.days.filter(d => d !== day)
                          : [...prev.operatingHours.days, day];
                        return {
                          ...prev,
                          operatingHours: {
                            ...prev.operatingHours,
                            days: newDays
                          }
                        };
                      });
                    }}
                    matchWholeWord={matchWholeWord}
                    onMatchWholeWordToggle={handleMatchWholeWordToggle}
                  />
                )}

                {!editingRoute && !showRouteFinder && (
                  <div className="routes-list">
                    <h3 className="list-title">Existing Routes ({routes.length})</h3>
                    <div className="search-box-container">
                      <div className="search-container">
                        <Search size={20} color="#6b7280" />
                        <input
                          className="search-input"
                          placeholder="Search routes..."
                          value={routeSearchQuery}
                          onChange={(e) => setRouteSearchQuery(e.target.value)}
                        />
                        <button
                          className={`match-word-button ${matchWholeWord ? 'match-word-active' : ''}`}
                          onClick={handleMatchWholeWordToggle}
                          title={matchWholeWord ? "Matching whole words only" : "Match partial words"}
                        >
                          <Type size={16} />
                          {matchWholeWord ? 'Whole Word' : 'Partial'}
                        </button>
                      </div>
                    </div>
                    <div className="items-container">
                      {filteredRoutes.map((route) => (
                        <div key={route.id} className="item-card route-card">
                          <div className="item-info">
                            <h4 className="item-name">{route.name}</h4>
                            
                            {route.description && (
                              <p className="item-description">{route.description}</p>
                            )}
                            
                            <div className="route-details-grid">
                              <div className="detail-item">
                                <span className="detail-label">
                                  <MapPin size={12} />
                                  Stops:
                                </span>
                                <span className="detail-value">{route.route_stops?.length || 0}</span>
                              </div>
                              <div className="detail-item">
                                <span className="detail-label">
                                  <Clock size={12} />
                                  Fare:
                                </span>
                                <span className="detail-value">GH₵ {route.total_fare}</span>
                              </div>
                              <div className="detail-item">
                                <span className="detail-label">
                                  <Route size={12} />
                                  Distance:
                                </span>
                                <span className="detail-value">{route.total_distance}km</span>
                              </div>
                              {route.travel_time_minutes && (
                                <div className="detail-item">
                                  <span className="detail-label">
                                    <Clock size={12} />
                                    Time:
                                  </span>
                                  <span className="detail-value">{route.travel_time_minutes} min</span>
                                </div>
                              )}
                            </div>
                            
                            {route.vehicle_type && (
                              <div className="route-extra-details">
                                {route.frequency && (
                                  <div className="detail-item">
                                    <span className="detail-label">Frequency:</span>
                                    <span className="detail-value">{route.frequency}</span>
                                  </div>
                                )}
                                {route.vehicle_type && (
                                  <div className="detail-item">
                                    <span className="detail-label">Vehicle:</span>
                                    <span className="detail-value">{route.vehicle_type}</span>
                                  </div>
                                )}
                                {route.peak_hours && (
                                  <div className="detail-item">
                                    <span className="detail-label">Peak Hours:</span>
                                    <span className="detail-value">{route.peak_hours}</span>
                                  </div>
                                )}
                              </div>
                            )}
                            
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
        onCancel={() => {
          setShowRouteSelection(false);
          setCurrentPage(0);
        }}
        isLoading={isLoading}
        onAddReverseRoute={handleAddReverseRoute}
        onCloseReverseRoute={handleCloseReverseRoute}
        currentPage={currentPage}
        routesPerPage={routesPerPage}
        onLoadMore={handleLoadMoreRoutes}
        hasMoreRoutes={hasMoreRoutes}
        onRoutesPerPageChange={handleRoutesPerPageChange}
        currentSearchKey={currentSearchKey}
        routeCache={routeCache}
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