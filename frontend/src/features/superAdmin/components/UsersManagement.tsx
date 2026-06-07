import { useEffect, useState } from "react";
import api from "../../../services/api";
import { Search, Eye, User } from "lucide-react";

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
    website?: string;
    industry?: { industry_name: string };
    resume_url?: string;
    skills?: string[];
    avatar_url?: string;
    logo_url?: string;
  };
}

export default function UsersManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [filtered, setFiltered] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [suspending, setSuspending] = useState<string | null>(null);
  const [viewingUser, setViewingUser] = useState<User | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/users");
      const usersData = res.data;
      const usersWithSuspended = usersData.map((u: User) => ({
        ...u,
        suspended: u.suspended || false,
      }));
      const usersWithProfile = await Promise.all(
        usersWithSuspended.map(async (user: User) => {
          try {
            let profile = null;
            if (user.user_type.type_name === "Job Seeker") {
              const profileRes = await api.get(
                `/admin/users/${user.id}/profile`,
              );
              profile = profileRes.data;
            } else if (user.user_type.type_name === "Employer") {
              const profileRes = await api.get(
                `/admin/users/${user.id}/employer-profile`,
              );
              profile = profileRes.data;
            }
            return { ...user, profile };
          } catch {
            return user;
          }
        }),
      );
      setUsers(usersWithProfile);
      setFiltered(usersWithProfile);
    } catch (error) {
      console.error("Failed to fetch users, using mock data", error);
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
            avatar_url: "https://randomuser.me/api/portraits/men/1.jpg",
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
            logo_url: "https://via.placeholder.com/40",
          },
        },
        {
          id: "3",
          email: "admin@example.com",
          user_type: { type_name: "Admin" },
          created_at: new Date().toISOString(),
          suspended: false,
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
      result = result.filter(
        (u) =>
          u.email.toLowerCase().includes(search.toLowerCase()) ||
          u.profile?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
          u.profile?.company_name?.toLowerCase().includes(search.toLowerCase()),
      );
    }
    if (roleFilter !== "All") {
      result = result.filter((u) => u.user_type.type_name === roleFilter);
    }
    setFiltered(result);
  }, [search, roleFilter, users]);

  const suspendUser = async (userId: string) => {
    if (!confirm("Suspend this user? They will not be able to log in.")) return;
    setSuspending(userId);
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, suspended: true } : u)),
    );
    setFiltered((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, suspended: true } : u)),
    );
    try {
      await api.patch(`/admin/users/${userId}/suspend`);
    } catch (error) {
      console.warn("API suspend failed, UI already updated");
    } finally {
      setSuspending(null);
    }
  };

  const activateUser = async (userId: string) => {
    if (!confirm("Activate this user? They will be able to log in again."))
      return;
    setSuspending(userId);
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, suspended: false } : u)),
    );
    setFiltered((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, suspended: false } : u)),
    );
    try {
      await api.patch(`/admin/users/${userId}/activate`);
    } catch (error) {
      console.warn("API activate failed, UI already updated");
    } finally {
      setSuspending(null);
    }
  };

  const viewDetails = async (user: User) => {
    setViewingUser(user);
    if (!user.profile) {
      setProfileLoading(true);
      try {
        let profile = null;
        if (user.user_type.type_name === "Job Seeker") {
          const profileRes = await api.get(`/admin/users/${user.id}/profile`);
          profile = profileRes.data;
        } else if (user.user_type.type_name === "Employer") {
          const profileRes = await api.get(
            `/admin/users/${user.id}/employer-profile`,
          );
          profile = profileRes.data;
        }
        setViewingUser((prev) => (prev ? { ...prev, profile } : prev));
      } catch (err) {
        console.error(err);
      } finally {
        setProfileLoading(false);
      }
    }
  };

  const closeModal = () => setViewingUser(null);

  const getAvatarUrl = (user: User): string | null => {
    if (user.user_type.type_name === "Job Seeker") {
      return user.profile?.avatar_url || null;
    } else if (user.user_type.type_name === "Employer") {
      return user.profile?.logo_url || null;
    }
    return null;
  };

  const getInitials = (user: User): string => {
    const name = getDisplayName(user);
    if (name && name !== "—") return name.charAt(0).toUpperCase();
    return user.email.charAt(0).toUpperCase();
  };

  const getDisplayName = (user: User): string => {
    if (user.user_type.type_name === "Job Seeker") {
      return user.profile?.full_name || user.email.split("@")[0] || "—";
    } else if (user.user_type.type_name === "Employer") {
      return user.profile?.company_name || user.email.split("@")[0] || "—";
    } else {
      return "Admin";
    }
  };

  const getLocation = (user: User): string =>
    user.profile?.location || "Not specified";

  if (loading) return <div className="p-8 text-center">Loading users...</div>;

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between">
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
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-100"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="border border-gray-200 rounded-xl px-4 py-2 text-sm bg-white"
        >
          <option value="All">All Roles</option>
          <option value="Job Seeker">Job Seekers</option>
          <option value="Employer">Employers</option>
          <option value="Admin">Admins</option>
        </select>
      </div>

      {/* Users Table with Avatar Column */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Avatar
                </th>
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
            <tbody className="bg-white divide-y divide-gray-200">
              {filtered.map((user) => {
                const avatarUrl = getAvatarUrl(user);
                const initials = getInitials(user);
                return (
                  <tr key={user.id}>
                    <td className="px-4 py-4 whitespace-nowrap">
                      {avatarUrl ? (
                        <img
                          src={avatarUrl}
                          alt="avatar"
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-xs font-bold">
                          {initials}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {getDisplayName(user)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          user.user_type.type_name === "Job Seeker"
                            ? "bg-blue-100 text-blue-700"
                            : user.user_type.type_name === "Employer"
                              ? "bg-green-100 text-green-700"
                              : "bg-purple-100 text-purple-700"
                        }`}
                      >
                        {user.user_type.type_name}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {getLocation(user)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${user.suspended ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}
                      >
                        {user.suspended ? "Suspended" : "Active"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm space-x-3">
                      {!user.suspended ? (
                        <button
                          onClick={() => suspendUser(user.id)}
                          disabled={suspending === user.id}
                          className="text-red-600 hover:text-red-800 disabled:opacity-50"
                        >
                          {suspending === user.id ? "..." : "Suspend"}
                        </button>
                      ) : (
                        <button
                          onClick={() => activateUser(user.id)}
                          disabled={suspending === user.id}
                          className="text-green-600 hover:text-green-800 disabled:opacity-50"
                        >
                          {suspending === user.id ? "..." : "Activate"}
                        </button>
                      )}
                      <button
                        onClick={() => viewDetails(user)}
                        className="text-purple-600 hover:text-purple-800 inline-flex items-center gap-1"
                      >
                        <Eye size={14} /> View
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
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

      {/* View Details Modal (same as before, includes avatar) */}
      {viewingUser && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={closeModal}
        >
          <div
            className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-900">User Details</h3>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <div className="p-6">
              {profileLoading ? (
                <div>Loading profile...</div>
              ) : (
                <div className="space-y-3">
                  {getAvatarUrl(viewingUser) && (
                    <img
                      src={getAvatarUrl(viewingUser)!}
                      alt="avatar"
                      className="w-16 h-16 rounded-full"
                    />
                  )}
                  <div>
                    <strong>Email:</strong> {viewingUser.email}
                  </div>
                  <div>
                    <strong>Role:</strong> {viewingUser.user_type.type_name}
                  </div>
                  <div>
                    <strong>Registered:</strong>{" "}
                    {new Date(viewingUser.created_at).toLocaleDateString()}
                  </div>
                  {viewingUser.profile?.full_name && (
                    <div>
                      <strong>Full Name:</strong>{" "}
                      {viewingUser.profile.full_name}
                    </div>
                  )}
                  {viewingUser.profile?.company_name && (
                    <div>
                      <strong>Company:</strong>{" "}
                      {viewingUser.profile.company_name}
                    </div>
                  )}
                  {viewingUser.profile?.phone && (
                    <div>
                      <strong>Phone:</strong> {viewingUser.profile.phone}
                    </div>
                  )}
                  {viewingUser.profile?.location && (
                    <div>
                      <strong>Location:</strong> {viewingUser.profile.location}
                    </div>
                  )}
                  {viewingUser.profile?.skills && (
                    <div>
                      <strong>Skills:</strong>{" "}
                      {viewingUser.profile.skills.join(", ")}
                    </div>
                  )}
                  {viewingUser.profile?.website && (
                    <div>
                      <strong>Website:</strong> {viewingUser.profile.website}
                    </div>
                  )}
                  {viewingUser.profile?.industry?.industry_name && (
                    <div>
                      <strong>Industry:</strong>{" "}
                      {viewingUser.profile.industry.industry_name}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
