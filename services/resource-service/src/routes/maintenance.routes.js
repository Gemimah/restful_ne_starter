import { Router } from 'express';
import * as maintenanceController from '../controllers/maintenance.controller.js';
import {
  createMaintenanceValidation,
  maintenanceIdValidation,
} from '../validations/extinguisher.validation.js';
import { validate } from '../middleware/validate.middleware.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';

const router = Router();

router.use(authenticate);

router.get('/', maintenanceController.getAll);
router.get('/:id', maintenanceIdValidation, validate, maintenanceController.getById);
router.post('/', authorize('ADMIN', 'INSPECTOR'), createMaintenanceValidation, validate, maintenanceController.create);

export default router;
