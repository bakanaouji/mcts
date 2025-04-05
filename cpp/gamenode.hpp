#ifndef GAMENODE_HPP
#define GAMENODE_HPP

#include <random>
#include "othellostate.hpp"

class GameNode {
public:
    GameNode(OthelloState state, const int parentEdge, const bool isTerminal);
    void generateChildren();
    std::shared_ptr<GameNode> getRandomChild(std::mt19937& gen);
    double reward(const int player) const;
    int getN() const { return mN; };
    double getQ() const { return mQ; };
    std::vector<std::shared_ptr<GameNode>>& getChildren() {return mChildren;}
    OthelloState& getState() { return mState; }
    int getParentEdge() const { return mParentEdge; }
    bool isTerminalNode() const { return mIsTerminal; };
    void setN(int n) { mN = n; };
    void setQ(double q) { mQ = q; };

private:
    std::shared_ptr<GameNode> makeNextNode(const int action);

    OthelloState mState;
    int mParentEdge;
    bool mIsTerminal;
    int mN;
    double mQ;
    std::vector<std::shared_ptr<GameNode>> mChildren;
};

#endif // GAMENODE_HPP