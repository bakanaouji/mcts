/**
 * AIによって手を選択して進める
 */
function selectMoveByAI(gameTree) {
    $('#message').text('Now thinking...');
    setTimeout(
        function() {
            shiftToNewGameTree(
                force(findBestMoveByAI(gameTree).gameTreePromise)
            );
        },
        500
    );
}

/**
 * 適当に選択
 */
function findBestMoveByAI(gameTree) {
    return gameTree.moves[0];
}