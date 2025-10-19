// ...existing code...
import { useCallback, useMemo, useState } from 'react';

const SIZE = 8;
const EMPTY = 0;
const BLACK = 1;
const WHITE = 2;
const DIRS = [
  [-1, -1], [-1, 0], [-1, 1],
  [0, -1], /*self*/ [0, 1],
  [1, -1], [1, 0], [1, 1]
];

function createBoard() {
  const b = Array.from({ length: SIZE }, () => Array(SIZE).fill(EMPTY));
  b[3][3] = WHITE;
  b[3][4] = BLACK;
  b[4][3] = BLACK;
  b[4][4] = WHITE;
  return b;
}

function inBounds(r, c) {
  return r >= 0 && r < SIZE && c >= 0 && c < SIZE;
}

function flipsForMove(board, r, c, player) {
  if (board[r][c] !== EMPTY) return [];
  const opponent = player === BLACK ? WHITE : BLACK;
  const flips = [];
  for (const [dr, dc] of DIRS) {
    const line = [];
    let rr = r + dr, cc = c + dc;
    while (inBounds(rr, cc) && board[rr][cc] === opponent) {
      line.push([rr, cc]);
      rr += dr; cc += dc;
    }
    if (line.length > 0 && inBounds(rr, cc) && board[rr][cc] === player) {
      flips.push(...line);
    }
  }
  return flips;
}

export default function useOsero() {
  const [board, setBoard] = useState(() => createBoard());
  const [player, setPlayer] = useState(BLACK); // BLACK starts
  const [lastPass, setLastPass] = useState(false);

  const validMoves = useMemo(() => {
    const moves = new Set();
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        if (flipsForMove(board, r, c, player).length > 0) moves.add(`${r},${c}`);
      }
    }
    return moves;
  }, [board, player]);

  const counts = useMemo(() => {
    let b = 0, w = 0;
    for (let r = 0; r < SIZE; r++) for (let c = 0; c < SIZE; c++) {
      if (board[r][c] === BLACK) b++;
      if (board[r][c] === WHITE) w++;
    }
    return { black: b, white: w };
  }, [board]);

  const reset = useCallback(() => {
    setBoard(createBoard());
    setPlayer(BLACK);
    setLastPass(false);
  }, []);

  const pass = useCallback(() => {
    setPlayer((p) => (p === BLACK ? WHITE : BLACK));
    setLastPass((prev) => !prev);
  }, []);

  const put = useCallback((r, c) => {
    const flips = flipsForMove(board, r, c, player);
    if (flips.length === 0) return false;
    setBoard((prev) => {
      const copy = prev.map((row) => row.slice());
      copy[r][c] = player;
      for (const [fr, fc] of flips) copy[fr][fc] = player;
      return copy;
    });
    setPlayer((p) => (p === BLACK ? WHITE : BLACK));
    setLastPass(false);
    return true;
  }, [board, player]);

  const gameOver = useMemo(() => {
    const noMovesCurrent = validMoves.size === 0;
    
    const opponent = player === BLACK ? WHITE : BLACK;
    let oppHas = false;
    for (let r = 0; r < SIZE && !oppHas; r++) {
      for (let c = 0; c < SIZE; c++) {
        if (flipsForMove(board, r, c, opponent).length > 0) { oppHas = true; break; }
      }
    }
    return noMovesCurrent && !oppHas;
  }, [board, player, validMoves]);

  return {
    board,
    player,
    validMoves,
    counts,
    reset,
    pass,
    put,
    gameOver,
    BLACK,
    WHITE,
    EMPTY,
    SIZE,
  };
}
