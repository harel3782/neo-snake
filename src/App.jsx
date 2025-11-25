import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Trophy, RotateCcw, Play, Pause, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Palette } from 'lucide-react';

// --- Configuration ---
const GRID_SIZE = 20;
const INITIAL_SPEED = 150;
const MIN_SPEED = 60;
const SPEED_DECREMENT = 3;

// --- COLOR THEMES ---
const THEMES = {
  GREEN: {
    id: 'GREEN',
    name: 'Matrix',
    head: 'bg-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.8)]',
    body: 'bg-emerald-600/80',
    food: 'bg-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.8)]',
    gradient: 'from-emerald-400 to-cyan-400',
    ui: 'text-emerald-400',
    button: 'bg-emerald-500 hover:bg-emerald-400',
    dot: 'bg-emerald-500'
  },
  BLUE: {
    id: 'BLUE',
    name: 'Cyber',
    head: 'bg-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.8)]',
    body: 'bg-cyan-600/80',
    food: 'bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.8)]',
    gradient: 'from-cyan-400 to-blue-500',
    ui: 'text-cyan-400',
    button: 'bg-cyan-500 hover:bg-cyan-400',
    dot: 'bg-cyan-500'
  },
  PURPLE: {
    id: 'PURPLE',
    name: 'Synth',
    head: 'bg-fuchsia-400 shadow-[0_0_15px_rgba(232,121,249,0.8)]',
    body: 'bg-fuchsia-600/80',
    food: 'bg-teal-400 shadow-[0_0_15px_rgba(45,212,191,0.8)]',
    gradient: 'from-fuchsia-400 to-violet-500',
    ui: 'text-fuchsia-400',
    button: 'bg-fuchsia-500 hover:bg-fuchsia-400',
    dot: 'bg-fuchsia-500'
  },
  ORANGE: {
    id: 'ORANGE',
    name: 'Magma',
    head: 'bg-orange-400 shadow-[0_0_15px_rgba(251,146,60,0.8)]',
    body: 'bg-orange-600/80',
    food: 'bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.8)]',
    gradient: 'from-orange-400 to-red-500',
    ui: 'text-orange-400',
    button: 'bg-orange-500 hover:bg-orange-400',
    dot: 'bg-orange-500'
  }
};

const DIRECTIONS = {
  UP: { x: 0, y: -1 },
  DOWN: { x: 0, y: 1 },
  LEFT: { x: -1, y: 0 },
  RIGHT: { x: 1, y: 0 },
};

const INITIAL_SNAKE = [
  { x: 10, y: 10 },
  { x: 10, y: 11 },
  { x: 10, y: 12 },
];

const INITIAL_DIRECTION = DIRECTIONS.UP;

const generateFood = (snake) => {
  let newFood;
  let isSafe = false;
  while (!isSafe) {
    newFood = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    };
    // eslint-disable-next-line no-loop-func
    isSafe = !snake.some(segment => segment.x === newFood.x && segment.y === newFood.y);
  }
  return newFood;
};

// --- GameBoard now accepts a 'theme' prop ---
const GameBoard = ({ snake, food, gameOver, isPaused, theme }) => {
  const gridCells = Array.from({ length: GRID_SIZE * GRID_SIZE });

  return (
    <div 
      className="relative bg-slate-900 border-4 border-slate-700 rounded-lg shadow-2xl overflow-hidden select-none"
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
        gridTemplateRows: `repeat(${GRID_SIZE}, 1fr)`,
        aspectRatio: '1/1',
        width: '100%',
        maxWidth: '500px'
      }}
    >
      {gridCells.map((_, index) => {
        const x = index % GRID_SIZE;
        const y = Math.floor(index / GRID_SIZE);
        
        let isSnake = false;
        let isHead = false;
        let isFood = (food.x === x && food.y === y);

        snake.forEach((segment, i) => {
          if (segment.x === x && segment.y === y) {
            isSnake = true;
            if (i === 0) isHead = true;
          }
        });

        // Use theme properties for classes
        return (
          <div 
            key={`${x}-${y}`}
            className={`
              w-full h-full border-[0.5px] border-slate-800/30
              ${isHead ? `${theme.head} z-10 rounded-sm` : ''}
              ${isSnake && !isHead ? `${theme.body} rounded-sm` : ''}
              ${isFood ? `${theme.food} rounded-full scale-75 animate-pulse` : ''}
            `}
          />
        );
      })}

      {(gameOver || isPaused) && (
        <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm flex flex-col items-center justify-center z-20">
          {gameOver ? (
            <>
              <h2 className="text-5xl font-black text-rose-500 mb-2 tracking-tighter drop-shadow-lg">GAME OVER</h2>
              <p className="text-slate-300 mb-6 font-mono">CRASHED</p>
            </>
          ) : (
            <h2 className={`text-4xl font-bold ${theme.ui} tracking-widest uppercase`}>Paused</h2>
          )}
        </div>
      )}
    </div>
  );
};

export default function App() {
  const [snake, setSnake] = useState(INITIAL_SNAKE);
  const [food, setFood] = useState({ x: 5, y: 5 });
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [speed, setSpeed] = useState(INITIAL_SPEED);
  
  // NEW: Theme State
  const [currentTheme, setCurrentTheme] = useState('GREEN');
  const activeTheme = THEMES[currentTheme];

  const moveQueue = useRef([]); 
  const currentDirectionRef = useRef(INITIAL_DIRECTION);
  const gameLoopRef = useRef(null);

  useEffect(() => {
    const saved = localStorage.getItem('snake-highscore');
    if (saved) setHighScore(parseInt(saved, 10));
    setFood(generateFood(INITIAL_SNAKE));
  }, []);

  useEffect(() => {
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('snake-highscore', score.toString());
    }
  }, [score, highScore]);

  const handleDirectionChange = useCallback((newDir) => {
    const lastPendingDirection = moveQueue.current.length > 0 
      ? moveQueue.current[moveQueue.current.length - 1] 
      : currentDirectionRef.current;

    if (
      (newDir.x === 0 && lastPendingDirection.y !== 0 && newDir.y === -lastPendingDirection.y) ||
      (newDir.y === 0 && lastPendingDirection.x !== 0 && newDir.x === -lastPendingDirection.x)
    ) {
      return; 
    }

    if (moveQueue.current.length < 2) {
      moveQueue.current.push(newDir);
    }
  }, []);

  const handleKeyDown = useCallback((e) => {
    if (gameOver) return;

    if (e.code === 'Space') {
      if (!gameStarted) startGame();
      else togglePause();
      e.preventDefault();
      return;
    }

    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
      e.preventDefault();
    }

    switch (e.key) {
      case 'ArrowUp': case 'w': case 'W': handleDirectionChange(DIRECTIONS.UP); break;
      case 'ArrowDown': case 's': case 'S': handleDirectionChange(DIRECTIONS.DOWN); break;
      case 'ArrowLeft': case 'a': case 'A': handleDirectionChange(DIRECTIONS.LEFT); break;
      case 'ArrowRight': case 'd': case 'D': handleDirectionChange(DIRECTIONS.RIGHT); break;
    }
  }, [gameOver, gameStarted, isPaused, handleDirectionChange]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const gameTick = useCallback(() => {
    if (gameOver || isPaused || !gameStarted) return;

    let nextMove = currentDirectionRef.current;
    if (moveQueue.current.length > 0) {
      nextMove = moveQueue.current.shift();
      currentDirectionRef.current = nextMove;
    }

    setSnake((prevSnake) => {
      const head = prevSnake[0];
      const newHead = {
        x: head.x + nextMove.x,
        y: head.y + nextMove.y,
      };

      if (newHead.x < 0 || newHead.x >= GRID_SIZE || newHead.y < 0 || newHead.y >= GRID_SIZE) {
        setGameOver(true);
        return prevSnake;
      }

      const isEating = (newHead.x === food.x && newHead.y === food.y);
      const collisionCheckBody = isEating ? prevSnake : prevSnake.slice(0, -1);
      
      if (collisionCheckBody.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
        setGameOver(true);
        return prevSnake;
      }

      const newSnake = [newHead, ...prevSnake];

      if (isEating) {
        setScore(s => s + 10);
        setFood(generateFood(newSnake));
        setSpeed(prev => Math.max(MIN_SPEED, prev - SPEED_DECREMENT));
      } else {
        newSnake.pop();
      }

      return newSnake;
    });
  }, [food, gameOver, isPaused, gameStarted]);

  useEffect(() => {
    if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    if (gameStarted && !isPaused && !gameOver) {
      gameLoopRef.current = setInterval(gameTick, speed);
    }
    return () => { if (gameLoopRef.current) clearInterval(gameLoopRef.current); };
  }, [gameTick, gameStarted, isPaused, gameOver, speed]);

  const startGame = () => {
    setSnake(INITIAL_SNAKE);
    currentDirectionRef.current = INITIAL_DIRECTION;
    moveQueue.current = [];
    setScore(0);
    setGameOver(false);
    setIsPaused(false);
    setGameStarted(true);
    setSpeed(INITIAL_SPEED);
    setFood(generateFood(INITIAL_SNAKE));
  };

  const togglePause = () => {
    if (!gameStarted || gameOver) return;
    setIsPaused(prev => !prev);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans flex flex-col items-center justify-center p-4 selection:bg-emerald-500/30 touch-none">
      
      {/* Header */}
      <div className="w-full max-w-[500px] mb-6 flex items-end justify-between">
        <div>
          <h1 className={`text-3xl font-black bg-gradient-to-r ${activeTheme.gradient} bg-clip-text text-transparent italic tracking-tighter transition-all duration-500`}>
            NEO-SNAKE
          </h1>
          <p className="text-xs text-slate-500 font-mono">REACT PORTFOLIO // V4</p>
        </div>
        
        <div className="flex gap-4 text-right">
          <div>
            <div className="text-xs text-slate-500 font-bold uppercase">Score</div>
            <div className={`text-2xl font-mono font-bold ${activeTheme.ui}`}>{score}</div>
          </div>
          <div className="opacity-60">
            <div className="flex items-center gap-1 text-xs text-slate-500 font-bold uppercase">
              <Trophy size={12} /> High
            </div>
            <div className="text-2xl font-mono font-bold text-slate-300">{highScore}</div>
          </div>
        </div>
      </div>

      <GameBoard snake={snake} food={food} gameOver={gameOver} isPaused={isPaused} theme={activeTheme} />

      {/* Control Bar */}
      <div className="w-full max-w-[500px] mt-6 flex items-center justify-between">
        <div className="flex gap-2">
          {!gameStarted || gameOver ? (
            <button 
              onClick={startGame}
              className={`flex items-center gap-2 px-6 py-3 ${activeTheme.button} text-slate-950 font-bold rounded-full transition-all shadow-lg active:scale-95`}
            >
              {gameOver ? <RotateCcw size={20} /> : <Play size={20} />}
              {gameOver ? 'Try Again' : 'Start Game'}
            </button>
          ) : (
            <button 
              onClick={togglePause}
              className={`flex items-center justify-center w-12 h-12 rounded-full transition-all border-2 
                ${isPaused 
                  ? 'bg-amber-500/20 border-amber-500 text-amber-500' 
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'}`}
            >
              {isPaused ? <Play size={24} fill="currentColor" /> : <Pause size={24} fill="currentColor" />}
            </button>
          )}
        </div>

        {/* Theme Selectors */}
        <div className="flex gap-2">
          {Object.values(THEMES).map((t) => (
            <button
              key={t.id}
              onClick={() => setCurrentTheme(t.id)}
              className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${t.dot} ${currentTheme === t.id ? 'border-white scale-110 shadow-lg ring-2 ring-white/20' : 'border-transparent opacity-50 hover:opacity-100'}`}
              title={t.name}
            />
          ))}
        </div>
      </div>

      {/* Mobile Controls */}
      <div className="md:hidden mt-8 grid grid-cols-3 gap-2 p-4 bg-slate-900/50 rounded-2xl border border-slate-800">
        <div />
        <button className="w-14 h-14 bg-slate-800 rounded-lg flex items-center justify-center active:bg-slate-700 transition-colors"
          onPointerDown={(e) => { e.preventDefault(); handleDirectionChange(DIRECTIONS.UP); }}>
          <ChevronUp size={32} />
        </button>
        <div />
        <button className="w-14 h-14 bg-slate-800 rounded-lg flex items-center justify-center active:bg-slate-700 transition-colors"
          onPointerDown={(e) => { e.preventDefault(); handleDirectionChange(DIRECTIONS.LEFT); }}>
          <ChevronLeft size={32} />
        </button>
        <button className="w-14 h-14 bg-slate-800 rounded-lg flex items-center justify-center active:bg-slate-700 transition-colors"
          onPointerDown={(e) => { e.preventDefault(); handleDirectionChange(DIRECTIONS.DOWN); }}>
          <ChevronDown size={32} />
        </button>
        <button className="w-14 h-14 bg-slate-800 rounded-lg flex items-center justify-center active:bg-slate-700 transition-colors"
          onPointerDown={(e) => { e.preventDefault(); handleDirectionChange(DIRECTIONS.RIGHT); }}>
          <ChevronRight size={32} />
        </button>
      </div>
    </div>
  );
}