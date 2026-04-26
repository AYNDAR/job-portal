import { useState } from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import PostJobForm from "../../components/employer/PostJobForm";
import EmployerJobs from "../../components/employer/EmployerJobs";
import ApplicantsList from "../../components/employer/ApplicantsList";

export default function EmployerDashboard() {
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Employer Dashboard</h1>
      <Tabs defaultValue="jobs" className="space-y-4">
        <TabsList>
          <TabsTrigger value="jobs">My Jobs</TabsTrigger>
          <TabsTrigger value="post">Post a New Job</TabsTrigger>
          <TabsTrigger value="applicants" disabled={!selectedJobId}>
            Applicants {selectedJobId && "(selected job)"}
          </TabsTrigger>
        </TabsList>
        <TabsContent value="jobs">
          <EmployerJobs onSelectJob={(jobId) => setSelectedJobId(jobId)} />
        </TabsContent>
        <TabsContent value="post">
          <PostJobForm />
        </TabsContent>
        <TabsContent value="applicants">
          {selectedJobId && <ApplicantsList jobId={selectedJobId} />}
        </TabsContent>
      </Tabs>
    </div>
  );
}
