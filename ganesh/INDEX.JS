const board = document.getElementById("chessboard");
const status = document.getElementById("status");
const resetButton = document.getElementById("reset");
const whiteCapturedContainer = document.getElementById("whiteCaptured");
const blackCapturedContainer = document.getElementById("blackCaptured");

const pieceSymbols = {
    "r": "♜", // Black pieces
    "n": "♞",
    "b": "♝",
    "q": "♛",
    "k": "♚",
    "p": "♟",
    "R": "♖", // White pieces
    "N": "♘",
    "B": "♗",
    "Q": "♕",
    "K": "♔",
    "P": "♙",
};

let boardState = [
    "r", "n", "b", "q", "k", "b", "n", "r",
    "p", "p", "p", "p", "p", "p", "p", "p",
    "", "", "", "", "", "", "", "",
    "", "", "", "", "", "", "", "",
    "", "", "", "", "", "", "", "",
    "", "", "", "", "", "", "", "",
    "P", "P", "P", "P", "P", "P", "P", "P",
    "R", "N", "B", "Q", "K", "B", "N", "R"
];

let currentPlayer = 'white';
let selectedSquare = null;
let capturedPieces = {
    white: [],
    black: []
};

function createBoard() {
    board.innerHTML = ''; // Clear previous board
    boardState.forEach((piece, index) => {
        const square = document.createElement("div");
        square.classList.add("square");
        square.setAttribute("data-index", index);
        square.innerText = pieceSymbols[piece] || "";
        square.addEventListener("click", () => selectSquare(square));
        board.appendChild(square);
    });
    updateStatus();
    updateCapturedPieces();
}

function selectSquare(square) {
    const index = square.getAttribute("data-index");
    
    if (selectedSquare) {
        const targetIndex = index;
        const fromIndex = selectedSquare.getAttribute("data-index");

        if (isValidMove(fromIndex, targetIndex)) {
            const capturedPiece = boardState[targetIndex]; // Get the captured piece
            if (capturedPiece) { // If there's a piece to capture
                addCapturedPiece(capturedPiece); // Add it to the captured pieces
            }
            makeMove(fromIndex, targetIndex);
            selectedSquare.classList.remove("highlight");
            selectedSquare = null;
            switchPlayer();
        } else {
            selectedSquare.classList.remove("highlight");
            selectedSquare = null;
        }
    } else {
        if (square.innerText && isCurrentPlayer(square.innerText)) {
            selectedSquare = square;
            selectedSquare.classList.add("highlight");
        }
    }
}

function addCapturedPiece(piece) {
    if (piece) {
        if (piece === piece.toUpperCase()) { // White piece
            capturedPieces.white.push(piece);
        } else { // Black piece
            capturedPieces.black.push(piece);
        }
    }
    updateCapturedPieces();
}

function updateCapturedPieces() {
    whiteCapturedContainer.innerHTML = '<strong>White:</strong> ' + capturedPieces.white.map(piece => pieceSymbols[piece]).join(" ");
    blackCapturedContainer.innerHTML = '<strong>Black:</strong> ' + capturedPieces.black.map(piece => pieceSymbols[piece]).join(" ");
}

function isCurrentPlayer(piece) {
    const isWhite = piece === piece.toUpperCase(); // Check if the piece is white
    const isBlack = piece === piece.toLowerCase(); // Check if the piece is black
    return (currentPlayer === 'white' && isWhite) || (currentPlayer === 'black' && isBlack);
}

function isValidMove(fromIndex, toIndex) {
    const fromPiece = boardState[fromIndex];
    const toPiece = boardState[toIndex];
    const fromRow = Math.floor(fromIndex / 8);
    const fromCol = fromIndex % 8;
    const toRow = Math.floor(toIndex / 8);
    const toCol = toIndex % 8;

    if (fromPiece === "") return false; // No piece to move

    // Basic rules: Check if the piece belongs to the current player and movement validation
    if (isCurrentPlayer(fromPiece) && (toPiece === "" || !isCurrentPlayer(toPiece))) {
        switch (fromPiece.toLowerCase()) {
            case "p": // Pawn
                const direction = currentPlayer === 'white' ? -1 : 1;
                if (fromCol === toCol && toRow === fromRow + direction && toPiece === "") {
                    return true; // Move forward
                } else if (Math.abs(fromCol - toCol) === 1 && toRow === fromRow + direction && toPiece !== "") {
                    return true; // Capture
                }
                break;

            case "r": // Rook
                if (fromCol === toCol || fromRow === toRow) {
                    if (!isPathBlocked(fromIndex, toIndex)) {
                        return true; // Straight line
                    }
                }
                break;

            case "n": // Knight
                if ((Math.abs(fromRow - toRow) === 2 && Math.abs(fromCol - toCol) === 1) ||
                    (Math.abs(fromRow - toRow) === 1 && Math.abs(fromCol - toCol) === 2)) {
                    return true; // L shape
                }
                break;

            case "b": // Bishop
                if (Math.abs(fromRow - toRow) === Math.abs(fromCol - toCol)) {
                    if (!isPathBlocked(fromIndex, toIndex)) {
                        return true; // Diagonal
                    }
                }
                break;

            case "q": // Queen
                if ((Math.abs(fromRow - toRow) === Math.abs(fromCol - toCol)) || 
                    (fromRow === toRow || fromCol === toCol)) {
                    if (!isPathBlocked(fromIndex, toIndex)) {
                        return true; // Diagonal or straight
                    }
                }
                break;

            case "k": // King
                if (Math.abs(fromRow - toRow) <= 1 && Math.abs(fromCol - toCol) <= 1) {
                    return true; // One square in any direction
                }
                break;
        }
    }
    return false;
}

function isPathBlocked(fromIndex, toIndex) {
    const fromRow = Math.floor(fromIndex / 8);
    const fromCol = fromIndex % 8;
    const toRow = Math.floor(toIndex / 8);
    const toCol = toIndex % 8;

    if (fromRow === toRow) { // Horizontal movement
        const step = fromCol < toCol ? 1 : -1;
        for (let c = fromCol + step; c !== toCol; c += step) {
            if (boardState[fromRow * 8 + c] !== "") return true; // Path blocked
        }
    } else if (fromCol === toCol) { // Vertical movement
        const step = fromRow < toRow ? 1 : -1;
        for (let r = fromRow + step; r !== toRow; r += step) {
            if (boardState[r * 8 + fromCol] !== "") return true; // Path blocked
        }
    } else { // Diagonal movement
        const rowStep = fromRow < toRow ? 1 : -1;
        const colStep = fromCol < toCol ? 1 : -1;
        let r = fromRow + rowStep;
        let c = fromCol + colStep;
        while (r !== toRow && c !== toCol) {
            if (boardState[r * 8 + c] !== "") return true; // Path blocked
            r += rowStep;
            c += colStep;
        }
    }
    return false; // Path is clear
}

function makeMove(fromIndex, toIndex) {
    boardState[toIndex] = boardState[fromIndex];
    boardState[fromIndex] = ""; // Empty the original square
    createBoard(); // Refresh the board
}

function switchPlayer() {
    currentPlayer = currentPlayer === 'white' ? 'black' : 'white';
    updateStatus();
}

function updateStatus() {
    status.innerText = `${currentPlayer.charAt(0).toUpperCase() + currentPlayer.slice(1)}'s turn`;
}

resetButton.addEventListener("click", resetGame);

function resetGame() {
    boardState = [
        "r", "n", "b", "q", "k", "b", "n", "r",
        "p", "p", "p", "p", "p", "p", "p", "p",
        "", "", "", "", "", "", "", "",
        "", "", "", "", "", "", "", "",
        "", "", "", "", "", "", "", "",
        "", "", "", "", "", "", "", "",
        "P", "P", "P", "P", "P", "P", "P", "P",
        "R", "N", "B", "Q", "K", "B", "N", "R"
    ];
    currentPlayer = 'white';
    capturedPieces = { white: [], black: [] }; // Reset captured pieces
    createBoard();
}

createBoard();