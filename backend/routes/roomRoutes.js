const express = require("express");
const router = express.Router();
const roomController = require("../controllers/roomController");

router.get("/", roomController.getRooms);

router.post("/", roomController.createRoom);

router.get("/:roomId/status", roomController.getRoomStatus);

router.get("/:roomId/player/:playerId", roomController.IsPlayerInRoom);

module.exports = router;
