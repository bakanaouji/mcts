#!/bin/bash

# Ensure we're using the Homebrew-installed Emscripten
if ! command -v emcc &> /dev/null; then
    echo "Error: Emscripten not found. Please install it via Homebrew:"
    echo "brew install emscripten"
    exit 1
fi

echo "Using Emscripten version:"
emcc --version

# Clean and recreate build directory
rm -rf build
mkdir build
cd build

echo "Configuring CMake with Emscripten..."
if ! emcmake cmake ..; then
    echo "CMake configuration failed"
    exit 1
fi

echo "Building..."
if ! emmake make; then
    echo "Build failed"
    exit 1
fi

echo "Copying WebAssembly files..."
if ! cp mcts_wasm.* ..; then
    echo "Failed to copy WebAssembly files"
    exit 1
fi

# Go back to the original directory
cd ..

echo "Build complete! WebAssembly files are in the cpp directory."
