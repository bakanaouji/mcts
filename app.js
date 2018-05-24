(function (O) {
  'use strict';

  // UI {{{1

  /**
   * 盤面を描画する
   */
  function drawGameBoard(board, player, moves) {
    // 盤面の情報をhtml形式に変換した文字列
    var htmlStyleFromBoard = [];
    var attackable = [];
    moves.forEach(function (m) {
      if (!m.isPassingMove)
        attackable[O.ix(m.x, m.y)] = true;
    });

    // tableタグを使って表現
    htmlStyleFromBoard.push('<table>');
    for (var y = -1; y < O.N; y++) {
      htmlStyleFromBoard.push('<tr>');
      for (var x = -1; x < O.N; x++) {
        if (0 <= y && 0 <= x) {
          htmlStyleFromBoard.push('<td class="');
          htmlStyleFromBoard.push('cell');
          htmlStyleFromBoard.push(' ');
          htmlStyleFromBoard.push(attackable[O.ix(x, y)] ? player : board[O.ix(x, y)]);
          htmlStyleFromBoard.push(' ');
          htmlStyleFromBoard.push(attackable[O.ix(x, y)] ? 'attackable' : '');
          htmlStyleFromBoard.push('" id="');
          htmlStyleFromBoard.push('cell_' + x + '_' + y);
          htmlStyleFromBoard.push('">');
          htmlStyleFromBoard.push('<span class="disc"></span>');
          htmlStyleFromBoard.push('</td>');
        } else if (0 <= x && y === -1) {
          htmlStyleFromBoard.push('<th>' + String.fromCharCode('a'.charCodeAt(0) + x) + '</th>');
        } else if (x === -1 && 0 <= y) {
          htmlStyleFromBoard.push('<th>' + (y + 1) + '</th>');
        } else /* if (x === -1 && y === -1) */ {
          htmlStyleFromBoard.push('<th></th>');
        }
      }
      htmlStyleFromBoard.push('</tr>');
    }
    htmlStyleFromBoard.push('</table>');

    // tableタグを使って表現
    $('#game-board').html(htmlStyleFromBoard.join(''));
    // tableタグを使って表現
    $('#current-player-name').text(player);
  }

  /**
   * UIをリセット
   */
  function resetUI() {
    $('#console').empty();
    $('#message').empty();
  }

  /**
   * 選択できる行動を表示
   */
  function setupUIToSelectMove(gameTree) {
    $('#message').text('Select your move.');
    gameTree.moves.forEach(function (m, i) {
      if (m.isPassingMove) {
        $('#console').append(
          $('<input type="button" class="btn">')
            .val(O.nameMove(m))
            .click(function () {
              shiftToNewGameTree(O.force(m.gameTreePromise));
            })
        );
      } else {
        $('#cell_' + m.x + '_' + m.y)
          .click(function () {
            shiftToNewGameTree(O.force(m.gameTreePromise));
          });
      }
    });
  }

  /**
   * 新しくゲームを始めるためのボタンを表示
   */
  function setupUIToReset() {
    $('#preference-pane :input')
      .removeClass('disabled')
      .removeAttr('disabled');
  }

  /**
   * AIによって手を選択して進める
   */
  function selectMoveByAI(gameTree, ai) {
    $('#message').text('Now thinking...');
    setTimeout(
      function () {
        var start = Date.now();
        var newGameTree = O.force(ai.findTheBestMove(gameTree).gameTreePromise);
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

  /**
   * 結果を表示
   */
  function showWinner(board) {
    var r = O.judge(board);
    $('#message').text(
      r === 0 ?
        'The game ends in a draw.' :
        'The winner is ' + (r === 1 ? O.BLACK : O.WHITE) + '.'
    );
  }

  var playerTable = {};

  function makePlayer(playerType) {
    if (playerType === 'human') {
      return setupUIToSelectMove;
    } else {
      var ai = O.makeAI(playerType);
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
  function startNewGame() {
    $('#preference-pane :input')
      .addClass('disabled')
      .attr('disabled', 'disabled');
    playerTable[O.BLACK] = makePlayer($('#black-player-type').val());

    playerTable[O.WHITE] = makePlayer($('#white-player-type').val());

    shiftToNewGameTree(O.makeInitialGameTree());
  }




  // Startup {{{1

  $('#start-button').click(function () { startNewGame(); });
  setupUIToReset();
  drawGameBoard(O.makeInitialGameBoard(), '-', []);




  //}}}
})(othello);
// vim: expandtab softtabstop=2 shiftwidth=2 foldmethod=marker
