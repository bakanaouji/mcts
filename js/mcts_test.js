// Fixed random sequence for testing
let currentRandomIndex = 0;
const fixedRandomSequence = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];  // Fixed sequence for testing

// Override the random function used in MCTS
function random(max) {
    const value = fixedRandomSequence[currentRandomIndex % fixedRandomSequence.length];
    currentRandomIndex++;
    return value % max;
}

// オセロのルール実装
function nextPlayer(player) {
    return player === BLACK ? WHITE : BLACK;
}

function turnableCellList(board, x, y, player) {
    const turnableCells = [];
    if (board[ix(x, y)] !== "empty") return turnableCells;

    const opponent = player === BLACK ? "white" : "black";
    const playerColor = player === BLACK ? "black" : "white";

    // 8方向をチェック
    for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
            if (dx === 0 && dy === 0) continue;

            // その方向で返せる石を探す
            let temp = [];
            for (let i = 1; i < N; i++) {
                const nx = x + i * dx;
                const ny = y + i * dy;

                // 盤面の外に出たら終了
                if (nx < 0 || nx >= N || ny < 0 || ny >= N) break;

                const cell = board[ix(nx, ny)];
                if (cell === "empty") break;
                if (cell === opponent) {
                    temp.push(ix(nx, ny));
                } else if (cell === playerColor) {
                    if (temp.length > 0) {
                        turnableCells.push(...temp);
                    }
                    break;
                }
            }
        }
    }
    return turnableCells;
}

function makeNextBoard(board, x, y, turnableCells, player) {
    const newBoard = board.slice();
    const playerColor = player === BLACK ? "black" : "white";
    newBoard[ix(x, y)] = playerColor;
    // ひっくり返せる石をすべてひっくり返す
    for (const cell of turnableCells) {
        newBoard[cell] = playerColor;
    }
    return newBoard;
}

function getAvailableMoves(board, player, wasPassed = false) {
    const moves = [];
    // オセロのルールに従って有効な手を生成
    for (let y = 0; y < N; y++) {
        for (let x = 0; x < N; x++) {
            const turnableCells = turnableCellList(board, x, y, player);
            if (turnableCells.length > 0) {
                moves.push({
                    x: x,
                    y: y,
                    isPass: false,
                    gameTreePromise: delay(() => ({
                        board: makeNextBoard(board, x, y, turnableCells, player),
                        player: nextPlayer(player),
                        moves: [],
                        passing: false
                    }))
                });
            }
        }
    }

    // パスの処理
    if (moves.length === 0 && !wasPassed) {
        moves.push({
            isPass: true,
            gameTreePromise: delay(() => ({
                board: board.slice(),
                player: nextPlayer(player),
                moves: [],
                passing: true
            }))
        });
    }

    return moves;
}

function runTest(board, player, description) {
    console.log(`\nTesting ${description}`);

    // Create game tree for JavaScript version
    const jsGameTree = {
        board: board,
        player: player,
        moves: getAvailableMoves(board, player),
        passing: false
    };

    // Parameters for both implementations
    const searchIterations = 100;

    // Reset random sequence
    currentRandomIndex = 0;

    // Run JavaScript MCTS
    console.log("Running JavaScript MCTS...");
    const jsMCTS = makeMonteCarloTreeSearchBasedAIJs({ level: searchIterations });
    const jsMove = jsMCTS.findTheBestMove(jsGameTree);

    // Reset random sequence for C++ version
    currentRandomIndex = 0;

    // Run C++ MCTS
    console.log("Running C++ MCTS...");
    const cppMCTS = new Module.MCTS(searchIterations);
    const cppMove = cppMCTS.findBestMove(board, player, false);

    // Compare results
    console.log("JavaScript Move:", jsMove);
    console.log("C++ Move:", cppMove);

    // パスの場合の特別な比較
    const jsIsPass = jsMove.isPass || (jsMove.x === -1 && jsMove.y === -1);
    const cppIsPass = cppMove.isPass || (cppMove.x === -1 && cppMove.y === -1);

    const movesMatch = jsIsPass && cppIsPass || 
                      (!jsIsPass && !cppIsPass && 
                       jsMove.x === cppMove.x && 
                       jsMove.y === cppMove.y);
    console.log("Moves match:", movesMatch);
    
    return {
        result: movesMatch,
        jsMove: jsMove,
        cppMove: cppMove,
        board: board,
        description: description,
        player: player
    };
}

function testMCTSImplementations() {
    const results = [];
    
    // テストケース1: 初期盤面
    let board1 = new Array(64).fill("empty");
    board1[27] = "white"; board1[28] = "black";
    board1[35] = "black"; board1[36] = "white";
    results.push(runTest(board1, BLACK, "Initial board position"));

    // テストケース2: 中盤の競り合い
    let board2 = new Array(64).fill("empty");
    // 中央付近に石を配置
    board2[27] = "white"; board2[28] = "black"; board2[29] = "white";
    board2[35] = "black"; board2[36] = "white"; board2[37] = "black";
    board2[43] = "white"; board2[44] = "black"; board2[45] = "white";
    results.push(runTest(board2, BLACK, "Mid-game position"));

    // テストケース3: 戦略的な選択が必要な状況
    let board3 = new Array(64).fill("empty");
    // コーナー付近の争い
    board3[0] = "white"; 
    board3[1] = "black"; board3[2] = "black"; board3[3] = "black";
    board3[8] = "black"; board3[9] = "white";
    board3[16] = "black"; board3[17] = "white";
    results.push(runTest(board3, WHITE, "Strategic corner position"));

    // テストケース4: パスが必要な状況
    let board4 = new Array(64).fill("empty");
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            board4[ix(i, j)] = "black";
        }
    }
    board4[ix(3, 0)] = "white";
    board4[ix(3, 1)] = "white";
    board4[ix(3, 2)] = "white";
    results.push(runTest(board4, BLACK, "Position requiring pass"));

    return results;
}
