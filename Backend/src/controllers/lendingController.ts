import { Request, Response } from 'express';
import Lending from '../models/Lending';
import Book from '../models/Book';
import Reader from '../models/Reader';
import { createAuditLog } from '../utils/auditLogger';
import { sendEmail } from '../utils/mailer';

/**
 * Helper to update overdue lending status records dynamically
 */
const updateOverdueStatus = async (): Promise<void> => {
  try {
    await Lending.updateMany(
      { status: 'LENT', dueDate: { $lt: new Date() } },
      { $set: { status: 'OVERDUE' } }
    );
  } catch (error) {
    console.error('Failed to update overdue statuses:', error);
  }
};

/**
 * Lend a book to a registered reader
 * POST /api/lending
 */
export const lendBook = async (req: Request, res: Response): Promise<void> => {
  try {
    const { bookId, readerId, issueDate, dueDate } = req.body;

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
      dueDate: dueDate || undefined,
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
    
    // Check and update overdue states before fetching
    await updateOverdueStatus();

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

    // Check and update overdue states
    await updateOverdueStatus();

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

/**
 * Send an overdue alert email to a patron
 * POST /api/lending/:id/alert
 */
export const sendOverdueAlert = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const lending = await Lending.findById(id)
      .populate('book', 'title isbn author')
      .populate('reader', 'name email readerId');

    if (!lending) {
      res.status(404).json({ error: 'Lending record not found' });
      return;
    }

    const book = lending.book as any;
    const reader = lending.reader as any;

    if (!reader || !reader.email) {
      res.status(400).json({ error: 'Patron email address is missing' });
      return;
    }

    // Calculate overdue duration days
    const overdueDays = Math.ceil(
      (new Date().getTime() - new Date(lending.dueDate).getTime()) / (1000 * 3600 * 24)
    );

    // Style elements for the overdue notification template
    const emailHtml = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 25px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
        <div style="background-color: #0f172a; padding: 20px; border-radius: 8px; text-align: center;">
          <h2 style="color: #10b981; margin: 0; font-size: 22px;">Book-Club Library Hub</h2>
          <p style="color: #94a3b8; margin: 5px 0 0; font-size: 10px; text-transform: uppercase; letter-spacing: 2px; font-weight: bold;">Overdue Notice</p>
        </div>
        <div style="padding: 25px 15px; color: #334155; line-height: 1.6;">
          <p style="font-size: 15px; margin-top: 0;">Dear <strong>${reader.name}</strong>,</p>
          <p>This is a friendly reminder that a book borrowed under your library membership is now overdue. Please review details below:</p>
          
          <div style="background-color: #fff1f2; padding: 20px; border-left: 4px solid #f43f5e; border-radius: 6px; margin: 25px 0;">
            <p style="margin: 0 0 8px; font-size: 14px;"><strong>Book Title:</strong> ${book.title}</p>
            <p style="margin: 0 0 8px; font-size: 14px;"><strong>Author:</strong> ${book.author}</p>
            <p style="margin: 0 0 8px; font-size: 14px;"><strong>ISBN:</strong> ${book.isbn}</p>
            <p style="margin: 0 0 8px; font-size: 14px;"><strong>Due Date:</strong> ${new Date(lending.dueDate).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            <p style="margin: 0; font-size: 14px; color: #e11d48;"><strong>Overdue Duration:</strong> ${overdueDays} day(s)</p>
          </div>
          
          <p>Please return this volume to the circulation desk as soon as possible to avoid patreon account suspensions or penalties.</p>
          <p>If you have already returned this title, please ignore this warning.</p>
          <p style="margin-bottom: 0; padding-top: 15px;">Best regards,<br><strong>Book-Club Administration</strong></p>
        </div>
        <div style="text-align: center; font-size: 11px; color: #94a3b8; padding-top: 20px; border-top: 1px solid #e2e8f0; font-style: italic;">
          This is an automated notification. Replies are not monitored.
        </div>
      </div>
    `;

    // Dispatch email
    await sendEmail(
      reader.email,
      `⚠️ Overdue Notice: '${book.title}' - Return Book Immediately`,
      emailHtml
    );

    // Log alert event
    const performedBy = req.user?.id || '';
    await createAuditLog(
      'SEND_ALERT',
      'Lending',
      lending._id.toString(),
      performedBy,
      `Sent overdue notice email to reader '${reader.name}' for book '${book.title}'`
    );

    res.status(200).json({ message: 'Overdue alert notification dispatched successfully' });
  } catch (error: any) {
    console.error('Error sending overdue alert:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};
