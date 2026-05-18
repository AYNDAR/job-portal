import { useEffect, useState } from "react";
import api from "../../services/api";

interface Industry {
  id: number;
  industry_name: string;
}

export default function CompanyProfile() {
  const [profile, setProfile] = useState({
    company_name: "",
    website: "",
    logo_url: "",
    industry_id: 0,
    location: "",
  });
  const [industries, setIndustries] = useState<Industry[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, industriesRes] = await Promise.all([
          api.get("/employer/profile"),
          api.get("/admin/categories"),
        ]);
        setProfile(profileRes.data);
        setIndustries(industriesRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      await api.put("/employer/profile", profile);
      setMessage("Profile updated successfully");
    } catch {
      setMessage("Update failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-4">Loading profile...</div>;

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
      <h2 className="text-2xl font-bold mb-4">Company Profile</h2>
      {message && (
        <div
          className={`p-2 mb-4 rounded ${
            message.includes("success")
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {message}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="companyName"
            className="block text-sm font-medium text-gray-700"
          >
            Company Name
          </label>
          <input
            id="companyName"
            type="text"
            value={profile.company_name}
            onChange={(e) =>
              setProfile({ ...profile, company_name: e.target.value })
            }
            className="mt-1 w-full border rounded-lg px-3 py-2"
            required
            placeholder="e.g., Acme Inc."
          />
        </div>
        <div>
          <label
            htmlFor="website"
            className="block text-sm font-medium text-gray-700"
          >
            Website
          </label>
          <input
            id="website"
            type="url"
            value={profile.website || ""}
            onChange={(e) =>
              setProfile({ ...profile, website: e.target.value })
            }
            className="mt-1 w-full border rounded-lg px-3 py-2"
            placeholder="https://example.com"
          />
        </div>
        <div>
          <label
            htmlFor="logoUrl"
            className="block text-sm font-medium text-gray-700"
          >
            Logo URL
          </label>
          <input
            id="logoUrl"
            type="url"
            value={profile.logo_url || ""}
            onChange={(e) =>
              setProfile({ ...profile, logo_url: e.target.value })
            }
            className="mt-1 w-full border rounded-lg px-3 py-2"
            placeholder="https://example.com/logo.png"
          />
        </div>
        <div>
          <label
            htmlFor="industry"
            className="block text-sm font-medium text-gray-700"
          >
            Industry
          </label>
          <select
            id="industry"
            value={profile.industry_id}
            onChange={(e) =>
              setProfile({ ...profile, industry_id: Number(e.target.value) })
            }
            className="mt-1 w-full border rounded-lg px-3 py-2"
          >
            <option value={0}>Select industry</option>
            {industries.map((ind) => (
              <option key={ind.id} value={ind.id}>
                {ind.industry_name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label
            htmlFor="location"
            className="block text-sm font-medium text-gray-700"
          >
            Location
          </label>
          <input
            id="location"
            type="text"
            value={profile.location || ""}
            onChange={(e) =>
              setProfile({ ...profile, location: e.target.value })
            }
            className="mt-1 w-full border rounded-lg px-3 py-2"
            placeholder="City, Country"
          />
        </div>
        <button
          type="submit"
          disabled={saving}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
}
