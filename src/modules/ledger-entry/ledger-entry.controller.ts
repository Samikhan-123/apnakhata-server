import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middlewares/auth.middleware.js';
import ledgerEntryService from './ledger-entry.service.js';
import exportService from './export.service.js';
import { 
  createLedgerEntrySchema, 
  updateLedgerEntrySchema, 
  ledgerEntryFiltersSchema 
} from './ledger-entry.validation.js';

export class LedgerEntryController {
  /**
   * Create a new ledger entry
   */
  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const validatedData = createLedgerEntrySchema.parse(req.body);
      const ledgerEntry = await ledgerEntryService.create(req.user.id, validatedData);

      res.status(201).json({
        success: true,
        data: ledgerEntry,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * List all ledger entries for current user
   */
  async getAll(req: AuthRequest, res: Response, next: NextFunction) {
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
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get a single ledger entry
   */
  async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const ledgerEntry = await ledgerEntryService.getById(req.user.id, id);
      
      res.status(200).json({
        success: true,
        data: ledgerEntry,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update a ledger entry
   */
  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const validatedData = updateLedgerEntrySchema.parse(req.body);
      const ledgerEntry = await ledgerEntryService.update(req.user.id, id, validatedData);

      res.status(200).json({
        success: true,
        data: ledgerEntry,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete a ledger entry
   */
  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      await ledgerEntryService.delete(req.user.id, id);
      
      res.status(200).json({
        success: true,
        message: 'Ledger entry deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Export ledger entries as CSV
   */
  async export(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const filters = ledgerEntryFiltersSchema.parse(req.query);
      const { page, limit, ...restFilters } = filters;
      const result = await ledgerEntryService.getAll(req.user.id, { ...restFilters, page: 1, limit: 10000 });
      
      const format = req.query.format as string;
      
      if (format === 'json') {
        return res.status(200).json({
          success: true,
          data: result.items
        });
      }

      const csv = exportService.generateCSV(result.items as any);

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=ledger_export_${new Date().toISOString().split('T')[0]}.csv`);
      res.status(200).send(csv);
    } catch (error) {
      next(error);
    }
  }

  async getOverview(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const filters = ledgerEntryFiltersSchema.parse(req.query);
      const stats = await ledgerEntryService.getOverview(req.user.id, filters);
      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get ledger statistics for charts
   */
  async getStats(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const filters = ledgerEntryFiltersSchema.parse(req.query);
      const stats = await ledgerEntryService.getStats(req.user.id, filters);
      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new LedgerEntryController();
