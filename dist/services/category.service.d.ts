export declare class CategoryService {
    create(userId: string, name: string, icon?: string): Promise<{
        userId: string;
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        icon: string | null;
    }>;
    getAll(userId: string): Promise<{
        userId: string;
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        icon: string | null;
    }[]>;
}
declare const _default: CategoryService;
export default _default;
