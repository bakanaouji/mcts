var aiMakers = {
  mcts_js: makeMonteCarloTreeSearchBasedAIJs,
  uct_wasm: makeUCTBasedAI,
  pmc: makePrimitiveMonteCarloBasedAI
};

async function makeAI(playerType) {
  var tokens = playerType.split('-');
  var aiType = tokens[0];
  var level = parseInt(tokens[1]);
  var extras = tokens.slice(2);
  return await aiMakers[aiType]({
    level: level,
    extras: extras
  });
}

/**
 * AIによって手を選択して進める
 */
async function selectMoveByAI(gameTree, ai) {
  // Draw current state first and wait for a short time to ensure UI update
  drawGameBoard(gameTree.board, gameTree.player, gameTree.moves);
  await new Promise(resolve => setTimeout(resolve, 100));
  
  $('#message').text('Now thinking...');
  const start = Date.now();
  const move = ai.findTheBestMove(gameTree);
  const nextBoard = move.isPassingMove ? 
    gameTree.board : 
    makeNextBoard(gameTree.board, move.x, move.y, 
      turnableCellList(gameTree.board, move.x, move.y, gameTree.player), 
      gameTree.player);
  const newGameTree = makeGameTree(nextBoard, nextPlayer(gameTree.player), move.isPassingMove);
  const end = Date.now();
  const delta = end - start;
  console.log(delta);
  
  // 最小表示時間を確保
  await new Promise(resolve => setTimeout(resolve, Math.max(100 - delta, 1)));
  shiftToNewGameTree(newGameTree);
}
