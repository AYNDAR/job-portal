// frontend/src/features/employer/PostJobForm.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Switch } from "../../components/ui/switch";
import { Label } from "../../components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Separator } from "../../components/ui/separator";
import { Badge } from "../../components/ui/badge";
import { X, ChevronLeft, ChevronRight, CheckCircle } from "lucide-react";
import api from "../../services/api";

// Type definitions
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
  companyLogo: File | null;
  companyDescription: string;
  jobDescription: string;
  requiredSkills: string[];
  educationLevel: string;
  experienceRequired: string;
  certifications: string;
  minSalary: number;
  maxSalary: number;
  currency: string;
  benefits: string;
  receiveBy: string;
  screeningQuestions: string;
  resumeRequired: boolean;
  coverLetterRequired: boolean;
}

// Constants
const jobCategories = [
  "Technology",
  "Marketing",
  "Sales",
  "Design",
  "Finance",
  "Healthcare",
  "Education",
];
const jobTypes = [
  "Full-time",
  "Part-time",
  "Contract",
  "Internship",
  "Temporary",
];
const workplaceTypes = ["On-site", "Remote", "Hybrid"];
const experienceLevels = [
  "Entry level",
  "Mid level",
  "Senior level",
  "Lead / Manager",
  "Executive",
];
const educationLevels = [
  "High School",
  "Associate's Degree",
  "Bachelor's Degree",
  "Master's Degree",
  "Doctorate",
  "Not required",
];
const experienceRequiredOptions = [
  "No experience",
  "Less than 1 year",
  "1-2 years",
  "3-5 years",
  "5+ years",
];
const currencies = ["USD", "EUR", "GBP", "CAD", "AUD", "INR"];

export default function PostJobForm() {
  const navigate = useNavigate();
  const [step, setStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [skillInput, setSkillInput] = useState<string>("");

  const [formData, setFormData] = useState<FormData>({
    title: "",
    category: "",
    jobType: "",
    workplaceType: "",
    experienceLevel: "",
    location: "",
    vacancies: 1,
    deadline: "",
    companyName: "",
    companyWebsite: "",
    companyLogo: null,
    companyDescription: "",
    jobDescription: "",
    requiredSkills: [],
    educationLevel: "",
    experienceRequired: "",
    certifications: "",
    minSalary: 0,
    maxSalary: 0,
    currency: "USD",
    benefits: "",
    receiveBy: "email",
    screeningQuestions: "",
    resumeRequired: true,
    coverLetterRequired: false,
  });

  const updateField = <K extends keyof FormData>(
    field: K,
    value: FormData[K],
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const addSkill = (): void => {
    const skill = skillInput.trim();
    if (skill && !formData.requiredSkills.includes(skill)) {
      updateField("requiredSkills", [...formData.requiredSkills, skill]);
      setSkillInput("");
    }
  };

  const removeSkill = (skill: string): void => {
    updateField(
      "requiredSkills",
      formData.requiredSkills.filter((s) => s !== skill),
    );
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setLogoPreview(previewUrl);
      updateField("companyLogo", file);
    }
  };

  const validateStep = (): boolean => {
    switch (step) {
      case 1:
        if (!formData.title) {
          alert("Job title required");
          return false;
        }
        if (!formData.category) {
          alert("Category required");
          return false;
        }
        if (!formData.jobType) {
          alert("Job type required");
          return false;
        }
        if (!formData.workplaceType) {
          alert("Workplace type required");
          return false;
        }
        if (!formData.experienceLevel) {
          alert("Experience level required");
          return false;
        }
        if (!formData.location) {
          alert("Location required");
          return false;
        }
        if (formData.vacancies < 1) {
          alert("Vacancies must be at least 1");
          return false;
        }
        if (!formData.deadline) {
          alert("Deadline required");
          return false;
        }
        break;
      case 2:
        if (!formData.companyName) {
          alert("Company name required");
          return false;
        }
        if (!formData.companyDescription) {
          alert("Company description required");
          return false;
        }
        break;
      case 3:
        if (!formData.jobDescription || formData.jobDescription.length < 50) {
          alert("Job description must be at least 50 characters");
          return false;
        }
        if (formData.requiredSkills.length === 0) {
          alert("Add at least one required skill");
          return false;
        }
        if (!formData.educationLevel) {
          alert("Education level required");
          return false;
        }
        if (!formData.experienceRequired) {
          alert("Experience required");
          return false;
        }
        break;
      case 4:
        if (formData.minSalary < 0) {
          alert("Minimum salary cannot be negative");
          return false;
        }
        if (formData.maxSalary < 0) {
          alert("Maximum salary cannot be negative");
          return false;
        }
        break;
      default:
        return true;
    }
    return true;
  };

  const nextStep = (): void => {
    if (validateStep()) setStep(step + 1);
  };

  const prevStep = (): void => setStep(step - 1);

  const handleSubmit = async (): Promise<void> => {
    if (!validateStep()) return;
    setIsSubmitting(true);
    try {
      let logoUrl = "";
      if (formData.companyLogo) {
        const fd = new FormData();
        fd.append("logo", formData.companyLogo);
        const uploadRes = await api.post("/upload/company-logo", fd);
        logoUrl = uploadRes.data.url;
      }
      const payload = {
        ...formData,
        companyLogo: logoUrl,
        salaryRange: `${formData.currency} ${formData.minSalary} - ${formData.maxSalary}`,
      };
      await api.post("/jobs", payload);
      alert("Job posted successfully!");
      navigate("/employer/dashboard");
    } catch (error) {
      alert("Failed to post job. Try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalSteps = 7;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Post a New Job</CardTitle>
          <CardDescription>
            Fill in the details to attract the best candidates
          </CardDescription>
          <div className="flex justify-between items-center mt-2">
            <div className="text-sm text-gray-500">
              Step {step} of {totalSteps}
            </div>
            <div className="flex gap-1">
              {Array.from({ length: totalSteps }).map((_, i) => (
                <div
                  key={i}
                  className={`h-1 w-8 rounded-full ${step > i ? "bg-purple-600" : "bg-gray-200"}`}
                />
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Step 1: Job Information */}
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Job Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Job Title *</Label>
                  <Input
                    value={formData.title}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      updateField("title", e.target.value)
                    }
                    placeholder="e.g., Senior Frontend Developer"
                  />
                </div>
                <div>
                  <Label>Job Category *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(v: string) => updateField("category", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {jobCategories.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Job Type *</Label>
                  <Select
                    value={formData.jobType}
                    onValueChange={(v: string) => updateField("jobType", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select job type" />
                    </SelectTrigger>
                    <SelectContent>
                      {jobTypes.map((t) => (
                        <SelectItem key={t} value={t}>
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Workplace Type *</Label>
                  <Select
                    value={formData.workplaceType}
                    onValueChange={(v: string) =>
                      updateField("workplaceType", v)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select workplace type" />
                    </SelectTrigger>
                    <SelectContent>
                      {workplaceTypes.map((w) => (
                        <SelectItem key={w} value={w}>
                          {w}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Experience Level *</Label>
                  <Select
                    value={formData.experienceLevel}
                    onValueChange={(v: string) =>
                      updateField("experienceLevel", v)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      {experienceLevels.map((e) => (
                        <SelectItem key={e} value={e}>
                          {e}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Location *</Label>
                  <Input
                    value={formData.location}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      updateField("location", e.target.value)
                    }
                    placeholder="City, State or Remote"
                  />
                </div>
                <div>
                  <Label>Number of Vacancies *</Label>
                  <Input
                    type="number"
                    value={formData.vacancies}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      updateField("vacancies", parseInt(e.target.value) || 1)
                    }
                  />
                </div>
                <div>
                  <Label>Application Deadline *</Label>
                  <Input
                    type="date"
                    value={formData.deadline}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      updateField("deadline", e.target.value)
                    }
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Company Information */}
          {step === 2 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Company Information</h3>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label>Company Name *</Label>
                  <Input
                    value={formData.companyName}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      updateField("companyName", e.target.value)
                    }
                  />
                </div>
                <div>
                  <Label>Company Website</Label>
                  <Input
                    value={formData.companyWebsite}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      updateField("companyWebsite", e.target.value)
                    }
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <Label>Company Logo</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                    />
                    {logoPreview && (
                      <img
                        src={logoPreview}
                        alt="Company logo preview"
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    )}
                  </div>
                </div>
                <div>
                  <Label>Company Description *</Label>
                  <Textarea
                    value={formData.companyDescription}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                      updateField("companyDescription", e.target.value)
                    }
                    rows={3}
                    placeholder="Tell candidates about your company..."
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Requirements */}
          {step === 3 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">
                Job Description & Requirements
              </h3>
              <div>
                <Label>Job Description *</Label>
                <Textarea
                  value={formData.jobDescription}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    updateField("jobDescription", e.target.value)
                  }
                  rows={5}
                  placeholder="Describe responsibilities, technologies, expectations..."
                />
              </div>
              <div>
                <Label>Required Skills *</Label>
                <div className="flex gap-2">
                  <Input
                    value={skillInput}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setSkillInput(e.target.value)
                    }
                    placeholder="e.g., React"
                    onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) =>
                      e.key === "Enter" && (e.preventDefault(), addSkill())
                    }
                  />
                  <Button type="button" onClick={addSkill}>
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.requiredSkills.map((skill) => (
                    <Badge key={skill} className="px-2 py-1">
                      {skill}{" "}
                      <X
                        className="ml-1 h-3 w-3 cursor-pointer"
                        onClick={() => removeSkill(skill)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Education Level *</Label>
                  <Select
                    value={formData.educationLevel}
                    onValueChange={(v: string) =>
                      updateField("educationLevel", v)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {educationLevels.map((e) => (
                        <SelectItem key={e} value={e}>
                          {e}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Experience Required *</Label>
                  <Select
                    value={formData.experienceRequired}
                    onValueChange={(v: string) =>
                      updateField("experienceRequired", v)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {experienceRequiredOptions.map((e) => (
                        <SelectItem key={e} value={e}>
                          {e}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="md:col-span-2">
                  <Label>Certifications (optional)</Label>
                  <Input
                    value={formData.certifications}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      updateField("certifications", e.target.value)
                    }
                    placeholder="e.g., AWS Certified, PMP"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Salary & Benefits */}
          {step === 4 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Salary & Benefits</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Currency *</Label>
                  <Select
                    value={formData.currency}
                    onValueChange={(v: string) => updateField("currency", v)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {currencies.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Minimum Salary *</Label>
                  <Input
                    type="number"
                    value={formData.minSalary}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      updateField("minSalary", parseInt(e.target.value) || 0)
                    }
                  />
                </div>
                <div>
                  <Label>Maximum Salary *</Label>
                  <Input
                    type="number"
                    value={formData.maxSalary}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      updateField("maxSalary", parseInt(e.target.value) || 0)
                    }
                  />
                </div>
                <div className="md:col-span-3">
                  <Label>Benefits (optional)</Label>
                  <Textarea
                    value={formData.benefits}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                      updateField("benefits", e.target.value)
                    }
                    placeholder="Health insurance, 401k, remote stipend, etc."
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Skills Summary */}
          {step === 5 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Skills Summary</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="font-medium">Required Skills:</p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {formData.requiredSkills.map((s) => (
                    <Badge key={s}>{s}</Badge>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 6: Application Settings */}
          {step === 6 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Application Settings</h3>
              <div>
                <Label>Receive Applications By *</Label>
                <Select
                  value={formData.receiveBy}
                  onValueChange={(v: string) => updateField("receiveBy", v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="dashboard">Dashboard only</SelectItem>
                    <SelectItem value="both">Both</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Screening Questions (optional)</Label>
                <Textarea
                  value={formData.screeningQuestions}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    updateField("screeningQuestions", e.target.value)
                  }
                  placeholder="e.g., Do you have experience with React? (Yes/No)"
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>Resume Required</Label>
                <Switch
                  checked={formData.resumeRequired}
                  onCheckedChange={(checked: boolean) =>
                    updateField("resumeRequired", checked)
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>Cover Letter Required</Label>
                <Switch
                  checked={formData.coverLetterRequired}
                  onCheckedChange={(checked: boolean) =>
                    updateField("coverLetterRequired", checked)
                  }
                />
              </div>
            </div>
          )}

          {/* Step 7: Review & Publish */}
          {step === 7 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Review & Publish</h3>
              <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
                <p>
                  <strong>Job Title:</strong> {formData.title}
                </p>
                <p>
                  <strong>Category:</strong> {formData.category} |{" "}
                  <strong>Type:</strong> {formData.jobType} |{" "}
                  <strong>Workplace:</strong> {formData.workplaceType}
                </p>
                <p>
                  <strong>Location:</strong> {formData.location} |{" "}
                  <strong>Vacancies:</strong> {formData.vacancies}
                </p>
                <p>
                  <strong>Deadline:</strong> {formData.deadline}
                </p>
                <Separator />
                <p>
                  <strong>Company:</strong> {formData.companyName}
                </p>
                <p>
                  <strong>Salary:</strong> {formData.currency}{" "}
                  {formData.minSalary} - {formData.maxSalary}
                </p>
                <p>
                  <strong>Skills:</strong> {formData.requiredSkills.join(", ")}
                </p>
              </div>
            </div>
          )}

          <div className="flex justify-between mt-8">
            {step > 1 && (
              <Button type="button" variant="outline" onClick={prevStep}>
                <ChevronLeft /> Back
              </Button>
            )}
            {step < totalSteps && (
              <Button type="button" onClick={nextStep}>
                Next <ChevronRight />
              </Button>
            )}
            {step === totalSteps && (
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? (
                  "Publishing..."
                ) : (
                  <>
                    <CheckCircle className="mr-1 h-4 w-4" /> Publish Job
                  </>
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
