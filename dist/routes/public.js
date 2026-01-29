"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const ActivityLog_1 = __importDefault(require("../models/ActivityLog"));
const router = express_1.default.Router();
router.post('/contact', async (req, res) => {
    try {
        const { name, email, message } = req.body;
        if (!name || !email || !message) {
            return res.status(400).json({ message: 'All fields are required' });
        }
        console.log(`[Contact Form] ${name} (${email}): ${message}`);
        await new ActivityLog_1.default({
            projectId: 'system',
            type: 'message',
            content: `New Contact Request from ${name} (${email}): ${message.substring(0, 100)}...`
        }).save();
        res.json({ success: true, message: 'Your message has been received. We will respond within 24 hours.' });
    }
    catch (error) {
        console.error('Contact form error:', error);
        res.status(500).json({ message: 'Failed to process contact form' });
    }
});
router.post('/subscribe', async (req, res) => {
    try {
        const { email } = req.body;
        // Log subscription
        await new ActivityLog_1.default({
            projectId: 'system',
            type: 'message',
            content: `New strategy feed subscriber: ${email}`
        }).save();
        res.json({ success: true, message: 'Subscribed successfully.' });
    }
    catch (error) {
        res.status(500).json({ message: 'Subscription failed' });
    }
});
exports.default = router;
