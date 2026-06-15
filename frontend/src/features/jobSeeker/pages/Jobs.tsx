import { Link } from "react-router-dom";
import { Button } from "../../../components/ui/button";

export default function Jobs() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Find Jobs</h1>
      <p className="text-gray-500">
        Use our advanced search to find your next opportunity.
      </p>
      <Link to="/jobs">
        <Button>Go to Job Search →</Button>
      </Link>
    </div>
  );
}
