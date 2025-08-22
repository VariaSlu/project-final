const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

export async function api(path, options = {}) {
  const token = localStorage.getItem("token");
  const headers = new Headers(options.headers || {});
  headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
