#ifndef GAMESTATE_HPP
#define GAMESTATE_HPP

#include <vector>

const int BOARD_SIZE = 8;
const int EMPTY = 0;
const int BLACK = 1;
const int WHITE = 2;

struct GameState {
    std::vector<int> board;
    int currentPlayer;
    bool wasPassed;
    int rootPlayer;  // 追加: ルートプレイヤーを保持
    
    GameState() : board(BOARD_SIZE * BOARD_SIZE, EMPTY), currentPlayer(BLACK), wasPassed(false), rootPlayer(BLACK) {}
    GameState(const std::vector<int>& b, int player, bool passed, int root) 
        : board(b), currentPlayer(player), wasPassed(passed), rootPlayer(root) {}
};

#endif // GAMESTATE_HPP
