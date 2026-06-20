import { Router } from 'express';
import { getAllAuditLogs } from '../controllers/auditController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

// Route: GET /api/audit (Protected - retrieve all audit logs)
router.get('/', protect, getAllAuditLogs);

export default router;
