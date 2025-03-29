#include "node.hpp"
#include "mcts.hpp"
#include <algorithm>
#include <random>
#include <cmath>

Node::Node(const GameState& s, Node* p, const Move& m)
    : state(s), parent(p), move(m), wins(0), visits(0) {
    untriedMoves = MCTS().getLegalMoves(state);
}

Node* Node::selectChild() {
    int totalVisits = visits;
    auto it = std::max_element(children.begin(), children.end(),
        [totalVisits, this](const std::unique_ptr<Node>& a, const std::unique_ptr<Node>& b) {
            return a->calculateUCB(totalVisits) < b->calculateUCB(totalVisits);
        });
    return it->get();
}

Node* Node::expandChild() {
    static std::random_device rd;
    static std::mt19937 gen(rd());
    
    if (untriedMoves.empty()) return nullptr;
    
    std::uniform_int_distribution<> dis(0, untriedMoves.size() - 1);
    int moveIndex = dis(gen);
    Move move = untriedMoves[moveIndex];
    untriedMoves.erase(untriedMoves.begin() + moveIndex);
    
    GameState nextState = MCTS().makeMove(state, move);
    auto newNode = std::make_unique<Node>(nextState, this, move);
    Node* nodePtr = newNode.get();
    children.push_back(std::move(newNode));
    return nodePtr;
}

double Node::simulate() {
    GameState currentState = state;
    MCTS mcts;
    
    while (true) {
        auto moves = mcts.getLegalMoves(currentState);
        if (moves.empty()) break;
        
        static std::random_device rd;
        static std::mt19937 gen(rd());
        std::uniform_int_distribution<> dis(0, moves.size() - 1);
        Move randomMove = moves[dis(gen)];
        currentState = mcts.makeMove(currentState, randomMove);
    }
    
    int result = mcts.evaluateBoard(currentState.board);
    return state.currentPlayer == BLACK ? (result + 1) / 2.0 : (1 - result) / 2.0;
}

void Node::backpropagate(double result) {
    Node* current = this;
    while (current != nullptr) {
        current->visits++;
        current->wins += result;
        current = current->parent;
    }
}

double Node::calculateUCB(int totalVisits) const {
    if (visits == 0) return std::numeric_limits<double>::infinity();
    
    bool isRootPlayer = (state.rootPlayer == state.currentPlayer);
    double exploitation = isRootPlayer ? 
        static_cast<double>(wins) / visits :
        static_cast<double>(visits - wins) / visits;
    
    double exploration = std::sqrt(2.0 * std::log(totalVisits) / visits);
    return exploitation + exploration;
}
