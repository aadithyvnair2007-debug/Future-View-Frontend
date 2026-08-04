// src/utils/api.js

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://future-view.onrender.com';

/**
 * Universal helper for API requests
 */
export const apiFetch = async (endpoint, options = {}) => {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const headers = {
        "Content-Type": "application/json",
        ...(options.headers || {})
    };

    const token = localStorage.getItem('token');
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await apiFetch(url, {
        ...options,
        headers
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || data.message || 'Something went wrong');
    }

    return data;
};