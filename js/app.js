var playerTable = {};

async function makePlayer(playerType) {
  if (playerType === 'human') {
    return setupUIToSelectMove;
  } else {
    var ai = await makeAI(playerType);
    return function (gameTree) {
      selectMoveByAI(gameTree, ai);
    };
  }
}

/**
 * 次の局面へ移動する
 */
function shiftToNewGameTree(gameTree) {
  // 盤面を描画する
  drawGameBoard(gameTree.board, gameTree.player, gameTree.moves);
  // UIを初期化
  resetUI();
  // ゲームが終了していたら，勝者を表示
  if (gameTree.moves.length === 0) {
    showWinner(gameTree.board);
    setupUIToReset();
  }
  // ゲームが終了していなかったら次の手の選択に移る
  else {
    playerTable[gameTree.player](gameTree);
  }
}

/**
 * ゲームを開始
 */
async function startNewGame() {
  $('#preference-pane :input')
    .addClass('disabled')
    .attr('disabled', 'disabled');
  
  playerTable[BLACK] = await makePlayer($('#black-player-type').val());
  playerTable[WHITE] = await makePlayer($('#white-player-type').val());

  shiftToNewGameTree(makeInitialGameTree());
}
