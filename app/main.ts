import net from "net";
import cluster  from 'cluster'
import { cpus } from 'os'
import { redisParser } from "./parser";
import { loadDataFromFile, saveCachedData } from "./Persistence/main";
import { loadData, saveData } from "./storage";

if(cluster.isPrimary){
  console.log(`Primary ${process.pid} is running`);

  for(let i = 0; i < cpus().length; i++){
    cluster.fork()
  }

  cluster.on('exit' , (worker , code , signal) => {
    console.log(`worker ${worker.process.pid} died. Restarting...`)
    cluster.fork();
  })

}else{
  const server = net.createServer((connection: net.Socket) => {
    connection.on("data", (data: Buffer) => {
      redisParser(data, connection);
    });
  });

  // Attach exit handler
  process.on("exit", saveCachedData);
  process.on("exit", saveData);
  process.on("SIGINT", () => {  // Handle Ctrl+C (graceful shutdown)
    saveCachedData();
    saveData();
    process.exit();
  });

  server.listen(6379, "127.0.0.1", () => {
    console.log("====================================");
    loadDataFromFile();  // Load data AFTER server is listening
    loadData()
    console.log("Connected to RolexDB" , process.pid);
    console.log("====================================");
  });
}
