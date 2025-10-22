# Lucky Hand (Monorepo)

Lucky Hand is a lightweight, real-time party game where players pick a side each round (Left or Right). The host randomly eliminates one side; survivors advance to the next round until a single winner remains. This repository is a monorepo containing both the backend (Node.js + Socket.IO) and the frontend (React + Vite + Socket.IO client).

- Backend: `backend/` (Express + Socket.IO)
- Frontend: `frontend/` (React + Vite)

---

## Features
- Real-time gameplay using WebSockets (Socket.IO)
- Host creates a room and starts rounds
- Players join via a 6-character game ID
- Each round: players choose Left or Right
- Host eliminates a random side; eliminated users are tracked
- Game ends when 0 or 1 survivors remain; winner is announced
- Leaderboard based on elimination order

---

## Tech Stack
- **Backend**: Node.js, Express, Socket.IO
- **Frontend**: React 18, Vite, React Router, Socket.IO Client, Axios
- **Containerization**: Docker (per app), Nginx for serving built frontend

---

## Monorepo Structure
```
/backend
  app.js           # Socket.IO server, HTTP API (game + players)
  gameLogic.js     # Game state machine (status, rounds, winner)
  utils.js         # Helpers (generateGameId)
  Dockerfile
  docker-compose.yml
  package.json
/frontend
  src/
    pages/         # EntryPage, GamePage
    components/    # WaitingRoom, WaitingChoices, Elimination, GameOver, ListPlayers, CreateGame, JoinGame
  Dockerfile       # Multi-stage build; Nginx runtime
  docker-compose.yml
  vite.config.js
```

---

## Gameplay Overview
1. A player creates a game with a name and their nickname. A 6-character `GAME_ID` is generated.
2. Others join using `GAME_ID` and their nicknames.
3. Host starts the game. Status transitions:
   - `not_started` → `waiting_choices` → `elimination` → repeat … → `ended`
4. In `waiting_choices`, each player selects Left or Right.
5. Host triggers elimination; the server randomly picks the losing side and eliminates players on that side (and those who made no choice).
6. When 0–1 active players remain, the game ends and a winner is declared (if exists). Rankings show elimination order; winner is last.

---

## Local Development

### Prerequisites
- Node.js 18+ (frontend uses Node 20 in Docker, but local dev is fine with 18+)
- npm

### Env Vars
Frontend expects a backend base URL at runtime:
- `VITE_BACKEND_URL` (e.g., `http://localhost:3000`)

You can set it by creating `frontend/.env`:
```
VITE_BACKEND_URL=http://localhost:3000
```

### Run Backend (dev)
```
cd backend
npm install
npm run dev        # runs with nodemon on port 3000
```
Server logs: "Server is running on port 3000".

### Run Frontend (dev)
```
cd frontend
npm install
# Ensure VITE_BACKEND_URL is set as above
npm run dev        # Vite dev server (default 5173)
```
Open `http://localhost:5173` in the browser.

---

## Socket Events (Core Protocol)

From the frontend, a single `socket` connection is established to `VITE_BACKEND_URL` with WebSocket transport only.

### Client → Server
- `createGame` `{ gameName, playerName }`
- `joinGame` `{ gameId, playerName }`
- `leaveGame` `()`
- `startGame` `()`            # only the host can start
- `makeChoice` `{ choice }`   # choice ∈ {"left", "right"}
- `eliminatePlayers` `()`     # only the host; performs random elimination
- `nextRound` `()`            # only the host; advances to next round
- `removeGame` `()`           # only the host; deletes the game

### Server → Client (selected)
- `deliverSocketInfo` `{ gameId, playerName, playerId }`
- `gameCreated` `string`
- `playerJoined` `string`
- `playerLeft` `string`
- `gameStarted` `string`
- `playerMadeChoice` `string`
- `eliminated` `string`       # sent to eliminated player
- `gameEnded` `string`
- `roundStarted` `string`
- `refreshGameInfo` `()`
- `error` `string`

---

## HTTP API (Read Models)
- `GET /games` → object of all in-memory games keyed by `gameId`.
- `GET /games/:id` → game object
  - `{ id, name, createdBy, creatorId, status, round, winner, rankings }`
- `GET /games/:id/players` → array of players currently in room
  - `[{ id, name, gameId, isEliminated }, ...]`
- `GET /players` → array of all connected sockets with basic info

Notes:
- All game state is in-memory per process; no persistence.
- Game lifecycle is tied to WebSocket rooms; empty rooms are deleted.

---

## Frontend UX Flow
- `EntryPage`: Create or Join.
- `WaitingRoom`: Shows game name, `GAME_ID`, current players; host can Start.
- `WaitingChoices`: Shows round number; players choose; host can Eliminate.
- `Elimination`: Shows survived/eliminated lists; host can start Next Round.
- `GameOver`: Shows winner and a leaderboard derived from `rankings`.

---

## Docker

### Backend
`backend/Dockerfile` builds a simple Node.js runtime.
- Exposes port `8080` inside the container; the app listens on `3000` in code, so use port mapping accordingly in compose.
- Example compose (`backend/docker-compose.yml`) maps host `127.0.0.1:4005 → container 3000`.

Build and run locally:
```
cd backend
docker build -t luckyhand-api .
# Ensure port mapping to 3000 (app port)
docker run --rm -p 127.0.0.1:4005:3000 --name luckyhand-api luckyhand-api
```

### Frontend
Multi-stage build produces a static site served by Nginx.
```
cd frontend
docker build -t luckyhand-web .
docker run --rm -p 127.0.0.1:4006:80 --name luckyhand-web luckyhand-web
```
Access: `http://127.0.0.1:4006`

Set the frontend to point at the backend via env at build time or use a reverse proxy (recommended) to route `/socket.io` and `/games*` to the backend.

---

## Production Notes
- Consider a reverse proxy (Nginx/Caddy) in front of both services (e.g., `luckyhand.ituacm.com` for frontend and proxy `/socket.io` + `/games` to backend).
- Configure CORS and Socket.IO `origin` to include production URL(s). Backend currently allows: `http://127.0.0.1:5173`, `http://localhost:5173`, `https://luckyhand.ituacm.com`.
- Ensure WebSocket transport is enabled (already forced on both client and server).
- The backend keeps state in memory; use a single instance or implement shared state if scaling horizontally (e.g., Redis adapter for Socket.IO).

---

## Known Quirks / Dev Tips
- Backend `Dockerfile` exposes `8080` but the app listens on `3000`; remember to map the correct inner port.
- `ListPlayers` shows either `player.name` (objects) or the string itself (rankings list).
- In development, ensure `VITE_BACKEND_URL` matches where the backend is reachable from the browser.
- Error events from the server are surfaced via `alert()` to aid debugging.

---

## License
MIT (c) ITU ACM. See owners/maintainers for details.
