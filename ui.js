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
 * 選択できる行動をボタンで表示
 */
function setupUIToSelectAction(gameTree) {
    $('#message').text('Select your move.');
    gameTree.moves.forEach(function (m, i) {
        $('#console').append(
            $('<input type="button" class="btn">')
            .val(makeLavelForMove(m))
            .click(function() {
                shiftToNewGameTree(m.gameTree);
            })
        );
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
    var nt = {};
    nt[BLACK] = 0;
    nt[WHITE] = 0;

    for (var x = 0; x < N; ++x) {
        for (var y = 0; y < N; ++y) {
            ++nt[board[[x, y]]];
        }
    }

    $('#message').text(
        nt[BLACK] == nt[WHITE] ? 'The game ends in a draw.' :
        'The winner is ' + (nt[WHITE] < nt[BLACK] ? BLACK : WHITE) + '.'
    )
}