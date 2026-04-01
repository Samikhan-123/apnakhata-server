import { Router } from 'express';
import transactionController from '../controllers/transaction.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
const router = Router();
router.use(authenticate);
router.post('/', transactionController.create);
router.get('/', transactionController.getAll);
router.delete('/:id', transactionController.delete);
export default router;
//# sourceMappingURL=transaction.routes.js.map