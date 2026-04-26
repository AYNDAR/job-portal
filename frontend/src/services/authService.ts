import api from "./api";
import {
  LoginCredentials,
  RegisterData,
  AuthResponse,
} from "../features/auth/types";

export const authService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const res = await api.post("/auth/login", credentials);
    return res.data;
  },
  register: async (userData: RegisterData): Promise<AuthResponse> => {
    const res = await api.post("/auth/register", userData);
    return res.data;
  },
  logout: () => {
    localStorage.removeItem("token");
  },
};
