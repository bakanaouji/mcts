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
        
        // Selection - Match JavaScript version exactly
        while (node->untriedMoves.empty() && !node->children.empty()) {
            node = node->selectChild(player, node->gameTree.state.currentPlayer);
        }
        
        // Simulation
        double result = node->simulate(player);
        
        // Backpropagation
        node->backpropagate(result);
        
        // Node expansion strategy - Expand all untried moves when visits >= 40
        // This is a key difference in the JavaScript version
        if (node->visits >= 40) {
            while (!node->untriedMoves.empty()) {
                node->expandChild();
            }
        }
    }
    
    // Select best move based on visit count
    Node* bestChild = nullptr;
    int maxVisits = -1;
    
    for (const auto& child : rootNode.children) {
        if (child->visits > maxVisits) {
            maxVisits = child->visits;
            bestChild = child.get();
        }
    }
    
    return bestChild ? bestChild->move : Move(-1, -1, true);
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
