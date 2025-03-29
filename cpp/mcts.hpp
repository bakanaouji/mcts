#ifndef MCTS_HPP
#define MCTS_HPP

#include <vector>
#include <cmath>
#include <memory>
#include <random>
#include <emscripten/bind.h>
#include <emscripten/val.h>

const int BOARD_SIZE = 8;
const int EMPTY = 0;
const int BLACK = 1;
const int WHITE = 2;

struct GameState {
    std::vector<int> board;
    int currentPlayer;
    bool wasPassed;
    int rootPlayer;  // 追加: ルートプレイヤーを保持
    
    GameState() : board(BOARD_SIZE * BOARD_SIZE, EMPTY), currentPlayer(BLACK), wasPassed(false), rootPlayer(BLACK) {}
    GameState(const std::vector<int>& b, int player, bool passed, int root) 
        : board(b), currentPlayer(player), wasPassed(passed), rootPlayer(root) {}
};

struct Move {
    int x;
    int y;
    bool isPass;
    
    Move(int _x = -1, int _y = -1, bool pass = false) : x(_x), y(_y), isPass(pass) {}
};

class Node {
public:
    GameState state;
    std::vector<Move> untriedMoves;
    std::vector<std::unique_ptr<Node>> children;
    Node* parent;
    Move move;
    int wins;
    int visits;
    
    Node(const GameState& s, Node* p = nullptr, const Move& m = Move());
    Node* selectChild();
    Node* expandChild();
    double simulate();
    void backpropagate(double result);
    
private:
    double calculateUCB(int totalVisits) const;
};

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
