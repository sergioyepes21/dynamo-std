import { EntityTable, FeedTable } from "../decorators/entity-table.decorator";
import { ObjectLiteral, SecondaryIndex } from "../decorators/secondary-index.decorator";


// @EntityTable({
//     table: new FeedTable(),
//     keyMap: {
//         PK: 'userId#entity',
//         SK: 'createdAt',
//     },
//     secondaryIndexMap: {
//         "GSI1PK-GSI1SK-index": {
//             PK: 'itemId',
//             SK: 'createdAt',
//         },
//         "LSI1-index": {
//             SK: 'itemId',
//         },
//         "LSI2-index": {
//             SK: 'itemType#priority',
//         },
//         "LSI3-index": {
//             SK: 'itemCategory#priority',
//         },
//     }
// })
export class ConsumedFeed {
    static readonly entity: string = 'ConsumedFeed';
    userId!: string;
    itemId!: string;
    createdAt!: Date;
    score!: number;
    populatedInfo!: ObjectLiteral;
    itemType!: string;
    itemCategory!: string;
    itemBuildFromId!: string;
}