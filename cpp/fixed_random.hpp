#ifndef FIXED_RANDOM_HPP
#define FIXED_RANDOM_HPP

#include <vector>

class FixedRandom {
public:
    static void setSequence(const std::vector<int>& sequence) {
        fixedSequence = sequence;
        currentIndex = 0;
    }
    
    static int getNext(int max) {
        int value = fixedSequence[currentIndex % fixedSequence.size()];
        currentIndex++;
        return value % max;
    }
    
private:
    static std::vector<int> fixedSequence;
    static size_t currentIndex;
};

// Define static members
std::vector<int> FixedRandom::fixedSequence = {0, 1, 2, 3, 4, 5, 6, 7, 8, 9};
size_t FixedRandom::currentIndex = 0;

#endif // FIXED_RANDOM_HPP
