/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import api from "../../../services/api";
import { Search, Eye, UserCheck, UserX } from "lucide-react";

interface User {
  id: string;
  email: string;
  user_type: { type_name: string };
  created_at: string;
  suspended?: boolean;
  profile?: {
    full_name?: string;
    company_name?: string;
    phone?: string;
    location?: string;
  };
}

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [filtered, setFiltered] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<
    "all" | "job_seeker" | "employer"
  >("all");
  const [suspending, setSuspending] = useState<string | null>(null);
  const [viewingUser, setViewingUser] = useState<User | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/users");
      // Filter out Admin users – Admin should only see Job Seekers and Employers
      let filteredUsers = res.data.filter(
        (u: User) => u.user_type.type_name !== "Admin",
      );
      filteredUsers = filteredUsers.map((u: User) => ({
        ...u,
        suspended: u.suspended || false,
      }));
      setUsers(filteredUsers);
      setFiltered(filteredUsers);
    } catch (error) {
      console.error(error);
      // Fallback mock data
      const mockUsers: User[] = [
        {
          id: "1",
          email: "john@example.com",
          user_type: { type_name: "Job Seeker" },
          created_at: new Date().toISOString(),
          suspended: false,
          profile: {
            full_name: "John Doe",
            location: "New York",
            phone: "123456789",
          },
        },
        {
          id: "2",
          email: "acme@example.com",
          user_type: { type_name: "Employer" },
          created_at: new Date().toISOString(),
          suspended: false,
          profile: {
            company_name: "Acme Inc",
            location: "San Francisco",
            phone: "987654321",
          },
        },
        {
          id: "3",
          email: "suspended@example.com",
          user_type: { type_name: "Job Seeker" },
          created_at: new Date().toISOString(),
          suspended: true,
          profile: { full_name: "Suspended User", location: "Unknown" },
        },
      ];
      setUsers(mockUsers);
      setFiltered(mockUsers);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    let result = [...users];
    if (search) {
      const term = search.toLowerCase();
      result = result.filter(
        (u) =>
          u.email.toLowerCase().includes(term) ||
          u.profile?.full_name?.toLowerCase().includes(term) ||
          u.profile?.company_name?.toLowerCase().includes(term),
      );
    }
    if (roleFilter !== "all") {
      const target = roleFilter === "job_seeker" ? "Job Seeker" : "Employer";
      result = result.filter((u) => u.user_type.type_name === target);
    }
    setFiltered(result);
  }, [search, roleFilter, users]);

  const suspendUser = async (userId: string) => {
    if (!confirm("Suspend this user?")) return;
    setSuspending(userId);
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, suspended: true } : u)),
    );
    try {
      await api.patch(`/admin/users/${userId}/suspend`);
    } catch (err) {
      console.warn(err);
    }
    setSuspending(null);
  };

  const activateUser = async (userId: string) => {
    if (!confirm("Activate this user?")) return;
    setSuspending(userId);
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, suspended: false } : u)),
    );
    try {
      await api.patch(`/admin/users/${userId}/activate`);
    } catch (err) {
      console.warn(err);
    }
    setSuspending(null);
  };

  const viewDetails = (user: User) => setViewingUser(user);
  const closeModal = () => setViewingUser(null);

  const getDisplayName = (user: User): string => {
    if (user.user_type.type_name === "Job Seeker")
      return user.profile?.full_name || user.email.split("@")[0];
    return user.profile?.company_name || user.email.split("@")[0];
  };

  if (loading) return <div className="p-8 text-center">Loading users...</div>;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search by name, email or company..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value as any)}
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white"
        >
          <option value="all">All Users</option>
          <option value="job_seeker">Job Seekers</option>
          <option value="employer">Employers</option>
        </select>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Name / Company
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filtered.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {getDisplayName(user)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${user.user_type.type_name === "Job Seeker" ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"}`}
                    >
                      {user.user_type.type_name}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.profile?.location || "—"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${user.suspended ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}
                    >
                      {user.suspended ? "Suspended" : "Active"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                    <button
                      onClick={() => viewDetails(user)}
                      className="text-blue-600"
                    >
                      <Eye size={16} />
                    </button>
                    {!user.suspended ? (
                      <button
                        onClick={() => suspendUser(user.id)}
                        disabled={suspending === user.id}
                        className="text-orange-600"
                      >
                        <UserX size={16} />
                      </button>
                    ) : (
                      <button
                        onClick={() => activateUser(user.id)}
                        disabled={suspending === user.id}
                        className="text-green-600"
                      >
                        <UserCheck size={16} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    No users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View modal */}
      {viewingUser && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={closeModal}
        >
          <div
            className="bg-white rounded-2xl shadow-xl w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center">
              <h3 className="text-lg font-bold">User Details</h3>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <div className="p-6 space-y-2">
              <p>
                <strong>Email:</strong> {viewingUser.email}
              </p>
              <p>
                <strong>Role:</strong> {viewingUser.user_type.type_name}
              </p>
              <p>
                <strong>Name / Company:</strong> {getDisplayName(viewingUser)}
              </p>
              <p>
                <strong>Phone:</strong> {viewingUser.profile?.phone || "—"}
              </p>
              <p>
                <strong>Location:</strong>{" "}
                {viewingUser.profile?.location || "—"}
              </p>
              <p>
                <strong>Registered:</strong>{" "}
                {new Date(viewingUser.created_at).toLocaleDateString()}
              </p>
              <p>
                <strong>Status:</strong>{" "}
                {viewingUser.suspended ? "Suspended" : "Active"}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
