export async function authenticatedFetch(url, options = {}) {
  const token = localStorage.getItem('authToken');
  
  const headers = options.headers || {};
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  headers['Content-Type'] = 'application/json';
  
  return fetch(url, {
    ...options,
    headers,
  });
}
