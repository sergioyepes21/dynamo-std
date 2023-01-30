import "reflect-metadata";
import { SecondaryIndexInterface } from "./secondary-index.decorator";
export const entityTableSymbol = Symbol("EntityTableSymbol");

export type AllowedTableSecondaryIndexes = |
    'GSI1' |
    'GSI2' |
    'GSI3' |
    'GSI4' |
    never;


export type SecondaryIndexType = {
    PK: string[],
    SK: string[],
    optional?: boolean,
}

export interface TableInterface<T extends Object = any> {
    tableName: string,
    secondaryIndexMap: { [indexAttributeName in AllowedTableSecondaryIndexes]: SecondaryIndexInterface }
}

export class FeedTable implements TableInterface {
    tableName = 'feed';
    secondaryIndexMap: { [indexAttributeName in AllowedTableSecondaryIndexes]: SecondaryIndexInterface } = {
        'GSI1': {
            globalOrLocal: 'global',
            indexAttributeName: 'GSI1PK-GSI1SK-index',
            PK: 'GSI1PK',
            SK: 'GSI1SK',
        },
        'GSI2': {
            globalOrLocal: 'global',
            indexAttributeName: 'GSI2PK-GSI2SK-index',
            PK: 'GSI2PK',
            SK: 'GSI2SK',
        },
        'GSI3': {
            globalOrLocal: 'global',
            indexAttributeName: 'GSI3PK-GSI3SK-index',
            PK: 'GSI3PK',
            SK: 'GSI3SK',
        },
        'GSI4': {
            globalOrLocal: 'global',
            indexAttributeName: 'GSI4PK-GSI4SK-index',
            PK: 'GSI4PK',
            SK: 'GSI4SK',
        },
    }
}

export interface EntityTableInterface {
    table: FeedTable;
    entity: string;
    keyMap: {
        PK: string[],
        SK: string[],
    };
    secondaryIndexMap: {
        [secondaryIndexName in AllowedTableSecondaryIndexes]?: SecondaryIndexType
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