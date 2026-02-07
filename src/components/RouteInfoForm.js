import React from 'react';
import { 
  Thermometer, Hash, Tv, Building, Package, Plus,
  Info, Clock, CalendarDays, AlertCircle, Bus, Wind,
  Type
} from 'lucide-react';

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
          value={routeInfo.description || ''}
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
              value={routeInfo.travelTimeMinutes || ''}
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
              value={routeInfo.frequency || ''}
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
              value={routeInfo.peakHours || ''}
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
              value={routeInfo.vehicleType || ''}
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
                  value={routeInfo.operatingHours?.start || '06:00'}
                  onChange={(e) => onOperatingHoursChange('start', e.target.value)}
                />
                <span className="time-separator">to</span>
                <input
                  className="time-input"
                  type="time"
                  value={routeInfo.operatingHours?.end || '22:00'}
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
                      className={`day-button ${(routeInfo.operatingHours?.days || []).includes(day) ? 'day-selected' : ''}`}
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
                  className={`amenity-button ${(routeInfo.amenities || []).includes(amenity.id) ? 'amenity-selected' : ''}`}
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
          value={routeInfo.notes || ''}
          onChange={(e) => onInfoChange('notes', e.target.value)}
          rows={2}
        />
      </div>
    </div>
  );
};

export default RouteInfoForm;