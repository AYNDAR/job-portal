/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import api from "../../services/api";

export default function ApplicantsList({ jobId }: { jobId: string }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("Fetching applicants for jobId:", jobId);
        const res = await api.get(`/employer/jobs/${jobId}/applicants`);
        console.log("Response:", res.data);
        setData(res.data);
      } catch (err: any) {
        console.error(err);
        setError(err.message);
      }
    };
    if (jobId) fetchData();
  }, [jobId]);

  if (!jobId) return <div>No job selected</div>;
  if (error) return <div>Error: {error}</div>;
  if (!data) return <div>Loading...</div>;
  return <pre>{JSON.stringify(data, null, 2)}</pre>;
}
