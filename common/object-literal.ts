
export type ObjectLiteral<T = any> = { [key in keyof Partial<T>]: any }