import { Router } from 'express';
import recurringController from './recurring.controller.js';
const router = Router();

router.post('/', recurringController.create);
router.get('/', recurringController.getAll);
router.delete('/:id', recurringController.delete);
router.post('/process-due', recurringController.processManual); // Manual trigger for testing

export default router;
