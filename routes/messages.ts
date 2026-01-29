
import express from 'express';
import { authenticate } from '../middleware/auth';
import Message from '../models/Message';
import ActivityLog from '../models/ActivityLog';

const router = express.Router();

router.get('/:projectId', authenticate, async (req: any, res) => {
  try {
    // Clients can only see messages for their projects
    const messages = await Message.find({ projectId: req.params.projectId }).sort({ createdAt: 1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching messages' });
  }
});

router.post('/', authenticate, async (req: any, res) => {
  try {
    const { projectId, text, isSystem } = req.body;
    const message = new Message({
      projectId,
      senderId: req.user._id,
      senderName: req.user.name,
      senderRole: req.user.role,
      text,
      isSystem: isSystem || false
    });
    await message.save();

    if (!isSystem) {
      await new ActivityLog({
        projectId,
        type: 'message',
        content: `New message from ${req.user.name}`,
        actorId: req.user._id
      }).save();
    }

    res.status(201).json(message);
  } catch (error) {
    res.status(400).json({ message: 'Failed to send message' });
  }
});

export default router;
