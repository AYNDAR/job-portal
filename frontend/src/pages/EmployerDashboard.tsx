import { useState, useEffect } from "react";
import { useAppSelector } from "../store/hooks";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import PostJobForm from "../components/employer/PostJobForm";
import EmployerJobs from "../components/employer/EmployerJobs";
import ApplicantsList from "../components/employer/ApplicantsList";
import api from "../services/api";
import { Briefcase, Users, CheckCircle, Clock } from "lucide-react";

export default function EmployerDashboard() {
  const { user } = useAppSelector((state) => state.auth);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [refreshJobs, setRefreshJobs] = useState(false);
  const [stats, setStats] = useState({
    activeJobs: 0,
    totalApplications: 0,
    shortlisted: 0,
    interviewsScheduled: 0,
  });
  const [loadingStats, setLoadingStats] = useState(true);

  const fetchStats = async () => {
    try {
      const res = await api.get("/employer/stats");
      setStats(res.data);
    } catch (err) {
      console.error("Failed to fetch stats", err);
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleJobPosted = () => {
    setRefreshJobs((prev) => !prev);
    fetchStats();
  };

  const handleJobPublished = () => {
    fetchStats();
  };

  const statsCards = [
    {
      title: "Active Jobs",
      value: stats.activeJobs,
      icon: <Briefcase className="h-8 w-8 text-blue-500" />,
      bg: "bg-blue-50",
    },
    {
      title: "Total Applications",
      value: stats.totalApplications,
      icon: <Users className="h-8 w-8 text-green-500" />,
      bg: "bg-green-50",
    },
    {
      title: "Shortlisted",
      value: stats.shortlisted,
      icon: <CheckCircle className="h-8 w-8 text-yellow-500" />,
      bg: "bg-yellow-50",
    },
    {
      title: "Interviews Scheduled",
      value: stats.interviewsScheduled,
      icon: <Clock className="h-8 w-8 text-purple-500" />,
      bg: "bg-purple-50",
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">Employer Dashboard</h1>
      <p className="text-gray-600 mb-6">
        Welcome back, {user?.email?.split("@")[0]}!
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statsCards.map((card) => (
          <div key={card.title} className={`${card.bg} p-4 rounded-lg shadow`}>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-600">{card.title}</p>
                {loadingStats ? (
                  <div className="h-8 w-12 bg-gray-200 animate-pulse rounded mt-1"></div>
                ) : (
                  <p className="text-2xl font-bold">{card.value}</p>
                )}
              </div>
              {card.icon}
            </div>
          </div>
        ))}
      </div>

      <Tabs defaultValue="jobs" className="space-y-4">
        <TabsList>
          <TabsTrigger value="jobs">My Jobs</TabsTrigger>
          <TabsTrigger value="post">Post a New Job</TabsTrigger>
          <TabsTrigger value="applicants" disabled={!selectedJobId}>
            Applicants {selectedJobId && "(selected job)"}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="jobs">
          <EmployerJobs
            onSelectJob={setSelectedJobId}
            refreshTrigger={refreshJobs}
            onPublish={handleJobPublished}
          />
        </TabsContent>

        <TabsContent value="post">
          <PostJobForm onSuccess={handleJobPosted} />
        </TabsContent>

        <TabsContent value="applicants">
          {selectedJobId ? (
            <ApplicantsList jobId={selectedJobId} />
          ) : (
            <div className="bg-white p-8 rounded-lg text-center text-gray-500">
              Select a job from "My Jobs" tab to view applicants.
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
