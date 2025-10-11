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
    }
  };
  useEffect(() => {
    fetchPlayers();
    setSurvivedPlayers(players.filter((player) => !player.isEliminated));
    setEliminatedPlayers(players.filter((player) => player.isEliminated));
  }, [players]);

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
              socket.emit("nextRound");
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
