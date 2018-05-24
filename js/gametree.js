/**
 * 初期のゲーム木を作成
 */
function makeInitialGameTree() {
  return makeGameTree(makeInitialGameBoard(), BLACK, false, 1);
}

/**
 * ある盤面からのゲーム木を作成
 */
function makeGameTree(board, player, wasPassed) {
  return {
    board: board,
    player: player,
    moves: possibleMoveList(board, player, wasPassed)
  };
}