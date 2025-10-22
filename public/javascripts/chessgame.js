// chessgame.js
// Client-side Chess Game Logic

const socket = io();
const chess = new Chess();
const boardElement = document.querySelector(".chessBoard");

let draggedPiece = null;
let playerRole = null;
let sourceSquare = null;

// Board render karne ka function
const renderBoard = () => {
  const board = chess.board();
  boardElement.innerHTML = "";

  board.forEach((row, rowIndex) => {
    row.forEach((square, colIndex) => {
      const squareElement = document.createElement("div");
      squareElement.classList.add(
        "square",
        (rowIndex + colIndex) % 2 === 0 ? "light" : "dark"
      );
      squareElement.dataset.row = rowIndex;
      squareElement.dataset.col = colIndex;

      // Agar square me koi piece hai
      if (square) {
        const pieceElement = document.createElement("div");
        pieceElement.className = `piece ${square.color === 'w' ? 'white' : 'black'}`;
        pieceElement.textContent = getPieceUnicode(square);
        pieceElement.draggable = true;

        pieceElement.addEventListener("dragstart", (e) => {
          if (pieceElement.draggable) {
            draggedPiece = pieceElement;
            sourceSquare = { row: rowIndex, col: colIndex };
            e.dataTransfer.setData("text/plain", "");
          }
        });

        pieceElement.addEventListener("dragend", () => {
          draggedPiece = null;
          sourceSquare = null;
        });

        squareElement.appendChild(pieceElement);
      }

      // Allow drop
      squareElement.addEventListener("dragover", (e) => e.preventDefault());

      // Drop hone ke baad move send karo
      squareElement.addEventListener("drop", (e) => {
        e.preventDefault();
        if (draggedPiece) {
          const targetSquare = {
            row: parseInt(squareElement.dataset.row),
            col: parseInt(squareElement.dataset.col),
          };
          handleMove(sourceSquare, targetSquare);
        }
      });

      boardElement.appendChild(squareElement);
    });
  });
};

// ✅ Corrected move mapping
// Fix move coordinates (flip vertically)
const handleMove = (source, target) => {
  const move = {
    from: `${String.fromCharCode(97 + source.col)}${8 - source.row}`, // rank flipped
    to: `${String.fromCharCode(97 + target.col)}${8 - target.row}`,   // rank flipped
    promotion: "q",
  };

  socket.emit("move", move);
};


// Piece Unicode symbols
const getPieceUnicode = (piece) => {
  const pieces = {
    'k': '♔', 'q': '♕', 'r': '♖', 'b': '♗', 'n': '♘', 'p': '♙',
    'K': '♚', 'Q': '♛', 'R': '♜', 'B': '♝', 'N': '♞', 'P': '♟'
  };
  return pieces[piece.type];
};

// Socket Events
socket.on("playerRole", (role) => {
  playerRole = role;
  renderBoard();
});

socket.on("Spectator", () => {
  playerRole = "";
  renderBoard();
});

socket.on("boardState", (fen) => {
  chess.load(fen);
  renderBoard();
});

socket.on("move", (move) => {
  chess.move(move);
  renderBoard();
});

// Initial render
renderBoard();