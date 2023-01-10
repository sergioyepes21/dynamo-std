
import { DynamoDB } from 'aws-sdk';
import { AllowedTableSecondaryIndexes, EntityTableInterface, getEntityTableMetadata } from './decorators/entity-table.decorator';
import { ObjectLiteral } from './decorators/secondary-index.decorator';
import { ItemFeed } from './dtos/item-feed.dto';

const handler = (
    userId: string,
) => {
    readTable<ItemFeed>(ItemFeed, { userId, }, {}, []);
}

const readTable = async <T extends (Object)>(
    classToQuery: { new(...args: any[]): T },
    filterCondition: ObjectLiteral<T> = {} as any,
    beginsWithCondition: ObjectLiteral<T> = {} as any,
    select: (keyof T)[] = [],
) => {
    const entityMetadata: EntityTableInterface = getEntityTableMetadata(classToQuery);
    if (!filterCondition) filterCondition = {} as any;
    const queryInput = buildKeyConditionExpression(classToQuery, entityMetadata, filterCondition, beginsWithCondition);
    if(select.length) {
        queryInput.ProjectionExpression = select.join(',');
    } else {
        queryInput.ProjectionExpression = Object.getOwnPropertyNames(new classToQuery()).join(',');
    }
    
    console.debug(`queryInput`, queryInput);
    const dynamoClient = new DynamoDB.DocumentClient({});
    const result = await dynamoClient.query(queryInput).promise();
    console.debug(`result`, result);
}

const buildKeyConditionExpression = <T extends Object = any>(
    classToQuery: { new(): T },
    {
        table,
        keyMap,
        secondaryIndexMap
    }: EntityTableInterface,
    filterCondition: ObjectLiteral,
    beginsWithCondition: ObjectLiteral
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
    if (searchByMainKey) {
        queryInput.KeyConditionExpression = '#PK = :PK';
        queryInput.ExpressionAttributeNames['#PK'] = 'PK';
        queryInput.ExpressionAttributeValues[':PK'] = searchByMainKey;
        delete filterCondition[keyMap.PK];

        let searchByMainSecondaryKey = searchByKey(classToQuery, filterCondition, keyMap.SK);
        if (searchByMainSecondaryKey) {
            queryInput.KeyConditionExpression += ' AND #SK = :SK';
            queryInput.ExpressionAttributeNames['#SK'] = 'SK';
            queryInput.ExpressionAttributeValues[':SK'] = searchByMainSecondaryKey;
        } else {
            let searchByBeginsWithSecondaryKey = searchByKey(classToQuery, beginsWithCondition, keyMap.SK);
            if (searchByBeginsWithSecondaryKey) {
                queryInput.KeyConditionExpression += ' AND begins_with(#SK,:SK)';
                queryInput.ExpressionAttributeNames['#SK'] = 'SK';
                queryInput.ExpressionAttributeValues[':SK'] = searchByMainSecondaryKey;
                return queryInput;
            }
            for (let index in secondaryIndexMap) {
                let secondaryKey = table.secondaryIndexMap[index as AllowedTableSecondaryIndexes];
                if (secondaryKey.globalOrLocal !== 'local') continue;
                let searchByLocalKey = secondaryIndexMap[index as AllowedTableSecondaryIndexes]?.SK ?? '';
                searchByLocalKey = searchByKey(classToQuery, filterCondition, searchByLocalKey);
                let localKey = secondaryKey.SK;
                if (searchByLocalKey) {
                    queryInput.KeyConditionExpression += ` AND #${localKey} = :${localKey}`;
                    queryInput.ExpressionAttributeNames[`#${localKey}`] = localKey;
                    queryInput.ExpressionAttributeValues[`:${localKey}`] = searchByLocalKey;
                    return queryInput
                } else {
                    searchByLocalKey = secondaryIndexMap[index as AllowedTableSecondaryIndexes]?.SK ?? '';
                    searchByLocalKey = searchByKey(classToQuery, beginsWithCondition, searchByLocalKey);
                    let localKey = secondaryKey.SK;
                    if (searchByLocalKey) {
                        queryInput.KeyConditionExpression += ` AND begins_with(#${localKey},:${localKey})`;
                        queryInput.ExpressionAttributeNames[`#${localKey}`] = localKey;
                        queryInput.ExpressionAttributeValues[`:${localKey}`] = searchByLocalKey;
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
        let searchByMainKey = searchByKey(classToQuery, filterCondition, secondaryIndexMap[index as AllowedTableSecondaryIndexes]?.PK ?? '');
        if (searchByMainKey) {
            let pkName = secondaryKey.PK ?? '';
            queryInput.IndexName = index;
            queryInput.KeyConditionExpression = `#${pkName} = :${pkName}`;
            queryInput.ExpressionAttributeNames[`#${pkName}`] = pkName;
            queryInput.ExpressionAttributeValues[`:${pkName}`] = searchByMainKey;

            let searchByMainSecondaryKey = searchByKey(classToQuery, filterCondition, secondaryIndexMap[index as AllowedTableSecondaryIndexes]?.SK ?? '');
            if (searchByMainSecondaryKey) {
                let skName = secondaryKey.SK ?? '';
                queryInput.KeyConditionExpression += ` AND #${skName} = :${skName}`;
                queryInput.ExpressionAttributeNames[`#${skName}`] = skName;
                queryInput.ExpressionAttributeValues[`:${skName}`] = searchByMainSecondaryKey;
            } else {
                let searchByBeginsWithSecondaryKey = searchByKey(classToQuery, beginsWithCondition, secondaryIndexMap[index as AllowedTableSecondaryIndexes]?.SK ?? '');
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

// const buildFilterExpression



const searchByKey = <T>(
    classToQuery: { new(): T },
    attributes: ObjectLiteral,
    keyValueToReplace: string,
) => {
    let pkFinalValue = keyValueToReplace;
    let pkAttributes: string[] = pkFinalValue.split('#');
    let pkToUse = [];
    for (let key of pkAttributes) {
        if (attributes.hasOwnProperty(key)) {
            pkToUse.push(attributes[key]);
            pkFinalValue = pkFinalValue.replace(key, attributes[key])
        } else if (key === 'entity') {
            pkToUse.push(classToQuery.name);
            pkFinalValue = pkFinalValue.replace(key, classToQuery.name)
        }
    }
    if (pkToUse.length !== pkAttributes.length) return '';
    for (let key of pkToUse) {
        delete attributes[key as keyof T];
    }
    return pkFinalValue;
}

handler('user1')