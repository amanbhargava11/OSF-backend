
import mongoose from 'mongoose';

const FileSchema = new mongoose.Schema({
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  url: { type: String, required: true },
  size: { type: String },
}, { timestamps: true });

export default mongoose.models.File || mongoose.model('File', FileSchema);
