const generateRoomId = require("../helper/generateRoomId");
const { client } = require("../config/redis");

const getRooms = async (req, res) => {
  const { id } = req.query;

  try {
    const searchQuery = id ? `${id}*` : "*";
    const keys = await client.keys(`rooms:${searchQuery}:details`);

    const rooms = await Promise.all(
      keys.map(async (key) => {
        const details = await client.HGETALL(key);
        const roomId = key.split(":")[1];
        const scores = await client.ZRANGE(`rooms:${roomId}:scores`, 0, -1);

        return {
          room_id: roomId,
          max_players: Number(details.max_players),
          total_songs: Number(details.total_songs),
          total_player: scores.length,
        };
      }),
    );
    res.status(200).json({ success: true, data: { rooms } });
  } catch (error) {
    res.status(500).json({ success: false, data: null });
  }
};

const createRoom = async (req, res) => {
  const {
    max_players,
    total_songs,
    guessing_duration,
    host_id,
    host_username,
  } = req.body;

  const roomId = await generateRoomId();

  try {
    await client.HSET(`rooms:${roomId}:details`, {
      max_players,
      total_songs,
      guessing_duration,
      host_id,
      status: "waiting",
    });

    // store host init score
    await client.ZADD(`rooms:${roomId}:scores`, [
      {
        score: 0,
        value: `${host_id}:${host_username}`,
      },
    ]);
    console.log("data room terbuat");
    res.status(201).json({
      success: true,
      data: {
        room_id: roomId,
        details: req.body,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, data: null });
  }
};

const getRoomStatus = async (req, res) => {
  const { roomId } = req.params;

  try {
    const roomStatus = await client.HGET(`rooms:${roomId}:details`, "status");
    res.status(200).json({ success: true, data: { room_status: roomStatus } });
  } catch (error) {
    res.status(500).json({ success: false, data: null });
  }
};

const IsPlayerInRoom = async (req, res) => {
  try {
    const exists = await client.Z(``);
  } catch (error) {
    res.status(500).json({ success: false, data: null });
  }
};

module.exports = { getRooms, createRoom, getRoomStatus, IsPlayerInRoom };
