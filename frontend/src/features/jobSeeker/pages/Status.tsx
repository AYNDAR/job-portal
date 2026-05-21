// src/features/jobSeeker/pages/Status.tsx
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Calendar, CheckCircle, Clock, XCircle } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../../components/ui/tabs";
import { Button } from "../../../components/ui/button";
import { RootState, AppDispatch } from "../../../store"; // ✅ corrected import
import { fetchApplications } from "../jobSeekerSlice";
import { Application } from "../types"; // ✅ import the Application type

export default function StatusPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { applications, loading } = useSelector(
    (state: RootState) => state.jobSeeker,
  );

  useEffect(() => {
    dispatch(fetchApplications());
  }, [dispatch]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Accepted":
        return <CheckCircle className="text-green-500" size={18} />;
      case "Interview":
        return <Calendar className="text-blue-500" size={18} />;
      case "Rejected":
        return <XCircle className="text-red-500" size={18} />;
      default:
        return <Clock className="text-yellow-500" size={18} />;
    }
  };

  const getStatusBadgeVariant = (
    status: string,
  ): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case "Accepted":
        return "default";
      case "Interview":
        return "secondary";
      case "Rejected":
        return "destructive";
      default:
        return "outline";
    }
  };

  // Mock interviews (replace with real data later)
  const upcomingInterviews = [
    {
      id: 1,
      jobTitle: "Full Stack Engineer",
      company: "StartupX",
      date: "2025-05-22",
      time: "10:00 AM",
      type: "Technical Round",
    },
    {
      id: 2,
      jobTitle: "UI/UX Designer",
      company: "CreativeStudio",
      date: "2025-05-25",
      time: "2:00 PM",
      type: "HR Round",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Application Status & Interviews</h1>
        <p className="text-gray-500">
          Track your progress and upcoming meetings
        </p>
      </div>

      <Tabs defaultValue="applications" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="applications">My Applications</TabsTrigger>
          <TabsTrigger value="interviews">Upcoming Interviews</TabsTrigger>
        </TabsList>

        <TabsContent value="applications" className="space-y-4 mt-4">
          {loading && <p>Loading...</p>}
          {!loading && applications.length === 0 && (
            <Card>
              <CardContent className="py-8 text-center text-gray-500">
                You haven't applied to any jobs yet.
              </CardContent>
            </Card>
          )}
          {applications.map(
            (
              app: Application, // ✅ typed as Application
            ) => (
              <Card key={app.id}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{app.jobTitle}</CardTitle>
                    <Badge variant={getStatusBadgeVariant(app.status)}>
                      {getStatusIcon(app.status)} {app.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500">
                    Applied on: {new Date(app.appliedAt).toLocaleDateString()}
                  </p>
                  {app.status === "Interview" && (
                    <div className="mt-2 p-2 bg-blue-50 rounded-md">
                      <p className="text-sm text-blue-700">
                        📅 Interview scheduled. Check your email for details.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ),
          )}
        </TabsContent>

        <TabsContent value="interviews" className="space-y-4 mt-4">
          {upcomingInterviews.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-gray-500">
                No upcoming interviews.
              </CardContent>
            </Card>
          ) : (
            upcomingInterviews.map((interview) => (
              <Card key={interview.id}>
                <CardHeader>
                  <CardTitle>{interview.jobTitle}</CardTitle>
                  <p className="text-sm text-gray-500">{interview.company}</p>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-4">
                    <div className="flex items-center gap-2">
                      <Calendar size={16} className="text-gray-400" />
                      <span>
                        {interview.date} at {interview.time}
                      </span>
                    </div>
                    <Badge variant="outline">{interview.type}</Badge>
                  </div>
                  <Button className="mt-3" size="sm" variant="outline">
                    Add to Calendar
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
