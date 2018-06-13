var aiMakers = {
  mcts: makeMonteCarloTreeSearchBasedAI,
  mcts_old: makeMonteCarloTreeSearchBasedAIOld,
  pmc: makePrimitiveMonteCarloBasedAI
};

function makeAI(playerType) {
  var tokens = playerType.split('-');
  var aiType = tokens[0];
  var level = parseInt(tokens[1]);
  var extras = tokens.slice(2);
  return aiMakers[aiType]({
    level: level,
    extras: extras
  });
}

/**
 * AIによって手を選択して進める
 */
function selectMoveByAI(gameTree, ai) {
  $('#message').text('Now thinking...');
  setTimeout(
    function () {
      var start = Date.now();
      var newGameTree = force(ai.findTheBestMove(gameTree).gameTreePromise);
      var end = Date.now();
      var delta = end - start;
      console.log(delta);
      setTimeout(
        function () {
          shiftToNewGameTree(newGameTree);
        },
        Math.max(100 - delta, 1)
      );
    },
    1
  );
}