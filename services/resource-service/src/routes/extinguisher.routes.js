import { Router } from 'express';
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
router.post('/', authorize('ADMIN', 'INSPECTOR'), createExtinguisherValidation, validate, extinguisherController.create);
router.put('/:id', authorize('ADMIN', 'INSPECTOR'), updateExtinguisherValidation, validate, extinguisherController.update);
router.delete('/:id', authorize('ADMIN'), extinguisherIdValidation, validate, extinguisherController.remove);

export default router;
