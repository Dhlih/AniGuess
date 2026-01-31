const { client } = require("../config/redis");
const Song = require("../models/Song");

module.exports = (io) => {
  io.on("connection", (socket) => {
    socket.on("join-room", async ({ room_id, player_username, player_id }) => {
      socket.join(room_id);

      await client.ZADD(
        `rooms:${room_id}:scores`,
        {
          score: 0,
          value: `${player_id}:${player_username}`,
        },
        { NX: true },
      );

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

      if (room.status === "playing") {
        const currentSong = await client.HGETALL(
          `rooms:${room_id}:current_song`,
        );

        const timerLeft = await client.HGET(
          `rooms:${room_id}:details`,
          "guessing_duration",
        );

        io.to(room_id).emit("game-playing", {
          players: formattedPlayers,
          timer_left: timerLeft,
          current_song: currentSong,
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
