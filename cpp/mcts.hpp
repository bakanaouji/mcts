#ifndef MCTS_HPP
#define MCTS_HPP

#include <vector>
#include <random>
#include <emscripten/bind.h>
#include <emscripten/val.h>
#include "GameState.hpp"
#include "Move.hpp"
#include "Node.hpp"

class MCTS {
public:
    MCTS(int iterations = 1000);
    Move findBestMove(const emscripten::val& jsBoard, int player, bool wasPassed);
    std::vector<Move> getLegalMoves(const GameState& state) const;
    std::vector<int> getFlippableDiscs(const GameState& state, int x, int y) const;
    GameState makeMove(const GameState& state, const Move& move) const;
    int evaluateBoard(const std::vector<int>& board) const;
    
private:
    int maxIterations;
    std::mt19937 rng;
};

#endif // MCTS_HPP
