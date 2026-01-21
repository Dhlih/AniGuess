import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import WaitingRoom from "./WaitingRoom";
import PlayingRoom from "./PlayingRoom";

const RoomPage = () => {
  const [roomStatus, setRoomStatus] = useState("");
  const { id } = useParams();

  const getRoomStatus = async () => {
    try {
      const response = await fetch(`http://127.0.0.1:3000/rooms/${id}/status`);
      const data = await response.json();
      setRoomStatus(data.data.room_status);
    } catch (error) {
      console.log("Gagal mengambil status room", error);
    }
  };

  useEffect(() => {
    getRoomStatus();
  }, []);

  return (
    <div>
      {roomStatus === "waiting" && <WaitingRoom roomId={id} />}
      {roomStatus === "playing" && <PlayingRoom />}
    </div>
  );
};

export default RoomPage;
