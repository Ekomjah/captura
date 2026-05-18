import axios from "axios";

const baseURL =
  import.meta.env.VITE_API_BASE_URL?.trim() || "/v1";

export const api = axios.create({
  baseURL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});
