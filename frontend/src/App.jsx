import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import ListRooms from "./pages/ListRooms";
import Playing from "./pages/Playing";

const App = () => {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/rooms" element={<ListRooms />} />
        <Route path="/play/room/:roomId" element={<Playing />} />
        <Route path="/play/solo" element={<Playing />} />
      </Routes>
    </div>
  );
};

export default App;
