import express from 'express';
import ActivityLog from '../models/ActivityLog';
import Project from '../models/Project';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// @route   GET /api/activities
// @desc    Get all activity logs (admin only, or filtered by project)
router.get('/', authenticate, async (req: any, res) => {
  try {
    const { projectId, limit = 50 } = req.query;
    
    let query: any = {};
    if (projectId && projectId !== 'system') {
      query.projectId = projectId;
    } else if (req.user.role === 'admin') {
      // Admins can see all logs including system logs
      query = {};
    } else {
      // Clients only see logs for their projects
      const userProjects = await Project.find({ clientId: req.user._id }).select('_id');
      const projectIds = userProjects.map((p: any) => p._id.toString());
      query.projectId = { $in: projectIds };
    }

    const logs = await ActivityLog.find(query)
      .populate('actorId', 'name email')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit as string))
      .lean();

    const formattedLogs = logs.map((log: any) => ({
      id: log._id.toString(),
      projectId: log.projectId,
      type: log.type,
      content: log.content,
      timestamp: log.createdAt,
      actor: log.actorId ? {
        id: log.actorId._id.toString(),
        name: log.actorId.name,
        email: log.actorId.email
      } : null
    }));

    res.json(formattedLogs);
  } catch (error) {
    console.error('Error fetching activities:', error);
    res.status(500).json({ message: 'Failed to fetch activity logs' });
  }
});

export default router;
