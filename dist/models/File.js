"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const FileSchema = new mongoose_1.default.Schema({
    projectId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Project', required: true },
    uploadedBy: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    url: { type: String, required: true },
    size: { type: String },
}, { timestamps: true });
exports.default = mongoose_1.default.models.File || mongoose_1.default.model('File', FileSchema);
