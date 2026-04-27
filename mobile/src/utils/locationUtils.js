/**
 * Haversine formula — returns straight-line distance between two GPS points in km.
 */
export function getDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const toRad = (v) => (v * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Extract the city portion from a location string like "Connaught Place, Delhi"
 * Returns the last comma-separated segment, trimmed.
 */
export function extractCity(locationString) {
  if (!locationString) return '';
  if (typeof locationString === 'object') {
    const cityCandidate =
      locationString.city ||
      locationString.town ||
      locationString.village ||
      locationString.subregion ||
      locationString.district ||
      locationString.region ||
      '';
    if (typeof cityCandidate !== 'string') return '';
    return cityCandidate.replace(/,?\s*India$/i, '').trim();
  }

  if (typeof locationString !== 'string') return '';

  const parts = locationString.split(',');
  return parts[parts.length - 1].trim().replace(/,?\s*India$/i, '').trim();
}

/**
 * Check whether two city strings refer to the same city (case-insensitive,
 * ignores "India" suffix and extra spaces).
 */
export function isSameCity(cityA, cityB) {
  if (!cityA || !cityB) return false;
  const normalize = (s) =>
    s.toLowerCase().replace(/,?\s*india$/i, '').trim();
  return normalize(cityA).includes(normalize(cityB)) ||
    normalize(cityB).includes(normalize(cityA));
}
