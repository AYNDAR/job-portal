// features/jobSeeker/pages/Dashboard.tsx
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Sparkles } from "lucide-react";
import { Button } from "../../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../../components/ui/tabs";
import { Badge } from "../../../components/ui/badge";
import { Input } from "../../../components/ui/input";
import ResumeUpload from "../../../components/jobSeeker/ResumeUploads"; // adjust name if needed
import { RootState, AppDispatch } from "../../../store";
import {
  fetchJobs,
  applyToJob,
  bookmarkJob,
  fetchBookmarks,
  fetchApplications,
} from "../jobSeekerslice";
import { JobFilters } from "../types";
// Notifications temporarily disabled if slice missing
// import { fetchNotifications, markNotificationRead } from '../../notifications/notificationsSlice';

export default function JobSeekerDashboard() {
  const dispatch = useDispatch<AppDispatch>();
  const { jobs, loading, bookmarks, applications } = useSelector(
    (state: RootState) => state.jobSeeker,
  );
  // const { notifications } = useSelector((state: RootState) => state.notifications); // comment out
  const [filters, setFilters] = useState<JobFilters>({
    keyword: "",
    industry: "",
    location: "",
    type: "",
  });
  const [selectedJob, setSelectedJob] = useState<(typeof jobs)[number] | null>(
    null,
  );

  useEffect(() => {
    dispatch(fetchJobs(filters));
    dispatch(fetchBookmarks());
    dispatch(fetchApplications());
    // dispatch(fetchNotifications());
  }, [dispatch, filters]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(fetchJobs(filters));
  };

  const handleApply = async (
    jobId: string,
    coverLetter: string,
    resumeUrl: string,
  ) => {
    await dispatch(applyToJob({ jobId, coverLetter, resumeUrl }));
    dispatch(fetchApplications());
  };

  const handleBookmark = (jobId: string) => {
    dispatch(bookmarkJob(jobId));
  };

  const isBookmarked = (jobId: string) =>
    bookmarks.some((b) => b.jobId === jobId);
  const getApplicationStatus = (jobId: string) =>
    applications.find((a) => a.jobId === jobId)?.status;

  const getBadgeVariant = (
    status: string,
  ): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case "Accepted":
        return "default";
      case "Interview":
        return "secondary";
      case "Rejected":
        return "destructive";
      default:
        return "outline";
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Hero */}
      <div className="rounded-3xl border border-purple-500/20 bg-linear-to-br from-indigo-500/20 to-purple-500/20 p-6">
        <div className="flex items-center gap-3">
          <Sparkles className="text-purple-400" size={28} />
          <h1 className="text-3xl font-bold bg-linear-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            Find Your Dream Job
          </h1>
        </div>
        <p className="text-gray-300 mt-2">Search thousands of jobs</p>
      </div>

      <Tabs defaultValue="jobs" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="jobs">Jobs</TabsTrigger>
          <TabsTrigger value="applications">Applications</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
        </TabsList>

        {/* JOBS TAB */}
        <TabsContent value="jobs" className="space-y-6">
          <form onSubmit={handleSearch} className="flex gap-2">
            <Input
              placeholder="Job title, keyword"
              value={filters.keyword}
              onChange={(e) =>
                setFilters({ ...filters, keyword: e.target.value })
              }
              className="flex-1"
            />
            <Input
              placeholder="Location"
              value={filters.location}
              onChange={(e) =>
                setFilters({ ...filters, location: e.target.value })
              }
              className="w-48"
            />
            <Button type="submit">Search</Button>
          </form>
          <div className="space-y-4">
            {loading && <p>Loading jobs...</p>}
            {!loading && jobs.length === 0 && <p>No jobs found.</p>}
            {jobs.map((job) => (
              <Card key={job.id}>
                <CardHeader>
                  <CardTitle>{job.title}</CardTitle>
                  <p className="text-sm text-gray-500">
                    {job.company} • {job.location}
                  </p>
                </CardHeader>
                <CardContent>
                  <p className="mb-2">{job.description?.slice(0, 150)}...</p>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => setSelectedJob(job)}>
                      View Details
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleBookmark(job.id)}
                    >
                      {isBookmarked(job.id) ? "Unbookmark" : "Bookmark"}
                    </Button>
                    {getApplicationStatus(job.id) && (
                      <Badge
                        variant={getBadgeVariant(getApplicationStatus(job.id)!)}
                      >
                        {getApplicationStatus(job.id)}
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* APPLICATIONS TAB */}
        <TabsContent value="applications" className="space-y-4">
          <h2 className="text-2xl font-semibold">My Applications</h2>
          {applications.length === 0 && <p>No applications yet.</p>}
          {applications.map((app) => (
            <Card key={app.id}>
              <CardHeader>
                <CardTitle>{app.jobTitle}</CardTitle>
                <Badge variant={getBadgeVariant(app.status)}>
                  {app.status}
                </Badge>
              </CardHeader>
              <CardContent>
                <p>
                  Applied on: {new Date(app.appliedAt).toLocaleDateString()}
                </p>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* PROFILE TAB */}
        <TabsContent value="profile" className="space-y-6">
          <ResumeUpload />
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <Button variant="outline">Edit Profile</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Simple job details modal (replace with JobDetails later) */}
      {selectedJob && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h2 className="text-xl font-bold">{selectedJob.title}</h2>
            <p>{selectedJob.description}</p>
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setSelectedJob(null)}>
                Close
              </Button>
              <Button
                onClick={() =>
                  handleApply(selectedJob.id, "Cover letter here", "resume-url")
                }
              >
                Apply
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
