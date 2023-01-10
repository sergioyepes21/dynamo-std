
export type ObjectLiteral<T extends Object = any> = { [key in keyof Partial<T>]: any }