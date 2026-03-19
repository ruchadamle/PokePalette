const configuredApiBaseUrl = (import.meta.env.VITE_API_BASE_URL ?? "").trim();
const API_BASE_URL = configuredApiBaseUrl ? configuredApiBaseUrl.replace(/\/+$/, "") : "http://localhost:3000";

export async function fetchPokemon() {
  const data = await request("/api/pokemon");
  return data.pokemon ?? [];
}

export async function fetchThemes(userId) {
  const data = await request(`/api/users/${encodeURIComponent(userId)}/themes`);
  return data.themes ?? [];
}

export async function createTheme(userId, pokemonKey) {
  const data = await request(`/api/users/${encodeURIComponent(userId)}/themes`, {
    method: "POST",
    body: { pokemonKey },
  });
  return data.theme;
}

export async function deleteTheme(userId, pokemonKey) {
  await request(`/api/users/${encodeURIComponent(userId)}/themes/${encodeURIComponent(pokemonKey)}`, {
    method: "DELETE",
  });
}

async function request(path, { method = "GET", body } = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
    },
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
