#ifndef STATE_HPP
#define STATE_HPP

#include <vector>

const int BOARD_SIZE = 8;
const int EMPTY = 0;
const int BLACK = 1;
const int WHITE = 2;

struct OthelloState {
    std::vector<int> board;
    int player;
    std::vector<int> possibleActions;
    bool wasPassedbyPreviousPlayer;
    int rootPlayer;

    OthelloState(const OthelloState& other): board(other.board.size()), player(other.player), possibleActions(other.possibleActions.size()), wasPassedbyPreviousPlayer(other.wasPassedbyPreviousPlayer), rootPlayer(other.rootPlayer) {
        std::copy(other.board.begin(), other.board.end(), board.begin());
        std::copy(other.possibleActions.begin(), other.possibleActions.end(), possibleActions.begin());
    }

    OthelloState(const std::vector<int>& b, int player, bool passed, int root) : board(b), player(player), wasPassedbyPreviousPlayer(passed), rootPlayer(root) {
        possibleActions = enumeratePossibleActions(*this);
    }

    static OthelloState makeNextState(OthelloState& state, const int index) {
        OthelloState newState = state;
        const int player = state.player;
        if (index == -1) {
            // if the player passed, just switch the player
            newState.wasPassedbyPreviousPlayer = true;
        } else {
            // otherwise, place the stone
            newState.board[index] = player;
            // flip all the turnable cells
            auto turnableCells = turnableCellList(state, index % BOARD_SIZE, index / BOARD_SIZE);
            for (int idx : turnableCells) {
                newState.board[idx] = player;
            }
            newState.wasPassedbyPreviousPlayer = false;
        }
        newState.player = player == BLACK ? WHITE : BLACK;
        newState.possibleActions = enumeratePossibleActions(newState);
        return newState;
    }

    static bool hasTurnableCells(const OthelloState& state, int x, int y) {
        // check if the cell is already occupied
        if (state.board[y * BOARD_SIZE + x] != EMPTY) {
            return false;
        }

        int opponent = state.player == BLACK ? WHITE : BLACK;
        for (int dx = -1; dx <= 1; dx++) {
            for (int dy = -1; dy <= 1; dy++) {
                if (dx == 0 && dy == 0) continue;
                for (int i = 1; i < BOARD_SIZE; i++) {
                    int nx = x + i * dx;
                    int ny = y + i * dy;
                    if (nx < 0 || nx >= BOARD_SIZE || ny < 0 || ny >= BOARD_SIZE) break;
                    const int idx = ny * BOARD_SIZE + nx;
                    if (state.board[idx] == state.player && i >= 2) {
                        return true;  // Found at least one turnable cell
                    }
                    if (state.board[idx] != opponent) break;
                }
            }
        }
        return false;
    }

    static std::vector<int> enumeratePossibleActions(const OthelloState& state) {
        std::vector<int> possibleMoves;
        for (int y = 0; y < BOARD_SIZE; y++) {
            for (int x = 0; x < BOARD_SIZE; x++) {
                const int idx = y * BOARD_SIZE + x;
                if (hasTurnableCells(state, x, y)) {
                    possibleMoves.push_back(idx);
                }
            }
        }
        if (!possibleMoves.empty()) {
            return possibleMoves;
        }
        // if no possible moves, check if the player can pass
        if (!state.wasPassedbyPreviousPlayer) {
            possibleMoves.push_back(-1); // -1 indicates a pass
        }
        return possibleMoves;
    }

    static std::vector<int> turnableCellList(const OthelloState& state, int x, int y) {
        std::vector<int> turnableCells;
        // check if the cell is already occupied
        if (state.board[y * BOARD_SIZE + x] != EMPTY) {
            return turnableCells;
        }

        int opponent = state.player == BLACK ? WHITE : BLACK;
        for (int dx = -1; dx <= 1; dx++) {
            for (int dy = -1; dy <= 1; dy++) {
                if (dx == 0 && dy == 0) continue;
                for (int i = 1; i < BOARD_SIZE; i++) {
                    int nx = x + i * dx;
                    int ny = y + i * dy;
                    if (nx < 0 || nx >= BOARD_SIZE || ny < 0 || ny >= BOARD_SIZE) break;
                    const int idx = ny * BOARD_SIZE + nx;
                    if (state.board[idx] == state.player && i >= 2) {
                        for (int j = 1; j < i; j++) {
                            turnableCells.push_back((y + j * dy) * BOARD_SIZE + (x + j * dx));
                        }
                        break;
                    }
                    if (state.board[idx] != opponent) break;
                }
            }
        }
        return turnableCells;
    }
};

#endif // STATE_HPP
