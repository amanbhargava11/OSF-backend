import mongoose from 'mongoose';

const ProjectSchema = new mongoose.Schema({
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  stage: { 
    type: String, 
    enum: ['Discovery', 'Design', 'Development', 'Review', 'Launch'], 
    default: 'Discovery' 
  },
  progressPercent: { type: Number, default: 0, min: 0, max: 100 },
  milestoneDate: { type: Date },
  status: { type: String, enum: ['active', 'completed', 'paused'], default: 'active' },
  stack: [{ type: String }],
  budget: { type: String },
  aiAudit: {
    summary: String,
    suggestions: [String],
    lastUpdated: Date
  }
}, { 
  timestamps: true,
  toJSON: {
    transform: (doc, ret) => {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
    }
  }
});

export default mongoose.models.Project || mongoose.model('Project', ProjectSchema);