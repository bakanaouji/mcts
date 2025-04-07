# Othello with WebAssembly MCTS

This is an Othello/Reversi game implementation with a Monte Carlo Tree Search (MCTS) AI implemented in C++ and compiled to WebAssembly for better performance.

## Building the WebAssembly Module

### Prerequisites

- CMake
- Emscripten (installed via Homebrew)
- A C++ compiler

### Build Steps

1. Build the WebAssembly module:
   ```bash
   cd cpp
   ./build.sh
   ```
2. The WebAssembly files (mcts_wasm.js and mcts_wasm.wasm) will be generated in the cpp directory

## Running the Game

1. Serve the project directory using a local web server
2. Open index.html in your browser
3. Select player types (Human, MCTS_WASM_1024, or MCTS_WASM_4096)
4. Click "Start a new game"

## Implementation Details

The project uses two MCTS implementations:
- A JavaScript implementation (original)
- A C++ implementation compiled to WebAssembly (new, faster version)

The WebAssembly version provides better performance by:
- Using native C++ speed for tree traversal and simulation
- Optimizing memory usage with proper data structures
- Reducing garbage collection overhead
- Utilizing WebAssembly's near-native performance

## Project Structure

- `/cpp` - C++ MCTS implementation and build files
- `/js` - JavaScript game logic and WebAssembly interface
- `/css` - Stylesheets
- `index.html` - Main game page
