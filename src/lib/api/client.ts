import axios, { AxiosError } from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000/api";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor para agregar el token
apiClient.interceptors.request.use(
  (config) => {
    const authData = localStorage.getItem("formatosoft-auth");
    if (authData) {
      const { state } = JSON.parse(authData);
      if (state?.token) {
        config.headers.Authorization = `Bearer ${state.token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para manejar errores
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("formatosoft-auth");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
}
