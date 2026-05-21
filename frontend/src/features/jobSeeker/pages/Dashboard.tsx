// features/jobSeeker/pages/Dashboard.tsx
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import {
  Mail,
  Search,
  User,
  LogOut,
  LayoutDashboard,
  Briefcase,
  Bookmark,
  FileText,
  Calendar,
  TrendingUp,
  Settings,
  Clock,
  ChevronRight,
  Users,
  Home,
} from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import { Input } from "../../../components/ui/input";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../../components/ui/avatar";
import { Separator } from "../../../components/ui/separator";
import { Progress } from "../../../components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu";
import { RootState, AppDispatch } from "../../../store";
import {
  fetchJobs,
  fetchBookmarks,
  fetchApplications,
} from "../jobSeekerSlice";
import { Job, Application, Bookmark as BookmarkType } from "../types";

// Mock data (for messages, saved jobs preview, activity timeline)
interface MockSavedJob {
  id: number;
  title: string;
  company: string;
  savedAt: string;
}

interface MockMessage {
  id: number;
  from: string;
  message: string;
  time: string;
  unread: boolean;
}

interface MockActivity {
  id: number;
  action: string;
  date: string;
  type: string;
}

const mockSavedJobsPreview: MockSavedJob[] = [
  {
    id: 1,
    title: "DevOps Engineer",
    company: "CloudNet",
    savedAt: "2025-05-14",
  },
  {
    id: 2,
    title: "Backend Developer",
    company: "DataSys",
    savedAt: "2025-05-12",
  },
];

const mockMessages: MockMessage[] = [
  {
    id: 1,
    from: "TechCorp HR",
    message: "We would like to schedule an interview...",
    time: "2h ago",
    unread: true,
  },
  {
    id: 2,
    from: "StartupX",
    message: "Your application has been shortlisted.",
    time: "1d ago",
    unread: false,
  },
];

const mockActivityTimeline: MockActivity[] = [
  {
    id: 1,
    action: "Applied for Senior Frontend Developer",
    date: "2025-05-15",
    type: "application",
  },
  {
    id: 2,
    action: "Saved Backend Developer job",
    date: "2025-05-14",
    type: "save",
  },
  { id: 3, action: "Updated resume", date: "2025-05-13", type: "profile" },
];

export default function JobSeekerDashboard() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { jobs, bookmarks, applications } = useSelector(
    (state: RootState) => state.jobSeeker,
  );
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    dispatch(fetchJobs({}));
    dispatch(fetchBookmarks());
    dispatch(fetchApplications());
  }, [dispatch]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(fetchJobs({ keyword: searchTerm }));
    navigate("/jobs");
  };

  // ===== REAL STATISTICS =====
  const applicationsSent = applications.length;
  const interviews = applications.filter(
    (app: Application) => app.status === "Interview",
  ).length;
  const jobMatches = jobs.length;
  // Profile views – you can replace with a real endpoint later
  const profileViews = 89; // placeholder

  // Profile completion (example – adjust based on your profile slice)
  const profileCompletion = 87; // placeholder

  const navItems = [
    { name: "Home", icon: <Home size={20} />, path: "/" },
    {
      name: "Dashboard",
      icon: <LayoutDashboard size={20} />,
      path: "/dashboard",
    },
    { name: "Find Jobs", icon: <Search size={20} />, path: "/jobs" },
    { name: "Saved Jobs", icon: <Bookmark size={20} />, path: "/bookmarks" },
    {
      name: "My Applications",
      icon: <FileText size={20} />,
      path: "/my-applications",
    },
    { name: "Settings", icon: <Settings size={20} />, path: "/settings" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-linear-to-r from-purple-500 to-indigo-600 text-white shadow-md sticky top-0 z-20">
        <div className="flex items-center justify-between px-4 py-3 md:px-6">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20 md:hidden"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <LayoutDashboard size={20} />
            </Button>
            <Link to="/" className="flex items-center gap-2">
              <Briefcase className="text-white" size={24} />
              <span className="font-bold text-lg hidden sm:inline">
                JobPortal
              </span>
            </Link>
            {/* Dashboard link in navbar */}
            <Link to="/dashboard">
              <Button
                variant="ghost"
                className="text-white hover:bg-white/20 hidden sm:flex"
              >
                Dashboard
              </Button>
            </Link>
          </div>

          <form
            onSubmit={handleSearch}
            className="hidden md:flex flex-1 max-w-md mx-4"
          >
            <div className="relative w-full">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={16}
              />
              <Input
                type="text"
                placeholder="Search jobs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 py-1 h-9 text-sm bg-white/20 border-0 placeholder:text-white/70 text-white focus:ring-2 focus:ring-white/50"
              />
            </div>
          </form>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20"
            >
              <Mail size={18} />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center gap-2 px-2 text-white hover:bg-white/20"
                >
                  <Avatar className="h-7 w-7 border-2 border-white">
                    <AvatarImage src="https://github.com/shadcn.png" />
                    <AvatarFallback>JD</AvatarFallback>
                  </Avatar>
                  <span className="hidden md:inline text-sm">John</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/profile")}>
                  <User className="mr-2 h-4 w-4" /> Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/settings")}>
                  <Settings className="mr-2 h-4 w-4" /> Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => {
                    localStorage.removeItem("token");
                    navigate("/login");
                  }}
                >
                  <LogOut className="mr-2 h-4 w-4" /> Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <div className="flex">
        <aside
          className={`
          fixed md:sticky top-16 z-10 h-[calc(100vh-4rem)] bg-white shadow-sm
          transition-transform duration-300 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
          w-64 shrink-0 overflow-y-auto
        `}
        >
          <nav className="p-4 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                onClick={() => setSidebarOpen(false)}
              >
                {item.icon}
                <span>{item.name}</span>
              </Link>
            ))}
            <Separator className="my-4" />
            <button
              onClick={() => {
                localStorage.removeItem("token");
                navigate("/login");
              }}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 w-full"
            >
              <LogOut size={20} />
              <span>Logout</span>
            </button>
          </nav>
        </aside>

        <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
          {/* Quick Statistics – now using real data */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl p-5 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Applications Sent</p>
                <p className="text-2xl font-bold">{applicationsSent}</p>
              </div>
              <FileText className="text-purple-500" size={32} />
            </div>
            <div className="bg-white rounded-xl p-5 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Interviews</p>
                <p className="text-2xl font-bold">{interviews}</p>
              </div>
              <Calendar className="text-green-500" size={32} />
            </div>
            <div className="bg-white rounded-xl p-5 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Job Matches</p>
                <p className="text-2xl font-bold">{jobMatches}</p>
              </div>
              <TrendingUp className="text-blue-500" size={32} />
            </div>
            <div className="bg-white rounded-xl p-5 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Profile Views</p>
                <p className="text-2xl font-bold">{profileViews}</p>
              </div>
              <Users className="text-orange-500" size={32} />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left column – Recommended Jobs and Recent Applications */}
            <div className="lg:col-span-2 space-y-6">
              {/* Recommended Jobs */}
              <div className="bg-white rounded-xl shadow-sm p-5">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold">Recommended for You</h2>
                  <Button
                    variant="link"
                    onClick={() => navigate("/jobs")}
                    className="text-purple-600"
                  >
                    See all
                  </Button>
                </div>
                <div className="space-y-4">
                  {jobs.slice(0, 3).map((job: Job) => (
                    <div
                      key={job.id}
                      className="flex justify-between items-start border-b border-gray-100 pb-4 last:border-0"
                    >
                      <div>
                        <h3 className="font-medium">{job.title}</h3>
                        <p className="text-sm text-gray-500">
                          {job.company} • {job.location}
                        </p>
                        <div className="flex gap-2 mt-1">
                          <Badge variant="outline" className="bg-gray-50">
                            {job.employmentType}
                          </Badge>
                          <Badge variant="outline" className="bg-gray-50">
                            {job.salaryRange || "Negotiable"}
                          </Badge>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-full"
                        onClick={() => navigate(`/jobs/${job.id}`)}
                      >
                        View
                      </Button>
                    </div>
                  ))}
                  {jobs.length === 0 && (
                    <p className="text-gray-500">No recommended jobs yet.</p>
                  )}
                </div>
              </div>

              {/* Recent Applications */}
              <div className="bg-white rounded-xl shadow-sm p-5">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold">Recent Applications</h2>
                  <Button
                    variant="link"
                    onClick={() => navigate("/my-applications")}
                    className="text-purple-600"
                  >
                    View all
                  </Button>
                </div>
                <div className="space-y-3">
                  {applications.length === 0 && (
                    <p className="text-gray-500">No applications yet.</p>
                  )}
                  {applications.slice(0, 3).map((app: Application) => (
                    <div
                      key={app.id}
                      className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0"
                    >
                      <div>
                        <p className="font-medium">{app.jobTitle}</p>
                      </div>
                      <div className="text-right">
                        <Badge
                          variant={
                            app.status === "Interview"
                              ? "default"
                              : app.status === "Rejected"
                                ? "destructive"
                                : "secondary"
                          }
                        >
                          {app.status}
                        </Badge>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(app.appliedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right column – Saved Jobs, Messages, Profile Completion, Activity */}
            <div className="space-y-6">
              {/* Saved Jobs Preview */}
              <div className="bg-white rounded-xl shadow-sm p-5">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold">Saved Jobs</h2>
                  <Button
                    variant="link"
                    onClick={() => navigate("/bookmarks")}
                    className="text-purple-600"
                  >
                    View all
                  </Button>
                </div>
                {bookmarks.length === 0 && mockSavedJobsPreview.length === 0 ? (
                  <p className="text-gray-500">No saved jobs.</p>
                ) : (
                  <div className="space-y-2">
                    {(bookmarks.length > 0
                      ? bookmarks.slice(0, 2)
                      : mockSavedJobsPreview
                    ).map((item, idx) => {
                      const title =
                        "title" in item
                          ? item.title
                          : (item as BookmarkType).jobId;
                      return (
                        <div
                          key={idx}
                          className="flex justify-between items-center py-2"
                        >
                          <span className="text-sm">{title}</span>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-red-500 hover:text-red-700"
                          >
                            Remove
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Messages Preview */}
              <div className="bg-white rounded-xl shadow-sm p-5">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold">Messages</h2>
                  <Button
                    variant="link"
                    onClick={() => navigate("/messages")}
                    className="text-purple-600"
                  >
                    See all
                  </Button>
                </div>
                <div className="space-y-3">
                  {mockMessages.map((msg) => (
                    <div key={msg.id} className="flex gap-3 items-start">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>{msg.from.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{msg.from}</p>
                        <p className="text-xs text-gray-500 truncate">
                          {msg.message}
                        </p>
                      </div>
                      {msg.unread && (
                        <Badge className="h-2 w-2 rounded-full p-0 bg-blue-500" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Profile Completion */}
              <div className="bg-white rounded-xl shadow-sm p-5">
                <h2 className="text-lg font-semibold mb-3">
                  Profile Completion
                </h2>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Complete your profile to get more matches</span>
                    <span>{profileCompletion}%</span>
                  </div>
                  <Progress value={profileCompletion} className="h-2" />
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full mt-3 rounded-full"
                    onClick={() => navigate("/profile")}
                  >
                    Complete Profile <ChevronRight size={14} className="ml-1" />
                  </Button>
                </div>
              </div>

              {/* Activity Timeline */}
              <div className="bg-white rounded-xl shadow-sm p-5">
                <h2 className="text-lg font-semibold mb-3">Recent Activity</h2>
                <div className="space-y-3">
                  {mockActivityTimeline.map((activity) => (
                    <div key={activity.id} className="flex gap-3 items-start">
                      <Clock size={16} className="text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm">{activity.action}</p>
                        <p className="text-xs text-gray-400">{activity.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
