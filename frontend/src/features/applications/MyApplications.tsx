import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  Calendar,
  Briefcase,
  Building,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react";
import { RootState, AppDispatch } from "../../store";
import { fetchApplications } from "../jobSeeker/jobSeekerSlice";
import { Application } from "../jobSeeker/types";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Skeleton } from "../../components/ui/skeleton";

export default function MyApplications() {
  const dispatch = useDispatch<AppDispatch>();
  const { applications, loading } = useSelector(
    (state: RootState) => state.jobSeeker,
  );

  useEffect(() => {
    dispatch(fetchApplications());
  }, [dispatch]);

  const getStatusIcon = (status: Application["status"]) => {
    switch (status) {
      case "Accepted":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "Interview":
        return <Calendar className="h-4 w-4 text-blue-500" />;
      case "Rejected":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusBadgeVariant = (
    status: Application["status"],
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

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-2xl font-bold mb-6">My Applications</h1>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (applications.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl text-center">
        <h1 className="text-2xl font-bold mb-4">My Applications</h1>
        <Card>
          <CardContent className="py-12">
            <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">
              You haven't applied to any jobs yet.
            </p>
            <Button asChild>
              <Link to="/jobs">Browse Jobs</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Applications</h1>
        <p className="text-sm text-gray-500">{applications.length} total</p>
      </div>

      <div className="space-y-4">
        {applications.map((app: Application) => (
          <Card key={app.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl">{app.jobTitle}</CardTitle>
                  <div className="flex items-center gap-2 text-gray-500 text-sm mt-1">
                    <Building className="h-4 w-4" />
                    <span>Company name not yet available</span>
                  </div>
                </div>
                <Badge
                  variant={getStatusBadgeVariant(app.status)}
                  className="flex items-center gap-1"
                >
                  {getStatusIcon(app.status)} {app.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-500">
                  Applied on: {new Date(app.appliedAt).toLocaleDateString()}
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link to={`/jobs/${app.jobId}`}>View Job</Link>
                </Button>
              </div>
              {app.status === "Interview" && (
                <div className="mt-3 p-3 bg-blue-50 rounded-md text-sm text-blue-700">
                  📅 Interview scheduled. Check your email for details.
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
