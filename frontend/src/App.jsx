import {
  createBrowserRouter,
  redirect,
  RouterProvider,
} from "react-router-dom";
import "./App.css";
import EntryPage from "./pages/EntryPage/EntryPage.jsx";
import { io } from "socket.io-client";
import { useEffect, useRef, useState } from "react";
import GamePage from "./pages/GamePage/GamePage.jsx";

function App() {
  const [socketInfo, setSocketInfo] = useState({
    gameId: null,
    playerName: null,
  });
  const socketRef = useRef();
  const [isSocketConnected, setIsSocketConnected] = useState(false);
  useEffect(() => {
    socketRef.current = io(import.meta.env.VITE_BACKEND_WS_URL);
    socketRef.current.on("connect", () => {
      console.log("Connected to server");
      setIsSocketConnected(true);
    });
    socketRef.current.on("error", (error) => {
      console.error("Socket error:", error);
    });
    return () => {
      socketRef.current.disconnect();
    };
  }, []);

  const router = createBrowserRouter([
    {
      path: "/",
      element: (
        <EntryPage
          socket={socketRef.current}
          socketInfo={socketInfo}
          setSocketInfo={setSocketInfo}
        />
      ),
    },
    {
      path: "/:gameId",
      element: (
        <GamePage
          socket={socketRef.current}
          socketInfo={socketInfo}
          setSocketInfo={setSocketInfo}
        />
      ),
      loader: () => (socketInfo.gameId ? null : redirect("/")),
    },
    {
      path: "*",
      loader: () => redirect("/"),
    },
  ]);

  return (
    <div className="App">
      {isSocketConnected ? (
        <RouterProvider router={router} />
      ) : (
        <div>Connecting to server...</div>
      )}
    </div>
  );
}

export default App;
