import "reflect-metadata";
import { SecondaryIndexInterface } from "./secondary-index.decorator";
export const entityTableSymbol = Symbol("EntityTableSymbol");

export type AllowedTableSecondaryIndexes = |
    'PK-GSI1SK-index' |
    'PK-GSI2SK-index' |
    'PK-GSI3SK-index' |
    'GSI4PK-GSI4SK-index'


export interface TableInterface<T extends Object = any> {
    tableName: string,
    secondaryIndexMap: { [indexAttributeName in AllowedTableSecondaryIndexes]: SecondaryIndexInterface }
}

export class FeedTable implements TableInterface {
    tableName = 'feed';
    secondaryIndexMap: { [indexAttributeName in AllowedTableSecondaryIndexes]: SecondaryIndexInterface } = {
        'PK-GSI1SK-index': {
            globalOrLocal: 'global',
            indexAttributeName: 'GSI1PK-GSI1SK-index',
            PK: 'PK',
            SK: 'GSI1SK',
        },
        'PK-GSI2SK-index': {
            globalOrLocal: 'global',
            indexAttributeName: 'PK-GSI2SK-index',
            PK: 'PK',
            SK: 'GSI2SK',
        },
        'PK-GSI3SK-index': {
            globalOrLocal: 'global',
            indexAttributeName: 'PK-GSI3SK-index',
            PK: 'PK',
            SK: 'GSI3SK',
        },
        'GSI4PK-GSI4SK-index': {
            globalOrLocal: 'global',
            indexAttributeName: 'GSI4PK-GSI4SK-index',
            PK: 'GSI4PK',
            SK: 'GSI4SK',
        },
    }
}

export interface EntityTableInterface {
    table: FeedTable;
    keyMap: {
        PK: string,
        SK: string,
    };
    secondaryIndexMap: {
        [secondaryIndexName in AllowedTableSecondaryIndexes]?: {
            PK?: string,
            SK: string,
        }
    };
    // projectExpressionColumns: string[]
}

export const getEntityTableMetadata = <T extends Object>(
    target: T
): EntityTableInterface => {
    return Reflect.getMetadata(entityTableSymbol, target);
}


/**
 * Decorator that indicates if a property should be obfuscated
 */
export const EntityTable = (metadata: EntityTableInterface): any => {
    return (target: any) => {
        // let entityMetadata = getEntityTableMetadata(target);
        // if(entityMetadata?.projectExpressionColumns) {
        //     metadata.projectExpressionColumns = entityMetadata.projectExpressionColumns
        // }
        return Reflect.defineMetadata(entityTableSymbol, metadata, target);
    }
}