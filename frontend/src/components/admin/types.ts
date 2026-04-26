export interface AdminUser {
  id: string;
  email: string;
  user_type: {
    type_name: string;
  };
  created_at: string;
  suspended?: boolean;
}

export interface AdminJob {
  id: string;
  title: string;
  employer: {
    company_name: string;
  };
  status: {
    status_name: string;
  };
  created_at: string;
}
