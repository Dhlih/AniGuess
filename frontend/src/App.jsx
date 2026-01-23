import { Navigate, Route, Routes } from "react-router-dom";
import { SocketProvider } from "./context/socketContext";

import Home from "./pages/Home";
import ListRooms from "./pages/ListRooms";
import RoomPage from "./pages/RoomPage";

const App = () => {
  const username = localStorage.getItem("aniguess_username");
  const userId = localStorage.getItem("aniguess_uid");
  const hasCredentials = username && userId ? true : false;

  return (
    <SocketProvider>
      <Routes>
        <Route path="/" element={<Home />} />

        <Route
          path="/rooms"
          element={hasCredentials ? <ListRooms /> : <Navigate to="/" />}
        />

        <Route
          path="/rooms/:id"
          element={hasCredentials ? <RoomPage /> : <Navigate to="/" />}
        />

        {/* Redirect jika user mengetik URL ngawur */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </SocketProvider>
  );
};

export default App;
