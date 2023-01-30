// import { Column } from "../decorators/column.decorator";
import { BaseEntity } from "../common/base-entity";
import { ObjectLiteral } from "../common/object-literal";
import { EntityTable, FeedTable } from "../decorators/entity-table.decorator";
import { Repository } from "../repository/repository";


@EntityTable({
    table: new FeedTable(),
    entity: 'ItemFeed',
    keyMap: {
        PK: ['userId', 'entity'],
        SK: ['priority', 'itemId'],
    },
    secondaryIndexMap: {
        "GSI1": {
            PK: ['userId', 'entity'],
            SK: ['itemId'],
        },
        "GSI2": {
            PK: ['userId', 'entity'],
            SK: ['itemType', 'priority', 'itemId'],
        },
        "GSI3": {
            PK: ['userId', 'entity'],
            SK: ['itemCategory', 'priority', 'itemId'],
            optional: true,
        },
        "GSI4": {
            PK: ['itemId'],
            SK: ['updatedAt', 'userId'],
        },
    },
})
export class ItemFeed extends BaseEntity {
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
    ) {
        super();
    }


    static async getUserItemFeed(
        repository: Repository<ItemFeed>,
        userId: string,
    ): Promise<ItemFeed> {
        const queryResult = await repository.read<ItemFeed>(ItemFeed, { userId }, {}, []);
        return queryResult[0] ?? null;
    }

    static async create(
        repository: Repository<ItemFeed>,
        itemToCreate: ItemFeed,
    ): Promise<ItemFeed> {
        return repository.create<ItemFeed>(ItemFeed, itemToCreate);
    }
}