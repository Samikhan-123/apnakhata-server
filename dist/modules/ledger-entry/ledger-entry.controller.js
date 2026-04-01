import ledgerEntryService from './ledger-entry.service.js';
import exportService from './export.service.js';
import { createLedgerEntrySchema, updateLedgerEntrySchema, ledgerEntryFiltersSchema } from './ledger-entry.validation.js';
export class LedgerEntryController {
    /**
     * Create a new ledger entry
     */
    async create(req, res, next) {
        try {
            const validatedData = createLedgerEntrySchema.parse(req.body);
            const ledgerEntry = await ledgerEntryService.create(req.user.id, validatedData);
            res.status(201).json({
                success: true,
                data: ledgerEntry,
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * List all ledger entries for current user
     */
    async getAll(req, res, next) {
        try {
            const filters = ledgerEntryFiltersSchema.parse(req.query);
            const result = await ledgerEntryService.getAll(req.user.id, filters);
            res.status(200).json({
                success: true,
                data: result.items,
                pagination: {
                    total: result.total,
                    page: result.page,
                    limit: result.limit
                }
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Get a single ledger entry
     */
    async getById(req, res, next) {
        try {
            const id = req.params.id;
            const ledgerEntry = await ledgerEntryService.getById(req.user.id, id);
            res.status(200).json({
                success: true,
                data: ledgerEntry,
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Update a ledger entry
     */
    async update(req, res, next) {
        try {
            const id = req.params.id;
            const validatedData = updateLedgerEntrySchema.parse(req.body);
            const ledgerEntry = await ledgerEntryService.update(req.user.id, id, validatedData);
            res.status(200).json({
                success: true,
                data: ledgerEntry,
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Delete a ledger entry
     */
    async delete(req, res, next) {
        try {
            const id = req.params.id;
            await ledgerEntryService.delete(req.user.id, id);
            res.status(200).json({
                success: true,
                message: 'Ledger entry deleted successfully',
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Export ledger entries as CSV
     */
    async export(req, res, next) {
        try {
            const filters = ledgerEntryFiltersSchema.parse(req.query);
            const { page, limit, ...restFilters } = filters;
            const result = await ledgerEntryService.getAll(req.user.id, { ...restFilters, page: 1, limit: 10000 });
            const csv = exportService.generateCSV(result.items);
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', `attachment; filename=ledger_export_${new Date().toISOString().split('T')[0]}.csv`);
            res.status(200).send(csv);
        }
        catch (error) {
            next(error);
        }
    }
    async getOverview(req, res, next) {
        try {
            const filters = ledgerEntryFiltersSchema.parse(req.query);
            const stats = await ledgerEntryService.getOverview(req.user.id, filters);
            res.status(200).json({
                success: true,
                data: stats,
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Get ledger statistics for charts
     */
    async getStats(req, res, next) {
        try {
            const filters = ledgerEntryFiltersSchema.parse(req.query);
            const stats = await ledgerEntryService.getStats(req.user.id, filters);
            res.status(200).json({
                success: true,
                data: stats,
            });
        }
        catch (error) {
            next(error);
        }
    }
}
export default new LedgerEntryController();
//# sourceMappingURL=ledger-entry.controller.js.map