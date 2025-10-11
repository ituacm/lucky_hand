import React, { useEffect, useState } from "react";
import "./EntryPage.css";
import CreateGame from "../../components/CreateGame/CreateGame";
import JoinGame from "../../components/JoinGame/JoinGame";
import { useNavigate } from "react-router-dom";

function EntryPage({ socket, socketInfo, setSocketInfo }) {
  const [isJoining, setIsJoining] = useState(true);
  const navigate = useNavigate();
  useEffect(() => {
    socket.on("deliverSocketInfo", ({ gameId, playerName, playerId }) => {
      if (gameId) {
        setSocketInfo({
          gameId: gameId,
          playerName: playerName,
          playerId: playerId,
        });
      }
    });

    socket.on("error", (error) => {
      console.error("Entry page error:", error);
      alert(`Error: ${error}`);
    });

    if (socketInfo.gameId) {
      navigate(`/${socketInfo.gameId}`);
    }

    return () => {
      socket.off("deliverSocketInfo");
      socket.off("error");
    };
  }, [socketInfo]);

  useEffect(() => {
    if (socket.gameId) {
      navigate(`/${socket.gameId}`);
    }
  });
  return (
    <div className="entry-page-container">
      {isJoining ? (
        <JoinGame socket={socket} setIsJoining={setIsJoining} />
      ) : (
        <CreateGame socket={socket} setIsJoining={setIsJoining} />
      )}
    </div>
  );
}

export default EntryPage;
