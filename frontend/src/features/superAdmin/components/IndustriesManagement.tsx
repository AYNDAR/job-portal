import { useEffect, useState } from "react";
import api from "../../../services/api";
import { Plus, Edit2, Trash2, X, Check } from "lucide-react";

interface Industry {
  id: number;
  industry_name: string;
}

const STORAGE_KEY = "superadmin_industries";

export default function IndustriesManagement() {
  const [industries, setIndustries] = useState<Industry[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [newName, setNewName] = useState("");
  const [showForm, setShowForm] = useState(false);

  // Load from localStorage or API
  const loadIndustries = async () => {
    setLoading(true);
    // Try localStorage first
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setIndustries(JSON.parse(stored));
      setLoading(false);
      return;
    }
    // Fallback to API or default mock
    try {
      const res = await api.get("/admin/industries");
      setIndustries(res.data);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(res.data));
    } catch (error) {
      console.error("Using mock data", error);
      const defaultData = [
        { id: 1, industry_name: "Technology" },
        { id: 2, industry_name: "Healthcare" },
        { id: 3, industry_name: "Finance" },
      ];
      setIndustries(defaultData);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultData));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIndustries();
  }, []);

  // Save to localStorage whenever industries change
  useEffect(() => {
    if (industries.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(industries));
    }
  }, [industries]);

  const addIndustry = async () => {
    if (!newName.trim()) return;
    const newId = Date.now();
    const newIndustry = { id: newId, industry_name: newName };
    setIndustries([...industries, newIndustry]);
    setNewName("");
    setShowForm(false);
    // Optional: try to sync with API
    try {
      await api.post("/admin/industries", { industry_name: newName });
    } catch (error) {
      console.warn("API save failed, data saved locally only");
    }
  };

  const updateIndustry = async (id: number) => {
    if (!editName.trim()) return;
    setIndustries(
      industries.map((i) =>
        i.id === id ? { ...i, industry_name: editName } : i,
      ),
    );
    setEditingId(null);
    try {
      await api.put(`/admin/industries/${id}`, { industry_name: editName });
    } catch (error) {
      console.warn("API update failed, data updated locally only");
    }
  };

  const deleteIndustry = async (id: number) => {
    if (
      !confirm(
        "Delete this industry? All jobs using it will lose the industry reference.",
      )
    )
      return;
    setIndustries(industries.filter((i) => i.id !== id));
    try {
      await api.delete(`/admin/industries/${id}`);
    } catch (error) {
      console.warn("API delete failed, data removed locally only");
    }
  };

  if (loading)
    return <div className="p-8 text-center">Loading industries...</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800">Manage Industries</h2>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-1 bg-purple-600 text-white px-3 py-1.5 rounded-lg text-sm"
        >
          <Plus size={14} /> Add Industry
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-4 rounded-lg shadow flex gap-2 items-center">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Industry name"
            className="flex-1 border rounded-lg px-3 py-2"
            autoFocus
          />
          <button
            onClick={addIndustry}
            className="bg-green-600 text-white px-3 py-2 rounded-lg"
          >
            <Check size={16} />
          </button>
          <button
            onClick={() => setShowForm(false)}
            className="bg-gray-200 text-gray-700 px-3 py-2 rounded-lg"
          >
            <X size={16} />
          </button>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Industry Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {industries.map((ind) => (
              <tr key={ind.id}>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {editingId === ind.id ? (
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="border rounded px-2 py-1"
                      autoFocus
                    />
                  ) : (
                    ind.industry_name
                  )}
                </td>
                <td className="px-6 py-4 text-sm space-x-2">
                  {editingId === ind.id ? (
                    <>
                      <button
                        onClick={() => updateIndustry(ind.id)}
                        className="text-green-600"
                      >
                        <Check size={14} />
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="text-gray-500"
                      >
                        <X size={14} />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          setEditingId(ind.id);
                          setEditName(ind.industry_name);
                        }}
                        className="text-blue-600"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => deleteIndustry(ind.id)}
                        className="text-red-600"
                      >
                        <Trash2 size={14} />
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
