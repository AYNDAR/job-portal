import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { register } from "../../store/authSlice";
import { Link, useNavigate } from "react-router-dom";

const registerSchema = z
  .object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
    userType: z.enum(["Job Seeker", "Employer"]),
    fullName: z.string().optional(),
    companyName: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export default function Register() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isLoading, error } = useAppSelector((state) => state.auth);

  const {
    register: registerField,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { userType: "Job Seeker" },
  });

  const userType = watch("userType");

  const onSubmit = async (data: RegisterFormData) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { confirmPassword, ...registerData } = data;
    try {
      const result = await dispatch(register(registerData)).unwrap();
      if (result.token && result.user) {
        if (result.user.userType === "Employer") {
          navigate("/employer/dashboard");
        } else {
          navigate("/jobs");
        }
      }
    } catch (err) {
      // error is already handled in the slice
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center mb-6">
          Create an account
        </h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Account Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Account Type
            </label>
            <div className="mt-1 flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  value="Job Seeker"
                  {...registerField("userType")}
                />{" "}
                Job Seeker
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  value="Employer"
                  {...registerField("userType")}
                />{" "}
                Employer
              </label>
            </div>
          </div>
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              {...registerField("email")}
              type="email"
              className="mt-1 w-full border rounded-md p-2"
            />
            {errors.email && (
              <p className="text-red-500 text-sm">{errors.email.message}</p>
            )}
          </div>
          {/* Conditional fields */}
          {userType === "Job Seeker" && (
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <input
                {...registerField("fullName")}
                className="mt-1 w-full border rounded-md p-2"
              />
            </div>
          )}
          {userType === "Employer" && (
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Company Name
              </label>
              <input
                {...registerField("companyName")}
                className="mt-1 w-full border rounded-md p-2"
              />
            </div>
          )}
          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              {...registerField("password")}
              type="password"
              className="mt-1 w-full border rounded-md p-2"
            />
            {errors.password && (
              <p className="text-red-500 text-sm">{errors.password.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Confirm Password
            </label>
            <input
              {...registerField("confirmPassword")}
              type="password"
              className="mt-1 w-full border rounded-md p-2"
            />
            {errors.confirmPassword && (
              <p className="text-red-500 text-sm">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>
          {error && (
            <div className="text-red-500 text-sm text-center">{error}</div>
          )}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? "Creating account..." : "Sign up"}
          </button>
        </form>
        <p className="text-center text-sm mt-4">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-600 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
