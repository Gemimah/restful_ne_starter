import { Router } from 'express';
import { body } from 'express-validator';
import * as extinguisherController from '../controllers/extinguisher.controller.js';
import {
  createExtinguisherValidation,
  updateExtinguisherValidation,
  extinguisherIdValidation,
} from '../validations/extinguisher.validation.js';
import { validate } from '../middleware/validate.middleware.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';

const router = Router();

router.use(authenticate);

router.get('/', extinguisherController.getAll);
router.get('/:id', extinguisherIdValidation, validate, extinguisherController.getById);
router.post('/', authorize('ADMIN'), createExtinguisherValidation, validate, extinguisherController.create);
router.put('/:id', authorize('ADMIN', 'INSPECTOR'), updateExtinguisherValidation, validate, extinguisherController.update);
router.patch(
  '/:id/assign',
  authorize('ADMIN'),
  extinguisherIdValidation,
  body('assignedInspectorId').optional({ nullable: true }).isUUID().withMessage('Valid inspector ID required'),
  validate,
  extinguisherController.assignInspector
);
router.delete('/:id', authorize('ADMIN'), extinguisherIdValidation, validate, extinguisherController.remove);

export default router;
