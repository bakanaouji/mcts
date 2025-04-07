#include "gamenode.hpp"

GameNode::GameNode(OthelloState state, const int parentEdge, const int previousPlayer, bool isTerminal) : mState(state), mParentEdge(parentEdge), mPreviousPlayer(previousPlayer), mIsTerminal(isTerminal), mN(0), mQ(0.0), mChildren() {
}

void GameNode::generateChildren() {
    // if the game is over, there are no children
    if (mIsTerminal) {
        return;
    }
    // otherwise, generate all possible children
    for (const int action : mState.possibleActions) {
        mChildren.push_back(makeNextNode(action));
    }
}

std::shared_ptr<GameNode> GameNode::getRandomChild(std::mt19937& gen) {
    if (mIsTerminal) {
        return nullptr;
    }
    std::uniform_int_distribution<> dis(0, mState.possibleActions.size() - 1);
    const int index = dis(gen);
    return makeNextNode(mState.possibleActions[index]);
}

double GameNode::reward(const int player) const {
    if (!mIsTerminal) {
        std::runtime_error("Reward is not defined in non-terminal node");
    }

    int blackCount = 0, whiteCount = 0;
    for (int cell : mState.board) {
        if (cell == BLACK) blackCount++;
        else if (cell == WHITE) whiteCount++;
    }
    
    const int winPlayer = blackCount > whiteCount ? 1 : (blackCount < whiteCount ? 2 : 0);
    if (winPlayer == 0) {
        return 0; // draw
    }
    if (winPlayer == player) {
        return 0.5; // win
    }
    return -0.5; // lose
}

std::shared_ptr<GameNode> GameNode::makeNextNode(const int action) {
    const int previousPlayer = mState.player;
    auto newState = OthelloState::makeNextState(mState, action);
    const bool isTerminal = newState.possibleActions.size() == 0;
    return std::make_shared<GameNode>(newState, action, previousPlayer, isTerminal);
}

