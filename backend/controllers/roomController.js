const generateRoomId = require("../helper/generateRoomId");
const client = require("../config/redis")

const getRooms = async () => {
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
};

const createRoom = async (req, res) => {
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
};

module.exports = { getRooms, createRoom };
