import axios from "axios";
import { auth } from "../utils/auth";

const api = axios.create({
  baseURL: "http://localhost:5000", // change if needed
});

// Attach token for every request
api.interceptors.request.use((config) => {
  const token = auth.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
