import React, { useEffect, useRef, useState } from "react";
import "./Elimination.css";
import ListPlayers from "../ListPlayers/ListPlayers";
import axios from "axios";

function Elimination({ isELiminated, isAdmin, socket, socketInfo }) {
  const [players, setPlayers] = useState([]);
  const [survivedPlayers, setSurvivedPlayers] = useState([]);
  const [eliminatedPlayers, setEliminatedPlayers] = useState([]);
  const fetchPlayers = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/games/${socketInfo.gameId}/players`
      );
      setPlayers(response.data);
    } catch (err) {
      console.error(err);
      alert(`Failed to fetch players: ${err.response?.data || err.message || err}`);
    }
  };
  useEffect(() => {
    fetchPlayers();
    setSurvivedPlayers(players.filter((player) => !player.isEliminated));
    setEliminatedPlayers(players.filter((player) => player.isEliminated));
  }, [players]);

  useEffect(() => {
    socket.on("error", (error) => {
      console.error("Elimination error:", error);
      alert(`Elimination Error: ${error}`);
    });

    return () => {
      socket.off("error");
    };
  }, [socket]);

  return (
    <div className="elimination-container">
      {isELiminated ? <h1>You are eliminated</h1> : <h1>You Suvived!</h1>}
      <ListPlayers players={survivedPlayers} header={"Survived Players"} />
      <ListPlayers players={eliminatedPlayers} header={"Eliminated Players"} />
      {isAdmin ? (
        <>
          <p>You decide when to continue.</p>
          <button
            className="primary-button"
            onClick={() => {
              try {
                socket.emit("nextRound");
              } catch (err) {
                console.error("Error starting next round:", err);
                alert(`Failed to start next round: ${err.message || err}`);
              }
            }}
          >
            Next Round
          </button>
        </>
      ) : (
        <p>Wait for the for next round...</p>
      )}
    </div>
  );
}

export default Elimination;
