"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProjects = exports.createProject = void 0;
const Project_1 = __importDefault(require("../models/Project")); // Your existing model
// Create new project - MATCHES YOUR SCHEMA
const createProject = async (req, res) => {
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
        const project = new Project_1.default({
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
    }
    catch (error) {
        console.error('❌ Create project error:', error);
        res.status(500).json({ message: 'Server error creating project' });
    }
};
exports.createProject = createProject;
// Get user's projects
const getProjects = async (req, res) => {
    try {
        const projects = await Project_1.default.find({ clientId: req.user._id })
            .sort({ createdAt: -1 })
            .populate('clientId', 'email') // Optional: show client email
            .lean();
        res.json(projects);
    }
    catch (error) {
        console.error('❌ Get projects error:', error);
        res.status(500).json({ message: 'Server error fetching projects' });
    }
};
exports.getProjects = getProjects;
