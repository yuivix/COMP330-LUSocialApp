import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:4000";

// Add token to requests
axios.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  if (user.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }
  return config;
});

const bookingService = {
  getBookings: async (role) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/bookings?role=${role}`);
      return response.data;
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.response?.data ||
        error.message ||
        "Failed to fetch bookings";
      throw message;
    }
  },

  createBooking: async (listingId, startTime, endTime, note) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/bookings`, {
        listing_id: listingId,
        start_time: startTime,
        end_time: endTime,
        note,
      });
      return response.data;
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.response?.data ||
        error.message ||
        "Failed to create booking";
      throw message;
    }
  },

  acceptBooking: async (bookingId) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/bookings/${bookingId}/accept`);
      return response.data;
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.response?.data ||
        error.message ||
        "Failed to accept booking";
      throw message;
    }
  },

  cancelBooking: async (bookingId) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/bookings/${bookingId}/cancel`);
      return response.data;
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.response?.data ||
        error.message ||
        "Failed to cancel booking";
      throw message;
    }
  },
};

export default bookingService;