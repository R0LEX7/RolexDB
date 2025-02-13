import Parser from 'redis-parser'
import net from "net"
import { ICommands, IMap } from './Interfaces/parser';

const map : IMap = {};

const commands : ICommands = {
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

export  const redisParser = (data : Buffer , connection : net.Socket ) => {
  const parser = new Parser({
    returnReply: (reply) => {
      const command : string = reply[0].toLowerCase();
      const key : string = reply[1] ;
      let res : string | number;

      switch (command) {
        case "get":
          let val : string = map[key] as string ;
          if (!val) connection.write(parseNullBulkString());
          else connection.write(parseBulkString(val));
          break;

        case "set":
          let value : string = reply[2];
          map[key] = value;
          connection.write("+OK\r\n");
          break;

        case "mget":
          res = `*${reply.length - 1}\r\n`;
          for (let i = 1; i < reply.length; i++) {
            let val : string = map[reply[i]] as string;
            if (!val) res += parseNullBulkString();
            else res += parseBulkString(val);
          }
          connection.write(res);
          break;

        case "incr":
          if (Object.prototype.hasOwnProperty.call(map, reply[1]))
            map[key] = (Number(map[key]) + 1).toString();
          else map[key] = "1";
          connection.write(parseInteger(Number(map[key])));
          break;

        case commands.KEYS:
          const keysArray : Array<string> = Object.keys(map).filter((k) => k.includes(key));
          res = `*${keysArray.length}\r\n`;

          keysArray.forEach((k) => {
            res += parseBulkString(k);
          });
          if (res == `*${keysArray.length}\r\n`) res = parseNullBulkString();
          connection.write(res);
          break;

        case commands.EXISTS:
          res = 0;

          for (let i = 1; i < reply.length; i++) {
            if (Object.prototype.hasOwnProperty.call(map, reply[i])) res++;
          }

          connection.write(parseInteger(res));
          break;

        case commands.EXPIRE:
          const exLimit : number = Number(reply[3]);
          setTimeout(() => {
            delete map[key];
          }, exLimit);

          connection.write(parseInteger(1));
          break;

        case commands.DEL:
          res = 0;
          for (let i = 1; i < reply.length; i++) {
            if (Object.prototype.hasOwnProperty.call(map, reply[i])) {
              delete map[reply[i]];
              res++;
            }
          }
          connection.write(parseInteger(res));
          break;

        case commands.HSET:
          res = 0;
          const temp : IMap = {};
          for (let i = 2; i < reply.length; i = i + 2) {
            temp[reply[i]] = reply[i + 1];
            res++;
          }
          map[reply[1]] = temp;
          connection.write(parseInteger(res));
          break;

        case commands.HGET:
          if (Object.prototype.hasOwnProperty.call(map, key)) {
            let hashMap : IMap  = map[key] as IMap;
            let mapVal : string  = hashMap[reply[2]] as string;
            if (!mapVal) connection.write(parseNullBulkString());
            else connection.write(parseBulkString(mapVal));
          } else {
            console.log("not exist");
            connection.write(parseNullBulkString());
          }
          break;

        case commands.HGETALL:
          if (!Object.prototype.hasOwnProperty.call(map, key)) {
            connection.write("*0\r\n");
            break;
          }

          const hash : IMap = map[key] as IMap;
          let keys = Object.keys(hash);
          res = `*${keys.length * 2}\r\n`;

          for (let mKey of keys) {
            res += parseBulkString(mKey);
            res += parseBulkString(hash[mKey].toString());
          }

          connection.write(res);
          break;

        case commands.HMGET:
          if (!Object.prototype.hasOwnProperty.call(map, key)) {
            connection.write("*0\r\n");
            break;
          }
           let hashMap : IMap = map[key] as IMap;

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
    returnError: (err : URIError) => console.log(err),
  });
  console.log("data -> ", map);
  parser.execute(data);
};

function parseString(s : string) : string {
  return `+${s}\r\n`;
}

function parseBulkString(s : string) : string {
  return `$${s.length}\r\n${s}\r\n`;
}

function parseNullBulkString() {
  return "$-1\r\n";
}

function parseInteger(n : Number) : string {
  return `:${n}\r\n`;
}
