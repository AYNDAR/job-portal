import api from "./api";

export const adminService = {
  getAllUsers: () => api.get("/admin/users"),
  getAllJobs: () => api.get("/admin/jobs"),
  getStats: () => api.get("/admin/stats"),
  suspendUser: (userId: string) => api.patch(`/admin/users/${userId}/suspend`),
  closeJob: (jobId: string) => api.patch(`/admin/jobs/${jobId}/close`),
};
