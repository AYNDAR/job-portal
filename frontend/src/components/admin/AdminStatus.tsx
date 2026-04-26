import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { fetchAdminStats } from "../../features/admin/adminSlice";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Users, Briefcase, FileText, UserPlus } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

export default function AdminStats() {
  const dispatch = useAppDispatch();
  const { stats, isLoading } = useAppSelector((state) => state.admin);

  useEffect(() => {
    dispatch(fetchAdminStats());
  }, [dispatch]);

  if (isLoading)
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-4">
        Loading stats...
      </div>
    );
  if (!stats) return null;

  const cards = [
    {
      title: "Total Users",
      value: stats.totalUsers,
      icon: <Users className="h-6 w-6 text-blue-500" />,
      color: "bg-blue-50",
    },
    {
      title: "Total Jobs",
      value: stats.totalJobs,
      icon: <Briefcase className="h-6 w-6 text-green-500" />,
      color: "bg-green-50",
    },
    {
      title: "Total Applications",
      value: stats.totalApplications,
      icon: <FileText className="h-6 w-6 text-purple-500" />,
      color: "bg-purple-50",
    },
  ];

  // Sample chart data (you can extend backend to return daily stats)
  const chartData = [
    { name: "Users", count: stats.totalUsers },
    { name: "Jobs", count: stats.totalJobs },
    { name: "Applications", count: stats.totalApplications },
  ];

  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold mb-4">Dashboard Statistics</h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {cards.map((card) => (
          <div
            key={card.title}
            className={`${card.color} p-4 rounded-lg shadow`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{card.title}</p>
                <p className="text-2xl font-bold">{card.value}</p>
              </div>
              {card.icon}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Overview</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="count" fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
