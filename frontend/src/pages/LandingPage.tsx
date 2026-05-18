import { Link } from "react-router-dom";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-linear-to-r from-blue-50 to-blue-100 flex flex-col items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <h1 className="text-4xl font-bold text-blue-600 mb-2">JobPortal</h1>
        <p className="text-gray-600 mb-8">Find your next job, faster.</p>
        <div className="space-y-3">
          <Link
            to="/login"
            className="block w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Sign In
          </Link>
          <Link
            to="/register"
            className="block w-full bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300 transition"
          >
            Create Account
          </Link>
        </div>
        <p className="text-xs text-gray-500 mt-6">
          By continuing, you agree to our Terms and Privacy Policy.
        </p>
      </div>
    </div>
  );
}
