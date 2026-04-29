import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  MapPin, Upload, Search, FileSpreadsheet, X, Check,
  CheckSquare, Square, Plus, Navigation, Trash2,
  AlertCircle, Edit3, Save, MousePointerClick, Keyboard,
  Table, Eye
} from 'lucide-react';
import * as XLSX from 'xlsx';

/* ─────────────────────────────────────────────────────────
   StopForm
   Props (all existing ones kept + 2 new):
     onPreviewExcelStop  (stop | null) => void
       Called when user clicks a row in the Excel table.
       Pass the stop to preview as a temp map marker,
       or null to clear the preview.

     onRequestMapPick    (callback: (lat, lng) => void) => void
       Called when user hits "Pick on Map" inside a row editor.
       Parent should set isSelectingLocation=true, close the
       sheet, and when the map is clicked call callback(lat,lng)
       then re-open the sheet.
───────────────────────────────────────────────────────── */
const StopForm = ({
  newStop,
  onStopNameChange,
  onLatChange,
  onLngChange,
  onSelectLocation,
  onAddStop,
  onAddMultipleStops,
  onCancel,
  isLoading,
  onOpenAutoFinder,
  onPreviewExcelStop,
  onRequestMapPick,
}) => {
  /* ── top-level tab ── */
  const [mode, setMode] = useState('single');

  /* ── single-stop coord sub-mode ── */
  const [coordMode, setCoordMode] = useState('map');

  /* ── excel state ── */
  const [excelStops, setExcelStops]       = useState([]);
  const [selectedIds, setSelectedIds]     = useState(new Set());
  const [isDragging, setIsDragging]       = useState(false);
  const [fileName, setFileName]           = useState('');
  const [parseError, setParseError]       = useState('');
  const [isImporting, setIsImporting]     = useState(false);
  const fileInputRef = useRef(null);

  /* ── per-row editing ── */
  const [editingRowId, setEditingRowId]   = useState(null);
  const [editRowData, setEditRowData]     = useState({ name: '', latitude: '', longitude: '' });
  const [previewedRowId, setPreviewedRowId] = useState(null);

  /* clear preview on unmount */
  useEffect(() => () => { onPreviewExcelStop?.(null); }, []);

  /* ════════════════════════════════════════
     EXCEL PARSING
  ════════════════════════════════════════ */
  const parseFile = useCallback((file) => {
    setParseError('');
    setExcelStops([]);
    setSelectedIds(new Set());
    setEditingRowId(null);
    setPreviewedRowId(null);
    onPreviewExcelStop?.(null);

    if (!file) return;
    const ext = file.name.split('.').pop().toLowerCase();
    if (!['xlsx', 'xls', 'csv'].includes(ext)) {
      setParseError('Please upload an Excel (.xlsx, .xls) or CSV file.');
      return;
    }

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const wb   = XLSX.read(data, { type: 'array' });
        const ws   = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(ws, { defval: '' });

        if (!rows.length) { setParseError('File appears to be empty.'); return; }

        const nameKey = Object.keys(rows[0]).find(k =>
          ['name','stop','stop name','stopname','location','stop_name'].includes(k.trim().toLowerCase())
        );
        const latKey = Object.keys(rows[0]).find(k =>
          ['lat','latitude','y'].includes(k.trim().toLowerCase())
        );
        const lngKey = Object.keys(rows[0]).find(k =>
          ['lng','lon','long','longitude','x'].includes(k.trim().toLowerCase())
        );

        if (!nameKey || !latKey || !lngKey) {
          setParseError(
            `Could not detect columns. Expected: Name (or Stop), Latitude (or Lat), Longitude (or Lng/Lon). ` +
            `Found: ${Object.keys(rows[0]).join(', ')}`
          );
          return;
        }

        const parsed = rows
          .map((row, i) => {
            const name = String(row[nameKey] || '').trim();
            const lat  = parseFloat(row[latKey]);
            const lng  = parseFloat(row[lngKey]);
            return { id: `excel-${i}`, name, latitude: lat, longitude: lng, valid: name && !isNaN(lat) && !isNaN(lng) };
          })
          .filter(s => s.valid);

        if (!parsed.length) {
          setParseError('No valid stops found. Ensure Name, Latitude and Longitude columns contain data.');
          return;
        }
        setExcelStops(parsed);
        setSelectedIds(new Set(parsed.map(s => s.id)));
      } catch (err) {
        setParseError(`Failed to parse file: ${err.message}`);
      }
    };
    reader.readAsArrayBuffer(file);
  }, [onPreviewExcelStop]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    parseFile(e.dataTransfer.files[0]);
  }, [parseFile]);

  /* ── selection ── */
  const toggleStop  = (id) => setSelectedIds(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const selectAll   = () => setSelectedIds(new Set(excelStops.map(s => s.id)));
  const deselectAll = () => setSelectedIds(new Set());

  /* ── row click → preview on map ── */
  const handleRowClick = (stop) => {
    if (editingRowId) return; // ignore while editing
    if (previewedRowId === stop.id) {
      setPreviewedRowId(null);
      onPreviewExcelStop?.(null);
    } else {
      setPreviewedRowId(stop.id);
      onPreviewExcelStop?.({ ...stop, type: 'excel-preview', source: 'excel' });
    }
  };

  /* ══════════════════════════════════════
     ROW EDITING
  ══════════════════════════════════════ */
  const startEdit = (e, stop) => {
    e.stopPropagation();
    setEditingRowId(stop.id);
    setEditRowData({ name: stop.name, latitude: String(stop.latitude), longitude: String(stop.longitude) });
    setPreviewedRowId(null);
    onPreviewExcelStop?.(null);
  };

  const cancelEdit = (e) => {
    e?.stopPropagation();
    setEditingRowId(null);
    setEditRowData({ name: '', latitude: '', longitude: '' });
  };

  const saveEdit = (e) => {
    e.stopPropagation();
    const lat = parseFloat(editRowData.latitude);
    const lng = parseFloat(editRowData.longitude);
    if (!editRowData.name.trim() || isNaN(lat) || isNaN(lng)) return;

    setExcelStops(prev =>
      prev.map(s => s.id === editingRowId
        ? { ...s, name: editRowData.name.trim(), latitude: lat, longitude: lng }
        : s
      )
    );
    setEditingRowId(null);
  };

  /* "Pick on Map" inside a row editor */
  const handlePickOnMap = (e) => {
    e.stopPropagation();
    if (!onRequestMapPick) return;
    onRequestMapPick((lat, lng) => {
      setEditRowData(prev => ({
        ...prev,
        latitude:  lat.toFixed(7),
        longitude: lng.toFixed(7),
      }));
    });
  };

  /* delete row */
  const deleteRow = (e, id) => {
    e.stopPropagation();
    setExcelStops(prev => prev.filter(s => s.id !== id));
    setSelectedIds(prev => { const n = new Set(prev); n.delete(id); return n; });
    if (editingRowId  === id) setEditingRowId(null);
    if (previewedRowId === id) { setPreviewedRowId(null); onPreviewExcelStop?.(null); }
  };

  /* add selected to DB */
  const handleAddSelected = async () => {
    const toAdd = excelStops
      .filter(s => selectedIds.has(s.id))
      .map(({ name, latitude, longitude }) => ({ name, latitude, longitude }));
    if (!toAdd.length || !onAddMultipleStops) return;
    setIsImporting(true);
    try {
      await onAddMultipleStops(toAdd);
      clearFile();
    } finally {
      setIsImporting(false);
    }
  };

  const clearFile = () => {
    setExcelStops([]);
    setSelectedIds(new Set());
    setFileName('');
    setParseError('');
    setEditingRowId(null);
    setPreviewedRowId(null);
    onPreviewExcelStop?.(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const hasCoords  = !!(newStop.latitude && newStop.longitude);
  const singleValid = newStop.name && hasCoords;

  /* ════════════════════════════════════════
     RENDER
  ════════════════════════════════════════ */
  return (
    <div className="stop-form-root">

      {/* ── Header ── */}
      <div className="sf-header">
        <div className="sf-header-icon"><MapPin size={20} color="white" /></div>
        <div>
          <h2 className="sf-title">Add New Stop</h2>
          <p className="sf-subtitle">Add stops manually or import from a spreadsheet</p>
        </div>
      </div>

      <button className="sf-autofinder-btn" onClick={onOpenAutoFinder}>
        <Search size={16} /> Find Stops Automatically
      </button>

      <div className="sf-divider"><span>or add stops below</span></div>

      {/* ── Mode tabs ── */}
      <div className="sf-mode-tabs">
        <button className={`sf-mode-tab ${mode === 'single' ? 'sf-mode-tab--active' : ''}`} onClick={() => setMode('single')}>
          <Plus size={15} /> Single Stop
        </button>
        <button className={`sf-mode-tab ${mode === 'excel' ? 'sf-mode-tab--active' : ''}`} onClick={() => setMode('excel')}>
          <FileSpreadsheet size={15} /> Import from Excel
        </button>
      </div>

      {/* ══════════ SINGLE STOP ══════════ */}
      {mode === 'single' && (
        <div className="sf-panel">
          <div className="sf-field">
            <label className="sf-label">Stop Name</label>
            <div className="sf-input-wrap">
              <MapPin size={16} className="sf-input-icon" color="#6b21a8" />
              <input className="sf-input sf-input--icon" placeholder="e.g., 'Circle', 'Madina'"
                value={newStop.name} onChange={(e) => onStopNameChange(e.target.value)} />
            </div>
          </div>

          <div className="sf-coord-toggle">
            <span className="sf-label">Set Location via</span>
            <div className="sf-coord-pills">
              <button className={`sf-coord-pill ${coordMode === 'map' ? 'sf-coord-pill--active' : ''}`} onClick={() => setCoordMode('map')}>
                <MousePointerClick size={14} /> Map Click
              </button>
              <button className={`sf-coord-pill ${coordMode === 'keyboard' ? 'sf-coord-pill--active' : ''}`} onClick={() => setCoordMode('keyboard')}>
                <Keyboard size={14} /> Type Coords
              </button>
            </div>
          </div>

          {coordMode === 'map' && (
            <button className={`sf-map-btn ${hasCoords ? 'sf-map-btn--success' : ''}`} onClick={onSelectLocation}>
              {hasCoords ? <><Check size={18} /> Location Selected ✓</> : <><MapPin size={18} /> Click to Pin on Map</>}
            </button>
          )}

          {coordMode === 'keyboard' && (
            <div className="sf-coord-inputs">
              <div className="sf-field">
                <label className="sf-label sf-label--sm">Latitude</label>
                <input className="sf-input sf-input--coord" placeholder="e.g., 5.6037" type="number" step="any"
                  value={newStop.latitude || ''} onChange={(e) => onLatChange?.(e.target.value)} />
              </div>
              <div className="sf-field">
                <label className="sf-label sf-label--sm">Longitude</label>
                <input className="sf-input sf-input--coord" placeholder="e.g., -0.1870" type="number" step="any"
                  value={newStop.longitude || ''} onChange={(e) => onLngChange?.(e.target.value)} />
              </div>
            </div>
          )}

          {hasCoords && (
            <div className="sf-coord-badge">
              <Navigation size={14} color="#6b21a8" />
              <span className="sf-coord-value">
                {parseFloat(newStop.latitude).toFixed(6)}, {parseFloat(newStop.longitude).toFixed(6)}
              </span>
            </div>
          )}

          <div className="sf-actions">
            <button className="sf-btn sf-btn--cancel" onClick={onCancel}>Cancel</button>
            <button className="sf-btn sf-btn--primary" onClick={onAddStop} disabled={isLoading || !singleValid}>
              {isLoading ? <div className="sf-spinner" /> : <><Plus size={16} /> Save Stop</>}
            </button>
          </div>
        </div>
      )}

      {/* ══════════ EXCEL IMPORT ══════════ */}
      {mode === 'excel' && (
        <div className="sf-panel">
          <div className="sf-excel-hint">
            <Table size={14} color="#6b21a8" />
            <span>Columns needed: <strong>Name</strong>, <strong>Latitude</strong>, <strong>Longitude</strong></span>
          </div>

          {/* Dropzone */}
          {!excelStops.length && (
            <div
              className={`sf-dropzone ${isDragging ? 'sf-dropzone--dragging' : ''}`}
              onDrop={handleDrop}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onClick={() => fileInputRef.current?.click()}
            >
              <input ref={fileInputRef} type="file" accept=".xlsx,.xls,.csv" style={{ display: 'none' }}
                onChange={(e) => parseFile(e.target.files[0])} />
              <div className="sf-dropzone-icon"><Upload size={28} color="#6b21a8" /></div>
              <p className="sf-dropzone-title">Drop your file here</p>
              <p className="sf-dropzone-sub">or click to browse</p>
              <p className="sf-dropzone-formats">.xlsx  ·  .xls  ·  .csv</p>
            </div>
          )}

          {parseError && (
            <div className="sf-error"><AlertCircle size={16} /><span>{parseError}</span></div>
          )}

          {/* Preview table */}
          {excelStops.length > 0 && (
            <div className="sf-preview">
              {/* File + counts */}
              <div className="sf-preview-header">
                <div className="sf-preview-file">
                  <FileSpreadsheet size={16} color="#6b21a8" />
                  <span className="sf-preview-filename">{fileName}</span>
                  <button className="sf-preview-clear" onClick={clearFile} title="Remove file"><X size={14} /></button>
                </div>
                <div className="sf-preview-counts">
                  <span className="sf-preview-count sf-preview-count--total">{excelStops.length} stops</span>
                  <span className="sf-preview-count sf-preview-count--selected">{selectedIds.size} selected</span>
                </div>
              </div>

              {/* Toolbar */}
              <div className="sf-select-toolbar">
                <button className="sf-select-btn" onClick={selectAll}><CheckSquare size={14} /> Select All</button>
                <button className="sf-select-btn" onClick={deselectAll}><Square size={14} /> Deselect All</button>
                <span className="sf-click-hint"><Eye size={12} /> Click row to preview on map</span>
              </div>

              {/* Table */}
              <div className="sf-table-wrap">
                <table className="sf-table">
                  <thead>
                    <tr>
                      <th className="sf-th sf-th--check"></th>
                      <th className="sf-th sf-th--num">#</th>
                      <th className="sf-th">Stop Name</th>
                      <th className="sf-th">Latitude</th>
                      <th className="sf-th">Longitude</th>
                      <th className="sf-th sf-th--actions">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {excelStops.map((stop, idx) => {
                      const isSelected  = selectedIds.has(stop.id);
                      const isEditing   = editingRowId === stop.id;
                      const isPreviewed = previewedRowId === stop.id;

                      /* ── EDITING ROW ── */
                      if (isEditing) return (
                        <tr key={stop.id} className="sf-tr sf-tr--editing">
                          {/* checkbox area repurposed as "Editing" badge */}
                          <td className="sf-td sf-td--check" colSpan={2}>
                            <span className="sf-editing-badge">✎ Editing</span>
                          </td>

                          {/* Name input */}
                          <td className="sf-td sf-td--edit-cell">
                            <input
                              className="sf-inline-input"
                              value={editRowData.name}
                              onChange={(e) => setEditRowData(p => ({ ...p, name: e.target.value }))}
                              placeholder="Stop name"
                              autoFocus
                            />
                          </td>

                          {/* Lat input */}
                          <td className="sf-td sf-td--edit-cell">
                            <input
                              className="sf-inline-input sf-inline-input--coord"
                              value={editRowData.latitude}
                              onChange={(e) => setEditRowData(p => ({ ...p, latitude: e.target.value }))}
                              placeholder="Lat"
                              type="number"
                              step="any"
                            />
                          </td>

                          {/* Lng input */}
                          <td className="sf-td sf-td--edit-cell">
                            <input
                              className="sf-inline-input sf-inline-input--coord"
                              value={editRowData.longitude}
                              onChange={(e) => setEditRowData(p => ({ ...p, longitude: e.target.value }))}
                              placeholder="Lng"
                              type="number"
                              step="any"
                            />
                          </td>

                          {/* Action buttons */}
                          <td className="sf-td sf-td--actions">
                            <div className="sf-row-actions">
                              {onRequestMapPick && (
                                <button className="sf-row-btn sf-row-btn--map" onClick={handlePickOnMap} title="Pick on map">
                                  <MapPin size={12} />
                                </button>
                              )}
                              <button className="sf-row-btn sf-row-btn--save" onClick={saveEdit} title="Save">
                                <Save size={12} />
                              </button>
                              <button className="sf-row-btn sf-row-btn--cancel-edit" onClick={cancelEdit} title="Cancel">
                                <X size={12} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );

                      /* ── DISPLAY ROW ── */
                      return (
                        <tr
                          key={stop.id}
                          className={[
                            'sf-tr',
                            isSelected  ? 'sf-tr--selected'  : '',
                            isPreviewed ? 'sf-tr--previewed' : '',
                          ].join(' ')}
                          onClick={() => handleRowClick(stop)}
                          title={isPreviewed ? 'Click again to hide map preview' : 'Click to preview on map'}
                        >
                          {/* Checkbox */}
                          <td className="sf-td sf-td--check" onClick={(e) => { e.stopPropagation(); toggleStop(stop.id); }}>
                            <div className={`sf-checkbox ${isSelected ? 'sf-checkbox--checked' : ''}`}>
                              {isSelected && <Check size={11} color="white" strokeWidth={3} />}
                            </div>
                          </td>

                          {/* Index / preview indicator */}
                          <td className="sf-td sf-td--num">
                            {isPreviewed
                              ? <Eye size={13} color="#6b21a8" />
                              : <span>{idx + 1}</span>
                            }
                          </td>

                          {/* Name */}
                          <td className="sf-td sf-td--name">
                            <div className="sf-stop-name-cell">
                              <MapPin size={12} color={isPreviewed ? '#6b21a8' : isSelected ? '#8b5cf6' : '#c4c9d4'} />
                              <span className={isPreviewed ? 'sf-name-previewed' : ''}>{stop.name}</span>
                            </div>
                          </td>

                          {/* Lat */}
                          <td className="sf-td sf-td--coord">{stop.latitude.toFixed(6)}</td>

                          {/* Lng */}
                          <td className="sf-td sf-td--coord">{stop.longitude.toFixed(6)}</td>

                          {/* Actions */}
                          <td className="sf-td sf-td--actions" onClick={(e) => e.stopPropagation()}>
                            <div className="sf-row-actions">
                              <button className="sf-row-btn sf-row-btn--edit" onClick={(e) => startEdit(e, stop)} title="Edit stop">
                                <Edit3 size={12} />
                              </button>
                              <button className="sf-row-btn sf-row-btn--delete" onClick={(e) => deleteRow(e, stop.id)} title="Remove">
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Add selected */}
              <button
                className="sf-add-selected-btn"
                onClick={handleAddSelected}
                disabled={selectedIds.size === 0 || isImporting}
              >
                {isImporting
                  ? <><div className="sf-spinner sf-spinner--white" /> Importing…</>
                  : <><Check size={18} strokeWidth={2.5} /> Add {selectedIds.size} Selected Stop{selectedIds.size !== 1 ? 's' : ''}</>
                }
              </button>
            </div>
          )}

          <div style={{ marginTop: 12 }}>
            <button className="sf-btn sf-btn--cancel" style={{ width: '100%' }} onClick={onCancel}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StopForm;