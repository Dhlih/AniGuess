const redis = require("redis");

const client = redis.createClient({ url: process.env.REDIS_URI });

const connectRedis = async () => {
  try {
    await client.connect();
    console.log("Connected to Redis!")
  } catch (error) {
    console.log("Error while connecting to Redis!", error);
  }
};

module.exports = { client, connectRedis };
