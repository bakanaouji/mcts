#include "mcts.hpp"
#include <algorithm>
#include <ctime>
#include <random>


MCTS::MCTS(int iterations) : maxIterations(iterations) {}

Move MCTS::findBestMove(const emscripten::val& jsBoard, int player, bool wasPassed) {
    std::vector<int> board;
    int length = jsBoard["length"].as<int>();
    for (int i = 0; i < length; i++) {
        std::string cellValue = jsBoard[i].as<std::string>();
        board.push_back(cellValue == "black" ? BLACK : (cellValue == "white" ? WHITE : EMPTY));
    }
    
    GameState rootState(board, player, wasPassed, player);
    GameTree rootTree(rootState);
    Node rootNode(rootTree);
    
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
