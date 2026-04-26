export interface Application {
  id: string;
  job: {
    id: string;
    title: string;
    employer: {
      company_name: string;
    };
    employment_type: {
      type_name: string;
    };
    salary_range: string;
  };
  status: {
    status_name: string;
  };
  cover_letter: string | null;
  applied_at: string;
}
