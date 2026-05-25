import { Router } from "express";

const router = Router();

// GET /api/jobseeker/profile
router.get("/profile", (req, res) => {
  // For now, return mock data to avoid 404
  res.json({
    fullName: "",
    title: "",
    bio: "",
    email: "",
    phone: "",
    location: "",
    website: "",
    linkedin: "",
    github: "",
    avatarUrl: "",
    skills: [],
    certificates: [],
    projects: [],
    education: [],
    experience: [],
    languages: [],
    availability: "Open to work",
    expectedSalary: "",
  });
});

// PUT /api/jobseeker/profile
router.put("/profile", (req, res) => {
  // Just acknowledge for now
  res.json({ success: true });
});

// POST /api/jobseeker/resume
router.post("/resume", (req, res) => {
  res.json({ url: "" });
});

export default router;
