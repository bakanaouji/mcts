#ifndef GAMETREE_HPP
#define GAMETREE_HPP

#include <vector>
#include "gamestate.hpp"
#include "move.hpp"

class GameTree {
public:
    GameState state;
    std::vector<Move> moves;
    
    GameTree(const GameState& s);
    static std::vector<Move> possibleMoveList(const GameState& state);
    static std::vector<int> getFlippableDiscs(const GameState& state, int x, int y);
};

#endif // GAMETREE_HPP
