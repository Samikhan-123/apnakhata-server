import cron from 'node-cron';
import recurringService from './recurring.service.js';
import logger from '../../utils/logger.js';
import * as Sentry from "@sentry/node";
// cron job for recurring transactions
export const initRecurringCron = () => {
    // Run daily at 12 PM (Noon)
    cron.schedule('0 12 * * *', async () => {
        logger.info('Running recurring transactions cron job... 🕒');
        try {
            const results = await recurringService.processDueEntries();
            if (results.length > 0) {
                logger.info(`Cron job finished. Processed ${results.length} patterns.`);
            }
        }
        catch (error) {
            logger.error('Cron job failed ❌', { error });
            Sentry.captureException(error);
        }
    });
    logger.info('Recurring transactions cron job initialized. ✅');
};
//# sourceMappingURL=recurring.cron.js.map