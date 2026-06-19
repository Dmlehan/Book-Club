import { Schema, model, Document } from 'mongoose';

// Define the Book TypeScript Interface
export interface IBook extends Document {
  title: string;
  author: string;
  isbn: string;
  genre?: string;
  totalCopies: number;
  availableCopies: number;
}

// Define the Book Schema
const BookSchema = new Schema<IBook>(
  {
    title: {
      type: String,
      required: [true, 'Book title is required'],
      trim: true,
      index: true,
    },
    author: {
      type: String,
      required: [true, 'Author is required'],
      trim: true,
    },
    isbn: {
      type: String,
      required: [true, 'ISBN is required'],
      unique: true,
      trim: true,
    },
    genre: {
      type: String,
      trim: true,
    },
    totalCopies: {
      type: Number,
      default: 1,
      min: [0, 'Total copies cannot be negative'],
    },
    availableCopies: {
      type: Number,
      default: 1,
      min: [0, 'Available copies cannot be negative'],
      validate: {
        validator: function (this: any, value: number) {
          // 'this' refers to the document being saved or updated
          // If updating, 'this.totalCopies' might not be populated in the validator context.
          // Thus we handle both create/save doc and update context if available.
          const total = this.totalCopies !== undefined ? this.totalCopies : this.get? this.get('totalCopies') : undefined;
          return total === undefined || value <= total;
        },
        message: 'Available copies cannot exceed total copies',
      },
    },
  },
  {
    timestamps: true,
  }
);

const Book = model<IBook>('Book', BookSchema);

export default Book;
