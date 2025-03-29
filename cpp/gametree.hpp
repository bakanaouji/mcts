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
    static std::vector<Move> completePassingMove(const std::vector<Move>& attackingMoves, const GameState& state);
    static std::vector<int> turnableCellList(const GameState& state, int x, int y);
    static bool canAttack(const std::vector<int>& turnableCells);
    static int nextPlayer(int player);
    static GameState makeNextState(const GameState& state, int x, int y, const std::vector<int>& turnableCells);
};

#endif // GAMETREE_HPP
