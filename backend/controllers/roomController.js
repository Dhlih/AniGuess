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

const getRoomAccess = async (req, res) => {
  const { player_id, player_username } = req.query;
  const { roomId } = req.params;

  const formatPlayer = `${player_id}:${player_username}`;

  try {
    const roomStatus = await client.HGET(`rooms:${roomId}:details`, "status");
    const playerScore = await client.ZSCORE(
      `rooms:${roomId}:scores`,
      formatPlayer,
    );

    res.status(200).json({
      success: true,
      data: {
        room_status: roomStatus,
        is_player_in_room: playerScore !== null,
        room_id: roomId,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, data: null });
  }
};



module.exports = { getRooms, createRoom, getRoomAccess };
