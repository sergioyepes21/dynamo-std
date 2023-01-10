import { DynamoDB } from "aws-sdk";
import { ObjectLiteral } from "../common/object-literal";
import { EntityTableInterface, getEntityTableMetadata } from "../decorators/entity-table.decorator";
import { buildKeyConditionExpression } from "./build-key-condition-expression";

export const readTable = async <T = any>(
    classToQuery: { new(...args: any[]): T },
    filterCondition: ObjectLiteral<T> = {} as any,
    beginsWithCondition: ObjectLiteral<T> = {} as any,
    select: (keyof T)[] = [],
): Promise<T[]> => {
    const entityMetadata: EntityTableInterface = getEntityTableMetadata(classToQuery);
    if (!filterCondition) filterCondition = {} as any;
    const queryInput = buildKeyConditionExpression(classToQuery, entityMetadata, filterCondition, beginsWithCondition);
    if(select.length) {
        queryInput.ProjectionExpression = select.join(',');
    }
    else {
        queryInput.ProjectionExpression = Object.getOwnPropertyNames(new classToQuery()).join(',');
    }
    
    console.debug(`queryInput`, queryInput);
    const dynamoClient = new DynamoDB.DocumentClient({});
    const result = await dynamoClient.query(queryInput).promise();

    return result.Items as T[] ?? [];
}