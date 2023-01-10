// import { Column } from "../decorators/column.decorator";
import { EntityTable, FeedTable } from "../decorators/entity-table.decorator";
import { ObjectLiteral, SecondaryIndex } from "../decorators/secondary-index.decorator";
import { Repository } from "../repository/repository";

export class BaseDto {
    PK?: string;
    SK?: string;
    LSI1?: string;
    LSI2?: string;
    LSI3?: string;
    GSI1PK?: string;
    GSI1SK?: string;
    createdAt?: string;
    updatedAt?: string;
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
        public userId?: string,
        public priority?: number,
        public itemId?: string,
        public createdAt?: Date,
        public updatedAt?: Date,
        public populatedInfo?: ObjectLiteral<any>,
        public itemType?: string,
        public itemCategory?: string,
        public itemBuildFromId?: string,
    ) { }


    static async getUserItemFeed(
        repository: Repository<ItemFeed>,
        userId: string,
    ): Promise<ItemFeed> {
        const queryResult = await repository.read<ItemFeed>(ItemFeed, { userId }, {}, []);
        return queryResult[0] ?? null;
    }
}