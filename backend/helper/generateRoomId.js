const { customAlphabet } = require("nanoid");

const generateRoomId = async () => {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const nanoId = customAlphabet(alphabet, 6);
  let isUnique = false;
  let roomId = "";

  while (!isUnique) {
    roomId = nanoId();
    const data = await client.exists(`room:${roomId}:details`);
    if (data == 0) isUnique = true;
  }
  return roomId;
};

module.exports = generateRoomId;
