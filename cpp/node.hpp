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
    double wins;
    int visits;
    
    Node(const GameTree& gt, Node* p = nullptr, const Move& m = Move());
    Node* selectChild(int rootPlayer, int nodePlayer);
    Node* expandChild();
    double simulate(int rootPlayer);
    void backpropagate(double result);
    void update(double result);
};

#endif // NODE_HPP
