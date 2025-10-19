import React from 'react';
import useOsero from './useOsero';
import './style.css';

export default function Osero() {
  const {
    board, player, validMoves, counts,
    reset, pass, put, gameOver, BLACK, WHITE
  } = useOsero();

  const handleClick = (r, c) => {
    if (gameOver) return;
    const key = `${r},${c}`;
    if (!validMoves.has(key)) return;
    put(r, c);
  };

  return (
    <div className="osero-root">
      <div className="board-area">
        <div className="side-info">
          <div className="turn">現在の手番: {player === BLACK ? '黒' : '白'}</div>
          <div className="count">黒: <span>{counts.black}</span> 白: <span>{counts.white}</span></div>
          <div style={{ marginTop: 12 }}>
            <button id="passBtn" onClick={pass}>パス</button>
            <button id="resetBtn" onClick={reset}>リセット</button>
          </div>
        </div>

        <div className="stage" role="grid" aria-label="オセロ盤">
          {board.map((row, r) =>
            row.map((cell, c) => {
              const canPut = validMoves.has(`${r},${c}`);
              return (
                <div
                  key={`${r}-${c}`}
                  className={`masu ${canPut ? 'can-put' : ''}`}
                  onClick={() => handleClick(r, c)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleClick(r, c); }}
                >
                  <div className="stone" data-state={cell} />
                </div>
              );
            })
          )}
        </div>
      </div>

      {gameOver && (
        <div id="clearwindow" style={{ display: 'block' }}>
          <div className="end">
            <div>結果発表</div>
            <div className="end-count">黒: {counts.black} 白: {counts.white}</div>
            <button onClick={reset}>もう一度遊ぶ</button>
          </div>
        </div>
      )}
    </div>
  );
}
