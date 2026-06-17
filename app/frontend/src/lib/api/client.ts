import axios from "axios";

const baseURL = import.meta.env.VITE_API_BASE_URL?.trim() || "/v1";

export const api = axios.create({
  baseURL,
  timeout: 30000,
  headers: {
    // Bypass the ngrok-free browser interstitial, which otherwise replaces
    // JSON API responses with an HTML warning page on browser requests.
    "ngrok-skip-browser-warning": "true",
  },
});
