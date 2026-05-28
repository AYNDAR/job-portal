import { Link, useNavigate } from "react-router-dom";
import { Home, ArrowLeft } from "lucide-react";

interface Props {
  showBack?: boolean; // show "← Back" button alongside Home
  className?: string;
}

export default function BackToHome({ showBack = true, className = "" }: Props) {
  const navigate = useNavigate();
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {showBack && (
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm text-gray-600 border border-gray-200 bg-white hover:bg-gray-50 px-3 py-2 rounded-xl transition font-medium"
        >
          <ArrowLeft size={14} /> Back
        </button>
      )}
      <Link
        to="/"
        className="flex items-center gap-1.5 text-sm text-gray-600 border border-gray-200 bg-white hover:bg-gray-50 px-3 py-2 rounded-xl transition font-medium"
      >
        <Home size={14} /> Home
      </Link>
    </div>
  );
}
