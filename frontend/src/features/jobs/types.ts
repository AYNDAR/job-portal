export interface Job {
  id: string;
  title: string;
  description: string;
  salary_range: string;
  created_at: string;
  employer: {
    company_name: string;
    logo_url: string | null;
    location: string;
    website: string | null;
  };
  industry: {
    industry_name: string;
  };
  employment_type: {
    type_name: string;
  };
}

export interface JobFilters {
  title: string;
  location: string;
  industry: string;
  type: string;
  salary: string;
}
