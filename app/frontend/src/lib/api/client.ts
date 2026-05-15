import axios from "axios";
export const api = axios.create({
  baseURL: "/v1",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});
