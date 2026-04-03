import { LedgerEntry, Category } from '@prisma/client';
// export service for ledger entries
export class ExportService {
  generateCSV(entries: (LedgerEntry & { category: Category | null })[]) {
    const header = ['Date', 'Description', 'Amount', 'Type', 'Category'];
    const rows = entries.map(entry => [
      entry.date.toISOString().split('T')[0],
      entry.description,
      entry.amount.toString(),
      entry.type,
      entry.category?.name || 'Uncategorized'
    ]);

    const csvContent = [
      header.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    return csvContent;
  }
}

export default new ExportService();
