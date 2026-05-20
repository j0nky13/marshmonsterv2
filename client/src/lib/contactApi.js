const API_URL = import.meta.env.VITE_API_URL || "/api";

export async function createContactRequest(payload) {
  const response = await fetch(`${API_URL}/contact`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  const data = await response.json();

  if (!response.ok) {
    throw data;
  }

  return data;
}