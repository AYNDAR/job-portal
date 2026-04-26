export interface User {
  id: string;
  email: string;
  userType: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface JobSeekerProfile {
  id: string;
  userId: string;
  fullName: string;
  phone?: string;
  resumeUrl?: string;
  skills: string[];
  location?: string;
}

export interface EmployerProfile {
  id: string;
  userId: string;
  companyName: string;
  website?: string;
  logoUrl?: string;
  industryId: number;
  location?: string;
}
