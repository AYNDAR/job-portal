import api from "./api";

export const jobService = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  searchJobs: (params: any) => api.get("/jobs/search", { params }),
  getJobById: (id: string) => api.get(`/jobs/${id}`),
};
