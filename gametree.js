/**
 * ある盤面からのゲーム木を作成して取得
 */
function makeGameTree(board, player, wasPassed) {
    return {
        board: board,
        player: player,
        moves: possibleActionList(board, player, wasPassed)
    };
}