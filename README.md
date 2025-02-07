# 🚀 Custom Database using NodeJs

This project is a lightweight Redis like Database built using Node.js and TCP sockets. It implements fundamental Redis commands, supports hash data structures, and lays the groundwork for data persistence and caching strategies like LRU.

## 🔥 Features

- ✅ **Key-Value Storage**: Supports `GET`, `SET`, `MGET`, `INCR`, and `DEL` commands.
- ✅ **Hash Storage**: Implements `HSET`, `HGET`, `HGETALL`, and `HMGET`.
- ✅ **Expiration & Persistence**: Includes `EXPIRE`, `TTL`, and plans for AOF/RDB-like persistence.
- ✅ **Pattern Matching**: Supports the `KEYS` command for filtering stored keys.
- ✅ **Memory Optimization**: Plans to integrate LRU caching for efficient memory management.
- ✅ **Scalability & Performance**: Future improvements include multi-threading and data sharding.

## ⚡ How It Works

- Uses the `net` module to handle TCP connections.
- Parses Redis protocol (RESP) and executes commands.
- Stores data in an in-memory JavaScript object (`map`).
- Plans for data persistence (`RDB/AOF`) and worker pools to enhance concurrency.

## 🚀 Running the Server

Start the server by running:

```bash
node server.js
```

## 📡 Connecting via Redis CLI

You can interact with the server using the Redis CLI:

```bash
redis-cli -p 6379
```

## 📌 Future Enhancements

- 🔄 **AOF & RDB Persistence**: Implement Append-Only File (AOF) and Snapshotting (RDB) for data durability.
- 🏗 **LRU Cache**: Introduce Least Recently Used (LRU) cache eviction policy.
- ⚡ **Concurrency & Multi-threading**: Utilize worker threads for improved performance.
- 🌎 **Sharding & Replication**: Implement basic data partitioning and replication for better scalability.
- 📈 **Monitoring & Logging**: Integrate logging and monitoring tools for enhanced observability.

---

🚀 Contributions & suggestions are always welcome!

