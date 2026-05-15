/**
 * EnhancedRouteFinder.js
 *
 * Changes in this version:
 *  1. Stop-count add UI completely redesigned — pill-selector + inline input with animated add button.
 *  2. New "DB Composite Only" mode in Automatic Discovery — generates auto-composite routes
 *     exclusively by chaining routes that already exist in the routes table.
 *  3. Region selector now uses real geographic bounds from ghanaRegions.js so the label
 *     "Discovery Region" correctly filters stops that fall inside that region's bounding box.
 *  4. Composite-only mode gets its own labelled section distinct from the generic autoComposite toggle.
 */

import React, { useState } from 'react';
import {
  MapPin,
  Route,
  Plus,
  X,
  Layers,
  Zap,
  Type,
  Database,
  Link,
  ChevronRight,
  Hash,
} from 'lucide-react';
import { GHANA_REGIONS } from './ghanaRegions';

/* ─────────────────────────────────────────────────────────────────
   Stop-count pill + add row sub-component
───────────────────────────────────────────────────────────────── */
const StopCountSelector = ({ stopCounts, newStopCount, onRouteConfigChange, onAddStopCount, onRemoveStopCount }) => {
  const [inputFocused, setInputFocused] = useState(false);
  const alreadyAdded = stopCounts.includes(parseInt(newStopCount, 10));

  return (
    <div className="stop-count-section">
      <label className="config-label">Find Routes With These Stop Counts:</label>

      {/* Pill list */}
      <div className="stop-counts-container" style={{ flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
        {stopCounts.map((count, index) => (
          <div
            key={index}
            className="stop-count-item"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: count === 0 ? '#ede9fe' : '#f5f3ff',
              border: `1.5px solid ${count === 0 ? '#7c3aed' : '#c4b5fd'}`,
              borderRadius: '20px',
              padding: '5px 10px 5px 12px',
              fontSize: '13px',
              fontWeight: 600,
              color: '#4c1d95',
            }}
          >
            <Hash size={11} color="#7c3aed" />
            <span className="stop-count-text">
              {count === 0 ? 'Direct' : `${count} stop${count === 1 ? '' : 's'}`}
            </span>
            <button
              className="remove-stop-count"
              onClick={() => onRemoveStopCount(index)}
              type="button"
              title="Remove"
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '1px',
                display: 'flex',
                alignItems: 'center',
                color: '#7c3aed',
                opacity: 0.7,
                marginLeft: '2px',
              }}
            >
              <X size={12} />
            </button>
          </div>
        ))}

        {stopCounts.length === 0 && (
          <span style={{ fontSize: '12px', color: '#9ca3af', fontStyle: 'italic' }}>
            No stop counts configured — add one below
          </span>
        )}
      </div>

      {/* Add row */}
      <div
        className="add-stop-count"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: inputFocused ? '#faf5ff' : '#f9fafb',
          border: `1.5px solid ${inputFocused ? '#7c3aed' : '#e5e7eb'}`,
          borderRadius: '10px',
          padding: '6px 8px 6px 12px',
          transition: 'all 0.15s ease',
        }}
      >
        <Hash size={14} color={inputFocused ? '#7c3aed' : '#9ca3af'} style={{ flexShrink: 0 }} />
        <input
          type="number"
          className="stop-count-input"
          value={newStopCount}
          onChange={(e) => onRouteConfigChange('newStopCount', parseInt(e.target.value, 10) || 0)}
          onFocus={() => setInputFocused(true)}
          onBlur={() => setInputFocused(false)}
          min="0"
          max="10"
          style={{
            flex: 1,
            border: 'none',
            background: 'transparent',
            fontSize: '13px',
            fontWeight: 600,
            color: '#111827',
            outline: 'none',
            width: '50px',
          }}
        />
        <span style={{ fontSize: '12px', color: '#6b7280', marginRight: '4px' }}>
          {newStopCount === 0 ? 'direct' : `intermediate stop${newStopCount === 1 ? '' : 's'}`}
        </span>
        <button
          className="add-count-button"
          onClick={onAddStopCount}
          type="button"
          disabled={alreadyAdded}
          title={alreadyAdded ? 'Already added' : 'Add stop count'}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            background: alreadyAdded ? '#e5e7eb' : '#7c3aed',
            color: alreadyAdded ? '#9ca3af' : '#fff',
            border: 'none',
            borderRadius: '8px',
            padding: '6px 12px',
            fontSize: '12px',
            fontWeight: 700,
            cursor: alreadyAdded ? 'not-allowed' : 'pointer',
            transition: 'all 0.15s ease',
            flexShrink: 0,
          }}
        >
          {alreadyAdded ? (
            <>✓ Added</>
          ) : (
            <>
              <Plus size={13} />
              Add
            </>
          )}
        </button>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────────
   Main component
───────────────────────────────────────────────────────────────── */
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
  onFindCompositeOnlyRoutes,   // NEW — chains existing DB routes only
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
  matchWholeWord,
  onMatchWholeWordToggle,
}) => {
  return (
    <div className="form-container">
      <h2 className="form-title">Auto Route Finder</h2>

      {/* ── Mode toggle ── */}
      <div className="mode-toggle">
        <button
          className={`mode-button ${!automaticMode ? 'mode-active' : ''}`}
          onClick={() => onToggleAutomaticMode(false)}
        >
          <MapPin size={16} />
          Auto Search
        </button>
        <button
          className={`mode-button ${automaticMode ? 'mode-active' : ''}`}
          onClick={() => onToggleAutomaticMode(true)}
        >
          <Route size={16} />
          Automatic Discovery
        </button>
      </div>

      {/* ── Auto Search mode: start / destination inputs ── */}
      {!automaticMode ? (
        <>
          <p className="form-subtitle">
            Find routes between multiple start and destination points
          </p>

          {/* Region filter */}
          <div className="input-group">
            <label className="input-label">Search Region</label>
            <select
              className="region-select"
              value={selectedRegion}
              onChange={(e) => onRegionChange(e.target.value)}
            >
              <option value="">All Regions</option>
              {GHANA_REGIONS.map((r) => (
                <option key={r.name} value={r.name}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>

          {/* Start points */}
          <div className="multiple-points-section">
            <div className="points-header">
              <label className="input-label">Start Points</label>
              <button className="add-point-button" onClick={onAddStartPoint} type="button">
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
                      <button className="remove-point-button" onClick={() => onRemoveStartPoint(index)} type="button">
                        <X size={16} />
                      </button>
                    )}
                    <button
                      className={`match-word-button ${matchWholeWord ? 'match-word-active' : ''}`}
                      onClick={onMatchWholeWordToggle}
                      title={matchWholeWord ? 'Matching whole words only' : 'Match partial words'}
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

          {/* Destination points */}
          <div className="multiple-points-section">
            <div className="points-header">
              <label className="input-label">Destination Points</label>
              <button className="add-point-button" onClick={onAddDestinationPoint} type="button">
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
                      <button className="remove-point-button" onClick={() => onRemoveDestinationPoint(index)} type="button">
                        <X size={16} />
                      </button>
                    )}
                    <button
                      className={`match-word-button ${matchWholeWord ? 'match-word-active' : ''}`}
                      onClick={onMatchWholeWordToggle}
                      title={matchWholeWord ? 'Matching whole words only' : 'Match partial words'}
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
        /* ── Automatic Discovery mode ── */
        <p className="form-subtitle">
          Automatically discover routes by pulling all stops and routes live from
          the database and generating optimised paths between popular stops.
        </p>
      )}

      {/* ════════════════════════════════════════════════════════════════
          Route Configuration  (shared by both modes)
      ════════════════════════════════════════════════════════════════ */}
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

        {/* ── Redesigned stop count UI ── */}
        <StopCountSelector
          stopCounts={routeConfig.stopCounts}
          newStopCount={routeConfig.newStopCount}
          onRouteConfigChange={onRouteConfigChange}
          onAddStopCount={onAddStopCount}
          onRemoveStopCount={onRemoveStopCount}
        />

        {/* Region filter for Automatic Discovery */}
        {automaticMode && (
          <div className="config-item" style={{ marginTop: '12px' }}>
            <label className="config-label">Discovery Region</label>
            <select
              className="region-select"
              value={selectedRegion}
              onChange={(e) => onRegionChange(e.target.value)}
            >
              <option value="">All Regions (no boundary filter)</option>
              {GHANA_REGIONS.map((r) => (
                <option key={r.name} value={r.name}>
                  {r.name}
                </option>
              ))}
            </select>
            <p className="input-help">
              Filters stops whose coordinates fall inside the selected region's geographic boundary
            </p>
          </div>
        )}
      </div>

      {/* ════════════════════════════════════════════════════════════════
          AUTO COMPOSITE from generated routes — shared toggle
      ════════════════════════════════════════════════════════════════ */}
      {automaticMode && (
        <div
          style={{
            marginTop: '20px',
            background: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)',
            border: '1.5px solid #c4b5fd',
            borderRadius: '12px',
            padding: '16px 18px',
          }}
        >
          {/* Section header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
            <div
              style={{
                width: '32px', height: '32px', background: '#7c3aed', borderRadius: '8px',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}
            >
              <Layers size={17} color="#fff" />
            </div>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#4c1d95' }}>
                Chain Generated Routes (Auto Composite)
              </div>
              <div style={{ fontSize: '11px', color: '#6b21a8', marginTop: '1px' }}>
                Chains newly discovered routes together
              </div>
            </div>

            {/* Toggle */}
            <button
              type="button"
              onClick={() => onRouteConfigChange('autoComposite', !(routeConfig.autoComposite ?? false))}
              style={{
                marginLeft: 'auto',
                width: '44px', height: '24px', borderRadius: '12px',
                background: routeConfig.autoComposite ? '#7c3aed' : '#d1d5db',
                border: 'none', cursor: 'pointer', position: 'relative',
                transition: 'background 0.2s', flexShrink: 0,
              }}
            >
              <span
                style={{
                  position: 'absolute', top: '3px',
                  left: routeConfig.autoComposite ? '23px' : '3px',
                  width: '18px', height: '18px', borderRadius: '50%',
                  background: '#fff', transition: 'left 0.2s',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.25)',
                }}
              />
            </button>
          </div>

          <p style={{ fontSize: '12px', color: '#5b21b6', lineHeight: '1.6', margin: '0 0 12px' }}>
            When enabled, the discovery engine will also chain generated routes together —
            wherever the <strong>last stop</strong> of one route matches the{' '}
            <strong>first stop</strong> of another, a composite "through-route" is
            automatically created.
          </p>

          <div
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              background: routeConfig.autoComposite ? '#ede9fe' : '#f3f4f6',
              border: `1px solid ${routeConfig.autoComposite ? '#c4b5fd' : '#e5e7eb'}`,
              borderRadius: '20px', padding: '4px 12px',
              fontSize: '11px', fontWeight: 600,
              color: routeConfig.autoComposite ? '#6b21a8' : '#9ca3af',
            }}
          >
            <Zap size={11} />
            {routeConfig.autoComposite ? 'Enabled — will chain matching endpoints' : 'Disabled'}
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════
          DB-COMPOSITE ONLY — new section, only in Automatic Discovery
          Generates composite routes EXCLUSIVELY from existing DB routes
      ════════════════════════════════════════════════════════════════ */}
      {automaticMode && (
        <div
          style={{
            marginTop: '16px',
            background: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)',
            border: '1.5px solid #fed7aa',
            borderRadius: '12px',
            padding: '16px 18px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
            <div
              style={{
                width: '32px', height: '32px',
                background: 'linear-gradient(135deg, #ea580c, #c2410c)',
                borderRadius: '8px',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}
            >
              <Database size={17} color="#fff" />
            </div>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#7c2d12' }}>
                DB Composite Only Mode
              </div>
              <div style={{ fontSize: '11px', color: '#9a3412', marginTop: '1px' }}>
                Uses only routes already in your routes table
              </div>
            </div>
            <button
              type="button"
              onClick={() => onRouteConfigChange('dbCompositeOnly', !(routeConfig.dbCompositeOnly ?? false))}
              style={{
                marginLeft: 'auto',
                width: '44px', height: '24px', borderRadius: '12px',
                background: routeConfig.dbCompositeOnly ? '#ea580c' : '#d1d5db',
                border: 'none', cursor: 'pointer', position: 'relative',
                transition: 'background 0.2s', flexShrink: 0,
              }}
            >
              <span
                style={{
                  position: 'absolute', top: '3px',
                  left: routeConfig.dbCompositeOnly ? '23px' : '3px',
                  width: '18px', height: '18px', borderRadius: '50%',
                  background: '#fff', transition: 'left 0.2s',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.25)',
                }}
              />
            </button>
          </div>

          <p style={{ fontSize: '12px', color: '#7c2d12', lineHeight: '1.6', margin: '0 0 12px' }}>
            Instead of generating new stop-based routes, this mode <strong>reads all existing routes
            from the database</strong> and automatically chains them where the{' '}
            <strong>last stop of route A = first stop of route B</strong>. Fares are inherited
            directly from the saved routes — no manual fare entry needed.
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
            {[
              '✓ Fares auto-filled from DB',
              '✓ No generated stops — only real routes',
              '✓ Respects region filter',
            ].map(note => (
              <span
                key={note}
                style={{
                  fontSize: '11px', fontWeight: 600,
                  background: routeConfig.dbCompositeOnly ? '#fed7aa' : '#f3f4f6',
                  color: routeConfig.dbCompositeOnly ? '#7c2d12' : '#9ca3af',
                  borderRadius: '20px', padding: '3px 10px',
                  border: `1px solid ${routeConfig.dbCompositeOnly ? '#fdba74' : '#e5e7eb'}`,
                }}
              >
                {note}
              </span>
            ))}
          </div>

          {routeConfig.dbCompositeOnly && (
            <div
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                background: '#fff7ed', border: '1px solid #fed7aa',
                borderRadius: '8px', padding: '10px 12px',
                fontSize: '12px', color: '#9a3412',
              }}
            >
              <Link size={14} color="#ea580c" style={{ flexShrink: 0 }} />
              <span>
                <strong>Note:</strong> The regular "Discover Routes" button below will run DB Composite Only
                mode when this toggle is on. The stop-count configuration above is ignored in this mode.
              </span>
            </div>
          )}
        </div>
      )}

      {/* ── Action buttons ── */}
      <div className="button-row" style={{ marginTop: '20px' }}>
        <button className="cancel-button" onClick={onCancel}>
          Cancel
        </button>

        {automaticMode ? (
          <button
            className={`auto-discovery-button ${isLoading ? 'save-button-disabled' : ''}`}
            onClick={routeConfig.dbCompositeOnly ? onFindCompositeOnlyRoutes : onFindAutomaticRoutes}
            disabled={isLoading}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            {isLoading ? (
              <div className="spinner" />
            ) : routeConfig.dbCompositeOnly ? (
              <>
                <Database size={18} />
                Generate DB Composites
                <ChevronRight size={16} />
              </>
            ) : (
              <>
                <Route size={20} />
                Discover Routes (500 max)
              </>
            )}
          </button>
        ) : (
          <button
            className={`save-button ${isLoading ? 'save-button-disabled' : ''}`}
            onClick={onFindRoutes}
            disabled={
              isLoading ||
              startPoints.filter((p) => p.trim()).length === 0 ||
              destinationPoints.filter((p) => p.trim()).length === 0
            }
          >
            {isLoading ? (
              <div className="spinner" />
            ) : (
              <>
                <MapPin size={20} />
                Find Routes (500 max)
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default EnhancedRouteFinder;