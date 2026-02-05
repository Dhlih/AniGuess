const { client } = require("../config/redis");

const getCurrentRoom = async (req, res) => {
  const { playerId } = req.params;

  try {
    const roomId = await client.GET(`players:${playerId}:room`);

    res.status(200).json({
      success: true,
      data: {
        is_player_in_room: roomId !== null,
        room_id: roomId,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, data: null });
  }
};

module.exports = { getCurrentRoom };
