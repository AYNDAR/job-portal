import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  fetchAdminUsers,
  createAdmin,
  resetAdminPassword,
  deleteAdmin,
} from "../../features/admin/adminSlice";

interface AdminUser {
  id: string;
  email: string;
  created_at: string;
}

export default function AdminUsersManager() {
  const dispatch = useAppDispatch();
  const { adminUsers } = useAppSelector((state) => state.admin);
  const { user: currentUser } = useAppSelector((state) => state.auth);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    dispatch(fetchAdminUsers());
  }, [dispatch]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await dispatch(createAdmin({ email, password }));
    setEmail("");
    setPassword("");
    await dispatch(fetchAdminUsers());
    setLoading(false);
  };

  const handleReset = async (id: string) => {
    const newPass = prompt("Enter new password for the admin:");
    if (newPass) {
      await dispatch(resetAdminPassword({ id, password: newPass }));
      alert("Password updated");
      dispatch(fetchAdminUsers());
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Delete this admin user?")) {
      await dispatch(deleteAdmin(id));
      await dispatch(fetchAdminUsers());
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Admin Users</h3>
      <form onSubmit={handleCreate} className="mb-6 flex gap-2">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border rounded p-2 flex-1"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border rounded p-2 flex-1"
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          {loading ? "Creating..." : "Add Admin"}
        </button>
      </form>
      <table className="min-w-full divide-y divide-gray-200">
        <thead>
          <tr>
            <th>Email</th>
            <th>Created At</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {adminUsers.map((admin: AdminUser) => (
            <tr key={admin.id}>
              <td>{admin.email}</td>
              <td>{new Date(admin.created_at).toLocaleDateString()}</td>
              <td>
                <button
                  onClick={() => handleReset(admin.id)}
                  className="text-blue-600 mr-2"
                >
                  Reset Password
                </button>
                {admin.id !== currentUser?.id && (
                  <button
                    onClick={() => handleDelete(admin.id)}
                    className="text-red-600"
                  >
                    Delete
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
