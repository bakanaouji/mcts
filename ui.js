/**
 * ボタンのラベルを決定
 */
function makeLavelForMove(move) {
    if (move.isPassingMove) {
        return 'Pass';
    } else {
        return 'abcdefgh'[move.x] + '12345678'[move.y];
    }
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
                .val(makeLavelForMove(m))
                .click(function () {
                    shiftToNewGameTree(force(m.gameTreePromise));
                })
            );
        } else {
            $('#cell_' + m.x + '_' + m.y)
            .click(function () {
                shiftToNewGameTree(force(m.gameTreePromise));
            });
        }
    });
}

/**
 * 新しくゲームを始めるためのボタンを表示
 */
function setupUIToReset() {
    $('#console').append(
        $('<input type="button" class="btn">')
        .val('Start a new game')
        .click(function() {
            resetGame();
        })
    );
}

/**
 * UIをリセットする
 */
function resetUI() {
    $('#message').empty();
    $('#console').empty();
}

/**
 * 結果を表示
 */
function showWinner(board) {
    var r = judge(board);
    $('#message').text(
        r === 0 ?
        'The game ends in a draw.' :
        'The winner is ' + (r === 1 ? BLACK : WHITE) + '.'
    );
}