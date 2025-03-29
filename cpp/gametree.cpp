#include "gametree.hpp"

GameTree::GameTree(const GameState& s) : state(s) {
    moves = possibleMoveList(state);
}

std::vector<Move> GameTree::possibleMoveList(const GameState& state) {
    std::vector<Move> moves;
    
    // 石を置くことができる行動を列挙していく
    for (int y = 0; y < BOARD_SIZE; y++) {
        for (int x = 0; x < BOARD_SIZE; x++) {
            auto turnableCells = turnableCellList(state, x, y);
            if (canAttack(turnableCells)) {
                moves.emplace_back(x, y);
            }
        }
    }
    
    // 必要であればパスする手も加えて返す
    return completePassingMove(moves, state);
}

std::vector<Move> GameTree::completePassingMove(const std::vector<Move>& attackingMoves, const GameState& state) {
    // どこかしらに石を置けるならそのまま返す
    if (!attackingMoves.empty()) {
        return attackingMoves;
    }
    // 前に相手がパスしてなかったら，パスできる
    else if (!state.wasPassed) {
        return { Move(-1, -1, true) };
    }
    // 前に相手がパスしていたら，ゲーム終了
    else {
        return {};
    }
}

bool GameTree::canAttack(const std::vector<int>& turnableCells) {
    return !turnableCells.empty();
}

int GameTree::nextPlayer(int player) {
    return player == BLACK ? WHITE : BLACK;
}

GameState GameTree::makeNextState(const GameState& state, int x, int y, const std::vector<int>& turnableCells) {
    GameState newState = state;
    newState.board[y * BOARD_SIZE + x] = state.currentPlayer;
    // ひっくり返せる石をすべてひっくり返す
    for (int idx : turnableCells) {
        newState.board[idx] = state.currentPlayer;
    }
    newState.currentPlayer = nextPlayer(state.currentPlayer);
    newState.wasPassed = false;
    return newState;
}

std::vector<int> GameTree::turnableCellList(const GameState& state, int x, int y) {
    std::vector<int> turnableCells;
    
    // すでに石が置いてあったら置くことはできないので，どこもひっくり返せない
    if (state.board[y * BOARD_SIZE + x] != EMPTY) {
        return turnableCells;
    }
    
    int opponent = nextPlayer(state.currentPlayer);
    
    for (int dx = -1; dx <= 1; dx++) {
        for (int dy = -1; dy <= 1; dy++) {
            // 石を置く位置はチェックする必要なし
            if (dx == 0 && dy == 0) {
                continue;
            }
            // 上下左右斜め方向に自分の石が存在していたら，
            // その間にある石をひっくり返せる
            for (int i = 1; i < BOARD_SIZE; i++) {
                int nx = x + i * dx;
                int ny = y + i * dy;
                
                // 盤面からはみ出ていたらチェックできない
                if (nx < 0 || nx >= BOARD_SIZE || ny < 0 || ny >= BOARD_SIZE) {
                    break;
                }
                
                const int idx = ny * BOARD_SIZE + nx;
                // 自分の石が存在していたら，その間にある石をひっくり返せる
                if (state.board[idx] == state.currentPlayer && i >= 2) {
                    for (int j = 1; j < i; j++) {
                        turnableCells.push_back((y + j * dy) * BOARD_SIZE + (x + j * dx));
                    }
                    break;
                }
                // 相手の石が存在していなかったら，チェックできない
                if (state.board[idx] != opponent) {
                    break;
                }
            }
        }
    }
    
    return turnableCells;
}
