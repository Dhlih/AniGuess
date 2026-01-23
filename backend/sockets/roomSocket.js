const { client } = require("../config/redis");

module.exports = (io) => {
  io.on("connection", (socket) => {
    socket.on("join-room", async ({ room_id, player_username, player_id }) => {
      try {
        await client.ZADD(`rooms:${room_id}:scores`, {
          score: 0,
          value: `${player_id}:${player_username}`,
        });
        const players = await client.ZRANGE(`rooms:${room_id}:scores`, 0, -1);
        const formattedPlayers = players.map((player) => {
          const [uid, username] = player.split(":");
          return {
            id: uid,
            username,
          };
        });

        const room = await client.HGETALL(`rooms:${room_id}:details`);
        socket.join(room_id);

        io.to(room_id).emit("room-update", {
          players: formattedPlayers,
          max_players: room.max_players,
          host_id: room.host_id,
          total_players: players.length,
        });
      } catch (error) {
        console.log("Gagal saat join room");
        socket.emit("error-message", { message: "Gagal join room" });
      }
    });
  });
};
