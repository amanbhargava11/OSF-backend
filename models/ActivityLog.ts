
import mongoose from 'mongoose';

const ActivityLogSchema = new mongoose.Schema({
  projectId: { type: String, required: true }, // Can be 'system' or ObjectId
  type: { type: String, enum: ['stage_change', 'file_upload', 'message', 'auth'], required: true },
  content: { type: String, required: true },
  actorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

export default mongoose.models.ActivityLog || mongoose.model('ActivityLog', ActivityLogSchema);
