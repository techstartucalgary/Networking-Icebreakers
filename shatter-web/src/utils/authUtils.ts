// Authentication event helper
// Dispatch this event whenever auth state changes (login/logout)

export const dispatchAuthChange = () => {
  window.dispatchEvent(new Event('authChange'));
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem('token');
};

// Get auth token
export const getAuthToken = (): string | null => {
  return localStorage.getItem('token');
};

// Set auth token and dispatch event
export const setAuthToken = (token: string): void => {
  localStorage.setItem('token', token);
  dispatchAuthChange();
};

// Remove auth token and dispatch event
export const removeAuthToken = (): void => {
  localStorage.removeItem('token');
  dispatchAuthChange();
};
