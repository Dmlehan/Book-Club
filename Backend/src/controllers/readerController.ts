import { Request, Response } from 'express';
import Reader from '../models/Reader';
import { createAuditLog } from '../utils/auditLogger';

/**
 * Create a new reader
 * POST /api/readers
 */
export const createReader = async (req: Request, res: Response): Promise<void> => {
  try {
    const { readerId, name, email, phone } = req.body;

    // Validate request inputs
    if (!readerId || !name || !email || !phone) {
      res.status(400).json({ error: 'All fields (readerId, name, email, phone) are required' });
      return;
    }

    // Check duplicate readerId
    const existingReaderId = await Reader.findOne({ readerId });
    if (existingReaderId) {
      res.status(400).json({ error: 'Reader ID is already registered' });
      return;
    }

    // Check duplicate email
    const existingEmail = await Reader.findOne({ email: email.toLowerCase() });
    if (existingEmail) {
      res.status(400).json({ error: 'Email address is already in use' });
      return;
    }

    // Create Reader
    const reader = new Reader({
      readerId,
      name,
      email: email.toLowerCase(),
      phone,
    });

    await reader.save();

    // Audit Logging
    const staffId = req.user?.id || 'SYSTEM';
    await createAuditLog(
      'CREATE_READER',
      'Reader',
      reader._id.toString(),
      staffId,
      `Reader registered: ID=${readerId}, Name=${name}, Email=${email}`
    );

    res.status(201).json({
      message: 'Reader registered successfully',
      reader,
    });
  } catch (error: any) {
    console.error('Error creating reader:', error);
    if (error.name === 'ValidationError') {
      res.status(400).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Get all readers
 * GET /api/readers
 */
export const getAllReaders = async (req: Request, res: Response): Promise<void> => {
  try {
    const readers = await Reader.find().sort({ createdAt: -1 });
    res.status(200).json(readers);
  } catch (error: any) {
    console.error('Error fetching readers:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Get a reader by ID
 * GET /api/readers/:id
 */
export const getReaderById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const reader = await Reader.findById(id);

    if (!reader) {
      res.status(404).json({ error: 'Reader not found' });
      return;
    }

    res.status(200).json(reader);
  } catch (error: any) {
    console.error('Error fetching reader by ID:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Update reader details
 * PUT /api/readers/:id
 */
export const updateReader = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, email, phone, readerId } = req.body;

    const reader = await Reader.findById(id);
    if (!reader) {
      res.status(404).json({ error: 'Reader not found' });
      return;
    }

    // Capture old state for audit details
    const oldState = {
      readerId: reader.readerId,
      name: reader.name,
      email: reader.email,
      phone: reader.phone,
    };

    // Update details
    if (name) reader.name = name;
    if (phone) reader.phone = phone;
    
    if (readerId && readerId !== reader.readerId) {
      const duplicateId = await Reader.findOne({ readerId });
      if (duplicateId) {
        res.status(400).json({ error: 'Reader ID is already in use by another account' });
        return;
      }
      reader.readerId = readerId;
    }

    if (email && email.toLowerCase() !== reader.email) {
      const duplicateEmail = await Reader.findOne({ email: email.toLowerCase() });
      if (duplicateEmail) {
        res.status(400).json({ error: 'Email address is already in use by another account' });
        return;
      }
      reader.email = email.toLowerCase();
    }

    await reader.save();

    // Audit Logging
    const staffId = req.user?.id || 'SYSTEM';
    const changes: string[] = [];
    if (oldState.readerId !== reader.readerId) changes.push(`readerId: ${oldState.readerId}->${reader.readerId}`);
    if (oldState.name !== reader.name) changes.push(`name: ${oldState.name}->${reader.name}`);
    if (oldState.email !== reader.email) changes.push(`email: ${oldState.email}->${reader.email}`);
    if (oldState.phone !== reader.phone) changes.push(`phone: ${oldState.phone}->${reader.phone}`);

    await createAuditLog(
      'UPDATE_READER',
      'Reader',
      reader._id.toString(),
      staffId,
      `Reader updated: ${changes.length > 0 ? changes.join(', ') : 'No fields changed'}`
    );

    res.status(200).json({
      message: 'Reader updated successfully',
      reader,
    });
  } catch (error: any) {
    console.error('Error updating reader:', error);
    if (error.name === 'ValidationError') {
      res.status(400).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Delete a reader
 * DELETE /api/readers/:id
 */
export const deleteReader = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const reader = await Reader.findById(id);

    if (!reader) {
      res.status(404).json({ error: 'Reader not found' });
      return;
    }

    // Delete reader
    await Reader.findByIdAndDelete(id);

    // Audit Logging
    const staffId = req.user?.id || 'SYSTEM';
    await createAuditLog(
      'DELETE_READER',
      'Reader',
      id,
      staffId,
      `Reader deleted: ID=${reader.readerId}, Name=${reader.name}, Email=${reader.email}`
    );

    res.status(200).json({
      message: 'Reader deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting reader:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
