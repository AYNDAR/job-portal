export interface Application {
  id: string;
  jobId: string;
  seekerId: string;
  resumeUrl?: string;
  coverLetter?: string;
  statusId: number;
  appliedAt: string;
  job?: {
    id: string;
    title: string;
    employer: { companyName: string };
    employmentType: { typeName: string };
    salaryRange: string;
  };
  status?: {
    statusName: string;
  };
}

export interface ApplicationNote {
  id: number;
  applicationId: string;
  employerId: string;
  noteText: string;
  createdAt: string;
  employer?: {
    companyName: string;
  };
}
