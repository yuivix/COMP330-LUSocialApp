import axios from "axios";

// Allow env override but default to local dev
const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:4000";

const authService = {
  register: async (email, password, role) => {
    try {
      const normalizedRole = (role ?? "student")
        .toString()
        .trim()
        .toLowerCase(); // 👈 normalize casing

      const response = await axios.post(`${API_BASE_URL}/auth/register`, {
        email,
        password,
        role: normalizedRole,
      });
      return response.data;
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.response?.data ||
        error.message ||
        "Registration failed";
      throw message;
    }
  },

  login: async (email, password) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        email,
        password,
      });
      if (response.data.token) {
        localStorage.setItem("user", JSON.stringify(response.data));
      }
      return response.data;
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.response?.data ||
        error.message ||
        "Login failed";
      throw message;
    }
  },

  verify: async (token) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/verify`, {
        token,
      });
      return response.data;
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.response?.data ||
        error.message ||
        "Verification failed";
      throw message;
    }
  },

  logout: () => {
    localStorage.removeItem("user");
  },

  getCurrentUser: () => {
    const userStr = localStorage.getItem("user");
    return userStr ? JSON.parse(userStr) : null;
  },
};

export default authService;
