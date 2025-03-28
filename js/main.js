$('#start-button').click(function () { startNewGame().catch(console.error); });
setupUIToReset();
drawGameBoard(makeInitialGameBoard(), '-', []);
