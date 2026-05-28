import { Router } from 'express';
import * as itemController from './item.controller.js';
import {
  createItemValidation,
  updateItemValidation,
  itemIdValidation,
} from './item.validation.js';
import { validate } from '../../middleware/validate.middleware.js';
import { authenticate } from '../../middleware/auth.middleware.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Items
 *   description: Sample CRUD module — rename during exam
 */

router.use(authenticate);

router.get('/', itemController.getAll);
router.get('/:id', itemIdValidation, validate, itemController.getById);
router.post('/', createItemValidation, validate, itemController.create);
router.put('/:id', updateItemValidation, validate, itemController.update);
router.delete('/:id', itemIdValidation, validate, itemController.remove);

export default router;
