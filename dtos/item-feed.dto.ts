// import { Column } from "../decorators/column.decorator";
import { EntityTable, FeedTable } from "../decorators/entity-table.decorator";
import { ObjectLiteral, SecondaryIndex } from "../decorators/secondary-index.decorator";

export class BaseDto {
    PK!: string;
    SK!: string;
    LSI1?: string;
    LSI2?: string;
    LSI3?: string;
    GSI1PK?: string;
    GSI1SK?: string;
    createdAt!: string;
    updatedAt!: string;
}

@EntityTable({
    table: new FeedTable(),
    keyMap: {
        PK: 'userId#entity',
        SK: 'priority#itemId',
    },
    secondaryIndexMap: {
        "PK-GSI1SK-index": {
            PK: 'userId#entity',
            SK: 'itemId',
        },
        "PK-GSI2SK-index": {
            PK: 'userId#entity',
            SK: 'itemType#priority#itemId',
        },
        "PK-GSI3SK-index": {
            PK: 'userId#entity',
            SK: 'itemCategory#priority#itemId',
        },
        "GSI4PK-GSI4SK-index": {
            PK: 'itemId',
            SK: 'updatedAt#userId',
        },
    },
})
export class ItemFeed {
    static readonly entity: string = 'ItemFeed';
    constructor(
        readonly userId?: string,
        readonly priority?: number,
        readonly itemId?: string,
        readonly createdAt?: Date,
        readonly populatedInfo?: ObjectLiteral<any>,
        readonly itemType?: string,
        readonly itemCategory?: string,
        readonly itemBuildFromId?: string,
    ){ }
}