import { Router } from 'express';
import * as itemController from '../controllers/item.controller.js';
import {
  createItemValidation,
  updateItemValidation,
  itemIdValidation,
} from '../validations/item.validation.js';
import { validate } from '../middleware/validate.middleware.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

router.use(authenticate);

router.get('/', itemController.getAll);
router.get('/:id', itemIdValidation, validate, itemController.getById);
router.post('/', createItemValidation, validate, itemController.create);
router.put('/:id', updateItemValidation, validate, itemController.update);
router.delete('/:id', itemIdValidation, validate, itemController.remove);

export default router;
