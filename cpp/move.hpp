#ifndef MOVE_HPP
#define MOVE_HPP

struct Move {
    int x;
    int y;
    bool isPass;
    
    Move(int _x = -1, int _y = -1, bool pass = false) : x(_x), y(_y), isPass(pass) {}
};

#endif // MOVE_HPP
