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
    socketRef.current = io(import.meta.env.VITE_BACKEND_URL,{transports:["websocket"]});
    socketRef.current.on("connect", () => {
      console.log("Connected to server");
      setIsSocketConnected(true);
    });
    socketRef.current.on("disconnect", (reason) => {
      console.log("Disconnected from server:", reason);
      setIsSocketConnected(false);
      if (reason === "io server disconnect") {
        alert("Server disconnected. Please refresh the page.");
      } else if (reason === "io client disconnect") {
        console.log("Client disconnected");
      } else {
        alert("Connection lost. Attempting to reconnect...");
      }
    });
    socketRef.current.on("connect_error", (error) => {
      console.error("Connection error:", error);
      alert(`Connection Error: ${error.message || error}`);
    });
    socketRef.current.on("error", (error) => {
      console.error("Socket error:", error);
      alert(`Error: ${error}`);
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
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          flexDirection: 'column',
          gap: '10px'
        }}>
          <div>Connecting to server...</div>
          <div style={{ fontSize: '14px', color: '#666' }}>
            If this takes too long, please check your connection and refresh the page.
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
