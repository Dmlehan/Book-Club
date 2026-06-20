import { Request, Response } from 'express';
import Lending from '../models/Lending';
import Book from '../models/Book';
import Reader from '../models/Reader';
import { createAuditLog } from '../utils/auditLogger';

/**
 * Lend a book to a registered reader
 * POST /api/lending
 */
export const lendBook = async (req: Request, res: Response): Promise<void> => {
  try {
    const { bookId, readerId, issueDate } = req.body;

    // Validate inputs
    if (!bookId || !readerId) {
      res.status(400).json({ error: 'Book ID and Reader ID are required' });
      return;
    }

    // Check if Reader exists
    const reader = await Reader.findById(readerId);
    if (!reader) {
      res.status(404).json({ error: 'Reader membership file not found' });
      return;
    }

    // Check if Book exists
    const targetBook = await Book.findById(bookId);
    if (!targetBook) {
      res.status(404).json({ error: 'Book catalogue title not found' });
      return;
    }

    // Check if copies are available
    if (targetBook.availableCopies <= 0) {
      res.status(400).json({ error: 'No copies of this book are currently available' });
      return;
    }

    // Decrement available copies atomically to avoid race conditions
    const updatedBook = await Book.findOneAndUpdate(
      { _id: bookId, availableCopies: { $gt: 0 } },
      { $inc: { availableCopies: -1 } },
      { new: true }
    );

    if (!updatedBook) {
      res.status(400).json({ error: 'Failed to checkout: book became out of stock' });
      return;
    }

    // Save Lending record
    const lending = new Lending({
      book: bookId,
      reader: readerId,
      issueDate: issueDate || new Date(),
      status: 'LENT',
    });

    await lending.save();

    // Log the transaction
    const performedBy = req.user?.id || '';
    await createAuditLog(
      'LEND_BOOK',
      'Lending',
      lending._id.toString(),
      performedBy,
      `Librarian checked out '${updatedBook.title}' to reader '${reader.name}' (ID: ${reader.readerId})`
    );

    res.status(201).json({
      message: 'Book lent successfully',
      lending,
    });
  } catch (error: any) {
    console.error('Error in lending book:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Return a lent book and increment stock counts
 * POST /api/lending/:id/return
 */
export const returnBook = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Find Lending document
    const lending = await Lending.findById(id);
    if (!lending) {
      res.status(404).json({ error: 'Lending record not found' });
      return;
    }

    // Verify if already returned
    if (lending.status === 'RETURNED') {
      res.status(400).json({ error: 'This book checkout has already been returned' });
      return;
    }

    // Update Lending status and return date
    lending.status = 'RETURNED';
    lending.returnDate = new Date();
    await lending.save();

    // Increment Book availability atomically
    const book = await Book.findByIdAndUpdate(
      lending.book,
      { $inc: { availableCopies: 1 } },
      { new: true }
    );

    // Log the transaction
    const performedBy = req.user?.id || '';
    await createAuditLog(
      'RETURN_BOOK',
      'Lending',
      lending._id.toString(),
      performedBy,
      `Librarian processed book return for '${book?.title || 'Book'}'`
    );

    res.status(200).json({
      message: 'Book returned successfully',
      lending,
    });
  } catch (error: any) {
    console.error('Error in returning book:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Get all lending logs (filterable by book, reader, or status)
 * GET /api/lending
 */
export const getAllLendings = async (req: Request, res: Response): Promise<void> => {
  try {
    const { reader, book, status } = req.query;
    const filter: any = {};

    if (reader) filter.reader = reader;
    if (book) filter.book = book;
    if (status) filter.status = status;

    const lendings = await Lending.find(filter)
      .populate('book', 'title isbn author')
      .populate('reader', 'name email readerId phone')
      .sort({ createdAt: -1 });

    res.status(200).json(lendings);
  } catch (error: any) {
    console.error('Error fetching lendings list:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Get a specific lending transaction by ID
 * GET /api/lending/:id
 */
export const getLendingById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const lending = await Lending.findById(id)
      .populate('book', 'title isbn author')
      .populate('reader', 'name email readerId phone');

    if (!lending) {
      res.status(404).json({ error: 'Lending record not found' });
      return;
    }

    res.status(200).json(lending);
  } catch (error: any) {
    console.error('Error retrieving lending record:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
