import express from 'express';
import mongoose from 'mongoose';
import { authenticate, authorize } from '../middleware/auth';
import Project from '../models/Project';
import ActivityLog from '../models/ActivityLog';
import Message from '../models/Message';

const router = express.Router();

// Fetch Projects
router.get('/', authenticate, async (req: any, res) => {
  try {
    const query = req.user.role === 'admin' ? {} : { clientId: req.user._id };
    const projects = await Project.find(query)
      .populate('clientId', 'name email company avatar')
      .sort({ updatedAt: -1 });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve projects' });
  }
});

// Admin: Create Project
router.post('/', authenticate, authorize(['admin']), async (req: any, res) => {
  try {
    const { title, description, clientId } = req.body;

    if (!title || !description) {
      return res.status(400).json({ message: 'Title and description are required' });
    }

    if (!clientId) {
      return res.status(400).json({ message: 'Client ID is required' });
    }

    // Validate clientId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(clientId)) {
      return res.status(400).json({ message: 'Invalid client ID format' });
    }

    // Verify the client exists and is actually a client
    const User = require('../models/User').default;
    const client = await User.findById(clientId);
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }
    if (client.role !== 'client') {
      return res.status(400).json({ message: 'Selected user is not a client' });
    }

    const project = new Project({
      clientId,
      title,
      description,
      // allow optional fields from body but never override clientId
      ...(req.body || {}),
    });

    await project.save();
    
    await new ActivityLog({
      projectId: project._id,
      type: 'stage_change',
      content: `System: Initialized new operation "${project.title}"`,
      actorId: req.user._id
    }).save();

    res.status(201).json(project);
  } catch (error) {
    console.error('Create project error:', error);
    res.status(400).json({ message: 'Invalid project parameters' });
  }
});

// Admin: Patch Updates (Stage/Progress)
router.patch('/:id', authenticate, authorize(['admin']), async (req: any, res) => {
  try {
    const project = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!project) return res.status(404).json({ message: 'Project not found' });
    
    if (req.body.stage) {
      await new ActivityLog({
        projectId: project._id,
        type: 'stage_change',
        content: `Phase Update: Advanced to ${req.body.stage}`,
        actorId: req.user._id
      }).save();

      await new Message({
        projectId: project._id,
        senderId: req.user._id,
        senderName: 'OSF Protocol',
        senderRole: 'admin',
        text: `Operation milestone updated: ${req.body.stage} phase is now active.`,
        isSystem: true
      }).save();
    }

    res.json(project);
  } catch (error) {
    res.status(400).json({ message: 'Operation update failed' });
  }
});

export default router;