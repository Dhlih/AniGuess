const { client } = require("../config/redis");

module.exports = (io) => {
  io.on("connection", (socket) => {
    socket.on("start-game", async ({ room_id }) => {
      try {
        await client.HSET(`rooms:${room_id}:details`, "status", "playing");
        io.to(room_id).emit("game-started", {
          status: "playing",
        });
        console.log("mantap");
      } catch (error) {
        socket.emit("error-message", { message: "Gagal memulai game" });
      }
    });
  });
};
