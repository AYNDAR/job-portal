/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import api from "../../services/api";
import {
  Mail,
  Lock,
  ArrowLeft,
  Eye,
  EyeOff,
  Briefcase,
  CheckCircle,
  Loader2,
} from "lucide-react";

type Step = "login" | "forgot_email" | "forgot_reset" | "forgot_done";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from || null;

  // ── Login state ───────────────────────────────────────────
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // ── Forgot password state ─────────────────────────────────
  const [step, setStep] = useState<Step>("login");
  const [fpEmail, setFpEmail] = useState("");
  const [fpCode, setFpCode] = useState("");
  const [fpNewPw, setFpNewPw] = useState("");
  const [fpConfirmPw, setFpConfirmPw] = useState("");
  const [fpShowPw, setFpShowPw] = useState(false);
  const [fpLoading, setFpLoading] = useState(false);
  const [fpError, setFpError] = useState("");
  const [fpMsg, setFpMsg] = useState("");

  // ── Login submit ──────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const { data } = await api.post("/auth/login", { email, password });
      const { token, user } = data;
      if (!token || !user) throw new Error("Invalid response");

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      // Extract user type (handle both camelCase and snake_case)
      const userType = user.userType || user.user_type || user.role || "";

      // If the user was trying to apply for a job and is a job seeker, go back there
      if (from && userType === "Job Seeker") {
        navigate(from, { replace: true });
        return;
      }

      // Role-based default redirects
      if (userType === "Employer") {
        navigate("/employer/dashboard", { replace: true });
      } else if (userType === "Admin") {
        navigate("/admin", { replace: true });
      } else if (userType === "Super Admin") {
        navigate("/super-admin", { replace: true });
      } else {
        // Job Seeker (or unknown)
        navigate("/dashboard", { replace: true });
      }
    } catch (err: any) {
      const serverMsg =
        err.response?.data?.error || err.response?.data?.message;
      setError(serverMsg || "Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── Forgot: send code (step 1) ────────────────────────────
  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setFpLoading(true);
    setFpError("");
    setFpMsg("");
    try {
      await api.post("/auth/forgot-password", { email: fpEmail });
      setFpMsg(`A 6-digit code was sent to ${fpEmail}`);
      setStep("forgot_reset");
    } catch (err: any) {
      setFpError(err.response?.data?.error || "Could not send code.");
    } finally {
      setFpLoading(false);
    }
  };

  // ── Forgot: reset password with code (step 2) ─────────────
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setFpError("");
    if (fpNewPw.length < 8) {
      setFpError("Password must be at least 8 characters.");
      return;
    }
    if (fpNewPw !== fpConfirmPw) {
      setFpError("Passwords do not match.");
      return;
    }
    setFpLoading(true);
    try {
      await api.post("/auth/reset-password", {
        email: fpEmail,
        code: fpCode,
        newPassword: fpNewPw,
      });
      setStep("forgot_done");
    } catch (err: any) {
      setFpError(
        err.response?.data?.error || "Reset failed. Please try again.",
      );
    } finally {
      setFpLoading(false);
    }
  };

  const handleResend = async () => {
    setFpLoading(true);
    setFpError("");
    try {
      await api.post("/auth/forgot-password", { email: fpEmail });
      setFpMsg("A new code was sent to your email.");
    } catch {
      setFpError("Could not resend. Please try again.");
    } finally {
      setFpLoading(false);
    }
  };

  // ── UI Card wrapper ───────────────────────────────────────
  const Card = ({ children }: { children: React.ReactNode }) => (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
            <Briefcase size={18} className="text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900">JobPortal</span>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          {children}
        </div>
        <p className="text-center text-xs text-gray-400 mt-6">
          © {new Date().getFullYear()} JobPortal. All rights reserved.
        </p>
      </div>
    </div>
  );

  // ─── STEP: Login ──────────────────────────────────────────
  if (step === "login")
    return (
      <Card>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Welcome back</h2>
        <p className="text-sm text-gray-500 mb-6">Sign in to your account</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">
              Email
            </label>
            <div className="relative">
              <Mail
                size={15}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>
          <div>
            <div className="flex justify-between mb-1.5">
              <label className="text-xs font-medium text-gray-700">
                Password
              </label>
              <button
                type="button"
                onClick={() => {
                  setStep("forgot_email");
                  setFpEmail(email);
                }}
                className="text-xs text-blue-600 hover:underline"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <Lock
                size={15}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type={showPw ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-10 pr-10 py-2.5 text-sm border border-gray-200 rounded-xl"
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              >
                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>
          {error && (
            <div className="bg-red-50 text-red-600 text-sm rounded-xl px-4 py-3">
              {error}
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white font-semibold py-2.5 rounded-xl flex items-center justify-center gap-2"
          >
            {loading ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              "Sign In"
            )}
          </button>
        </form>
        <div className="mt-5 pt-5 border-t text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{" "}
            <Link to="/register" className="text-blue-600 font-medium">
              Create account
            </Link>
          </p>
        </div>
      </Card>
    );

  // ─── STEP: Forgot email ───────────────────────────────────
  if (step === "forgot_email")
    return (
      <Card>
        <button
          onClick={() => setStep("login")}
          className="flex items-center gap-1.5 text-sm text-gray-500 mb-6"
        >
          <ArrowLeft size={15} /> Back
        </button>
        <h2 className="text-xl font-bold text-gray-900 mb-1">
          Forgot password?
        </h2>
        <p className="text-sm text-gray-500 mb-6">
          Enter your email to receive a code.
        </p>
        <form onSubmit={handleSendCode} className="space-y-4">
          <div className="relative">
            <Mail
              size={15}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="email"
              value={fpEmail}
              onChange={(e) => setFpEmail(e.target.value)}
              required
              className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl"
            />
          </div>
          {fpError && (
            <div className="bg-red-50 text-red-600 text-sm rounded-xl px-4 py-3">
              {fpError}
            </div>
          )}
          {fpMsg && (
            <div className="bg-green-50 text-green-700 text-sm rounded-xl px-4 py-3">
              {fpMsg}
            </div>
          )}
          <button
            type="submit"
            disabled={fpLoading}
            className="w-full bg-blue-600 text-white font-semibold py-2.5 rounded-xl"
          >
            {fpLoading ? "Sending..." : "Send Code"}
          </button>
        </form>
      </Card>
    );

  // ─── STEP: Reset password (code + new password) ───────────
  if (step === "forgot_reset")
    return (
      <Card>
        <button
          onClick={() => setStep("forgot_email")}
          className="flex items-center gap-1.5 text-sm text-gray-500 mb-6"
        >
          <ArrowLeft size={15} /> Change email
        </button>
        <h2 className="text-xl font-bold text-gray-900 mb-1">Reset password</h2>
        <p className="text-sm text-gray-500 mb-6">
          Enter the code and your new password.
        </p>
        <form onSubmit={handleResetPassword} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">
              Verification Code
            </label>
            <input
              type="text"
              value={fpCode}
              onChange={(e) => setFpCode(e.target.value.slice(0, 6))}
              required
              placeholder="6‑digit code"
              className="w-full text-center text-2xl tracking-[0.5em] py-3 border border-gray-200 rounded-xl"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">
              New Password
            </label>
            <div className="relative">
              <input
                type={fpShowPw ? "text" : "password"}
                value={fpNewPw}
                onChange={(e) => setFpNewPw(e.target.value)}
                required
                minLength={8}
                className="w-full pr-10 py-2.5 text-sm border border-gray-200 rounded-xl"
              />
              <button
                type="button"
                onClick={() => setFpShowPw(!fpShowPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              >
                {fpShowPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {fpNewPw && (
              <div className="mt-1">
                <div className="flex gap-1">
                  {[1, 2, 3, 4].map((n) => (
                    <div
                      key={n}
                      className={`h-1 flex-1 rounded-full ${
                        fpNewPw.length >= n * 3
                          ? n <= 1
                            ? "bg-red-400"
                            : n <= 2
                              ? "bg-amber-400"
                              : n <= 3
                                ? "bg-blue-400"
                                : "bg-green-400"
                          : "bg-gray-100"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  {fpNewPw.length < 6
                    ? "Too short"
                    : fpNewPw.length < 9
                      ? "Weak"
                      : fpNewPw.length < 12
                        ? "Good"
                        : "Strong"}
                </p>
              </div>
            )}
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">
              Confirm Password
            </label>
            <input
              type="password"
              value={fpConfirmPw}
              onChange={(e) => setFpConfirmPw(e.target.value)}
              required
              className={`w-full py-2.5 text-sm border rounded-xl ${
                fpConfirmPw && fpConfirmPw !== fpNewPw
                  ? "border-red-300 bg-red-50"
                  : "border-gray-200"
              }`}
            />
            {fpConfirmPw && fpConfirmPw !== fpNewPw && (
              <p className="text-xs text-red-500 mt-1">
                Passwords do not match
              </p>
            )}
          </div>
          {fpError && (
            <div className="bg-red-50 text-red-600 text-sm rounded-xl px-4 py-3">
              {fpError}
            </div>
          )}
          <button
            type="submit"
            disabled={
              fpLoading || fpNewPw !== fpConfirmPw || fpNewPw.length < 8
            }
            className="w-full bg-blue-600 text-white font-semibold py-2.5 rounded-xl"
          >
            {fpLoading ? "Resetting..." : "Reset Password"}
          </button>
        </form>
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            Didn't receive the code?{" "}
            <button
              onClick={handleResend}
              className="text-blue-600 hover:underline"
            >
              Resend code
            </button>
          </p>
        </div>
      </Card>
    );

  // ─── STEP: Done ───────────────────────────────────────────
  if (step === "forgot_done")
    return (
      <Card>
        <div className="text-center">
          <CheckCircle size={48} className="text-green-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Password reset!
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            You can now sign in with your new password.
          </p>
          <button
            onClick={() => {
              setStep("login");
              setFpCode("");
              setFpNewPw("");
              setFpConfirmPw("");
            }}
            className="w-full bg-blue-600 text-white font-semibold py-2.5 rounded-xl"
          >
            Back to Sign In
          </button>
        </div>
      </Card>
    );

  return null;
}
