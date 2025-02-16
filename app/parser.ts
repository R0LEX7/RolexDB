import Parser from "redis-parser";
import net from "net";
import { ICommands, IMap } from "./Interfaces/parser";
import {
  deleteFromCache,
  getDataFromCache,
  setDataIntoCache,
} from "./LRU/main";

export const map: Map<string, IMap> = new Map();

const commands: ICommands = {
  GET: "get",
  SET: "set",
  MGET: "mget",
  INCR: "incr",
  KEYS: "keys",
  EXISTS: "exists",
  EXPIRE: "expire",
  TTL: "ttl",
  PERSIST: "persist",
  DEL: "del",
  INFO: "info",
  HSET: "hset",
  HGET: "hget",
  HGETALL: "hgetall",
  HMGET: "hmget",
};

export const redisParser = (data: Buffer, connection: net.Socket) => {
  const parser = new Parser({
    returnReply: (reply) => {
      const command: string = reply[0].toLowerCase();
      const key: string = reply[1];
      let res: string | number;

      switch (command) {
        case "get":
          let cachedValue = getDataFromCache(key);
          if (typeof cachedValue === "string") {
            console.log("getting from cache");
            connection.write(parseBulkString(cachedValue));
          } else {
            let val: IMap = map.get(key) as IMap;

            console.log("not available in cache");
            if (!val) connection.write(parseNullBulkString());
            else {
              setDataIntoCache(key, val);
              if (typeof val === "string")
                connection.write(parseBulkString(val));
            }
          }
          break;

        case "set":
          let value: string = reply[2];
          setDataIntoCache(key, value);
          map.set(key, { value });
          connection.write("+OK\r\n");
          break;

        case "mget":
          res = `*${reply.length - 1}\r\n`;
          for (let i = 1; i < reply.length; i++) {
            let cachedValue = getDataFromCache(reply[i]) || map.get(reply[i]);
            if (typeof cachedValue === "string") {
              res += parseBulkString(cachedValue);
            } else res += parseNullBulkString;
          }
          connection.write(res);
          break;

        case "incr":
          if (map.has(reply[1])) {
            let cachedNum =
              Number(getDataFromCache(key)) || Number(map.get(key)) + 1;
            if (typeof cachedNum === "number") {
              setDataIntoCache(key, String(cachedNum + 1));
              map.set(key, { value: String(cachedNum + 1) });
            }
          } else map.set(key, { value: "1" });
          connection.write(parseInteger(Number(map.get(key))));
          break;

        case commands.KEYS:
          const keysArray: Array<string> = Object.keys(map).filter((k) =>
            k.includes(key)
          );
          res = `*${keysArray.length}\r\n`;

          keysArray.forEach((k) => {
            cachedValue = getDataFromCache(k);
            if (typeof cachedValue === "string")
              res += parseBulkString(cachedValue);
            else res += parseBulkString(k);
          });
          if (res == `*${keysArray.length}\r\n`) res = parseNullBulkString();
          connection.write(res);
          break;

        case commands.EXISTS:
          res = 0;

          for (let i = 1; i < reply.length; i++) {
            if (map.has(reply[i])) res++;
          }

          connection.write(parseInteger(res));
          break;

        case commands.EXPIRE:
          const exLimit: number = Number(reply[3]);
          setTimeout(() => {
            deleteFromCache(key);
            map.delete(key);
          }, exLimit);

          connection.write(parseInteger(1));
          break;

        case commands.DEL:
          res = 0;
          for (let i = 1; i < reply.length; i++) {
            if (map.has(reply[i])) {
              map.delete(reply[i]);
              deleteFromCache(key);
              res++;
            }
          }
          connection.write(parseInteger(res));
          break;

        case commands.HSET:
          res = 0;
          const temp: IMap = {};
          for (let i = 2; i < reply.length; i = i + 2) {
            temp[reply[i]] = reply[i + 1];
            res++;
          }
          map.set(reply[1], { value: temp });
          setDataIntoCache(key, temp);
          connection.write(parseInteger(res));
          break;

        case commands.HGET:
          if (map.has(key)) {
            let hashMap: IMap =
              (getDataFromCache(key) as IMap) || (map.get(key) as IMap);
            let mapVal: string = hashMap[reply[2]] as string;

            if (!mapVal) {
              connection.write(parseNullBulkString());
            } else {
              connection.write(parseBulkString(mapVal));
            }
          } else {
            console.log("Key does not exist");
            connection.write(parseNullBulkString());
          }
          break;

        case commands.HGETALL:
          if (!map.has(key)) {
            connection.write("*0\r\n");
            break;
          }

          const hash: IMap =
            (getDataFromCache(key) as IMap) || (map.get(key) as IMap);
          let keys = Object.keys(hash);
          res = `*${keys.length * 2}\r\n`;

          for (let mKey of keys) {
            res += parseBulkString(mKey);
            res += parseBulkString(hash[mKey].toString());
          }

          connection.write(res);
          break;

        case commands.HMGET:
          if (!map.has(key)) {
            connection.write("*0\r\n");
            break;
          }
          let hashMap: IMap =
            (getDataFromCache(key) as IMap) || (map.get(key) as IMap);

          res = `*${reply.length - 2}\r\n`;
          for (let i = 2; i < reply.length; i++) {
            if (Object.prototype.hasOwnProperty.call(hashMap, reply[i])) {
              res += parseBulkString(hashMap[reply[i]].toString());
            } else {
              res += parseNullBulkString();
            }
          }
          connection.write(res);
          break;
        default:
          console.log("command error");
      }
    },
    returnError: (err: URIError) => console.log(err),
  });
  console.log("data -> ", map);
  parser.execute(data);
};

function parseString(s: string): string {
  return `+${s}\r\n`;
}

function parseBulkString(s: string): string {
  return `$${s.length}\r\n${s}\r\n`;
}

function parseNullBulkString() {
  return "$-1\r\n";
}

function parseInteger(n: Number): string {
  return `:${n}\r\n`;
}
