/**
 * OAuth URL parser utility
 * Extracts id_token from OAuth callback URLs (fragment or query params)
 */

/**
 * Extract id_token from OAuth callback URL
 * Supports both fragment (#id_token=xxx) and query (?id_token=xxx) formats
 */
export const extractIdTokenFromUrl = (url: string): string | null => {
  if (!url.includes('oauth') && !url.includes('id_token')) return null;

  // Try fragment (#id_token=xxx)
  const hashIndex = url.indexOf('#');
  if (hashIndex !== -1) {
    const fragment = url.substring(hashIndex + 1);
    const params = new URLSearchParams(fragment);
    const token = params.get('id_token');
    if (token) return token;
  }

  // Try query params (?id_token=xxx)
  const queryIndex = url.indexOf('?');
  if (queryIndex !== -1) {
    const query = url.substring(queryIndex + 1);
    const params = new URLSearchParams(query);
    const token = params.get('id_token');
    if (token) return token;
  }

  return null;
};
