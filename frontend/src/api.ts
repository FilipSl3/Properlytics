import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      const status = error.response.status;

      // Błąd serwera (Internal Server Error) -> Przekieruj na /500
      if (status === 500) {
        window.location.href = '/500';
      }

      // Brak dostępu (Forbidden) -> Przekieruj na /403
      if (status === 403) {
        window.location.href = '/403';
      }

      // Serwer niedostępny (Service Unavailable) -> Przekieruj na /503
      if (status === 503) {
        window.location.href = '/503';
      }
    }
    return Promise.reject(error);
  }
);

export default api;