import { LedgerEntry, Category } from '@prisma/client';
export declare class ExportService {
    generateCSV(entries: (LedgerEntry & {
        category: Category | null;
    })[]): string;
}
declare const _default: ExportService;
export default _default;
