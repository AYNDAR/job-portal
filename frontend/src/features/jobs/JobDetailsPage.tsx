import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppSelector } from "../../store/hooks";
import api from "../../services/api";
import JobDetails from "../../components/jobs/JobDetails";
import Loader from "../../components/common/Loader";

interface JobData {
  id: string;
  title: string;
  description: string;
  salary_range: string;
  created_at: string;
  employer: {
    company_name: string;
    logo_url: string | null;
    website: string | null;
    location: string;
  };
  employment_type: { type_name: string };
  industry: { industry_name: string };
}

export default function JobDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { token, user } = useAppSelector((state) => state.auth);
  const [job, setJob] = useState<JobData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const res = await api.get(`/jobs/${id}`);
        setJob(res.data);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        setError(err.response?.data?.error || "Failed to load job details");
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [id]);

  const handleApply = () => {
    if (!token) {
      navigate("/login");
      return;
    }
    if (user?.userType !== "Job Seeker") {
      alert("Only job seekers can apply");
      return;
    }
    navigate(`/apply/${id}`);
  };

  if (loading) return <Loader />;
  if (error)
    return <div className="text-center text-red-500 py-12">{error}</div>;
  if (!job) return <div className="text-center py-12">Job not found</div>;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <JobDetails
        id={job.id}
        title={job.title}
        description={job.description}
        salaryRange={job.salary_range}
        createdAt={job.created_at}
        companyName={job.employer.company_name}
        companyLogo={job.employer.logo_url}
        companyWebsite={job.employer.website}
        location={job.employer.location}
        employmentType={job.employment_type.type_name}
        industryName={job.industry.industry_name}
        isAuthenticated={!!token}
        userType={user?.userType}
        onApply={handleApply}
      />
    </div>
  );
}
