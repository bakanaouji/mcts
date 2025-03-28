// MCTS WebAssembly Interface
let mctsModule = null;
let moduleLoadPromise = null;

async function initMCTS() {
    if (!moduleLoadPromise) {
        moduleLoadPromise = new Promise((resolve, reject) => {
            if (typeof Module !== 'undefined') {
                Module.onRuntimeInitialized = () => {
                    mctsModule = Module;
                    console.log("MCTS WebAssembly module loaded successfully");
                    resolve(Module);
                };
            } else {
                reject(new Error("WebAssembly Module is not defined"));
            }
        });
    }
    return moduleLoadPromise;
}

async function makeMonteCarloTreeSearchBasedAI(options) {
    if (!mctsModule) {
        await initMCTS();
    }
    const mcts = new mctsModule.MCTS(options.level);
    
    return {
        findTheBestMove: function(gameTree) {
            const move = mcts.findBestMove(gameTree.board, 
                                         gameTree.player === 'black' ? 1 : 2, 
                                         false);
            
            if (move.isPass) {
                return {
                    isPassingMove: true,
                    gameTreePromise: delay(() => makeGameTree(
                        gameTree.board,
                        nextPlayer(gameTree.player),
                        true
                    ))
                };
            } else {
                const turnableCells = turnableCellList(
                    gameTree.board,
                    move.x,
                    move.y,
                    gameTree.player
                );
                
                return {
                    x: move.x,
                    y: move.y,
                    gameTreePromise: delay(() => makeGameTree(
                        makeNextBoard(
                            gameTree.board,
                            move.x,
                            move.y,
                            turnableCells,
                            gameTree.player
                        ),
                        nextPlayer(gameTree.player),
                        false
                    ))
                };
            }
        }
    };
}

// Initialize MCTS module when the script loads
initMCTS().catch(console.error);
