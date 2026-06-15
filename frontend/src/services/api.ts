/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 10000,
});

// Helper: get stored profile from localStorage
const getStoredProfile = () => {
  const stored = localStorage.getItem("jobseeker_profile");
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      return null;
    }
  }
  return null;
};

const saveStoredProfile = (data: any) => {
  localStorage.setItem("jobseeker_profile", JSON.stringify(data));
};

// Default profile (used only if nothing in localStorage)
const defaultProfile = {
  fullName: "Cherinet Ayne",
  bio: "",
  email: "cherinet@example.com",
  phone: "0901504102",
  location: "Hawassa",
  linkedin: "",
  github: "",
  avatarUrl: "",
};

// Initialize localStorage with default if empty
if (!getStoredProfile()) {
  saveStoredProfile(defaultProfile);
}

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const { config, response } = error;
    if (response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
      return Promise.reject(error);
    }

    // Mock interceptor for failed requests
    if (config && !config.__isMock) {
      const url = config.url || "";
      const method = config.method?.toLowerCase() || "get";
      config.__isMock = true;

      // ---- Job Seeker Profile ----
      if (url.includes("/jobseeker/profile") && method === "get") {
        const profile = getStoredProfile();
        return Promise.resolve({ data: profile });
      }
      if (url.includes("/jobseeker/profile") && method === "put") {
        const newData = JSON.parse(config.data || "{}");
        const current = getStoredProfile() || defaultProfile;
        const updated = { ...current, ...newData };
        saveStoredProfile(updated);
        return Promise.resolve({ data: updated });
      }

      // ---- Avatar upload (not used anymore, but keep for compatibility) ----
      if (url.includes("/user/upload/avatar") && method === "post") {
        // This should not be called now because Profile.tsx uses FileReader
        return Promise.resolve({
          data: { url: "https://randomuser.me/api/portraits/women/68.jpg" },
        });
      }

      // ---- Other endpoints (jobs, etc.) ----
      if (url.includes("/jobs") && method === "get") {
        return Promise.resolve({
          data: [
            {
              id: "1",
              title: "Senior Frontend Developer",
              company: "TechCorp",
              location: "New York, NY",
              salaryRange: "$120k - $150k",
              employmentType: "Full-time",
              industry: "Technology",
              description: "We need a React expert.",
            },
          ],
        });
      }

      // Default fallback
      return Promise.resolve({ data: [] });
    }
    return Promise.reject(error);
  },
);

export default api;
