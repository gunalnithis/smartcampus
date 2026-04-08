import { API_BASE } from "./constants";

export const fetchJson = async (path) => {
  const response = await fetch(`${API_BASE}${path}`);
  if (!response.ok) {
    throw new Error(`${path} failed (${response.status})`);
  }
  return response.json();
};

export const fetchWithBody = async (path, method, body) => {
  const response = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `${method} ${path} failed (${response.status})`);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
};

export const deleteRequest = async (path) => {
  const response = await fetch(`${API_BASE}${path}`, { method: "DELETE" });
  if (!response.ok && response.status !== 204) {
    const text = await response.text();
    throw new Error(text || `DELETE ${path} failed (${response.status})`);
  }
};
