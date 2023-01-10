import "reflect-metadata";
const secondaryIndexProperty = Symbol("SecondaryIndexProperty");

export type ObjectLiteral<T extends Object = any> = { [key in keyof Partial<T>]: any }

export interface SecondaryIndexInterface {
    globalOrLocal: 'global' | 'local' | never;
    indexAttributeName: string;
    PK?: string;
    SK: string;
}

export interface SecondaryIndexMetadata<T extends Object = any> {
    globalOrLocal: 'global' | 'local' | never;
    indexAttributeName: string;
    PKName: string;
    SKName: string;
}

export const getSecondaryIndexMetadata = <T extends Object = any>(
    target: T, propertyKey: string | symbol
): SecondaryIndexMetadata<T> => {
    return Reflect.getMetadata(secondaryIndexProperty, target, propertyKey);
}


/**
 * Decorator that indicates if a property should be obfuscated
 */
export const SecondaryIndex = <T extends Object = any>(metadata: SecondaryIndexMetadata<T>) => {
    return (target: any, propertyKey: string | symbol) => {
        return Reflect.defineMetadata(secondaryIndexProperty, metadata, target, propertyKey);
    }
}