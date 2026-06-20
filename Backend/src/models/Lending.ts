import { Schema, model, Document, Types } from 'mongoose';

export interface ILending extends Document {
  book: Types.ObjectId;
  reader: Types.ObjectId;
  issueDate: Date;
  dueDate: Date;
  returnDate?: Date;
  status: 'LENT' | 'RETURNED' | 'OVERDUE';
}

const LendingSchema = new Schema<ILending>(
  {
    book: {
      type: Schema.Types.ObjectId,
      ref: 'Book',
      required: [true, 'Book ID is required'],
    },
    reader: {
      type: Schema.Types.ObjectId,
      ref: 'Reader',
      required: [true, 'Reader ID is required'],
    },
    issueDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    returnDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['LENT', 'RETURNED', 'OVERDUE'],
      default: 'LENT',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-validate hook to calculate dueDate automatically (IssueDate + 14 Days)
LendingSchema.pre('validate', function (next) {
  if (!this.dueDate) {
    const issue = this.issueDate || new Date();
    const due = new Date(issue.getTime());
    due.setDate(due.getDate() + 14);
    this.dueDate = due;
  }
  next();
});

const Lending = model<ILending>('Lending', LendingSchema);

export default Lending;
