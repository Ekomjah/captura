import axios from "axios";
const apiUrl = import.meta.env.VITE_API_BASE_URL;
export const api = axios.create({
  baseURL: apiUrl,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});
