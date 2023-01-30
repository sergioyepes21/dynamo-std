
export type ObjectLiteral<T> = { [key in keyof Partial<T>]: any }