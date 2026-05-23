/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import {
  Briefcase,
  Building,
  FileText,
  DollarSign,
  Settings2,
  CheckCircle,
  ArrowLeft,
  ArrowRight,
  X,
  Plus,
  MapPin,
  Calendar,
  AlertCircle,
  ShieldCheck,
  Loader2,
} from "lucide-react";

interface FormData {
  title: string;
  category: string;
  jobType: string;
  workplaceType: string;
  experienceLevel: string;
  location: string;
  vacancies: number;
  deadline: string;
  companyName: string;
  companyWebsite: string;
  companySize: string;
  companyDescription: string;
  companyIndustry: string;
  jobDescription: string;
  responsibilities: string;
  benefits: string;
  requiredSkills: string[];
  niceToHaveSkills: string[];
  educationLevel: string;
  experienceRequired: string;
  languages: string;
  certifications: string;
  currency: string;
  minSalary: number;
  maxSalary: number;
  salaryPeriod: string;
  salaryNegotiable: boolean;
  receiveBy: string;
  screeningQuestions: string[];
  resumeRequired: boolean;
  coverLetterRequired: boolean;
  portfolioRequired: boolean;
}

const STEPS = [
  { id: 1, label: "Job Info", icon: Briefcase },
  { id: 2, label: "Company", icon: Building },
  { id: 3, label: "Details", icon: FileText },
  { id: 4, label: "Salary", icon: DollarSign },
  { id: 5, label: "Screening", icon: Settings2 },
  { id: 6, label: "Review", icon: CheckCircle },
];

const inp =
  "w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition bg-white placeholder:text-gray-300";
const sel = inp + " appearance-none cursor-pointer";

function Field({
  label,
  required,
  hint,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-gray-600">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-gray-400">{hint}</p>}
      {error && (
        <p className="text-xs text-red-500 flex items-center gap-1">
          <AlertCircle size={11} />
          {error}
        </p>
      )}
    </div>
  );
}

function TagPill({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-xs font-medium">
      {label}
      <button
        type="button"
        onClick={onRemove}
        className="hover:text-red-500 transition"
      >
        <X size={11} />
      </button>
    </span>
  );
}

export default function PostJobForm() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [skillInput, setSkillInput] = useState("");
  const [niceInput, setNiceInput] = useState("");
  const [sqInput, setSqInput] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const userRaw = localStorage.getItem("user");
  const user = userRaw ? JSON.parse(userRaw) : null;

  const [form, setForm] = useState<FormData>({
    title: "",
    category: "",
    jobType: "",
    workplaceType: "",
    experienceLevel: "",
    location: "",
    vacancies: 1,
    deadline: "",
    companyName: user?.companyName ?? "",
    companyWebsite: "",
    companySize: "",
    companyDescription: "",
    companyIndustry: "",
    jobDescription: "",
    responsibilities: "",
    benefits: "",
    requiredSkills: [],
    niceToHaveSkills: [],
    educationLevel: "",
    experienceRequired: "",
    languages: "",
    certifications: "",
    currency: "USD",
    minSalary: 0,
    maxSalary: 0,
    salaryPeriod: "per year",
    salaryNegotiable: false,
    receiveBy: "dashboard",
    screeningQuestions: [],
    resumeRequired: true,
    coverLetterRequired: false,
    portfolioRequired: false,
  });

  const set = <K extends keyof FormData>(k: K, v: FormData[K]) =>
    setForm((p) => ({ ...p, [k]: v }));

  const addTag = (
    field: "requiredSkills" | "niceToHaveSkills" | "screeningQuestions",
    val: string,
  ) => {
    const trimmed = val.trim();
    if (!trimmed || (form[field] as string[]).includes(trimmed)) return;
    set(field, [...(form[field] as string[]), trimmed]);
  };

  const removeTag = (
    field: "requiredSkills" | "niceToHaveSkills" | "screeningQuestions",
    val: string,
  ) =>
    set(
      field,
      (form[field] as string[]).filter((s) => s !== val),
    );

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (step === 1) {
      if (!form.title) e.title = "Required";
      if (!form.category) e.category = "Required";
      if (!form.jobType) e.jobType = "Required";
      if (!form.workplaceType) e.workplaceType = "Required";
      if (!form.experienceLevel) e.experienceLevel = "Required";
      if (!form.location) e.location = "Required";
      if (!form.deadline) e.deadline = "Required";
    }
    if (step === 2) {
      if (!form.companyName) e.companyName = "Required";
      if (!form.companyDescription) e.companyDescription = "Required";
      if (!form.companyIndustry) e.companyIndustry = "Required";
    }
    if (step === 3) {
      if (!form.jobDescription || form.jobDescription.length < 50)
        e.jobDescription = "Minimum 50 characters";
      if (form.requiredSkills.length === 0)
        e.requiredSkills = "Add at least one skill";
      if (!form.educationLevel) e.educationLevel = "Required";
      if (!form.experienceRequired) e.experienceRequired = "Required";
    }
    if (step === 4) {
      if (form.maxSalary > 0 && form.minSalary > form.maxSalary)
        e.salary = "Minimum salary cannot exceed maximum";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => {
    if (validate()) setStep((s) => Math.min(s + 1, 6));
  };
  const prev = () => setStep((s) => Math.max(s - 1, 1));

  const submit = async () => {
    setLoading(true);
    setError("");
    try {
      await api.post("/employer/jobs", {
        title: form.title,
        description: form.jobDescription,
        industry_id: 1,
        employment_type_id:
          [
            "Full-time",
            "Part-time",
            "Contract",
            "Internship",
            "Temporary",
          ].indexOf(form.jobType) + 1,
        salary_range: form.salaryNegotiable
          ? "Negotiable"
          : `${form.currency} ${form.minSalary.toLocaleString()} – ${form.maxSalary.toLocaleString()} ${form.salaryPeriod}`,
        jobSite: form.workplaceType,
        experienceLevel: form.experienceLevel,
        educationLevel: form.educationLevel,
        genderPreference: "Any",
        location: form.location,
        vacancies: form.vacancies,
        deadline: form.deadline,
        requiredSkills: form.requiredSkills,
        benefits: form.benefits,
      });
      setSuccess(true);
      setTimeout(() => navigate("/employer/dashboard"), 2500);
    } catch (e: any) {
      setError(
        e.response?.data?.error ?? "Failed to post job. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-2xl mx-auto flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-5">
          <CheckCircle size={32} className="text-green-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          Job posted successfully!
        </h2>
        <p className="text-gray-500 text-sm">
          Redirecting to your dashboard...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-0">
      {/* Hero */}
      <div className="bg-blue-600 rounded-t-2xl px-7 py-5 flex items-center gap-4">
        <div className="w-11 h-11 bg-white/15 rounded-xl flex items-center justify-center shrink-0">
          <Briefcase size={22} className="text-white" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-white">Post a new job</h2>
          <p className="text-xs text-blue-200 mt-0.5">
            Step {step} of {STEPS.length} — {STEPS[step - 1].label}
          </p>
        </div>
        <div className="ml-auto flex gap-1.5">
          {STEPS.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setStep(s.id)}
              className={`h-1.5 rounded-full transition-all ${step === s.id ? "w-6 bg-white" : step > s.id ? "w-3 bg-white/60" : "w-3 bg-white/20"}`}
            />
          ))}
        </div>
      </div>

      {/* Step pills */}
      <div className="bg-white border-x border-gray-100 px-7 py-3 flex gap-1.5 overflow-x-auto">
        {STEPS.map((s) => {
          const Icon = s.icon;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => setStep(s.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border whitespace-nowrap transition ${
                step === s.id
                  ? "bg-blue-50 border-blue-300 text-blue-700"
                  : step > s.id
                    ? "bg-green-50 border-green-200 text-green-700"
                    : "bg-gray-50 border-gray-200 text-gray-400"
              }`}
            >
              <span
                className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold ${
                  step === s.id
                    ? "bg-blue-600 text-white"
                    : step > s.id
                      ? "bg-green-600 text-white"
                      : "bg-gray-200 text-gray-500"
                }`}
              >
                {step > s.id ? "✓" : s.id}
              </span>
              {s.label}
            </button>
          );
        })}
      </div>

      {/* Body */}
      <div className="bg-white border border-t-0 border-gray-100 rounded-b-2xl px-7 py-6 shadow-sm">
        {error && (
          <div className="mb-5 flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm">
            <AlertCircle size={16} className="shrink-0" /> {error}
          </div>
        )}

        {/* ── STEP 1: Job Information ── */}
        {step === 1 && (
          <div className="space-y-5">
            <SectionTitle
              icon={<Briefcase size={15} />}
              label="Job Information"
            />
            <Field label="Job Title" required error={errors.title}>
              <input
                value={form.title}
                onChange={(e) => set("title", e.target.value)}
                placeholder="e.g. Senior Software Engineer"
                className={inp}
              />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Job Category" required error={errors.category}>
                <select
                  value={form.category}
                  onChange={(e) => set("category", e.target.value)}
                  className={sel}
                >
                  <option value="">Select category</option>
                  {[
                    "Technology",
                    "Marketing",
                    "Sales",
                    "Design",
                    "Finance",
                    "Healthcare",
                    "Education",
                    "Engineering",
                    "Legal",
                    "HR",
                  ].map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </Field>
              <Field label="Employment Type" required error={errors.jobType}>
                <select
                  value={form.jobType}
                  onChange={(e) => set("jobType", e.target.value)}
                  className={sel}
                >
                  <option value="">Select type</option>
                  {[
                    "Full-time",
                    "Part-time",
                    "Contract",
                    "Internship",
                    "Temporary",
                    "Freelance",
                  ].map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </Field>
              <Field
                label="Workplace Type"
                required
                error={errors.workplaceType}
              >
                <select
                  value={form.workplaceType}
                  onChange={(e) => set("workplaceType", e.target.value)}
                  className={sel}
                >
                  <option value="">Select workplace</option>
                  {["On-site", "Remote", "Hybrid"].map((w) => (
                    <option key={w}>{w}</option>
                  ))}
                </select>
              </Field>
              <Field
                label="Experience Level"
                required
                error={errors.experienceLevel}
              >
                <select
                  value={form.experienceLevel}
                  onChange={(e) => set("experienceLevel", e.target.value)}
                  className={sel}
                >
                  <option value="">Select level</option>
                  {[
                    "Internship",
                    "Entry level",
                    "Mid level",
                    "Senior level",
                    "Lead / Manager",
                    "Executive / Director",
                  ].map((l) => (
                    <option key={l}>{l}</option>
                  ))}
                </select>
              </Field>
              <Field label="Location" required error={errors.location}>
                <div className="relative">
                  <MapPin
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    value={form.location}
                    onChange={(e) => set("location", e.target.value)}
                    placeholder="City, Country or Remote"
                    className={inp + " pl-8"}
                  />
                </div>
              </Field>
              <Field label="Number of Vacancies">
                <input
                  type="number"
                  min={1}
                  value={form.vacancies}
                  onChange={(e) =>
                    set("vacancies", parseInt(e.target.value) || 1)
                  }
                  className={inp}
                />
              </Field>
              <Field
                label="Application Deadline"
                required
                error={errors.deadline}
              >
                <div className="relative">
                  <Calendar
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="date"
                    value={form.deadline}
                    onChange={(e) => set("deadline", e.target.value)}
                    className={inp + " pl-8"}
                  />
                </div>
              </Field>
            </div>
          </div>
        )}

        {/* ── STEP 2: Company Information ── */}
        {step === 2 && (
          <div className="space-y-5">
            <SectionTitle
              icon={<Building size={15} />}
              label="Company Information"
            />
            <div className="grid grid-cols-2 gap-4">
              <Field label="Company Name" required error={errors.companyName}>
                <input
                  value={form.companyName}
                  onChange={(e) => set("companyName", e.target.value)}
                  placeholder="e.g. Acme Corporation"
                  className={inp}
                />
              </Field>
              <Field label="Company Website">
                <input
                  type="url"
                  value={form.companyWebsite}
                  onChange={(e) => set("companyWebsite", e.target.value)}
                  placeholder="https://acme.com"
                  className={inp}
                />
              </Field>
              <Field label="Industry" required error={errors.companyIndustry}>
                <select
                  value={form.companyIndustry}
                  onChange={(e) => set("companyIndustry", e.target.value)}
                  className={sel}
                >
                  <option value="">Select industry</option>
                  {[
                    "Technology",
                    "Healthcare",
                    "Finance",
                    "Education",
                    "Retail",
                    "Manufacturing",
                    "Logistics",
                    "Media",
                    "Real Estate",
                    "Non-profit",
                  ].map((i) => (
                    <option key={i}>{i}</option>
                  ))}
                </select>
              </Field>
              <Field label="Company Size">
                <select
                  value={form.companySize}
                  onChange={(e) => set("companySize", e.target.value)}
                  className={sel}
                >
                  <option value="">Select size</option>
                  {[
                    "1–10 employees",
                    "11–50 employees",
                    "51–200 employees",
                    "201–500 employees",
                    "501–1,000 employees",
                    "1,000+ employees",
                  ].map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </Field>
            </div>
            <Field
              label="Company Description"
              required
              error={errors.companyDescription}
              hint="Tell candidates about your company culture, mission, and what makes you unique"
            >
              <textarea
                value={form.companyDescription}
                onChange={(e) => set("companyDescription", e.target.value)}
                rows={5}
                placeholder="Describe your company, culture, mission, and what makes it a great place to work..."
                className={inp + " resize-none"}
              />
            </Field>
          </div>
        )}

        {/* ── STEP 3: Job Details & Requirements ── */}
        {step === 3 && (
          <div className="space-y-5">
            <SectionTitle
              icon={<FileText size={15} />}
              label="Job Details & Requirements"
            />
            <Field
              label="Job Description"
              required
              error={errors.jobDescription}
              hint={`${form.jobDescription.length} chars — minimum 50`}
            >
              <textarea
                value={form.jobDescription}
                onChange={(e) => set("jobDescription", e.target.value)}
                rows={6}
                placeholder="Describe the role, day-to-day responsibilities, team structure and expectations..."
                className={inp + " resize-none"}
              />
              <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${Math.min(100, (form.jobDescription.length / 50) * 100)}%`,
                    background:
                      form.jobDescription.length >= 50 ? "#16a34a" : "#3b82f6",
                  }}
                />
              </div>
            </Field>
            <Field label="Key Responsibilities">
              <textarea
                value={form.responsibilities}
                onChange={(e) => set("responsibilities", e.target.value)}
                rows={4}
                placeholder={
                  "• Lead and mentor the engineering team\n• Architect scalable solutions\n• Drive technical roadmap"
                }
                className={inp + " resize-none"}
              />
            </Field>
            <Field
              label="Required Skills"
              required
              error={errors.requiredSkills}
            >
              <div className="flex gap-2">
                <input
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addTag("requiredSkills", skillInput);
                      setSkillInput("");
                    }
                  }}
                  placeholder="e.g. React, Python, AWS — press Enter"
                  className={inp + " flex-1"}
                />
                <button
                  type="button"
                  onClick={() => {
                    addTag("requiredSkills", skillInput);
                    setSkillInput("");
                  }}
                  className="px-3 py-2 bg-blue-600 text-white rounded-xl text-sm hover:bg-blue-700 transition flex items-center gap-1"
                >
                  <Plus size={14} />
                </button>
              </div>
              {form.requiredSkills.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {form.requiredSkills.map((s) => (
                    <TagPill
                      key={s}
                      label={s}
                      onRemove={() => removeTag("requiredSkills", s)}
                    />
                  ))}
                </div>
              )}
            </Field>
            <Field label="Nice-to-have Skills">
              <div className="flex gap-2">
                <input
                  value={niceInput}
                  onChange={(e) => setNiceInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addTag("niceToHaveSkills", niceInput);
                      setNiceInput("");
                    }
                  }}
                  placeholder="Bonus skills — press Enter"
                  className={inp + " flex-1"}
                />
                <button
                  type="button"
                  onClick={() => {
                    addTag("niceToHaveSkills", niceInput);
                    setNiceInput("");
                  }}
                  className="px-3 py-2 bg-gray-100 text-gray-600 rounded-xl text-sm hover:bg-gray-200 transition flex items-center gap-1"
                >
                  <Plus size={14} />
                </button>
              </div>
              {form.niceToHaveSkills.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {form.niceToHaveSkills.map((s) => (
                    <TagPill
                      key={s}
                      label={s}
                      onRemove={() => removeTag("niceToHaveSkills", s)}
                    />
                  ))}
                </div>
              )}
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field
                label="Education Level"
                required
                error={errors.educationLevel}
              >
                <select
                  value={form.educationLevel}
                  onChange={(e) => set("educationLevel", e.target.value)}
                  className={sel}
                >
                  <option value="">Select level</option>
                  {[
                    "High school diploma",
                    "Associate degree",
                    "Bachelor's degree",
                    "Master's degree",
                    "MBA",
                    "Doctorate / PhD",
                    "Professional certification",
                    "No requirement",
                  ].map((e) => (
                    <option key={e}>{e}</option>
                  ))}
                </select>
              </Field>
              <Field
                label="Years of Experience"
                required
                error={errors.experienceRequired}
              >
                <select
                  value={form.experienceRequired}
                  onChange={(e) => set("experienceRequired", e.target.value)}
                  className={sel}
                >
                  <option value="">Select experience</option>
                  {[
                    "No experience",
                    "Less than 1 year",
                    "1–2 years",
                    "3–5 years",
                    "5–7 years",
                    "7–10 years",
                    "10+ years",
                  ].map((e) => (
                    <option key={e}>{e}</option>
                  ))}
                </select>
              </Field>
              <Field label="Required Languages">
                <input
                  value={form.languages}
                  onChange={(e) => set("languages", e.target.value)}
                  placeholder="e.g. English (fluent), Amharic"
                  className={inp}
                />
              </Field>
              <Field label="Certifications">
                <input
                  value={form.certifications}
                  onChange={(e) => set("certifications", e.target.value)}
                  placeholder="e.g. AWS Certified, PMP (optional)"
                  className={inp}
                />
              </Field>
            </div>
            <Field label="Benefits & Perks">
              <textarea
                value={form.benefits}
                onChange={(e) => set("benefits", e.target.value)}
                rows={3}
                placeholder={
                  "• Health, dental & vision insurance\n• 20 days paid vacation\n• Remote work stipend"
                }
                className={inp + " resize-none"}
              />
            </Field>
          </div>
        )}

        {/* ── STEP 4: Salary ── */}
        {step === 4 && (
          <div className="space-y-5">
            <SectionTitle
              icon={<DollarSign size={15} />}
              label="Compensation & Benefits"
            />
            <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl border border-blue-100">
              <input
                type="checkbox"
                id="negotiable"
                checked={form.salaryNegotiable}
                onChange={(e) => set("salaryNegotiable", e.target.checked)}
                className="w-4 h-4 accent-blue-600"
              />
              <label
                htmlFor="negotiable"
                className="text-sm font-medium text-blue-800 cursor-pointer"
              >
                Salary is negotiable — don't show a fixed range
              </label>
            </div>
            {!form.salaryNegotiable && (
              <div className="grid grid-cols-3 gap-4">
                <Field label="Currency">
                  <select
                    value={form.currency}
                    onChange={(e) => set("currency", e.target.value)}
                    className={sel}
                  >
                    {[
                      "USD",
                      "EUR",
                      "GBP",
                      "ETB",
                      "KES",
                      "NGN",
                      "ZAR",
                      "AED",
                      "CAD",
                      "AUD",
                    ].map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Minimum Salary" error={errors.salary}>
                  <input
                    type="number"
                    min={0}
                    value={form.minSalary || ""}
                    onChange={(e) => set("minSalary", +e.target.value)}
                    placeholder="e.g. 60000"
                    className={inp}
                  />
                </Field>
                <Field label="Maximum Salary">
                  <input
                    type="number"
                    min={0}
                    value={form.maxSalary || ""}
                    onChange={(e) => set("maxSalary", +e.target.value)}
                    placeholder="e.g. 90000"
                    className={inp}
                  />
                </Field>
                <Field label="Pay Period" hint="How often is this salary paid?">
                  <select
                    value={form.salaryPeriod}
                    onChange={(e) => set("salaryPeriod", e.target.value)}
                    className={sel}
                  >
                    {[
                      "per year",
                      "per month",
                      "per week",
                      "per hour",
                      "per project",
                    ].map((p) => (
                      <option key={p}>{p}</option>
                    ))}
                  </select>
                </Field>
                {form.minSalary > 0 && form.maxSalary > 0 && (
                  <div className="col-span-2 flex items-center">
                    <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-2.5 text-sm text-green-700 font-medium">
                      Preview: {form.currency} {form.minSalary.toLocaleString()}{" "}
                      – {form.maxSalary.toLocaleString()} {form.salaryPeriod}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── STEP 5: Screening ── */}
        {step === 5 && (
          <div className="space-y-5">
            <SectionTitle
              icon={<Settings2 size={15} />}
              label="Application Settings & Screening"
            />
            <Field label="Receive Applications Via">
              <select
                value={form.receiveBy}
                onChange={(e) => set("receiveBy", e.target.value)}
                className={sel}
              >
                <option value="dashboard">Dashboard only</option>
                <option value="email">Email only</option>
                <option value="both">Both dashboard and email</option>
              </select>
            </Field>

            {/* Requirements toggles */}
            <div className="space-y-3">
              <p className="text-xs font-medium text-gray-600">
                Required Application Materials
              </p>
              {[
                {
                  key: "resumeRequired" as const,
                  label: "Resume / CV",
                  hint: "Applicants must attach a resume",
                },
                {
                  key: "coverLetterRequired" as const,
                  label: "Cover Letter",
                  hint: "Applicants must write a cover letter",
                },
                {
                  key: "portfolioRequired" as const,
                  label: "Portfolio / Work samples",
                  hint: "Applicants must share portfolio links",
                },
              ].map((item) => (
                <div
                  key={item.key}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      {item.label}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">{item.hint}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => set(item.key, !form[item.key])}
                    className={`relative w-10 h-5 rounded-full transition-colors ${form[item.key] ? "bg-blue-600" : "bg-gray-300"}`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${form[item.key] ? "translate-x-5" : ""}`}
                    />
                  </button>
                </div>
              ))}
            </div>

            {/* Screening questions */}
            <Field
              label="Screening Questions"
              hint="Questions shown to candidates when applying. Each question on a new line."
            >
              <div className="flex gap-2">
                <input
                  value={sqInput}
                  onChange={(e) => setSqInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addTag("screeningQuestions", sqInput);
                      setSqInput("");
                    }
                  }}
                  placeholder="e.g. Are you authorized to work in Ethiopia? — press Enter"
                  className={inp + " flex-1"}
                />
                <button
                  type="button"
                  onClick={() => {
                    addTag("screeningQuestions", sqInput);
                    setSqInput("");
                  }}
                  className="px-3 py-2 bg-blue-600 text-white rounded-xl text-sm hover:bg-blue-700 transition"
                >
                  <Plus size={14} />
                </button>
              </div>
              {form.screeningQuestions.length > 0 && (
                <div className="space-y-1.5 mt-2">
                  {form.screeningQuestions.map((q, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg text-sm text-gray-700"
                    >
                      <span className="text-gray-400 text-xs">{i + 1}.</span>
                      <span className="flex-1">{q}</span>
                      <button
                        type="button"
                        onClick={() => removeTag("screeningQuestions", q)}
                        className="text-gray-400 hover:text-red-500 transition"
                      >
                        <X size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </Field>
          </div>
        )}

        {/* ── STEP 6: Review ── */}
        {step === 6 && (
          <div className="space-y-4">
            <SectionTitle
              icon={<CheckCircle size={15} />}
              label="Review & Publish"
            />
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Job Title", value: form.title },
                { label: "Category", value: form.category },
                { label: "Type", value: form.jobType },
                { label: "Workplace", value: form.workplaceType },
                { label: "Experience Level", value: form.experienceLevel },
                { label: "Location", value: form.location },
                { label: "Vacancies", value: form.vacancies },
                { label: "Deadline", value: form.deadline },
                { label: "Company", value: form.companyName },
                { label: "Company Industry", value: form.companyIndustry },
                { label: "Education Required", value: form.educationLevel },
                {
                  label: "Experience Required",
                  value: form.experienceRequired,
                },
                {
                  label: "Salary",
                  value: form.salaryNegotiable
                    ? "Negotiable"
                    : `${form.currency} ${form.minSalary.toLocaleString()}–${form.maxSalary.toLocaleString()} ${form.salaryPeriod}`,
                },
                {
                  label: "Resume Required",
                  value: form.resumeRequired ? "Yes" : "No",
                },
              ].map((item) => (
                <div key={item.label} className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-400 mb-0.5">{item.label}</p>
                  <p className="text-sm font-medium text-gray-800">
                    {item.value || "—"}
                  </p>
                </div>
              ))}
            </div>
            {form.requiredSkills.length > 0 && (
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-400 mb-2">Required Skills</p>
                <div className="flex flex-wrap gap-1.5">
                  {form.requiredSkills.map((s) => (
                    <span
                      key={s}
                      className="px-2.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-xs font-medium"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between mt-8 pt-5 border-t border-gray-100">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <ShieldCheck size={14} className="text-green-500" />
            Reviewed by our team within 24 hours
          </div>
          <div className="flex items-center gap-2">
            {step > 1 && (
              <button
                type="button"
                onClick={prev}
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition"
              >
                <ArrowLeft size={14} /> Back
              </button>
            )}
            {step < 6 ? (
              <button
                type="button"
                onClick={next}
                className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-5 py-2 rounded-xl transition shadow-sm"
              >
                Continue <ArrowRight size={14} />
              </button>
            ) : (
              <button
                type="button"
                onClick={submit}
                disabled={loading}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white text-sm font-semibold px-6 py-2 rounded-xl transition shadow-sm"
              >
                {loading ? (
                  <>
                    <Loader2 size={14} className="animate-spin" /> Publishing...
                  </>
                ) : (
                  <>
                    <CheckCircle size={14} /> Publish Job
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function SectionTitle({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2 mb-1 pb-3 border-b border-gray-100">
      <span className="text-blue-500">{icon}</span>
      <span className="text-sm font-semibold text-gray-700">{label}</span>
    </div>
  );
}
