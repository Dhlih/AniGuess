const express = require("express");
const app = express();
const mongoose = require("mongoose");
const redis = require("redis");
const cors = require("cors");
const { customAlphabet } = require("nanoid");

require("dotenv").config();

const corsOptions = {
  origin: process.env.FRONTEND_URI,
  methods: "GET,POST,PUT,DELETE",
  allowedHeaders: "Content-Type,Authorization",
  credentials: true,
};

// middleware
app.use(express.json());
app.use(cors(corsOptions));

// database config
const client = redis.createClient();

client.on("error", (err) => console.log("Redis Client Error", err));
client.on("connect", () => console.log("Redis Connected!"));

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    await client.connect({ url: process.env.REDIS_URI });
    console.log("Connected to database MongoDB and Redis");
  } catch (error) {
    console.log("Failed to connect to database", error);
  }
};

connectDB();

// helper function
const generateRoomId = async () => {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const nanoId = customAlphabet(alphabet, 6);
  let isUnique = false;
  let roomId = "";

  while (!isUnique) {
    roomId = nanoId();
    const data = await client.exists(`room:${roomId}:details`);
    if (data == 0) isUnique = true;
  }
  return roomId;
};

// routing
app.get("/", async (req, res) => {
  res.json({ msg: "hello" });
});

app.get("/rooms", async (req, res) => {
  try {
    const keys = await client.keys("room:*:details");
    const rooms = await Promise.all(
      keys.map(async (key) => {
        const details = await client.HGETALL(key);
        console.log(details);
        const roomId = key.split(":")[1];
        return {
          id: roomId,
          max_players: Number(details.max_players),
          total_songs: Number(details.total_songs),
        };
      }),
    );
    res.json({ success: true, data: rooms });
  } catch (error) {
    res.json({ error });
  }
});

app.post("/rooms", async (req, res) => {
  const { max_players, total_songs, guessing_duration, host_id, username } =
    req.body;
  const roomId = await generateRoomId();

  try {
    await client.HSET(`room:${roomId}:details`, {
      max_players,
      total_songs,
      guessing_duration,
      host_id,
    });

    await client.ZADD(`rooms:${roomId}:scores`, [
      {
        score: 0,
        value: `${host_id}:${username}`,
      },
    ]);

    res.json({
      success: true,
      roomId: roomId,
      details: req.body,
    });
  } catch (error) {
    res.json({ success: false, data: null });
  }
});

app.post("/join-room", (req, res) => {});

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
