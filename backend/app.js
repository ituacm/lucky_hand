import express from "express";
import http from "http";
import { Server } from "socket.io";
import { Game } from "./gameLogic.js";
import { generateGameId } from "./utils.js";
import cors from "cors";

const app = express();

app.use(
  cors({
    origin: ["http://127.0.0.1:5173", "http://localhost:5173"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

app.use(express.json());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://127.0.0.1:5173", "http://localhost:5173"], // Replace with your frontend URL
    methods: ["GET", "POST"],
    allowedHeaders: ["my-custom-header"],
    credentials: true,
  },
});

const games = {};

io.on("connection", (socket) => {
  console.log("User connected: " + socket.id);
  socket.broadcast.emit("newConnection", socket.id);
  socket.on("message", (msg) => {
    console.log("Message: " + msg);

    io.emit("newMessage", msg);
  });

  socket.on("createGame", ({ gameName, playerName }) => {
    //creates a new game. Adds the player to the game as the creator
    if (socket.rooms.size > 1) {
      socket.emit(
        "error",
        "You are already in a room with id: " + Array.from(socket.rooms)[1]
      );
      return;
    }
    const gameId = generateGameId();
    while (games[gameId]) {
      gameId = generateGameId();
    }
    socket.join(gameId);
    socket.playerName = playerName;
    socket.gameId = gameId;
    socket.isEliminated = false;
    games[gameId] = new Game(gameId, gameName, socket.id, socket.playerName);
    console.log(`Game ${gameId} created by ${socket.playerName}`);
    io.emit(
      "gameCreated",
      `Game ${games[gameId].name} with id:${gameId} created by ${socket.playerName}`
    );
    socket.emit("deliverSocketInfo", {
      gameId: socket.gameId,
      playerName: socket.playerName,
      playerId: socket.id,
    });
  });

  socket.on("joinGame", ({ gameId, playerName }) => {
    //make the socket(player) join a game room
    if (socket.rooms.size > 1) {
      socket.emit(
        "error",
        "You are already in a room: " + Array.from(socket.rooms)[1]
      );
      return;
    } else if (!games[gameId]) {
      socket.emit("error", "Game not found.");
      return;
    } else if (games[gameId].status !== "not_started") {
      socket.emit("error", "Game has already started.");
      return;
    } else if (!playerName) {
      socket.emit("error", "Invalid playerName.");
      return;
    }
    socket.join(gameId);
    socket.playerName = playerName;
    socket.gameId = gameId;
    socket.isEliminated = false;
    const room = io.sockets.adapter.rooms.get(gameId);
    const roomSize = room ? room.size : 0;
    io.in(gameId).emit(
      "playerJoined",
      `${socket.playerName} joined the game ${games[gameId].name} with id ${gameId}. There are ${roomSize} players in this game.`
    );
    socket.emit("deliverSocketInfo", {
      gameId: socket.gameId,
      playerName: socket.playerName,
    });
    console.log(
      `Player ${socket.playerName} joined game ${gameId} with ${roomSize} players`
    );
  });

  socket.on("leaveGame", () => {
    //make the socket leave a game room
    const gameId = socket.gameId;
    if (!gameId || !games[gameId]) {
      socket.emit("error", "Invalid gameId or game does not exist");
      return;
    }
    socket.leave(gameId);
    const room = io.sockets.adapter.rooms.get(gameId);
    const roomSize = room ? room.size : 0;
    io.in(gameId).emit(
      //fix
      "playerLeft",
      `${socket.playerName} left the game ${games[gameId].name} with id ${gameId}.${roomSize} players left.` +
        roomSize ===
        0
        ? `The game will be deleted.`
        : null
    );
    socket.emit(
      "leftGame",
      `You left the game ${games[gameId].name} with id ${gameId}.`
    );
    console.log(`Player ${socket.playerName} left game ${gameId}`);
    delete socket.playerName;
    delete socket.gameId;
    delete socket.isEliminated;

    if (roomSize === 0) {
      delete games[gameId];
      console.log(`Game ${gameId} deleted.`);
    }
  });

  socket.on("startGame", () => {
    //starts the game
    if (!socket.gameId || !games[socket.gameId]) {
      socket.emit("error", "You are not in a game room");
      return;
    } else if (!socket.gameId || socket.gameId.length !== 6) {
      socket.emit("error", "Invalid gameId");
      return;
    } else if (!games[socket.gameId]) {
      socket.emit("error", "Game not found");
      return;
    } else if (games[socket.gameId].creatorId !== socket.id) {
      socket.emit("error", "You are not permitted to start this game");
      return;
    } else if (games[socket.gameId].status !== "not_started") {
      socket.emit("error", "Game already started");
      return;
    }
    const game = games[socket.gameId];
    game.startGame();
    game.nextRound();
    io.in(socket.gameId).emit(
      "gameStarted",
      `Game ${game.name} with id: ${socket.gameId} started! Round ${game.round}`
    );
    console.log(`Game ${game.name} with id: ${socket.gameId} started!`);
  });

  socket.on("makeChoice", ({ choice }) => {
    //makes a choice for the current round
    if (!socket.gameId) {
      socket.emit("error", "You are not in a game room");
      return;
    } else if (games[socket.gameId].status === "not_started") {
      socket.emit("error", "Game has not started yet");
      return;
    } else if (games[socket.gameId].status != "waiting_choices") {
      socket.emit("error", "Game is not in the waiting_choices state");
      return;
    } else if (!choice || !["left", "right"].includes(choice)) {
      socket.emit("error", "You must choose either 'left' or 'right'");
      return;
    } else if (socket.isEliminated) {
      socket.emit("error", "You have been eliminated");
      return;
    } else if (socket.choice) {
      socket.emit("error", "You have already made a choice");
      return;
    }

    socket.choice = choice;

    io.in(socket.gameId).emit(
      "playerMadeChoice",
      `${socket.playerName} made a choice: ${choice} for round ${
        games[socket.gameId].round
      }`
    );
  });

  socket.on("eliminatePlayers", () => {
    //eliminates players who made the wrong choice
    if (!socket.gameId) {
      socket.emit("error", "You are not in a game room");
      return;
    } else if (games[socket.gameId].status !== "waiting_choices") {
      socket.emit("error", "Game is not in the waiting_choices state");
      return;
    } else if (games[socket.gameId].creatorId !== socket.id) {
      socket.emit("error", "You are not permitted to eliminate players");
      return;
    }
    const loserChoice = Math.random() < 0.5 ? "left" : "right";
    let players = Array.from(io.sockets.adapter.rooms.get(socket.gameId) || []);
    let activePlayers = players.filter((socketId) => {
      const player = io.sockets.sockets.get(socketId);
      return player && !player.isEliminated;
    });
    activePlayers.forEach((socketId) => {
      const player = io.sockets.sockets.get(socketId);
      if (player && (!player.choice || player.choice === loserChoice)) {
        io.in(socket.gameId).emit(
          "playerEliminated",
          `${player.playerName} has been eliminated`
        );
        player.isEliminated = true;
        player.emit("eliminated", "You have been eliminated");
        games[socket.gameId].rankings.push(player.playerName);
      }
      if (player) delete player.choice;
    });

    players = Array.from(io.sockets.adapter.rooms.get(socket.gameId) || []);
    activePlayers = players.filter((socketId) => {
      const player = io.sockets.sockets.get(socketId);
      return player && !player.isEliminated;
    });
    if (activePlayers.length === 1) {
      console.log(activePlayers);
      games[socket.gameId].setWinner(
        io.sockets.sockets.get(activePlayers[0]).playerName
      );
      io.in(socket.gameId).emit(
        "gameEnded",
        `Game ended. Winner: ${
          io.sockets.sockets.get(activePlayers[0]).playerName
        }`
      );
      console.log(
        `Game ended. Winner: ${
          io.sockets.sockets.get(activePlayers[0]).playerName
        }`
      );
      games[socket.gameId].status = "ended";
      games[socket.gameId].rankings.push(
        io.sockets.sockets.get(activePlayers[0]).playerName
      );
    } else if (activePlayers.length === 0) {
      io.in(socket.gameId).emit("gameEnded", "Game ended. No winners");
      console.log("Game ended. No winners");
      games[socket.gameId].status = "ended";
    }
    if (games[socket.gameId].status !== "ended") {
      games[socket.gameId].status = "elimination";
      io.in(socket.gameId).emit("refreshGameInfo");
    }
  });

  socket.on("nextRound", () => {
    //starts the next round
    if (!socket.gameId) {
      socket.emit("error", "You are not in a game room");
      return;
    } else if (games[socket.gameId].status !== "elimination") {
      socket.emit("error", "Game is not in the elimination state");
      return;
    } else if (games[socket.gameId].creatorId !== socket.id) {
      socket.emit("error", "You are not permitted to start the next round");
      return;
    }
    const game = games[socket.gameId];
    game.nextRound();
    game.status = "waiting_choices";
    io.in(socket.gameId).emit("roundStarted", `Round ${game.round} started`);
    console.log(`Round ${game.round} started`);
    io.in(socket.gameId).emit("refreshGameInfo");
  });

  socket.on("removeGame", () => {
    //removes the game
    if (!socket.gameId) {
      socket.emit("error", "You are not in a game room");
      return;
    } else if (games[socket.gameId].creatorId !== socket.id) {
      socket.emit("error", "You are not permitted to remove the game");
      return;
    }
    const room = io.sockets.adapter.rooms.get(socket.gameId);
    const roomSize = room ? room.size : 0;
    io.in(socket.gameId).emit(
      "gameRemoved",
      `Game ${games[socket.gameId].name} with id ${
        socket.gameId
      } has been removed.`
    );
    console.log(
      `Game ${games[socket.gameId].name} with id ${
        socket.gameId
      } has been removed.`
    );
    delete games[socket.gameId];
  });

  socket.on("disconnect", () => {
    if (socket.gameId) {
      const room = io.sockets.adapter.rooms.get(socket.gameId);
      const roomSize = room ? room.size : 0;

      if (roomSize === 0) {
        delete games[socket.gameId];
        console.log(`Game ${socket.gameId} deleted.`);
      } else {
        io.in(socket.gameId).emit(
          "playerLeft",
          `${socket.playerName} left the game ${
            games[socket.gameId].name
          } with id ${socket.gameId}. ${roomSize} players left.`
        );
        console.log(`Player ${socket.playerName} left game ${socket.gameId}`);
      }
    }

    console.log("User disconnected");
  });
});

app.get("/games/:id", (req, res) => {
  if (games[req.params.id]) {
    res.json(games[req.params.id]);
  } else {
    res.status(404).send("Game not found");
  }
});

app.get("/games/:id/players", (req, res) => {
  if (games[req.params.id]) {
    const players = [];
    for (const [socketId, socket] of io.sockets.sockets) {
      if (socket.gameId === req.params.id) {
        players.push({
          id: socketId,
          name: socket.playerName,
          gameId: socket.gameId,
        });
      }
    }
    res.json(players);
  } else {
    res.status(404).send("Game not found");
  }
});

app.get("/games", (req, res) => {
  res.json(games);
});

app.get("/players", async (req, res) => {
  const players = [];
  for (const [socketId, socket] of io.sockets.sockets) {
    players.push({
      id: socketId,
      name: socket.playerName,
      gameId: socket.gameId,
    });
  }
  res.json(players);
});

server.listen(8080, () => {
  console.log("Server is running on port 8080");
});
