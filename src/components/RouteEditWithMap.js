import React from 'react';
import { MapPin, Search, AlertCircle, X, Plus, Route, Eye, EyeOff, Info, Edit3 } from 'lucide-react';
import RouteInfoForm from './RouteInfoForm';
import { calculateDistance, calculateRouteDistance } from './MapComponent';


const RouteEditWithMap = ({
  // Cancel / Save
  onCancel,
  onSave,
  isLoading,

  // Route name
  routeName,
  onRouteNameChange,

  // Stop data
  existingStops,           // all stops from DB (for search / map click)
  plottedStops,            // the working list of stops for this edit session
  onRemovePlottedStop,
  onNamePlottedStop,
  onAddFare,

  // Mode switching (plot new vs select existing)
  isSelectingExisting,
  onPlotStop,
  onSelectExistingStop,

  // Search (select existing mode)
  searchQuery,
  onSearchChange,
  searchResults,
  onAddStopFromSearch,

  // Route path toggle
  showRoutePaths,
  onToggleRoutePaths,

  // Route info (metadata)
  routeInfo,
  onRouteInfoChange,
  onAmenityToggle,
  onOperatingHoursChange,
  onOperatingDayToggle,
}) => {
  // ── Derived stats ────────────────────────────────────────────────────────────

  const calculateTotalDistance = () => {
    const preComputed = plottedStops.reduce((sum, stop) => {
      return sum + (parseFloat(stop.distanceToNext) || 0);
    }, 0);
    if (preComputed > 0) return preComputed.toFixed(2);
    if (plottedStops.length < 2) return '0.00';
    return calculateRouteDistance(plottedStops).toFixed(2);
  };

  const calculateTotalFare = () => {
    let total = 0;
    plottedStops.forEach(stop => {
      if (stop.fareToNext) total += parseFloat(stop.fareToNext) || 0;
    });
    return total.toFixed(2);
  };

  const areAllFaresFilled = () => {
    if (plottedStops.length < 2) return false;
    for (let i = 0; i < plottedStops.length - 1; i++) {
      const fare = plottedStops[i].fareToNext;
      if (fare === undefined || fare === '' || fare === null) return false;
    }
    return true;
  };

  const areAllNewStopsNamed = () => {
    const newStops = plottedStops.filter(s => s.isNew);
    return newStops.every(s => s.tempName && s.tempName.trim() !== '');
  };

  const canSave = () =>
    !isLoading &&
    plottedStops.length >= 2 &&
    routeName && routeName.trim() !== '' &&
    areAllFaresFilled() &&
    areAllNewStopsNamed();

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <div className="form-container">
        <h1 className="form-title">Edit Route</h1>

      {/* Mode switcher */}
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

      {/* Route name */}
      <div className="input-group">
        <input
          className="input"
          placeholder="Route Name (e.g., 'Circle to Madina via Atomic')"
          value={routeName}
          onChange={e => onRouteNameChange(e.target.value)}
        />
      </div>

      {/* Stop count + distance/fare summary */}
      <h3 className="sub-section-title">
        Route Stops ({plottedStops.length})
        {plottedStops.length >= 2 && (
          <span className="route-distance-badge">
            <Route size={14} />
            {calculateTotalDistance()} km • GH₵ {calculateTotalFare()}
          </span>
        )}
      </h3>

      {/* Route path visibility toggle */}
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

      {/* Select existing mode: search box */}
      {isSelectingExisting && (
        <>
          <div className="search-box-container">
            <div className="search-container">
              <Search size={20} color="#6b7280" />
              <input
                className="search-input"
                placeholder="Search for stops..."
                value={searchQuery}
                onChange={e => onSearchChange(e.target.value)}
              />
            </div>

            {searchResults.length > 0 && (
              <div className="suggestions-container">
                {searchResults.map(stop => (
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

      {/* Plot mode hint */}
      {!isSelectingExisting && (
        <p className="instruction-text">
          <MapPin size={14} color="#6b21a8" />
          Click anywhere on the map to add a new stop, or click an existing stop to add it
        </p>
      )}

      {/* Stop list */}
      {plottedStops.length > 0 && (
        <div className="plotted-stops-list">
          {plottedStops.map((stop, index) => (
            <div key={stop.id ?? index} className="plotted-stop-item">
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
                      onChange={e => onNamePlottedStop(index, e.target.value)}
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
                      className={`fare-input ${stop.fareToNext ? 'fare-filled' : 'fare-empty'}`}
                      placeholder="Fare to next (GH₵)"
                      value={stop.fareToNext ?? ''}
                      onChange={e => onAddFare(index, e.target.value)}
                      type="number"
                      step="0.01"
                      min="0"
                    />
                    <span className="distance-text">
                      {stop.distanceToNext ? `${stop.distanceToNext} km` : 'Calculating...'}
                    </span>
                  </div>
                )}

                <div className="stop-coordinates">
                  Lat: {Number(stop.latitude).toFixed(6)}, Lng: {Number(stop.longitude).toFixed(6)}
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

      {/* Validation messages */}
      {plottedStops.length >= 2 && (
        <div className="validation-messages">
          {!areAllFaresFilled() && (
            <div className="validation-error">
              <AlertCircle size={14} />
              Please fill fares for all segments between stops
            </div>
          )}
          {!areAllNewStopsNamed() && (
            <div className="validation-error">
              <AlertCircle size={14} />
              Please name all new stops
            </div>
          )}
        </div>
      )}

      {/* Route info form (shows when ≥ 2 stops) */}
      {plottedStops.length >= 2 && (
        <RouteInfoForm
          routeInfo={routeInfo}
          onInfoChange={onRouteInfoChange}
          onAmenityToggle={onAmenityToggle}
          onOperatingHoursChange={onOperatingHoursChange}
          onOperatingDayToggle={onOperatingDayToggle}
        />
      )}

      {/* Action buttons */}
      <div className="button-row">
        <button className="cancel-button" onClick={onCancel}>
          Cancel
        </button>

        <button
          className={`save-button ${!canSave() ? 'save-button-disabled' : ''}`}
          onClick={onSave}
          disabled={!canSave()}
        >
          {isLoading ? <div className="spinner" /> : 'Update Route'}
        </button>
      </div>
    </div>
  );
};

export default RouteEditWithMap;