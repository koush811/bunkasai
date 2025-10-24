import React, { useRef, useEffect, useState } from 'react';
import '../teto/teto.css';

const COLS = 10;
const ROWS = 20;
const BLOCK_SIZE = 24;
const LEFT_HOLD_WIDTH = 6;

const mino = [
  [[0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0], [0, 0, 0, 0]], // I
  [[1, 1], [1, 1]], // O
  [[0, 1, 0], [1, 1, 1], [0, 0, 0]], // T
  [[0, 1, 1], [1, 1, 0], [0, 0, 0]], // S
  [[1, 1, 0], [0, 1, 1], [0, 0, 0]], // Z
  [[1, 0, 0], [1, 1, 1], [0, 0, 0]], // J
  [[0, 0, 1], [1, 1, 1], [0, 0, 0]]  // L
];

const COLORS = ['cyan', 'yellow', 'purple', 'green', 'red', 'blue', 'orange'];

const SRS_KICKS_I = [
  [[0, 0], [-2, 0], [1, 0], [-2, 1], [1, -2]],
  [[0, 0], [-1, 0], [2, 0], [-1, -2], [2, 1]],
  [[0, 0], [2, 0], [-1, 0], [2, -1], [-1, 2]],
  [[0, 0], [1, 0], [-2, 0], [1, 2], [-2, -1]]
];

const SRS_KICKS_OTHERS = [
  [[0, 0], [-1, 0], [-1, 1], [0, -2], [-1, -2]],
  [[0, 0], [1, 0], [1, -1], [0, 2], [1, 2]],
  [[0, 0], [1, 0], [1, 1], [0, -2], [1, -2]],
  [[0, 0], [-1, 0], [-1, -1], [0, 2], [-1, 2]]
];

function rotateByCenter(shape, cx, cy, isCCW = false) {
  const N = shape.length;
  let newShape = Array.from({ length: N }, () => Array(N).fill(0));
  for (let y = 0; y < N; y++) {
    for (let x = 0; x < N; x++) {
      if (!shape[y][x]) continue;
      let dx = x - cx, dy = y - cy, rx, ry;
      if (!isCCW) {
        rx = dy;
        ry = -dx;
      } else {
        rx = -dy;
        ry = dx;
      }
      let nx, ny;
      if (N === 4) {
        nx = Math.floor(cx + rx + 0.01);
        ny = Math.floor(cy + ry + 0.01);
      } else {
        nx = Math.round(cx + rx);
        ny = Math.round(cy + ry);
      }
      if (ny >= 0 && ny < N && nx >= 0 && nx < N) {
        newShape[ny][nx] = shape[y][x];
      }
    }
  }
  return newShape;
}

function rotate(shape, minoIndex) {
  if (minoIndex === 0) return rotateByCenter(shape, 1.5, 1.5, false);
  if (minoIndex === 1) return shape.map(row => row.slice());
  return rotateByCenter(shape, 1, 1, false);
}

function rotateCCW(shape, minoIndex) {
  if (minoIndex === 0) return rotateByCenter(shape, 1.5, 1.5, true);
  if (minoIndex === 1) return shape.map(row => row.slice());
  return rotateByCenter(shape, 1, 1, true);
}

export default function TetrisGame() {
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);

  const [score, setScore] = useState(0);
  const [timerText, setTimerText] = useState('00:00');
  const [isGameOver, setIsGameOver] = useState(false);
  const [isCleared, setIsCleared] = useState(false);
  const [isPaused, setIsPaused] = useState(true);
  const [maxScore, setMaxScore] = useState(4000);

  const maxScoreRef = useRef(maxScore);
  const boardRef = useRef(Array.from({ length: ROWS }, () => Array(COLS).fill(0)));
  const minoQueueRef = useRef([]);
  const currentRef = useRef({
    shape: null,
    color: null,
    x: 3,
    y: 0,
    rotation: 0,
    index: 0,
    holdUsed: false,
  });
  const holdRef = useRef({
    shape: null,
    color: null,
    rotation: 0,
    index: null,
  });
  const timerRef = useRef(null);
const gameIntervalRef = useRef(null);
const lockTimerRef = useRef(null);
const startTimestampRef = useRef(null)
  const dropSpeedRef = useRef(400);
  const pauseElapsedRef = useRef(0);
  const isPausedRef = useRef(false);
  const isGameOverRef = useRef(false);

  // Synchronize maxScore state to ref
  useEffect(() => {
  maxScoreRef.current = maxScore;
}, [maxScore]);
  // Check clear condition on score change
  useEffect(() => {
  if (score >= maxScoreRef.current) {
    clearInterval(gameIntervalRef.current);
    setIsCleared(true);
    stopTimer();
    draw();
  }
}, [score]);

  // Utility functions

  function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      let j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  function refillQueue() {
    const bag = shuffle([...Array(mino.length).keys()]);
    minoQueueRef.current.push(...bag);
  }

  function updateNextMino() {
    if (minoQueueRef.current.length === 0) refillQueue();
    const nextIdx = minoQueueRef.current[0];
    const nextInfo = {
      index: nextIdx,
      shape: mino[nextIdx],
      color: COLORS[nextIdx],
    };
    nextMinoRef.current = nextInfo;
    draw();
  }

  function newTetromino() {
    if (minoQueueRef.current.length === 0) refillQueue();
    const idx = minoQueueRef.current.shift();
    const shape = mino[idx];
    const color = COLORS[idx];
    currentRef.current = { shape, color, x: 3, y: 0, rotation: 0, index: idx, holdUsed: false };
    updateNextMino();
    if (minoQueueRef.current.length === 0) refillQueue();
    if (collision(currentRef.current.x, currentRef.current.y, currentRef.current.shape)) {
      setIsGameOver(true);
      isGameOverRef.current = true;
      clearInterval(gameIntervalRef.current);
      stopTimer();
    }
  }

  function collision(nx, ny, shape) {
    const b = boardRef.current;
    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        if (shape[y][x]) {
          const px = nx + x, py = ny + y;
          if (px < 0 || px >= COLS || py >= ROWS) return true;
          if (py >= 0 && b[py][px]) return true;
        }
      }
    }
    return false;
  }

  function merge() {
    const b = boardRef.current;
    const { shape, color, x, y } = currentRef.current;
    for (let dy = 0; dy < shape.length; dy++) {
      for (let dx = 0; dx < shape[dy].length; dx++) {
        if (shape[dy][dx]) {
          const px = x + dx, py = y + dy;
          if (py >= 0) b[py][px] = color;
        }
      }
    }
    updateScore(10);
  }

  function clearLines() {
    let b = boardRef.current;
    let linesCleared = 0;
    for (let y = ROWS - 1; y >= 0; y--) {
      if (b[y].every(cell => cell !== 0)) {
        b.splice(y, 1);
        b.unshift(Array(COLS).fill(0));
        linesCleared++;
        y++;
      }
    }
    if (linesCleared > 0) {
      updateScore(linesCleared * 100);
    }
  }

  function checkClear() {
    if (score >= maxScoreRef.current) {
      clearInterval(gameIntervalRef.current);
      setIsCleared(true);
      stopTimer();
    }
  }

  function updateScore(add) {
  setScore(s => s + add);
  }
  function SRSRotate(shape, x, y, rotateFunc, kicks) {
    const rotated = rotateFunc(shape);
    for (let i = 0; i < kicks.length; i++) {
      const [dx, dy] = kicks[i];
      if (!collision(x + dx, y + dy, rotated)) {
        return { success: true, shape: rotated, x: x + dx, y: y + dy };
      }
    }
    return { success: false, shape, x, y };
  }

  function drawBlock(x, y, color) {
    const ctx = ctxRef.current;
    if (!ctx) return;
    ctx.fillStyle = color;
    ctx.fillRect((LEFT_HOLD_WIDTH + x) * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE - 1, BLOCK_SIZE - 1);
  }

  function draw() {
    const ctx = ctxRef.current;
    if (!ctx) return;
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    const b = boardRef.current;
    for (let y = 0; y < ROWS; y++) {
      for (let x = 0; x < COLS; x++) {
        if (b[y][x]) drawBlock(x, y, b[y][x]);
      }
    }

    const { shape, color, x, y } = currentRef.current;
    for (let dy = 0; dy < shape.length; dy++) {
      for (let dx = 0; dx < shape[dy].length; dx++) {
        if (shape[dy][dx]) drawBlock(x + dx, y + dy, color);
      }
    }

    drawNext(nextMinoRef.current);
    drawHold();

    ctx.strokeStyle = 'rgba(126,126,126,1)';
    ctx.lineWidth = 0.7;
    for (let x = 0; x <= COLS; x++) {
      ctx.beginPath();
      ctx.moveTo((LEFT_HOLD_WIDTH + x) * BLOCK_SIZE, 0);
      ctx.lineTo((LEFT_HOLD_WIDTH + x) * BLOCK_SIZE, ROWS * BLOCK_SIZE);
      ctx.stroke();
    }
    for (let y = 0; y <= ROWS; y++) {
      ctx.beginPath();
      ctx.moveTo(LEFT_HOLD_WIDTH * BLOCK_SIZE, y * BLOCK_SIZE);
      ctx.lineTo((LEFT_HOLD_WIDTH + COLS) * BLOCK_SIZE, y * BLOCK_SIZE);
      ctx.stroke();
    }

    if (isGameOver) stopTimer();
  }

  let isLocking = false;

  function drop() {
    const { x, y, shape } = currentRef.current;
    if (!collision(x, y + 1, shape)) {
      currentRef.current.y++;
      if (isLocking) {
        isLocking = false;
        if (lockTimerRef.current) {
          clearTimeout(lockTimerRef.current);
          lockTimerRef.current = null;
        }
      }
    } else {
      if (!isLocking) {
        isLocking = true;
        lockTimerRef.current = setTimeout(() => {
          if (collision(currentRef.current.x, currentRef.current.y + 1, currentRef.current.shape)) {
            merge();
            clearLines();
            newTetromino();
            if (collision(currentRef.current.x, currentRef.current.y, currentRef.current.shape)) {
              boardRef.current = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
              setIsGameOver(true);
              isGameOverRef.current = true;
              clearInterval(gameIntervalRef.current);
              stopTimer();
            }
          }
          isLocking = false;
          lockTimerRef.current = null;
          draw();
        }, 1000);
      }
    }
    draw();
  }

  function hardDrop() {
    while (!collision(currentRef.current.x, currentRef.current.y + 1, currentRef.current.shape)) {
      currentRef.current.y++;
    }
    merge();
    clearLines();
    newTetromino();
    draw();
    isLocking = false;
  }

  function hold() {
    if (currentRef.current.holdUsed) return;
    if (holdRef.current.shape === null) {
      holdRef.current = {
        shape: currentRef.current.shape,
        color: currentRef.current.color,
        rotation: currentRef.current.rotation,
        index: currentRef.current.index,
      };
      newTetromino();
    } else {
      const temp = {
        shape: holdRef.current.shape,
        color: holdRef.current.color,
        rotation: holdRef.current.rotation,
        index: holdRef.current.index,
      };
      holdRef.current = {
        shape: currentRef.current.shape,
        color: currentRef.current.color,
        rotation: currentRef.current.rotation,
        index: currentRef.current.index,
      };
      currentRef.current.shape = temp.shape;
      currentRef.current.color = temp.color;
      currentRef.current.rotation = temp.rotation;
      currentRef.current.index = temp.index;
      currentRef.current.x = 3;
      currentRef.current.y = 0;
      if (collision(currentRef.current.x, currentRef.current.y, currentRef.current.shape)) {
        setIsGameOver(true);
        clearInterval(gameIntervalRef.current);
        stopTimer();
        draw();
        return;
      }
    }
    currentRef.current.holdUsed = true;
    draw();
  }

  function drawHold() {
    const ctx = ctxRef.current;
    if (!ctx) return;
    const holdX = 1 * BLOCK_SIZE;
    const holdY = 2 * BLOCK_SIZE;
    ctx.strokeStyle = 'white';
    ctx.fillStyle = 'white';
    ctx.strokeRect(holdX, holdY, 4 * BLOCK_SIZE, 4 * BLOCK_SIZE);
    ctx.font = "bold 14px sans-serif";
    ctx.textAlign = "left";
    ctx.fillText('HOLD', holdX + 4, holdY - 8);
    if (holdRef.current.index === null) return;

    const shape = mino[holdRef.current.index];
    const color = COLORS[holdRef.current.index];
    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        if (shape[y][x]) {
          ctx.fillStyle = color;
          ctx.fillRect(holdX + x * BLOCK_SIZE, holdY + y * BLOCK_SIZE, BLOCK_SIZE - 1, BLOCK_SIZE - 1);
        }
      }
    }
  }

  const nextMinoRef = useRef({ index: null, shape: null, color: null });

  function drawNext(nextInfo) {
    const ctx = ctxRef.current;
    if (!ctx) return;
    const offsetX = (COLS + 7) * BLOCK_SIZE;
    const offsetY = BLOCK_SIZE + 1 * BLOCK_SIZE + 10;
    ctx.strokeStyle = 'white';
    ctx.strokeRect(offsetX, offsetY, 4 * BLOCK_SIZE, 4 * BLOCK_SIZE);
    ctx.font = "bold 14px sans-serif";
    ctx.fillStyle = 'white';
    ctx.textAlign = "center";
    ctx.fillText('NEXT', offsetX + 2 * BLOCK_SIZE, offsetY - 5);

    if (!nextInfo || !nextInfo.shape) return;

    for (let y = 0; y < nextInfo.shape.length; y++) {
      for (let x = 0; x < nextInfo.shape[y].length; x++) {
        if (nextInfo.shape[y][x]) {
          ctx.fillStyle = nextInfo.color;
          ctx.fillRect(offsetX + x * BLOCK_SIZE, offsetY + y * BLOCK_SIZE, BLOCK_SIZE - 1, BLOCK_SIZE - 1);
        }
      }
    }
  }

  function startTimer() {
    startTimestampRef.current = Date.now();
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      if (!startTimestampRef.current) return;
      const elapsed = Math.floor((Date.now() - startTimestampRef.current + pauseElapsedRef.current) / 1000);
      const min = String(Math.floor(elapsed / 60)).padStart(2, '0');
      const sec = String(elapsed % 60).padStart(2, '0');
      setTimerText(`${min}:${sec}`);
    }, 100);
  }

  function stopTimer() {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (startTimestampRef.current) {
      pauseElapsedRef.current += Date.now() - startTimestampRef.current;
    }
    startTimestampRef.current = null;
  }

  function gameLoop() {
    if (isGameOverRef.current || isPausedRef.current) return;
    drop();
  }

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isPaused || isGameOver || isCleared) return;
      const cr = currentRef.current;
      let moved = false;
      let kicks = null;
      if (cr.index === 0) kicks = SRS_KICKS_I;
      else if (cr.index !== 1) kicks = SRS_KICKS_OTHERS;

      switch (e.code) {
        case 'ArrowLeft':
          if (!collision(cr.x - 1, cr.y, cr.shape)) {
            cr.x--;
            moved = true;
          }
          break;
        case 'ArrowRight':
          if (!collision(cr.x + 1, cr.y, cr.shape)) {
            cr.x++;
            moved = true;
          }
          break;
        case 'ArrowDown':
          drop();
          break;
        case 'ArrowUp':
          if (kicks) {
            const result = SRSRotate(cr.shape, cr.x, cr.y, shape => rotate(shape, cr.index), kicks[cr.rotation]);
            if (result.success) {
              cr.shape = result.shape;
              cr.x = result.x;
              cr.y = result.y;
              cr.rotation = (cr.rotation + 1) % 4;
              moved = true;
            }
          }
          break;
        case 'KeyZ':
          if (kicks) {
            const result = SRSRotate(cr.shape, cr.x, cr.y, shape => rotateCCW(shape, cr.index), kicks[cr.rotation]);
            if (result.success) {
              cr.shape = result.shape;
              cr.x = result.x;
              cr.y = result.y;
              cr.rotation = (cr.rotation + 3) % 4;
              moved = true;
            }
          }
          break;
        case 'ShiftLeft':
        case 'ShiftRight':
          hold();
          break;
        case 'Space':
          hardDrop();
          break;
        default:
          break;
      }

      if (moved) {
        if (isLocking && collision(cr.x, cr.y + 1, cr.shape)) {
          if (lockTimerRef.current) {
            clearTimeout(lockTimerRef.current);
            lockTimerRef.current = null;
          }
          isLocking = false;
        }
        draw();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPaused, isGameOver, isCleared]);

  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = (LEFT_HOLD_WIDTH + COLS + 6) * BLOCK_SIZE;
    canvas.height = ROWS * BLOCK_SIZE;
    ctxRef.current = canvas.getContext('2d');
    startGame(true); // start in paused state
    return () => {
      stopTimer();
      clearInterval(gameIntervalRef.current);
      if (lockTimerRef.current) clearTimeout(lockTimerRef.current);
    };
  }, []);

  function startGame(paused = true) {
  maxScoreRef.current = maxScore;
  isGameOverRef.current = false;
  setIsGameOver(false);
  setIsCleared(false);
  setIsPaused(paused);
  isPausedRef.current = paused;

  boardRef.current = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
  minoQueueRef.current = [];
  refillQueue();
  setScore(0);
  pauseElapsedRef.current = 0;

  // **ホールドを初期化**
  holdRef.current = {
    shape: null,
    color: null,
    rotation: 0,
    index: null,
  };

  // **次ミノも初期化**
  nextMinoRef.current = {
    shape: null,
    color: null,
    index: null,
  };

  startTimer();
  newTetromino();
  updateNextMino();
  draw();

  if (!paused) {
    if (gameIntervalRef.current) clearInterval(gameIntervalRef.current);
    gameIntervalRef.current = setInterval(gameLoop, dropSpeedRef.current);
  } else {
    const ctx = ctxRef.current;
    if (ctx) {
      ctx.save();
      ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
      ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      ctx.fillStyle = "white";
      ctx.font = "bold 28px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("停止中", ctx.canvas.width / 2, ctx.canvas.height / 2);
      ctx.fillText("スタートボタンで再開", ctx.canvas.width / 2, ctx.canvas.height / 2 + 40);
      ctx.restore();
    }
  }
}


  function pauseGame() {
  setIsPaused(true);
  isPausedRef.current = true; // これを追加
  clearInterval(gameIntervalRef.current);
  stopTimer();
}


function resumeGame() {
  if (!isPausedRef.current || isGameOver) return;
  setIsPaused(false);
  isPausedRef.current = false; // これを追加
  if (gameIntervalRef.current) clearInterval(gameIntervalRef.current);
  gameIntervalRef.current = setInterval(gameLoop, dropSpeedRef.current);
  startTimer();
  draw();
}



  return (
    <div id="gameContainer">
      {isGameOver && <div id="message">GAME OVER</div>}
      {isCleared && <div id="message2">CONGRATULATIONS!</div>}
      <div id="score">スコア：{score}</div>
      <div id="timer">経過時間：{timerText}</div>
      <canvas ref={canvasRef} id="gameCanvas" />
      <div className="btn">
        <div className="click">
          <div id="resetbtn" onClick={() => { startGame(true); }} >リセット</div>
          <div id="stopbtn" onClick={() => { pauseGame(); }}>一時停止</div>
          <div id="startbtn" onClick={() => { resumeGame(); }}>スタート</div>
        </div>
        <div>
          クリア条件：
          <input
            type="number"
            value={maxScore}
            step="100"
            onChange={(e) => {
              const v = parseInt(e.target.value);
              if (!isNaN(v) && v > 0) {
                setMaxScore(v);
                maxScoreRef.current = v;
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}
