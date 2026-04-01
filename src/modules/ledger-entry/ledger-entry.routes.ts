import { Router } from 'express';
import ledgerEntryController from './ledger-entry.controller.js';
const router = Router();

/**
 * @route   POST /api/ledger-entries
 * @desc    Create a new ledger entry
 */
router.post('/', ledgerEntryController.create);

/**
 * @route   GET /api/ledger-entries
 * @desc    List all ledger entries with filters
 */
router.get('/', ledgerEntryController.getAll);

/**
 * @route   GET /api/ledger-entries/:id
 * @desc    Get a single ledger entry
 */
router.get('/export', ledgerEntryController.export);
router.get('/overview', ledgerEntryController.getOverview);
router.get('/stats', ledgerEntryController.getStats);
router.get('/:id', ledgerEntryController.getById);

/**
 * @route   PATCH /api/ledger-entries/:id
 * @desc    Update a ledger entry
 */
router.patch('/:id', ledgerEntryController.update);

/**
 * @route   DELETE /api/ledger-entries/:id
 * @desc    Delete a ledger entry
 */
router.delete('/:id', ledgerEntryController.delete);

export default router;
