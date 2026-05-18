/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import api from "../../../services/api";

export default function CategoriesManagement() {
  const [categories, setCategories] = useState([]);
  const [newName, setNewName] = useState("");

  const fetchCategories = async () => {
    const res = await api.get("/admin/categories");
    setCategories(res.data);
  };

  const addCategory = async () => {
    if (!newName.trim()) return;
    await api.post("/admin/categories", { name: newName });
    setNewName("");
    fetchCategories();
  };

  const deleteCategory = async (id: number) => {
    if (!confirm("Delete this category?")) return;
    await api.delete(`/admin/categories/${id}`);
    fetchCategories();
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <div className="bg-white p-4 rounded shadow">
      <h2 className="text-xl font-bold mb-4">Job Categories</h2>
      <div className="flex gap-2 mb-4">
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="New category"
          className="border rounded p-2 flex-1"
        />
        <button
          onClick={addCategory}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Add
        </button>
      </div>
      <ul className="divide-y">
        {categories.map((cat: any) => (
          <li key={cat.id} className="py-2 flex justify-between">
            <span>{cat.industry_name}</span>
            <button
              onClick={() => deleteCategory(cat.id)}
              className="text-red-600"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
