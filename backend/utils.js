export const generateUniqueId = () => {
  return Date.now().toLocaleString() + "-" + Math.floor(Math.random() * 1000);
};

export const generateGameId = () => {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let gameId = "";

  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    gameId += characters[randomIndex];
  }

  return gameId;
};
