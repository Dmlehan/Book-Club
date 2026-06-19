import { Request, Response } from 'express';
import Book from '../models/Book';
import { createAuditLog } from '../utils/auditLogger';

/**
 * Add a new book to the catalog
 * POST /api/books
 */
export const createBook = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, author, isbn, genre, totalCopies, availableCopies } = req.body;

    // Validate inputs
    if (!title || !author || !isbn) {
      res.status(400).json({ error: 'Title, Author, and ISBN are required' });
      return;
    }

    // Check duplicate ISBN
    const existingBook = await Book.findOne({ isbn });
    if (existingBook) {
      res.status(400).json({ error: 'A book with this ISBN already exists in the catalog' });
      return;
    }

    // Create Book
    const book = new Book({
      title,
      author,
      isbn,
      genre,
      totalCopies: totalCopies !== undefined ? totalCopies : 1,
      availableCopies: availableCopies !== undefined ? availableCopies : (totalCopies !== undefined ? totalCopies : 1),
    });

    await book.save();

    // Audit Logging
    const staffId = req.user?.id || 'SYSTEM';
    await createAuditLog(
      'CREATE_BOOK',
      'Book',
      book._id.toString(),
      staffId,
      `Book added: Title="${title}", Author="${author}", ISBN=${isbn}, Qty=${book.totalCopies}`
    );

    res.status(201).json({
      message: 'Book added to catalog successfully',
      book,
    });
  } catch (error: any) {
    console.error('Error creating book:', error);
    if (error.name === 'ValidationError') {
      res.status(400).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Get all books with regex-based text search/filter parameters
 * GET /api/books
 */
export const getAllBooks = async (req: Request, res: Response): Promise<void> => {
  try {
    const { search, title, author, isbn, genre } = req.query;
    const filterQuery: any = {};

    // General search across title, author, and ISBN
    if (search) {
      const searchRegex = new RegExp(search as string, 'i');
      filterQuery.$or = [
        { title: searchRegex },
        { author: searchRegex },
        { isbn: searchRegex },
        { genre: searchRegex },
      ];
    }

    // Direct filters using case-insensitive regex matching
    if (title) {
      filterQuery.title = new RegExp(title as string, 'i');
    }
    if (author) {
      filterQuery.author = new RegExp(author as string, 'i');
    }
    if (isbn) {
      filterQuery.isbn = new RegExp(isbn as string, 'i');
    }
    if (genre) {
      filterQuery.genre = new RegExp(genre as string, 'i');
    }

    const books = await Book.find(filterQuery).sort({ title: 1 });
    res.status(200).json(books);
  } catch (error: any) {
    console.error('Error searching catalog:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Get a book by its MongoDB ID
 * GET /api/books/:id
 */
export const getBookById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const book = await Book.findById(id);

    if (!book) {
      res.status(404).json({ error: 'Book not found' });
      return;
    }

    res.status(200).json(book);
  } catch (error: any) {
    console.error('Error retrieving book:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Update book details and/or copy quantities
 * PUT /api/books/:id
 */
export const updateBook = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { title, author, isbn, genre, totalCopies, availableCopies } = req.body;

    const book = await Book.findById(id);
    if (!book) {
      res.status(404).json({ error: 'Book not found' });
      return;
    }

    // Capture old state for audit trails
    const oldState = {
      title: book.title,
      author: book.author,
      isbn: book.isbn,
      totalCopies: book.totalCopies,
      availableCopies: book.availableCopies,
    };

    // Update info
    if (title) book.title = title;
    if (author) book.author = author;
    if (genre !== undefined) book.genre = genre;

    if (isbn && isbn !== book.isbn) {
      const duplicateIsbn = await Book.findOne({ isbn });
      if (duplicateIsbn) {
        res.status(400).json({ error: 'ISBN is already in use by another book record' });
        return;
      }
      book.isbn = isbn;
    }

    if (totalCopies !== undefined) book.totalCopies = totalCopies;
    if (availableCopies !== undefined) book.availableCopies = availableCopies;

    await book.save();

    // Audit Logging
    const staffId = req.user?.id || 'SYSTEM';
    const changes: string[] = [];
    if (oldState.title !== book.title) changes.push(`title: "${oldState.title}"->"${book.title}"`);
    if (oldState.author !== book.author) changes.push(`author: "${oldState.author}"->"${book.author}"`);
    if (oldState.isbn !== book.isbn) changes.push(`isbn: ${oldState.isbn}->${book.isbn}`);
    if (oldState.totalCopies !== book.totalCopies) changes.push(`totalCopies: ${oldState.totalCopies}->${book.totalCopies}`);
    if (oldState.availableCopies !== book.availableCopies) changes.push(`availableCopies: ${oldState.availableCopies}->${book.availableCopies}`);

    await createAuditLog(
      'UPDATE_BOOK',
      'Book',
      book._id.toString(),
      staffId,
      `Book updated: ${changes.length > 0 ? changes.join(', ') : 'No fields changed'}`
    );

    res.status(200).json({
      message: 'Book updated successfully',
      book,
    });
  } catch (error: any) {
    console.error('Error updating book:', error);
    if (error.name === 'ValidationError') {
      res.status(400).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Delete a book from the catalog
 * DELETE /api/books/:id
 */
export const deleteBook = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const book = await Book.findById(id);

    if (!book) {
      res.status(404).json({ error: 'Book not found' });
      return;
    }

    // Delete the record
    await Book.findByIdAndDelete(id);

    // Audit Logging
    const staffId = req.user?.id || 'SYSTEM';
    await createAuditLog(
      'DELETE_BOOK',
      'Book',
      id,
      staffId,
      `Book deleted: Title="${book.title}", Author="${book.author}", ISBN=${book.isbn}`
    );

    res.status(200).json({
      message: 'Book deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting book:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
