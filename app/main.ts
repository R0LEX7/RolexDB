import net from "net";
import { redisParser } from "./parser";
import { loadDataFromFile, saveCachedData } from "./Persistence/main";
import { loadData, saveData } from "./storage";

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
  console.log("Connected to RolexDB");
  console.log("====================================");
});
