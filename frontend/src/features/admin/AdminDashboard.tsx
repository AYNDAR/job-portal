import { useAppSelector } from "../../store/hooks";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import ManageUsers from "./ManageUsers";
import ManageJobs from "./ManageJobs";
import AdminStats from "../../components/admin/AdminStatus";
import AdminUsersManager from "../../components/admin/AdminUsersManager";

export default function AdminDashboard() {
  const { user } = useAppSelector((state) => state.auth);
  const isSuperAdmin = user?.userType === "Super Admin";

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      <AdminStats />
      <Tabs defaultValue="users">
        <TabsList>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="jobs">Jobs</TabsTrigger>
          {isSuperAdmin && (
            <TabsTrigger value="admins">Admin Users</TabsTrigger>
          )}
        </TabsList>
        <TabsContent value="users">
          <ManageUsers />
        </TabsContent>
        <TabsContent value="jobs">
          <ManageJobs />
        </TabsContent>
        {isSuperAdmin && (
          <TabsContent value="admins">
            <AdminUsersManager />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
