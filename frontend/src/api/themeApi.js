const configuredApiBaseUrl = (import.meta.env.VITE_API_BASE_URL ?? "").trim();
const API_BASE_URL = configuredApiBaseUrl ? configuredApiBaseUrl.replace(/\/+$/, "") : "http://localhost:3000";

export async function fetchPokemon() {
  const data = await request("/api/pokemon");
  return data.pokemon ?? [];
}

export async function fetchThemes(userId, token) {
  const data = await request(`/api/users/${encodeURIComponent(userId)}/themes`, {
    token,
  });
  return data.themes ?? [];
}

export async function createTheme(userId, pokemonKey, token) {
  const data = await request(`/api/users/${encodeURIComponent(userId)}/themes`, {
    method: "POST",
    body: { pokemonKey },
    token,
  });
  return data.theme;
}

export async function deleteTheme(userId, pokemonKey, token) {
  await request(`/api/users/${encodeURIComponent(userId)}/themes/${encodeURIComponent(pokemonKey)}`, {
    method: "DELETE",
    token,
  });
}

async function request(path, { method = "GET", body, token } = {}) {
  const headers = {};
  if (body) {
    headers["Content-Type"] = "application/json";
  }
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const payload = await readJsonSafe(response);

  if (!response.ok) {
    const message = payload?.error || `Request failed (${response.status})`;
    const error = new Error(message);
    error.status = response.status;
    error.payload = payload;
    throw error;
  }

  return payload;
}

async function readJsonSafe(response) {
  if (response.status === 204) {
    return null;
  }

  try {
    return await response.json();
  } catch {
    return null;
  }
}
