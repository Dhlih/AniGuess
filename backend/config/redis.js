const redis = require("redis");

const client = redis.createClient({ url: process.env.REDIS_URI });

client.on("error", (err) => console.log("Redis Client Error", err));
client.on("connect", () => console.log("Redis Connected!"));

(async () => {
  await client.connect();
})();

module.exports = client;