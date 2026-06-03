import { body, param } from 'express-validator';

const extinguisherTypes = ['WATER', 'CO2', 'FOAM', 'DRY_CHEMICAL'];
const extinguisherSizes = ['LB_1_5', 'LB_5', 'LB_9', 'LB_12'];
const extinguisherStatuses = ['ACTIVE', 'EXPIRED', 'NEEDS_INSPECTION', 'OUT_OF_SERVICE'];

function assertExpiryAfterInstallation(installationDate, expiryDate) {
  const install = new Date(installationDate);
  const expiry = new Date(expiryDate);
  install.setHours(0, 0, 0, 0);
  expiry.setHours(0, 0, 0, 0);
  if (expiry <= install) {
    throw new Error('Expiry date must be after installation date');
  }
}

export const createExtinguisherValidation = [
  body('serialNumber').trim().notEmpty().withMessage('Serial number is required'),
  body('location').trim().notEmpty().withMessage('Location is required'),
  body('type').isIn(extinguisherTypes).withMessage('Invalid extinguisher type'),
  body('size').isIn(extinguisherSizes).withMessage('Invalid extinguisher size'),
  body('installationDate').isISO8601().withMessage('Valid installation date is required'),
  body('expiryDate')
    .isISO8601()
    .withMessage('Valid expiry date is required')
    .custom((expiryDate, { req }) => {
      assertExpiryAfterInstallation(req.body.installationDate, expiryDate);
      return true;
    }),
  body('status').optional().isIn(extinguisherStatuses),
  body('assignedInspectorId').optional({ nullable: true }).isUUID().withMessage('Valid inspector ID required'),
];

export const updateExtinguisherValidation = [
  param('id').isUUID().withMessage('Valid extinguisher ID is required'),
  body('serialNumber').optional().trim().notEmpty(),
  body('location').optional().trim().notEmpty(),
  body('type').optional().isIn(extinguisherTypes),
  body('size').optional().isIn(extinguisherSizes),
  body('installationDate').optional().isISO8601(),
  body('expiryDate')
    .optional()
    .isISO8601()
    .custom((expiryDate, { req }) => {
      if (req.body.installationDate) {
        assertExpiryAfterInstallation(req.body.installationDate, expiryDate);
      }
      return true;
    }),
  body('status').optional().isIn(extinguisherStatuses),
  body('assignedInspectorId').optional({ nullable: true }).isUUID(),
];

export const extinguisherIdValidation = [
  param('id').isUUID().withMessage('Valid extinguisher ID is required'),
];

export const scheduleInspectionValidation = [
  body('extinguisherId').isUUID().withMessage('Valid extinguisher ID is required'),
  body('scheduledDate').isISO8601().withMessage('Valid inspection date is required'),
  body('scheduledTime').matches(/^([01]\d|2[0-3]):[0-5]\d$/).withMessage('Time must be HH:MM format'),
  body('notes').optional().trim(),
];

export const updateInspectionValidation = [
  param('id').isUUID().withMessage('Valid inspection ID is required'),
  body('status').optional().isIn(['PENDING', 'COMPLETED', 'OVERDUE', 'CANCELLED']),
  body('notes').optional().trim(),
];

export const inspectionIdValidation = [
  param('id').isUUID().withMessage('Valid inspection ID is required'),
];

export const createMaintenanceValidation = [
  body('extinguisherId').isUUID().withMessage('Valid extinguisher ID is required'),
  body('actionTaken').trim().notEmpty().withMessage('Action taken is required'),
  body('maintenanceDate').isISO8601().withMessage('Valid maintenance date is required'),
  body('issuesIdentified').optional().trim(),
  body('notes').optional().trim(),
];

export const maintenanceIdValidation = [
  param('id').isUUID().withMessage('Valid maintenance log ID is required'),
];
