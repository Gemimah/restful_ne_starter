import { Router } from 'express';
import * as reportController from '../controllers/report.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';

const router = Router();

router.use(authenticate);

router.get('/dashboard', reportController.dashboard);
router.get('/inventory', reportController.inventory);
router.get('/inspections', reportController.inspections);
router.get('/compliance', reportController.compliance);
router.get('/maintenance', reportController.maintenance);
router.get('/export/:type/csv', authorize('ADMIN', 'INSPECTOR'), reportController.exportCsv);
router.get('/export/:type/pdf', authorize('ADMIN', 'INSPECTOR'), reportController.exportPdf);

export default router;
