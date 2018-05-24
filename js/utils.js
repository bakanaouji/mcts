/**
 * グリッド座標をインデックスへ変換
 */
function ix(x, y) {
  return x + y * N;
}

/**
 * 遅延評価
 */
function delay(expressionAsFunction) {
  var result;
  var isEvaluated = false;

  return function () {
    if (!isEvaluated) {
      result = expressionAsFunction();
      isEvaluated = true;
    }
    return result;
  };
}

/**
 * 遅延評価していた処理を実行
 */
function force(promise) {
  return promise();
}

/**
 * 整数の乱数を生成
 */
function random(n) {
  return Math.floor(Math.random() * n);
}
