"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const Message_1 = __importDefault(require("../models/Message"));
const ActivityLog_1 = __importDefault(require("../models/ActivityLog"));
const router = express_1.default.Router();
router.get('/:projectId', auth_1.authenticate, async (req, res) => {
    try {
        // Clients can only see messages for their projects
        const messages = await Message_1.default.find({ projectId: req.params.projectId }).sort({ createdAt: 1 });
        res.json(messages);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching messages' });
    }
});
router.post('/', auth_1.authenticate, async (req, res) => {
    try {
        const { projectId, text, isSystem } = req.body;
        const message = new Message_1.default({
            projectId,
            senderId: req.user._id,
            senderName: req.user.name,
            senderRole: req.user.role,
            text,
            isSystem: isSystem || false
        });
        await message.save();
        if (!isSystem) {
            await new ActivityLog_1.default({
                projectId,
                type: 'message',
                content: `New message from ${req.user.name}`,
                actorId: req.user._id
            }).save();
        }
        res.status(201).json(message);
    }
    catch (error) {
        res.status(400).json({ message: 'Failed to send message' });
    }
});
exports.default = router;
