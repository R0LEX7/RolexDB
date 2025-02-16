import fs from "fs";
import { cacheMap, setDataIntoCache } from "../LRU/main";

const fileName: string = "./cache.json";

// Save data
export const saveCachedData = (): void => {
  const obj = Object.fromEntries(
    Array.from(cacheMap.entries()).map(([key, node]) => [key, node.value])
  );
  fs.writeFileSync(fileName, JSON.stringify(obj, null, 2));
  console.log("Data saved into cache");
};

// Load data
export const loadDataFromFile = () => {
  if (fs.existsSync(fileName)) {
    console.log("Data loaded into cache");
    const data = JSON.parse(fs.readFileSync(fileName, "utf-8"));

    for (let key in data) {
      setDataIntoCache(key, data[key]);
    }
  }
};
