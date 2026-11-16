import type { Provider } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';

import { DataSource, Repository } from 'typeorm';
import type { EntityManager, ObjectLiteral, ObjectType } from 'typeorm';
import { vi } from 'vitest';

// The data source is never initialized, so its manager and repositories are real instances that never connect to the database
export const createEntityManager = (): EntityManager => new DataSource({ type: 'postgres' }).manager;

// Builds the metadata of the entities like on application start, while the driver never connects to the database
export const initializeDataSource = async (entities: ObjectType<ObjectLiteral>[]): Promise<DataSource> => {
    const dataSource = new DataSource({ type: 'postgres', entities });

    vi.spyOn(dataSource.driver, 'connect').mockResolvedValue();
    vi.spyOn(dataSource.driver, 'afterConnect').mockResolvedValue();

    return dataSource.initialize();
};

export const provideRepository = <Entity extends ObjectLiteral>(entity: ObjectType<Entity>, manager: EntityManager): Provider => ({
    provide: getRepositoryToken(entity),
    useValue: new Repository(entity, manager),
});

export const spyOnTransaction = (manager: EntityManager): EntityManager => {
    vi.spyOn(manager, 'transaction').mockImplementation(async (...args: unknown[]) => {
        const runInTransaction = args.at(-1) as (transactionManager: EntityManager) => Promise<unknown>;

        return runInTransaction(manager);
    });

    return manager;
};

// Like TypeORM, creates the entity from the plain object, which is the last argument
// The spy is typed after the last overload of create, which creates many entities, so the plain object is cast to match it
export const spyOnCreate = (manager: EntityManager): EntityManager => {
    vi.spyOn(manager, 'create').mockImplementation((...args: unknown[]) => args.at(-1) as unknown[]);

    return manager;
};
