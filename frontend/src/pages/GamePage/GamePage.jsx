import React, { useEffect, useState } from "react";
import WaitingRoom from "../../components/WaitingRoom/WaitingRoom";
import axios from "axios";
import { redirect, useParams } from "react-router-dom";
import WaitingChoices from "../../components/WaitingChoices/WaitingChoices";
import Elimination from "../../components/Elimination/Elimination";
import GameOver from "../../components/GameOver/GameOver";
import "./GamePage.css";

function GamePage({ socket, socketInfo, setSocketInfo }) {
  const [gameInfo, setGameInfo] = useState({});
  const params = useParams();
  const [isEliminated, setIsEliminated] = useState(false);

  const fetchGameInfo = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}games/${socketInfo.gameId}`
      );
      setGameInfo(response.data);
      console.log(response.data);
    } catch (err) {
      console.error(err);
    }
  };
  useState(() => {
    fetchGameInfo();
  }, []);
  useEffect(() => {
    socket.on("gameStarted", () => {
      fetchGameInfo();
    });
    socket.on("gameEnded", () => {
      fetchGameInfo();
    });
    socket.on("refreshGameInfo", () => {
      fetchGameInfo();
    });
    socket.on("eliminated", () => {
      setIsEliminated(true);
    });
  }, [socket]);

  return (
    <div className="game-page-container">
      {gameInfo.status === "not_started" && (
        <WaitingRoom
          socket={socket}
          socketInfo={socketInfo}
          setSocketInfo={setSocketInfo}
          isAdmin={gameInfo && gameInfo.creatorId === socketInfo.playerId}
          fetchGameInfo={fetchGameInfo}
        />
      )}
      {gameInfo.status === "waiting_choices" && (
        <WaitingChoices
          gameInfo={gameInfo}
          socket={socket}
          isAdmin={gameInfo && gameInfo.creatorId === socketInfo.playerId}
          fetchGameInfo={fetchGameInfo}
          isEliminated={isEliminated}
        />
      )}
      {gameInfo.status === "elimination" && (
        <Elimination
          isELiminated={isEliminated}
          socket={socket}
          isAdmin={gameInfo && gameInfo.creatorId === socketInfo.playerId}
          socketInfo={socketInfo}
        />
      )}
      {gameInfo.status === "ended" && <GameOver gameInfo={gameInfo} />}
    </div>
  );
}

export default GamePage;
