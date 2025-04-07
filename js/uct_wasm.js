// UCT WebAssembly Interface
let uctModule = null;
let moduleLoadPromise = null;

async function initUCT() {
    if (!moduleLoadPromise) {
        moduleLoadPromise = new Promise((resolve, reject) => {
            if (typeof Module !== 'undefined') {
                Module.onRuntimeInitialized = () => {
                    uctModule = Module;
                    console.log("UCT WebAssembly module loaded successfully");
                    resolve(Module);
                };
            } else {
                reject(new Error("WebAssembly Module is not defined"));
            }
        });
    }
    return moduleLoadPromise;
}

async function makeUCTBasedAI(options) {
    if (!uctModule) {
        await initUCT();
    }
    const uct = new uctModule.UCT(options.level);
    
    return {
        findTheBestMove: function(gameTree) {
            const move = uct.findBestAction(gameTree.board, 
                                            gameTree.player === 'black' ? 1 : 2, 
                                            false);
            
            if (move.isPass) {
                return {
                    isPassingMove: true
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
                    y: move.y
                };
            }
        }
    };
}

// Initialize UCT module when the script loads
initUCT().catch(console.error);
