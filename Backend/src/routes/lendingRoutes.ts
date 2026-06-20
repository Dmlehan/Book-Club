import { Router } from 'express';
import { 
  lendBook, 
  returnBook, 
  getAllLendings, 
  getLendingById,
  sendOverdueAlert
} from '../controllers/lendingController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

// Secure all lending routes using JWT middleware
router.post('/', protect, lendBook);
router.post('/:id/return', protect, returnBook);
router.post('/:id/alert', protect, sendOverdueAlert);
router.get('/', protect, getAllLendings);
router.get('/:id', protect, getLendingById);

export default router;
