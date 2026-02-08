import axios from "axios";

const api = axios.create({
  baseURL: "/",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const status = error.response.status;

      if (status === 500) window.location.href = "/500";
      if (status === 403) window.location.href = "/403";
      if (status === 503) window.location.href = "/503";
    }

    return Promise.reject(error);
  }
);

export default api;
