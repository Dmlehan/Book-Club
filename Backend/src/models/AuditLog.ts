import { Schema, model, Document, Types } from 'mongoose';

// Define the AuditLog TypeScript Interface
export interface IAuditLog extends Document {
  action: string;
  collectionName: string;
  documentId: string;
  performedBy: Types.ObjectId;
  details?: string;
  timestamp: Date;
}

// Define the AuditLog Schema
const AuditLogSchema = new Schema<IAuditLog>({
  action: {
    type: String,
    required: [true, 'Action is required'],
    trim: true,
  },
  collectionName: {
    type: String,
    required: [true, 'Collection name is required'],
    trim: true,
  },
  documentId: {
    type: String,
    required: [true, 'Document ID is required'],
    trim: true,
  },
  performedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User who performed the action is required'],
  },
  details: {
    type: String,
    trim: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const AuditLog = model<IAuditLog>('AuditLog', AuditLogSchema);

export default AuditLog;
