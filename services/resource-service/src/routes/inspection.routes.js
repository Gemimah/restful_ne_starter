import { Router } from 'express';
import * as inspectionController from '../controllers/inspection.controller.js';
import {
  scheduleInspectionValidation,
  updateInspectionValidation,
  inspectionIdValidation,
} from '../validations/extinguisher.validation.js';
import { validate } from '../middleware/validate.middleware.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';

const router = Router();

router.use(authenticate);

router.get('/', inspectionController.getAll);
router.get('/:id', inspectionIdValidation, validate, inspectionController.getById);
router.post('/', scheduleInspectionValidation, validate, inspectionController.schedule);
router.patch('/:id', authorize('ADMIN', 'INSPECTOR'), updateInspectionValidation, validate, inspectionController.update);

export default router;
