import { Schema, model, Document } from 'mongoose';

// Define the Reader TypeScript Interface
export interface IReader extends Document {
  readerId: string;
  name: string;
  email: string;
  phone: string;
  registrationDate: Date;
}

// Define the Reader Schema
const ReaderSchema = new Schema<IReader>(
  {
    readerId: {
      type: String,
      required: [true, 'Reader ID is required'],
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email address'],
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    registrationDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const Reader = model<IReader>('Reader', ReaderSchema);

export default Reader;
