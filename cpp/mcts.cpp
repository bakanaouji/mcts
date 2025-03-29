#include "mcts.hpp"
#include <algorithm>
#include <ctime>
#include <random>


MCTS::MCTS(int iterations) : maxIterations(iterations), rng(std::random_device()()) {}

Move MCTS::findBestMove(const emscripten::val& jsBoard, int player, bool wasPassed) {
    std::vector<int> board;
    int length = jsBoard["length"].as<int>();
    for (int i = 0; i < length; i++) {
        std::string cellValue = jsBoard[i].as<std::string>();
        board.push_back(cellValue == "black" ? BLACK : (cellValue == "white" ? WHITE : EMPTY));
    }
    
    GameState rootState(board, player, wasPassed, player);  // rootPlayerを追加
    Node rootNode(rootState);
    
    for (int i = 0; i < maxIterations; i++) {
        Node* node = &rootNode;
        
        // Selection
        while (node->untriedMoves.empty() && !node->children.empty()) {
            node = node->selectChild();
        }
        
        // Expansion
        if (!node->untriedMoves.empty() && node->visits >= 40) {
            node = node->expandChild();
        }
        
        // Simulation
        double result = node->simulate();
        
        // Backpropagation
        node->backpropagate(result);
    }
    
    // Select best move based on visit count
    auto it = std::max_element(rootNode.children.begin(), rootNode.children.end(),
        [](const std::unique_ptr<Node>& a, const std::unique_ptr<Node>& b) {
            return a->visits < b->visits;
        });
    
    return it != rootNode.children.end() ? (*it)->move : Move(-1, -1, true);
}

std::vector<Move> MCTS::getLegalMoves(const GameState& state) const {
    std::vector<Move> moves;
    
    for (int y = 0; y < BOARD_SIZE; y++) {
        for (int x = 0; x < BOARD_SIZE; x++) {
            if (!getFlippableDiscs(state, x, y).empty()) {
                moves.emplace_back(x, y);
            }
        }
    }
    
    if (moves.empty() && !state.wasPassed) {
        moves.emplace_back(-1, -1, true);
    }
    
    return moves;
}

std::vector<int> MCTS::getFlippableDiscs(const GameState& state, int x, int y) const {
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

GameState MCTS::makeMove(const GameState& state, const Move& move) const {
    if (move.isPass) {
        return GameState(state.board, 
                        state.currentPlayer == BLACK ? WHITE : BLACK, 
                        true,
                        state.rootPlayer);  // rootPlayerを引き継ぐ
    }
    
    GameState newState = state;
    newState.currentPlayer = state.currentPlayer == BLACK ? WHITE : BLACK;
    newState.wasPassed = false;
    
    int idx = move.y * BOARD_SIZE + move.x;
    newState.board[idx] = state.currentPlayer;
    
    auto flippable = getFlippableDiscs(state, move.x, move.y);
    for (int flipIdx : flippable) {
        newState.board[flipIdx] = state.currentPlayer;
    }
    
    return newState;
}

int MCTS::evaluateBoard(const std::vector<int>& board) const {
    int blackCount = 0;
    int whiteCount = 0;
    
    for (int cell : board) {
        if (cell == BLACK) blackCount++;
        else if (cell == WHITE) whiteCount++;
    }
    
    if (blackCount > whiteCount) return 1;
    if (blackCount < whiteCount) return -1;
    return 0;
}

EMSCRIPTEN_BINDINGS(mcts_module) {
    emscripten::class_<Move>("Move")
        .constructor<int, int, bool>()
        .property("x", &Move::x)
        .property("y", &Move::y)
        .property("isPass", &Move::isPass);
        
    emscripten::class_<MCTS>("MCTS")
        .constructor<int>()
        .function("findBestMove", &MCTS::findBestMove);
}
