export interface BookmarkedJob {
  id: number;
  job: {
    id: string;
    title: string;
    employer: {
      company_name: string;
      location: string;
    };
    employment_type: {
      type_name: string;
    };
    salary_range: string;
    created_at: string;
  };
  created_at: string;
}
