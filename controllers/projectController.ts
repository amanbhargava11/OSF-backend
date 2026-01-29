import { Request, Response } from 'express';
import Project from '../models/Project'; // Your existing model

// Create new project - MATCHES YOUR SCHEMA
export const createProject = async (req: any, res: Response) => {
  try {
    console.log('📦 Creating project with:', req.body); // Debug log
    
    const { title, description, stage, stack, budget } = req.body;
    
    // Validation for REQUIRED fields from your schema
    if (!title || !title.trim()) {
      return res.status(400).json({ message: 'Project title is required' });
    }
    
    if (!description || !description.trim()) {
      return res.status(400).json({ message: 'Project description is required' });
    }

    const project = new Project({
      clientId: req.user._id, // From auth middleware (your admin user)
      title: title.trim(),
      description: description.trim(),
      stage: stage || 'Discovery',
      progressPercent: 0,
      stack: stack || [],
      budget: budget || '',
      status: 'active'
    });

    const savedProject = await project.save();
    res.status(201).json(savedProject);
  } catch (error: any) {
    console.error('❌ Create project error:', error);
    res.status(500).json({ message: 'Server error creating project' });
  }
};

// Get user's projects
export const getProjects = async (req: any, res: Response) => {
  try {
    const projects = await Project.find({ clientId: req.user._id })
      .sort({ createdAt: -1 })
      .populate('clientId', 'email') // Optional: show client email
      .lean();
    res.json(projects);
  } catch (error: any) {
    console.error('❌ Get projects error:', error);
    res.status(500).json({ message: 'Server error fetching projects' });
  }
};
