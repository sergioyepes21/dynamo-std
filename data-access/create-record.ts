import { DynamoDB } from "aws-sdk";
import { ATTRIBUTE_SEPARATOR } from "../common/attribute-separator";
import { BaseEntity } from "../common/base-entity";
import { ObjectLiteral } from "../common/object-literal";
import { AllowedTableSecondaryIndexes, EntityTableInterface, getEntityTableMetadata, SecondaryIndexType } from "../decorators/entity-table.decorator";

export const createRecord = async <T>(
    classToQuery: { new(...args: any[]): T },
    newRecord: ObjectLiteral<T>
): Promise<BaseEntity> => {
    const entityMetadata: EntityTableInterface = getEntityTableMetadata(classToQuery);
    let finalDto = addKeyAttributes<T>(entityMetadata, newRecord);
    const dynamoClient = new DynamoDB.DocumentClient();
    const result = await dynamoClient.put({
        Item: finalDto as DynamoDB.DocumentClient.PutItemInputAttributeMap,
        TableName: entityMetadata.table.tableName,
    }).promise();
    return finalDto;
}

const addKeyAttributes = <T>(
    entityMetadata: EntityTableInterface,
    record: ObjectLiteral<T>,
): BaseEntity => {
    let newRecord: Partial<BaseEntity> = Object.assign(record, {
        createdAt: new Date().toLocaleString(),
        updatedAt: new Date().toLocaleString(),
        entity: entityMetadata.entity,
    });
    newRecord = checkKeyMap(newRecord, entityMetadata.keyMap);
    for (let compoundKey in entityMetadata.secondaryIndexMap) {
        let compoundValueList = entityMetadata.secondaryIndexMap[compoundKey as AllowedTableSecondaryIndexes];
        console.debug(`compoundValueList`, compoundValueList);
        if (!compoundValueList) continue;
        newRecord = checkKeyMap(newRecord, compoundValueList, compoundKey);
    }
    console.debug(`newRecord`, newRecord);
    return newRecord;
}

const checkKeyMap = <T>(
    newRecord: Partial<BaseEntity>,
    {
        optional,
        ...keyMap
    }: SecondaryIndexType,
    compoundKey?: string,
): Partial<BaseEntity> => {
    for (let pkOrSk in keyMap) {
        let pkOrSkValues = keyMap[pkOrSk as ('PK' | 'SK')];
        if (!pkOrSkValues) continue;
        let counterOfAtt = 0;
        for (let attToVal of pkOrSkValues) {
            if (!newRecord.hasOwnProperty(attToVal) && !optional) throw new Error(`Missing required attributes to build for att "${compoundKey ?? 'PK-SK'}": ${attToVal} `);
            counterOfAtt+= 1;
        }
        if(counterOfAtt === pkOrSkValues.length) newRecord[compoundKey ? `${compoundKey}${pkOrSk}` : pkOrSk] = pkOrSkValues.join(ATTRIBUTE_SEPARATOR);
    }
    return newRecord;
}