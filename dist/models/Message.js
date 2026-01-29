"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const MessageSchema = new mongoose_1.default.Schema({
    projectId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Project', required: true },
    senderId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User', required: true },
    senderName: { type: String, required: true },
    senderRole: { type: String, enum: ['client', 'admin'], required: true },
    text: { type: String, required: true },
    isSystem: { type: Boolean, default: false },
    isRead: { type: Boolean, default: false },
}, { timestamps: true });
exports.default = mongoose_1.default.models.Message || mongoose_1.default.model('Message', MessageSchema);
