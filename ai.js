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
 * AIによる行動選択
 */
function findBestMoveByAI(gameTree) {
    var ratings = calculateMaxRatings(
        limitGameTreeDepth(gameTree, 4),
        gameTree.player,
        Number.MIN_VALUE,
        Number.MAX_VALUE
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
function ratePositionWithAlphaBetaPruning(gameTree, player, lowerLimit, upperLimit) {
    // まだ指せる手があるなら各手を指した後の局面の価値を求める
    // その後，
    // * 現在の局面が自分の手番ならば，各手の価値の最大値を局面の価値とする
    // * 現在の局面が相手の手番ならば，各手の価値の最小値を局面の価値とする
    if (1 <= gameTree.moves.length) {
        var choose = gameTree.player == player ? Math.max : Math.min;
        var rate = gameTree.player == player ? calculateMaxRatings: calculateMinRatings;
        return choose.apply(null, rate(gameTree, player, lowerLimit, upperLimit));
    } 
    // 指せる手が無いなら今の盤面の価値をそのまま手の価値とする
    else {
        return scoreBoard(gameTree.board, player);
    }
}

/**
 * 自分の手番で指す手の価値を列挙する
 */
function calculateMaxRatings(gameTree, player, lowerLimit, upperLimit) {
    var ratings = [];
    var newLowerLimit = lowerLimit;
    for (var i = 0; i < gameTree.moves.length; ++i) {
        // 手の価値を計算
        var r = ratePositionWithAlphaBetaPruning(
            force(gameTree.moves[i].gameTreePromise),
            player,
            newLowerLimit,
            upperLimit
        );
        ratings.push(r);
        // 手の価値が上限以上だと判明した場合，
        // 現在の局面から辿れる範囲に上層が求める最善手の候補は存在しないので，
        // 残りの手の価値を求める意味がないので列挙を中断
        if (upperLimit <= r) {
            break;
        }
        newLowerLimit = Math.max(r, newLowerLimit);
    }
    return ratings;
}

/**
 * 相手の手番で指す手の価値を列挙する
 */
function calculateMinRatings(gameTree, player, lowerLimit, upperLimit) {
    var ratings = [];
    var newUpperLimit = upperLimit;
    for (var i = 0; i < gameTree.moves.length; i++) {
        // 手の価値を計算
        var r = ratePositionWithAlphaBetaPruning(
        force(gameTree.moves[i].gameTreePromise),
        player,
        upperLimit,
        newUpperLimit
      );
      ratings.push(r);
        // 手の価値が下限以下だと判明した場合，
        // 現在の局面から辿れる範囲に上層が求める最善手の候補は存在しないので，
        // 残りの手の価値を求める意味がないので列挙を中断
      if (r <= lowerLimit)
        break;
      newUpperLimit = Math.min(r, newUpperLimit);
    }
    return ratings;
  }