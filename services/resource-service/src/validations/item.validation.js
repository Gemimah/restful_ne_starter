import { body, param } from 'express-validator';

export const createItemValidation = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').optional().trim(),
  body('status').optional().isIn(['ACTIVE', 'INACTIVE', 'ARCHIVED']),
];

export const updateItemValidation = [
  param('id').isUUID().withMessage('Valid item ID is required'),
  body('title').optional().trim().notEmpty(),
  body('description').optional().trim(),
  body('status').optional().isIn(['ACTIVE', 'INACTIVE', 'ARCHIVED']),
];

export const itemIdValidation = [
  param('id').isUUID().withMessage('Valid item ID is required'),
];
