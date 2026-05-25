import { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import {
  Search,
  MapPin,
  CheckCircle,
  ArrowRight,
  Building2,
  Globe,
  ChevronRight,
  Users,
  X,
  ExternalLink,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────
interface CompanyJob {
  id: string;
  title: string;
  salary_range: string;
  created_at: string;
  employment_type: { type_name: string };
  industry: { industry_name: string };
}

interface Company {
  id: string;
  company_name: string;
  logo_url: string | null;
  website: string | null;
  location: string;
  industry?: string;
  description?: string;
  employee_count?: string;
  verified?: boolean;
  jobs: CompanyJob[];
}

const INDUSTRIES = [
  "All",
  "Technology",
  "Healthcare",
  "Finance",
  "Design",
  "Marketing",
  "Education",
  "Engineering",
  "Sales",
];

const COMPANY_SIZES = [
  { label: "All sizes", value: "" },
  { label: "1–50 employees", value: "1-50" },
  { label: "51–200 employees", value: "51-200" },
  { label: "201–1000 employees", value: "201-1000" },
  { label: "1000+ employees", value: "1000+" },
];

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  return `${Math.floor(days / 7)}w ago`;
}

function industryColor(industry: string) {
  const map: Record<string, string> = {
    Technology: "bg-blue-50 text-blue-700",
    Healthcare: "bg-green-50 text-green-700",
    Finance: "bg-amber-50 text-amber-700",
    Design: "bg-pink-50 text-pink-700",
    Marketing: "bg-orange-50 text-orange-700",
    Education: "bg-purple-50 text-purple-700",
    Engineering: "bg-cyan-50 text-cyan-700",
    Sales: "bg-teal-50 text-teal-700",
  };
  return map[industry] || "bg-gray-100 text-gray-600";
}

// ─── Company Card ─────────────────────────────────────────────
function CompanyCard({ company }: { company: Company }) {
  const [expanded, setExpanded] = useState(false);
  const initial = company.company_name?.[0]?.toUpperCase() || "C";

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden">
      {/* Header */}
      <div className="p-5">
        <div className="flex items-start gap-4">
          {company.logo_url ? (
            <img
              src={company.logo_url}
              alt={company.company_name}
              className="w-14 h-14 rounded-2xl object-cover border border-gray-100 shrink-0"
            />
          ) : (
            <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-blue-50 to-indigo-100 flex items-center justify-center text-2xl font-bold text-blue-600 shrink-0">
              {initial}
            </div>
          )}

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h3 className="font-bold text-gray-900 text-base leading-tight">
                {company.company_name}
              </h3>
              {company.verified && (
                <CheckCircle size={15} className="text-blue-500 shrink-0" />
              )}
            </div>

            {company.industry && (
              <span
                className={`mt-1 inline-block text-xs px-2.5 py-0.5 rounded-full font-medium ${industryColor(company.industry)}`}
              >
                {company.industry}
              </span>
            )}

            <div className="flex flex-wrap items-center gap-3 mt-2">
              {company.location && (
                <span className="flex items-center gap-1 text-xs text-gray-500">
                  <MapPin size={11} /> {company.location}
                </span>
              )}
              {company.employee_count && (
                <span className="flex items-center gap-1 text-xs text-gray-500">
                  <Users size={11} /> {company.employee_count}
                </span>
              )}
              {company.website && (
                <a
                  href={company.website}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-xs text-blue-500 hover:text-blue-700 transition"
                >
                  <Globe size={11} /> Website <ExternalLink size={9} />
                </a>
              )}
            </div>
          </div>

          <div className="text-center shrink-0">
            <p className="text-2xl font-bold text-blue-600">
              {company.jobs.length}
            </p>
            <p className="text-xs text-gray-400">open roles</p>
          </div>
        </div>

        {company.description && (
          <p className="text-xs text-gray-500 leading-relaxed mt-3 line-clamp-2">
            {company.description}
          </p>
        )}
      </div>

      {/* Jobs preview */}
      {company.jobs.length > 0 && (
        <div className="border-t border-gray-50">
          <div className="px-5 py-3 bg-gray-50/60">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Open Positions
              </p>
              <button
                onClick={() => setExpanded(!expanded)}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-0.5"
              >
                {expanded ? "Hide" : `Show all ${company.jobs.length}`}
                <ChevronRight
                  size={13}
                  className={`transition-transform ${expanded ? "rotate-90" : ""}`}
                />
              </button>
            </div>
          </div>

          <div className="divide-y divide-gray-50">
            {(expanded ? company.jobs : company.jobs.slice(0, 3)).map((job) => (
              <Link
                key={job.id}
                to={`/jobs/${job.id}`}
                className="flex items-center justify-between px-5 py-3 hover:bg-blue-50/40 transition-colors group"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-800 group-hover:text-blue-600 transition truncate">
                    {job.title}
                  </p>
                  <div className="flex gap-2 mt-0.5">
                    <span className="text-xs text-gray-400">
                      {job.employment_type.type_name}
                    </span>
                    <span className="text-xs text-gray-300">·</span>
                    <span className="text-xs text-gray-400">
                      {timeAgo(job.created_at)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0 ml-3">
                  <span className="text-xs font-medium text-gray-600">
                    {job.salary_range || "Competitive"}
                  </span>
                  <ArrowRight
                    size={13}
                    className="text-gray-300 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all"
                  />
                </div>
              </Link>
            ))}
          </div>

          {company.jobs.length > 3 && !expanded && (
            <div className="px-5 pb-4 pt-2">
              <button
                onClick={() => setExpanded(true)}
                className="w-full text-center text-xs text-blue-600 hover:text-blue-700 font-medium py-2 rounded-xl hover:bg-blue-50 transition"
              >
                +{company.jobs.length - 3} more positions
              </button>
            </div>
          )}
        </div>
      )}

      {company.jobs.length === 0 && (
        <div className="border-t border-gray-50 px-5 py-4 text-center">
          <p className="text-xs text-gray-400">No open positions right now</p>
        </div>
      )}
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────
function CompanySkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse">
      <div className="flex gap-4 mb-4">
        <div className="w-14 h-14 bg-gray-100 rounded-2xl shrink-0" />
        <div className="flex-1 space-y-2 pt-1">
          <div className="h-4 bg-gray-100 rounded w-1/2" />
          <div className="h-3 bg-gray-100 rounded w-1/3" />
          <div className="h-3 bg-gray-100 rounded w-2/3" />
        </div>
        <div className="text-right space-y-1">
          <div className="h-7 bg-gray-100 rounded w-8 ml-auto" />
          <div className="h-3 bg-gray-100 rounded w-12" />
        </div>
      </div>
      <div className="h-px bg-gray-100 mb-3" />
      <div className="space-y-2">
        <div className="h-8 bg-gray-50 rounded-xl w-full" />
        <div className="h-8 bg-gray-50 rounded-xl w-full" />
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────
export default function CompaniesPage() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState("All");
  const [selectedSize, setSelectedSize] = useState("");
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  const fetchCompanies = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (keyword) params.keyword = keyword;
      if (selectedIndustry !== "All") params.industry = selectedIndustry;
      if (selectedSize) params.size = selectedSize;

      // Try fetching companies with their jobs
      // Endpoint: GET /employers or /companies — adjust to your backend
      const res = await api.get("/employers", { params });
      const data = Array.isArray(res.data)
        ? res.data
        : res.data.companies || res.data.data || [];

      // For each company, attach jobs if not already included
      const companiesWithJobs: Company[] = await Promise.all(
        data.map(async (co: Company) => {
          if (co.jobs && co.jobs.length >= 0) return co;
          try {
            const jobsRes = await api.get("/jobs", {
              params: { company: co.company_name, limit: "10" },
            });
            const jobs = Array.isArray(jobsRes.data)
              ? jobsRes.data
              : jobsRes.data.jobs || jobsRes.data.data || [];
            return { ...co, jobs };
          } catch {
            return { ...co, jobs: [] };
          }
        }),
      );

      setCompanies(companiesWithJobs);
      setTotal(companiesWithJobs.length);
    } catch {
      setCompanies([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [keyword, selectedIndustry, selectedSize]);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCompanies();
  };

  const totalJobs = companies.reduce(
    (sum, co) => sum + (co.jobs?.length || 0),
    0,
  );

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      {/* Header */}
      <div className="bg-linear-to-br from-[#0d1a2d] via-[#0f2744] to-[#143057] py-12">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white/80 text-xs font-medium px-4 py-1.5 rounded-full mb-5">
            <Building2 size={12} className="text-blue-300" />
            {total > 0
              ? `${total} companies hiring`
              : "Top companies hiring now"}
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
            Explore Top Companies
          </h1>
          <p className="text-white/60 text-sm mb-8 max-w-md mx-auto">
            Browse verified employers, explore their culture, and apply directly
            to their open roles.
          </p>

          {/* Stats */}
          <div className="flex justify-center gap-8 mb-8">
            <div>
              <p className="text-2xl font-bold text-white">
                {total.toLocaleString()}+
              </p>
              <p className="text-xs text-white/50">Companies</p>
            </div>
            <div className="w-px bg-white/10" />
            <div>
              <p className="text-2xl font-bold text-white">
                {totalJobs.toLocaleString()}+
              </p>
              <p className="text-xs text-white/50">Open Roles</p>
            </div>
          </div>

          {/* Search */}
          <form
            onSubmit={handleSearch}
            className="flex gap-2 bg-white rounded-2xl p-2 shadow-xl max-w-xl mx-auto"
          >
            <div className="relative flex-1">
              <Search
                size={15}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Search companies..."
                className="w-full pl-10 pr-4 py-3 text-sm text-gray-800 bg-transparent focus:outline-none placeholder:text-gray-400"
              />
            </div>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl transition text-sm"
            >
              Search
            </button>
          </form>
        </div>
      </div>

      {/* Filters bar */}
      <div className="bg-white border-b border-gray-100 sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3 overflow-x-auto">
          {/* Industry filter */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs text-gray-400 font-medium whitespace-nowrap">
              Industry:
            </span>
            <div className="flex gap-1.5">
              {INDUSTRIES.map((ind) => (
                <button
                  key={ind}
                  onClick={() => setSelectedIndustry(ind)}
                  className={`text-xs px-3 py-1.5 rounded-full whitespace-nowrap transition font-medium ${
                    selectedIndustry === ind
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {ind}
                </button>
              ))}
            </div>
          </div>

          <div className="w-px h-5 bg-gray-200 shrink-0" />

          {/* Size filter */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs text-gray-400 font-medium whitespace-nowrap">
              Size:
            </span>
            <select
              value={selectedSize}
              onChange={(e) => setSelectedSize(e.target.value)}
              className="text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {COMPANY_SIZES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          {(selectedIndustry !== "All" || selectedSize || keyword) && (
            <button
              onClick={() => {
                setSelectedIndustry("All");
                setSelectedSize("");
                setKeyword("");
              }}
              className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 px-2 py-1.5 rounded-lg hover:bg-red-50 transition shrink-0"
            >
              <X size={12} /> Clear
            </button>
          )}
        </div>
      </div>

      {/* Companies grid */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <CompanySkeleton key={i} />
            ))}
          </div>
        ) : companies.length === 0 ? (
          <div className="text-center py-24">
            <Building2 size={52} className="mx-auto text-gray-200 mb-4" />
            <p className="text-gray-600 font-semibold">No companies found</p>
            <p className="text-gray-400 text-sm mt-1 mb-5">
              Try different search terms or filters
            </p>
            <button
              onClick={() => {
                setKeyword("");
                setSelectedIndustry("All");
                setSelectedSize("");
              }}
              className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              <X size={14} /> Reset filters
            </button>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-500 mb-5">
              Showing{" "}
              <strong className="text-gray-800">{companies.length}</strong>{" "}
              companies
              {selectedIndustry !== "All" && ` in ${selectedIndustry}`}
            </p>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {companies.map((company) => (
                <CompanyCard key={company.id} company={company} />
              ))}
            </div>
          </>
        )}
      </div>

      {/* CTA Banner */}
      <div className="bg-linear-to-r from-blue-600 to-indigo-700 py-12 mt-8">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-white mb-2">
            Are you an employer?
          </h2>
          <p className="text-blue-100 text-sm mb-6">
            Post your jobs and get discovered by thousands of qualified
            candidates.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/register?type=employer"
              className="inline-flex items-center justify-center gap-2 bg-white text-blue-700 font-semibold text-sm px-6 py-3 rounded-xl hover:bg-blue-50 transition"
            >
              Register as Employer <ArrowRight size={14} />
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center justify-center gap-2 bg-blue-500/40 hover:bg-blue-500/60 border border-white/30 text-white font-semibold text-sm px-6 py-3 rounded-xl transition"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
