import { DeleteResult, InsertResult, UpdateResult } from 'typeorm';

export const buildInsertResult = (): InsertResult => Object.assign(new InsertResult(), { identifiers: [], generatedMaps: [], raw: [] });

export const buildUpdateResult = (affected = 1): UpdateResult => Object.assign(new UpdateResult(), { affected, generatedMaps: [], raw: [] });

export const buildDeleteResult = (affected = 1): DeleteResult => Object.assign(new DeleteResult(), { affected, raw: [] });
