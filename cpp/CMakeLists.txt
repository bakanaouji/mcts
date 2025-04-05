cmake_minimum_required(VERSION 3.10)
project(uct_wasm)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Emscripten specific settings
set(CMAKE_EXECUTABLE_SUFFIX ".js")
set(EMSCRIPTEN_FLAGS "-s WASM=1 -s EXPORTED_RUNTIME_METHODS=['ccall','cwrap'] -s EXPORTED_FUNCTIONS=['_malloc','_free'] -s ALLOW_MEMORY_GROWTH=1 -O3 -s NO_EXIT_RUNTIME=1")

# Add Emscripten include directory
include_directories($ENV{EMSDK}/upstream/emscripten/system/include)
include_directories(${CMAKE_CURRENT_SOURCE_DIR})

# Add source files
set(SOURCES
    uct.cpp
    gamenode.cpp
)

add_executable(uct_wasm ${SOURCES})
set_target_properties(uct_wasm PROPERTIES 
    COMPILE_FLAGS "${EMSCRIPTEN_FLAGS}"
    LINK_FLAGS "${EMSCRIPTEN_FLAGS} -lembind")
