import { getAdminToken, getUserToken } from "./auth";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://venuemanagement.onrender.com";

async function request(path, options = {}) {
  const url = `${API_BASE_URL}${path}`;
  const isFormData = options.body instanceof FormData;

  const res = await fetch(url, {
    ...options,
    headers: isFormData
      ? { ...options.headers }
      : {
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

function authRequest(path, token, options = {}) {
  if (!token) {
    return Promise.reject(new Error("Authentication required"));
  }
  return request(path, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });
}

function userRequest(path, options = {}) {
  return authRequest(path, getUserToken(), options);
}

function adminRequest(path, options = {}) {
  return authRequest(path, getAdminToken(), options);
}

export const publicApi = {
  getVenues: ({ search, page = 1, limit = 9, sort = "name_asc" } = {}) => {
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("limit", String(limit));
    params.set("sort", sort);
    if (search) params.set("search", search);
    return request(`/api/public/venues?${params.toString()}`);
  },
  getVenue: (id) => request(`/api/public/venues/${id}`),
};

export const authApi = {
  signup: (body) =>
    request("/api/auth/signup", { method: "POST", body: JSON.stringify(body) }),
  signin: (body) =>
    request("/api/auth/signin", { method: "POST", body: JSON.stringify(body) }),
  getMe: () => userRequest("/api/auth/me"),
  updateProfile: (body) =>
    userRequest("/api/auth/profile", {
      method: "PUT",
      body: JSON.stringify(body),
    }),
  changePassword: (body) =>
    userRequest("/api/auth/change-password", {
      method: "PUT",
      body: JSON.stringify(body),
    }),
  uploadPhoto: async (file) => {
    const formData = new FormData();
    formData.append("photo", file);
    return userRequest("/api/auth/upload-photo", {
      method: "POST",
      body: formData,
    });
  },
  deleteAccount: (body) =>
    userRequest("/api/auth/account", {
      method: "DELETE",
      body: JSON.stringify(body),
    }),
};

export const adminApi = {
  login: (body) =>
    request("/api/admin/auth/login", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  getMe: () => adminRequest("/api/admin/auth/me"),
  changeCredentials: (body) =>
    adminRequest("/api/admin/auth/credentials", {
      method: "PUT",
      body: JSON.stringify(body),
    }),
  getDashboard: () => adminRequest("/api/admin/dashboard"),
  getAnalytics: () => adminRequest("/api/admin/analytics"),
  getUsers: ({ search, page = 1, limit = 20, status } = {}) => {
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("limit", String(limit));
    if (search) params.set("search", search);
    if (status) params.set("status", status);
    return adminRequest(`/api/admin/users?${params.toString()}`);
  },
  getUserStats: () => adminRequest("/api/admin/users/stats"),
  deactivateUser: (id) =>
    adminRequest(`/api/admin/users/${id}/deactivate`, { method: "PUT" }),
  activateUser: (id) =>
    adminRequest(`/api/admin/users/${id}/activate`, { method: "PUT" }),
  getVenues: ({ search, page = 1, limit = 20 } = {}) => {
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("limit", String(limit));
    if (search) params.set("search", search);
    return adminRequest(`/api/admin/venues?${params.toString()}`);
  },
  getVenue: (id) => adminRequest(`/api/admin/venues/${id}`),
  createVenue: (body) =>
    adminRequest("/api/admin/venues", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  updateVenue: (id, body) =>
    adminRequest(`/api/admin/venues/${id}`, {
      method: "PUT",
      body: JSON.stringify(body),
    }),
  deleteVenue: (id) =>
    adminRequest(`/api/admin/venues/${id}`, { method: "DELETE" }),
  uploadVenuePhoto: async (file, venueId) => {
    const formData = new FormData();
    formData.append("photo", file);
    if (venueId) {
      formData.append("venueId", String(venueId));
    }

    const res = await adminRequest("/api/admin/venues/upload-photo", {
      method: "POST",
      body: formData,
    });

    return res.data.imageUrl;
  },
  getAuditLogs: ({ category, date, page = 1, limit = 20 } = {}) => {
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("limit", String(limit));
    if (category) params.set("category", category);
    if (date) params.set("date", date);
    return adminRequest(`/api/admin/audit-logs?${params.toString()}`);
  },
};
