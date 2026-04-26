export interface Bookmark {
  id: number;
  seekerId: string;
  jobId: string;
  createdAt: string;
  job?: {
    id: string;
    title: string;
    employer: { companyName: string; location: string };
    employmentType: { typeName: string };
    salaryRange: string;
  };
}
