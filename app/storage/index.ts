import { map as dataMap } from './../parser';
import { IMap } from "../Interfaces/parser";
import fs from "fs";

const fileName : string = "./data.json";

export const saveData = () : void  =>  {
    const obj = Object.fromEntries(
        Array.from(dataMap.entries()).map(([key, node]) => [key, node.value])
      );
      try {
        // Check if data has changed before writing
        console.log('====================================');
        console.log("saving data", obj);
        console.log('====================================');
        if (fs.existsSync(fileName)) {
          const existingData = JSON.parse(fs.readFileSync(fileName, "utf-8"));
          if (JSON.stringify(existingData) === JSON.stringify(obj)) {
            console.log("No changes detected, skipping save.");
            return;
          }
        }

        fs.writeFileSync(fileName, JSON.stringify(obj, null, 2));
        console.log("✅ Data saved successfully!");
      } catch (error) {
        console.error("❌ Error saving data:", error);
      }
}

export const loadData = (): void => {
    if (!fs.existsSync(fileName)) {
      console.warn("⚠️ No data file found, skipping load.");
      return;
    }

    try {
      console.log("🔄 Loading data from local...");
      const data = JSON.parse(fs.readFileSync(fileName, "utf-8"));
      console.log('====================================');
      console.log("saved data ", data);
      console.log('====================================');
      for (const key in data) {
        const entry = dataMap.get(key);
        if (entry !== undefined) {
          entry.value = data[key];
        } else {
          dataMap.set(key, { value: data[key] } as IMap);
        }
      }



      console.log("✅ Data loaded successfully!");
    } catch (error) {
      console.error("❌ Failed to load data:", error);
    }
  };
