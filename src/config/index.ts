// API endpoints and URLs
export const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://safeway-backend.onrender.com';
export const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || 'your_mapbox_token';

// Auth endpoints
export const AUTH_ENDPOINTS = {
  LOGIN: `${API_URL}/auth/token`,
  REGISTER: `${API_URL}/auth/register`
};

// News endpoints
export const NEWS_ENDPOINTS = {
  GET_ALL: `${API_URL}/news/`,
  CREATE: `${API_URL}/news/`
}; 