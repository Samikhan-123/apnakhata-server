import { CreateCategoryInput, UpdateCategoryInput } from './category.validation.js';
export declare class CategoryRepository {
    findAll(userId: string): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        icon: string | null;
        userId: string;
        isSystem: boolean;
    }[]>;
    count(userId: string): Promise<number>;
    findById(userId: string, id: string): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        icon: string | null;
        userId: string;
        isSystem: boolean;
    } | null>;
    create(userId: string, data: CreateCategoryInput & {
        isSystem?: boolean;
    }): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        icon: string | null;
        userId: string;
        isSystem: boolean;
    }>;
    update(userId: string, id: string, data: UpdateCategoryInput): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        icon: string | null;
        userId: string;
        isSystem: boolean;
    }>;
    delete(userId: string, id: string): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        icon: string | null;
        userId: string;
        isSystem: boolean;
    }>;
}
declare const _default: CategoryRepository;
export default _default;
