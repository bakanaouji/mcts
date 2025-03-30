#ifndef MOVE_HPP
#define MOVE_HPP

#include <vector>

struct Move {
    int x;
    int y;
    bool isPass;
    std::vector<int> turnableCells;
    
    Move(int _x = -1, int _y = -1, bool pass = false) 
        : x(_x), y(_y), isPass(pass) {}
    
    Move(int _x, int _y, const std::vector<int>& cells, bool pass = false)
        : x(_x), y(_y), isPass(pass), turnableCells(cells) {}
};

#endif // MOVE_HPP
