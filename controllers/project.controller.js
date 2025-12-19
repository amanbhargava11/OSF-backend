import Project from "../models/Project.js";

/**
 * POST /api/project
 * Create a new project (PROTECTED)
 */
export const submitProject = async (req, res) => {
  try {
    const { title, description, budget } = req.body;

    if (!title || !description) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const project = await Project.create({
      title,
      description,
      budget,
      owner: req.user.id   // 👈 comes from JWT middleware
    });

    res.status(201).json({
      message: "Project submitted successfully",
      project
    });
  } catch (err) {
    console.error("Project submit error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * GET /api/project/my
 * Get logged-in user's projects (PROTECTED)
 */
export const getMyProjects = async (req, res) => {
  try {
    const projects = await Project.find({ owner: req.user.id })
      .sort({ createdAt: -1 });

    res.json(projects);
  } catch (err) {
    console.error("Fetch projects error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
