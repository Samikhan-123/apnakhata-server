export interface LedgerEntry {
    id: string;
    amount: number;
    description: string;
    date: Date;
    type: 'INCOME' | 'EXPENSE' | 'TRANSFER';
    userId: string;
    categoryId?: string | null;
    createdAt: Date;
    updatedAt: Date;
}
