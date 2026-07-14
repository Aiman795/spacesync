const API_BASE = "http://localhost:5000/api";

export function getToken() {
  return localStorage.getItem("token");
}

export function clearToken() {
  localStorage.removeItem("token");
}

async function request(path, options = {}) {
  const token = getToken();
  const headers = { ...options.headers };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  // Don't force Content-Type for FormData — browser sets the boundary itself
  if (options.body && !(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const data = await res.json();

  if (!res.ok) {
    const err = new Error(data.message || "Request failed");
    err.response = { data };
    throw err;
  }
  return data;
}

export function getProfile() {
  return request("/users/profile");
}

export function updateProfile(formData) {
  return request("/users/profile", { method: "PUT", body: formData });
}