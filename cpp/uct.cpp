#include "uct.hpp"

UCT::UCT(int iterations) : mEngine(std::random_device()()), mMaxIterations(iterations) {}

Move UCT::findBestAction(const emscripten::val& jsBoard, int jsPlayer, bool wasPassed) {
    std::vector<int> board;
    int length = jsBoard["length"].as<int>();
    for (int i = 0; i < length; i++) {
        std::string cellValue = jsBoard[i].as<std::string>();
        board.push_back(cellValue == "black" ? BLACK : (cellValue == "white" ? WHITE : EMPTY));
    }

    // Convert JavaScript player (-1/1) to C++ player (1/2)
    int player = jsPlayer == 1 ? BLACK : WHITE;

    OthelloState rootState(board, player, wasPassed);
    GameNode rootNode(rootState, -1, false);

    for (int i = 0; i < mMaxIterations; ++i) {
        rollout(&rootNode, player);
    }

    // Select the child with the maximum visit count
    GameNode* bestChild = nullptr;
    int maxVisits = -1;
    for (auto& child : rootNode.getChildren()) {
        if (child->getN() > maxVisits) {
            maxVisits = child->getN();
            bestChild = child.get();
        }
    }

    int bestAction = bestChild ? bestChild->getParentEdge() : -1;
    return bestAction != -1 ? Move(bestAction % BOARD_SIZE, bestAction / BOARD_SIZE, false): Move(-1, -1, true);
}

// Perform a rollout from the root node
void UCT::rollout(GameNode* rootNode, const int rootPlayer) {
    auto path = selectChild(rootNode, rootPlayer);
    auto& leafNode = path.back();
    expandChild(leafNode);
    const double reward = simulate(leafNode, rootPlayer);
    backpropagate(path, reward);
}

// Find an unxplored descendent of a given node
std::vector<GameNode*> UCT::selectChild(GameNode* node, const int rootPlayer) {
    std::vector<GameNode*> path;
    while (true) {
        path.push_back(node);
        // node is either unexplored or terminal
        if (node->getChildren().empty() || node->isTerminalNode()) {
            return path;
        }
        // explore first the child that has not been explored
        std::vector<GameNode*> unexploredChildren;
        for (auto& child : node->getChildren()) {
            if (child->getN() == 0) {
                unexploredChildren.push_back(child.get());
            }
        }
        if (!unexploredChildren.empty()) {
            auto& n = unexploredChildren[unexploredChildren.size() - 1];
            unexploredChildren.pop_back();
            path.push_back(n);
            return path;
        }
        // if all children have been explored, select the child with the highest UCT value
        node = selectChildByUCBValues(node, rootPlayer);
    }
}

// Expand a child of a given node
void UCT::expandChild(GameNode* node) {
    // Expand the child node by adding a new child
    if (!node->getChildren().empty()) {
        return; // already expanded
    }
    node->generateChildren();
}

// Simulate a game via random moves
double UCT::simulate(GameNode* node, const int rootPlayer) {
    std::shared_ptr<GameNode> currentNode = std::shared_ptr<GameNode>(node, [](GameNode*) {}); // non-owning shared_ptr
    while (true) {
        if (currentNode->isTerminalNode()) {
            const double reward = currentNode->reward(rootPlayer);
            return reward;
        }
        std::shared_ptr<GameNode> nextNode = currentNode->getRandomChild(mEngine);
        currentNode = nextNode;
    }
}

// Backpropagate the result of a simulation up to the root node
void UCT::backpropagate(std::vector<GameNode*> path, double reward) {
    for (int i = path.size() - 1; i >= 0; --i) {
        auto& node = path[i];
        node->setN(node->getN() + 1);
        node->setQ(node->getQ() + reward);
    }
}

// Select a child node based on UCB values
GameNode* UCT::selectChildByUCBValues(GameNode* node, const int rootPlayer) {
    double maxValue = -std::numeric_limits<double>::infinity();
    GameNode* selectedChild = nullptr;
    const double logNvertex = std::log(node->getN());

    for (auto& child : node->getChildren()) {
        double value;
        if (child->getN() == 0) {
            value = std::numeric_limits<double>::infinity();
        } else {
            if (rootPlayer == node->getState().player) {
                value = child->getQ() / child->getN() + std::sqrt(2.0 * logNvertex / child->getN());
            } else {
                value = (child->getN() - child->getQ()) / child->getN() + std::sqrt(2.0 * logNvertex / child->getN());
            }
        }
        if (value > maxValue) {
            maxValue = value;
            selectedChild = child.get();
        }
    }

    return selectedChild;
}

EMSCRIPTEN_BINDINGS(uct_module) {
    emscripten::class_<Move>("Move")
        .constructor<int, int, bool>()
        .property("x", &Move::x)
        .property("y", &Move::y)
        .property("isPass", &Move::isPass);
        
    emscripten::class_<UCT>("UCT")
        .constructor<int>()
        .function("findBestAction", &UCT::findBestAction);
}
