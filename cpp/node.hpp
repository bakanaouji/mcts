#ifndef NODE_HPP
#define NODE_HPP

#include <vector>
#include <memory>
#include "gamestate.hpp"
#include "move.hpp"

class Node {
public:
    GameState state;
    std::vector<Move> untriedMoves;
    std::vector<std::unique_ptr<Node>> children;
    Node* parent;
    Move move;
    int wins;
    int visits;
    
    Node(const GameState& s, Node* p = nullptr, const Move& m = Move());
    Node* selectChild();
    Node* expandChild();
    double simulate();
    void backpropagate(double result);
    
private:
    double calculateUCB(int totalVisits) const;
};

#endif // NODE_HPP
