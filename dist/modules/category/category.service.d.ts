import { CreateCategoryInput, UpdateCategoryInput } from './category.validation.js';
export declare class CategoryService {
    /**
     * List all categories for a user
     */
    getAll(userId: string): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        icon: string | null;
        userId: string;
        isSystem: boolean;
    }[]>;
    /**
     * Get a single category
     */
    getById(userId: string, id: string): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        icon: string | null;
        userId: string;
        isSystem: boolean;
    }>;
    /**
    * Create a new category
    */
    create(userId: string, data: CreateCategoryInput): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        icon: string | null;
        userId: string;
        isSystem: boolean;
    }>;
    /**
     * Update a category
     */
    update(userId: string, id: string, data: UpdateCategoryInput): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        icon: string | null;
        userId: string;
        isSystem: boolean;
    }>;
    delete(userId: string, id: string): Promise<void>;
}
declare const _default: CategoryService;
export default _default;
