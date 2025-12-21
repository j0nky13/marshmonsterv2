import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

export const api = axios.create({
  baseURL: `${API_BASE}/api`,
});

export function setAuthToken(token) {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    localStorage.setItem("oom_token", token);
  } else {
    delete api.defaults.headers.common["Authorization"];
    localStorage.removeItem("oom_token");
  }
}