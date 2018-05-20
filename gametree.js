/**
 * ある盤面からのゲーム木を作成して取得
 */
function makeGameTree(board, player, wasPassed) {
    return {
        board: board,
        player: player,
        moves: possibleMoveList(board, player, wasPassed)
    };
}

/**
 * N手先までのゲーム木を構築する
 */
function limitGameTreeDepth(gameTree, depth) {
    return {
        board: gameTree.board,
        player: gameTree.player,
        moves: depth == 0 ? [] : gameTree.moves.map(function (m) {
            return {
                isPassingMove: m.isPassingMove,
                x: m.x,
                y: m.y,
                gameTreePromise: delay(function() {
                    return limitGameTreeDepth(force(m.gameTreePromise), depth - 1);
                })
            };
        })
    };
}