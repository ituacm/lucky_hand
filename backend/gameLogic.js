export class Game {
  constructor(roomId, name, creatorId, creatorName) {
    this.id = roomId;
    this.name = name;
    this.createdBy = creatorName;
    this.creatorId = creatorId;
    this.status = "not_started"; //not_started, waiting_choices, elimination, ended
    this.round = 0;
    this.winner = null;
    this.rankings = [];
  }
  nextRound() {
    this.round++;
  }
  setWinner(playerName) {
    this.winner = playerName;
  }
  startGame() {
    this.status = "waiting_choices";
  }
}
