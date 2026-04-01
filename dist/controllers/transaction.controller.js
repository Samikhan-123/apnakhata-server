import transactionService from '../services/transaction.service.js';
import { createTransactionSchema } from '../schemas/transaction.schema.js';
export class TransactionController {
    async create(req, res, next) {
        try {
            const validatedData = createTransactionSchema.parse(req.body);
            const transaction = await transactionService.create(req.user.id, validatedData);
            res.status(201).json({
                success: true,
                transaction,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async getAll(req, res, next) {
        try {
            const transactions = await transactionService.getAll(req.user.id, req.query);
            res.status(200).json({
                success: true,
                transactions,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async delete(req, res, next) {
        try {
            await transactionService.delete(req.user.id, req.params.id);
            res.status(200).json({
                success: true,
                message: 'Transaction deleted successfully',
            });
        }
        catch (error) {
            next(error);
        }
    }
}
export default new TransactionController();
//# sourceMappingURL=transaction.controller.js.map