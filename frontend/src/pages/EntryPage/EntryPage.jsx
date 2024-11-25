import React, { useEffect } from "react";
import "./EntryPage.css";
import CreateGame from "../../components/CreateGame/CreateGame";
import JoinGame from "../../components/JoinGame/JoinGame";
import { useNavigate } from "react-router-dom";

function EntryPage({ socket, socketInfo, setSocketInfo }) {
  const navigate = useNavigate();
  useEffect(() => {
    socket.on("deliverSocketInfo", ({ gameId, playerName }) => {
      if (gameId) {
        setSocketInfo({ gameId: gameId, playerName: playerName });
      }
    });

    if (socketInfo.gameId) {
      navigate(`/${socketInfo.gameId}`);
    }

    return () => {
      socket.off("deliverSocketInfo");
    };
  }, [socketInfo]);

  useEffect(() => {
    if (socket.gameId) {
      navigate(`/${socket.gameId}`);
    }
  });
  return (
    <div className="entry-page-container">
      <CreateGame socket={socket} />
      <JoinGame socket={socket} />
    </div>
  );
}

export default EntryPage;
