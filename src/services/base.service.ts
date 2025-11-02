export abstract class BaseService<T> {
    abstract create(data: Partial<T>): Promise<T>;
    abstract findAll(): Promise<T[]>;
    abstract update(id: string, updates: Partial<T>): Promise<T | null>;
    abstract delete(id: string): Promise<T | null>;
}
