import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

import WaitingRoom from "./WaitingRoom";
import PlayingRoom from "./PlayingRoom";

const RoomPage = () => {
  const [roomStatus, setRoomStatus] = useState("");
  const { id } = useParams();

  const getRoomStatus = async () => {
    try {
      const response = await axios.get(
        `http://127.0.0.1:3000/rooms/${id}/status`,
      );
      console.log(response);
      setRoomStatus(response.data.data.room_status);
    } catch (error) {
      console.log("Gagal mengambil status room", error);
    }
  };

  useEffect(() => {
    getRoomStatus();
  }, []);

  return (
    <div>
      {roomStatus === "waiting" && (
        <WaitingRoom roomId={id} setRoomStatus={setRoomStatus} />
      )}
      {roomStatus === "playing" && <PlayingRoom />}
    </div>
  );
};

export default RoomPage;
