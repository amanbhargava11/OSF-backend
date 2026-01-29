"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const auth_1 = require("../middleware/auth");
const Project_1 = __importDefault(require("../models/Project"));
const ActivityLog_1 = __importDefault(require("../models/ActivityLog"));
const Message_1 = __importDefault(require("../models/Message"));
const router = express_1.default.Router();
// Fetch Projects
router.get('/', auth_1.authenticate, async (req, res) => {
    try {
        const query = req.user.role === 'admin' ? {} : { clientId: req.user._id };
        const projects = await Project_1.default.find(query)
            .populate('clientId', 'name email company avatar')
            .sort({ updatedAt: -1 });
        res.json(projects);
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to retrieve projects' });
    }
});
// Admin: Create Project
router.post('/', auth_1.authenticate, (0, auth_1.authorize)(['admin']), async (req, res) => {
    try {
        const { title, description, clientId } = req.body;
        if (!title || !description) {
            return res.status(400).json({ message: 'Title and description are required' });
        }
        if (!clientId) {
            return res.status(400).json({ message: 'Client ID is required' });
        }
        // Validate clientId is a valid ObjectId
        if (!mongoose_1.default.Types.ObjectId.isValid(clientId)) {
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
        const project = new Project_1.default({
            clientId,
            title,
            description,
            // allow optional fields from body but never override clientId
            ...(req.body || {}),
        });
        await project.save();
        await new ActivityLog_1.default({
            projectId: project._id,
            type: 'stage_change',
            content: `System: Initialized new operation "${project.title}"`,
            actorId: req.user._id
        }).save();
        res.status(201).json(project);
    }
    catch (error) {
        console.error('Create project error:', error);
        res.status(400).json({ message: 'Invalid project parameters' });
    }
});
// Admin: Patch Updates (Stage/Progress)
router.patch('/:id', auth_1.authenticate, (0, auth_1.authorize)(['admin']), async (req, res) => {
    try {
        const project = await Project_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!project)
            return res.status(404).json({ message: 'Project not found' });
        if (req.body.stage) {
            await new ActivityLog_1.default({
                projectId: project._id,
                type: 'stage_change',
                content: `Phase Update: Advanced to ${req.body.stage}`,
                actorId: req.user._id
            }).save();
            await new Message_1.default({
                projectId: project._id,
                senderId: req.user._id,
                senderName: 'OSF Protocol',
                senderRole: 'admin',
                text: `Operation milestone updated: ${req.body.stage} phase is now active.`,
                isSystem: true
            }).save();
        }
        res.json(project);
    }
    catch (error) {
        res.status(400).json({ message: 'Operation update failed' });
    }
});
exports.default = router;
