#include "node.hpp"
#include "mcts.hpp"
#include <algorithm>
#include "fixed_random.hpp"
#include <cmath>

Node::Node(const GameTree& gt, Node* p, const Move& m)
    : gameTree(gt), parent(p), move(m), wins(0), visits(0) {
    untriedMoves = gameTree.moves;
}

Node* Node::selectChild(int rootPlayer, int nodePlayer) {
    int totalVisits = visits;
    double maxValue = -std::numeric_limits<double>::infinity();
    Node* selectedChild = nullptr;

    for (const auto& child : children) {
        double value;
        if (child->visits == 0) {
            value = 1e10;
        } else {
            if (rootPlayer == nodePlayer) {
                value = static_cast<double>(child->wins) / child->visits +
                       std::sqrt(2.0 * std::log(totalVisits) / child->visits);
            } else {
                value = static_cast<double>(child->visits - child->wins) / child->visits +
                       std::sqrt(2.0 * std::log(totalVisits) / child->visits);
            }
        }
        
        if (value > maxValue) {
            maxValue = value;
            selectedChild = child.get();
        }
    }
    
    return selectedChild;
}

Node* Node::expandChild() {
    if (untriedMoves.empty()) return nullptr;
    
    int moveIndex = FixedRandom::getNext(untriedMoves.size());
    Move move = untriedMoves[moveIndex];
    untriedMoves.erase(untriedMoves.begin() + moveIndex);
    
    // Force the game tree promise to get the next state
    std::shared_ptr<GameTree> nextTree = move.nextGameTreePromise();
    auto newNode = std::make_unique<Node>(*nextTree, this, move);
    Node* nodePtr = newNode.get();
    children.push_back(std::move(newNode));
    return nodePtr;
}

double Node::simulate(int rootPlayer) {
    GameState currentState = gameTree.state;
    
    while (true) {
        GameTree currentTree(currentState);
        if (currentTree.moves.empty()) break;
        
        int moveIndex = FixedRandom::getNext(currentTree.moves.size());
        Move randomMove = currentTree.moves[moveIndex];
        
        // Force the game tree promise to get the next state
        std::shared_ptr<GameTree> nextTree = randomMove.nextGameTreePromise();
        currentState = nextTree->state;
    }
    
    int blackCount = 0, whiteCount = 0;
    for (int cell : currentState.board) {
        if (cell == BLACK) blackCount++;
        else if (cell == WHITE) whiteCount++;
    }
    
    int judge = blackCount > whiteCount ? 1 : (blackCount < whiteCount ? -1 : 0);
    return (judge * (rootPlayer == BLACK ? 1 : -1)) / 2.0 + 0.5;
}

void Node::backpropagate(double result) {
    Node* current = this;
    while (current != nullptr) {
        current->update(result);
        current = current->parent;
    }
}

void Node::update(double result) {
    wins += result;
    visits += 1;
}
