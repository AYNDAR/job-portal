import { useState } from "react";
import { useAppSelector } from "../../store/hooks";
import { Link } from "react-router-dom";
import { Briefcase, Calendar, CheckCircle, Bookmark, Bell } from "lucide-react";
import ResumeUpload from "../../components/jobSeeker/ResumeUpload";
// Mock data – replace with real API calls later
const mockStats = {
  totalApplications: 12,
  upcomingInterviews: 5,
  offersReceived: 2,
  savedJobs: 8,
};

const mockRecommendedJobs = [
  {
    id: "1",
    title: "Frontend Developer",
    company: "Tech Solutions Inc.",
    location: "Remote",
    salary: "$80K - $110K",
  },
  {
    id: "2",
    title: "UI/UX Designer",
    company: "Creative Agency",
    location: "New York, USA",
    salary: "$70K - $95K",
  },
  {
    id: "3",
    title: "Full Stack Developer",
    company: "Digital Wave",
    location: "Bangalore, India",
    salary: "$90K - $120K",
  },
];

const mockApplications = [
  {
    id: "app1",
    jobTitle: "Frontend Developer",
    status: "Applied",
    date: "2 days ago",
  },
  {
    id: "app2",
    jobTitle: "UI/UX Designer",
    status: "Interview Scheduled",
    date: "5 days ago",
  },
];

const mockNotifications = [
  {
    id: "n1",
    message: "Your application for UI/UX Designer has been submitted.",
    time: "2h ago",
  },
  { id: "n2", message: "New job match: Frontend Developer", time: "1 day ago" },
];

export default function JobSeekerDashboard() {
  const { user } = useAppSelector((state) => state.auth);
  const [stats] = useState(mockStats);
  const [recommendedJobs] = useState(mockRecommendedJobs);
  const [applications] = useState(mockApplications);
  const [notifications] = useState(mockNotifications);

  // Get user's display name from email or fallback
  const displayName = user?.email?.split("@")[0] || "User";

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {displayName}! 🎉
        </h1>
        <p className="text-gray-600 mt-1">
          Find the perfect job and build your career
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-l-blue-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500">Applications Applied</p>
              <p className="text-2xl font-bold">{stats.totalApplications}</p>
            </div>
            <Briefcase className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-l-green-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500">Upcoming Interviews</p>
              <p className="text-2xl font-bold">{stats.upcomingInterviews}</p>
            </div>
            <Calendar className="h-8 w-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-l-yellow-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500">Offers Received</p>
              <p className="text-2xl font-bold">{stats.offersReceived}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-yellow-500" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-l-purple-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500">Saved Jobs</p>
              <p className="text-2xl font-bold">{stats.savedJobs}</p>
            </div>
            <Bookmark className="h-8 w-8 text-purple-500" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {/* existing recommended jobs, application status, etc. */}
        </div>
        <div className="space-y-6">
          <ResumeUpload />
          {/* other right column content like notifications */}
        </div>
      </div>

      {/* Main content: 2 columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column: Recommended Jobs & Application Status */}
        <div className="lg:col-span-2 space-y-8">
          {/* Recommended Jobs */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Recommended Jobs</h2>
              <Link
                to="/jobs"
                className="text-blue-600 hover:underline text-sm"
              >
                View all →
              </Link>
            </div>
            <div className="space-y-4">
              {recommendedJobs.map((job) => (
                <div key={job.id} className="border-b pb-3 last:border-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {job.title}
                      </h3>
                      <p className="text-sm text-gray-600">{job.company}</p>
                      <div className="flex gap-3 mt-1 text-xs text-gray-500">
                        <span>{job.location}</span>
                        <span>{job.salary}</span>
                      </div>
                    </div>
                    <Link
                      to={`/jobs/${job.id}`}
                      className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                    >
                      Apply
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Application Status */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Application Status</h2>
              <div className="flex gap-2">
                <button className="text-blue-600 text-sm border-b border-blue-600">
                  New
                </button>
                <button className="text-gray-500 text-sm">All</button>
              </div>
            </div>
            <div className="space-y-3">
              {applications.map((app) => (
                <div
                  key={app.id}
                  className="flex justify-between items-center py-2 border-b"
                >
                  <div>
                    <p className="font-medium">{app.jobTitle}</p>
                    <p className="text-xs text-gray-500">{app.date}</p>
                  </div>
                  <span className="text-sm text-green-600">{app.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right column: Notifications */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Recent Notifications</h2>
            <Bell className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            {notifications.map((notif) => (
              <div key={notif.id} className="border-b pb-3 last:border-0">
                <p className="text-sm text-gray-700">{notif.message}</p>
                <p className="text-xs text-gray-400 mt-1">{notif.time}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
