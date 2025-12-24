// src/config.js
export const API_URL = window.location.hostname === "localhost" 
    ? "http://localhost:5000" 
    : "https://fuel-tracker-api.vercel.app";