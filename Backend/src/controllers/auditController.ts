import { Request, Response } from 'express';
import AuditLog from '../models/AuditLog';

/**
 * Get all system audit log records
 * GET /api/audit
 */
export const getAllAuditLogs = async (_req: Request, res: Response): Promise<void> => {
  try {
    const logs = await AuditLog.find({})
      .populate('performedBy', 'username name')
      .sort({ timestamp: -1 });

    res.status(200).json(logs);
  } catch (error: any) {
    console.error('Error fetching audit logs:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
