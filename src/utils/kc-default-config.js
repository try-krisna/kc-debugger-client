export const DEFAULT_CONFIG = {
  url: import.meta.env.VITE_KC_URL,
  realm: import.meta.env.VITE_KC_REALM,
  clientId: import.meta.env.VITE_KC_CLIENT_ID,
  scope: import.meta.env.VITE_KC_SCOPE,
  redirectUri: window.location.origin,
};