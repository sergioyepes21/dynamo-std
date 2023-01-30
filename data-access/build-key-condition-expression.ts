import { DynamoDB } from "aws-sdk";
import { EntityTableInterface, AllowedTableSecondaryIndexes } from "../decorators/entity-table.decorator";

import { ATTRIBUTE_PREFIX } from "../common/attribute-prefix";
import { ObjectLiteral } from "../common/object-literal";
import { ATTRIBUTE_SEPARATOR } from "../common/attribute-separator";


export const buildKeyConditionExpression = <T>(
    classToQuery: { new(): T },
    {
        table,
        keyMap,
        secondaryIndexMap
    }: EntityTableInterface,
    filterCondition: ObjectLiteral<T>,
    beginsWithCondition: ObjectLiteral<T>
): DynamoDB.DocumentClient.QueryInput => {
    let queryInput = {
        TableName: table.tableName,
        KeyConditionExpression: '',
        ExpressionAttributeNames: {},
        ExpressionAttributeValues: {},
    } as DynamoDB.DocumentClient.QueryInput;
    queryInput.ExpressionAttributeNames = {};
    queryInput.ExpressionAttributeValues = {};
    let searchByMainKey = searchByKey(classToQuery, filterCondition, keyMap.PK);
    if (searchByMainKey.length) {
        queryInput.KeyConditionExpression = '#PK = :PK';
        queryInput.ExpressionAttributeNames['#PK'] = 'PK';
        queryInput.ExpressionAttributeValues[':PK'] = searchByMainKey.join(ATTRIBUTE_SEPARATOR);
        // delete filterCondition[keyMap.PK];

        let searchByMainSecondaryKey = searchByKey(classToQuery, filterCondition, keyMap.SK);
        if (searchByMainSecondaryKey.length) {
            queryInput.KeyConditionExpression += ' AND #SK = :SK';
            queryInput.ExpressionAttributeNames['#SK'] = 'SK';
            queryInput.ExpressionAttributeValues[':SK'] = searchByMainSecondaryKey.join(ATTRIBUTE_SEPARATOR);
        } else {
            let searchByBeginsWithSecondaryKey = searchByKey(classToQuery, beginsWithCondition, keyMap.SK);
            if (searchByBeginsWithSecondaryKey.length) {
                queryInput.KeyConditionExpression += ' AND begins_with(#SK,:SK)';
                queryInput.ExpressionAttributeNames['#SK'] = 'SK';
                queryInput.ExpressionAttributeValues[':SK'] = searchByMainSecondaryKey.join(ATTRIBUTE_SEPARATOR);
                return queryInput;
            }
            for (let index in secondaryIndexMap) {
                let secondaryKey = table.secondaryIndexMap[index as AllowedTableSecondaryIndexes];
                if (secondaryKey.globalOrLocal !== 'local') continue;
                let searchByLocalKey = secondaryIndexMap[index as AllowedTableSecondaryIndexes]?.SK ?? [];
                searchByLocalKey = searchByKey(classToQuery, filterCondition, searchByLocalKey);
                let localKey = secondaryKey.SK;
                if (searchByLocalKey.length) {
                    queryInput.KeyConditionExpression += ` AND #${localKey} = :${localKey}`;
                    queryInput.ExpressionAttributeNames[`#${localKey}`] = localKey;
                    queryInput.ExpressionAttributeValues[`:${localKey}`] = searchByLocalKey.join(ATTRIBUTE_SEPARATOR);
                    return queryInput
                } else {
                    searchByLocalKey = secondaryIndexMap[index as AllowedTableSecondaryIndexes]?.SK ?? [];
                    searchByLocalKey = searchByKey(classToQuery, beginsWithCondition, searchByLocalKey);
                    let localKey = secondaryKey.SK;
                    if (searchByLocalKey.length) {
                        queryInput.KeyConditionExpression += ` AND begins_with(#${localKey},:${localKey})`;
                        queryInput.ExpressionAttributeNames[`#${localKey}`] = localKey;
                        queryInput.ExpressionAttributeValues[`:${localKey}`] = searchByLocalKey.join(ATTRIBUTE_SEPARATOR);
                        return queryInput
                    }
                }
            }
            return queryInput;
        }
    }
    for (let index in secondaryIndexMap) {
        let secondaryKey = table.secondaryIndexMap[index as AllowedTableSecondaryIndexes];
        if (secondaryKey.globalOrLocal !== 'global') continue;
        let searchByMainKey = searchByKey(classToQuery, filterCondition, secondaryIndexMap[index as AllowedTableSecondaryIndexes]?.PK ?? []);
        if (searchByMainKey) {
            let pkName = secondaryKey.PK ?? '';
            queryInput.IndexName = index;
            queryInput.KeyConditionExpression = `#${pkName} = :${pkName}`;
            queryInput.ExpressionAttributeNames[`#${pkName}`] = pkName;
            queryInput.ExpressionAttributeValues[`:${pkName}`] = searchByMainKey;

            let searchByMainSecondaryKey = searchByKey(classToQuery, filterCondition, secondaryIndexMap[index as AllowedTableSecondaryIndexes]?.SK ?? []);
            if (searchByMainSecondaryKey) {
                let skName = secondaryKey.SK ?? '';
                queryInput.KeyConditionExpression += ` AND #${skName} = :${skName}`;
                queryInput.ExpressionAttributeNames[`#${skName}`] = skName;
                queryInput.ExpressionAttributeValues[`:${skName}`] = searchByMainSecondaryKey;
            } else {
                let searchByBeginsWithSecondaryKey = searchByKey(classToQuery, beginsWithCondition, secondaryIndexMap[index as AllowedTableSecondaryIndexes]?.SK ?? []);
                if (searchByBeginsWithSecondaryKey) {
                    queryInput.KeyConditionExpression += ' AND beginsWith(#SK,:SK)';
                    queryInput.ExpressionAttributeNames['#SK'] = 'SK';
                    queryInput.ExpressionAttributeValues[':SK'] = searchByMainSecondaryKey;
                    return queryInput;
                }
            }
        }
    }
    return queryInput as DynamoDB.DocumentClient.QueryInput;
}


const searchByKey = <T = any>(
    classToQuery: { new(): T },
    attributes: ObjectLiteral<T>,
    keyValueToReplace: string[],
): string[] => {
    let pkAttributes: string[] = keyValueToReplace;
    let pkToUse: string[] = [];
    for (let key of pkAttributes) {
        if (attributes.hasOwnProperty(key)) {
            pkToUse.push(attributes[key as keyof T]);
        } else if (key === 'entity') {
            pkToUse.push(classToQuery.name);
            // pkFinalValue = pkFinalValue.replace(key, classToQuery.name)
        }
    }
    if (pkToUse.length !== pkAttributes.length) return [];
    for (let key of pkToUse) {
        delete attributes[key as keyof T];
    }
    return pkToUse;
}