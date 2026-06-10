import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import {
  Briefcase,
  Users,
  Clock,
  Calendar,
  CheckCircle,
  Activity,
  FileText,
  MessageSquare,
} from "lucide-react";

interface Stats {
  activeJobs: number;
  totalApplications: number;
  pendingReviews: number;
  interviewsScheduled: number;
  acceptedCandidates: number;
}

interface ActivityItem {
  id: string;
  type: "application" | "job" | "interview";
  title: string;
  timestamp: string;
}

export default function EmployerOverview() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats>({
    activeJobs: 0,
    totalApplications: 0,
    pendingReviews: 0,
    interviewsScheduled: 0,
    acceptedCandidates: 0,
  });
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Replace with your actual API endpoints
        const [statsRes, activitiesRes] = await Promise.all([
          api.get("/employer/dashboard/stats"),
          api.get("/employer/dashboard/activities"),
        ]);
        setStats(statsRes.data);
        setActivities(activitiesRes.data);
      } catch (error) {
        console.error("Failed to load dashboard data", error);
        // Mock data for demonstration
        setStats({
          activeJobs: 12,
          totalApplications: 245,
          pendingReviews: 35,
          interviewsScheduled: 18,
          acceptedCandidates: 9,
        });
        setActivities([
          {
            id: "1",
            type: "application",
            title: "New application received for Senior Frontend Developer",
            timestamp: new Date().toISOString(),
          },
          {
            id: "2",
            type: "job",
            title: "Job posted: Backend Engineer (Node.js)",
            timestamp: new Date(Date.now() - 86400000).toISOString(),
          },
          {
            id: "3",
            type: "interview",
            title: "Interview scheduled with John Doe for UI/UX Designer",
            timestamp: new Date(Date.now() - 172800000).toISOString(),
          },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const statCards = [
    {
      title: "Active Jobs",
      value: stats.activeJobs,
      icon: <Briefcase size={20} className="text-blue-500" />,
      bg: "bg-blue-50",
      color: "blue",
    },
    {
      title: "Total Applications",
      value: stats.totalApplications,
      icon: <Users size={20} className="text-green-500" />,
      bg: "bg-green-50",
      color: "green",
    },
    {
      title: "Pending Reviews",
      value: stats.pendingReviews,
      icon: <Clock size={20} className="text-yellow-500" />,
      bg: "bg-yellow-50",
      color: "yellow",
    },
    {
      title: "Interviews Scheduled",
      value: stats.interviewsScheduled,
      icon: <Calendar size={20} className="text-purple-500" />,
      bg: "bg-purple-50",
      color: "purple",
    },
    {
      title: "Accepted Candidates",
      value: stats.acceptedCandidates,
      icon: <CheckCircle size={20} className="text-green-600" />,
      bg: "bg-green-100",
      color: "green",
    },
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "application":
        return <FileText size={16} className="text-blue-500" />;
      case "job":
        return <Briefcase size={16} className="text-green-500" />;
      case "interview":
        return <Calendar size={16} className="text-purple-500" />;
      default:
        return <Activity size={16} className="text-gray-500" />;
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-64">
        Loading dashboard...
      </div>
    );

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Dashboard</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Overview of your hiring activity
          </p>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {statCards.map((card) => (
          <div
            key={card.title}
            className={`${card.bg} rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className={`p-2 rounded-xl bg-white/80`}>{card.icon}</div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{card.value}</p>
            <p className="text-xs text-gray-500 mt-1">{card.title}</p>
          </div>
        ))}
      </div>

      {/* Recent Activities */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
            <Activity size={16} /> Recent Activities
          </h3>
        </div>
        <div className="divide-y divide-gray-50">
          {activities.length === 0 ? (
            <div className="px-5 py-8 text-center text-gray-400 text-sm">
              No recent activities
            </div>
          ) : (
            activities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition"
              >
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-800">{activity.title}</p>
                  <p className="text-xs text-gray-400">
                    {new Date(activity.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
