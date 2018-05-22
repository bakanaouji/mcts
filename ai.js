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
    var ratings = calculateRatings(
        limitGameTreeDepth(gameTree, 4),
        gameTree.player
    );
    var maxRating = Math.max.apply(null, ratings);
    return gameTree.moves[ratings.indexOf(maxRating)];
}

/**
 * 盤面の価値を算出
 */
function scoreBoard(board, player) {
    var opponent = nextPlayer(player);
    // 自分の石の数 - 相手の石の数
    return sum($.map(board, function (v) {return v == player;})) -
           sum($.map(board, function (v) {return v == opponent;}));
}

function sum(ns) {
    return ns.reduce(function (t, n) {return t + n;});
}

/**
 * 手の価値を算出
 */
function ratePosition(gameTree, player) {
    // まだ指せる手があるなら各手を指した後の局面の価値を求める
    // その後，
    // * 現在の局面が自分の手番ならば，各手の価値の最大値を局面の価値とする
    // * 現在の局面が相手の手番ならば，各手の価値の最小値を局面の価値とする
    if (1 <= gameTree.moves.length) {
        var choose = gameTree.player == player ? Math.max : Math.min;
        return choose.apply(null, calculateRatings(gameTree, player));
    } 
    // 指せる手が無いなら今の盤面の価値をそのまま手の価値とする
    else {
        return scoreBoard(gameTree.board, player);
    }
}

/**
 * 各手に対しての価値を算出
 */
function calculateRatings(gameTree, player) {
    return gameTree.moves.map(function (m) {
        return ratePosition(force(m.gameTreePromise), player);
    });
}