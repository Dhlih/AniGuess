const { client } = require("../config/redis");

module.exports = (io) => {
  io.on("connection", (socket) => {
    socket.on("join-room", async ({ room_id, player_username, player_id }) => {
      const room = await client.HGETALL(`rooms:${room_id}:details`);
      const hostId = room.host_id;
      const players = await client.ZRANGE_WITHSCORES(
        `rooms:${room_id}:scores`,
        0,
        -1,
      );
      const formattedPlayers = players.map((player) => {
        const [id, username] = player.value.split(":");
        return {
          id,
          username,
          score: player.score,
        };
      });

      const isPlayerInRoom =
        formattedPlayers.filter((player) => player.id === player_id).length > 0
          ? true
          : false;
      const isRoomFull = formattedPlayers.length >= Number(room.max_players);

      if (isRoomFull) {
        socket.emit("error", {
          msg: "Max player reached",
        });
      }

      if (isPlayerInRoom || !isRoomFull) {
        socket.join(room_id);

        await client.ZADD(
          `rooms:${room_id}:scores`,
          {
            score: 0,
            value: `${player_id}:${player_username}`,
          },
          { NX: true },
        );
      }

      if (room.status === "playing") {
        const currentSong = await client.HGETALL(
          `rooms:${room_id}:current_song`,
        );
        const options = currentSong.answer_options
          ? JSON.parse(currentSong.answer_options)
          : [];

        io.to(room_id).emit("game-playing", {
          players: formattedPlayers,
          current_song: currentSong,
          target_end_at: currentSong.end_at,
          server_time: Date.now(),
          answer_options: options,
        });
      }

      if (room.status === "waiting") {
        io.to(room_id).emit("players-update", {
          players: formattedPlayers,
          total_players: formattedPlayers.length,
          max_players: room.max_players,
          host_id: hostId,
        });
      }
    });

    socket.on("delete-room", async ({ room_id, player_id }) => {
      const roomHostId = await client.HGET(
        `rooms:${room_id}:details`,
        "host_id",
      );

      if (roomHostId === player_id) {
        await client.DEL(`rooms:${room_id}:details`, `rooms:${room_id}:scores`);

        io.to(room_id).emit("room-update", {
          status: "deleted",
        });
      }
    });
  });
};
