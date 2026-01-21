const express = require("express");
const router = express.Router();
const roomController = require("../controllers/roomController");

router.get("/", roomController.getRooms);

router.get("/:roomId", roomController.getRoom);

router.get("/:roomId/status", roomController.getRoomStatus);

router.post("/", roomController.createRoom);

router.post("/join", roomController.joinRoom);

module.exports = router;
