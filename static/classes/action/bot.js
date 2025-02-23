function botMove(board, color) {
  let possibleMove = [];

  for (const piece of board.pieces) {
    if (piece && piece.color == color) {
      for (let x = 1; x <= 8; x++) {
        for (let y = 1; y <= 8; y++) {
          if (
            piece.isLegal(board, x, y) &&
            !board.isCheckIfMovePlayed(piece, x, y)
          ) {
            possibleMove.push({ x: piece.x, y: piece.y, newX: x, newY: y });
          }
        }
      }
    }
  }

  let move =
    possibleMove[Math.floor(Math.random() * possibleMove.length)] ?? null;

  window.BotPlaying = true;
  if (move) {
    makeMove(board, move.x, move.y, move.newX, move.newY);
  }
}
