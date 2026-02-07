import React from 'react';
import { MapPin, Search, AlertCircle, X, Plus, Route, Eye, EyeOff } from 'lucide-react';
import RouteInfoForm from './RouteInfoForm';

const RouteCreationWithMap = ({
  onCancel,
  onSave,
  isLoading,
  existingStops,
  onPlotStop,
  plottedStops,
  onRemovePlottedStop,
  onNamePlottedStop,
  onAddFare,
  fares,
  routeName,
  onRouteNameChange,
  onSelectExistingStop,
  isSelectingExisting,
  routeInfo,
  onRouteInfoChange,
  onAmenityToggle,
  onOperatingHoursChange,
  onOperatingDayToggle,
  searchQuery = '',
  onSearchChange,
  searchResults = [],
  onAddStopFromSearch,
  showRoutePaths = true, // New prop
  onToggleRoutePaths = () => {} // New prop
}) => {
  
  // Calculate total route distance
  const calculateTotalDistance = () => {
    let total = 0;
    plottedStops.forEach((stop, index) => {
      if (stop.distanceToNext) {
        total += parseFloat(stop.distanceToNext) || 0;
      }
    });
    return total.toFixed(2);
  };

  return (
    <div className="form-container">
      <div className="creation-mode-selector">
        <button
          className={`mode-button ${!isSelectingExisting ? 'mode-active' : ''}`}
          onClick={() => onPlotStop('plotting')}
        >
          <MapPin size={16} />
          Plot Stops on Map
        </button>
        <button
          className={`mode-button ${isSelectingExisting ? 'mode-active' : ''}`}
          onClick={() => onSelectExistingStop('selecting')}
        >
          <Search size={16} />
          Select Existing Stops
        </button>
      </div>

      <div className="input-group">
        <input
          className="input"
          placeholder="Route Name (e.g., 'Circle to Madina via Atomic')"
          value={routeName}
          onChange={(e) => onRouteNameChange(e.target.value)}
        />
      </div>

      <h3 className="sub-section-title">
        Route Stops ({plottedStops.length})
        {plottedStops.length >= 2 && (
          <span className="route-distance-badge">
            <Route size={14} />
            {calculateTotalDistance()} km
          </span>
        )}
      </h3>
      
      {plottedStops.length >= 2 && (
        <div className="route-controls">
          <button 
            className={`route-path-toggle ${showRoutePaths ? 'active' : ''}`}
            onClick={onToggleRoutePaths}
          >
            {showRoutePaths ? <Eye size={16} /> : <EyeOff size={16} />}
            {showRoutePaths ? 'Hide Route Paths' : 'Show Route Paths'}
          </button>
        </div>
      )}
      
      {isSelectingExisting && (
        <>
          <div className="search-box-container">
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
                    onClick={() => onAddStopFromSearch(stop)}
                  >
                    <MapPin size={16} color="#6b21a8" />
                    <span className="suggestion-text">{stop.name}</span>
                    <Plus size={16} color="#10b981" />
                  </button>
                ))}
              </div>
            )}
          </div>
          
          <p className="instruction-text">
            <MapPin size={14} color="#6b21a8" />
            Click on existing stops on the map to add them to your route
          </p>
        </>
      )}

      {plottedStops.length > 0 && (
        <div className="plotted-stops-list">
          {plottedStops.map((stop, index) => (
            <div key={index} className="plotted-stop-item">
              <div className="stop-number">
                <span className="stop-number-text">{index + 1}</span>
              </div>
              <div className="plotted-stop-info">
                {stop.isNew ? (
                  <div className="new-stop-naming">
                    <input
                      className="stop-name-input"
                      placeholder="Enter stop name"
                      value={stop.tempName || ''}
                      onChange={(e) => onNamePlottedStop(index, e.target.value)}
                    />
                    <span className="new-badge">New</span>
                  </div>
                ) : (
                  <div className="existing-stop-display">
                    <span className="existing-stop-name">{stop.name}</span>
                    <span className="existing-badge">Existing</span>
                  </div>
                )}
                
                {index < plottedStops.length - 1 && (
                  <div className="fare-input-container">
                    <input
                      className="fare-input"
                      placeholder="Fare to next (GH₵)"
                      value={stop.fareToNext || ''}
                      onChange={(e) => onAddFare(index, e.target.value)}
                      type="number"
                      step="0.01"
                    />
                    <span className="distance-text">
                      {stop.distanceToNext ? `${stop.distanceToNext} km` : 'Calculating...'}
                    </span>
                  </div>
                )}
                
                <div className="stop-coordinates">
                  Lat: {stop.latitude.toFixed(6)}, Lng: {stop.longitude.toFixed(6)}
                </div>
              </div>
              <button 
                className="remove-button"
                onClick={() => onRemovePlottedStop(index)}
              >
                <X size={16} color="#EF4444" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="plotting-instructions">
        {isSelectingExisting ? (
          <>
            <div className="instruction-item">
              <Search size={16} color="#6b21a8" />
              <span className="instruction-text">
                Search for stops or click on them on the map
              </span>
            </div>
            <div className="instruction-item">
              <AlertCircle size={16} color="#F59E0B" />
              <span className="instruction-text">
                Road routes will be displayed between stops
              </span>
            </div>
          </>
        ) : (
          <>
            <div className="instruction-item">
              <MapPin size={16} color="#6b21a8" />
              <span className="instruction-text">
                Click anywhere on the map to add stops
              </span>
            </div>
            <div className="instruction-item">
              <AlertCircle size={16} color="#F59E0B" />
              <span className="instruction-text">
                Real road routing will connect your stops automatically
              </span>
            </div>
          </>
        )}
      </div>

      {plottedStops.length >= 2 && (
        <RouteInfoForm
          routeInfo={routeInfo}
          onInfoChange={onRouteInfoChange}
          onAmenityToggle={onAmenityToggle}
          onOperatingHoursChange={onOperatingHoursChange}
          onOperatingDayToggle={onOperatingDayToggle}
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
          onClick={onSave}
          disabled={isLoading || plottedStops.length < 2 || !routeName}
        >
          {isLoading ? <div className="spinner"></div> : 'Create Route'}
        </button>
      </div>
    </div>
  );
};

export default RouteCreationWithMap;