import { ObjectLiteral } from "../common/object-literal";
import { readTable as dataAccessReadTable } from "../data-access/read-table";
import { createRecord as dataAccessCreateRecord } from "../data-access/create-record";
import { BaseEntity } from "../common/base-entity";

export class Repository<T = any> {
    constructor(

    ) { }

    async read<T>(
        classToQuery: { new(...args: any[]): T },
        filterCondition: ObjectLiteral<T> = {} as any,
        beginsWithCondition: ObjectLiteral<T> = {} as any,
        select: (keyof T)[] = [],
    ): Promise<T[]> {
        return dataAccessReadTable<T>(classToQuery, filterCondition, beginsWithCondition, select);
    }

    async create<T>(
        classToQuery: { new(...args: any[]): T },
        newRecord: ObjectLiteral<T>,
    ): Promise<BaseEntity> {
        return dataAccessCreateRecord<T>(classToQuery, newRecord);
    }
}