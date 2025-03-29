#include "gametree.hpp"

GameTree::GameTree(const GameState& s) : state(s) {
    moves = possibleMoveList(state);
}

std::vector<Move> GameTree::possibleMoveList(const GameState& state) {
    std::vector<Move> moves;
    
    for (int y = 0; y < BOARD_SIZE; y++) {
        for (int x = 0; x < BOARD_SIZE; x++) {
            std::vector<int> flippable;
            if (state.board[y * BOARD_SIZE + x] != EMPTY) continue;
            
            int opponent = state.currentPlayer == BLACK ? WHITE : BLACK;
            const int dx[] = {-1, -1, -1, 0, 0, 1, 1, 1};
            const int dy[] = {-1, 0, 1, -1, 1, -1, 0, 1};
            
            for (int dir = 0; dir < 8; dir++) {
                std::vector<int> temp;
                int nx = x + dx[dir];
                int ny = y + dy[dir];
                
                while (nx >= 0 && nx < BOARD_SIZE && ny >= 0 && ny < BOARD_SIZE) {
                    int idx = ny * BOARD_SIZE + nx;
                    if (state.board[idx] == opponent) {
                        temp.push_back(idx);
                    } else if (state.board[idx] == state.currentPlayer && !temp.empty()) {
                        flippable.insert(flippable.end(), temp.begin(), temp.end());
                        break;
                    } else {
                        break;
                    }
                    nx += dx[dir];
                    ny += dy[dir];
                }
            }
            
            if (!flippable.empty()) {
                moves.emplace_back(x, y);
            }
        }
    }
    
    if (moves.empty() && !state.wasPassed) {
        moves.emplace_back(-1, -1, true);
    }
    
    return moves;
}

std::vector<int> GameTree::getFlippableDiscs(const GameState& state, int x, int y) {
    if (state.board[y * BOARD_SIZE + x] != EMPTY) return {};
    
    std::vector<int> flippable;
    int opponent = state.currentPlayer == BLACK ? WHITE : BLACK;
    
    const int dx[] = {-1, -1, -1, 0, 0, 1, 1, 1};
    const int dy[] = {-1, 0, 1, -1, 1, -1, 0, 1};
    
    for (int dir = 0; dir < 8; dir++) {
        std::vector<int> temp;
        int nx = x + dx[dir];
        int ny = y + dy[dir];
        
        while (nx >= 0 && nx < BOARD_SIZE && ny >= 0 && ny < BOARD_SIZE) {
            int idx = ny * BOARD_SIZE + nx;
            if (state.board[idx] == opponent) {
                temp.push_back(idx);
            } else if (state.board[idx] == state.currentPlayer && !temp.empty()) {
                flippable.insert(flippable.end(), temp.begin(), temp.end());
                break;
            } else {
                break;
            }
            nx += dx[dir];
            ny += dy[dir];
        }
    }
    
    return flippable;
}
