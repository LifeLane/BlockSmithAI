
/**
 * Client
**/

import * as runtime from './runtime/library.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model User
 * 
 */
export type User = $Result.DefaultSelection<Prisma.$UserPayload>
/**
 * Model Badge
 * 
 */
export type Badge = $Result.DefaultSelection<Prisma.$BadgePayload>
/**
 * Model ConsoleInsight
 * 
 */
export type ConsoleInsight = $Result.DefaultSelection<Prisma.$ConsoleInsightPayload>
/**
 * Model SignalHistoryItem
 * 
 */
export type SignalHistoryItem = $Result.DefaultSelection<Prisma.$SignalHistoryItemPayload>
/**
 * Model Position
 * 
 */
export type Position = $Result.DefaultSelection<Prisma.$PositionPayload>
/**
 * Model UserAgent
 * 
 */
export type UserAgent = $Result.DefaultSelection<Prisma.$UserAgentPayload>

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more Users
 * const users = await prisma.user.findMany()
 * ```
 *
 *
 * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   *
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient()
   * // Fetch zero or more Users
   * const users = await prisma.user.findMany()
   * ```
   *
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
   */

  constructor(optionsArg ?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): PrismaClient;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

  /**
   * Add a middleware
   * @deprecated since 4.16.0. For new code, prefer client extensions instead.
   * @see https://pris.ly/d/extensions
   */
  $use(cb: Prisma.Middleware): void

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;


  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/concepts/components/prisma-client/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>


  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb<ClientOptions>, ExtArgs, $Utils.Call<Prisma.TypeMapCb<ClientOptions>, {
    extArgs: ExtArgs
  }>>

      /**
   * `prisma.user`: Exposes CRUD operations for the **User** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Users
    * const users = await prisma.user.findMany()
    * ```
    */
  get user(): Prisma.UserDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.badge`: Exposes CRUD operations for the **Badge** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Badges
    * const badges = await prisma.badge.findMany()
    * ```
    */
  get badge(): Prisma.BadgeDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.consoleInsight`: Exposes CRUD operations for the **ConsoleInsight** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more ConsoleInsights
    * const consoleInsights = await prisma.consoleInsight.findMany()
    * ```
    */
  get consoleInsight(): Prisma.ConsoleInsightDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.signalHistoryItem`: Exposes CRUD operations for the **SignalHistoryItem** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more SignalHistoryItems
    * const signalHistoryItems = await prisma.signalHistoryItem.findMany()
    * ```
    */
  get signalHistoryItem(): Prisma.SignalHistoryItemDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.position`: Exposes CRUD operations for the **Position** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Positions
    * const positions = await prisma.position.findMany()
    * ```
    */
  get position(): Prisma.PositionDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.userAgent`: Exposes CRUD operations for the **UserAgent** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more UserAgents
    * const userAgents = await prisma.userAgent.findMany()
    * ```
    */
  get userAgent(): Prisma.UserAgentDelegate<ExtArgs, ClientOptions>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql



  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
   * Metrics
   */
  export type Metrics = runtime.Metrics
  export type Metric<T> = runtime.Metric<T>
  export type MetricHistogram = runtime.MetricHistogram
  export type MetricHistogramBucket = runtime.MetricHistogramBucket

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 6.10.1
   * Query Engine version: 9b628578b3b7cae625e8c927178f15a170e74a9c
   */
  export type PrismaVersion = {
    client: string
  }

  export const prismaVersion: PrismaVersion

  /**
   * Utility Types
   */


  export import JsonObject = runtime.JsonObject
  export import JsonArray = runtime.JsonArray
  export import JsonValue = runtime.JsonValue
  export import InputJsonObject = runtime.InputJsonObject
  export import InputJsonArray = runtime.InputJsonArray
  export import InputJsonValue = runtime.InputJsonValue

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? P : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
    User: 'User',
    Badge: 'Badge',
    ConsoleInsight: 'ConsoleInsight',
    SignalHistoryItem: 'SignalHistoryItem',
    Position: 'Position',
    UserAgent: 'UserAgent'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]


  export type Datasources = {
    db?: Datasource
  }

  interface TypeMapCb<ClientOptions = {}> extends $Utils.Fn<{extArgs: $Extensions.InternalArgs }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], ClientOptions extends { omit: infer OmitOptions } ? OmitOptions : {}>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> = {
    globalOmitOptions: {
      omit: GlobalOmitOptions
    }
    meta: {
      modelProps: "user" | "badge" | "consoleInsight" | "signalHistoryItem" | "position" | "userAgent"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      User: {
        payload: Prisma.$UserPayload<ExtArgs>
        fields: Prisma.UserFieldRefs
        operations: {
          findUnique: {
            args: Prisma.UserFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.UserFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          findFirst: {
            args: Prisma.UserFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.UserFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          findMany: {
            args: Prisma.UserFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          create: {
            args: Prisma.UserCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          createMany: {
            args: Prisma.UserCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.UserCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          delete: {
            args: Prisma.UserDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          update: {
            args: Prisma.UserUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          deleteMany: {
            args: Prisma.UserDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.UserUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.UserUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          upsert: {
            args: Prisma.UserUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          aggregate: {
            args: Prisma.UserAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateUser>
          }
          groupBy: {
            args: Prisma.UserGroupByArgs<ExtArgs>
            result: $Utils.Optional<UserGroupByOutputType>[]
          }
          count: {
            args: Prisma.UserCountArgs<ExtArgs>
            result: $Utils.Optional<UserCountAggregateOutputType> | number
          }
        }
      }
      Badge: {
        payload: Prisma.$BadgePayload<ExtArgs>
        fields: Prisma.BadgeFieldRefs
        operations: {
          findUnique: {
            args: Prisma.BadgeFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BadgePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.BadgeFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BadgePayload>
          }
          findFirst: {
            args: Prisma.BadgeFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BadgePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.BadgeFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BadgePayload>
          }
          findMany: {
            args: Prisma.BadgeFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BadgePayload>[]
          }
          create: {
            args: Prisma.BadgeCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BadgePayload>
          }
          createMany: {
            args: Prisma.BadgeCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.BadgeCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BadgePayload>[]
          }
          delete: {
            args: Prisma.BadgeDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BadgePayload>
          }
          update: {
            args: Prisma.BadgeUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BadgePayload>
          }
          deleteMany: {
            args: Prisma.BadgeDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.BadgeUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.BadgeUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BadgePayload>[]
          }
          upsert: {
            args: Prisma.BadgeUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BadgePayload>
          }
          aggregate: {
            args: Prisma.BadgeAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateBadge>
          }
          groupBy: {
            args: Prisma.BadgeGroupByArgs<ExtArgs>
            result: $Utils.Optional<BadgeGroupByOutputType>[]
          }
          count: {
            args: Prisma.BadgeCountArgs<ExtArgs>
            result: $Utils.Optional<BadgeCountAggregateOutputType> | number
          }
        }
      }
      ConsoleInsight: {
        payload: Prisma.$ConsoleInsightPayload<ExtArgs>
        fields: Prisma.ConsoleInsightFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ConsoleInsightFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConsoleInsightPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ConsoleInsightFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConsoleInsightPayload>
          }
          findFirst: {
            args: Prisma.ConsoleInsightFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConsoleInsightPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ConsoleInsightFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConsoleInsightPayload>
          }
          findMany: {
            args: Prisma.ConsoleInsightFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConsoleInsightPayload>[]
          }
          create: {
            args: Prisma.ConsoleInsightCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConsoleInsightPayload>
          }
          createMany: {
            args: Prisma.ConsoleInsightCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ConsoleInsightCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConsoleInsightPayload>[]
          }
          delete: {
            args: Prisma.ConsoleInsightDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConsoleInsightPayload>
          }
          update: {
            args: Prisma.ConsoleInsightUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConsoleInsightPayload>
          }
          deleteMany: {
            args: Prisma.ConsoleInsightDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ConsoleInsightUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.ConsoleInsightUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConsoleInsightPayload>[]
          }
          upsert: {
            args: Prisma.ConsoleInsightUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConsoleInsightPayload>
          }
          aggregate: {
            args: Prisma.ConsoleInsightAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateConsoleInsight>
          }
          groupBy: {
            args: Prisma.ConsoleInsightGroupByArgs<ExtArgs>
            result: $Utils.Optional<ConsoleInsightGroupByOutputType>[]
          }
          count: {
            args: Prisma.ConsoleInsightCountArgs<ExtArgs>
            result: $Utils.Optional<ConsoleInsightCountAggregateOutputType> | number
          }
        }
      }
      SignalHistoryItem: {
        payload: Prisma.$SignalHistoryItemPayload<ExtArgs>
        fields: Prisma.SignalHistoryItemFieldRefs
        operations: {
          findUnique: {
            args: Prisma.SignalHistoryItemFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SignalHistoryItemPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.SignalHistoryItemFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SignalHistoryItemPayload>
          }
          findFirst: {
            args: Prisma.SignalHistoryItemFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SignalHistoryItemPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.SignalHistoryItemFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SignalHistoryItemPayload>
          }
          findMany: {
            args: Prisma.SignalHistoryItemFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SignalHistoryItemPayload>[]
          }
          create: {
            args: Prisma.SignalHistoryItemCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SignalHistoryItemPayload>
          }
          createMany: {
            args: Prisma.SignalHistoryItemCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.SignalHistoryItemCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SignalHistoryItemPayload>[]
          }
          delete: {
            args: Prisma.SignalHistoryItemDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SignalHistoryItemPayload>
          }
          update: {
            args: Prisma.SignalHistoryItemUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SignalHistoryItemPayload>
          }
          deleteMany: {
            args: Prisma.SignalHistoryItemDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.SignalHistoryItemUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.SignalHistoryItemUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SignalHistoryItemPayload>[]
          }
          upsert: {
            args: Prisma.SignalHistoryItemUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SignalHistoryItemPayload>
          }
          aggregate: {
            args: Prisma.SignalHistoryItemAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateSignalHistoryItem>
          }
          groupBy: {
            args: Prisma.SignalHistoryItemGroupByArgs<ExtArgs>
            result: $Utils.Optional<SignalHistoryItemGroupByOutputType>[]
          }
          count: {
            args: Prisma.SignalHistoryItemCountArgs<ExtArgs>
            result: $Utils.Optional<SignalHistoryItemCountAggregateOutputType> | number
          }
        }
      }
      Position: {
        payload: Prisma.$PositionPayload<ExtArgs>
        fields: Prisma.PositionFieldRefs
        operations: {
          findUnique: {
            args: Prisma.PositionFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PositionPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.PositionFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PositionPayload>
          }
          findFirst: {
            args: Prisma.PositionFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PositionPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.PositionFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PositionPayload>
          }
          findMany: {
            args: Prisma.PositionFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PositionPayload>[]
          }
          create: {
            args: Prisma.PositionCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PositionPayload>
          }
          createMany: {
            args: Prisma.PositionCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.PositionCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PositionPayload>[]
          }
          delete: {
            args: Prisma.PositionDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PositionPayload>
          }
          update: {
            args: Prisma.PositionUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PositionPayload>
          }
          deleteMany: {
            args: Prisma.PositionDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.PositionUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.PositionUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PositionPayload>[]
          }
          upsert: {
            args: Prisma.PositionUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PositionPayload>
          }
          aggregate: {
            args: Prisma.PositionAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregatePosition>
          }
          groupBy: {
            args: Prisma.PositionGroupByArgs<ExtArgs>
            result: $Utils.Optional<PositionGroupByOutputType>[]
          }
          count: {
            args: Prisma.PositionCountArgs<ExtArgs>
            result: $Utils.Optional<PositionCountAggregateOutputType> | number
          }
        }
      }
      UserAgent: {
        payload: Prisma.$UserAgentPayload<ExtArgs>
        fields: Prisma.UserAgentFieldRefs
        operations: {
          findUnique: {
            args: Prisma.UserAgentFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserAgentPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.UserAgentFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserAgentPayload>
          }
          findFirst: {
            args: Prisma.UserAgentFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserAgentPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.UserAgentFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserAgentPayload>
          }
          findMany: {
            args: Prisma.UserAgentFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserAgentPayload>[]
          }
          create: {
            args: Prisma.UserAgentCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserAgentPayload>
          }
          createMany: {
            args: Prisma.UserAgentCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.UserAgentCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserAgentPayload>[]
          }
          delete: {
            args: Prisma.UserAgentDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserAgentPayload>
          }
          update: {
            args: Prisma.UserAgentUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserAgentPayload>
          }
          deleteMany: {
            args: Prisma.UserAgentDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.UserAgentUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.UserAgentUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserAgentPayload>[]
          }
          upsert: {
            args: Prisma.UserAgentUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserAgentPayload>
          }
          aggregate: {
            args: Prisma.UserAgentAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateUserAgent>
          }
          groupBy: {
            args: Prisma.UserAgentGroupByArgs<ExtArgs>
            result: $Utils.Optional<UserAgentGroupByOutputType>[]
          }
          count: {
            args: Prisma.UserAgentCountArgs<ExtArgs>
            result: $Utils.Optional<UserAgentCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasources?: Datasources
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasourceUrl?: string
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Defaults to stdout
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events
     * log: [
     *   { emit: 'stdout', level: 'query' },
     *   { emit: 'stdout', level: 'info' },
     *   { emit: 'stdout', level: 'warn' }
     *   { emit: 'stdout', level: 'error' }
     * ]
     * ```
     * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/logging#the-log-option).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: Prisma.TransactionIsolationLevel
    }
    /**
     * Global configuration for omitting model fields by default.
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   omit: {
     *     user: {
     *       password: true
     *     }
     *   }
     * })
     * ```
     */
    omit?: Prisma.GlobalOmitConfig
  }
  export type GlobalOmitConfig = {
    user?: UserOmit
    badge?: BadgeOmit
    consoleInsight?: ConsoleInsightOmit
    signalHistoryItem?: SignalHistoryItemOmit
    position?: PositionOmit
    userAgent?: UserAgentOmit
  }

  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type GetLogType<T extends LogLevel | LogDefinition> = T extends LogDefinition ? T['emit'] extends 'event' ? T['level'] : never : never
  export type GetEvents<T extends any> = T extends Array<LogLevel | LogDefinition> ?
    GetLogType<T[0]> | GetLogType<T[1]> | GetLogType<T[2]> | GetLogType<T[3]>
    : never

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'updateManyAndReturn'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  /**
   * These options are being passed into the middleware as "params"
   */
  export type MiddlewareParams = {
    model?: ModelName
    action: PrismaAction
    args: any
    dataPath: string[]
    runInTransaction: boolean
  }

  /**
   * The `T` type makes sure, that the `return proceed` is not forgotten in the middleware implementation
   */
  export type Middleware<T = any> = (
    params: MiddlewareParams,
    next: (params: MiddlewareParams) => $Utils.JsPromise<T>,
  ) => $Utils.JsPromise<T>

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */


  /**
   * Count Type UserCountOutputType
   */

  export type UserCountOutputType = {
    badges: number
    consoleInsights: number
    signals: number
    positions: number
    userAgents: number
  }

  export type UserCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    badges?: boolean | UserCountOutputTypeCountBadgesArgs
    consoleInsights?: boolean | UserCountOutputTypeCountConsoleInsightsArgs
    signals?: boolean | UserCountOutputTypeCountSignalsArgs
    positions?: boolean | UserCountOutputTypeCountPositionsArgs
    userAgents?: boolean | UserCountOutputTypeCountUserAgentsArgs
  }

  // Custom InputTypes
  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserCountOutputType
     */
    select?: UserCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountBadgesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: BadgeWhereInput
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountConsoleInsightsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ConsoleInsightWhereInput
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountSignalsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: SignalHistoryItemWhereInput
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountPositionsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: PositionWhereInput
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountUserAgentsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserAgentWhereInput
  }


  /**
   * Count Type BadgeCountOutputType
   */

  export type BadgeCountOutputType = {
    users: number
  }

  export type BadgeCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    users?: boolean | BadgeCountOutputTypeCountUsersArgs
  }

  // Custom InputTypes
  /**
   * BadgeCountOutputType without action
   */
  export type BadgeCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BadgeCountOutputType
     */
    select?: BadgeCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * BadgeCountOutputType without action
   */
  export type BadgeCountOutputTypeCountUsersArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserWhereInput
  }


  /**
   * Models
   */

  /**
   * Model User
   */

  export type AggregateUser = {
    _count: UserCountAggregateOutputType | null
    _avg: UserAvgAggregateOutputType | null
    _sum: UserSumAggregateOutputType | null
    _min: UserMinAggregateOutputType | null
    _max: UserMaxAggregateOutputType | null
  }

  export type UserAvgAggregateOutputType = {
    weeklyPoints: number | null
    airdropPoints: number | null
  }

  export type UserSumAggregateOutputType = {
    weeklyPoints: number | null
    airdropPoints: number | null
  }

  export type UserMinAggregateOutputType = {
    id: string | null
    username: string | null
    status: string | null
    shadowId: string | null
    weeklyPoints: number | null
    airdropPoints: number | null
    wallet_address: string | null
    wallet_type: string | null
    email: string | null
    phone: string | null
    x_handle: string | null
    telegram_handle: string | null
    youtube_handle: string | null
  }

  export type UserMaxAggregateOutputType = {
    id: string | null
    username: string | null
    status: string | null
    shadowId: string | null
    weeklyPoints: number | null
    airdropPoints: number | null
    wallet_address: string | null
    wallet_type: string | null
    email: string | null
    phone: string | null
    x_handle: string | null
    telegram_handle: string | null
    youtube_handle: string | null
  }

  export type UserCountAggregateOutputType = {
    id: number
    username: number
    status: number
    shadowId: number
    weeklyPoints: number
    airdropPoints: number
    wallet_address: number
    wallet_type: number
    email: number
    phone: number
    x_handle: number
    telegram_handle: number
    youtube_handle: number
    _all: number
  }


  export type UserAvgAggregateInputType = {
    weeklyPoints?: true
    airdropPoints?: true
  }

  export type UserSumAggregateInputType = {
    weeklyPoints?: true
    airdropPoints?: true
  }

  export type UserMinAggregateInputType = {
    id?: true
    username?: true
    status?: true
    shadowId?: true
    weeklyPoints?: true
    airdropPoints?: true
    wallet_address?: true
    wallet_type?: true
    email?: true
    phone?: true
    x_handle?: true
    telegram_handle?: true
    youtube_handle?: true
  }

  export type UserMaxAggregateInputType = {
    id?: true
    username?: true
    status?: true
    shadowId?: true
    weeklyPoints?: true
    airdropPoints?: true
    wallet_address?: true
    wallet_type?: true
    email?: true
    phone?: true
    x_handle?: true
    telegram_handle?: true
    youtube_handle?: true
  }

  export type UserCountAggregateInputType = {
    id?: true
    username?: true
    status?: true
    shadowId?: true
    weeklyPoints?: true
    airdropPoints?: true
    wallet_address?: true
    wallet_type?: true
    email?: true
    phone?: true
    x_handle?: true
    telegram_handle?: true
    youtube_handle?: true
    _all?: true
  }

  export type UserAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which User to aggregate.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Users
    **/
    _count?: true | UserCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: UserAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: UserSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: UserMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: UserMaxAggregateInputType
  }

  export type GetUserAggregateType<T extends UserAggregateArgs> = {
        [P in keyof T & keyof AggregateUser]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateUser[P]>
      : GetScalarType<T[P], AggregateUser[P]>
  }




  export type UserGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserWhereInput
    orderBy?: UserOrderByWithAggregationInput | UserOrderByWithAggregationInput[]
    by: UserScalarFieldEnum[] | UserScalarFieldEnum
    having?: UserScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: UserCountAggregateInputType | true
    _avg?: UserAvgAggregateInputType
    _sum?: UserSumAggregateInputType
    _min?: UserMinAggregateInputType
    _max?: UserMaxAggregateInputType
  }

  export type UserGroupByOutputType = {
    id: string
    username: string
    status: string | null
    shadowId: string | null
    weeklyPoints: number
    airdropPoints: number
    wallet_address: string | null
    wallet_type: string | null
    email: string | null
    phone: string | null
    x_handle: string | null
    telegram_handle: string | null
    youtube_handle: string | null
    _count: UserCountAggregateOutputType | null
    _avg: UserAvgAggregateOutputType | null
    _sum: UserSumAggregateOutputType | null
    _min: UserMinAggregateOutputType | null
    _max: UserMaxAggregateOutputType | null
  }

  type GetUserGroupByPayload<T extends UserGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<UserGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof UserGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], UserGroupByOutputType[P]>
            : GetScalarType<T[P], UserGroupByOutputType[P]>
        }
      >
    >


  export type UserSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    username?: boolean
    status?: boolean
    shadowId?: boolean
    weeklyPoints?: boolean
    airdropPoints?: boolean
    wallet_address?: boolean
    wallet_type?: boolean
    email?: boolean
    phone?: boolean
    x_handle?: boolean
    telegram_handle?: boolean
    youtube_handle?: boolean
    badges?: boolean | User$badgesArgs<ExtArgs>
    consoleInsights?: boolean | User$consoleInsightsArgs<ExtArgs>
    signals?: boolean | User$signalsArgs<ExtArgs>
    positions?: boolean | User$positionsArgs<ExtArgs>
    userAgents?: boolean | User$userAgentsArgs<ExtArgs>
    _count?: boolean | UserCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["user"]>

  export type UserSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    username?: boolean
    status?: boolean
    shadowId?: boolean
    weeklyPoints?: boolean
    airdropPoints?: boolean
    wallet_address?: boolean
    wallet_type?: boolean
    email?: boolean
    phone?: boolean
    x_handle?: boolean
    telegram_handle?: boolean
    youtube_handle?: boolean
  }, ExtArgs["result"]["user"]>

  export type UserSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    username?: boolean
    status?: boolean
    shadowId?: boolean
    weeklyPoints?: boolean
    airdropPoints?: boolean
    wallet_address?: boolean
    wallet_type?: boolean
    email?: boolean
    phone?: boolean
    x_handle?: boolean
    telegram_handle?: boolean
    youtube_handle?: boolean
  }, ExtArgs["result"]["user"]>

  export type UserSelectScalar = {
    id?: boolean
    username?: boolean
    status?: boolean
    shadowId?: boolean
    weeklyPoints?: boolean
    airdropPoints?: boolean
    wallet_address?: boolean
    wallet_type?: boolean
    email?: boolean
    phone?: boolean
    x_handle?: boolean
    telegram_handle?: boolean
    youtube_handle?: boolean
  }

  export type UserOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "username" | "status" | "shadowId" | "weeklyPoints" | "airdropPoints" | "wallet_address" | "wallet_type" | "email" | "phone" | "x_handle" | "telegram_handle" | "youtube_handle", ExtArgs["result"]["user"]>
  export type UserInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    badges?: boolean | User$badgesArgs<ExtArgs>
    consoleInsights?: boolean | User$consoleInsightsArgs<ExtArgs>
    signals?: boolean | User$signalsArgs<ExtArgs>
    positions?: boolean | User$positionsArgs<ExtArgs>
    userAgents?: boolean | User$userAgentsArgs<ExtArgs>
    _count?: boolean | UserCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type UserIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type UserIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $UserPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "User"
    objects: {
      badges: Prisma.$BadgePayload<ExtArgs>[]
      consoleInsights: Prisma.$ConsoleInsightPayload<ExtArgs>[]
      signals: Prisma.$SignalHistoryItemPayload<ExtArgs>[]
      positions: Prisma.$PositionPayload<ExtArgs>[]
      userAgents: Prisma.$UserAgentPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      username: string
      status: string | null
      shadowId: string | null
      weeklyPoints: number
      airdropPoints: number
      wallet_address: string | null
      wallet_type: string | null
      email: string | null
      phone: string | null
      x_handle: string | null
      telegram_handle: string | null
      youtube_handle: string | null
    }, ExtArgs["result"]["user"]>
    composites: {}
  }

  type UserGetPayload<S extends boolean | null | undefined | UserDefaultArgs> = $Result.GetResult<Prisma.$UserPayload, S>

  type UserCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<UserFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: UserCountAggregateInputType | true
    }

  export interface UserDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['User'], meta: { name: 'User' } }
    /**
     * Find zero or one User that matches the filter.
     * @param {UserFindUniqueArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends UserFindUniqueArgs>(args: SelectSubset<T, UserFindUniqueArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one User that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {UserFindUniqueOrThrowArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends UserFindUniqueOrThrowArgs>(args: SelectSubset<T, UserFindUniqueOrThrowArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first User that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindFirstArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends UserFindFirstArgs>(args?: SelectSubset<T, UserFindFirstArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first User that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindFirstOrThrowArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends UserFindFirstOrThrowArgs>(args?: SelectSubset<T, UserFindFirstOrThrowArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Users that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Users
     * const users = await prisma.user.findMany()
     * 
     * // Get first 10 Users
     * const users = await prisma.user.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const userWithIdOnly = await prisma.user.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends UserFindManyArgs>(args?: SelectSubset<T, UserFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a User.
     * @param {UserCreateArgs} args - Arguments to create a User.
     * @example
     * // Create one User
     * const User = await prisma.user.create({
     *   data: {
     *     // ... data to create a User
     *   }
     * })
     * 
     */
    create<T extends UserCreateArgs>(args: SelectSubset<T, UserCreateArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Users.
     * @param {UserCreateManyArgs} args - Arguments to create many Users.
     * @example
     * // Create many Users
     * const user = await prisma.user.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends UserCreateManyArgs>(args?: SelectSubset<T, UserCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Users and returns the data saved in the database.
     * @param {UserCreateManyAndReturnArgs} args - Arguments to create many Users.
     * @example
     * // Create many Users
     * const user = await prisma.user.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Users and only return the `id`
     * const userWithIdOnly = await prisma.user.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends UserCreateManyAndReturnArgs>(args?: SelectSubset<T, UserCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a User.
     * @param {UserDeleteArgs} args - Arguments to delete one User.
     * @example
     * // Delete one User
     * const User = await prisma.user.delete({
     *   where: {
     *     // ... filter to delete one User
     *   }
     * })
     * 
     */
    delete<T extends UserDeleteArgs>(args: SelectSubset<T, UserDeleteArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one User.
     * @param {UserUpdateArgs} args - Arguments to update one User.
     * @example
     * // Update one User
     * const user = await prisma.user.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends UserUpdateArgs>(args: SelectSubset<T, UserUpdateArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Users.
     * @param {UserDeleteManyArgs} args - Arguments to filter Users to delete.
     * @example
     * // Delete a few Users
     * const { count } = await prisma.user.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends UserDeleteManyArgs>(args?: SelectSubset<T, UserDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Users
     * const user = await prisma.user.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends UserUpdateManyArgs>(args: SelectSubset<T, UserUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Users and returns the data updated in the database.
     * @param {UserUpdateManyAndReturnArgs} args - Arguments to update many Users.
     * @example
     * // Update many Users
     * const user = await prisma.user.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Users and only return the `id`
     * const userWithIdOnly = await prisma.user.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends UserUpdateManyAndReturnArgs>(args: SelectSubset<T, UserUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one User.
     * @param {UserUpsertArgs} args - Arguments to update or create a User.
     * @example
     * // Update or create a User
     * const user = await prisma.user.upsert({
     *   create: {
     *     // ... data to create a User
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the User we want to update
     *   }
     * })
     */
    upsert<T extends UserUpsertArgs>(args: SelectSubset<T, UserUpsertArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserCountArgs} args - Arguments to filter Users to count.
     * @example
     * // Count the number of Users
     * const count = await prisma.user.count({
     *   where: {
     *     // ... the filter for the Users we want to count
     *   }
     * })
    **/
    count<T extends UserCountArgs>(
      args?: Subset<T, UserCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], UserCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a User.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends UserAggregateArgs>(args: Subset<T, UserAggregateArgs>): Prisma.PrismaPromise<GetUserAggregateType<T>>

    /**
     * Group by User.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends UserGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: UserGroupByArgs['orderBy'] }
        : { orderBy?: UserGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, UserGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetUserGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the User model
   */
  readonly fields: UserFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for User.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__UserClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    badges<T extends User$badgesArgs<ExtArgs> = {}>(args?: Subset<T, User$badgesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$BadgePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    consoleInsights<T extends User$consoleInsightsArgs<ExtArgs> = {}>(args?: Subset<T, User$consoleInsightsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ConsoleInsightPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    signals<T extends User$signalsArgs<ExtArgs> = {}>(args?: Subset<T, User$signalsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SignalHistoryItemPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    positions<T extends User$positionsArgs<ExtArgs> = {}>(args?: Subset<T, User$positionsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PositionPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    userAgents<T extends User$userAgentsArgs<ExtArgs> = {}>(args?: Subset<T, User$userAgentsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserAgentPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the User model
   */
  interface UserFieldRefs {
    readonly id: FieldRef<"User", 'String'>
    readonly username: FieldRef<"User", 'String'>
    readonly status: FieldRef<"User", 'String'>
    readonly shadowId: FieldRef<"User", 'String'>
    readonly weeklyPoints: FieldRef<"User", 'Int'>
    readonly airdropPoints: FieldRef<"User", 'Int'>
    readonly wallet_address: FieldRef<"User", 'String'>
    readonly wallet_type: FieldRef<"User", 'String'>
    readonly email: FieldRef<"User", 'String'>
    readonly phone: FieldRef<"User", 'String'>
    readonly x_handle: FieldRef<"User", 'String'>
    readonly telegram_handle: FieldRef<"User", 'String'>
    readonly youtube_handle: FieldRef<"User", 'String'>
  }
    

  // Custom InputTypes
  /**
   * User findUnique
   */
  export type UserFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User findUniqueOrThrow
   */
  export type UserFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User findFirst
   */
  export type UserFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User findFirstOrThrow
   */
  export type UserFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User findMany
   */
  export type UserFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which Users to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User create
   */
  export type UserCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The data needed to create a User.
     */
    data: XOR<UserCreateInput, UserUncheckedCreateInput>
  }

  /**
   * User createMany
   */
  export type UserCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Users.
     */
    data: UserCreateManyInput | UserCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * User createManyAndReturn
   */
  export type UserCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * The data used to create many Users.
     */
    data: UserCreateManyInput | UserCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * User update
   */
  export type UserUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The data needed to update a User.
     */
    data: XOR<UserUpdateInput, UserUncheckedUpdateInput>
    /**
     * Choose, which User to update.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User updateMany
   */
  export type UserUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Users.
     */
    data: XOR<UserUpdateManyMutationInput, UserUncheckedUpdateManyInput>
    /**
     * Filter which Users to update
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to update.
     */
    limit?: number
  }

  /**
   * User updateManyAndReturn
   */
  export type UserUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * The data used to update Users.
     */
    data: XOR<UserUpdateManyMutationInput, UserUncheckedUpdateManyInput>
    /**
     * Filter which Users to update
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to update.
     */
    limit?: number
  }

  /**
   * User upsert
   */
  export type UserUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The filter to search for the User to update in case it exists.
     */
    where: UserWhereUniqueInput
    /**
     * In case the User found by the `where` argument doesn't exist, create a new User with this data.
     */
    create: XOR<UserCreateInput, UserUncheckedCreateInput>
    /**
     * In case the User was found with the provided `where` argument, update it with this data.
     */
    update: XOR<UserUpdateInput, UserUncheckedUpdateInput>
  }

  /**
   * User delete
   */
  export type UserDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter which User to delete.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User deleteMany
   */
  export type UserDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Users to delete
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to delete.
     */
    limit?: number
  }

  /**
   * User.badges
   */
  export type User$badgesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Badge
     */
    select?: BadgeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Badge
     */
    omit?: BadgeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BadgeInclude<ExtArgs> | null
    where?: BadgeWhereInput
    orderBy?: BadgeOrderByWithRelationInput | BadgeOrderByWithRelationInput[]
    cursor?: BadgeWhereUniqueInput
    take?: number
    skip?: number
    distinct?: BadgeScalarFieldEnum | BadgeScalarFieldEnum[]
  }

  /**
   * User.consoleInsights
   */
  export type User$consoleInsightsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ConsoleInsight
     */
    select?: ConsoleInsightSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ConsoleInsight
     */
    omit?: ConsoleInsightOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ConsoleInsightInclude<ExtArgs> | null
    where?: ConsoleInsightWhereInput
    orderBy?: ConsoleInsightOrderByWithRelationInput | ConsoleInsightOrderByWithRelationInput[]
    cursor?: ConsoleInsightWhereUniqueInput
    take?: number
    skip?: number
    distinct?: ConsoleInsightScalarFieldEnum | ConsoleInsightScalarFieldEnum[]
  }

  /**
   * User.signals
   */
  export type User$signalsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SignalHistoryItem
     */
    select?: SignalHistoryItemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SignalHistoryItem
     */
    omit?: SignalHistoryItemOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SignalHistoryItemInclude<ExtArgs> | null
    where?: SignalHistoryItemWhereInput
    orderBy?: SignalHistoryItemOrderByWithRelationInput | SignalHistoryItemOrderByWithRelationInput[]
    cursor?: SignalHistoryItemWhereUniqueInput
    take?: number
    skip?: number
    distinct?: SignalHistoryItemScalarFieldEnum | SignalHistoryItemScalarFieldEnum[]
  }

  /**
   * User.positions
   */
  export type User$positionsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Position
     */
    select?: PositionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Position
     */
    omit?: PositionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PositionInclude<ExtArgs> | null
    where?: PositionWhereInput
    orderBy?: PositionOrderByWithRelationInput | PositionOrderByWithRelationInput[]
    cursor?: PositionWhereUniqueInput
    take?: number
    skip?: number
    distinct?: PositionScalarFieldEnum | PositionScalarFieldEnum[]
  }

  /**
   * User.userAgents
   */
  export type User$userAgentsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserAgent
     */
    select?: UserAgentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserAgent
     */
    omit?: UserAgentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserAgentInclude<ExtArgs> | null
    where?: UserAgentWhereInput
    orderBy?: UserAgentOrderByWithRelationInput | UserAgentOrderByWithRelationInput[]
    cursor?: UserAgentWhereUniqueInput
    take?: number
    skip?: number
    distinct?: UserAgentScalarFieldEnum | UserAgentScalarFieldEnum[]
  }

  /**
   * User without action
   */
  export type UserDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
  }


  /**
   * Model Badge
   */

  export type AggregateBadge = {
    _count: BadgeCountAggregateOutputType | null
    _min: BadgeMinAggregateOutputType | null
    _max: BadgeMaxAggregateOutputType | null
  }

  export type BadgeMinAggregateOutputType = {
    id: string | null
    name: string | null
  }

  export type BadgeMaxAggregateOutputType = {
    id: string | null
    name: string | null
  }

  export type BadgeCountAggregateOutputType = {
    id: number
    name: number
    _all: number
  }


  export type BadgeMinAggregateInputType = {
    id?: true
    name?: true
  }

  export type BadgeMaxAggregateInputType = {
    id?: true
    name?: true
  }

  export type BadgeCountAggregateInputType = {
    id?: true
    name?: true
    _all?: true
  }

  export type BadgeAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Badge to aggregate.
     */
    where?: BadgeWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Badges to fetch.
     */
    orderBy?: BadgeOrderByWithRelationInput | BadgeOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: BadgeWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Badges from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Badges.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Badges
    **/
    _count?: true | BadgeCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: BadgeMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: BadgeMaxAggregateInputType
  }

  export type GetBadgeAggregateType<T extends BadgeAggregateArgs> = {
        [P in keyof T & keyof AggregateBadge]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateBadge[P]>
      : GetScalarType<T[P], AggregateBadge[P]>
  }




  export type BadgeGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: BadgeWhereInput
    orderBy?: BadgeOrderByWithAggregationInput | BadgeOrderByWithAggregationInput[]
    by: BadgeScalarFieldEnum[] | BadgeScalarFieldEnum
    having?: BadgeScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: BadgeCountAggregateInputType | true
    _min?: BadgeMinAggregateInputType
    _max?: BadgeMaxAggregateInputType
  }

  export type BadgeGroupByOutputType = {
    id: string
    name: string
    _count: BadgeCountAggregateOutputType | null
    _min: BadgeMinAggregateOutputType | null
    _max: BadgeMaxAggregateOutputType | null
  }

  type GetBadgeGroupByPayload<T extends BadgeGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<BadgeGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof BadgeGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], BadgeGroupByOutputType[P]>
            : GetScalarType<T[P], BadgeGroupByOutputType[P]>
        }
      >
    >


  export type BadgeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    users?: boolean | Badge$usersArgs<ExtArgs>
    _count?: boolean | BadgeCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["badge"]>

  export type BadgeSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
  }, ExtArgs["result"]["badge"]>

  export type BadgeSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
  }, ExtArgs["result"]["badge"]>

  export type BadgeSelectScalar = {
    id?: boolean
    name?: boolean
  }

  export type BadgeOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "name", ExtArgs["result"]["badge"]>
  export type BadgeInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    users?: boolean | Badge$usersArgs<ExtArgs>
    _count?: boolean | BadgeCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type BadgeIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type BadgeIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $BadgePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Badge"
    objects: {
      users: Prisma.$UserPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      name: string
    }, ExtArgs["result"]["badge"]>
    composites: {}
  }

  type BadgeGetPayload<S extends boolean | null | undefined | BadgeDefaultArgs> = $Result.GetResult<Prisma.$BadgePayload, S>

  type BadgeCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<BadgeFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: BadgeCountAggregateInputType | true
    }

  export interface BadgeDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Badge'], meta: { name: 'Badge' } }
    /**
     * Find zero or one Badge that matches the filter.
     * @param {BadgeFindUniqueArgs} args - Arguments to find a Badge
     * @example
     * // Get one Badge
     * const badge = await prisma.badge.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends BadgeFindUniqueArgs>(args: SelectSubset<T, BadgeFindUniqueArgs<ExtArgs>>): Prisma__BadgeClient<$Result.GetResult<Prisma.$BadgePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Badge that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {BadgeFindUniqueOrThrowArgs} args - Arguments to find a Badge
     * @example
     * // Get one Badge
     * const badge = await prisma.badge.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends BadgeFindUniqueOrThrowArgs>(args: SelectSubset<T, BadgeFindUniqueOrThrowArgs<ExtArgs>>): Prisma__BadgeClient<$Result.GetResult<Prisma.$BadgePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Badge that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BadgeFindFirstArgs} args - Arguments to find a Badge
     * @example
     * // Get one Badge
     * const badge = await prisma.badge.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends BadgeFindFirstArgs>(args?: SelectSubset<T, BadgeFindFirstArgs<ExtArgs>>): Prisma__BadgeClient<$Result.GetResult<Prisma.$BadgePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Badge that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BadgeFindFirstOrThrowArgs} args - Arguments to find a Badge
     * @example
     * // Get one Badge
     * const badge = await prisma.badge.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends BadgeFindFirstOrThrowArgs>(args?: SelectSubset<T, BadgeFindFirstOrThrowArgs<ExtArgs>>): Prisma__BadgeClient<$Result.GetResult<Prisma.$BadgePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Badges that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BadgeFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Badges
     * const badges = await prisma.badge.findMany()
     * 
     * // Get first 10 Badges
     * const badges = await prisma.badge.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const badgeWithIdOnly = await prisma.badge.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends BadgeFindManyArgs>(args?: SelectSubset<T, BadgeFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$BadgePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Badge.
     * @param {BadgeCreateArgs} args - Arguments to create a Badge.
     * @example
     * // Create one Badge
     * const Badge = await prisma.badge.create({
     *   data: {
     *     // ... data to create a Badge
     *   }
     * })
     * 
     */
    create<T extends BadgeCreateArgs>(args: SelectSubset<T, BadgeCreateArgs<ExtArgs>>): Prisma__BadgeClient<$Result.GetResult<Prisma.$BadgePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Badges.
     * @param {BadgeCreateManyArgs} args - Arguments to create many Badges.
     * @example
     * // Create many Badges
     * const badge = await prisma.badge.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends BadgeCreateManyArgs>(args?: SelectSubset<T, BadgeCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Badges and returns the data saved in the database.
     * @param {BadgeCreateManyAndReturnArgs} args - Arguments to create many Badges.
     * @example
     * // Create many Badges
     * const badge = await prisma.badge.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Badges and only return the `id`
     * const badgeWithIdOnly = await prisma.badge.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends BadgeCreateManyAndReturnArgs>(args?: SelectSubset<T, BadgeCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$BadgePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Badge.
     * @param {BadgeDeleteArgs} args - Arguments to delete one Badge.
     * @example
     * // Delete one Badge
     * const Badge = await prisma.badge.delete({
     *   where: {
     *     // ... filter to delete one Badge
     *   }
     * })
     * 
     */
    delete<T extends BadgeDeleteArgs>(args: SelectSubset<T, BadgeDeleteArgs<ExtArgs>>): Prisma__BadgeClient<$Result.GetResult<Prisma.$BadgePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Badge.
     * @param {BadgeUpdateArgs} args - Arguments to update one Badge.
     * @example
     * // Update one Badge
     * const badge = await prisma.badge.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends BadgeUpdateArgs>(args: SelectSubset<T, BadgeUpdateArgs<ExtArgs>>): Prisma__BadgeClient<$Result.GetResult<Prisma.$BadgePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Badges.
     * @param {BadgeDeleteManyArgs} args - Arguments to filter Badges to delete.
     * @example
     * // Delete a few Badges
     * const { count } = await prisma.badge.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends BadgeDeleteManyArgs>(args?: SelectSubset<T, BadgeDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Badges.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BadgeUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Badges
     * const badge = await prisma.badge.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends BadgeUpdateManyArgs>(args: SelectSubset<T, BadgeUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Badges and returns the data updated in the database.
     * @param {BadgeUpdateManyAndReturnArgs} args - Arguments to update many Badges.
     * @example
     * // Update many Badges
     * const badge = await prisma.badge.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Badges and only return the `id`
     * const badgeWithIdOnly = await prisma.badge.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends BadgeUpdateManyAndReturnArgs>(args: SelectSubset<T, BadgeUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$BadgePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Badge.
     * @param {BadgeUpsertArgs} args - Arguments to update or create a Badge.
     * @example
     * // Update or create a Badge
     * const badge = await prisma.badge.upsert({
     *   create: {
     *     // ... data to create a Badge
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Badge we want to update
     *   }
     * })
     */
    upsert<T extends BadgeUpsertArgs>(args: SelectSubset<T, BadgeUpsertArgs<ExtArgs>>): Prisma__BadgeClient<$Result.GetResult<Prisma.$BadgePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Badges.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BadgeCountArgs} args - Arguments to filter Badges to count.
     * @example
     * // Count the number of Badges
     * const count = await prisma.badge.count({
     *   where: {
     *     // ... the filter for the Badges we want to count
     *   }
     * })
    **/
    count<T extends BadgeCountArgs>(
      args?: Subset<T, BadgeCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], BadgeCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Badge.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BadgeAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends BadgeAggregateArgs>(args: Subset<T, BadgeAggregateArgs>): Prisma.PrismaPromise<GetBadgeAggregateType<T>>

    /**
     * Group by Badge.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BadgeGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends BadgeGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: BadgeGroupByArgs['orderBy'] }
        : { orderBy?: BadgeGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, BadgeGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetBadgeGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Badge model
   */
  readonly fields: BadgeFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Badge.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__BadgeClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    users<T extends Badge$usersArgs<ExtArgs> = {}>(args?: Subset<T, Badge$usersArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Badge model
   */
  interface BadgeFieldRefs {
    readonly id: FieldRef<"Badge", 'String'>
    readonly name: FieldRef<"Badge", 'String'>
  }
    

  // Custom InputTypes
  /**
   * Badge findUnique
   */
  export type BadgeFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Badge
     */
    select?: BadgeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Badge
     */
    omit?: BadgeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BadgeInclude<ExtArgs> | null
    /**
     * Filter, which Badge to fetch.
     */
    where: BadgeWhereUniqueInput
  }

  /**
   * Badge findUniqueOrThrow
   */
  export type BadgeFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Badge
     */
    select?: BadgeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Badge
     */
    omit?: BadgeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BadgeInclude<ExtArgs> | null
    /**
     * Filter, which Badge to fetch.
     */
    where: BadgeWhereUniqueInput
  }

  /**
   * Badge findFirst
   */
  export type BadgeFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Badge
     */
    select?: BadgeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Badge
     */
    omit?: BadgeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BadgeInclude<ExtArgs> | null
    /**
     * Filter, which Badge to fetch.
     */
    where?: BadgeWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Badges to fetch.
     */
    orderBy?: BadgeOrderByWithRelationInput | BadgeOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Badges.
     */
    cursor?: BadgeWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Badges from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Badges.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Badges.
     */
    distinct?: BadgeScalarFieldEnum | BadgeScalarFieldEnum[]
  }

  /**
   * Badge findFirstOrThrow
   */
  export type BadgeFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Badge
     */
    select?: BadgeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Badge
     */
    omit?: BadgeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BadgeInclude<ExtArgs> | null
    /**
     * Filter, which Badge to fetch.
     */
    where?: BadgeWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Badges to fetch.
     */
    orderBy?: BadgeOrderByWithRelationInput | BadgeOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Badges.
     */
    cursor?: BadgeWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Badges from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Badges.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Badges.
     */
    distinct?: BadgeScalarFieldEnum | BadgeScalarFieldEnum[]
  }

  /**
   * Badge findMany
   */
  export type BadgeFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Badge
     */
    select?: BadgeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Badge
     */
    omit?: BadgeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BadgeInclude<ExtArgs> | null
    /**
     * Filter, which Badges to fetch.
     */
    where?: BadgeWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Badges to fetch.
     */
    orderBy?: BadgeOrderByWithRelationInput | BadgeOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Badges.
     */
    cursor?: BadgeWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Badges from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Badges.
     */
    skip?: number
    distinct?: BadgeScalarFieldEnum | BadgeScalarFieldEnum[]
  }

  /**
   * Badge create
   */
  export type BadgeCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Badge
     */
    select?: BadgeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Badge
     */
    omit?: BadgeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BadgeInclude<ExtArgs> | null
    /**
     * The data needed to create a Badge.
     */
    data: XOR<BadgeCreateInput, BadgeUncheckedCreateInput>
  }

  /**
   * Badge createMany
   */
  export type BadgeCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Badges.
     */
    data: BadgeCreateManyInput | BadgeCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Badge createManyAndReturn
   */
  export type BadgeCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Badge
     */
    select?: BadgeSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Badge
     */
    omit?: BadgeOmit<ExtArgs> | null
    /**
     * The data used to create many Badges.
     */
    data: BadgeCreateManyInput | BadgeCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Badge update
   */
  export type BadgeUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Badge
     */
    select?: BadgeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Badge
     */
    omit?: BadgeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BadgeInclude<ExtArgs> | null
    /**
     * The data needed to update a Badge.
     */
    data: XOR<BadgeUpdateInput, BadgeUncheckedUpdateInput>
    /**
     * Choose, which Badge to update.
     */
    where: BadgeWhereUniqueInput
  }

  /**
   * Badge updateMany
   */
  export type BadgeUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Badges.
     */
    data: XOR<BadgeUpdateManyMutationInput, BadgeUncheckedUpdateManyInput>
    /**
     * Filter which Badges to update
     */
    where?: BadgeWhereInput
    /**
     * Limit how many Badges to update.
     */
    limit?: number
  }

  /**
   * Badge updateManyAndReturn
   */
  export type BadgeUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Badge
     */
    select?: BadgeSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Badge
     */
    omit?: BadgeOmit<ExtArgs> | null
    /**
     * The data used to update Badges.
     */
    data: XOR<BadgeUpdateManyMutationInput, BadgeUncheckedUpdateManyInput>
    /**
     * Filter which Badges to update
     */
    where?: BadgeWhereInput
    /**
     * Limit how many Badges to update.
     */
    limit?: number
  }

  /**
   * Badge upsert
   */
  export type BadgeUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Badge
     */
    select?: BadgeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Badge
     */
    omit?: BadgeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BadgeInclude<ExtArgs> | null
    /**
     * The filter to search for the Badge to update in case it exists.
     */
    where: BadgeWhereUniqueInput
    /**
     * In case the Badge found by the `where` argument doesn't exist, create a new Badge with this data.
     */
    create: XOR<BadgeCreateInput, BadgeUncheckedCreateInput>
    /**
     * In case the Badge was found with the provided `where` argument, update it with this data.
     */
    update: XOR<BadgeUpdateInput, BadgeUncheckedUpdateInput>
  }

  /**
   * Badge delete
   */
  export type BadgeDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Badge
     */
    select?: BadgeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Badge
     */
    omit?: BadgeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BadgeInclude<ExtArgs> | null
    /**
     * Filter which Badge to delete.
     */
    where: BadgeWhereUniqueInput
  }

  /**
   * Badge deleteMany
   */
  export type BadgeDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Badges to delete
     */
    where?: BadgeWhereInput
    /**
     * Limit how many Badges to delete.
     */
    limit?: number
  }

  /**
   * Badge.users
   */
  export type Badge$usersArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    where?: UserWhereInput
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    cursor?: UserWhereUniqueInput
    take?: number
    skip?: number
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * Badge without action
   */
  export type BadgeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Badge
     */
    select?: BadgeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Badge
     */
    omit?: BadgeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BadgeInclude<ExtArgs> | null
  }


  /**
   * Model ConsoleInsight
   */

  export type AggregateConsoleInsight = {
    _count: ConsoleInsightCountAggregateOutputType | null
    _min: ConsoleInsightMinAggregateOutputType | null
    _max: ConsoleInsightMaxAggregateOutputType | null
  }

  export type ConsoleInsightMinAggregateOutputType = {
    id: string | null
    userId: string | null
    content: string | null
    timestamp: Date | null
  }

  export type ConsoleInsightMaxAggregateOutputType = {
    id: string | null
    userId: string | null
    content: string | null
    timestamp: Date | null
  }

  export type ConsoleInsightCountAggregateOutputType = {
    id: number
    userId: number
    content: number
    timestamp: number
    _all: number
  }


  export type ConsoleInsightMinAggregateInputType = {
    id?: true
    userId?: true
    content?: true
    timestamp?: true
  }

  export type ConsoleInsightMaxAggregateInputType = {
    id?: true
    userId?: true
    content?: true
    timestamp?: true
  }

  export type ConsoleInsightCountAggregateInputType = {
    id?: true
    userId?: true
    content?: true
    timestamp?: true
    _all?: true
  }

  export type ConsoleInsightAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ConsoleInsight to aggregate.
     */
    where?: ConsoleInsightWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ConsoleInsights to fetch.
     */
    orderBy?: ConsoleInsightOrderByWithRelationInput | ConsoleInsightOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ConsoleInsightWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ConsoleInsights from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ConsoleInsights.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned ConsoleInsights
    **/
    _count?: true | ConsoleInsightCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ConsoleInsightMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ConsoleInsightMaxAggregateInputType
  }

  export type GetConsoleInsightAggregateType<T extends ConsoleInsightAggregateArgs> = {
        [P in keyof T & keyof AggregateConsoleInsight]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateConsoleInsight[P]>
      : GetScalarType<T[P], AggregateConsoleInsight[P]>
  }




  export type ConsoleInsightGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ConsoleInsightWhereInput
    orderBy?: ConsoleInsightOrderByWithAggregationInput | ConsoleInsightOrderByWithAggregationInput[]
    by: ConsoleInsightScalarFieldEnum[] | ConsoleInsightScalarFieldEnum
    having?: ConsoleInsightScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ConsoleInsightCountAggregateInputType | true
    _min?: ConsoleInsightMinAggregateInputType
    _max?: ConsoleInsightMaxAggregateInputType
  }

  export type ConsoleInsightGroupByOutputType = {
    id: string
    userId: string
    content: string
    timestamp: Date
    _count: ConsoleInsightCountAggregateOutputType | null
    _min: ConsoleInsightMinAggregateOutputType | null
    _max: ConsoleInsightMaxAggregateOutputType | null
  }

  type GetConsoleInsightGroupByPayload<T extends ConsoleInsightGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ConsoleInsightGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ConsoleInsightGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ConsoleInsightGroupByOutputType[P]>
            : GetScalarType<T[P], ConsoleInsightGroupByOutputType[P]>
        }
      >
    >


  export type ConsoleInsightSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    content?: boolean
    timestamp?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["consoleInsight"]>

  export type ConsoleInsightSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    content?: boolean
    timestamp?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["consoleInsight"]>

  export type ConsoleInsightSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    content?: boolean
    timestamp?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["consoleInsight"]>

  export type ConsoleInsightSelectScalar = {
    id?: boolean
    userId?: boolean
    content?: boolean
    timestamp?: boolean
  }

  export type ConsoleInsightOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "userId" | "content" | "timestamp", ExtArgs["result"]["consoleInsight"]>
  export type ConsoleInsightInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type ConsoleInsightIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type ConsoleInsightIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }

  export type $ConsoleInsightPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "ConsoleInsight"
    objects: {
      user: Prisma.$UserPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      userId: string
      content: string
      timestamp: Date
    }, ExtArgs["result"]["consoleInsight"]>
    composites: {}
  }

  type ConsoleInsightGetPayload<S extends boolean | null | undefined | ConsoleInsightDefaultArgs> = $Result.GetResult<Prisma.$ConsoleInsightPayload, S>

  type ConsoleInsightCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<ConsoleInsightFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: ConsoleInsightCountAggregateInputType | true
    }

  export interface ConsoleInsightDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['ConsoleInsight'], meta: { name: 'ConsoleInsight' } }
    /**
     * Find zero or one ConsoleInsight that matches the filter.
     * @param {ConsoleInsightFindUniqueArgs} args - Arguments to find a ConsoleInsight
     * @example
     * // Get one ConsoleInsight
     * const consoleInsight = await prisma.consoleInsight.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ConsoleInsightFindUniqueArgs>(args: SelectSubset<T, ConsoleInsightFindUniqueArgs<ExtArgs>>): Prisma__ConsoleInsightClient<$Result.GetResult<Prisma.$ConsoleInsightPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one ConsoleInsight that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {ConsoleInsightFindUniqueOrThrowArgs} args - Arguments to find a ConsoleInsight
     * @example
     * // Get one ConsoleInsight
     * const consoleInsight = await prisma.consoleInsight.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ConsoleInsightFindUniqueOrThrowArgs>(args: SelectSubset<T, ConsoleInsightFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ConsoleInsightClient<$Result.GetResult<Prisma.$ConsoleInsightPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first ConsoleInsight that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ConsoleInsightFindFirstArgs} args - Arguments to find a ConsoleInsight
     * @example
     * // Get one ConsoleInsight
     * const consoleInsight = await prisma.consoleInsight.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ConsoleInsightFindFirstArgs>(args?: SelectSubset<T, ConsoleInsightFindFirstArgs<ExtArgs>>): Prisma__ConsoleInsightClient<$Result.GetResult<Prisma.$ConsoleInsightPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first ConsoleInsight that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ConsoleInsightFindFirstOrThrowArgs} args - Arguments to find a ConsoleInsight
     * @example
     * // Get one ConsoleInsight
     * const consoleInsight = await prisma.consoleInsight.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ConsoleInsightFindFirstOrThrowArgs>(args?: SelectSubset<T, ConsoleInsightFindFirstOrThrowArgs<ExtArgs>>): Prisma__ConsoleInsightClient<$Result.GetResult<Prisma.$ConsoleInsightPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more ConsoleInsights that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ConsoleInsightFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all ConsoleInsights
     * const consoleInsights = await prisma.consoleInsight.findMany()
     * 
     * // Get first 10 ConsoleInsights
     * const consoleInsights = await prisma.consoleInsight.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const consoleInsightWithIdOnly = await prisma.consoleInsight.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ConsoleInsightFindManyArgs>(args?: SelectSubset<T, ConsoleInsightFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ConsoleInsightPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a ConsoleInsight.
     * @param {ConsoleInsightCreateArgs} args - Arguments to create a ConsoleInsight.
     * @example
     * // Create one ConsoleInsight
     * const ConsoleInsight = await prisma.consoleInsight.create({
     *   data: {
     *     // ... data to create a ConsoleInsight
     *   }
     * })
     * 
     */
    create<T extends ConsoleInsightCreateArgs>(args: SelectSubset<T, ConsoleInsightCreateArgs<ExtArgs>>): Prisma__ConsoleInsightClient<$Result.GetResult<Prisma.$ConsoleInsightPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many ConsoleInsights.
     * @param {ConsoleInsightCreateManyArgs} args - Arguments to create many ConsoleInsights.
     * @example
     * // Create many ConsoleInsights
     * const consoleInsight = await prisma.consoleInsight.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ConsoleInsightCreateManyArgs>(args?: SelectSubset<T, ConsoleInsightCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many ConsoleInsights and returns the data saved in the database.
     * @param {ConsoleInsightCreateManyAndReturnArgs} args - Arguments to create many ConsoleInsights.
     * @example
     * // Create many ConsoleInsights
     * const consoleInsight = await prisma.consoleInsight.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many ConsoleInsights and only return the `id`
     * const consoleInsightWithIdOnly = await prisma.consoleInsight.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ConsoleInsightCreateManyAndReturnArgs>(args?: SelectSubset<T, ConsoleInsightCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ConsoleInsightPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a ConsoleInsight.
     * @param {ConsoleInsightDeleteArgs} args - Arguments to delete one ConsoleInsight.
     * @example
     * // Delete one ConsoleInsight
     * const ConsoleInsight = await prisma.consoleInsight.delete({
     *   where: {
     *     // ... filter to delete one ConsoleInsight
     *   }
     * })
     * 
     */
    delete<T extends ConsoleInsightDeleteArgs>(args: SelectSubset<T, ConsoleInsightDeleteArgs<ExtArgs>>): Prisma__ConsoleInsightClient<$Result.GetResult<Prisma.$ConsoleInsightPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one ConsoleInsight.
     * @param {ConsoleInsightUpdateArgs} args - Arguments to update one ConsoleInsight.
     * @example
     * // Update one ConsoleInsight
     * const consoleInsight = await prisma.consoleInsight.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ConsoleInsightUpdateArgs>(args: SelectSubset<T, ConsoleInsightUpdateArgs<ExtArgs>>): Prisma__ConsoleInsightClient<$Result.GetResult<Prisma.$ConsoleInsightPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more ConsoleInsights.
     * @param {ConsoleInsightDeleteManyArgs} args - Arguments to filter ConsoleInsights to delete.
     * @example
     * // Delete a few ConsoleInsights
     * const { count } = await prisma.consoleInsight.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ConsoleInsightDeleteManyArgs>(args?: SelectSubset<T, ConsoleInsightDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ConsoleInsights.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ConsoleInsightUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many ConsoleInsights
     * const consoleInsight = await prisma.consoleInsight.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ConsoleInsightUpdateManyArgs>(args: SelectSubset<T, ConsoleInsightUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ConsoleInsights and returns the data updated in the database.
     * @param {ConsoleInsightUpdateManyAndReturnArgs} args - Arguments to update many ConsoleInsights.
     * @example
     * // Update many ConsoleInsights
     * const consoleInsight = await prisma.consoleInsight.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more ConsoleInsights and only return the `id`
     * const consoleInsightWithIdOnly = await prisma.consoleInsight.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends ConsoleInsightUpdateManyAndReturnArgs>(args: SelectSubset<T, ConsoleInsightUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ConsoleInsightPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one ConsoleInsight.
     * @param {ConsoleInsightUpsertArgs} args - Arguments to update or create a ConsoleInsight.
     * @example
     * // Update or create a ConsoleInsight
     * const consoleInsight = await prisma.consoleInsight.upsert({
     *   create: {
     *     // ... data to create a ConsoleInsight
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the ConsoleInsight we want to update
     *   }
     * })
     */
    upsert<T extends ConsoleInsightUpsertArgs>(args: SelectSubset<T, ConsoleInsightUpsertArgs<ExtArgs>>): Prisma__ConsoleInsightClient<$Result.GetResult<Prisma.$ConsoleInsightPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of ConsoleInsights.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ConsoleInsightCountArgs} args - Arguments to filter ConsoleInsights to count.
     * @example
     * // Count the number of ConsoleInsights
     * const count = await prisma.consoleInsight.count({
     *   where: {
     *     // ... the filter for the ConsoleInsights we want to count
     *   }
     * })
    **/
    count<T extends ConsoleInsightCountArgs>(
      args?: Subset<T, ConsoleInsightCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ConsoleInsightCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a ConsoleInsight.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ConsoleInsightAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends ConsoleInsightAggregateArgs>(args: Subset<T, ConsoleInsightAggregateArgs>): Prisma.PrismaPromise<GetConsoleInsightAggregateType<T>>

    /**
     * Group by ConsoleInsight.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ConsoleInsightGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends ConsoleInsightGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ConsoleInsightGroupByArgs['orderBy'] }
        : { orderBy?: ConsoleInsightGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, ConsoleInsightGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetConsoleInsightGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the ConsoleInsight model
   */
  readonly fields: ConsoleInsightFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for ConsoleInsight.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ConsoleInsightClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    user<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the ConsoleInsight model
   */
  interface ConsoleInsightFieldRefs {
    readonly id: FieldRef<"ConsoleInsight", 'String'>
    readonly userId: FieldRef<"ConsoleInsight", 'String'>
    readonly content: FieldRef<"ConsoleInsight", 'String'>
    readonly timestamp: FieldRef<"ConsoleInsight", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * ConsoleInsight findUnique
   */
  export type ConsoleInsightFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ConsoleInsight
     */
    select?: ConsoleInsightSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ConsoleInsight
     */
    omit?: ConsoleInsightOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ConsoleInsightInclude<ExtArgs> | null
    /**
     * Filter, which ConsoleInsight to fetch.
     */
    where: ConsoleInsightWhereUniqueInput
  }

  /**
   * ConsoleInsight findUniqueOrThrow
   */
  export type ConsoleInsightFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ConsoleInsight
     */
    select?: ConsoleInsightSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ConsoleInsight
     */
    omit?: ConsoleInsightOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ConsoleInsightInclude<ExtArgs> | null
    /**
     * Filter, which ConsoleInsight to fetch.
     */
    where: ConsoleInsightWhereUniqueInput
  }

  /**
   * ConsoleInsight findFirst
   */
  export type ConsoleInsightFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ConsoleInsight
     */
    select?: ConsoleInsightSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ConsoleInsight
     */
    omit?: ConsoleInsightOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ConsoleInsightInclude<ExtArgs> | null
    /**
     * Filter, which ConsoleInsight to fetch.
     */
    where?: ConsoleInsightWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ConsoleInsights to fetch.
     */
    orderBy?: ConsoleInsightOrderByWithRelationInput | ConsoleInsightOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ConsoleInsights.
     */
    cursor?: ConsoleInsightWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ConsoleInsights from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ConsoleInsights.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ConsoleInsights.
     */
    distinct?: ConsoleInsightScalarFieldEnum | ConsoleInsightScalarFieldEnum[]
  }

  /**
   * ConsoleInsight findFirstOrThrow
   */
  export type ConsoleInsightFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ConsoleInsight
     */
    select?: ConsoleInsightSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ConsoleInsight
     */
    omit?: ConsoleInsightOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ConsoleInsightInclude<ExtArgs> | null
    /**
     * Filter, which ConsoleInsight to fetch.
     */
    where?: ConsoleInsightWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ConsoleInsights to fetch.
     */
    orderBy?: ConsoleInsightOrderByWithRelationInput | ConsoleInsightOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ConsoleInsights.
     */
    cursor?: ConsoleInsightWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ConsoleInsights from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ConsoleInsights.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ConsoleInsights.
     */
    distinct?: ConsoleInsightScalarFieldEnum | ConsoleInsightScalarFieldEnum[]
  }

  /**
   * ConsoleInsight findMany
   */
  export type ConsoleInsightFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ConsoleInsight
     */
    select?: ConsoleInsightSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ConsoleInsight
     */
    omit?: ConsoleInsightOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ConsoleInsightInclude<ExtArgs> | null
    /**
     * Filter, which ConsoleInsights to fetch.
     */
    where?: ConsoleInsightWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ConsoleInsights to fetch.
     */
    orderBy?: ConsoleInsightOrderByWithRelationInput | ConsoleInsightOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing ConsoleInsights.
     */
    cursor?: ConsoleInsightWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ConsoleInsights from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ConsoleInsights.
     */
    skip?: number
    distinct?: ConsoleInsightScalarFieldEnum | ConsoleInsightScalarFieldEnum[]
  }

  /**
   * ConsoleInsight create
   */
  export type ConsoleInsightCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ConsoleInsight
     */
    select?: ConsoleInsightSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ConsoleInsight
     */
    omit?: ConsoleInsightOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ConsoleInsightInclude<ExtArgs> | null
    /**
     * The data needed to create a ConsoleInsight.
     */
    data: XOR<ConsoleInsightCreateInput, ConsoleInsightUncheckedCreateInput>
  }

  /**
   * ConsoleInsight createMany
   */
  export type ConsoleInsightCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many ConsoleInsights.
     */
    data: ConsoleInsightCreateManyInput | ConsoleInsightCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * ConsoleInsight createManyAndReturn
   */
  export type ConsoleInsightCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ConsoleInsight
     */
    select?: ConsoleInsightSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the ConsoleInsight
     */
    omit?: ConsoleInsightOmit<ExtArgs> | null
    /**
     * The data used to create many ConsoleInsights.
     */
    data: ConsoleInsightCreateManyInput | ConsoleInsightCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ConsoleInsightIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * ConsoleInsight update
   */
  export type ConsoleInsightUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ConsoleInsight
     */
    select?: ConsoleInsightSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ConsoleInsight
     */
    omit?: ConsoleInsightOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ConsoleInsightInclude<ExtArgs> | null
    /**
     * The data needed to update a ConsoleInsight.
     */
    data: XOR<ConsoleInsightUpdateInput, ConsoleInsightUncheckedUpdateInput>
    /**
     * Choose, which ConsoleInsight to update.
     */
    where: ConsoleInsightWhereUniqueInput
  }

  /**
   * ConsoleInsight updateMany
   */
  export type ConsoleInsightUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update ConsoleInsights.
     */
    data: XOR<ConsoleInsightUpdateManyMutationInput, ConsoleInsightUncheckedUpdateManyInput>
    /**
     * Filter which ConsoleInsights to update
     */
    where?: ConsoleInsightWhereInput
    /**
     * Limit how many ConsoleInsights to update.
     */
    limit?: number
  }

  /**
   * ConsoleInsight updateManyAndReturn
   */
  export type ConsoleInsightUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ConsoleInsight
     */
    select?: ConsoleInsightSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the ConsoleInsight
     */
    omit?: ConsoleInsightOmit<ExtArgs> | null
    /**
     * The data used to update ConsoleInsights.
     */
    data: XOR<ConsoleInsightUpdateManyMutationInput, ConsoleInsightUncheckedUpdateManyInput>
    /**
     * Filter which ConsoleInsights to update
     */
    where?: ConsoleInsightWhereInput
    /**
     * Limit how many ConsoleInsights to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ConsoleInsightIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * ConsoleInsight upsert
   */
  export type ConsoleInsightUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ConsoleInsight
     */
    select?: ConsoleInsightSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ConsoleInsight
     */
    omit?: ConsoleInsightOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ConsoleInsightInclude<ExtArgs> | null
    /**
     * The filter to search for the ConsoleInsight to update in case it exists.
     */
    where: ConsoleInsightWhereUniqueInput
    /**
     * In case the ConsoleInsight found by the `where` argument doesn't exist, create a new ConsoleInsight with this data.
     */
    create: XOR<ConsoleInsightCreateInput, ConsoleInsightUncheckedCreateInput>
    /**
     * In case the ConsoleInsight was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ConsoleInsightUpdateInput, ConsoleInsightUncheckedUpdateInput>
  }

  /**
   * ConsoleInsight delete
   */
  export type ConsoleInsightDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ConsoleInsight
     */
    select?: ConsoleInsightSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ConsoleInsight
     */
    omit?: ConsoleInsightOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ConsoleInsightInclude<ExtArgs> | null
    /**
     * Filter which ConsoleInsight to delete.
     */
    where: ConsoleInsightWhereUniqueInput
  }

  /**
   * ConsoleInsight deleteMany
   */
  export type ConsoleInsightDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ConsoleInsights to delete
     */
    where?: ConsoleInsightWhereInput
    /**
     * Limit how many ConsoleInsights to delete.
     */
    limit?: number
  }

  /**
   * ConsoleInsight without action
   */
  export type ConsoleInsightDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ConsoleInsight
     */
    select?: ConsoleInsightSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ConsoleInsight
     */
    omit?: ConsoleInsightOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ConsoleInsightInclude<ExtArgs> | null
  }


  /**
   * Model SignalHistoryItem
   */

  export type AggregateSignalHistoryItem = {
    _count: SignalHistoryItemCountAggregateOutputType | null
    _avg: SignalHistoryItemAvgAggregateOutputType | null
    _sum: SignalHistoryItemSumAggregateOutputType | null
    _min: SignalHistoryItemMinAggregateOutputType | null
    _max: SignalHistoryItemMaxAggregateOutputType | null
  }

  export type SignalHistoryItemAvgAggregateOutputType = {
    price: number | null
  }

  export type SignalHistoryItemSumAggregateOutputType = {
    price: number | null
  }

  export type SignalHistoryItemMinAggregateOutputType = {
    id: string | null
    userId: string | null
    signalType: string | null
    symbol: string | null
    price: number | null
    timestamp: Date | null
  }

  export type SignalHistoryItemMaxAggregateOutputType = {
    id: string | null
    userId: string | null
    signalType: string | null
    symbol: string | null
    price: number | null
    timestamp: Date | null
  }

  export type SignalHistoryItemCountAggregateOutputType = {
    id: number
    userId: number
    signalType: number
    symbol: number
    price: number
    timestamp: number
    _all: number
  }


  export type SignalHistoryItemAvgAggregateInputType = {
    price?: true
  }

  export type SignalHistoryItemSumAggregateInputType = {
    price?: true
  }

  export type SignalHistoryItemMinAggregateInputType = {
    id?: true
    userId?: true
    signalType?: true
    symbol?: true
    price?: true
    timestamp?: true
  }

  export type SignalHistoryItemMaxAggregateInputType = {
    id?: true
    userId?: true
    signalType?: true
    symbol?: true
    price?: true
    timestamp?: true
  }

  export type SignalHistoryItemCountAggregateInputType = {
    id?: true
    userId?: true
    signalType?: true
    symbol?: true
    price?: true
    timestamp?: true
    _all?: true
  }

  export type SignalHistoryItemAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which SignalHistoryItem to aggregate.
     */
    where?: SignalHistoryItemWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SignalHistoryItems to fetch.
     */
    orderBy?: SignalHistoryItemOrderByWithRelationInput | SignalHistoryItemOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: SignalHistoryItemWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SignalHistoryItems from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SignalHistoryItems.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned SignalHistoryItems
    **/
    _count?: true | SignalHistoryItemCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: SignalHistoryItemAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: SignalHistoryItemSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: SignalHistoryItemMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: SignalHistoryItemMaxAggregateInputType
  }

  export type GetSignalHistoryItemAggregateType<T extends SignalHistoryItemAggregateArgs> = {
        [P in keyof T & keyof AggregateSignalHistoryItem]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateSignalHistoryItem[P]>
      : GetScalarType<T[P], AggregateSignalHistoryItem[P]>
  }




  export type SignalHistoryItemGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: SignalHistoryItemWhereInput
    orderBy?: SignalHistoryItemOrderByWithAggregationInput | SignalHistoryItemOrderByWithAggregationInput[]
    by: SignalHistoryItemScalarFieldEnum[] | SignalHistoryItemScalarFieldEnum
    having?: SignalHistoryItemScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: SignalHistoryItemCountAggregateInputType | true
    _avg?: SignalHistoryItemAvgAggregateInputType
    _sum?: SignalHistoryItemSumAggregateInputType
    _min?: SignalHistoryItemMinAggregateInputType
    _max?: SignalHistoryItemMaxAggregateInputType
  }

  export type SignalHistoryItemGroupByOutputType = {
    id: string
    userId: string
    signalType: string
    symbol: string
    price: number
    timestamp: Date
    _count: SignalHistoryItemCountAggregateOutputType | null
    _avg: SignalHistoryItemAvgAggregateOutputType | null
    _sum: SignalHistoryItemSumAggregateOutputType | null
    _min: SignalHistoryItemMinAggregateOutputType | null
    _max: SignalHistoryItemMaxAggregateOutputType | null
  }

  type GetSignalHistoryItemGroupByPayload<T extends SignalHistoryItemGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<SignalHistoryItemGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof SignalHistoryItemGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], SignalHistoryItemGroupByOutputType[P]>
            : GetScalarType<T[P], SignalHistoryItemGroupByOutputType[P]>
        }
      >
    >


  export type SignalHistoryItemSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    signalType?: boolean
    symbol?: boolean
    price?: boolean
    timestamp?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["signalHistoryItem"]>

  export type SignalHistoryItemSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    signalType?: boolean
    symbol?: boolean
    price?: boolean
    timestamp?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["signalHistoryItem"]>

  export type SignalHistoryItemSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    signalType?: boolean
    symbol?: boolean
    price?: boolean
    timestamp?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["signalHistoryItem"]>

  export type SignalHistoryItemSelectScalar = {
    id?: boolean
    userId?: boolean
    signalType?: boolean
    symbol?: boolean
    price?: boolean
    timestamp?: boolean
  }

  export type SignalHistoryItemOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "userId" | "signalType" | "symbol" | "price" | "timestamp", ExtArgs["result"]["signalHistoryItem"]>
  export type SignalHistoryItemInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type SignalHistoryItemIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type SignalHistoryItemIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }

  export type $SignalHistoryItemPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "SignalHistoryItem"
    objects: {
      user: Prisma.$UserPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      userId: string
      signalType: string
      symbol: string
      price: number
      timestamp: Date
    }, ExtArgs["result"]["signalHistoryItem"]>
    composites: {}
  }

  type SignalHistoryItemGetPayload<S extends boolean | null | undefined | SignalHistoryItemDefaultArgs> = $Result.GetResult<Prisma.$SignalHistoryItemPayload, S>

  type SignalHistoryItemCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<SignalHistoryItemFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: SignalHistoryItemCountAggregateInputType | true
    }

  export interface SignalHistoryItemDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['SignalHistoryItem'], meta: { name: 'SignalHistoryItem' } }
    /**
     * Find zero or one SignalHistoryItem that matches the filter.
     * @param {SignalHistoryItemFindUniqueArgs} args - Arguments to find a SignalHistoryItem
     * @example
     * // Get one SignalHistoryItem
     * const signalHistoryItem = await prisma.signalHistoryItem.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends SignalHistoryItemFindUniqueArgs>(args: SelectSubset<T, SignalHistoryItemFindUniqueArgs<ExtArgs>>): Prisma__SignalHistoryItemClient<$Result.GetResult<Prisma.$SignalHistoryItemPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one SignalHistoryItem that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {SignalHistoryItemFindUniqueOrThrowArgs} args - Arguments to find a SignalHistoryItem
     * @example
     * // Get one SignalHistoryItem
     * const signalHistoryItem = await prisma.signalHistoryItem.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends SignalHistoryItemFindUniqueOrThrowArgs>(args: SelectSubset<T, SignalHistoryItemFindUniqueOrThrowArgs<ExtArgs>>): Prisma__SignalHistoryItemClient<$Result.GetResult<Prisma.$SignalHistoryItemPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first SignalHistoryItem that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SignalHistoryItemFindFirstArgs} args - Arguments to find a SignalHistoryItem
     * @example
     * // Get one SignalHistoryItem
     * const signalHistoryItem = await prisma.signalHistoryItem.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends SignalHistoryItemFindFirstArgs>(args?: SelectSubset<T, SignalHistoryItemFindFirstArgs<ExtArgs>>): Prisma__SignalHistoryItemClient<$Result.GetResult<Prisma.$SignalHistoryItemPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first SignalHistoryItem that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SignalHistoryItemFindFirstOrThrowArgs} args - Arguments to find a SignalHistoryItem
     * @example
     * // Get one SignalHistoryItem
     * const signalHistoryItem = await prisma.signalHistoryItem.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends SignalHistoryItemFindFirstOrThrowArgs>(args?: SelectSubset<T, SignalHistoryItemFindFirstOrThrowArgs<ExtArgs>>): Prisma__SignalHistoryItemClient<$Result.GetResult<Prisma.$SignalHistoryItemPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more SignalHistoryItems that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SignalHistoryItemFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all SignalHistoryItems
     * const signalHistoryItems = await prisma.signalHistoryItem.findMany()
     * 
     * // Get first 10 SignalHistoryItems
     * const signalHistoryItems = await prisma.signalHistoryItem.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const signalHistoryItemWithIdOnly = await prisma.signalHistoryItem.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends SignalHistoryItemFindManyArgs>(args?: SelectSubset<T, SignalHistoryItemFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SignalHistoryItemPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a SignalHistoryItem.
     * @param {SignalHistoryItemCreateArgs} args - Arguments to create a SignalHistoryItem.
     * @example
     * // Create one SignalHistoryItem
     * const SignalHistoryItem = await prisma.signalHistoryItem.create({
     *   data: {
     *     // ... data to create a SignalHistoryItem
     *   }
     * })
     * 
     */
    create<T extends SignalHistoryItemCreateArgs>(args: SelectSubset<T, SignalHistoryItemCreateArgs<ExtArgs>>): Prisma__SignalHistoryItemClient<$Result.GetResult<Prisma.$SignalHistoryItemPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many SignalHistoryItems.
     * @param {SignalHistoryItemCreateManyArgs} args - Arguments to create many SignalHistoryItems.
     * @example
     * // Create many SignalHistoryItems
     * const signalHistoryItem = await prisma.signalHistoryItem.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends SignalHistoryItemCreateManyArgs>(args?: SelectSubset<T, SignalHistoryItemCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many SignalHistoryItems and returns the data saved in the database.
     * @param {SignalHistoryItemCreateManyAndReturnArgs} args - Arguments to create many SignalHistoryItems.
     * @example
     * // Create many SignalHistoryItems
     * const signalHistoryItem = await prisma.signalHistoryItem.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many SignalHistoryItems and only return the `id`
     * const signalHistoryItemWithIdOnly = await prisma.signalHistoryItem.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends SignalHistoryItemCreateManyAndReturnArgs>(args?: SelectSubset<T, SignalHistoryItemCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SignalHistoryItemPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a SignalHistoryItem.
     * @param {SignalHistoryItemDeleteArgs} args - Arguments to delete one SignalHistoryItem.
     * @example
     * // Delete one SignalHistoryItem
     * const SignalHistoryItem = await prisma.signalHistoryItem.delete({
     *   where: {
     *     // ... filter to delete one SignalHistoryItem
     *   }
     * })
     * 
     */
    delete<T extends SignalHistoryItemDeleteArgs>(args: SelectSubset<T, SignalHistoryItemDeleteArgs<ExtArgs>>): Prisma__SignalHistoryItemClient<$Result.GetResult<Prisma.$SignalHistoryItemPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one SignalHistoryItem.
     * @param {SignalHistoryItemUpdateArgs} args - Arguments to update one SignalHistoryItem.
     * @example
     * // Update one SignalHistoryItem
     * const signalHistoryItem = await prisma.signalHistoryItem.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends SignalHistoryItemUpdateArgs>(args: SelectSubset<T, SignalHistoryItemUpdateArgs<ExtArgs>>): Prisma__SignalHistoryItemClient<$Result.GetResult<Prisma.$SignalHistoryItemPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more SignalHistoryItems.
     * @param {SignalHistoryItemDeleteManyArgs} args - Arguments to filter SignalHistoryItems to delete.
     * @example
     * // Delete a few SignalHistoryItems
     * const { count } = await prisma.signalHistoryItem.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends SignalHistoryItemDeleteManyArgs>(args?: SelectSubset<T, SignalHistoryItemDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more SignalHistoryItems.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SignalHistoryItemUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many SignalHistoryItems
     * const signalHistoryItem = await prisma.signalHistoryItem.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends SignalHistoryItemUpdateManyArgs>(args: SelectSubset<T, SignalHistoryItemUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more SignalHistoryItems and returns the data updated in the database.
     * @param {SignalHistoryItemUpdateManyAndReturnArgs} args - Arguments to update many SignalHistoryItems.
     * @example
     * // Update many SignalHistoryItems
     * const signalHistoryItem = await prisma.signalHistoryItem.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more SignalHistoryItems and only return the `id`
     * const signalHistoryItemWithIdOnly = await prisma.signalHistoryItem.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends SignalHistoryItemUpdateManyAndReturnArgs>(args: SelectSubset<T, SignalHistoryItemUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SignalHistoryItemPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one SignalHistoryItem.
     * @param {SignalHistoryItemUpsertArgs} args - Arguments to update or create a SignalHistoryItem.
     * @example
     * // Update or create a SignalHistoryItem
     * const signalHistoryItem = await prisma.signalHistoryItem.upsert({
     *   create: {
     *     // ... data to create a SignalHistoryItem
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the SignalHistoryItem we want to update
     *   }
     * })
     */
    upsert<T extends SignalHistoryItemUpsertArgs>(args: SelectSubset<T, SignalHistoryItemUpsertArgs<ExtArgs>>): Prisma__SignalHistoryItemClient<$Result.GetResult<Prisma.$SignalHistoryItemPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of SignalHistoryItems.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SignalHistoryItemCountArgs} args - Arguments to filter SignalHistoryItems to count.
     * @example
     * // Count the number of SignalHistoryItems
     * const count = await prisma.signalHistoryItem.count({
     *   where: {
     *     // ... the filter for the SignalHistoryItems we want to count
     *   }
     * })
    **/
    count<T extends SignalHistoryItemCountArgs>(
      args?: Subset<T, SignalHistoryItemCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], SignalHistoryItemCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a SignalHistoryItem.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SignalHistoryItemAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends SignalHistoryItemAggregateArgs>(args: Subset<T, SignalHistoryItemAggregateArgs>): Prisma.PrismaPromise<GetSignalHistoryItemAggregateType<T>>

    /**
     * Group by SignalHistoryItem.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SignalHistoryItemGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends SignalHistoryItemGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: SignalHistoryItemGroupByArgs['orderBy'] }
        : { orderBy?: SignalHistoryItemGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, SignalHistoryItemGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetSignalHistoryItemGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the SignalHistoryItem model
   */
  readonly fields: SignalHistoryItemFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for SignalHistoryItem.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__SignalHistoryItemClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    user<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the SignalHistoryItem model
   */
  interface SignalHistoryItemFieldRefs {
    readonly id: FieldRef<"SignalHistoryItem", 'String'>
    readonly userId: FieldRef<"SignalHistoryItem", 'String'>
    readonly signalType: FieldRef<"SignalHistoryItem", 'String'>
    readonly symbol: FieldRef<"SignalHistoryItem", 'String'>
    readonly price: FieldRef<"SignalHistoryItem", 'Float'>
    readonly timestamp: FieldRef<"SignalHistoryItem", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * SignalHistoryItem findUnique
   */
  export type SignalHistoryItemFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SignalHistoryItem
     */
    select?: SignalHistoryItemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SignalHistoryItem
     */
    omit?: SignalHistoryItemOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SignalHistoryItemInclude<ExtArgs> | null
    /**
     * Filter, which SignalHistoryItem to fetch.
     */
    where: SignalHistoryItemWhereUniqueInput
  }

  /**
   * SignalHistoryItem findUniqueOrThrow
   */
  export type SignalHistoryItemFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SignalHistoryItem
     */
    select?: SignalHistoryItemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SignalHistoryItem
     */
    omit?: SignalHistoryItemOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SignalHistoryItemInclude<ExtArgs> | null
    /**
     * Filter, which SignalHistoryItem to fetch.
     */
    where: SignalHistoryItemWhereUniqueInput
  }

  /**
   * SignalHistoryItem findFirst
   */
  export type SignalHistoryItemFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SignalHistoryItem
     */
    select?: SignalHistoryItemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SignalHistoryItem
     */
    omit?: SignalHistoryItemOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SignalHistoryItemInclude<ExtArgs> | null
    /**
     * Filter, which SignalHistoryItem to fetch.
     */
    where?: SignalHistoryItemWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SignalHistoryItems to fetch.
     */
    orderBy?: SignalHistoryItemOrderByWithRelationInput | SignalHistoryItemOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for SignalHistoryItems.
     */
    cursor?: SignalHistoryItemWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SignalHistoryItems from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SignalHistoryItems.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of SignalHistoryItems.
     */
    distinct?: SignalHistoryItemScalarFieldEnum | SignalHistoryItemScalarFieldEnum[]
  }

  /**
   * SignalHistoryItem findFirstOrThrow
   */
  export type SignalHistoryItemFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SignalHistoryItem
     */
    select?: SignalHistoryItemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SignalHistoryItem
     */
    omit?: SignalHistoryItemOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SignalHistoryItemInclude<ExtArgs> | null
    /**
     * Filter, which SignalHistoryItem to fetch.
     */
    where?: SignalHistoryItemWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SignalHistoryItems to fetch.
     */
    orderBy?: SignalHistoryItemOrderByWithRelationInput | SignalHistoryItemOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for SignalHistoryItems.
     */
    cursor?: SignalHistoryItemWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SignalHistoryItems from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SignalHistoryItems.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of SignalHistoryItems.
     */
    distinct?: SignalHistoryItemScalarFieldEnum | SignalHistoryItemScalarFieldEnum[]
  }

  /**
   * SignalHistoryItem findMany
   */
  export type SignalHistoryItemFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SignalHistoryItem
     */
    select?: SignalHistoryItemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SignalHistoryItem
     */
    omit?: SignalHistoryItemOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SignalHistoryItemInclude<ExtArgs> | null
    /**
     * Filter, which SignalHistoryItems to fetch.
     */
    where?: SignalHistoryItemWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SignalHistoryItems to fetch.
     */
    orderBy?: SignalHistoryItemOrderByWithRelationInput | SignalHistoryItemOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing SignalHistoryItems.
     */
    cursor?: SignalHistoryItemWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SignalHistoryItems from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SignalHistoryItems.
     */
    skip?: number
    distinct?: SignalHistoryItemScalarFieldEnum | SignalHistoryItemScalarFieldEnum[]
  }

  /**
   * SignalHistoryItem create
   */
  export type SignalHistoryItemCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SignalHistoryItem
     */
    select?: SignalHistoryItemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SignalHistoryItem
     */
    omit?: SignalHistoryItemOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SignalHistoryItemInclude<ExtArgs> | null
    /**
     * The data needed to create a SignalHistoryItem.
     */
    data: XOR<SignalHistoryItemCreateInput, SignalHistoryItemUncheckedCreateInput>
  }

  /**
   * SignalHistoryItem createMany
   */
  export type SignalHistoryItemCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many SignalHistoryItems.
     */
    data: SignalHistoryItemCreateManyInput | SignalHistoryItemCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * SignalHistoryItem createManyAndReturn
   */
  export type SignalHistoryItemCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SignalHistoryItem
     */
    select?: SignalHistoryItemSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the SignalHistoryItem
     */
    omit?: SignalHistoryItemOmit<ExtArgs> | null
    /**
     * The data used to create many SignalHistoryItems.
     */
    data: SignalHistoryItemCreateManyInput | SignalHistoryItemCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SignalHistoryItemIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * SignalHistoryItem update
   */
  export type SignalHistoryItemUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SignalHistoryItem
     */
    select?: SignalHistoryItemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SignalHistoryItem
     */
    omit?: SignalHistoryItemOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SignalHistoryItemInclude<ExtArgs> | null
    /**
     * The data needed to update a SignalHistoryItem.
     */
    data: XOR<SignalHistoryItemUpdateInput, SignalHistoryItemUncheckedUpdateInput>
    /**
     * Choose, which SignalHistoryItem to update.
     */
    where: SignalHistoryItemWhereUniqueInput
  }

  /**
   * SignalHistoryItem updateMany
   */
  export type SignalHistoryItemUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update SignalHistoryItems.
     */
    data: XOR<SignalHistoryItemUpdateManyMutationInput, SignalHistoryItemUncheckedUpdateManyInput>
    /**
     * Filter which SignalHistoryItems to update
     */
    where?: SignalHistoryItemWhereInput
    /**
     * Limit how many SignalHistoryItems to update.
     */
    limit?: number
  }

  /**
   * SignalHistoryItem updateManyAndReturn
   */
  export type SignalHistoryItemUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SignalHistoryItem
     */
    select?: SignalHistoryItemSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the SignalHistoryItem
     */
    omit?: SignalHistoryItemOmit<ExtArgs> | null
    /**
     * The data used to update SignalHistoryItems.
     */
    data: XOR<SignalHistoryItemUpdateManyMutationInput, SignalHistoryItemUncheckedUpdateManyInput>
    /**
     * Filter which SignalHistoryItems to update
     */
    where?: SignalHistoryItemWhereInput
    /**
     * Limit how many SignalHistoryItems to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SignalHistoryItemIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * SignalHistoryItem upsert
   */
  export type SignalHistoryItemUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SignalHistoryItem
     */
    select?: SignalHistoryItemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SignalHistoryItem
     */
    omit?: SignalHistoryItemOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SignalHistoryItemInclude<ExtArgs> | null
    /**
     * The filter to search for the SignalHistoryItem to update in case it exists.
     */
    where: SignalHistoryItemWhereUniqueInput
    /**
     * In case the SignalHistoryItem found by the `where` argument doesn't exist, create a new SignalHistoryItem with this data.
     */
    create: XOR<SignalHistoryItemCreateInput, SignalHistoryItemUncheckedCreateInput>
    /**
     * In case the SignalHistoryItem was found with the provided `where` argument, update it with this data.
     */
    update: XOR<SignalHistoryItemUpdateInput, SignalHistoryItemUncheckedUpdateInput>
  }

  /**
   * SignalHistoryItem delete
   */
  export type SignalHistoryItemDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SignalHistoryItem
     */
    select?: SignalHistoryItemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SignalHistoryItem
     */
    omit?: SignalHistoryItemOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SignalHistoryItemInclude<ExtArgs> | null
    /**
     * Filter which SignalHistoryItem to delete.
     */
    where: SignalHistoryItemWhereUniqueInput
  }

  /**
   * SignalHistoryItem deleteMany
   */
  export type SignalHistoryItemDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which SignalHistoryItems to delete
     */
    where?: SignalHistoryItemWhereInput
    /**
     * Limit how many SignalHistoryItems to delete.
     */
    limit?: number
  }

  /**
   * SignalHistoryItem without action
   */
  export type SignalHistoryItemDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SignalHistoryItem
     */
    select?: SignalHistoryItemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SignalHistoryItem
     */
    omit?: SignalHistoryItemOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SignalHistoryItemInclude<ExtArgs> | null
  }


  /**
   * Model Position
   */

  export type AggregatePosition = {
    _count: PositionCountAggregateOutputType | null
    _avg: PositionAvgAggregateOutputType | null
    _sum: PositionSumAggregateOutputType | null
    _min: PositionMinAggregateOutputType | null
    _max: PositionMaxAggregateOutputType | null
  }

  export type PositionAvgAggregateOutputType = {
    entryPrice: number | null
    size: number | null
    closePrice: number | null
    pnl: number | null
    stopLoss: number | null
    takeProfit: number | null
  }

  export type PositionSumAggregateOutputType = {
    entryPrice: number | null
    size: number | null
    closePrice: number | null
    pnl: number | null
    stopLoss: number | null
    takeProfit: number | null
  }

  export type PositionMinAggregateOutputType = {
    id: string | null
    userId: string | null
    symbol: string | null
    signalType: string | null
    entryPrice: number | null
    size: number | null
    status: string | null
    openTimestamp: Date | null
    closeTimestamp: Date | null
    closePrice: number | null
    pnl: number | null
    stopLoss: number | null
    takeProfit: number | null
  }

  export type PositionMaxAggregateOutputType = {
    id: string | null
    userId: string | null
    symbol: string | null
    signalType: string | null
    entryPrice: number | null
    size: number | null
    status: string | null
    openTimestamp: Date | null
    closeTimestamp: Date | null
    closePrice: number | null
    pnl: number | null
    stopLoss: number | null
    takeProfit: number | null
  }

  export type PositionCountAggregateOutputType = {
    id: number
    userId: number
    symbol: number
    signalType: number
    entryPrice: number
    size: number
    status: number
    openTimestamp: number
    closeTimestamp: number
    closePrice: number
    pnl: number
    stopLoss: number
    takeProfit: number
    _all: number
  }


  export type PositionAvgAggregateInputType = {
    entryPrice?: true
    size?: true
    closePrice?: true
    pnl?: true
    stopLoss?: true
    takeProfit?: true
  }

  export type PositionSumAggregateInputType = {
    entryPrice?: true
    size?: true
    closePrice?: true
    pnl?: true
    stopLoss?: true
    takeProfit?: true
  }

  export type PositionMinAggregateInputType = {
    id?: true
    userId?: true
    symbol?: true
    signalType?: true
    entryPrice?: true
    size?: true
    status?: true
    openTimestamp?: true
    closeTimestamp?: true
    closePrice?: true
    pnl?: true
    stopLoss?: true
    takeProfit?: true
  }

  export type PositionMaxAggregateInputType = {
    id?: true
    userId?: true
    symbol?: true
    signalType?: true
    entryPrice?: true
    size?: true
    status?: true
    openTimestamp?: true
    closeTimestamp?: true
    closePrice?: true
    pnl?: true
    stopLoss?: true
    takeProfit?: true
  }

  export type PositionCountAggregateInputType = {
    id?: true
    userId?: true
    symbol?: true
    signalType?: true
    entryPrice?: true
    size?: true
    status?: true
    openTimestamp?: true
    closeTimestamp?: true
    closePrice?: true
    pnl?: true
    stopLoss?: true
    takeProfit?: true
    _all?: true
  }

  export type PositionAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Position to aggregate.
     */
    where?: PositionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Positions to fetch.
     */
    orderBy?: PositionOrderByWithRelationInput | PositionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: PositionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Positions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Positions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Positions
    **/
    _count?: true | PositionCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: PositionAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: PositionSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: PositionMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: PositionMaxAggregateInputType
  }

  export type GetPositionAggregateType<T extends PositionAggregateArgs> = {
        [P in keyof T & keyof AggregatePosition]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregatePosition[P]>
      : GetScalarType<T[P], AggregatePosition[P]>
  }




  export type PositionGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: PositionWhereInput
    orderBy?: PositionOrderByWithAggregationInput | PositionOrderByWithAggregationInput[]
    by: PositionScalarFieldEnum[] | PositionScalarFieldEnum
    having?: PositionScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: PositionCountAggregateInputType | true
    _avg?: PositionAvgAggregateInputType
    _sum?: PositionSumAggregateInputType
    _min?: PositionMinAggregateInputType
    _max?: PositionMaxAggregateInputType
  }

  export type PositionGroupByOutputType = {
    id: string
    userId: string
    symbol: string
    signalType: string
    entryPrice: number
    size: number
    status: string
    openTimestamp: Date
    closeTimestamp: Date | null
    closePrice: number | null
    pnl: number | null
    stopLoss: number | null
    takeProfit: number | null
    _count: PositionCountAggregateOutputType | null
    _avg: PositionAvgAggregateOutputType | null
    _sum: PositionSumAggregateOutputType | null
    _min: PositionMinAggregateOutputType | null
    _max: PositionMaxAggregateOutputType | null
  }

  type GetPositionGroupByPayload<T extends PositionGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<PositionGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof PositionGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], PositionGroupByOutputType[P]>
            : GetScalarType<T[P], PositionGroupByOutputType[P]>
        }
      >
    >


  export type PositionSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    symbol?: boolean
    signalType?: boolean
    entryPrice?: boolean
    size?: boolean
    status?: boolean
    openTimestamp?: boolean
    closeTimestamp?: boolean
    closePrice?: boolean
    pnl?: boolean
    stopLoss?: boolean
    takeProfit?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["position"]>

  export type PositionSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    symbol?: boolean
    signalType?: boolean
    entryPrice?: boolean
    size?: boolean
    status?: boolean
    openTimestamp?: boolean
    closeTimestamp?: boolean
    closePrice?: boolean
    pnl?: boolean
    stopLoss?: boolean
    takeProfit?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["position"]>

  export type PositionSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    symbol?: boolean
    signalType?: boolean
    entryPrice?: boolean
    size?: boolean
    status?: boolean
    openTimestamp?: boolean
    closeTimestamp?: boolean
    closePrice?: boolean
    pnl?: boolean
    stopLoss?: boolean
    takeProfit?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["position"]>

  export type PositionSelectScalar = {
    id?: boolean
    userId?: boolean
    symbol?: boolean
    signalType?: boolean
    entryPrice?: boolean
    size?: boolean
    status?: boolean
    openTimestamp?: boolean
    closeTimestamp?: boolean
    closePrice?: boolean
    pnl?: boolean
    stopLoss?: boolean
    takeProfit?: boolean
  }

  export type PositionOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "userId" | "symbol" | "signalType" | "entryPrice" | "size" | "status" | "openTimestamp" | "closeTimestamp" | "closePrice" | "pnl" | "stopLoss" | "takeProfit", ExtArgs["result"]["position"]>
  export type PositionInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type PositionIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type PositionIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }

  export type $PositionPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Position"
    objects: {
      user: Prisma.$UserPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      userId: string
      symbol: string
      signalType: string
      entryPrice: number
      size: number
      status: string
      openTimestamp: Date
      closeTimestamp: Date | null
      closePrice: number | null
      pnl: number | null
      stopLoss: number | null
      takeProfit: number | null
    }, ExtArgs["result"]["position"]>
    composites: {}
  }

  type PositionGetPayload<S extends boolean | null | undefined | PositionDefaultArgs> = $Result.GetResult<Prisma.$PositionPayload, S>

  type PositionCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<PositionFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: PositionCountAggregateInputType | true
    }

  export interface PositionDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Position'], meta: { name: 'Position' } }
    /**
     * Find zero or one Position that matches the filter.
     * @param {PositionFindUniqueArgs} args - Arguments to find a Position
     * @example
     * // Get one Position
     * const position = await prisma.position.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends PositionFindUniqueArgs>(args: SelectSubset<T, PositionFindUniqueArgs<ExtArgs>>): Prisma__PositionClient<$Result.GetResult<Prisma.$PositionPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Position that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {PositionFindUniqueOrThrowArgs} args - Arguments to find a Position
     * @example
     * // Get one Position
     * const position = await prisma.position.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends PositionFindUniqueOrThrowArgs>(args: SelectSubset<T, PositionFindUniqueOrThrowArgs<ExtArgs>>): Prisma__PositionClient<$Result.GetResult<Prisma.$PositionPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Position that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PositionFindFirstArgs} args - Arguments to find a Position
     * @example
     * // Get one Position
     * const position = await prisma.position.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends PositionFindFirstArgs>(args?: SelectSubset<T, PositionFindFirstArgs<ExtArgs>>): Prisma__PositionClient<$Result.GetResult<Prisma.$PositionPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Position that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PositionFindFirstOrThrowArgs} args - Arguments to find a Position
     * @example
     * // Get one Position
     * const position = await prisma.position.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends PositionFindFirstOrThrowArgs>(args?: SelectSubset<T, PositionFindFirstOrThrowArgs<ExtArgs>>): Prisma__PositionClient<$Result.GetResult<Prisma.$PositionPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Positions that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PositionFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Positions
     * const positions = await prisma.position.findMany()
     * 
     * // Get first 10 Positions
     * const positions = await prisma.position.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const positionWithIdOnly = await prisma.position.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends PositionFindManyArgs>(args?: SelectSubset<T, PositionFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PositionPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Position.
     * @param {PositionCreateArgs} args - Arguments to create a Position.
     * @example
     * // Create one Position
     * const Position = await prisma.position.create({
     *   data: {
     *     // ... data to create a Position
     *   }
     * })
     * 
     */
    create<T extends PositionCreateArgs>(args: SelectSubset<T, PositionCreateArgs<ExtArgs>>): Prisma__PositionClient<$Result.GetResult<Prisma.$PositionPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Positions.
     * @param {PositionCreateManyArgs} args - Arguments to create many Positions.
     * @example
     * // Create many Positions
     * const position = await prisma.position.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends PositionCreateManyArgs>(args?: SelectSubset<T, PositionCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Positions and returns the data saved in the database.
     * @param {PositionCreateManyAndReturnArgs} args - Arguments to create many Positions.
     * @example
     * // Create many Positions
     * const position = await prisma.position.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Positions and only return the `id`
     * const positionWithIdOnly = await prisma.position.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends PositionCreateManyAndReturnArgs>(args?: SelectSubset<T, PositionCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PositionPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Position.
     * @param {PositionDeleteArgs} args - Arguments to delete one Position.
     * @example
     * // Delete one Position
     * const Position = await prisma.position.delete({
     *   where: {
     *     // ... filter to delete one Position
     *   }
     * })
     * 
     */
    delete<T extends PositionDeleteArgs>(args: SelectSubset<T, PositionDeleteArgs<ExtArgs>>): Prisma__PositionClient<$Result.GetResult<Prisma.$PositionPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Position.
     * @param {PositionUpdateArgs} args - Arguments to update one Position.
     * @example
     * // Update one Position
     * const position = await prisma.position.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends PositionUpdateArgs>(args: SelectSubset<T, PositionUpdateArgs<ExtArgs>>): Prisma__PositionClient<$Result.GetResult<Prisma.$PositionPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Positions.
     * @param {PositionDeleteManyArgs} args - Arguments to filter Positions to delete.
     * @example
     * // Delete a few Positions
     * const { count } = await prisma.position.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends PositionDeleteManyArgs>(args?: SelectSubset<T, PositionDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Positions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PositionUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Positions
     * const position = await prisma.position.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends PositionUpdateManyArgs>(args: SelectSubset<T, PositionUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Positions and returns the data updated in the database.
     * @param {PositionUpdateManyAndReturnArgs} args - Arguments to update many Positions.
     * @example
     * // Update many Positions
     * const position = await prisma.position.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Positions and only return the `id`
     * const positionWithIdOnly = await prisma.position.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends PositionUpdateManyAndReturnArgs>(args: SelectSubset<T, PositionUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PositionPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Position.
     * @param {PositionUpsertArgs} args - Arguments to update or create a Position.
     * @example
     * // Update or create a Position
     * const position = await prisma.position.upsert({
     *   create: {
     *     // ... data to create a Position
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Position we want to update
     *   }
     * })
     */
    upsert<T extends PositionUpsertArgs>(args: SelectSubset<T, PositionUpsertArgs<ExtArgs>>): Prisma__PositionClient<$Result.GetResult<Prisma.$PositionPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Positions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PositionCountArgs} args - Arguments to filter Positions to count.
     * @example
     * // Count the number of Positions
     * const count = await prisma.position.count({
     *   where: {
     *     // ... the filter for the Positions we want to count
     *   }
     * })
    **/
    count<T extends PositionCountArgs>(
      args?: Subset<T, PositionCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], PositionCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Position.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PositionAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends PositionAggregateArgs>(args: Subset<T, PositionAggregateArgs>): Prisma.PrismaPromise<GetPositionAggregateType<T>>

    /**
     * Group by Position.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PositionGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends PositionGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: PositionGroupByArgs['orderBy'] }
        : { orderBy?: PositionGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, PositionGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetPositionGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Position model
   */
  readonly fields: PositionFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Position.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__PositionClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    user<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Position model
   */
  interface PositionFieldRefs {
    readonly id: FieldRef<"Position", 'String'>
    readonly userId: FieldRef<"Position", 'String'>
    readonly symbol: FieldRef<"Position", 'String'>
    readonly signalType: FieldRef<"Position", 'String'>
    readonly entryPrice: FieldRef<"Position", 'Float'>
    readonly size: FieldRef<"Position", 'Float'>
    readonly status: FieldRef<"Position", 'String'>
    readonly openTimestamp: FieldRef<"Position", 'DateTime'>
    readonly closeTimestamp: FieldRef<"Position", 'DateTime'>
    readonly closePrice: FieldRef<"Position", 'Float'>
    readonly pnl: FieldRef<"Position", 'Float'>
    readonly stopLoss: FieldRef<"Position", 'Float'>
    readonly takeProfit: FieldRef<"Position", 'Float'>
  }
    

  // Custom InputTypes
  /**
   * Position findUnique
   */
  export type PositionFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Position
     */
    select?: PositionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Position
     */
    omit?: PositionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PositionInclude<ExtArgs> | null
    /**
     * Filter, which Position to fetch.
     */
    where: PositionWhereUniqueInput
  }

  /**
   * Position findUniqueOrThrow
   */
  export type PositionFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Position
     */
    select?: PositionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Position
     */
    omit?: PositionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PositionInclude<ExtArgs> | null
    /**
     * Filter, which Position to fetch.
     */
    where: PositionWhereUniqueInput
  }

  /**
   * Position findFirst
   */
  export type PositionFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Position
     */
    select?: PositionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Position
     */
    omit?: PositionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PositionInclude<ExtArgs> | null
    /**
     * Filter, which Position to fetch.
     */
    where?: PositionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Positions to fetch.
     */
    orderBy?: PositionOrderByWithRelationInput | PositionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Positions.
     */
    cursor?: PositionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Positions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Positions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Positions.
     */
    distinct?: PositionScalarFieldEnum | PositionScalarFieldEnum[]
  }

  /**
   * Position findFirstOrThrow
   */
  export type PositionFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Position
     */
    select?: PositionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Position
     */
    omit?: PositionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PositionInclude<ExtArgs> | null
    /**
     * Filter, which Position to fetch.
     */
    where?: PositionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Positions to fetch.
     */
    orderBy?: PositionOrderByWithRelationInput | PositionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Positions.
     */
    cursor?: PositionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Positions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Positions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Positions.
     */
    distinct?: PositionScalarFieldEnum | PositionScalarFieldEnum[]
  }

  /**
   * Position findMany
   */
  export type PositionFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Position
     */
    select?: PositionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Position
     */
    omit?: PositionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PositionInclude<ExtArgs> | null
    /**
     * Filter, which Positions to fetch.
     */
    where?: PositionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Positions to fetch.
     */
    orderBy?: PositionOrderByWithRelationInput | PositionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Positions.
     */
    cursor?: PositionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Positions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Positions.
     */
    skip?: number
    distinct?: PositionScalarFieldEnum | PositionScalarFieldEnum[]
  }

  /**
   * Position create
   */
  export type PositionCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Position
     */
    select?: PositionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Position
     */
    omit?: PositionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PositionInclude<ExtArgs> | null
    /**
     * The data needed to create a Position.
     */
    data: XOR<PositionCreateInput, PositionUncheckedCreateInput>
  }

  /**
   * Position createMany
   */
  export type PositionCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Positions.
     */
    data: PositionCreateManyInput | PositionCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Position createManyAndReturn
   */
  export type PositionCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Position
     */
    select?: PositionSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Position
     */
    omit?: PositionOmit<ExtArgs> | null
    /**
     * The data used to create many Positions.
     */
    data: PositionCreateManyInput | PositionCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PositionIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Position update
   */
  export type PositionUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Position
     */
    select?: PositionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Position
     */
    omit?: PositionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PositionInclude<ExtArgs> | null
    /**
     * The data needed to update a Position.
     */
    data: XOR<PositionUpdateInput, PositionUncheckedUpdateInput>
    /**
     * Choose, which Position to update.
     */
    where: PositionWhereUniqueInput
  }

  /**
   * Position updateMany
   */
  export type PositionUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Positions.
     */
    data: XOR<PositionUpdateManyMutationInput, PositionUncheckedUpdateManyInput>
    /**
     * Filter which Positions to update
     */
    where?: PositionWhereInput
    /**
     * Limit how many Positions to update.
     */
    limit?: number
  }

  /**
   * Position updateManyAndReturn
   */
  export type PositionUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Position
     */
    select?: PositionSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Position
     */
    omit?: PositionOmit<ExtArgs> | null
    /**
     * The data used to update Positions.
     */
    data: XOR<PositionUpdateManyMutationInput, PositionUncheckedUpdateManyInput>
    /**
     * Filter which Positions to update
     */
    where?: PositionWhereInput
    /**
     * Limit how many Positions to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PositionIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Position upsert
   */
  export type PositionUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Position
     */
    select?: PositionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Position
     */
    omit?: PositionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PositionInclude<ExtArgs> | null
    /**
     * The filter to search for the Position to update in case it exists.
     */
    where: PositionWhereUniqueInput
    /**
     * In case the Position found by the `where` argument doesn't exist, create a new Position with this data.
     */
    create: XOR<PositionCreateInput, PositionUncheckedCreateInput>
    /**
     * In case the Position was found with the provided `where` argument, update it with this data.
     */
    update: XOR<PositionUpdateInput, PositionUncheckedUpdateInput>
  }

  /**
   * Position delete
   */
  export type PositionDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Position
     */
    select?: PositionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Position
     */
    omit?: PositionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PositionInclude<ExtArgs> | null
    /**
     * Filter which Position to delete.
     */
    where: PositionWhereUniqueInput
  }

  /**
   * Position deleteMany
   */
  export type PositionDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Positions to delete
     */
    where?: PositionWhereInput
    /**
     * Limit how many Positions to delete.
     */
    limit?: number
  }

  /**
   * Position without action
   */
  export type PositionDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Position
     */
    select?: PositionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Position
     */
    omit?: PositionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PositionInclude<ExtArgs> | null
  }


  /**
   * Model UserAgent
   */

  export type AggregateUserAgent = {
    _count: UserAgentCountAggregateOutputType | null
    _avg: UserAgentAvgAggregateOutputType | null
    _sum: UserAgentSumAggregateOutputType | null
    _min: UserAgentMinAggregateOutputType | null
    _max: UserAgentMaxAggregateOutputType | null
  }

  export type UserAgentAvgAggregateOutputType = {
    level: number | null
  }

  export type UserAgentSumAggregateOutputType = {
    level: number | null
  }

  export type UserAgentMinAggregateOutputType = {
    id: string | null
    userId: string | null
    agentId: string | null
    level: number | null
    status: string | null
    deploymentEndTime: Date | null
  }

  export type UserAgentMaxAggregateOutputType = {
    id: string | null
    userId: string | null
    agentId: string | null
    level: number | null
    status: string | null
    deploymentEndTime: Date | null
  }

  export type UserAgentCountAggregateOutputType = {
    id: number
    userId: number
    agentId: number
    level: number
    status: number
    deploymentEndTime: number
    _all: number
  }


  export type UserAgentAvgAggregateInputType = {
    level?: true
  }

  export type UserAgentSumAggregateInputType = {
    level?: true
  }

  export type UserAgentMinAggregateInputType = {
    id?: true
    userId?: true
    agentId?: true
    level?: true
    status?: true
    deploymentEndTime?: true
  }

  export type UserAgentMaxAggregateInputType = {
    id?: true
    userId?: true
    agentId?: true
    level?: true
    status?: true
    deploymentEndTime?: true
  }

  export type UserAgentCountAggregateInputType = {
    id?: true
    userId?: true
    agentId?: true
    level?: true
    status?: true
    deploymentEndTime?: true
    _all?: true
  }

  export type UserAgentAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which UserAgent to aggregate.
     */
    where?: UserAgentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UserAgents to fetch.
     */
    orderBy?: UserAgentOrderByWithRelationInput | UserAgentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: UserAgentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UserAgents from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UserAgents.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned UserAgents
    **/
    _count?: true | UserAgentCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: UserAgentAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: UserAgentSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: UserAgentMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: UserAgentMaxAggregateInputType
  }

  export type GetUserAgentAggregateType<T extends UserAgentAggregateArgs> = {
        [P in keyof T & keyof AggregateUserAgent]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateUserAgent[P]>
      : GetScalarType<T[P], AggregateUserAgent[P]>
  }




  export type UserAgentGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserAgentWhereInput
    orderBy?: UserAgentOrderByWithAggregationInput | UserAgentOrderByWithAggregationInput[]
    by: UserAgentScalarFieldEnum[] | UserAgentScalarFieldEnum
    having?: UserAgentScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: UserAgentCountAggregateInputType | true
    _avg?: UserAgentAvgAggregateInputType
    _sum?: UserAgentSumAggregateInputType
    _min?: UserAgentMinAggregateInputType
    _max?: UserAgentMaxAggregateInputType
  }

  export type UserAgentGroupByOutputType = {
    id: string
    userId: string
    agentId: string
    level: number
    status: string
    deploymentEndTime: Date | null
    _count: UserAgentCountAggregateOutputType | null
    _avg: UserAgentAvgAggregateOutputType | null
    _sum: UserAgentSumAggregateOutputType | null
    _min: UserAgentMinAggregateOutputType | null
    _max: UserAgentMaxAggregateOutputType | null
  }

  type GetUserAgentGroupByPayload<T extends UserAgentGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<UserAgentGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof UserAgentGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], UserAgentGroupByOutputType[P]>
            : GetScalarType<T[P], UserAgentGroupByOutputType[P]>
        }
      >
    >


  export type UserAgentSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    agentId?: boolean
    level?: boolean
    status?: boolean
    deploymentEndTime?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["userAgent"]>

  export type UserAgentSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    agentId?: boolean
    level?: boolean
    status?: boolean
    deploymentEndTime?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["userAgent"]>

  export type UserAgentSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    agentId?: boolean
    level?: boolean
    status?: boolean
    deploymentEndTime?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["userAgent"]>

  export type UserAgentSelectScalar = {
    id?: boolean
    userId?: boolean
    agentId?: boolean
    level?: boolean
    status?: boolean
    deploymentEndTime?: boolean
  }

  export type UserAgentOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "userId" | "agentId" | "level" | "status" | "deploymentEndTime", ExtArgs["result"]["userAgent"]>
  export type UserAgentInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type UserAgentIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type UserAgentIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }

  export type $UserAgentPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "UserAgent"
    objects: {
      user: Prisma.$UserPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      userId: string
      agentId: string
      level: number
      status: string
      deploymentEndTime: Date | null
    }, ExtArgs["result"]["userAgent"]>
    composites: {}
  }

  type UserAgentGetPayload<S extends boolean | null | undefined | UserAgentDefaultArgs> = $Result.GetResult<Prisma.$UserAgentPayload, S>

  type UserAgentCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<UserAgentFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: UserAgentCountAggregateInputType | true
    }

  export interface UserAgentDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['UserAgent'], meta: { name: 'UserAgent' } }
    /**
     * Find zero or one UserAgent that matches the filter.
     * @param {UserAgentFindUniqueArgs} args - Arguments to find a UserAgent
     * @example
     * // Get one UserAgent
     * const userAgent = await prisma.userAgent.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends UserAgentFindUniqueArgs>(args: SelectSubset<T, UserAgentFindUniqueArgs<ExtArgs>>): Prisma__UserAgentClient<$Result.GetResult<Prisma.$UserAgentPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one UserAgent that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {UserAgentFindUniqueOrThrowArgs} args - Arguments to find a UserAgent
     * @example
     * // Get one UserAgent
     * const userAgent = await prisma.userAgent.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends UserAgentFindUniqueOrThrowArgs>(args: SelectSubset<T, UserAgentFindUniqueOrThrowArgs<ExtArgs>>): Prisma__UserAgentClient<$Result.GetResult<Prisma.$UserAgentPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first UserAgent that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserAgentFindFirstArgs} args - Arguments to find a UserAgent
     * @example
     * // Get one UserAgent
     * const userAgent = await prisma.userAgent.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends UserAgentFindFirstArgs>(args?: SelectSubset<T, UserAgentFindFirstArgs<ExtArgs>>): Prisma__UserAgentClient<$Result.GetResult<Prisma.$UserAgentPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first UserAgent that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserAgentFindFirstOrThrowArgs} args - Arguments to find a UserAgent
     * @example
     * // Get one UserAgent
     * const userAgent = await prisma.userAgent.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends UserAgentFindFirstOrThrowArgs>(args?: SelectSubset<T, UserAgentFindFirstOrThrowArgs<ExtArgs>>): Prisma__UserAgentClient<$Result.GetResult<Prisma.$UserAgentPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more UserAgents that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserAgentFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all UserAgents
     * const userAgents = await prisma.userAgent.findMany()
     * 
     * // Get first 10 UserAgents
     * const userAgents = await prisma.userAgent.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const userAgentWithIdOnly = await prisma.userAgent.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends UserAgentFindManyArgs>(args?: SelectSubset<T, UserAgentFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserAgentPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a UserAgent.
     * @param {UserAgentCreateArgs} args - Arguments to create a UserAgent.
     * @example
     * // Create one UserAgent
     * const UserAgent = await prisma.userAgent.create({
     *   data: {
     *     // ... data to create a UserAgent
     *   }
     * })
     * 
     */
    create<T extends UserAgentCreateArgs>(args: SelectSubset<T, UserAgentCreateArgs<ExtArgs>>): Prisma__UserAgentClient<$Result.GetResult<Prisma.$UserAgentPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many UserAgents.
     * @param {UserAgentCreateManyArgs} args - Arguments to create many UserAgents.
     * @example
     * // Create many UserAgents
     * const userAgent = await prisma.userAgent.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends UserAgentCreateManyArgs>(args?: SelectSubset<T, UserAgentCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many UserAgents and returns the data saved in the database.
     * @param {UserAgentCreateManyAndReturnArgs} args - Arguments to create many UserAgents.
     * @example
     * // Create many UserAgents
     * const userAgent = await prisma.userAgent.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many UserAgents and only return the `id`
     * const userAgentWithIdOnly = await prisma.userAgent.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends UserAgentCreateManyAndReturnArgs>(args?: SelectSubset<T, UserAgentCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserAgentPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a UserAgent.
     * @param {UserAgentDeleteArgs} args - Arguments to delete one UserAgent.
     * @example
     * // Delete one UserAgent
     * const UserAgent = await prisma.userAgent.delete({
     *   where: {
     *     // ... filter to delete one UserAgent
     *   }
     * })
     * 
     */
    delete<T extends UserAgentDeleteArgs>(args: SelectSubset<T, UserAgentDeleteArgs<ExtArgs>>): Prisma__UserAgentClient<$Result.GetResult<Prisma.$UserAgentPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one UserAgent.
     * @param {UserAgentUpdateArgs} args - Arguments to update one UserAgent.
     * @example
     * // Update one UserAgent
     * const userAgent = await prisma.userAgent.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends UserAgentUpdateArgs>(args: SelectSubset<T, UserAgentUpdateArgs<ExtArgs>>): Prisma__UserAgentClient<$Result.GetResult<Prisma.$UserAgentPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more UserAgents.
     * @param {UserAgentDeleteManyArgs} args - Arguments to filter UserAgents to delete.
     * @example
     * // Delete a few UserAgents
     * const { count } = await prisma.userAgent.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends UserAgentDeleteManyArgs>(args?: SelectSubset<T, UserAgentDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more UserAgents.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserAgentUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many UserAgents
     * const userAgent = await prisma.userAgent.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends UserAgentUpdateManyArgs>(args: SelectSubset<T, UserAgentUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more UserAgents and returns the data updated in the database.
     * @param {UserAgentUpdateManyAndReturnArgs} args - Arguments to update many UserAgents.
     * @example
     * // Update many UserAgents
     * const userAgent = await prisma.userAgent.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more UserAgents and only return the `id`
     * const userAgentWithIdOnly = await prisma.userAgent.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends UserAgentUpdateManyAndReturnArgs>(args: SelectSubset<T, UserAgentUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserAgentPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one UserAgent.
     * @param {UserAgentUpsertArgs} args - Arguments to update or create a UserAgent.
     * @example
     * // Update or create a UserAgent
     * const userAgent = await prisma.userAgent.upsert({
     *   create: {
     *     // ... data to create a UserAgent
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the UserAgent we want to update
     *   }
     * })
     */
    upsert<T extends UserAgentUpsertArgs>(args: SelectSubset<T, UserAgentUpsertArgs<ExtArgs>>): Prisma__UserAgentClient<$Result.GetResult<Prisma.$UserAgentPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of UserAgents.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserAgentCountArgs} args - Arguments to filter UserAgents to count.
     * @example
     * // Count the number of UserAgents
     * const count = await prisma.userAgent.count({
     *   where: {
     *     // ... the filter for the UserAgents we want to count
     *   }
     * })
    **/
    count<T extends UserAgentCountArgs>(
      args?: Subset<T, UserAgentCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], UserAgentCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a UserAgent.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserAgentAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends UserAgentAggregateArgs>(args: Subset<T, UserAgentAggregateArgs>): Prisma.PrismaPromise<GetUserAgentAggregateType<T>>

    /**
     * Group by UserAgent.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserAgentGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends UserAgentGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: UserAgentGroupByArgs['orderBy'] }
        : { orderBy?: UserAgentGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, UserAgentGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetUserAgentGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the UserAgent model
   */
  readonly fields: UserAgentFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for UserAgent.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__UserAgentClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    user<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the UserAgent model
   */
  interface UserAgentFieldRefs {
    readonly id: FieldRef<"UserAgent", 'String'>
    readonly userId: FieldRef<"UserAgent", 'String'>
    readonly agentId: FieldRef<"UserAgent", 'String'>
    readonly level: FieldRef<"UserAgent", 'Int'>
    readonly status: FieldRef<"UserAgent", 'String'>
    readonly deploymentEndTime: FieldRef<"UserAgent", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * UserAgent findUnique
   */
  export type UserAgentFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserAgent
     */
    select?: UserAgentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserAgent
     */
    omit?: UserAgentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserAgentInclude<ExtArgs> | null
    /**
     * Filter, which UserAgent to fetch.
     */
    where: UserAgentWhereUniqueInput
  }

  /**
   * UserAgent findUniqueOrThrow
   */
  export type UserAgentFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserAgent
     */
    select?: UserAgentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserAgent
     */
    omit?: UserAgentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserAgentInclude<ExtArgs> | null
    /**
     * Filter, which UserAgent to fetch.
     */
    where: UserAgentWhereUniqueInput
  }

  /**
   * UserAgent findFirst
   */
  export type UserAgentFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserAgent
     */
    select?: UserAgentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserAgent
     */
    omit?: UserAgentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserAgentInclude<ExtArgs> | null
    /**
     * Filter, which UserAgent to fetch.
     */
    where?: UserAgentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UserAgents to fetch.
     */
    orderBy?: UserAgentOrderByWithRelationInput | UserAgentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for UserAgents.
     */
    cursor?: UserAgentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UserAgents from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UserAgents.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of UserAgents.
     */
    distinct?: UserAgentScalarFieldEnum | UserAgentScalarFieldEnum[]
  }

  /**
   * UserAgent findFirstOrThrow
   */
  export type UserAgentFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserAgent
     */
    select?: UserAgentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserAgent
     */
    omit?: UserAgentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserAgentInclude<ExtArgs> | null
    /**
     * Filter, which UserAgent to fetch.
     */
    where?: UserAgentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UserAgents to fetch.
     */
    orderBy?: UserAgentOrderByWithRelationInput | UserAgentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for UserAgents.
     */
    cursor?: UserAgentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UserAgents from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UserAgents.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of UserAgents.
     */
    distinct?: UserAgentScalarFieldEnum | UserAgentScalarFieldEnum[]
  }

  /**
   * UserAgent findMany
   */
  export type UserAgentFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserAgent
     */
    select?: UserAgentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserAgent
     */
    omit?: UserAgentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserAgentInclude<ExtArgs> | null
    /**
     * Filter, which UserAgents to fetch.
     */
    where?: UserAgentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UserAgents to fetch.
     */
    orderBy?: UserAgentOrderByWithRelationInput | UserAgentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing UserAgents.
     */
    cursor?: UserAgentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UserAgents from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UserAgents.
     */
    skip?: number
    distinct?: UserAgentScalarFieldEnum | UserAgentScalarFieldEnum[]
  }

  /**
   * UserAgent create
   */
  export type UserAgentCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserAgent
     */
    select?: UserAgentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserAgent
     */
    omit?: UserAgentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserAgentInclude<ExtArgs> | null
    /**
     * The data needed to create a UserAgent.
     */
    data: XOR<UserAgentCreateInput, UserAgentUncheckedCreateInput>
  }

  /**
   * UserAgent createMany
   */
  export type UserAgentCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many UserAgents.
     */
    data: UserAgentCreateManyInput | UserAgentCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * UserAgent createManyAndReturn
   */
  export type UserAgentCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserAgent
     */
    select?: UserAgentSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the UserAgent
     */
    omit?: UserAgentOmit<ExtArgs> | null
    /**
     * The data used to create many UserAgents.
     */
    data: UserAgentCreateManyInput | UserAgentCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserAgentIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * UserAgent update
   */
  export type UserAgentUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserAgent
     */
    select?: UserAgentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserAgent
     */
    omit?: UserAgentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserAgentInclude<ExtArgs> | null
    /**
     * The data needed to update a UserAgent.
     */
    data: XOR<UserAgentUpdateInput, UserAgentUncheckedUpdateInput>
    /**
     * Choose, which UserAgent to update.
     */
    where: UserAgentWhereUniqueInput
  }

  /**
   * UserAgent updateMany
   */
  export type UserAgentUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update UserAgents.
     */
    data: XOR<UserAgentUpdateManyMutationInput, UserAgentUncheckedUpdateManyInput>
    /**
     * Filter which UserAgents to update
     */
    where?: UserAgentWhereInput
    /**
     * Limit how many UserAgents to update.
     */
    limit?: number
  }

  /**
   * UserAgent updateManyAndReturn
   */
  export type UserAgentUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserAgent
     */
    select?: UserAgentSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the UserAgent
     */
    omit?: UserAgentOmit<ExtArgs> | null
    /**
     * The data used to update UserAgents.
     */
    data: XOR<UserAgentUpdateManyMutationInput, UserAgentUncheckedUpdateManyInput>
    /**
     * Filter which UserAgents to update
     */
    where?: UserAgentWhereInput
    /**
     * Limit how many UserAgents to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserAgentIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * UserAgent upsert
   */
  export type UserAgentUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserAgent
     */
    select?: UserAgentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserAgent
     */
    omit?: UserAgentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserAgentInclude<ExtArgs> | null
    /**
     * The filter to search for the UserAgent to update in case it exists.
     */
    where: UserAgentWhereUniqueInput
    /**
     * In case the UserAgent found by the `where` argument doesn't exist, create a new UserAgent with this data.
     */
    create: XOR<UserAgentCreateInput, UserAgentUncheckedCreateInput>
    /**
     * In case the UserAgent was found with the provided `where` argument, update it with this data.
     */
    update: XOR<UserAgentUpdateInput, UserAgentUncheckedUpdateInput>
  }

  /**
   * UserAgent delete
   */
  export type UserAgentDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserAgent
     */
    select?: UserAgentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserAgent
     */
    omit?: UserAgentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserAgentInclude<ExtArgs> | null
    /**
     * Filter which UserAgent to delete.
     */
    where: UserAgentWhereUniqueInput
  }

  /**
   * UserAgent deleteMany
   */
  export type UserAgentDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which UserAgents to delete
     */
    where?: UserAgentWhereInput
    /**
     * Limit how many UserAgents to delete.
     */
    limit?: number
  }

  /**
   * UserAgent without action
   */
  export type UserAgentDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserAgent
     */
    select?: UserAgentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserAgent
     */
    omit?: UserAgentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserAgentInclude<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const UserScalarFieldEnum: {
    id: 'id',
    username: 'username',
    status: 'status',
    shadowId: 'shadowId',
    weeklyPoints: 'weeklyPoints',
    airdropPoints: 'airdropPoints',
    wallet_address: 'wallet_address',
    wallet_type: 'wallet_type',
    email: 'email',
    phone: 'phone',
    x_handle: 'x_handle',
    telegram_handle: 'telegram_handle',
    youtube_handle: 'youtube_handle'
  };

  export type UserScalarFieldEnum = (typeof UserScalarFieldEnum)[keyof typeof UserScalarFieldEnum]


  export const BadgeScalarFieldEnum: {
    id: 'id',
    name: 'name'
  };

  export type BadgeScalarFieldEnum = (typeof BadgeScalarFieldEnum)[keyof typeof BadgeScalarFieldEnum]


  export const ConsoleInsightScalarFieldEnum: {
    id: 'id',
    userId: 'userId',
    content: 'content',
    timestamp: 'timestamp'
  };

  export type ConsoleInsightScalarFieldEnum = (typeof ConsoleInsightScalarFieldEnum)[keyof typeof ConsoleInsightScalarFieldEnum]


  export const SignalHistoryItemScalarFieldEnum: {
    id: 'id',
    userId: 'userId',
    signalType: 'signalType',
    symbol: 'symbol',
    price: 'price',
    timestamp: 'timestamp'
  };

  export type SignalHistoryItemScalarFieldEnum = (typeof SignalHistoryItemScalarFieldEnum)[keyof typeof SignalHistoryItemScalarFieldEnum]


  export const PositionScalarFieldEnum: {
    id: 'id',
    userId: 'userId',
    symbol: 'symbol',
    signalType: 'signalType',
    entryPrice: 'entryPrice',
    size: 'size',
    status: 'status',
    openTimestamp: 'openTimestamp',
    closeTimestamp: 'closeTimestamp',
    closePrice: 'closePrice',
    pnl: 'pnl',
    stopLoss: 'stopLoss',
    takeProfit: 'takeProfit'
  };

  export type PositionScalarFieldEnum = (typeof PositionScalarFieldEnum)[keyof typeof PositionScalarFieldEnum]


  export const UserAgentScalarFieldEnum: {
    id: 'id',
    userId: 'userId',
    agentId: 'agentId',
    level: 'level',
    status: 'status',
    deploymentEndTime: 'deploymentEndTime'
  };

  export type UserAgentScalarFieldEnum = (typeof UserAgentScalarFieldEnum)[keyof typeof UserAgentScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const QueryMode: {
    default: 'default',
    insensitive: 'insensitive'
  };

  export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  /**
   * Field references
   */


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'String[]'
   */
  export type ListStringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String[]'>
    


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'DateTime[]'
   */
  export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    


  /**
   * Reference to a field of type 'Float[]'
   */
  export type ListFloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float[]'>
    
  /**
   * Deep Input Types
   */


  export type UserWhereInput = {
    AND?: UserWhereInput | UserWhereInput[]
    OR?: UserWhereInput[]
    NOT?: UserWhereInput | UserWhereInput[]
    id?: UuidFilter<"User"> | string
    username?: StringFilter<"User"> | string
    status?: StringNullableFilter<"User"> | string | null
    shadowId?: StringNullableFilter<"User"> | string | null
    weeklyPoints?: IntFilter<"User"> | number
    airdropPoints?: IntFilter<"User"> | number
    wallet_address?: StringNullableFilter<"User"> | string | null
    wallet_type?: StringNullableFilter<"User"> | string | null
    email?: StringNullableFilter<"User"> | string | null
    phone?: StringNullableFilter<"User"> | string | null
    x_handle?: StringNullableFilter<"User"> | string | null
    telegram_handle?: StringNullableFilter<"User"> | string | null
    youtube_handle?: StringNullableFilter<"User"> | string | null
    badges?: BadgeListRelationFilter
    consoleInsights?: ConsoleInsightListRelationFilter
    signals?: SignalHistoryItemListRelationFilter
    positions?: PositionListRelationFilter
    userAgents?: UserAgentListRelationFilter
  }

  export type UserOrderByWithRelationInput = {
    id?: SortOrder
    username?: SortOrder
    status?: SortOrderInput | SortOrder
    shadowId?: SortOrderInput | SortOrder
    weeklyPoints?: SortOrder
    airdropPoints?: SortOrder
    wallet_address?: SortOrderInput | SortOrder
    wallet_type?: SortOrderInput | SortOrder
    email?: SortOrderInput | SortOrder
    phone?: SortOrderInput | SortOrder
    x_handle?: SortOrderInput | SortOrder
    telegram_handle?: SortOrderInput | SortOrder
    youtube_handle?: SortOrderInput | SortOrder
    badges?: BadgeOrderByRelationAggregateInput
    consoleInsights?: ConsoleInsightOrderByRelationAggregateInput
    signals?: SignalHistoryItemOrderByRelationAggregateInput
    positions?: PositionOrderByRelationAggregateInput
    userAgents?: UserAgentOrderByRelationAggregateInput
  }

  export type UserWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    username?: string
    shadowId?: string
    AND?: UserWhereInput | UserWhereInput[]
    OR?: UserWhereInput[]
    NOT?: UserWhereInput | UserWhereInput[]
    status?: StringNullableFilter<"User"> | string | null
    weeklyPoints?: IntFilter<"User"> | number
    airdropPoints?: IntFilter<"User"> | number
    wallet_address?: StringNullableFilter<"User"> | string | null
    wallet_type?: StringNullableFilter<"User"> | string | null
    email?: StringNullableFilter<"User"> | string | null
    phone?: StringNullableFilter<"User"> | string | null
    x_handle?: StringNullableFilter<"User"> | string | null
    telegram_handle?: StringNullableFilter<"User"> | string | null
    youtube_handle?: StringNullableFilter<"User"> | string | null
    badges?: BadgeListRelationFilter
    consoleInsights?: ConsoleInsightListRelationFilter
    signals?: SignalHistoryItemListRelationFilter
    positions?: PositionListRelationFilter
    userAgents?: UserAgentListRelationFilter
  }, "id" | "username" | "shadowId">

  export type UserOrderByWithAggregationInput = {
    id?: SortOrder
    username?: SortOrder
    status?: SortOrderInput | SortOrder
    shadowId?: SortOrderInput | SortOrder
    weeklyPoints?: SortOrder
    airdropPoints?: SortOrder
    wallet_address?: SortOrderInput | SortOrder
    wallet_type?: SortOrderInput | SortOrder
    email?: SortOrderInput | SortOrder
    phone?: SortOrderInput | SortOrder
    x_handle?: SortOrderInput | SortOrder
    telegram_handle?: SortOrderInput | SortOrder
    youtube_handle?: SortOrderInput | SortOrder
    _count?: UserCountOrderByAggregateInput
    _avg?: UserAvgOrderByAggregateInput
    _max?: UserMaxOrderByAggregateInput
    _min?: UserMinOrderByAggregateInput
    _sum?: UserSumOrderByAggregateInput
  }

  export type UserScalarWhereWithAggregatesInput = {
    AND?: UserScalarWhereWithAggregatesInput | UserScalarWhereWithAggregatesInput[]
    OR?: UserScalarWhereWithAggregatesInput[]
    NOT?: UserScalarWhereWithAggregatesInput | UserScalarWhereWithAggregatesInput[]
    id?: UuidWithAggregatesFilter<"User"> | string
    username?: StringWithAggregatesFilter<"User"> | string
    status?: StringNullableWithAggregatesFilter<"User"> | string | null
    shadowId?: StringNullableWithAggregatesFilter<"User"> | string | null
    weeklyPoints?: IntWithAggregatesFilter<"User"> | number
    airdropPoints?: IntWithAggregatesFilter<"User"> | number
    wallet_address?: StringNullableWithAggregatesFilter<"User"> | string | null
    wallet_type?: StringNullableWithAggregatesFilter<"User"> | string | null
    email?: StringNullableWithAggregatesFilter<"User"> | string | null
    phone?: StringNullableWithAggregatesFilter<"User"> | string | null
    x_handle?: StringNullableWithAggregatesFilter<"User"> | string | null
    telegram_handle?: StringNullableWithAggregatesFilter<"User"> | string | null
    youtube_handle?: StringNullableWithAggregatesFilter<"User"> | string | null
  }

  export type BadgeWhereInput = {
    AND?: BadgeWhereInput | BadgeWhereInput[]
    OR?: BadgeWhereInput[]
    NOT?: BadgeWhereInput | BadgeWhereInput[]
    id?: UuidFilter<"Badge"> | string
    name?: StringFilter<"Badge"> | string
    users?: UserListRelationFilter
  }

  export type BadgeOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    users?: UserOrderByRelationAggregateInput
  }

  export type BadgeWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    name?: string
    AND?: BadgeWhereInput | BadgeWhereInput[]
    OR?: BadgeWhereInput[]
    NOT?: BadgeWhereInput | BadgeWhereInput[]
    users?: UserListRelationFilter
  }, "id" | "name">

  export type BadgeOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    _count?: BadgeCountOrderByAggregateInput
    _max?: BadgeMaxOrderByAggregateInput
    _min?: BadgeMinOrderByAggregateInput
  }

  export type BadgeScalarWhereWithAggregatesInput = {
    AND?: BadgeScalarWhereWithAggregatesInput | BadgeScalarWhereWithAggregatesInput[]
    OR?: BadgeScalarWhereWithAggregatesInput[]
    NOT?: BadgeScalarWhereWithAggregatesInput | BadgeScalarWhereWithAggregatesInput[]
    id?: UuidWithAggregatesFilter<"Badge"> | string
    name?: StringWithAggregatesFilter<"Badge"> | string
  }

  export type ConsoleInsightWhereInput = {
    AND?: ConsoleInsightWhereInput | ConsoleInsightWhereInput[]
    OR?: ConsoleInsightWhereInput[]
    NOT?: ConsoleInsightWhereInput | ConsoleInsightWhereInput[]
    id?: UuidFilter<"ConsoleInsight"> | string
    userId?: UuidFilter<"ConsoleInsight"> | string
    content?: StringFilter<"ConsoleInsight"> | string
    timestamp?: DateTimeFilter<"ConsoleInsight"> | Date | string
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
  }

  export type ConsoleInsightOrderByWithRelationInput = {
    id?: SortOrder
    userId?: SortOrder
    content?: SortOrder
    timestamp?: SortOrder
    user?: UserOrderByWithRelationInput
  }

  export type ConsoleInsightWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: ConsoleInsightWhereInput | ConsoleInsightWhereInput[]
    OR?: ConsoleInsightWhereInput[]
    NOT?: ConsoleInsightWhereInput | ConsoleInsightWhereInput[]
    userId?: UuidFilter<"ConsoleInsight"> | string
    content?: StringFilter<"ConsoleInsight"> | string
    timestamp?: DateTimeFilter<"ConsoleInsight"> | Date | string
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
  }, "id">

  export type ConsoleInsightOrderByWithAggregationInput = {
    id?: SortOrder
    userId?: SortOrder
    content?: SortOrder
    timestamp?: SortOrder
    _count?: ConsoleInsightCountOrderByAggregateInput
    _max?: ConsoleInsightMaxOrderByAggregateInput
    _min?: ConsoleInsightMinOrderByAggregateInput
  }

  export type ConsoleInsightScalarWhereWithAggregatesInput = {
    AND?: ConsoleInsightScalarWhereWithAggregatesInput | ConsoleInsightScalarWhereWithAggregatesInput[]
    OR?: ConsoleInsightScalarWhereWithAggregatesInput[]
    NOT?: ConsoleInsightScalarWhereWithAggregatesInput | ConsoleInsightScalarWhereWithAggregatesInput[]
    id?: UuidWithAggregatesFilter<"ConsoleInsight"> | string
    userId?: UuidWithAggregatesFilter<"ConsoleInsight"> | string
    content?: StringWithAggregatesFilter<"ConsoleInsight"> | string
    timestamp?: DateTimeWithAggregatesFilter<"ConsoleInsight"> | Date | string
  }

  export type SignalHistoryItemWhereInput = {
    AND?: SignalHistoryItemWhereInput | SignalHistoryItemWhereInput[]
    OR?: SignalHistoryItemWhereInput[]
    NOT?: SignalHistoryItemWhereInput | SignalHistoryItemWhereInput[]
    id?: UuidFilter<"SignalHistoryItem"> | string
    userId?: UuidFilter<"SignalHistoryItem"> | string
    signalType?: StringFilter<"SignalHistoryItem"> | string
    symbol?: StringFilter<"SignalHistoryItem"> | string
    price?: FloatFilter<"SignalHistoryItem"> | number
    timestamp?: DateTimeFilter<"SignalHistoryItem"> | Date | string
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
  }

  export type SignalHistoryItemOrderByWithRelationInput = {
    id?: SortOrder
    userId?: SortOrder
    signalType?: SortOrder
    symbol?: SortOrder
    price?: SortOrder
    timestamp?: SortOrder
    user?: UserOrderByWithRelationInput
  }

  export type SignalHistoryItemWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: SignalHistoryItemWhereInput | SignalHistoryItemWhereInput[]
    OR?: SignalHistoryItemWhereInput[]
    NOT?: SignalHistoryItemWhereInput | SignalHistoryItemWhereInput[]
    userId?: UuidFilter<"SignalHistoryItem"> | string
    signalType?: StringFilter<"SignalHistoryItem"> | string
    symbol?: StringFilter<"SignalHistoryItem"> | string
    price?: FloatFilter<"SignalHistoryItem"> | number
    timestamp?: DateTimeFilter<"SignalHistoryItem"> | Date | string
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
  }, "id">

  export type SignalHistoryItemOrderByWithAggregationInput = {
    id?: SortOrder
    userId?: SortOrder
    signalType?: SortOrder
    symbol?: SortOrder
    price?: SortOrder
    timestamp?: SortOrder
    _count?: SignalHistoryItemCountOrderByAggregateInput
    _avg?: SignalHistoryItemAvgOrderByAggregateInput
    _max?: SignalHistoryItemMaxOrderByAggregateInput
    _min?: SignalHistoryItemMinOrderByAggregateInput
    _sum?: SignalHistoryItemSumOrderByAggregateInput
  }

  export type SignalHistoryItemScalarWhereWithAggregatesInput = {
    AND?: SignalHistoryItemScalarWhereWithAggregatesInput | SignalHistoryItemScalarWhereWithAggregatesInput[]
    OR?: SignalHistoryItemScalarWhereWithAggregatesInput[]
    NOT?: SignalHistoryItemScalarWhereWithAggregatesInput | SignalHistoryItemScalarWhereWithAggregatesInput[]
    id?: UuidWithAggregatesFilter<"SignalHistoryItem"> | string
    userId?: UuidWithAggregatesFilter<"SignalHistoryItem"> | string
    signalType?: StringWithAggregatesFilter<"SignalHistoryItem"> | string
    symbol?: StringWithAggregatesFilter<"SignalHistoryItem"> | string
    price?: FloatWithAggregatesFilter<"SignalHistoryItem"> | number
    timestamp?: DateTimeWithAggregatesFilter<"SignalHistoryItem"> | Date | string
  }

  export type PositionWhereInput = {
    AND?: PositionWhereInput | PositionWhereInput[]
    OR?: PositionWhereInput[]
    NOT?: PositionWhereInput | PositionWhereInput[]
    id?: UuidFilter<"Position"> | string
    userId?: UuidFilter<"Position"> | string
    symbol?: StringFilter<"Position"> | string
    signalType?: StringFilter<"Position"> | string
    entryPrice?: FloatFilter<"Position"> | number
    size?: FloatFilter<"Position"> | number
    status?: StringFilter<"Position"> | string
    openTimestamp?: DateTimeFilter<"Position"> | Date | string
    closeTimestamp?: DateTimeNullableFilter<"Position"> | Date | string | null
    closePrice?: FloatNullableFilter<"Position"> | number | null
    pnl?: FloatNullableFilter<"Position"> | number | null
    stopLoss?: FloatNullableFilter<"Position"> | number | null
    takeProfit?: FloatNullableFilter<"Position"> | number | null
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
  }

  export type PositionOrderByWithRelationInput = {
    id?: SortOrder
    userId?: SortOrder
    symbol?: SortOrder
    signalType?: SortOrder
    entryPrice?: SortOrder
    size?: SortOrder
    status?: SortOrder
    openTimestamp?: SortOrder
    closeTimestamp?: SortOrderInput | SortOrder
    closePrice?: SortOrderInput | SortOrder
    pnl?: SortOrderInput | SortOrder
    stopLoss?: SortOrderInput | SortOrder
    takeProfit?: SortOrderInput | SortOrder
    user?: UserOrderByWithRelationInput
  }

  export type PositionWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: PositionWhereInput | PositionWhereInput[]
    OR?: PositionWhereInput[]
    NOT?: PositionWhereInput | PositionWhereInput[]
    userId?: UuidFilter<"Position"> | string
    symbol?: StringFilter<"Position"> | string
    signalType?: StringFilter<"Position"> | string
    entryPrice?: FloatFilter<"Position"> | number
    size?: FloatFilter<"Position"> | number
    status?: StringFilter<"Position"> | string
    openTimestamp?: DateTimeFilter<"Position"> | Date | string
    closeTimestamp?: DateTimeNullableFilter<"Position"> | Date | string | null
    closePrice?: FloatNullableFilter<"Position"> | number | null
    pnl?: FloatNullableFilter<"Position"> | number | null
    stopLoss?: FloatNullableFilter<"Position"> | number | null
    takeProfit?: FloatNullableFilter<"Position"> | number | null
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
  }, "id">

  export type PositionOrderByWithAggregationInput = {
    id?: SortOrder
    userId?: SortOrder
    symbol?: SortOrder
    signalType?: SortOrder
    entryPrice?: SortOrder
    size?: SortOrder
    status?: SortOrder
    openTimestamp?: SortOrder
    closeTimestamp?: SortOrderInput | SortOrder
    closePrice?: SortOrderInput | SortOrder
    pnl?: SortOrderInput | SortOrder
    stopLoss?: SortOrderInput | SortOrder
    takeProfit?: SortOrderInput | SortOrder
    _count?: PositionCountOrderByAggregateInput
    _avg?: PositionAvgOrderByAggregateInput
    _max?: PositionMaxOrderByAggregateInput
    _min?: PositionMinOrderByAggregateInput
    _sum?: PositionSumOrderByAggregateInput
  }

  export type PositionScalarWhereWithAggregatesInput = {
    AND?: PositionScalarWhereWithAggregatesInput | PositionScalarWhereWithAggregatesInput[]
    OR?: PositionScalarWhereWithAggregatesInput[]
    NOT?: PositionScalarWhereWithAggregatesInput | PositionScalarWhereWithAggregatesInput[]
    id?: UuidWithAggregatesFilter<"Position"> | string
    userId?: UuidWithAggregatesFilter<"Position"> | string
    symbol?: StringWithAggregatesFilter<"Position"> | string
    signalType?: StringWithAggregatesFilter<"Position"> | string
    entryPrice?: FloatWithAggregatesFilter<"Position"> | number
    size?: FloatWithAggregatesFilter<"Position"> | number
    status?: StringWithAggregatesFilter<"Position"> | string
    openTimestamp?: DateTimeWithAggregatesFilter<"Position"> | Date | string
    closeTimestamp?: DateTimeNullableWithAggregatesFilter<"Position"> | Date | string | null
    closePrice?: FloatNullableWithAggregatesFilter<"Position"> | number | null
    pnl?: FloatNullableWithAggregatesFilter<"Position"> | number | null
    stopLoss?: FloatNullableWithAggregatesFilter<"Position"> | number | null
    takeProfit?: FloatNullableWithAggregatesFilter<"Position"> | number | null
  }

  export type UserAgentWhereInput = {
    AND?: UserAgentWhereInput | UserAgentWhereInput[]
    OR?: UserAgentWhereInput[]
    NOT?: UserAgentWhereInput | UserAgentWhereInput[]
    id?: UuidFilter<"UserAgent"> | string
    userId?: UuidFilter<"UserAgent"> | string
    agentId?: StringFilter<"UserAgent"> | string
    level?: IntFilter<"UserAgent"> | number
    status?: StringFilter<"UserAgent"> | string
    deploymentEndTime?: DateTimeNullableFilter<"UserAgent"> | Date | string | null
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
  }

  export type UserAgentOrderByWithRelationInput = {
    id?: SortOrder
    userId?: SortOrder
    agentId?: SortOrder
    level?: SortOrder
    status?: SortOrder
    deploymentEndTime?: SortOrderInput | SortOrder
    user?: UserOrderByWithRelationInput
  }

  export type UserAgentWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: UserAgentWhereInput | UserAgentWhereInput[]
    OR?: UserAgentWhereInput[]
    NOT?: UserAgentWhereInput | UserAgentWhereInput[]
    userId?: UuidFilter<"UserAgent"> | string
    agentId?: StringFilter<"UserAgent"> | string
    level?: IntFilter<"UserAgent"> | number
    status?: StringFilter<"UserAgent"> | string
    deploymentEndTime?: DateTimeNullableFilter<"UserAgent"> | Date | string | null
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
  }, "id">

  export type UserAgentOrderByWithAggregationInput = {
    id?: SortOrder
    userId?: SortOrder
    agentId?: SortOrder
    level?: SortOrder
    status?: SortOrder
    deploymentEndTime?: SortOrderInput | SortOrder
    _count?: UserAgentCountOrderByAggregateInput
    _avg?: UserAgentAvgOrderByAggregateInput
    _max?: UserAgentMaxOrderByAggregateInput
    _min?: UserAgentMinOrderByAggregateInput
    _sum?: UserAgentSumOrderByAggregateInput
  }

  export type UserAgentScalarWhereWithAggregatesInput = {
    AND?: UserAgentScalarWhereWithAggregatesInput | UserAgentScalarWhereWithAggregatesInput[]
    OR?: UserAgentScalarWhereWithAggregatesInput[]
    NOT?: UserAgentScalarWhereWithAggregatesInput | UserAgentScalarWhereWithAggregatesInput[]
    id?: UuidWithAggregatesFilter<"UserAgent"> | string
    userId?: UuidWithAggregatesFilter<"UserAgent"> | string
    agentId?: StringWithAggregatesFilter<"UserAgent"> | string
    level?: IntWithAggregatesFilter<"UserAgent"> | number
    status?: StringWithAggregatesFilter<"UserAgent"> | string
    deploymentEndTime?: DateTimeNullableWithAggregatesFilter<"UserAgent"> | Date | string | null
  }

  export type UserCreateInput = {
    id?: string
    username: string
    status?: string | null
    shadowId?: string | null
    weeklyPoints?: number
    airdropPoints?: number
    wallet_address?: string | null
    wallet_type?: string | null
    email?: string | null
    phone?: string | null
    x_handle?: string | null
    telegram_handle?: string | null
    youtube_handle?: string | null
    badges?: BadgeCreateNestedManyWithoutUsersInput
    consoleInsights?: ConsoleInsightCreateNestedManyWithoutUserInput
    signals?: SignalHistoryItemCreateNestedManyWithoutUserInput
    positions?: PositionCreateNestedManyWithoutUserInput
    userAgents?: UserAgentCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateInput = {
    id?: string
    username: string
    status?: string | null
    shadowId?: string | null
    weeklyPoints?: number
    airdropPoints?: number
    wallet_address?: string | null
    wallet_type?: string | null
    email?: string | null
    phone?: string | null
    x_handle?: string | null
    telegram_handle?: string | null
    youtube_handle?: string | null
    badges?: BadgeUncheckedCreateNestedManyWithoutUsersInput
    consoleInsights?: ConsoleInsightUncheckedCreateNestedManyWithoutUserInput
    signals?: SignalHistoryItemUncheckedCreateNestedManyWithoutUserInput
    positions?: PositionUncheckedCreateNestedManyWithoutUserInput
    userAgents?: UserAgentUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
    status?: NullableStringFieldUpdateOperationsInput | string | null
    shadowId?: NullableStringFieldUpdateOperationsInput | string | null
    weeklyPoints?: IntFieldUpdateOperationsInput | number
    airdropPoints?: IntFieldUpdateOperationsInput | number
    wallet_address?: NullableStringFieldUpdateOperationsInput | string | null
    wallet_type?: NullableStringFieldUpdateOperationsInput | string | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    x_handle?: NullableStringFieldUpdateOperationsInput | string | null
    telegram_handle?: NullableStringFieldUpdateOperationsInput | string | null
    youtube_handle?: NullableStringFieldUpdateOperationsInput | string | null
    badges?: BadgeUpdateManyWithoutUsersNestedInput
    consoleInsights?: ConsoleInsightUpdateManyWithoutUserNestedInput
    signals?: SignalHistoryItemUpdateManyWithoutUserNestedInput
    positions?: PositionUpdateManyWithoutUserNestedInput
    userAgents?: UserAgentUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
    status?: NullableStringFieldUpdateOperationsInput | string | null
    shadowId?: NullableStringFieldUpdateOperationsInput | string | null
    weeklyPoints?: IntFieldUpdateOperationsInput | number
    airdropPoints?: IntFieldUpdateOperationsInput | number
    wallet_address?: NullableStringFieldUpdateOperationsInput | string | null
    wallet_type?: NullableStringFieldUpdateOperationsInput | string | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    x_handle?: NullableStringFieldUpdateOperationsInput | string | null
    telegram_handle?: NullableStringFieldUpdateOperationsInput | string | null
    youtube_handle?: NullableStringFieldUpdateOperationsInput | string | null
    badges?: BadgeUncheckedUpdateManyWithoutUsersNestedInput
    consoleInsights?: ConsoleInsightUncheckedUpdateManyWithoutUserNestedInput
    signals?: SignalHistoryItemUncheckedUpdateManyWithoutUserNestedInput
    positions?: PositionUncheckedUpdateManyWithoutUserNestedInput
    userAgents?: UserAgentUncheckedUpdateManyWithoutUserNestedInput
  }

  export type UserCreateManyInput = {
    id?: string
    username: string
    status?: string | null
    shadowId?: string | null
    weeklyPoints?: number
    airdropPoints?: number
    wallet_address?: string | null
    wallet_type?: string | null
    email?: string | null
    phone?: string | null
    x_handle?: string | null
    telegram_handle?: string | null
    youtube_handle?: string | null
  }

  export type UserUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
    status?: NullableStringFieldUpdateOperationsInput | string | null
    shadowId?: NullableStringFieldUpdateOperationsInput | string | null
    weeklyPoints?: IntFieldUpdateOperationsInput | number
    airdropPoints?: IntFieldUpdateOperationsInput | number
    wallet_address?: NullableStringFieldUpdateOperationsInput | string | null
    wallet_type?: NullableStringFieldUpdateOperationsInput | string | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    x_handle?: NullableStringFieldUpdateOperationsInput | string | null
    telegram_handle?: NullableStringFieldUpdateOperationsInput | string | null
    youtube_handle?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type UserUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
    status?: NullableStringFieldUpdateOperationsInput | string | null
    shadowId?: NullableStringFieldUpdateOperationsInput | string | null
    weeklyPoints?: IntFieldUpdateOperationsInput | number
    airdropPoints?: IntFieldUpdateOperationsInput | number
    wallet_address?: NullableStringFieldUpdateOperationsInput | string | null
    wallet_type?: NullableStringFieldUpdateOperationsInput | string | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    x_handle?: NullableStringFieldUpdateOperationsInput | string | null
    telegram_handle?: NullableStringFieldUpdateOperationsInput | string | null
    youtube_handle?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type BadgeCreateInput = {
    id?: string
    name: string
    users?: UserCreateNestedManyWithoutBadgesInput
  }

  export type BadgeUncheckedCreateInput = {
    id?: string
    name: string
    users?: UserUncheckedCreateNestedManyWithoutBadgesInput
  }

  export type BadgeUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    users?: UserUpdateManyWithoutBadgesNestedInput
  }

  export type BadgeUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    users?: UserUncheckedUpdateManyWithoutBadgesNestedInput
  }

  export type BadgeCreateManyInput = {
    id?: string
    name: string
  }

  export type BadgeUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
  }

  export type BadgeUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
  }

  export type ConsoleInsightCreateInput = {
    id?: string
    content: string
    timestamp?: Date | string
    user: UserCreateNestedOneWithoutConsoleInsightsInput
  }

  export type ConsoleInsightUncheckedCreateInput = {
    id?: string
    userId: string
    content: string
    timestamp?: Date | string
  }

  export type ConsoleInsightUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserUpdateOneRequiredWithoutConsoleInsightsNestedInput
  }

  export type ConsoleInsightUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ConsoleInsightCreateManyInput = {
    id?: string
    userId: string
    content: string
    timestamp?: Date | string
  }

  export type ConsoleInsightUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ConsoleInsightUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SignalHistoryItemCreateInput = {
    id?: string
    signalType: string
    symbol: string
    price: number
    timestamp?: Date | string
    user: UserCreateNestedOneWithoutSignalsInput
  }

  export type SignalHistoryItemUncheckedCreateInput = {
    id?: string
    userId: string
    signalType: string
    symbol: string
    price: number
    timestamp?: Date | string
  }

  export type SignalHistoryItemUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    signalType?: StringFieldUpdateOperationsInput | string
    symbol?: StringFieldUpdateOperationsInput | string
    price?: FloatFieldUpdateOperationsInput | number
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserUpdateOneRequiredWithoutSignalsNestedInput
  }

  export type SignalHistoryItemUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    signalType?: StringFieldUpdateOperationsInput | string
    symbol?: StringFieldUpdateOperationsInput | string
    price?: FloatFieldUpdateOperationsInput | number
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SignalHistoryItemCreateManyInput = {
    id?: string
    userId: string
    signalType: string
    symbol: string
    price: number
    timestamp?: Date | string
  }

  export type SignalHistoryItemUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    signalType?: StringFieldUpdateOperationsInput | string
    symbol?: StringFieldUpdateOperationsInput | string
    price?: FloatFieldUpdateOperationsInput | number
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SignalHistoryItemUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    signalType?: StringFieldUpdateOperationsInput | string
    symbol?: StringFieldUpdateOperationsInput | string
    price?: FloatFieldUpdateOperationsInput | number
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PositionCreateInput = {
    id?: string
    symbol: string
    signalType: string
    entryPrice: number
    size: number
    status: string
    openTimestamp?: Date | string
    closeTimestamp?: Date | string | null
    closePrice?: number | null
    pnl?: number | null
    stopLoss?: number | null
    takeProfit?: number | null
    user: UserCreateNestedOneWithoutPositionsInput
  }

  export type PositionUncheckedCreateInput = {
    id?: string
    userId: string
    symbol: string
    signalType: string
    entryPrice: number
    size: number
    status: string
    openTimestamp?: Date | string
    closeTimestamp?: Date | string | null
    closePrice?: number | null
    pnl?: number | null
    stopLoss?: number | null
    takeProfit?: number | null
  }

  export type PositionUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    symbol?: StringFieldUpdateOperationsInput | string
    signalType?: StringFieldUpdateOperationsInput | string
    entryPrice?: FloatFieldUpdateOperationsInput | number
    size?: FloatFieldUpdateOperationsInput | number
    status?: StringFieldUpdateOperationsInput | string
    openTimestamp?: DateTimeFieldUpdateOperationsInput | Date | string
    closeTimestamp?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    closePrice?: NullableFloatFieldUpdateOperationsInput | number | null
    pnl?: NullableFloatFieldUpdateOperationsInput | number | null
    stopLoss?: NullableFloatFieldUpdateOperationsInput | number | null
    takeProfit?: NullableFloatFieldUpdateOperationsInput | number | null
    user?: UserUpdateOneRequiredWithoutPositionsNestedInput
  }

  export type PositionUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    symbol?: StringFieldUpdateOperationsInput | string
    signalType?: StringFieldUpdateOperationsInput | string
    entryPrice?: FloatFieldUpdateOperationsInput | number
    size?: FloatFieldUpdateOperationsInput | number
    status?: StringFieldUpdateOperationsInput | string
    openTimestamp?: DateTimeFieldUpdateOperationsInput | Date | string
    closeTimestamp?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    closePrice?: NullableFloatFieldUpdateOperationsInput | number | null
    pnl?: NullableFloatFieldUpdateOperationsInput | number | null
    stopLoss?: NullableFloatFieldUpdateOperationsInput | number | null
    takeProfit?: NullableFloatFieldUpdateOperationsInput | number | null
  }

  export type PositionCreateManyInput = {
    id?: string
    userId: string
    symbol: string
    signalType: string
    entryPrice: number
    size: number
    status: string
    openTimestamp?: Date | string
    closeTimestamp?: Date | string | null
    closePrice?: number | null
    pnl?: number | null
    stopLoss?: number | null
    takeProfit?: number | null
  }

  export type PositionUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    symbol?: StringFieldUpdateOperationsInput | string
    signalType?: StringFieldUpdateOperationsInput | string
    entryPrice?: FloatFieldUpdateOperationsInput | number
    size?: FloatFieldUpdateOperationsInput | number
    status?: StringFieldUpdateOperationsInput | string
    openTimestamp?: DateTimeFieldUpdateOperationsInput | Date | string
    closeTimestamp?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    closePrice?: NullableFloatFieldUpdateOperationsInput | number | null
    pnl?: NullableFloatFieldUpdateOperationsInput | number | null
    stopLoss?: NullableFloatFieldUpdateOperationsInput | number | null
    takeProfit?: NullableFloatFieldUpdateOperationsInput | number | null
  }

  export type PositionUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    symbol?: StringFieldUpdateOperationsInput | string
    signalType?: StringFieldUpdateOperationsInput | string
    entryPrice?: FloatFieldUpdateOperationsInput | number
    size?: FloatFieldUpdateOperationsInput | number
    status?: StringFieldUpdateOperationsInput | string
    openTimestamp?: DateTimeFieldUpdateOperationsInput | Date | string
    closeTimestamp?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    closePrice?: NullableFloatFieldUpdateOperationsInput | number | null
    pnl?: NullableFloatFieldUpdateOperationsInput | number | null
    stopLoss?: NullableFloatFieldUpdateOperationsInput | number | null
    takeProfit?: NullableFloatFieldUpdateOperationsInput | number | null
  }

  export type UserAgentCreateInput = {
    id?: string
    agentId: string
    level: number
    status: string
    deploymentEndTime?: Date | string | null
    user: UserCreateNestedOneWithoutUserAgentsInput
  }

  export type UserAgentUncheckedCreateInput = {
    id?: string
    userId: string
    agentId: string
    level: number
    status: string
    deploymentEndTime?: Date | string | null
  }

  export type UserAgentUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    agentId?: StringFieldUpdateOperationsInput | string
    level?: IntFieldUpdateOperationsInput | number
    status?: StringFieldUpdateOperationsInput | string
    deploymentEndTime?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    user?: UserUpdateOneRequiredWithoutUserAgentsNestedInput
  }

  export type UserAgentUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    agentId?: StringFieldUpdateOperationsInput | string
    level?: IntFieldUpdateOperationsInput | number
    status?: StringFieldUpdateOperationsInput | string
    deploymentEndTime?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type UserAgentCreateManyInput = {
    id?: string
    userId: string
    agentId: string
    level: number
    status: string
    deploymentEndTime?: Date | string | null
  }

  export type UserAgentUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    agentId?: StringFieldUpdateOperationsInput | string
    level?: IntFieldUpdateOperationsInput | number
    status?: StringFieldUpdateOperationsInput | string
    deploymentEndTime?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type UserAgentUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    agentId?: StringFieldUpdateOperationsInput | string
    level?: IntFieldUpdateOperationsInput | number
    status?: StringFieldUpdateOperationsInput | string
    deploymentEndTime?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type UuidFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedUuidFilter<$PrismaModel> | string
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type IntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type BadgeListRelationFilter = {
    every?: BadgeWhereInput
    some?: BadgeWhereInput
    none?: BadgeWhereInput
  }

  export type ConsoleInsightListRelationFilter = {
    every?: ConsoleInsightWhereInput
    some?: ConsoleInsightWhereInput
    none?: ConsoleInsightWhereInput
  }

  export type SignalHistoryItemListRelationFilter = {
    every?: SignalHistoryItemWhereInput
    some?: SignalHistoryItemWhereInput
    none?: SignalHistoryItemWhereInput
  }

  export type PositionListRelationFilter = {
    every?: PositionWhereInput
    some?: PositionWhereInput
    none?: PositionWhereInput
  }

  export type UserAgentListRelationFilter = {
    every?: UserAgentWhereInput
    some?: UserAgentWhereInput
    none?: UserAgentWhereInput
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type BadgeOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type ConsoleInsightOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type SignalHistoryItemOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type PositionOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type UserAgentOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type UserCountOrderByAggregateInput = {
    id?: SortOrder
    username?: SortOrder
    status?: SortOrder
    shadowId?: SortOrder
    weeklyPoints?: SortOrder
    airdropPoints?: SortOrder
    wallet_address?: SortOrder
    wallet_type?: SortOrder
    email?: SortOrder
    phone?: SortOrder
    x_handle?: SortOrder
    telegram_handle?: SortOrder
    youtube_handle?: SortOrder
  }

  export type UserAvgOrderByAggregateInput = {
    weeklyPoints?: SortOrder
    airdropPoints?: SortOrder
  }

  export type UserMaxOrderByAggregateInput = {
    id?: SortOrder
    username?: SortOrder
    status?: SortOrder
    shadowId?: SortOrder
    weeklyPoints?: SortOrder
    airdropPoints?: SortOrder
    wallet_address?: SortOrder
    wallet_type?: SortOrder
    email?: SortOrder
    phone?: SortOrder
    x_handle?: SortOrder
    telegram_handle?: SortOrder
    youtube_handle?: SortOrder
  }

  export type UserMinOrderByAggregateInput = {
    id?: SortOrder
    username?: SortOrder
    status?: SortOrder
    shadowId?: SortOrder
    weeklyPoints?: SortOrder
    airdropPoints?: SortOrder
    wallet_address?: SortOrder
    wallet_type?: SortOrder
    email?: SortOrder
    phone?: SortOrder
    x_handle?: SortOrder
    telegram_handle?: SortOrder
    youtube_handle?: SortOrder
  }

  export type UserSumOrderByAggregateInput = {
    weeklyPoints?: SortOrder
    airdropPoints?: SortOrder
  }

  export type UuidWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedUuidWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type IntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type UserListRelationFilter = {
    every?: UserWhereInput
    some?: UserWhereInput
    none?: UserWhereInput
  }

  export type UserOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type BadgeCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
  }

  export type BadgeMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
  }

  export type BadgeMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
  }

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type UserScalarRelationFilter = {
    is?: UserWhereInput
    isNot?: UserWhereInput
  }

  export type ConsoleInsightCountOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    content?: SortOrder
    timestamp?: SortOrder
  }

  export type ConsoleInsightMaxOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    content?: SortOrder
    timestamp?: SortOrder
  }

  export type ConsoleInsightMinOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    content?: SortOrder
    timestamp?: SortOrder
  }

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type FloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type SignalHistoryItemCountOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    signalType?: SortOrder
    symbol?: SortOrder
    price?: SortOrder
    timestamp?: SortOrder
  }

  export type SignalHistoryItemAvgOrderByAggregateInput = {
    price?: SortOrder
  }

  export type SignalHistoryItemMaxOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    signalType?: SortOrder
    symbol?: SortOrder
    price?: SortOrder
    timestamp?: SortOrder
  }

  export type SignalHistoryItemMinOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    signalType?: SortOrder
    symbol?: SortOrder
    price?: SortOrder
    timestamp?: SortOrder
  }

  export type SignalHistoryItemSumOrderByAggregateInput = {
    price?: SortOrder
  }

  export type FloatWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedFloatFilter<$PrismaModel>
    _min?: NestedFloatFilter<$PrismaModel>
    _max?: NestedFloatFilter<$PrismaModel>
  }

  export type DateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type FloatNullableFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableFilter<$PrismaModel> | number | null
  }

  export type PositionCountOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    symbol?: SortOrder
    signalType?: SortOrder
    entryPrice?: SortOrder
    size?: SortOrder
    status?: SortOrder
    openTimestamp?: SortOrder
    closeTimestamp?: SortOrder
    closePrice?: SortOrder
    pnl?: SortOrder
    stopLoss?: SortOrder
    takeProfit?: SortOrder
  }

  export type PositionAvgOrderByAggregateInput = {
    entryPrice?: SortOrder
    size?: SortOrder
    closePrice?: SortOrder
    pnl?: SortOrder
    stopLoss?: SortOrder
    takeProfit?: SortOrder
  }

  export type PositionMaxOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    symbol?: SortOrder
    signalType?: SortOrder
    entryPrice?: SortOrder
    size?: SortOrder
    status?: SortOrder
    openTimestamp?: SortOrder
    closeTimestamp?: SortOrder
    closePrice?: SortOrder
    pnl?: SortOrder
    stopLoss?: SortOrder
    takeProfit?: SortOrder
  }

  export type PositionMinOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    symbol?: SortOrder
    signalType?: SortOrder
    entryPrice?: SortOrder
    size?: SortOrder
    status?: SortOrder
    openTimestamp?: SortOrder
    closeTimestamp?: SortOrder
    closePrice?: SortOrder
    pnl?: SortOrder
    stopLoss?: SortOrder
    takeProfit?: SortOrder
  }

  export type PositionSumOrderByAggregateInput = {
    entryPrice?: SortOrder
    size?: SortOrder
    closePrice?: SortOrder
    pnl?: SortOrder
    stopLoss?: SortOrder
    takeProfit?: SortOrder
  }

  export type DateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type FloatNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedFloatNullableFilter<$PrismaModel>
    _min?: NestedFloatNullableFilter<$PrismaModel>
    _max?: NestedFloatNullableFilter<$PrismaModel>
  }

  export type UserAgentCountOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    agentId?: SortOrder
    level?: SortOrder
    status?: SortOrder
    deploymentEndTime?: SortOrder
  }

  export type UserAgentAvgOrderByAggregateInput = {
    level?: SortOrder
  }

  export type UserAgentMaxOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    agentId?: SortOrder
    level?: SortOrder
    status?: SortOrder
    deploymentEndTime?: SortOrder
  }

  export type UserAgentMinOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    agentId?: SortOrder
    level?: SortOrder
    status?: SortOrder
    deploymentEndTime?: SortOrder
  }

  export type UserAgentSumOrderByAggregateInput = {
    level?: SortOrder
  }

  export type BadgeCreateNestedManyWithoutUsersInput = {
    create?: XOR<BadgeCreateWithoutUsersInput, BadgeUncheckedCreateWithoutUsersInput> | BadgeCreateWithoutUsersInput[] | BadgeUncheckedCreateWithoutUsersInput[]
    connectOrCreate?: BadgeCreateOrConnectWithoutUsersInput | BadgeCreateOrConnectWithoutUsersInput[]
    connect?: BadgeWhereUniqueInput | BadgeWhereUniqueInput[]
  }

  export type ConsoleInsightCreateNestedManyWithoutUserInput = {
    create?: XOR<ConsoleInsightCreateWithoutUserInput, ConsoleInsightUncheckedCreateWithoutUserInput> | ConsoleInsightCreateWithoutUserInput[] | ConsoleInsightUncheckedCreateWithoutUserInput[]
    connectOrCreate?: ConsoleInsightCreateOrConnectWithoutUserInput | ConsoleInsightCreateOrConnectWithoutUserInput[]
    createMany?: ConsoleInsightCreateManyUserInputEnvelope
    connect?: ConsoleInsightWhereUniqueInput | ConsoleInsightWhereUniqueInput[]
  }

  export type SignalHistoryItemCreateNestedManyWithoutUserInput = {
    create?: XOR<SignalHistoryItemCreateWithoutUserInput, SignalHistoryItemUncheckedCreateWithoutUserInput> | SignalHistoryItemCreateWithoutUserInput[] | SignalHistoryItemUncheckedCreateWithoutUserInput[]
    connectOrCreate?: SignalHistoryItemCreateOrConnectWithoutUserInput | SignalHistoryItemCreateOrConnectWithoutUserInput[]
    createMany?: SignalHistoryItemCreateManyUserInputEnvelope
    connect?: SignalHistoryItemWhereUniqueInput | SignalHistoryItemWhereUniqueInput[]
  }

  export type PositionCreateNestedManyWithoutUserInput = {
    create?: XOR<PositionCreateWithoutUserInput, PositionUncheckedCreateWithoutUserInput> | PositionCreateWithoutUserInput[] | PositionUncheckedCreateWithoutUserInput[]
    connectOrCreate?: PositionCreateOrConnectWithoutUserInput | PositionCreateOrConnectWithoutUserInput[]
    createMany?: PositionCreateManyUserInputEnvelope
    connect?: PositionWhereUniqueInput | PositionWhereUniqueInput[]
  }

  export type UserAgentCreateNestedManyWithoutUserInput = {
    create?: XOR<UserAgentCreateWithoutUserInput, UserAgentUncheckedCreateWithoutUserInput> | UserAgentCreateWithoutUserInput[] | UserAgentUncheckedCreateWithoutUserInput[]
    connectOrCreate?: UserAgentCreateOrConnectWithoutUserInput | UserAgentCreateOrConnectWithoutUserInput[]
    createMany?: UserAgentCreateManyUserInputEnvelope
    connect?: UserAgentWhereUniqueInput | UserAgentWhereUniqueInput[]
  }

  export type BadgeUncheckedCreateNestedManyWithoutUsersInput = {
    create?: XOR<BadgeCreateWithoutUsersInput, BadgeUncheckedCreateWithoutUsersInput> | BadgeCreateWithoutUsersInput[] | BadgeUncheckedCreateWithoutUsersInput[]
    connectOrCreate?: BadgeCreateOrConnectWithoutUsersInput | BadgeCreateOrConnectWithoutUsersInput[]
    connect?: BadgeWhereUniqueInput | BadgeWhereUniqueInput[]
  }

  export type ConsoleInsightUncheckedCreateNestedManyWithoutUserInput = {
    create?: XOR<ConsoleInsightCreateWithoutUserInput, ConsoleInsightUncheckedCreateWithoutUserInput> | ConsoleInsightCreateWithoutUserInput[] | ConsoleInsightUncheckedCreateWithoutUserInput[]
    connectOrCreate?: ConsoleInsightCreateOrConnectWithoutUserInput | ConsoleInsightCreateOrConnectWithoutUserInput[]
    createMany?: ConsoleInsightCreateManyUserInputEnvelope
    connect?: ConsoleInsightWhereUniqueInput | ConsoleInsightWhereUniqueInput[]
  }

  export type SignalHistoryItemUncheckedCreateNestedManyWithoutUserInput = {
    create?: XOR<SignalHistoryItemCreateWithoutUserInput, SignalHistoryItemUncheckedCreateWithoutUserInput> | SignalHistoryItemCreateWithoutUserInput[] | SignalHistoryItemUncheckedCreateWithoutUserInput[]
    connectOrCreate?: SignalHistoryItemCreateOrConnectWithoutUserInput | SignalHistoryItemCreateOrConnectWithoutUserInput[]
    createMany?: SignalHistoryItemCreateManyUserInputEnvelope
    connect?: SignalHistoryItemWhereUniqueInput | SignalHistoryItemWhereUniqueInput[]
  }

  export type PositionUncheckedCreateNestedManyWithoutUserInput = {
    create?: XOR<PositionCreateWithoutUserInput, PositionUncheckedCreateWithoutUserInput> | PositionCreateWithoutUserInput[] | PositionUncheckedCreateWithoutUserInput[]
    connectOrCreate?: PositionCreateOrConnectWithoutUserInput | PositionCreateOrConnectWithoutUserInput[]
    createMany?: PositionCreateManyUserInputEnvelope
    connect?: PositionWhereUniqueInput | PositionWhereUniqueInput[]
  }

  export type UserAgentUncheckedCreateNestedManyWithoutUserInput = {
    create?: XOR<UserAgentCreateWithoutUserInput, UserAgentUncheckedCreateWithoutUserInput> | UserAgentCreateWithoutUserInput[] | UserAgentUncheckedCreateWithoutUserInput[]
    connectOrCreate?: UserAgentCreateOrConnectWithoutUserInput | UserAgentCreateOrConnectWithoutUserInput[]
    createMany?: UserAgentCreateManyUserInputEnvelope
    connect?: UserAgentWhereUniqueInput | UserAgentWhereUniqueInput[]
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type BadgeUpdateManyWithoutUsersNestedInput = {
    create?: XOR<BadgeCreateWithoutUsersInput, BadgeUncheckedCreateWithoutUsersInput> | BadgeCreateWithoutUsersInput[] | BadgeUncheckedCreateWithoutUsersInput[]
    connectOrCreate?: BadgeCreateOrConnectWithoutUsersInput | BadgeCreateOrConnectWithoutUsersInput[]
    upsert?: BadgeUpsertWithWhereUniqueWithoutUsersInput | BadgeUpsertWithWhereUniqueWithoutUsersInput[]
    set?: BadgeWhereUniqueInput | BadgeWhereUniqueInput[]
    disconnect?: BadgeWhereUniqueInput | BadgeWhereUniqueInput[]
    delete?: BadgeWhereUniqueInput | BadgeWhereUniqueInput[]
    connect?: BadgeWhereUniqueInput | BadgeWhereUniqueInput[]
    update?: BadgeUpdateWithWhereUniqueWithoutUsersInput | BadgeUpdateWithWhereUniqueWithoutUsersInput[]
    updateMany?: BadgeUpdateManyWithWhereWithoutUsersInput | BadgeUpdateManyWithWhereWithoutUsersInput[]
    deleteMany?: BadgeScalarWhereInput | BadgeScalarWhereInput[]
  }

  export type ConsoleInsightUpdateManyWithoutUserNestedInput = {
    create?: XOR<ConsoleInsightCreateWithoutUserInput, ConsoleInsightUncheckedCreateWithoutUserInput> | ConsoleInsightCreateWithoutUserInput[] | ConsoleInsightUncheckedCreateWithoutUserInput[]
    connectOrCreate?: ConsoleInsightCreateOrConnectWithoutUserInput | ConsoleInsightCreateOrConnectWithoutUserInput[]
    upsert?: ConsoleInsightUpsertWithWhereUniqueWithoutUserInput | ConsoleInsightUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: ConsoleInsightCreateManyUserInputEnvelope
    set?: ConsoleInsightWhereUniqueInput | ConsoleInsightWhereUniqueInput[]
    disconnect?: ConsoleInsightWhereUniqueInput | ConsoleInsightWhereUniqueInput[]
    delete?: ConsoleInsightWhereUniqueInput | ConsoleInsightWhereUniqueInput[]
    connect?: ConsoleInsightWhereUniqueInput | ConsoleInsightWhereUniqueInput[]
    update?: ConsoleInsightUpdateWithWhereUniqueWithoutUserInput | ConsoleInsightUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: ConsoleInsightUpdateManyWithWhereWithoutUserInput | ConsoleInsightUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: ConsoleInsightScalarWhereInput | ConsoleInsightScalarWhereInput[]
  }

  export type SignalHistoryItemUpdateManyWithoutUserNestedInput = {
    create?: XOR<SignalHistoryItemCreateWithoutUserInput, SignalHistoryItemUncheckedCreateWithoutUserInput> | SignalHistoryItemCreateWithoutUserInput[] | SignalHistoryItemUncheckedCreateWithoutUserInput[]
    connectOrCreate?: SignalHistoryItemCreateOrConnectWithoutUserInput | SignalHistoryItemCreateOrConnectWithoutUserInput[]
    upsert?: SignalHistoryItemUpsertWithWhereUniqueWithoutUserInput | SignalHistoryItemUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: SignalHistoryItemCreateManyUserInputEnvelope
    set?: SignalHistoryItemWhereUniqueInput | SignalHistoryItemWhereUniqueInput[]
    disconnect?: SignalHistoryItemWhereUniqueInput | SignalHistoryItemWhereUniqueInput[]
    delete?: SignalHistoryItemWhereUniqueInput | SignalHistoryItemWhereUniqueInput[]
    connect?: SignalHistoryItemWhereUniqueInput | SignalHistoryItemWhereUniqueInput[]
    update?: SignalHistoryItemUpdateWithWhereUniqueWithoutUserInput | SignalHistoryItemUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: SignalHistoryItemUpdateManyWithWhereWithoutUserInput | SignalHistoryItemUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: SignalHistoryItemScalarWhereInput | SignalHistoryItemScalarWhereInput[]
  }

  export type PositionUpdateManyWithoutUserNestedInput = {
    create?: XOR<PositionCreateWithoutUserInput, PositionUncheckedCreateWithoutUserInput> | PositionCreateWithoutUserInput[] | PositionUncheckedCreateWithoutUserInput[]
    connectOrCreate?: PositionCreateOrConnectWithoutUserInput | PositionCreateOrConnectWithoutUserInput[]
    upsert?: PositionUpsertWithWhereUniqueWithoutUserInput | PositionUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: PositionCreateManyUserInputEnvelope
    set?: PositionWhereUniqueInput | PositionWhereUniqueInput[]
    disconnect?: PositionWhereUniqueInput | PositionWhereUniqueInput[]
    delete?: PositionWhereUniqueInput | PositionWhereUniqueInput[]
    connect?: PositionWhereUniqueInput | PositionWhereUniqueInput[]
    update?: PositionUpdateWithWhereUniqueWithoutUserInput | PositionUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: PositionUpdateManyWithWhereWithoutUserInput | PositionUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: PositionScalarWhereInput | PositionScalarWhereInput[]
  }

  export type UserAgentUpdateManyWithoutUserNestedInput = {
    create?: XOR<UserAgentCreateWithoutUserInput, UserAgentUncheckedCreateWithoutUserInput> | UserAgentCreateWithoutUserInput[] | UserAgentUncheckedCreateWithoutUserInput[]
    connectOrCreate?: UserAgentCreateOrConnectWithoutUserInput | UserAgentCreateOrConnectWithoutUserInput[]
    upsert?: UserAgentUpsertWithWhereUniqueWithoutUserInput | UserAgentUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: UserAgentCreateManyUserInputEnvelope
    set?: UserAgentWhereUniqueInput | UserAgentWhereUniqueInput[]
    disconnect?: UserAgentWhereUniqueInput | UserAgentWhereUniqueInput[]
    delete?: UserAgentWhereUniqueInput | UserAgentWhereUniqueInput[]
    connect?: UserAgentWhereUniqueInput | UserAgentWhereUniqueInput[]
    update?: UserAgentUpdateWithWhereUniqueWithoutUserInput | UserAgentUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: UserAgentUpdateManyWithWhereWithoutUserInput | UserAgentUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: UserAgentScalarWhereInput | UserAgentScalarWhereInput[]
  }

  export type BadgeUncheckedUpdateManyWithoutUsersNestedInput = {
    create?: XOR<BadgeCreateWithoutUsersInput, BadgeUncheckedCreateWithoutUsersInput> | BadgeCreateWithoutUsersInput[] | BadgeUncheckedCreateWithoutUsersInput[]
    connectOrCreate?: BadgeCreateOrConnectWithoutUsersInput | BadgeCreateOrConnectWithoutUsersInput[]
    upsert?: BadgeUpsertWithWhereUniqueWithoutUsersInput | BadgeUpsertWithWhereUniqueWithoutUsersInput[]
    set?: BadgeWhereUniqueInput | BadgeWhereUniqueInput[]
    disconnect?: BadgeWhereUniqueInput | BadgeWhereUniqueInput[]
    delete?: BadgeWhereUniqueInput | BadgeWhereUniqueInput[]
    connect?: BadgeWhereUniqueInput | BadgeWhereUniqueInput[]
    update?: BadgeUpdateWithWhereUniqueWithoutUsersInput | BadgeUpdateWithWhereUniqueWithoutUsersInput[]
    updateMany?: BadgeUpdateManyWithWhereWithoutUsersInput | BadgeUpdateManyWithWhereWithoutUsersInput[]
    deleteMany?: BadgeScalarWhereInput | BadgeScalarWhereInput[]
  }

  export type ConsoleInsightUncheckedUpdateManyWithoutUserNestedInput = {
    create?: XOR<ConsoleInsightCreateWithoutUserInput, ConsoleInsightUncheckedCreateWithoutUserInput> | ConsoleInsightCreateWithoutUserInput[] | ConsoleInsightUncheckedCreateWithoutUserInput[]
    connectOrCreate?: ConsoleInsightCreateOrConnectWithoutUserInput | ConsoleInsightCreateOrConnectWithoutUserInput[]
    upsert?: ConsoleInsightUpsertWithWhereUniqueWithoutUserInput | ConsoleInsightUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: ConsoleInsightCreateManyUserInputEnvelope
    set?: ConsoleInsightWhereUniqueInput | ConsoleInsightWhereUniqueInput[]
    disconnect?: ConsoleInsightWhereUniqueInput | ConsoleInsightWhereUniqueInput[]
    delete?: ConsoleInsightWhereUniqueInput | ConsoleInsightWhereUniqueInput[]
    connect?: ConsoleInsightWhereUniqueInput | ConsoleInsightWhereUniqueInput[]
    update?: ConsoleInsightUpdateWithWhereUniqueWithoutUserInput | ConsoleInsightUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: ConsoleInsightUpdateManyWithWhereWithoutUserInput | ConsoleInsightUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: ConsoleInsightScalarWhereInput | ConsoleInsightScalarWhereInput[]
  }

  export type SignalHistoryItemUncheckedUpdateManyWithoutUserNestedInput = {
    create?: XOR<SignalHistoryItemCreateWithoutUserInput, SignalHistoryItemUncheckedCreateWithoutUserInput> | SignalHistoryItemCreateWithoutUserInput[] | SignalHistoryItemUncheckedCreateWithoutUserInput[]
    connectOrCreate?: SignalHistoryItemCreateOrConnectWithoutUserInput | SignalHistoryItemCreateOrConnectWithoutUserInput[]
    upsert?: SignalHistoryItemUpsertWithWhereUniqueWithoutUserInput | SignalHistoryItemUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: SignalHistoryItemCreateManyUserInputEnvelope
    set?: SignalHistoryItemWhereUniqueInput | SignalHistoryItemWhereUniqueInput[]
    disconnect?: SignalHistoryItemWhereUniqueInput | SignalHistoryItemWhereUniqueInput[]
    delete?: SignalHistoryItemWhereUniqueInput | SignalHistoryItemWhereUniqueInput[]
    connect?: SignalHistoryItemWhereUniqueInput | SignalHistoryItemWhereUniqueInput[]
    update?: SignalHistoryItemUpdateWithWhereUniqueWithoutUserInput | SignalHistoryItemUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: SignalHistoryItemUpdateManyWithWhereWithoutUserInput | SignalHistoryItemUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: SignalHistoryItemScalarWhereInput | SignalHistoryItemScalarWhereInput[]
  }

  export type PositionUncheckedUpdateManyWithoutUserNestedInput = {
    create?: XOR<PositionCreateWithoutUserInput, PositionUncheckedCreateWithoutUserInput> | PositionCreateWithoutUserInput[] | PositionUncheckedCreateWithoutUserInput[]
    connectOrCreate?: PositionCreateOrConnectWithoutUserInput | PositionCreateOrConnectWithoutUserInput[]
    upsert?: PositionUpsertWithWhereUniqueWithoutUserInput | PositionUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: PositionCreateManyUserInputEnvelope
    set?: PositionWhereUniqueInput | PositionWhereUniqueInput[]
    disconnect?: PositionWhereUniqueInput | PositionWhereUniqueInput[]
    delete?: PositionWhereUniqueInput | PositionWhereUniqueInput[]
    connect?: PositionWhereUniqueInput | PositionWhereUniqueInput[]
    update?: PositionUpdateWithWhereUniqueWithoutUserInput | PositionUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: PositionUpdateManyWithWhereWithoutUserInput | PositionUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: PositionScalarWhereInput | PositionScalarWhereInput[]
  }

  export type UserAgentUncheckedUpdateManyWithoutUserNestedInput = {
    create?: XOR<UserAgentCreateWithoutUserInput, UserAgentUncheckedCreateWithoutUserInput> | UserAgentCreateWithoutUserInput[] | UserAgentUncheckedCreateWithoutUserInput[]
    connectOrCreate?: UserAgentCreateOrConnectWithoutUserInput | UserAgentCreateOrConnectWithoutUserInput[]
    upsert?: UserAgentUpsertWithWhereUniqueWithoutUserInput | UserAgentUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: UserAgentCreateManyUserInputEnvelope
    set?: UserAgentWhereUniqueInput | UserAgentWhereUniqueInput[]
    disconnect?: UserAgentWhereUniqueInput | UserAgentWhereUniqueInput[]
    delete?: UserAgentWhereUniqueInput | UserAgentWhereUniqueInput[]
    connect?: UserAgentWhereUniqueInput | UserAgentWhereUniqueInput[]
    update?: UserAgentUpdateWithWhereUniqueWithoutUserInput | UserAgentUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: UserAgentUpdateManyWithWhereWithoutUserInput | UserAgentUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: UserAgentScalarWhereInput | UserAgentScalarWhereInput[]
  }

  export type UserCreateNestedManyWithoutBadgesInput = {
    create?: XOR<UserCreateWithoutBadgesInput, UserUncheckedCreateWithoutBadgesInput> | UserCreateWithoutBadgesInput[] | UserUncheckedCreateWithoutBadgesInput[]
    connectOrCreate?: UserCreateOrConnectWithoutBadgesInput | UserCreateOrConnectWithoutBadgesInput[]
    connect?: UserWhereUniqueInput | UserWhereUniqueInput[]
  }

  export type UserUncheckedCreateNestedManyWithoutBadgesInput = {
    create?: XOR<UserCreateWithoutBadgesInput, UserUncheckedCreateWithoutBadgesInput> | UserCreateWithoutBadgesInput[] | UserUncheckedCreateWithoutBadgesInput[]
    connectOrCreate?: UserCreateOrConnectWithoutBadgesInput | UserCreateOrConnectWithoutBadgesInput[]
    connect?: UserWhereUniqueInput | UserWhereUniqueInput[]
  }

  export type UserUpdateManyWithoutBadgesNestedInput = {
    create?: XOR<UserCreateWithoutBadgesInput, UserUncheckedCreateWithoutBadgesInput> | UserCreateWithoutBadgesInput[] | UserUncheckedCreateWithoutBadgesInput[]
    connectOrCreate?: UserCreateOrConnectWithoutBadgesInput | UserCreateOrConnectWithoutBadgesInput[]
    upsert?: UserUpsertWithWhereUniqueWithoutBadgesInput | UserUpsertWithWhereUniqueWithoutBadgesInput[]
    set?: UserWhereUniqueInput | UserWhereUniqueInput[]
    disconnect?: UserWhereUniqueInput | UserWhereUniqueInput[]
    delete?: UserWhereUniqueInput | UserWhereUniqueInput[]
    connect?: UserWhereUniqueInput | UserWhereUniqueInput[]
    update?: UserUpdateWithWhereUniqueWithoutBadgesInput | UserUpdateWithWhereUniqueWithoutBadgesInput[]
    updateMany?: UserUpdateManyWithWhereWithoutBadgesInput | UserUpdateManyWithWhereWithoutBadgesInput[]
    deleteMany?: UserScalarWhereInput | UserScalarWhereInput[]
  }

  export type UserUncheckedUpdateManyWithoutBadgesNestedInput = {
    create?: XOR<UserCreateWithoutBadgesInput, UserUncheckedCreateWithoutBadgesInput> | UserCreateWithoutBadgesInput[] | UserUncheckedCreateWithoutBadgesInput[]
    connectOrCreate?: UserCreateOrConnectWithoutBadgesInput | UserCreateOrConnectWithoutBadgesInput[]
    upsert?: UserUpsertWithWhereUniqueWithoutBadgesInput | UserUpsertWithWhereUniqueWithoutBadgesInput[]
    set?: UserWhereUniqueInput | UserWhereUniqueInput[]
    disconnect?: UserWhereUniqueInput | UserWhereUniqueInput[]
    delete?: UserWhereUniqueInput | UserWhereUniqueInput[]
    connect?: UserWhereUniqueInput | UserWhereUniqueInput[]
    update?: UserUpdateWithWhereUniqueWithoutBadgesInput | UserUpdateWithWhereUniqueWithoutBadgesInput[]
    updateMany?: UserUpdateManyWithWhereWithoutBadgesInput | UserUpdateManyWithWhereWithoutBadgesInput[]
    deleteMany?: UserScalarWhereInput | UserScalarWhereInput[]
  }

  export type UserCreateNestedOneWithoutConsoleInsightsInput = {
    create?: XOR<UserCreateWithoutConsoleInsightsInput, UserUncheckedCreateWithoutConsoleInsightsInput>
    connectOrCreate?: UserCreateOrConnectWithoutConsoleInsightsInput
    connect?: UserWhereUniqueInput
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type UserUpdateOneRequiredWithoutConsoleInsightsNestedInput = {
    create?: XOR<UserCreateWithoutConsoleInsightsInput, UserUncheckedCreateWithoutConsoleInsightsInput>
    connectOrCreate?: UserCreateOrConnectWithoutConsoleInsightsInput
    upsert?: UserUpsertWithoutConsoleInsightsInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutConsoleInsightsInput, UserUpdateWithoutConsoleInsightsInput>, UserUncheckedUpdateWithoutConsoleInsightsInput>
  }

  export type UserCreateNestedOneWithoutSignalsInput = {
    create?: XOR<UserCreateWithoutSignalsInput, UserUncheckedCreateWithoutSignalsInput>
    connectOrCreate?: UserCreateOrConnectWithoutSignalsInput
    connect?: UserWhereUniqueInput
  }

  export type FloatFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type UserUpdateOneRequiredWithoutSignalsNestedInput = {
    create?: XOR<UserCreateWithoutSignalsInput, UserUncheckedCreateWithoutSignalsInput>
    connectOrCreate?: UserCreateOrConnectWithoutSignalsInput
    upsert?: UserUpsertWithoutSignalsInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutSignalsInput, UserUpdateWithoutSignalsInput>, UserUncheckedUpdateWithoutSignalsInput>
  }

  export type UserCreateNestedOneWithoutPositionsInput = {
    create?: XOR<UserCreateWithoutPositionsInput, UserUncheckedCreateWithoutPositionsInput>
    connectOrCreate?: UserCreateOrConnectWithoutPositionsInput
    connect?: UserWhereUniqueInput
  }

  export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null
  }

  export type NullableFloatFieldUpdateOperationsInput = {
    set?: number | null
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type UserUpdateOneRequiredWithoutPositionsNestedInput = {
    create?: XOR<UserCreateWithoutPositionsInput, UserUncheckedCreateWithoutPositionsInput>
    connectOrCreate?: UserCreateOrConnectWithoutPositionsInput
    upsert?: UserUpsertWithoutPositionsInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutPositionsInput, UserUpdateWithoutPositionsInput>, UserUncheckedUpdateWithoutPositionsInput>
  }

  export type UserCreateNestedOneWithoutUserAgentsInput = {
    create?: XOR<UserCreateWithoutUserAgentsInput, UserUncheckedCreateWithoutUserAgentsInput>
    connectOrCreate?: UserCreateOrConnectWithoutUserAgentsInput
    connect?: UserWhereUniqueInput
  }

  export type UserUpdateOneRequiredWithoutUserAgentsNestedInput = {
    create?: XOR<UserCreateWithoutUserAgentsInput, UserUncheckedCreateWithoutUserAgentsInput>
    connectOrCreate?: UserCreateOrConnectWithoutUserAgentsInput
    upsert?: UserUpsertWithoutUserAgentsInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutUserAgentsInput, UserUpdateWithoutUserAgentsInput>, UserUncheckedUpdateWithoutUserAgentsInput>
  }

  export type NestedUuidFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedUuidFilter<$PrismaModel> | string
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedUuidWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedUuidWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type NestedIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type NestedFloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type NestedFloatWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedFloatFilter<$PrismaModel>
    _min?: NestedFloatFilter<$PrismaModel>
    _max?: NestedFloatFilter<$PrismaModel>
  }

  export type NestedDateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type NestedFloatNullableFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableFilter<$PrismaModel> | number | null
  }

  export type NestedDateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type NestedFloatNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedFloatNullableFilter<$PrismaModel>
    _min?: NestedFloatNullableFilter<$PrismaModel>
    _max?: NestedFloatNullableFilter<$PrismaModel>
  }

  export type BadgeCreateWithoutUsersInput = {
    id?: string
    name: string
  }

  export type BadgeUncheckedCreateWithoutUsersInput = {
    id?: string
    name: string
  }

  export type BadgeCreateOrConnectWithoutUsersInput = {
    where: BadgeWhereUniqueInput
    create: XOR<BadgeCreateWithoutUsersInput, BadgeUncheckedCreateWithoutUsersInput>
  }

  export type ConsoleInsightCreateWithoutUserInput = {
    id?: string
    content: string
    timestamp?: Date | string
  }

  export type ConsoleInsightUncheckedCreateWithoutUserInput = {
    id?: string
    content: string
    timestamp?: Date | string
  }

  export type ConsoleInsightCreateOrConnectWithoutUserInput = {
    where: ConsoleInsightWhereUniqueInput
    create: XOR<ConsoleInsightCreateWithoutUserInput, ConsoleInsightUncheckedCreateWithoutUserInput>
  }

  export type ConsoleInsightCreateManyUserInputEnvelope = {
    data: ConsoleInsightCreateManyUserInput | ConsoleInsightCreateManyUserInput[]
    skipDuplicates?: boolean
  }

  export type SignalHistoryItemCreateWithoutUserInput = {
    id?: string
    signalType: string
    symbol: string
    price: number
    timestamp?: Date | string
  }

  export type SignalHistoryItemUncheckedCreateWithoutUserInput = {
    id?: string
    signalType: string
    symbol: string
    price: number
    timestamp?: Date | string
  }

  export type SignalHistoryItemCreateOrConnectWithoutUserInput = {
    where: SignalHistoryItemWhereUniqueInput
    create: XOR<SignalHistoryItemCreateWithoutUserInput, SignalHistoryItemUncheckedCreateWithoutUserInput>
  }

  export type SignalHistoryItemCreateManyUserInputEnvelope = {
    data: SignalHistoryItemCreateManyUserInput | SignalHistoryItemCreateManyUserInput[]
    skipDuplicates?: boolean
  }

  export type PositionCreateWithoutUserInput = {
    id?: string
    symbol: string
    signalType: string
    entryPrice: number
    size: number
    status: string
    openTimestamp?: Date | string
    closeTimestamp?: Date | string | null
    closePrice?: number | null
    pnl?: number | null
    stopLoss?: number | null
    takeProfit?: number | null
  }

  export type PositionUncheckedCreateWithoutUserInput = {
    id?: string
    symbol: string
    signalType: string
    entryPrice: number
    size: number
    status: string
    openTimestamp?: Date | string
    closeTimestamp?: Date | string | null
    closePrice?: number | null
    pnl?: number | null
    stopLoss?: number | null
    takeProfit?: number | null
  }

  export type PositionCreateOrConnectWithoutUserInput = {
    where: PositionWhereUniqueInput
    create: XOR<PositionCreateWithoutUserInput, PositionUncheckedCreateWithoutUserInput>
  }

  export type PositionCreateManyUserInputEnvelope = {
    data: PositionCreateManyUserInput | PositionCreateManyUserInput[]
    skipDuplicates?: boolean
  }

  export type UserAgentCreateWithoutUserInput = {
    id?: string
    agentId: string
    level: number
    status: string
    deploymentEndTime?: Date | string | null
  }

  export type UserAgentUncheckedCreateWithoutUserInput = {
    id?: string
    agentId: string
    level: number
    status: string
    deploymentEndTime?: Date | string | null
  }

  export type UserAgentCreateOrConnectWithoutUserInput = {
    where: UserAgentWhereUniqueInput
    create: XOR<UserAgentCreateWithoutUserInput, UserAgentUncheckedCreateWithoutUserInput>
  }

  export type UserAgentCreateManyUserInputEnvelope = {
    data: UserAgentCreateManyUserInput | UserAgentCreateManyUserInput[]
    skipDuplicates?: boolean
  }

  export type BadgeUpsertWithWhereUniqueWithoutUsersInput = {
    where: BadgeWhereUniqueInput
    update: XOR<BadgeUpdateWithoutUsersInput, BadgeUncheckedUpdateWithoutUsersInput>
    create: XOR<BadgeCreateWithoutUsersInput, BadgeUncheckedCreateWithoutUsersInput>
  }

  export type BadgeUpdateWithWhereUniqueWithoutUsersInput = {
    where: BadgeWhereUniqueInput
    data: XOR<BadgeUpdateWithoutUsersInput, BadgeUncheckedUpdateWithoutUsersInput>
  }

  export type BadgeUpdateManyWithWhereWithoutUsersInput = {
    where: BadgeScalarWhereInput
    data: XOR<BadgeUpdateManyMutationInput, BadgeUncheckedUpdateManyWithoutUsersInput>
  }

  export type BadgeScalarWhereInput = {
    AND?: BadgeScalarWhereInput | BadgeScalarWhereInput[]
    OR?: BadgeScalarWhereInput[]
    NOT?: BadgeScalarWhereInput | BadgeScalarWhereInput[]
    id?: UuidFilter<"Badge"> | string
    name?: StringFilter<"Badge"> | string
  }

  export type ConsoleInsightUpsertWithWhereUniqueWithoutUserInput = {
    where: ConsoleInsightWhereUniqueInput
    update: XOR<ConsoleInsightUpdateWithoutUserInput, ConsoleInsightUncheckedUpdateWithoutUserInput>
    create: XOR<ConsoleInsightCreateWithoutUserInput, ConsoleInsightUncheckedCreateWithoutUserInput>
  }

  export type ConsoleInsightUpdateWithWhereUniqueWithoutUserInput = {
    where: ConsoleInsightWhereUniqueInput
    data: XOR<ConsoleInsightUpdateWithoutUserInput, ConsoleInsightUncheckedUpdateWithoutUserInput>
  }

  export type ConsoleInsightUpdateManyWithWhereWithoutUserInput = {
    where: ConsoleInsightScalarWhereInput
    data: XOR<ConsoleInsightUpdateManyMutationInput, ConsoleInsightUncheckedUpdateManyWithoutUserInput>
  }

  export type ConsoleInsightScalarWhereInput = {
    AND?: ConsoleInsightScalarWhereInput | ConsoleInsightScalarWhereInput[]
    OR?: ConsoleInsightScalarWhereInput[]
    NOT?: ConsoleInsightScalarWhereInput | ConsoleInsightScalarWhereInput[]
    id?: UuidFilter<"ConsoleInsight"> | string
    userId?: UuidFilter<"ConsoleInsight"> | string
    content?: StringFilter<"ConsoleInsight"> | string
    timestamp?: DateTimeFilter<"ConsoleInsight"> | Date | string
  }

  export type SignalHistoryItemUpsertWithWhereUniqueWithoutUserInput = {
    where: SignalHistoryItemWhereUniqueInput
    update: XOR<SignalHistoryItemUpdateWithoutUserInput, SignalHistoryItemUncheckedUpdateWithoutUserInput>
    create: XOR<SignalHistoryItemCreateWithoutUserInput, SignalHistoryItemUncheckedCreateWithoutUserInput>
  }

  export type SignalHistoryItemUpdateWithWhereUniqueWithoutUserInput = {
    where: SignalHistoryItemWhereUniqueInput
    data: XOR<SignalHistoryItemUpdateWithoutUserInput, SignalHistoryItemUncheckedUpdateWithoutUserInput>
  }

  export type SignalHistoryItemUpdateManyWithWhereWithoutUserInput = {
    where: SignalHistoryItemScalarWhereInput
    data: XOR<SignalHistoryItemUpdateManyMutationInput, SignalHistoryItemUncheckedUpdateManyWithoutUserInput>
  }

  export type SignalHistoryItemScalarWhereInput = {
    AND?: SignalHistoryItemScalarWhereInput | SignalHistoryItemScalarWhereInput[]
    OR?: SignalHistoryItemScalarWhereInput[]
    NOT?: SignalHistoryItemScalarWhereInput | SignalHistoryItemScalarWhereInput[]
    id?: UuidFilter<"SignalHistoryItem"> | string
    userId?: UuidFilter<"SignalHistoryItem"> | string
    signalType?: StringFilter<"SignalHistoryItem"> | string
    symbol?: StringFilter<"SignalHistoryItem"> | string
    price?: FloatFilter<"SignalHistoryItem"> | number
    timestamp?: DateTimeFilter<"SignalHistoryItem"> | Date | string
  }

  export type PositionUpsertWithWhereUniqueWithoutUserInput = {
    where: PositionWhereUniqueInput
    update: XOR<PositionUpdateWithoutUserInput, PositionUncheckedUpdateWithoutUserInput>
    create: XOR<PositionCreateWithoutUserInput, PositionUncheckedCreateWithoutUserInput>
  }

  export type PositionUpdateWithWhereUniqueWithoutUserInput = {
    where: PositionWhereUniqueInput
    data: XOR<PositionUpdateWithoutUserInput, PositionUncheckedUpdateWithoutUserInput>
  }

  export type PositionUpdateManyWithWhereWithoutUserInput = {
    where: PositionScalarWhereInput
    data: XOR<PositionUpdateManyMutationInput, PositionUncheckedUpdateManyWithoutUserInput>
  }

  export type PositionScalarWhereInput = {
    AND?: PositionScalarWhereInput | PositionScalarWhereInput[]
    OR?: PositionScalarWhereInput[]
    NOT?: PositionScalarWhereInput | PositionScalarWhereInput[]
    id?: UuidFilter<"Position"> | string
    userId?: UuidFilter<"Position"> | string
    symbol?: StringFilter<"Position"> | string
    signalType?: StringFilter<"Position"> | string
    entryPrice?: FloatFilter<"Position"> | number
    size?: FloatFilter<"Position"> | number
    status?: StringFilter<"Position"> | string
    openTimestamp?: DateTimeFilter<"Position"> | Date | string
    closeTimestamp?: DateTimeNullableFilter<"Position"> | Date | string | null
    closePrice?: FloatNullableFilter<"Position"> | number | null
    pnl?: FloatNullableFilter<"Position"> | number | null
    stopLoss?: FloatNullableFilter<"Position"> | number | null
    takeProfit?: FloatNullableFilter<"Position"> | number | null
  }

  export type UserAgentUpsertWithWhereUniqueWithoutUserInput = {
    where: UserAgentWhereUniqueInput
    update: XOR<UserAgentUpdateWithoutUserInput, UserAgentUncheckedUpdateWithoutUserInput>
    create: XOR<UserAgentCreateWithoutUserInput, UserAgentUncheckedCreateWithoutUserInput>
  }

  export type UserAgentUpdateWithWhereUniqueWithoutUserInput = {
    where: UserAgentWhereUniqueInput
    data: XOR<UserAgentUpdateWithoutUserInput, UserAgentUncheckedUpdateWithoutUserInput>
  }

  export type UserAgentUpdateManyWithWhereWithoutUserInput = {
    where: UserAgentScalarWhereInput
    data: XOR<UserAgentUpdateManyMutationInput, UserAgentUncheckedUpdateManyWithoutUserInput>
  }

  export type UserAgentScalarWhereInput = {
    AND?: UserAgentScalarWhereInput | UserAgentScalarWhereInput[]
    OR?: UserAgentScalarWhereInput[]
    NOT?: UserAgentScalarWhereInput | UserAgentScalarWhereInput[]
    id?: UuidFilter<"UserAgent"> | string
    userId?: UuidFilter<"UserAgent"> | string
    agentId?: StringFilter<"UserAgent"> | string
    level?: IntFilter<"UserAgent"> | number
    status?: StringFilter<"UserAgent"> | string
    deploymentEndTime?: DateTimeNullableFilter<"UserAgent"> | Date | string | null
  }

  export type UserCreateWithoutBadgesInput = {
    id?: string
    username: string
    status?: string | null
    shadowId?: string | null
    weeklyPoints?: number
    airdropPoints?: number
    wallet_address?: string | null
    wallet_type?: string | null
    email?: string | null
    phone?: string | null
    x_handle?: string | null
    telegram_handle?: string | null
    youtube_handle?: string | null
    consoleInsights?: ConsoleInsightCreateNestedManyWithoutUserInput
    signals?: SignalHistoryItemCreateNestedManyWithoutUserInput
    positions?: PositionCreateNestedManyWithoutUserInput
    userAgents?: UserAgentCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateWithoutBadgesInput = {
    id?: string
    username: string
    status?: string | null
    shadowId?: string | null
    weeklyPoints?: number
    airdropPoints?: number
    wallet_address?: string | null
    wallet_type?: string | null
    email?: string | null
    phone?: string | null
    x_handle?: string | null
    telegram_handle?: string | null
    youtube_handle?: string | null
    consoleInsights?: ConsoleInsightUncheckedCreateNestedManyWithoutUserInput
    signals?: SignalHistoryItemUncheckedCreateNestedManyWithoutUserInput
    positions?: PositionUncheckedCreateNestedManyWithoutUserInput
    userAgents?: UserAgentUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutBadgesInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutBadgesInput, UserUncheckedCreateWithoutBadgesInput>
  }

  export type UserUpsertWithWhereUniqueWithoutBadgesInput = {
    where: UserWhereUniqueInput
    update: XOR<UserUpdateWithoutBadgesInput, UserUncheckedUpdateWithoutBadgesInput>
    create: XOR<UserCreateWithoutBadgesInput, UserUncheckedCreateWithoutBadgesInput>
  }

  export type UserUpdateWithWhereUniqueWithoutBadgesInput = {
    where: UserWhereUniqueInput
    data: XOR<UserUpdateWithoutBadgesInput, UserUncheckedUpdateWithoutBadgesInput>
  }

  export type UserUpdateManyWithWhereWithoutBadgesInput = {
    where: UserScalarWhereInput
    data: XOR<UserUpdateManyMutationInput, UserUncheckedUpdateManyWithoutBadgesInput>
  }

  export type UserScalarWhereInput = {
    AND?: UserScalarWhereInput | UserScalarWhereInput[]
    OR?: UserScalarWhereInput[]
    NOT?: UserScalarWhereInput | UserScalarWhereInput[]
    id?: UuidFilter<"User"> | string
    username?: StringFilter<"User"> | string
    status?: StringNullableFilter<"User"> | string | null
    shadowId?: StringNullableFilter<"User"> | string | null
    weeklyPoints?: IntFilter<"User"> | number
    airdropPoints?: IntFilter<"User"> | number
    wallet_address?: StringNullableFilter<"User"> | string | null
    wallet_type?: StringNullableFilter<"User"> | string | null
    email?: StringNullableFilter<"User"> | string | null
    phone?: StringNullableFilter<"User"> | string | null
    x_handle?: StringNullableFilter<"User"> | string | null
    telegram_handle?: StringNullableFilter<"User"> | string | null
    youtube_handle?: StringNullableFilter<"User"> | string | null
  }

  export type UserCreateWithoutConsoleInsightsInput = {
    id?: string
    username: string
    status?: string | null
    shadowId?: string | null
    weeklyPoints?: number
    airdropPoints?: number
    wallet_address?: string | null
    wallet_type?: string | null
    email?: string | null
    phone?: string | null
    x_handle?: string | null
    telegram_handle?: string | null
    youtube_handle?: string | null
    badges?: BadgeCreateNestedManyWithoutUsersInput
    signals?: SignalHistoryItemCreateNestedManyWithoutUserInput
    positions?: PositionCreateNestedManyWithoutUserInput
    userAgents?: UserAgentCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateWithoutConsoleInsightsInput = {
    id?: string
    username: string
    status?: string | null
    shadowId?: string | null
    weeklyPoints?: number
    airdropPoints?: number
    wallet_address?: string | null
    wallet_type?: string | null
    email?: string | null
    phone?: string | null
    x_handle?: string | null
    telegram_handle?: string | null
    youtube_handle?: string | null
    badges?: BadgeUncheckedCreateNestedManyWithoutUsersInput
    signals?: SignalHistoryItemUncheckedCreateNestedManyWithoutUserInput
    positions?: PositionUncheckedCreateNestedManyWithoutUserInput
    userAgents?: UserAgentUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutConsoleInsightsInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutConsoleInsightsInput, UserUncheckedCreateWithoutConsoleInsightsInput>
  }

  export type UserUpsertWithoutConsoleInsightsInput = {
    update: XOR<UserUpdateWithoutConsoleInsightsInput, UserUncheckedUpdateWithoutConsoleInsightsInput>
    create: XOR<UserCreateWithoutConsoleInsightsInput, UserUncheckedCreateWithoutConsoleInsightsInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutConsoleInsightsInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutConsoleInsightsInput, UserUncheckedUpdateWithoutConsoleInsightsInput>
  }

  export type UserUpdateWithoutConsoleInsightsInput = {
    id?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
    status?: NullableStringFieldUpdateOperationsInput | string | null
    shadowId?: NullableStringFieldUpdateOperationsInput | string | null
    weeklyPoints?: IntFieldUpdateOperationsInput | number
    airdropPoints?: IntFieldUpdateOperationsInput | number
    wallet_address?: NullableStringFieldUpdateOperationsInput | string | null
    wallet_type?: NullableStringFieldUpdateOperationsInput | string | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    x_handle?: NullableStringFieldUpdateOperationsInput | string | null
    telegram_handle?: NullableStringFieldUpdateOperationsInput | string | null
    youtube_handle?: NullableStringFieldUpdateOperationsInput | string | null
    badges?: BadgeUpdateManyWithoutUsersNestedInput
    signals?: SignalHistoryItemUpdateManyWithoutUserNestedInput
    positions?: PositionUpdateManyWithoutUserNestedInput
    userAgents?: UserAgentUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutConsoleInsightsInput = {
    id?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
    status?: NullableStringFieldUpdateOperationsInput | string | null
    shadowId?: NullableStringFieldUpdateOperationsInput | string | null
    weeklyPoints?: IntFieldUpdateOperationsInput | number
    airdropPoints?: IntFieldUpdateOperationsInput | number
    wallet_address?: NullableStringFieldUpdateOperationsInput | string | null
    wallet_type?: NullableStringFieldUpdateOperationsInput | string | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    x_handle?: NullableStringFieldUpdateOperationsInput | string | null
    telegram_handle?: NullableStringFieldUpdateOperationsInput | string | null
    youtube_handle?: NullableStringFieldUpdateOperationsInput | string | null
    badges?: BadgeUncheckedUpdateManyWithoutUsersNestedInput
    signals?: SignalHistoryItemUncheckedUpdateManyWithoutUserNestedInput
    positions?: PositionUncheckedUpdateManyWithoutUserNestedInput
    userAgents?: UserAgentUncheckedUpdateManyWithoutUserNestedInput
  }

  export type UserCreateWithoutSignalsInput = {
    id?: string
    username: string
    status?: string | null
    shadowId?: string | null
    weeklyPoints?: number
    airdropPoints?: number
    wallet_address?: string | null
    wallet_type?: string | null
    email?: string | null
    phone?: string | null
    x_handle?: string | null
    telegram_handle?: string | null
    youtube_handle?: string | null
    badges?: BadgeCreateNestedManyWithoutUsersInput
    consoleInsights?: ConsoleInsightCreateNestedManyWithoutUserInput
    positions?: PositionCreateNestedManyWithoutUserInput
    userAgents?: UserAgentCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateWithoutSignalsInput = {
    id?: string
    username: string
    status?: string | null
    shadowId?: string | null
    weeklyPoints?: number
    airdropPoints?: number
    wallet_address?: string | null
    wallet_type?: string | null
    email?: string | null
    phone?: string | null
    x_handle?: string | null
    telegram_handle?: string | null
    youtube_handle?: string | null
    badges?: BadgeUncheckedCreateNestedManyWithoutUsersInput
    consoleInsights?: ConsoleInsightUncheckedCreateNestedManyWithoutUserInput
    positions?: PositionUncheckedCreateNestedManyWithoutUserInput
    userAgents?: UserAgentUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutSignalsInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutSignalsInput, UserUncheckedCreateWithoutSignalsInput>
  }

  export type UserUpsertWithoutSignalsInput = {
    update: XOR<UserUpdateWithoutSignalsInput, UserUncheckedUpdateWithoutSignalsInput>
    create: XOR<UserCreateWithoutSignalsInput, UserUncheckedCreateWithoutSignalsInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutSignalsInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutSignalsInput, UserUncheckedUpdateWithoutSignalsInput>
  }

  export type UserUpdateWithoutSignalsInput = {
    id?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
    status?: NullableStringFieldUpdateOperationsInput | string | null
    shadowId?: NullableStringFieldUpdateOperationsInput | string | null
    weeklyPoints?: IntFieldUpdateOperationsInput | number
    airdropPoints?: IntFieldUpdateOperationsInput | number
    wallet_address?: NullableStringFieldUpdateOperationsInput | string | null
    wallet_type?: NullableStringFieldUpdateOperationsInput | string | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    x_handle?: NullableStringFieldUpdateOperationsInput | string | null
    telegram_handle?: NullableStringFieldUpdateOperationsInput | string | null
    youtube_handle?: NullableStringFieldUpdateOperationsInput | string | null
    badges?: BadgeUpdateManyWithoutUsersNestedInput
    consoleInsights?: ConsoleInsightUpdateManyWithoutUserNestedInput
    positions?: PositionUpdateManyWithoutUserNestedInput
    userAgents?: UserAgentUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutSignalsInput = {
    id?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
    status?: NullableStringFieldUpdateOperationsInput | string | null
    shadowId?: NullableStringFieldUpdateOperationsInput | string | null
    weeklyPoints?: IntFieldUpdateOperationsInput | number
    airdropPoints?: IntFieldUpdateOperationsInput | number
    wallet_address?: NullableStringFieldUpdateOperationsInput | string | null
    wallet_type?: NullableStringFieldUpdateOperationsInput | string | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    x_handle?: NullableStringFieldUpdateOperationsInput | string | null
    telegram_handle?: NullableStringFieldUpdateOperationsInput | string | null
    youtube_handle?: NullableStringFieldUpdateOperationsInput | string | null
    badges?: BadgeUncheckedUpdateManyWithoutUsersNestedInput
    consoleInsights?: ConsoleInsightUncheckedUpdateManyWithoutUserNestedInput
    positions?: PositionUncheckedUpdateManyWithoutUserNestedInput
    userAgents?: UserAgentUncheckedUpdateManyWithoutUserNestedInput
  }

  export type UserCreateWithoutPositionsInput = {
    id?: string
    username: string
    status?: string | null
    shadowId?: string | null
    weeklyPoints?: number
    airdropPoints?: number
    wallet_address?: string | null
    wallet_type?: string | null
    email?: string | null
    phone?: string | null
    x_handle?: string | null
    telegram_handle?: string | null
    youtube_handle?: string | null
    badges?: BadgeCreateNestedManyWithoutUsersInput
    consoleInsights?: ConsoleInsightCreateNestedManyWithoutUserInput
    signals?: SignalHistoryItemCreateNestedManyWithoutUserInput
    userAgents?: UserAgentCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateWithoutPositionsInput = {
    id?: string
    username: string
    status?: string | null
    shadowId?: string | null
    weeklyPoints?: number
    airdropPoints?: number
    wallet_address?: string | null
    wallet_type?: string | null
    email?: string | null
    phone?: string | null
    x_handle?: string | null
    telegram_handle?: string | null
    youtube_handle?: string | null
    badges?: BadgeUncheckedCreateNestedManyWithoutUsersInput
    consoleInsights?: ConsoleInsightUncheckedCreateNestedManyWithoutUserInput
    signals?: SignalHistoryItemUncheckedCreateNestedManyWithoutUserInput
    userAgents?: UserAgentUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutPositionsInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutPositionsInput, UserUncheckedCreateWithoutPositionsInput>
  }

  export type UserUpsertWithoutPositionsInput = {
    update: XOR<UserUpdateWithoutPositionsInput, UserUncheckedUpdateWithoutPositionsInput>
    create: XOR<UserCreateWithoutPositionsInput, UserUncheckedCreateWithoutPositionsInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutPositionsInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutPositionsInput, UserUncheckedUpdateWithoutPositionsInput>
  }

  export type UserUpdateWithoutPositionsInput = {
    id?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
    status?: NullableStringFieldUpdateOperationsInput | string | null
    shadowId?: NullableStringFieldUpdateOperationsInput | string | null
    weeklyPoints?: IntFieldUpdateOperationsInput | number
    airdropPoints?: IntFieldUpdateOperationsInput | number
    wallet_address?: NullableStringFieldUpdateOperationsInput | string | null
    wallet_type?: NullableStringFieldUpdateOperationsInput | string | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    x_handle?: NullableStringFieldUpdateOperationsInput | string | null
    telegram_handle?: NullableStringFieldUpdateOperationsInput | string | null
    youtube_handle?: NullableStringFieldUpdateOperationsInput | string | null
    badges?: BadgeUpdateManyWithoutUsersNestedInput
    consoleInsights?: ConsoleInsightUpdateManyWithoutUserNestedInput
    signals?: SignalHistoryItemUpdateManyWithoutUserNestedInput
    userAgents?: UserAgentUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutPositionsInput = {
    id?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
    status?: NullableStringFieldUpdateOperationsInput | string | null
    shadowId?: NullableStringFieldUpdateOperationsInput | string | null
    weeklyPoints?: IntFieldUpdateOperationsInput | number
    airdropPoints?: IntFieldUpdateOperationsInput | number
    wallet_address?: NullableStringFieldUpdateOperationsInput | string | null
    wallet_type?: NullableStringFieldUpdateOperationsInput | string | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    x_handle?: NullableStringFieldUpdateOperationsInput | string | null
    telegram_handle?: NullableStringFieldUpdateOperationsInput | string | null
    youtube_handle?: NullableStringFieldUpdateOperationsInput | string | null
    badges?: BadgeUncheckedUpdateManyWithoutUsersNestedInput
    consoleInsights?: ConsoleInsightUncheckedUpdateManyWithoutUserNestedInput
    signals?: SignalHistoryItemUncheckedUpdateManyWithoutUserNestedInput
    userAgents?: UserAgentUncheckedUpdateManyWithoutUserNestedInput
  }

  export type UserCreateWithoutUserAgentsInput = {
    id?: string
    username: string
    status?: string | null
    shadowId?: string | null
    weeklyPoints?: number
    airdropPoints?: number
    wallet_address?: string | null
    wallet_type?: string | null
    email?: string | null
    phone?: string | null
    x_handle?: string | null
    telegram_handle?: string | null
    youtube_handle?: string | null
    badges?: BadgeCreateNestedManyWithoutUsersInput
    consoleInsights?: ConsoleInsightCreateNestedManyWithoutUserInput
    signals?: SignalHistoryItemCreateNestedManyWithoutUserInput
    positions?: PositionCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateWithoutUserAgentsInput = {
    id?: string
    username: string
    status?: string | null
    shadowId?: string | null
    weeklyPoints?: number
    airdropPoints?: number
    wallet_address?: string | null
    wallet_type?: string | null
    email?: string | null
    phone?: string | null
    x_handle?: string | null
    telegram_handle?: string | null
    youtube_handle?: string | null
    badges?: BadgeUncheckedCreateNestedManyWithoutUsersInput
    consoleInsights?: ConsoleInsightUncheckedCreateNestedManyWithoutUserInput
    signals?: SignalHistoryItemUncheckedCreateNestedManyWithoutUserInput
    positions?: PositionUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutUserAgentsInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutUserAgentsInput, UserUncheckedCreateWithoutUserAgentsInput>
  }

  export type UserUpsertWithoutUserAgentsInput = {
    update: XOR<UserUpdateWithoutUserAgentsInput, UserUncheckedUpdateWithoutUserAgentsInput>
    create: XOR<UserCreateWithoutUserAgentsInput, UserUncheckedCreateWithoutUserAgentsInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutUserAgentsInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutUserAgentsInput, UserUncheckedUpdateWithoutUserAgentsInput>
  }

  export type UserUpdateWithoutUserAgentsInput = {
    id?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
    status?: NullableStringFieldUpdateOperationsInput | string | null
    shadowId?: NullableStringFieldUpdateOperationsInput | string | null
    weeklyPoints?: IntFieldUpdateOperationsInput | number
    airdropPoints?: IntFieldUpdateOperationsInput | number
    wallet_address?: NullableStringFieldUpdateOperationsInput | string | null
    wallet_type?: NullableStringFieldUpdateOperationsInput | string | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    x_handle?: NullableStringFieldUpdateOperationsInput | string | null
    telegram_handle?: NullableStringFieldUpdateOperationsInput | string | null
    youtube_handle?: NullableStringFieldUpdateOperationsInput | string | null
    badges?: BadgeUpdateManyWithoutUsersNestedInput
    consoleInsights?: ConsoleInsightUpdateManyWithoutUserNestedInput
    signals?: SignalHistoryItemUpdateManyWithoutUserNestedInput
    positions?: PositionUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutUserAgentsInput = {
    id?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
    status?: NullableStringFieldUpdateOperationsInput | string | null
    shadowId?: NullableStringFieldUpdateOperationsInput | string | null
    weeklyPoints?: IntFieldUpdateOperationsInput | number
    airdropPoints?: IntFieldUpdateOperationsInput | number
    wallet_address?: NullableStringFieldUpdateOperationsInput | string | null
    wallet_type?: NullableStringFieldUpdateOperationsInput | string | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    x_handle?: NullableStringFieldUpdateOperationsInput | string | null
    telegram_handle?: NullableStringFieldUpdateOperationsInput | string | null
    youtube_handle?: NullableStringFieldUpdateOperationsInput | string | null
    badges?: BadgeUncheckedUpdateManyWithoutUsersNestedInput
    consoleInsights?: ConsoleInsightUncheckedUpdateManyWithoutUserNestedInput
    signals?: SignalHistoryItemUncheckedUpdateManyWithoutUserNestedInput
    positions?: PositionUncheckedUpdateManyWithoutUserNestedInput
  }

  export type ConsoleInsightCreateManyUserInput = {
    id?: string
    content: string
    timestamp?: Date | string
  }

  export type SignalHistoryItemCreateManyUserInput = {
    id?: string
    signalType: string
    symbol: string
    price: number
    timestamp?: Date | string
  }

  export type PositionCreateManyUserInput = {
    id?: string
    symbol: string
    signalType: string
    entryPrice: number
    size: number
    status: string
    openTimestamp?: Date | string
    closeTimestamp?: Date | string | null
    closePrice?: number | null
    pnl?: number | null
    stopLoss?: number | null
    takeProfit?: number | null
  }

  export type UserAgentCreateManyUserInput = {
    id?: string
    agentId: string
    level: number
    status: string
    deploymentEndTime?: Date | string | null
  }

  export type BadgeUpdateWithoutUsersInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
  }

  export type BadgeUncheckedUpdateWithoutUsersInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
  }

  export type BadgeUncheckedUpdateManyWithoutUsersInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
  }

  export type ConsoleInsightUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ConsoleInsightUncheckedUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ConsoleInsightUncheckedUpdateManyWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SignalHistoryItemUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    signalType?: StringFieldUpdateOperationsInput | string
    symbol?: StringFieldUpdateOperationsInput | string
    price?: FloatFieldUpdateOperationsInput | number
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SignalHistoryItemUncheckedUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    signalType?: StringFieldUpdateOperationsInput | string
    symbol?: StringFieldUpdateOperationsInput | string
    price?: FloatFieldUpdateOperationsInput | number
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SignalHistoryItemUncheckedUpdateManyWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    signalType?: StringFieldUpdateOperationsInput | string
    symbol?: StringFieldUpdateOperationsInput | string
    price?: FloatFieldUpdateOperationsInput | number
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PositionUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    symbol?: StringFieldUpdateOperationsInput | string
    signalType?: StringFieldUpdateOperationsInput | string
    entryPrice?: FloatFieldUpdateOperationsInput | number
    size?: FloatFieldUpdateOperationsInput | number
    status?: StringFieldUpdateOperationsInput | string
    openTimestamp?: DateTimeFieldUpdateOperationsInput | Date | string
    closeTimestamp?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    closePrice?: NullableFloatFieldUpdateOperationsInput | number | null
    pnl?: NullableFloatFieldUpdateOperationsInput | number | null
    stopLoss?: NullableFloatFieldUpdateOperationsInput | number | null
    takeProfit?: NullableFloatFieldUpdateOperationsInput | number | null
  }

  export type PositionUncheckedUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    symbol?: StringFieldUpdateOperationsInput | string
    signalType?: StringFieldUpdateOperationsInput | string
    entryPrice?: FloatFieldUpdateOperationsInput | number
    size?: FloatFieldUpdateOperationsInput | number
    status?: StringFieldUpdateOperationsInput | string
    openTimestamp?: DateTimeFieldUpdateOperationsInput | Date | string
    closeTimestamp?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    closePrice?: NullableFloatFieldUpdateOperationsInput | number | null
    pnl?: NullableFloatFieldUpdateOperationsInput | number | null
    stopLoss?: NullableFloatFieldUpdateOperationsInput | number | null
    takeProfit?: NullableFloatFieldUpdateOperationsInput | number | null
  }

  export type PositionUncheckedUpdateManyWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    symbol?: StringFieldUpdateOperationsInput | string
    signalType?: StringFieldUpdateOperationsInput | string
    entryPrice?: FloatFieldUpdateOperationsInput | number
    size?: FloatFieldUpdateOperationsInput | number
    status?: StringFieldUpdateOperationsInput | string
    openTimestamp?: DateTimeFieldUpdateOperationsInput | Date | string
    closeTimestamp?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    closePrice?: NullableFloatFieldUpdateOperationsInput | number | null
    pnl?: NullableFloatFieldUpdateOperationsInput | number | null
    stopLoss?: NullableFloatFieldUpdateOperationsInput | number | null
    takeProfit?: NullableFloatFieldUpdateOperationsInput | number | null
  }

  export type UserAgentUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    agentId?: StringFieldUpdateOperationsInput | string
    level?: IntFieldUpdateOperationsInput | number
    status?: StringFieldUpdateOperationsInput | string
    deploymentEndTime?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type UserAgentUncheckedUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    agentId?: StringFieldUpdateOperationsInput | string
    level?: IntFieldUpdateOperationsInput | number
    status?: StringFieldUpdateOperationsInput | string
    deploymentEndTime?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type UserAgentUncheckedUpdateManyWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    agentId?: StringFieldUpdateOperationsInput | string
    level?: IntFieldUpdateOperationsInput | number
    status?: StringFieldUpdateOperationsInput | string
    deploymentEndTime?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type UserUpdateWithoutBadgesInput = {
    id?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
    status?: NullableStringFieldUpdateOperationsInput | string | null
    shadowId?: NullableStringFieldUpdateOperationsInput | string | null
    weeklyPoints?: IntFieldUpdateOperationsInput | number
    airdropPoints?: IntFieldUpdateOperationsInput | number
    wallet_address?: NullableStringFieldUpdateOperationsInput | string | null
    wallet_type?: NullableStringFieldUpdateOperationsInput | string | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    x_handle?: NullableStringFieldUpdateOperationsInput | string | null
    telegram_handle?: NullableStringFieldUpdateOperationsInput | string | null
    youtube_handle?: NullableStringFieldUpdateOperationsInput | string | null
    consoleInsights?: ConsoleInsightUpdateManyWithoutUserNestedInput
    signals?: SignalHistoryItemUpdateManyWithoutUserNestedInput
    positions?: PositionUpdateManyWithoutUserNestedInput
    userAgents?: UserAgentUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutBadgesInput = {
    id?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
    status?: NullableStringFieldUpdateOperationsInput | string | null
    shadowId?: NullableStringFieldUpdateOperationsInput | string | null
    weeklyPoints?: IntFieldUpdateOperationsInput | number
    airdropPoints?: IntFieldUpdateOperationsInput | number
    wallet_address?: NullableStringFieldUpdateOperationsInput | string | null
    wallet_type?: NullableStringFieldUpdateOperationsInput | string | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    x_handle?: NullableStringFieldUpdateOperationsInput | string | null
    telegram_handle?: NullableStringFieldUpdateOperationsInput | string | null
    youtube_handle?: NullableStringFieldUpdateOperationsInput | string | null
    consoleInsights?: ConsoleInsightUncheckedUpdateManyWithoutUserNestedInput
    signals?: SignalHistoryItemUncheckedUpdateManyWithoutUserNestedInput
    positions?: PositionUncheckedUpdateManyWithoutUserNestedInput
    userAgents?: UserAgentUncheckedUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateManyWithoutBadgesInput = {
    id?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
    status?: NullableStringFieldUpdateOperationsInput | string | null
    shadowId?: NullableStringFieldUpdateOperationsInput | string | null
    weeklyPoints?: IntFieldUpdateOperationsInput | number
    airdropPoints?: IntFieldUpdateOperationsInput | number
    wallet_address?: NullableStringFieldUpdateOperationsInput | string | null
    wallet_type?: NullableStringFieldUpdateOperationsInput | string | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    x_handle?: NullableStringFieldUpdateOperationsInput | string | null
    telegram_handle?: NullableStringFieldUpdateOperationsInput | string | null
    youtube_handle?: NullableStringFieldUpdateOperationsInput | string | null
  }



  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}