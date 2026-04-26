import api from "./api";

export const applicationService = {
  applyToJob: (jobId: string, coverLetter: string) =>
    api.post("/applications", { jobId, coverLetter }),
  getMyApplications: () => api.get("/applications/my-applications"),
  updateApplicationStatus: (applicationId: string, statusName: string) =>
    api.patch(`/employer/applications/${applicationId}/status`, { statusName }),
  addNoteToApplication: (applicationId: string, noteText: string) =>
    api.post(`/employer/applications/${applicationId}/notes`, { noteText }),
};
