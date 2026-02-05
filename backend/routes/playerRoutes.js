const express = require("express");
const router = express.Router();

const roomController = require("../controllers/playerController");

router.get("/:playerId/current-room", roomController.getCurrentRoom);

module.exports = router;
