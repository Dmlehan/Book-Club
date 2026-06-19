import { Router } from 'express';
import {
  createBook,
  getAllBooks,
  getBookById,
  updateBook,
  deleteBook,
} from '../controllers/bookController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

// Route: GET /api/books (Public search & list)
// Route: POST /api/books (Protected - Add new book)
router.route('/')
  .get(getAllBooks)
  .post(protect, createBook);

// Route: GET /api/books/:id (Public view book detail)
// Route: PUT /api/books/:id (Protected - Update book details)
// Route: DELETE /api/books/:id (Protected - Delete book record)
router.route('/:id')
  .get(getBookById)
  .put(protect, updateBook)
  .delete(protect, deleteBook);

export default router;
