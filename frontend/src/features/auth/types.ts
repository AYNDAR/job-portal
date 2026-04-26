export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  userType: "Job Seeker" | "Employer";
  fullName?: string;
  companyName?: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    userType: string;
  };
}
