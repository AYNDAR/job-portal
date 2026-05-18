import { useEffect, useState } from "react";
import api from "../../../services/api";

interface User {
  id: string;
  email: string;
  user_type: { type_name: string };
  created_at: string;
  suspended: boolean;
}

export default function SuspendedAccounts() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSuspended = async () => {
      try {
        const res = await api.get("/admin/users/suspended");
        setUsers(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSuspended();
  }, []);

  const restoreUser = async (userId: string) => {
    if (!confirm("Restore this account?")) return;
    await api.patch(`/admin/users/${userId}/restore`);
    setUsers(users.filter((u) => u.id !== userId));
  };

  if (loading) return <div>Loading suspended accounts...</div>;

  return (
    <div className="bg-white p-5 rounded-xl shadow-sm">
      <h2 className="text-xl font-bold mb-4">Suspended Accounts</h2>
      {users.length === 0 ? (
        <p>No suspended accounts.</p>
      ) : (
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th>Email</th>
              <th>Role</th>
              <th>Suspended Since</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b">
                <td className="py-2">{user.email}</td>
                <td>{user.user_type.type_name}</td>
                <td>{new Date(user.created_at).toLocaleDateString()}</td>
                <td>
                  <button
                    onClick={() => restoreUser(user.id)}
                    className="text-blue-600 hover:underline"
                  >
                    Restore
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
