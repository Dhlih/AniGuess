const express = require("express");
const router = express.Router();
const roomController = require("../controllers/roomController");

router.get("/", roomController.getRooms);

router.post("/multiplayer", roomController.createMultiPlayerRoom);

router.post("/singleplayer", roomController.createSinglePlayerRoom);

router.get("/:roomId/validate", roomController.getRoomAccess);

module.exports = router;
