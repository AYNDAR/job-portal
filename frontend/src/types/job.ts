export interface Job {
  id: string;
  title: string;
  description: string;
  salaryRange: string;
  createdAt: string;
  employer: {
    companyName: string;
    logoUrl: string | null;
    location: string;
    website: string | null;
  };
  industry: {
    industryName: string;
  };
  employmentType: {
    typeName: string;
  };
}

export interface JobFilters {
  title?: string;
  location?: string;
  industry?: string;
  type?: string;
  salary?: string;
  page: number;
}

export interface JobPostStatus {
  id: number;
  statusName: string;
}

export interface EmploymentType {
  id: number;
  typeName: string;
}

export interface JobIndustry {
  id: number;
  industryName: string;
}
