import { entityTableSymbol, getEntityTableMetadata } from "./entity-table.decorator";



// /**
//  * Decorator that indicates if a property should be obfuscated
//  */
//  export const Column = (): any => {
//     return (target: any, propertyKey: string) => {
//         let entityMetadata = getEntityTableMetadata(target);
//         if(!entityMetadata) entityMetadata = { projectExpressionColumns: [] } as any;
//         if(!entityMetadata.projectExpressionColumns) {
//             entityMetadata.projectExpressionColumns = [];
//         };
//         entityMetadata.projectExpressionColumns.push(propertyKey);
//         return Reflect.defineMetadata(entityTableSymbol, entityMetadata, target);
//     }
// }