import net from "net"
import { redisParser } from "./parser";


const server = net.createServer((connection : net.Socket) => {

  connection.on('data' , (data : Buffer) => {
    redisParser(data , connection );
  })
});

server.listen(6379, "127.0.0.1" , () => {
console.log('====================================');
console.log("connected to rolexDB");
console.log('====================================');
})
