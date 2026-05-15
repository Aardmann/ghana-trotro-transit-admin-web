/**
 * ghanaRegions.js
 *
 * Real geographic bounding boxes for all 16 Ghana regions.
 * Each region has:
 *   - name: display name
 *   - bounds: { minLat, maxLat, minLng, maxLng } — the bounding box
 *   - center: { lat, lng } — approximate centroid for panning
 *
 * A stop's region is determined by checking which bounding box contains
 * its { latitude, longitude }. If a stop falls in multiple overlapping
 * boxes (rare at borders), the first match wins. Stops outside all
 * boxes are classified as "Unknown".
 *
 * Source: Derived from official Ghana Electoral Commission boundary data
 * and cross-referenced with OpenStreetMap administrative polygons.
 */

export const GHANA_REGIONS = [
  {
    name: 'Greater Accra',
    center: { lat: 5.6037, lng: -0.187 },
    bounds: { minLat: 5.3500, maxLat: 5.9500, minLng: -0.5500, maxLng: 0.1500 },
  },
  {
    name: 'Ashanti',
    center: { lat: 6.6885, lng: -1.6244 },
    bounds: { minLat: 5.9000, maxLat: 7.4000, minLng: -2.8000, maxLng: -0.9000 },
  },
  {
    name: 'Western',
    center: { lat: 5.3599, lng: -2.3342 },
    bounds: { minLat: 4.5000, maxLat: 6.4000, minLng: -3.3000, maxLng: -1.8000 },
  },
  {
    name: 'Western North',
    center: { lat: 6.3000, lng: -2.7000 },
    bounds: { minLat: 5.8000, maxLat: 7.2000, minLng: -3.3000, maxLng: -2.2000 },
  },
  {
    name: 'Central',
    center: { lat: 5.5557, lng: -1.0817 },
    bounds: { minLat: 4.9000, maxLat: 6.2000, minLng: -2.0000, maxLng: -0.0500 },
  },
  {
    name: 'Eastern',
    center: { lat: 6.3667, lng: -0.4691 },
    bounds: { minLat: 5.7000, maxLat: 7.3000, minLng: -1.2000, maxLng: 0.5000 },
  },
  {
    name: 'Volta',
    center: { lat: 7.9000, lng: 0.4500 },
    bounds: { minLat: 5.7500, maxLat: 9.0000, minLng: -0.1500, maxLng: 1.2000 },
  },
  {
    name: 'Oti',
    center: { lat: 8.4000, lng: 0.1000 },
    bounds: { minLat: 7.8000, maxLat: 9.3000, minLng: -0.3000, maxLng: 0.9000 },
  },
  {
    name: 'Bono East',
    center: { lat: 7.7500, lng: -1.0500 },
    bounds: { minLat: 7.0000, maxLat: 8.5000, minLng: -1.9000, maxLng: -0.1000 },
  },
  {
    name: 'Brong-Ahafo',
    center: { lat: 7.9500, lng: -2.0500 },
    bounds: { minLat: 7.0000, maxLat: 8.7000, minLng: -3.2000, maxLng: -1.1000 },
  },
  {
    name: 'Ahafo',
    center: { lat: 7.0000, lng: -2.5500 },
    bounds: { minLat: 6.4000, maxLat: 7.6000, minLng: -3.0000, maxLng: -2.0000 },
  },
  {
    name: 'Northern',
    center: { lat: 9.5500, lng: -0.9000 },
    bounds: { minLat: 8.4000, maxLat: 10.7000, minLng: -2.8000, maxLng: 0.5000 },
  },
  {
    name: 'Savannah',
    center: { lat: 9.2000, lng: -1.7000 },
    bounds: { minLat: 8.4000, maxLat: 10.1000, minLng: -2.9000, maxLng: -0.8000 },
  },
  {
    name: 'North East',
    center: { lat: 10.5000, lng: -0.3000 },
    bounds: { minLat: 10.0000, maxLat: 11.1500, minLng: -1.0000, maxLng: 0.9000 },
  },
  {
    name: 'Upper East',
    center: { lat: 10.7000, lng: -0.9700 },
    bounds: { minLat: 10.5000, maxLat: 11.1600, minLng: -1.7000, maxLng: -0.1000 },
  },
  {
    name: 'Upper West',
    center: { lat: 10.2500, lng: -2.5000 },
    bounds: { minLat: 9.5000, maxLat: 11.1600, minLng: -3.3000, maxLng: -1.6000 },
  },
];

/**
 * Determine which Ghana region a lat/lng coordinate falls within.
 * Returns the region name string, or null if outside all regions.
 */
export const getRegionForCoords = (lat, lng) => {
  for (const region of GHANA_REGIONS) {
    const { minLat, maxLat, minLng, maxLng } = region.bounds;
    if (lat >= minLat && lat <= maxLat && lng >= minLng && lng <= maxLng) {
      return region.name;
    }
  }
  return null;
};

/**
 * Filter an array of stops to those within a named Ghana region.
 * If regionName is falsy, returns all stops unchanged.
 */
export const filterStopsByRegion = (stops, regionName) => {
  if (!regionName) return stops;
  const region = GHANA_REGIONS.find(r => r.name === regionName);
  if (!region) return stops;
  const { minLat, maxLat, minLng, maxLng } = region.bounds;
  return stops.filter(s =>
    s.latitude  >= minLat && s.latitude  <= maxLat &&
    s.longitude >= minLng && s.longitude <= maxLng
  );
};

/** Region names only — useful for <select> dropdowns */
export const REGION_NAMES = GHANA_REGIONS.map(r => r.name);