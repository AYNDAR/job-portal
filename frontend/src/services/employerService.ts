import api from "./api";

export const employerService = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  postJob: (jobData: any) => api.post("/employer/jobs", jobData),
  publishJob: (jobId: string) => api.patch(`/employer/jobs/${jobId}/publish`),
  getEmployerJobs: () => api.get("/employer/jobs"),
  getApplicantsForJob: (jobId: string) =>
    api.get(`/employer/jobs/${jobId}/applicants`),
  updateApplicationStatus: (applicationId: string, statusName: string) =>
    api.patch(`/employer/applications/${applicationId}/status`, { statusName }),
  addNote: (applicationId: string, noteText: string) =>
    api.post(`/employer/applications/${applicationId}/notes`, { noteText }),
  exportApplicantsCSV: (jobId: string) =>
    api.get(`/employer/jobs/${jobId}/export`, { responseType: "blob" }),
};
