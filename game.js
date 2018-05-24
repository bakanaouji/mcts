/**
 * 次の手番のプレイヤーを取得
 */
function nextPlayer(player) {
    return (player == BLACK ? WHITE : BLACK);
}

/**
 * 指定の位置に石を置くことができるかどうか
 */
function canAttack(board, x, y, player) {
    return turnableCellList(board, x, y, player).length;
}

/**
 * 可能な行動のリストを取得
 */
function possibleMoveList(board, player, wasPassed) {
    var possibleMoves = [];

    // 石を置くことができる行動を列挙していく
    for (var x = 0; x < N; ++x) {
        for (var y = 0; y < N; ++y) {
            var turnableCells = turnableCellList(board, x, y, player);
            if (canAttack(board, x, y, player)) {
                possibleMoves.push({
                    x: x,
                    y: y,
                    gameTreePromise: (function (x, y, turnableCells) {
                        return delay(function () {
                            return makeGameTree(
                                makeNextBoard(board, x, y, turnableCells, player),
                                nextPlayer(player),
                                false
                            );
                        });
                    })(x, y, turnableCells)
                });
            }
        }
    }

    // 必要であればパスする手も加えて返す
    return completePassingMove(
        possibleMoves,
        board,
        player,
        wasPassed
    );
}

/**
 * 必要であればパスする手を補完して取りうる行動を返す
 */
function completePassingMove(moves, board, player, wasPassed) {
    // どこかしらに石を置けるならそのまま返す
    if (0 < moves.length) {
        return moves;
    } 
    // 前に相手がパスしていなかったら、パスできる
    else if (!wasPassed) {
        return [{
            isPassingMove: true,
            gameTreePromise: delay(function () {
                return makeGameTree(board, nextPlayer(player), true);
            })
        }];
    } 
    // 前に相手がパスしていたら、ゲーム終了
    else {
        return [];
    }
}

/**
 * 指定の位置に石を置いたときにひっくりかえせる石のリストを取得
 */
function turnableCellList(board, x, y, player) {
    var turnableCells = [];

    // すでに石が置いてあったら置くことはできないので、どこもひっくりかえせない
    if (board[ix(x, y)] != EMPTY) {
        return turnableCells;
    }

    var opponent = nextPlayer(player);
    for (var dx = -1; dx <= 1; ++dx) {
        for (var dy = -1; dy <= 1; ++dy) {
            // 石を置く位置はチェックする必要なし
            if (dx == 0 && dy == 0) {
                continue;
            }
            // 上下左右斜め方向に自分の石が存在していたら、
            // その間にある石をひっくりかえせる
            for (var i = 1; i < N; ++i) {
                var nx = x + i * dx;
                var ny = y + i * dy;
                // 盤面からはみ出ていたらチェックできない
                if (nx < 0 || N <= nx || ny < 0 || N <= ny) {
                    break;
                }
                // 自分の石が存在していたら、その間にある石をひっくりかえせる石として追加
                var cell = board[ix(nx, ny)];
                if (cell == player && 2 <= i) {
                    for (var j = 0; j < i; ++j) {
                        turnableCells.push(ix(x + j * dx, y + j * dy));
                    }
                    break;
                } 
                // 相手の石が存在していなかったら，チェックできない
                if (cell != opponent) {
                    break;
                }
            }
        }
    }

    return turnableCells;
}

/**
 * 指定の位置に石を置き、更新後の盤面を取得する
 */
function makeNextBoard(board, x, y, turnableCells, player) {
    var newBoard = board.slice();
    newBoard[ix(x, y)] = player;
    // ひっくりかえせる石をすべてひっくりかえす
    for (var i = 0; i < turnableCells.length; ++i) {
        newBoard[turnableCells[i]] = player;
    }
    return newBoard;
}

/**
 * ゲームをリセット
 */
function resetGame() {
    shiftToNewGameTree(makeGameTree(makeInitialGameBoard(), BLACK, false));
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
    if (gameTree.moves.length == 0) {
        showWinner(gameTree.board);
        setupUIToReset();
    } 
    // ゲームが終了していなかったら打てる手を表示
    else {
        var playerTypeTable = {};
        playerTypeTable[BLACK] = $('#black-player-type').val();
        playerTypeTable[WHITE] = $('#white-player-type').val();
        var playerType = playerTypeTable[gameTree.player];
        if (playerType == 'human') {
            setupUIToSelectMove(gameTree);
        } 
        // AIの手番であればUIを表示せずに進める
        else {
            selectMoveByAI(gameTree);
        }
    }
}
