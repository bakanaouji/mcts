#ifndef MCTS_HPP
#define MCTS_HPP

#include <vector>
#include <random>
#include <emscripten/bind.h>
#include <emscripten/val.h>
#include "gametree.hpp"
#include "node.hpp"

class MCTS {
public:
    MCTS(int iterations = 1000);
    Move findBestMove(const emscripten::val& jsBoard, int player, bool wasPassed);
    
private:
    int maxIterations;
};

#endif // MCTS_HPP
