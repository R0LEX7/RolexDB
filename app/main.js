const net = require("net");




const server = net.createServer((connection) => {
  connection._write("+PONG\r\n")

  connection.on('data' , (data) => {
    console.log(data.toString());
  })

  connection.end()
});

server.listen(6379, "127.0.0.1");
