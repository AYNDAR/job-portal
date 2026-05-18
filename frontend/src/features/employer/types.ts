export interface Job {
  id: string;
  title: string;
  description: string;
  salary_range: string | null;
  created_at: string;
  status: { status_name: string };
  industry?: { industry_name: string };
  employment_type?: { type_name: string };
  jobSite?: string;
  experienceLevel?: string;
  educationLevel?: string;
  genderPreference?: string;
}

export interface Application {
  id: string;
  cover_letter: string | null;
  applied_at: string;
  resume_url: string | null;
  seeker: {
    full_name: string;
    email: string;
    resume_url: string | null;
  };
  status: { status_name: string };
  notes: {
    id: number;
    note_text: string;
    created_at: string;
    employer: { company_name: string };
  }[];
}
