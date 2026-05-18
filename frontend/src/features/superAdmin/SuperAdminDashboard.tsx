import { useAppSelector } from "../../store/hooks";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import ManageUsers from "../admin/ManageUsers";
import ManageJobs from "../admin/ManageJobs";
import AdminUsersManager from "../../components/admin/AdminUsersManager";
import {
  Users,
  Briefcase,
  FileText,
  Shield,
  Server,
  Activity,
  UserPlus,
  Download,
  Trash2,
  BarChart,
} from "lucide-react";

// Mock data – replace with API later
const mockStats = {
  totalUsers: 1542,
  activeJobs: 423,
  totalApplications: 3248,
  administrators: 56,
};

const mockSystemStatus = {
  serverStatus: "Operational",
  database: "Connected",
  storageUsed: "73%",
  activeSessions: 342,
};

const mockRecentAdminActivities = [
  {
    id: 1,
    action: "Admin John updated system settings",
    time: "2h ago",
    admin: "John",
  },
  {
    id: 2,
    action: "Admin Sarah created new admin account",
    time: "5h ago",
    admin: "Sarah",
  },
  {
    id: 3,
    action: "Admin Mike deleted job post #1234",
    time: "1d ago",
    admin: "Mike",
  },
];

const quickActions = [
  {
    label: "Add New Admin",
    icon: <UserPlus className="h-5 w-5" />,
    link: "#",
    onClick: () =>
      document
        .querySelector('[value="admins"]')
        ?.dispatchEvent(new Event("click")),
  },
  {
    label: "System Backup",
    icon: <Download className="h-5 w-5" />,
    link: "#",
    onClick: () => alert("Backup started (demo)"),
  },
  {
    label: "Clear Cache",
    icon: <Trash2 className="h-5 w-5" />,
    link: "#",
    onClick: () => alert("Cache cleared (demo)"),
  },
  {
    label: "View Reports",
    icon: <BarChart className="h-5 w-5" />,
    link: "#",
    onClick: () => alert("Reports (demo)"),
  },
];

export default function SuperAdminDashboard() {
  const { user } = useAppSelector((state) => state.auth);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const displayName = user?.email?.split("@")[0] || "Super Admin";

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Super Admin Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-l-blue-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500">Total Users</p>
              <p className="text-2xl font-bold">{mockStats.totalUsers}</p>
            </div>
            <Users className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-l-green-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500">Active Jobs</p>
              <p className="text-2xl font-bold">{mockStats.activeJobs}</p>
            </div>
            <Briefcase className="h-8 w-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-l-yellow-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500">Total Applications</p>
              <p className="text-2xl font-bold">
                {mockStats.totalApplications}
              </p>
            </div>
            <FileText className="h-8 w-8 text-yellow-500" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-l-purple-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500">Administrators</p>
              <p className="text-2xl font-bold">{mockStats.administrators}</p>
            </div>
            <Shield className="h-8 w-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* System Overview & Recent Admin Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-2 mb-4">
            <Server className="h-5 w-5 text-gray-500" />
            <h2 className="text-xl font-bold">System Overview</h2>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Server Status</span>
              <span className="text-sm font-medium text-green-600">
                {mockSystemStatus.serverStatus}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Database</span>
              <span className="text-sm font-medium text-green-600">
                {mockSystemStatus.database}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Storage</span>
              <div className="flex items-center gap-2">
                <span className="text-sm">{mockSystemStatus.storageUsed}</span>
                <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-yellow-500 rounded-full"
                    style={{ width: mockSystemStatus.storageUsed }}
                  ></div>
                </div>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Active Sessions</span>
              <span className="text-sm font-medium">
                {mockSystemStatus.activeSessions}
              </span>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="h-5 w-5 text-gray-500" />
            <h2 className="text-xl font-bold">Recent Admin Activities</h2>
          </div>
          <div className="space-y-3">
            {mockRecentAdminActivities.map((activity) => (
              <div key={activity.id} className="border-b pb-2 last:border-0">
                <p className="text-sm text-gray-700">{activity.action}</p>
                <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <button
              key={action.label}
              onClick={action.onClick}
              className="flex flex-col items-center gap-2 p-4 border rounded-lg hover:bg-gray-50 transition"
            >
              {action.icon}
              <span className="text-sm font-medium">{action.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* User/Job Management Tabs */}
      <Tabs defaultValue="users" className="space-y-4">
        <TabsList>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="jobs">Jobs</TabsTrigger>
          <TabsTrigger value="admins">Admin Users</TabsTrigger>
        </TabsList>
        <TabsContent value="users">
          <ManageUsers />
        </TabsContent>
        <TabsContent value="jobs">
          <ManageJobs />
        </TabsContent>
        <TabsContent value="admins">
          <AdminUsersManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}
