import AuditLog from '../models/AuditLog';

/**
 * Helper to log actions into the database
 * 
 * @param action - Action name (e.g., 'CREATE_READER', 'DELETE_READER')
 * @param collectionName - The model name (e.g., 'Reader', 'Book')
 * @param documentId - The ID of the target document
 * @param performedBy - The User ID of the staff member who initiated the action
 * @param details - Optional details about changes or state
 */
export const createAuditLog = async (
  action: string,
  collectionName: string,
  documentId: string,
  performedBy: string,
  details?: string
): Promise<void> => {
  try {
    const log = new AuditLog({
      action,
      collectionName,
      documentId,
      performedBy,
      details,
    });
    await log.save();
  } catch (error) {
    console.error('Failed to create audit log:', error);
  }
};
