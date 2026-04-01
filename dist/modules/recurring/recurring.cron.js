import cron from 'node-cron';
import recurringService from './recurring.service.js';
export const initRecurringCron = () => {
    // Run daily at 12 PM (Noon)
    cron.schedule('0 12 * * *', async () => {
        console.log('Running recurring transactions cron job... 🕒');
        try {
            const results = await recurringService.processDueEntries();
            if (results.length > 0) {
                console.log(`Cron job finished. Processed ${results.length} patterns.`);
            }
        }
        catch (error) {
            console.error('Cron job failed:', error);
        }
    });
    console.log('Recurring transactions cron job initialized. ✅');
};
//# sourceMappingURL=recurring.cron.js.map