#ifndef NODE_HPP
#define NODE_HPP

#include <vector>
#include <memory>
#include "gametree.hpp"

class Node {
public:
    GameTree gameTree;
    std::vector<Move> untriedMoves;
    std::vector<std::unique_ptr<Node>> children;
    Node* parent;
    Move move;
    int wins;
    int visits;
    
    Node(const GameTree& gt, Node* p = nullptr, const Move& m = Move());
    Node* selectChild();
    Node* expandChild();
    double simulate();
    void backpropagate(double result);
    
private:
    double calculateUCB(int totalVisits) const;
};

#endif // NODE_HPP
