import { auth } from "../firebase/firebase";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5050/api";

export async function apiFetch(endpoint, options = {}) {
  const currentUser = auth.currentUser;

  let token = null;

  if (currentUser) {
    token = await currentUser.getIdToken();
  }

  const devEmail = localStorage.getItem("devEmail");

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      ...(options.body instanceof FormData
        ? {}
        : { "Content-Type": "application/json" }),

      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(!token && devEmail ? { "x-dev-email": devEmail } : {}),

      ...(options.headers || {})
    }
  });

  const data = await response.json();

  if (!response.ok) {
    throw data;
  }

  return data;
}