"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const File_1 = __importDefault(require("../models/File"));
const ActivityLog_1 = __importDefault(require("../models/ActivityLog"));
const router = express_1.default.Router();
// Get files for a project
router.get('/:projectId', auth_1.authenticate, async (req, res) => {
    try {
        const files = await File_1.default.find({ projectId: req.params.projectId })
            .populate('uploadedBy', 'name email')
            .sort({ createdAt: -1 });
        res.json(files);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching files' });
    }
});
// Upload a file (for now, accepts file metadata)
router.post('/', auth_1.authenticate, async (req, res) => {
    try {
        const { projectId, name, url, size } = req.body;
        if (!projectId || !name || !url) {
            return res.status(400).json({ message: 'Missing required fields' });
        }
        const file = new File_1.default({
            projectId,
            uploadedBy: req.user._id,
            name,
            url,
            size: size || '0 MB'
        });
        await file.save();
        await new ActivityLog_1.default({
            projectId,
            type: 'file_upload',
            content: `New file uploaded: ${name}`,
            actorId: req.user._id
        }).save();
        // Send notification message to client
        const Message = require('../models/Message').default;
        const Project = require('../models/Project').default;
        const project = await Project.findById(projectId);
        if (project) {
            await new Message({
                projectId,
                senderId: req.user._id,
                senderName: 'OSF Protocol',
                senderRole: 'admin',
                text: `📎 New asset uploaded: ${name}`,
                isSystem: true
            }).save();
        }
        res.status(201).json(file);
    }
    catch (error) {
        res.status(400).json({ message: 'Failed to upload file' });
    }
});
exports.default = router;
