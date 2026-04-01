import recurringService from './recurring.service.js';
import { CreateRecurringSchema } from './recurring.validation.js';
export class RecurringController {
    async create(req, res, next) {
        try {
            const validatedData = CreateRecurringSchema.parse(req.body);
            const entry = await recurringService.createEntry(req.user.id, validatedData);
            res.status(201).json({
                success: true,
                data: entry,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async getAll(req, res, next) {
        try {
            const entries = await recurringService.getUserEntries(req.user.id);
            res.status(200).json({
                success: true,
                data: entries,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async delete(req, res, next) {
        try {
            const { id } = req.params;
            await recurringService.deleteEntry(id, req.user.id);
            res.status(200).json({
                success: true,
                message: 'Recurring entry deleted successfully',
            });
        }
        catch (error) {
            next(error);
        }
    }
    async processManual(req, res, next) {
        try {
            const result = await recurringService.triggerUserSync(req.user.id);
            res.status(200).json({
                success: true,
                data: result,
            });
        }
        catch (error) {
            next(error);
        }
    }
}
export default new RecurringController();
//# sourceMappingURL=recurring.controller.js.map