import { ObjectLiteral } from "../common/object-literal";
import { readTable as dataAccessReadTable } from "../data-access/read-table";

export class Repository<T = any> {
    constructor(

    ) { }

    async read<T>(
        classToQuery: { new(...args: any[]): T },
        filterCondition: ObjectLiteral<T> = {} as any,
        beginsWithCondition: ObjectLiteral<T> = {} as any,
        select: (keyof T)[] = [],
    ): Promise<T[]> {
        return dataAccessReadTable(classToQuery, filterCondition, beginsWithCondition, select);
    }
}