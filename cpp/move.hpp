#ifndef MOVE_HPP
#define MOVE_HPP

#include <vector>
#include <functional>
#include <memory>
#include "gamestate.hpp"

class GameTree;

struct Move {
    int x;
    int y;
    bool isPass;
    std::vector<int> turnableCells;
    std::function<std::shared_ptr<GameTree>()> nextGameTreePromise;
    
    Move(int _x = -1, int _y = -1, bool pass = false) 
        : x(_x), y(_y), isPass(pass) {}
    
    Move(int _x, int _y, const std::vector<int>& cells, bool pass = false)
        : x(_x), y(_y), isPass(pass), turnableCells(cells) {}
        
    Move(int _x, int _y, const std::vector<int>& cells, 
         std::function<std::shared_ptr<GameTree>()> promise, bool pass = false)
        : x(_x), y(_y), isPass(pass), turnableCells(cells), nextGameTreePromise(promise) {}
};

#endif // MOVE_HPP
