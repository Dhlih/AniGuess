const generateRoomId = require("../helper/generateRoomId");
const { client } = require("../config/redis");

const getRooms = async (req, res) => {
  try {
    const keys = await client.keys("rooms:*:details");
    const rooms = await Promise.all(
      keys.map(async (key) => {
        const details = await client.HGETALL(key);
        const roomId = key.split(":")[1];
        return {
          room_id: roomId,
          max_players: Number(details.max_players),
          total_songs: Number(details.total_songs),
        };
      }),
    );
    res.json({ success: true, data: rooms });
  } catch (error) {
    res.status(500).json({ success: false, data: null });
  }
};

const getRoom = async (req, res) => {
  const { roomId } = req.params;

  try {
    let players = await client.ZRANGE(`rooms:${roomId}:scores`, 0, -1);
    players = players.map((player) => {
      const [uid, username] = player.split(":");
      return {
        id: uid,
        username,
      };
    });

    const totalPlayers = players.length;

    const room = await client.HGETALL(
      `rooms:${roomId}:details`,
      "max_players",
      "host_id",
    );

    res.json({
      success: true,
      data: {
        players,
        max_players: room.max_players,
        host_id: room.host_id,
        total_players: totalPlayers,
      },
    });
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

    // host score
    await client.ZADD(`rooms:${roomId}:scores`, [
      {
        score: 0,
        value: `${host_id}:${host_username}`,
      },
    ]);

    res.json({
      success: true,
      roomId: roomId,
      details: req.body,
    });
  } catch (error) {
    res.status(500).json({ success: false, data: null });
  }
};

const getRoomStatus = async (req, res) => {
  const { roomId } = req.params;

  try {
    const roomStatus = await client.HGET(`rooms:${roomId}:details`, "status");
    res.json({ success: true, data: { room_status: roomStatus } });
  } catch (error) {
    res.status(500).json({ success: false, data: null });
  }
};

const joinRoom = async (req, res) => {
  const { player_id, player_username, room_id } = req.body;

  try {
    await client.ZADD(`rooms:${room_id}:scores`, {
      score: 0,
      value: `${player_id}:${player_username}`,
    });
    res.json({ success: true, data: null });
  } catch (error) {
    res.status(500).json({ success: false, data: null });
  }
};

module.exports = { getRooms, createRoom, getRoomStatus, joinRoom, getRoom };
