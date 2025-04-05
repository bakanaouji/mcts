#ifndef UCT_HPP
#define UCT_HPP

#include <random>
#include <vector>
#include <emscripten/bind.h>
#include <emscripten/val.h>
#include "gamenode.hpp"
#include "move.hpp"

class UCT {
public:
    UCT(int iterations);
    Move findBestAction(const emscripten::val& jsBoard, int jsPlayer, bool wasPassed);

private:
    void rollout(GameNode* rootNode, const int rootPlayer);
    std::vector<GameNode*> selectChild(GameNode* node, const int rootPlayer);
    void expandChild(GameNode* node);
    double simulate(GameNode* node, const int rootPlayer);
    void backpropagate(std::vector<GameNode*> path, double reward);
    GameNode* selectChildByUCBValues(GameNode* node, const int rootPlayer);

    std::mt19937 mEngine;
    int mMaxIterations;
};

#endif // UCT_HPP