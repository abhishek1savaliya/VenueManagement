const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://venuemanagement.onrender.com";

async function request(path, options = {}) {
  const url = `${API_BASE_URL}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const message =
      data.message ||
      data.errors?.map((e) => e.message).join(", ") ||
      "Something went wrong";
    throw new Error(message);
  }

  return data;
}

export const publicApi = {
  getVenues: (search) => {
    const params = search ? `?search=${encodeURIComponent(search)}` : "";
    return request(`/api/public/venues${params}`);
  },
  getVenue: (id) => request(`/api/public/venues/${id}`),
};

export const adminApi = {
  getDashboard: () => request("/api/admin/dashboard"),
  getVenues: (search) => {
    const params = search ? `?search=${encodeURIComponent(search)}` : "";
    return request(`/api/admin/venues${params}`);
  },
  getVenue: (id) => request(`/api/admin/venues/${id}`),
  createVenue: (body) =>
    request("/api/admin/venues", { method: "POST", body: JSON.stringify(body) }),
  updateVenue: (id, body) =>
    request(`/api/admin/venues/${id}`, {
      method: "PUT",
      body: JSON.stringify(body),
    }),
  deleteVenue: (id) =>
    request(`/api/admin/venues/${id}`, { method: "DELETE" }),
  getAuditLogs: () => request("/api/admin/audit-logs"),
};
