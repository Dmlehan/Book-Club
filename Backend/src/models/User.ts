import { Schema, model, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

// Define the User TypeScript Interface
export interface IUser extends Document {
  username: string;
  password?: string; // Optional because we might exclude password in queries
  name: string;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

// Define the User Schema
const UserSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters long'],
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to hash password before saving to the database
UserSchema.pre<IUser>('save', async function (next) {
  const user = this;

  // Only hash the password if it has been modified (or is new)
  if (!user.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(user.password as string, salt);
    user.password = hash;
    next();
  } catch (error: any) {
    next(error);
  }
});

// Instance method to check password validity
UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password || '');
};

const User = model<IUser>('User', UserSchema);

export default User;
