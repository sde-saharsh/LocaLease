/**
 * Resolves an image URL to a valid, reachable URI.
 * Handles:
 * 1. Relative paths (e.g., /uploads/...)
 * 2. Localhost URLs in production APKs
 * 3. Mock data URLs
 */
export const resolveImageUri = (uri, apiUrl) => {
  if (!uri) return 'https://via.placeholder.com/600x400?text=No+Image';
  if (typeof uri !== 'string') return 'https://via.placeholder.com/600x400?text=No+Image';

  // 1. If it's already a valid external URL (Unsplash, Cloudinary, etc.), return it
  if (uri.startsWith('http') && !uri.includes('localhost') && !uri.includes('127.0.0.1')) {
    return uri;
  }

  // 2. Get the base URL from API_URL (remove /api)
  const baseUrl = apiUrl.replace(/\/api$/, '');

  // 3. Handle localhost or 127.0.0.1 (common in dev DBs)
  if (uri.includes('localhost') || uri.includes('127.0.0.1')) {
    // Extract the path after the host (e.g., /uploads/...)
    const pathMatch = uri.match(/:\d+(\/.*)$/);
    if (pathMatch && pathMatch[1]) {
      return `${baseUrl}${pathMatch[1]}`;
    }
    // Fallback: try to find /uploads/ in the string
    const uploadMatch = uri.match(/\/uploads\/.*$/);
    if (uploadMatch) {
      return `${baseUrl}${uploadMatch[0]}`;
    }
  }

  // 4. Handle relative paths
  if (uri.startsWith('/')) {
    return `${baseUrl}${uri}`;
  }
  
  if (uri.startsWith('uploads/')) {
    return `${baseUrl}/${uri}`;
  }

  return uri;
};
