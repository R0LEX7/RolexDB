export interface ICommands {
    GET: string
    SET: string
    MGET: string
    INCR: string
    KEYS: string
    EXISTS: string
    EXPIRE: string
    TTL: string
    PERSIST: string
    DEL: string
    INFO: string
    HSET: string
    HGET: string
    HGETALL: string
    HMGET:string
}

export interface IMap {
    [key: string]: string | IMap; // Ensure it allows string values
  }
