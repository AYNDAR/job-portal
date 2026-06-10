import { useEffect, useState } from "react";
import api from "../../../services/api";
import { Plus, Edit2, Trash2, X, Check } from "lucide-react";

interface EmploymentType {
  id: number;
  type_name: string;
}

const STORAGE_KEY = "superadmin_employment_types";

export default function EmploymentTypesManagement() {
  const [types, setTypes] = useState<EmploymentType[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [newName, setNewName] = useState("");
  const [showForm, setShowForm] = useState(false);

  const loadTypes = async () => {
    setLoading(true);
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setTypes(JSON.parse(stored));
      setLoading(false);
      return;
    }
    try {
      const res = await api.get("/admin/employment-types");
      setTypes(res.data);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(res.data));
    } catch (error) {
      const defaultData = [
        { id: 1, type_name: "Full-time" },
        { id: 2, type_name: "Part-time" },
        { id: 3, type_name: "Remote" },
        { id: 4, type_name: "Contract" },
        { id: 5, type_name: "Internship" },
      ];
      setTypes(defaultData);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultData));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTypes();
  }, []);

  useEffect(() => {
    if (types.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(types));
    }
  }, [types]);

  const addType = async () => {
    if (!newName.trim()) return;
    const newId = Date.now();
    setTypes([...types, { id: newId, type_name: newName }]);
    setNewName("");
    setShowForm(false);
    try {
      await api.post("/admin/employment-types", { type_name: newName });
    } catch (error) {
      console.error("Failed to add employment type", error);
    }
  };

  const updateType = async (id: number) => {
    if (!editName.trim()) return;
    setTypes(
      types.map((t) => (t.id === id ? { ...t, type_name: editName } : t)),
    );
    setEditingId(null);
    try {
      await api.put(`/admin/employment-types/${id}`, { type_name: editName });
    } catch (error) {
      console.error("Failed to update employment type", error);
    }
  };

  const deleteType = async (id: number) => {
    if (
      !confirm("Delete this employment type? Jobs using it will be affected.")
    )
      return;
    setTypes(types.filter((t) => t.id !== id));
    try {
      await api.delete(`/admin/employment-types/${id}`);
    } catch (error) {
      console.error("Failed to delete employment type", error);
    }
  };

  if (loading)
    return <div className="p-8 text-center">Loading employment types...</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800">
          Manage Employment Types
        </h2>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-1 bg-purple-600 text-white px-3 py-1.5 rounded-lg text-sm"
        >
          <Plus size={14} /> Add Type
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-4 rounded-lg shadow flex gap-2 items-center">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Type name"
            className="flex-1 border rounded-lg px-3 py-2"
            autoFocus
          />
          <button
            onClick={addType}
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
                Type Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {types.map((type) => (
              <tr key={type.id}>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {editingId === type.id ? (
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="border rounded px-2 py-1"
                      autoFocus
                    />
                  ) : (
                    type.type_name
                  )}
                </td>
                <td className="px-6 py-4 text-sm space-x-2">
                  {editingId === type.id ? (
                    <>
                      <button
                        onClick={() => updateType(type.id)}
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
                          setEditingId(type.id);
                          setEditName(type.type_name);
                        }}
                        className="text-blue-600"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => deleteType(type.id)}
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
