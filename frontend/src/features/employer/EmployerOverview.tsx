/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import api from "../../services/api";
import { Briefcase, Users, Calendar, UserCheck, Clock } from "lucide-react";

export default function EmployerOverview() {
  const [stats, setStats] = useState({
    activeJobs: 0,
    totalApplications: 0,
    shortlisted: 0,
    interviewsScheduled: 0,
  });
  const [recentJobs, setRecentJobs] = useState([]);
  const [recentApplicants, setRecentApplicants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, jobsRes, applicantsRes] = await Promise.all([
          api.get("/employer/stats"),
          api.get("/employer/jobs"),
          api.get("/employer/recent-applicants"),
        ]);
        setStats(statsRes.data);
        setRecentJobs(jobsRes.data.slice(0, 5)); // latest 5 jobs
        setRecentApplicants(applicantsRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div>Loading dashboard...</div>;

  const statsCards = [
    {
      title: "Active Jobs",
      value: stats.activeJobs,
      icon: <Briefcase className="h-6 w-6 text-blue-500" />,
      change: "+2 this month",
    },
    {
      title: "Total Applicants",
      value: stats.totalApplications,
      icon: <Users className="h-6 w-6 text-green-500" />,
      change: "+18 this week",
    },
    {
      title: "Total Interviews",
      value: stats.shortlisted,
      icon: <Calendar className="h-6 w-6 text-yellow-500" />,
      change: "scheduled",
    },
    {
      title: "Hired",
      value: 3,
      icon: <UserCheck className="h-6 w-6 text-purple-500" />,
      change: "this quarter",
    }, // placeholder
  ];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((card) => (
          <div key={card.title} className="bg-white p-4 rounded-lg shadow">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500">{card.title}</p>
                <p className="text-2xl font-bold">{card.value}</p>
                <p className="text-xs text-green-600 mt-1">{card.change}</p>
              </div>
              {card.icon}
            </div>
          </div>
        ))}
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Job Posts */}
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-bold mb-3">Recent Job Posts</h2>
          <div className="space-y-3">
            {recentJobs.map((job: any) => (
              <div key={job.id} className="border-b pb-2 last:border-0">
                <p className="font-medium">{job.title}</p>
                <div className="flex justify-between text-sm text-gray-500">
                  <span>{job.applicationsCount || 0} applicants</span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />{" "}
                    {job.employment_type?.type_name || "-"}
                  </span>
                </div>
              </div>
            ))}
            {recentJobs.length === 0 && (
              <p className="text-gray-500">No jobs posted yet.</p>
            )}
          </div>
        </div>

        {/* Recent Applicants */}
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-bold mb-3">Recent Applicants</h2>
          <div className="space-y-3">
            {recentApplicants.map((app: any) => (
              <div key={app.id} className="border-b pb-2 last:border-0">
                <p className="font-medium">{app.seeker.full_name}</p>
                <div className="flex justify-between text-sm text-gray-500">
                  <span>{app.job.title}</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs ${
                      app.status.status_name === "Accepted"
                        ? "bg-green-100 text-green-800"
                        : app.status.status_name === "Rejected"
                          ? "bg-red-100 text-red-800"
                          : app.status.status_name === "Interview"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {app.status.status_name}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Applied {new Date(app.applied_at).toLocaleDateString()}
                </p>
              </div>
            ))}
            {recentApplicants.length === 0 && (
              <p className="text-gray-500">No applicants yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
