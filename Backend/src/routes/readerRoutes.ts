import { Router } from 'express';
import {
  createReader,
  getAllReaders,
  getReaderById,
  updateReader,
  deleteReader,
} from '../controllers/readerController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

// Protect all routes within reader resource
router.use(protect);

// Route: POST /api/readers (Create new Reader)
// Route: GET /api/readers (Get all Readers)
router.route('/')
  .post(createReader)
  .get(getAllReaders);

// Route: GET /api/readers/:id (Get Reader by ID)
// Route: PUT /api/readers/:id (Update Reader details)
// Route: DELETE /api/readers/:id (Delete Reader)
router.route('/:id')
  .get(getReaderById)
  .put(updateReader)
  .delete(deleteReader);

export default router;
