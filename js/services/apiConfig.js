/* export const API_ORIGIN =
  window.location.port === "3000"
    ? window.location.origin
    : `${window.location.protocol}//${window.location.hostname}:3000`;

export const API_BASE_URL = `${API_ORIGIN}/api`;
 */


export const API_ORIGIN = window.location.port === "3000"
  ? window.location.origin
  : `${window.location.protocol}//${window.location.hostname}`;

export const API_BASE_URL = `${API_ORIGIN}/api`;