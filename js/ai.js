var aiMakers = {
  mcts_js: makeMonteCarloTreeSearchBasedAIJs,
  uct_wasm: makeUCTBasedAI,
  mcts_old: makeMonteCarloTreeSearchBasedAIOld,
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
  $('#message').text('Now thinking...');
  const start = Date.now();
  const move = ai.findTheBestMove(gameTree);
  const newGameTree = await force(move.gameTreePromise);
  const end = Date.now();
  const delta = end - start;
  console.log(delta);
  
  // 最小表示時間を確保
  await new Promise(resolve => setTimeout(resolve, Math.max(100 - delta, 1)));
  shiftToNewGameTree(newGameTree);
}
