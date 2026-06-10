import React, { useState, useEffect, useRef } from "react";
import {
  Sparkles,
  Route,
  X,
  ArrowUp,
  ArrowDown,
  AlertCircle,
  ChevronRight,
  Loader,
  CheckCircle,
  Info,
  Layers,
  RefreshCw,
  MapPin,
} from "lucide-react";
import { supabase } from "../config/supabase";

// ─── helpers (mirrors CompositeRouteForm) ────────────────────────────────────

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

      if (i === 0 && lastStopId !== null && stopId === lastStopId) {
        if (merged.length > 0) {
          const junction = merged[merged.length - 1];
          if (rs.fare_to_next != null) junction.fare_to_next = rs.fare_to_next;
          if (rs.distance_to_next != null)
            junction.distance_to_next = rs.distance_to_next;
        }
        continue;
      }

      merged.push({
        stop_id: stopId,
        stop_name: rs.stops?.name ?? "Unknown",
        latitude: rs.stops?.latitude,
        longitude: rs.stops?.longitude,
        fare_to_next: rs.fare_to_next,
        distance_to_next: rs.distance_to_next,
        stop_order: globalOrder,
        from_route_name: route.name,
        from_route_id: route.id,
      });

      lastStopId = stopId;
      globalOrder++;
    }
  }

  return merged;
};

const validateJunctions = (routes) => {
  const errors = [];
  for (let i = 0; i < routes.length - 1; i++) {
    const current = routes[i];
    const next = routes[i + 1];
    const currentSorted = (current.route_stops || [])
      .slice()
      .sort((a, b) => (a.stop_order ?? 0) - (b.stop_order ?? 0));
    const nextSorted = (next.route_stops || [])
      .slice()
      .sort((a, b) => (a.stop_order ?? 0) - (b.stop_order ?? 0));

    const lastStop = currentSorted[currentSorted.length - 1];
    const firstStop = nextSorted[0];
    const lastId = lastStop?.stops?.id ?? lastStop?.stop_id;
    const firstId = firstStop?.stops?.id ?? firstStop?.stop_id;

    if (!lastId || !firstId || lastId !== firstId) {
      errors.push(
        `"${current.name}" ends at "${lastStop?.stops?.name ?? "?"}" but "${
          next.name
        }" starts at "${firstStop?.stops?.name ?? "?"}". These must share a stop.`
      );
    }
  }
  return errors;
};

// ─── AI call ─────────────────────────────────────────────────────────────────

const askAI = async (prompt, availableRoutes) => {
  const routeSummaries = availableRoutes.map((r) => {
    const sorted = (r.route_stops || []).sort(
      (a, b) => (a.stop_order ?? 0) - (b.stop_order ?? 0)
    );
    const first = sorted[0]?.stops?.name ?? "?";
    const last = sorted[sorted.length - 1]?.stops?.name ?? "?";
    const via = sorted
      .slice(1, -1)
      .map((s) => s.stops?.name)
      .filter(Boolean)
      .join(", ");
    return `- ID: ${r.id} | Name: "${r.name}" | From: ${first} → To: ${last}${
      via ? ` (via ${via})` : ""
    } | Fare: GH₵${r.total_fare ?? "?"} | Distance: ${
      r.total_distance ?? "?"
    }km`;
  });

  const systemPrompt = `You are a route planning assistant for a Ghanaian transport app.
Given a natural language description of a desired journey, select the best sequence of existing routes that together form a composite route.

Rules:
1. Each selected route must connect (the last stop of route N equals the first stop of route N+1).
2. Return an ordered list of route IDs that chain together to form the journey.
3. If no valid chain is possible, explain why briefly.
4. Return ONLY a JSON object — no markdown, no preamble — in this exact shape:
{
  "success": true,
  "route_ids": ["uuid1", "uuid2"],
  "suggested_name": "Short descriptive name e.g. Madina to Tema",
  "reasoning": "One sentence explaining the chain"
}
Or on failure:
{
  "success": false,
  "reasoning": "Why no valid chain was found"
}

Available routes:
${routeSummaries.join("\n")}`;
  const { data, error } = await supabase.functions.invoke("ai-composite-route", {
    body: {
      system: systemPrompt,
      prompt,
    },
  });

  if (error) throw new Error(error.message || "Edge function error");

  // The edge function returns { text: "..." } containing the raw JSON string
  const raw = (data?.text ?? "")
    .replace(/```json|```/g, "")
    .trim();

  return JSON.parse(raw);
};

const EMPTY_ROUTE_INFO = {
  description: "",
  travelTimeMinutes: "",
  peakHours: "",
  frequency: "",
  vehicleType: "",
  notes: "",
  amenities: [],
  operatingHours: {
    start: "06:00",
    end: "22:00",
    days: [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ],
  },
};

const AICompositeRouteBuilder = ({
  onCancel,
  onSave,
  isLoading,
  availableRoutes = [],
}) => {
  const [prompt, setPrompt] = useState("");
  const [aiStatus, setAiStatus] = useState("idle");
  const [aiError, setAiError] = useState("");
  const [aiReasoning, setAiReasoning] = useState("");

  const [selectedRoutes, setSelectedRoutes] = useState([]);
  const [routeName, setRouteName] = useState("");
  const [junctionErrors, setJunctionErrors] = useState([]);
  const [mergedPreview, setMergedPreview] = useState([]);
  const [routeInfo, setRouteInfo] = useState(EMPTY_ROUTE_INFO);

  const userEditedName = useRef(false);

  // ── Re-compute merge + validate whenever selectedRoutes changes ─────────────
  useEffect(() => {
    if (selectedRoutes.length < 2) {
      setMergedPreview([]);
      setJunctionErrors([]);
      return;
    }
    const errors = validateJunctions(selectedRoutes);
    setJunctionErrors(errors);
    if (errors.length === 0) setMergedPreview(mergeSubRouteStops(selectedRoutes));
    else setMergedPreview([]);
  }, [selectedRoutes]);

  // ── Auto-fill route name ────────────────────────────────────────────────────
  useEffect(() => {
    if (userEditedName.current) return;
    if (selectedRoutes.length < 2 || junctionErrors.length > 0) return;
    const first = selectedRoutes[0].route_stops
      ?.slice()
      .sort((a, b) => (a.stop_order ?? 0) - (b.stop_order ?? 0))[0]?.stops?.name;
    const lastRoute = selectedRoutes[selectedRoutes.length - 1];
    const last = lastRoute.route_stops
      ?.slice()
      .sort((a, b) => (a.stop_order ?? 0) - (b.stop_order ?? 0))
      .slice(-1)[0]?.stops?.name;
    if (first && last) setRouteName(`${first} to ${last}`);
  }, [selectedRoutes, junctionErrors]);

  // ── AI handler ──────────────────────────────────────────────────────────────
  const handleAsk = async () => {
    if (!prompt.trim() || availableRoutes.length === 0) return;
    setAiStatus("thinking");
    setAiError("");
    setAiReasoning("");
    setSelectedRoutes([]);
    userEditedName.current = false;

    try {
      const result = await askAI(prompt.trim(), availableRoutes);

      if (!result.success) {
        setAiStatus("error");
        setAiError(result.reasoning || "No valid route chain found.");
        return;
      }

      const resolved = result.route_ids
        .map((id) => availableRoutes.find((r) => r.id === id))
        .filter(Boolean);

      if (resolved.length < 2) {
        setAiStatus("error");
        setAiError(
          "AI returned fewer than 2 recognisable routes. Try rephrasing."
        );
        return;
      }

      setSelectedRoutes(resolved);
      if (result.suggested_name && !userEditedName.current) {
        setRouteName(result.suggested_name);
      }
      setAiReasoning(result.reasoning || "");
      setAiStatus("success");
    } catch (err) {
      console.error("AI composite route error:", err);
      setAiStatus("error");
      setAiError("Something went wrong calling the AI. Please try again.");
    }
  };

  // ── Manual reorder / remove ─────────────────────────────────────────────────
  const moveRoute = (index, dir) => {
    const next = [...selectedRoutes];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    setSelectedRoutes(next);
  };

  const removeRoute = (id) => {
    setSelectedRoutes((prev) => prev.filter((r) => r.id !== id));
  };

  // ── Totals ──────────────────────────────────────────────────────────────────
  const totalFare = mergedPreview
    .reduce((s, stop) => s + (parseFloat(stop.fare_to_next) || 0), 0)
    .toFixed(2);
  const totalDistance = mergedPreview
    .reduce((s, stop) => s + (parseFloat(stop.distance_to_next) || 0), 0)
    .toFixed(2);

  // ── Route info handlers ─────────────────────────────────────────────────────
  const handleInfoChange = (key, val) =>
    setRouteInfo((prev) => ({ ...prev, [key]: val }));
  const handleAmenityToggle = (id) =>
    setRouteInfo((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(id)
        ? prev.amenities.filter((a) => a !== id)
        : [...prev.amenities, id],
    }));
  const handleHoursChange = (key, val) =>
    setRouteInfo((prev) => ({
      ...prev,
      operatingHours: { ...prev.operatingHours, [key]: val },
    }));
  const handleDayToggle = (day) =>
    setRouteInfo((prev) => {
      const days = prev.operatingHours.days.includes(day)
        ? prev.operatingHours.days.filter((d) => d !== day)
        : [...prev.operatingHours.days, day];
      return { ...prev, operatingHours: { ...prev.operatingHours, days } };
    });

  // ── Save ────────────────────────────────────────────────────────────────────
  const canSave =
    !isLoading &&
    selectedRoutes.length >= 2 &&
    routeName.trim() !== "" &&
    junctionErrors.length === 0;

  const handleSave = () => {
    if (!canSave) return;
    onSave({
      routeName,
      selectedRoutes,
      mergedStops: mergedPreview,
      routeInfo,
    });
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="form-container">
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          marginBottom: "18px",
        }}
      >
        <div
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "10px",
            background: "linear-gradient(135deg, #7c3aed, #a855f7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Sparkles size={18} color="#fff" />
        </div>
        <div>
          <h2
            style={{ margin: 0, fontSize: "15px", fontWeight: 600, color: "#111827" }}
          >
            AI Route Builder
          </h2>
          <p
            style={{ margin: 0, fontSize: "12px", color: "#6b7280" }}
          >
            Describe your journey — AI picks the right sub-routes
          </p>
        </div>
      </div>

      {/* Prompt input */}
      <div style={{ marginBottom: "14px" }}>
        <div
          style={{
            display: "flex",
            gap: "8px",
            alignItems: "flex-start",
          }}
        >
          <textarea
            className="input"
            rows={2}
            placeholder="e.g. 'I need a route from Madina to Tema via the motorway' or 'Connect Circle to Kasoa through Achimota'"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleAsk();
              }
            }}
            style={{ flex: 1, resize: "none", fontSize: "13px" }}
          />
          <button
            className={`save-button ${
              !prompt.trim() || aiStatus === "thinking"
                ? "save-button-disabled"
                : ""
            }`}
            style={{
              minWidth: "80px",
              height: "64px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "4px",
              fontSize: "11px",
            }}
            onClick={handleAsk}
            disabled={!prompt.trim() || aiStatus === "thinking"}
          >
            {aiStatus === "thinking" ? (
              <Loader size={18} className="spin" />
            ) : (
              <Sparkles size={18} />
            )}
            {aiStatus === "thinking" ? "Thinking…" : "Ask AI"}
          </button>
        </div>

        {/* Prompt examples */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "8px" }}>
          {[
            "Circle to Tema via Teshie",
            "Accra to Kumasi via Suhum",
            "Madina to Kaneshie",
          ].map((ex) => (
            <button
              key={ex}
              onClick={() => setPrompt(ex)}
              style={{
                fontSize: "11px",
                color: "#6b21a8",
                background: "#ede9fe",
                border: "1px solid #c4b5fd",
                borderRadius: "20px",
                padding: "3px 10px",
                cursor: "pointer",
              }}
            >
              {ex}
            </button>
          ))}
        </div>
      </div>

      {/* AI status messages */}
      {aiStatus === "error" && (
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: "8px",
            background: "#fef2f2",
            border: "1px solid #fecaca",
            borderRadius: "8px",
            padding: "10px 14px",
            marginBottom: "14px",
          }}
        >
          <AlertCircle size={15} color="#dc2626" style={{ flexShrink: 0, marginTop: "1px" }} />
          <span style={{ fontSize: "12px", color: "#dc2626", lineHeight: "1.5" }}>
            {aiError}
          </span>
        </div>
      )}

      {aiStatus === "success" && aiReasoning && (
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: "8px",
            background: "#f0fdf4",
            border: "1px solid #bbf7d0",
            borderRadius: "8px",
            padding: "10px 14px",
            marginBottom: "14px",
          }}
        >
          <CheckCircle size={15} color="#16a34a" style={{ flexShrink: 0, marginTop: "1px" }} />
          <span style={{ fontSize: "12px", color: "#15803d", lineHeight: "1.5" }}>
            {aiReasoning}
          </span>
        </div>
      )}

      {/* Route name */}
      {selectedRoutes.length >= 2 && (
        <div className="input-group">
          <input
            className="input"
            placeholder="Composite route name"
            value={routeName}
            onChange={(e) => {
              userEditedName.current = true;
              setRouteName(e.target.value);
            }}
          />
        </div>
      )}

      {/* Selected sub-routes */}
      {selectedRoutes.length > 0 && (
        <>
          <h3 className="sub-section-title" style={{ marginTop: "16px" }}>
            Sub-routes ({selectedRoutes.length})
            {mergedPreview.length >= 2 && junctionErrors.length === 0 && (
              <span className="route-distance-badge">
                <Route size={14} />
                {totalDistance} km &nbsp;•&nbsp; GH₵ {totalFare}
              </span>
            )}
          </h3>

          <div className="plotted-stops-list">
            {selectedRoutes.map((route, index) => {
              const sorted = (route.route_stops || [])
                .slice()
                .sort((a, b) => (a.stop_order ?? 0) - (b.stop_order ?? 0));
              const firstStop = sorted[0]?.stops?.name ?? "?";
              const lastStop = sorted[sorted.length - 1]?.stops?.name ?? "?";
              const hasError =
                junctionErrors.length > 0 &&
                (index < selectedRoutes.length - 1 || index > 0);

              return (
                <div
                  key={route.id}
                  className="plotted-stop-item"
                  style={hasError ? { borderLeft: "3px solid #ef4444" } : {}}
                >
                  <div className="stop-number">
                    <span className="stop-number-text">{index + 1}</span>
                  </div>

                  <div className="plotted-stop-info" style={{ flex: 1, minWidth: 0 }}>
                    <div className="existing-stop-display">
                      <span
                        className="existing-stop-name"
                        style={{
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {route.name}
                      </span>
                      <span className="existing-badge">{sorted.length} stops</span>
                    </div>
                    <div
                      style={{
                        fontSize: "11px",
                        color: "#6b21a8",
                        marginTop: "2px",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      <MapPin size={10} />
                      {firstStop}
                      <ChevronRight size={10} />
                      {lastStop}
                    </div>
                    <div className="stop-coordinates">
                      GH₵ {route.total_fare} &nbsp;•&nbsp; {route.total_distance} km
                    </div>
                  </div>

                  {/* Reorder */}
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "2px",
                      marginRight: "4px",
                    }}
                  >
                    <button
                      className="remove-button"
                      style={{ color: index === 0 ? "#d1d5db" : "#6b7280" }}
                      onClick={() => moveRoute(index, -1)}
                      disabled={index === 0}
                    >
                      <ArrowUp size={13} />
                    </button>
                    <button
                      className="remove-button"
                      style={{
                        color:
                          index === selectedRoutes.length - 1 ? "#d1d5db" : "#6b7280",
                      }}
                      onClick={() => moveRoute(index, 1)}
                      disabled={index === selectedRoutes.length - 1}
                    >
                      <ArrowDown size={13} />
                    </button>
                  </div>

                  <button
                    className="remove-button"
                    onClick={() => removeRoute(route.id)}
                  >
                    <X size={16} color="#EF4444" />
                  </button>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Junction errors */}
      {junctionErrors.length > 0 && (
        <div className="validation-messages" style={{ marginTop: "12px" }}>
          <div
            style={{
              fontSize: "12px",
              fontWeight: 600,
              color: "#dc2626",
              marginBottom: "6px",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <AlertCircle size={14} />
            Junction mismatch — sub-routes must connect at a shared stop:
          </div>
          {junctionErrors.map((err, i) => (
            <div key={i} className="validation-error">
              {err}
            </div>
          ))}
          <div
            style={{
              fontSize: "11px",
              color: "#6b7280",
              marginTop: "6px",
              fontStyle: "italic",
            }}
          >
            Try reordering the sub-routes above, or ask AI to retry with a
            different phrasing.
          </div>
          {/* Retry AI button */}
          <button
            className="cancel-button"
            style={{
              marginTop: "8px",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "12px",
            }}
            onClick={handleAsk}
          >
            <RefreshCw size={13} /> Retry AI
          </button>
        </div>
      )}

      {/* Merged stop preview */}
      {mergedPreview.length >= 2 && junctionErrors.length === 0 && (
        <>
          <h3 className="sub-section-title" style={{ marginTop: "20px" }}>
            Merged Preview
            <span className="route-distance-badge">
              <Route size={14} />
              {mergedPreview.length} stops
            </span>
          </h3>

          <div
            style={{
              background: "#f9fafb",
              border: "1px solid #e5e7eb",
              borderRadius: "10px",
              padding: "12px 14px",
              marginBottom: "16px",
              maxHeight: "240px",
              overflowY: "auto",
            }}
          >
            {mergedPreview.map((stop, index) => {
              const isFirst = index === 0;
              const isLast = index === mergedPreview.length - 1;
              const dotColor = isFirst
                ? "#10b981"
                : isLast
                ? "#ef4444"
                : "#7c3aed";

              return (
                <div
                  key={`${stop.stop_id}-${index}`}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "10px",
                    padding: "5px 0",
                    borderBottom:
                      index < mergedPreview.length - 1
                        ? "1px solid #f3f4f6"
                        : "none",
                  }}
                >
                  <div
                    style={{
                      width: "22px",
                      height: "22px",
                      background: dotColor,
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#fff",
                      fontSize: "10px",
                      fontWeight: 700,
                      flexShrink: 0,
                    }}
                  >
                    {index + 1}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <span
                      style={{
                        fontSize: "13px",
                        fontWeight: 500,
                        color: "#111827",
                      }}
                    >
                      {stop.stop_name}
                    </span>
                    {!isLast && stop.fare_to_next != null && (
                      <span
                        style={{
                          fontSize: "11px",
                          color: "#6b7280",
                          marginLeft: "8px",
                        }}
                      >
                        → GH₵ {stop.fare_to_next}
                        {stop.distance_to_next != null &&
                          ` (${stop.distance_to_next} km)`}
                      </span>
                    )}
                  </div>
                  <span
                    style={{
                      fontSize: "10px",
                      color: "#9ca3af",
                      fontStyle: "italic",
                      flexShrink: 0,
                      maxWidth: "90px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {stop.from_route_name}
                  </span>
                </div>
              );
            })}
          </div>

        </>
      )}

      {/* Action buttons */}
      <div className="button-row" style={{ marginTop: "20px" }}>
        <button className="cancel-button" onClick={onCancel}>
          Cancel
        </button>
        <button
          className={`save-button ${!canSave ? "save-button-disabled" : ""}`}
          onClick={handleSave}
          disabled={!canSave}
        >
          {isLoading ? (
            <div className="spinner" />
          ) : (
            <>
              <Layers size={16} style={{ marginRight: "6px" }} />
              Create Composite Route
            </>
          )}
        </button>
      </div>

      {/* Spinner keyframe (injected once) */}
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .spin { animation: spin 1s linear infinite; }
      `}</style>
    </div>
  );
};

export default AICompositeRouteBuilder;
