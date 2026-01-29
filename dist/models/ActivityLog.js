"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const ActivityLogSchema = new mongoose_1.default.Schema({
    projectId: { type: String, required: true }, // Can be 'system' or ObjectId
    type: { type: String, enum: ['stage_change', 'file_upload', 'message', 'auth'], required: true },
    content: { type: String, required: true },
    actorId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });
exports.default = mongoose_1.default.models.ActivityLog || mongoose_1.default.model('ActivityLog', ActivityLogSchema);
