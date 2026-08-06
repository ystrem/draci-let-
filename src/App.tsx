import { useEffect, useRef, useState } from "react";
import { GameEngine } from "./game/gameEngine";
import { EditorHUD } from "./components/EditorHUD";
import { GameState, DRAGONS } from "./types";

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<GameEngine | null>(null);

  const [gameState, setGameState] = useState<GameState>({
    status: "menu",
    currentLevel: 1,
    score: 0,
    enemiesDefeated: 0,
    playerHealth: DRAGONS[0].maxHealth,
    playerMaxHealth: DRAGONS[0].maxHealth,
    levelProgress: 0,
    selectedDragonId: DRAGONS[0].id,
    dragonConfig: DRAGONS[0],
    manualHue: DRAGONS[0].baseHue,
    manualSpeed: DRAGONS[0].speed,
    manualFireRate: DRAGONS[0].fireRate,
    bossHealth: 0,
    bossMaxHealth: 250,
    isPaused: false,
    mute: false,
  });

  useEffect(() => {
    // Only initialize once on mount
    if (canvasRef.current && !engineRef.current) {
      const engine = new GameEngine(
        canvasRef.current,
        DRAGONS[0],
        (newState) => {
          setGameState(newState);
        }
      );
      engineRef.current = engine;
      engine.init();
    }

    return () => {
      if (engineRef.current) {
        engineRef.current.destroy();
        engineRef.current = null;
      }
    };
  }, []);

  const handleSelectDragon = (dragonId: string) => {
    const drag = DRAGONS.find((d) => d.id === dragonId);
    if (drag && engineRef.current) {
      engineRef.current.selectDragon(drag);
    }
  };

  const handleUpdateStats = (hue: number, speed: number, fireRate: number) => {
    if (engineRef.current) {
      engineRef.current.updateDragonStats(hue, speed, fireRate);
    }
  };

  const handleStartLevel = (levelId: number) => {
    if (engineRef.current) {
      engineRef.current.startLevel(levelId);
    }
  };

  const handleTogglePause = () => {
    if (engineRef.current) {
      engineRef.current.togglePause();
    }
  };

  const handleResetGame = () => {
    if (engineRef.current) {
      engineRef.current.resetGame();
    }
  };

  const handleSkipLevel = () => {
    if (engineRef.current) {
      engineRef.current.skipLevel();
    }
  };

  return (
    <div id="app-root-container" className="w-screen h-screen overflow-hidden bg-slate-950">
      <EditorHUD
        canvasRef={canvasRef}
        gameState={gameState}
        onSelectDragon={handleSelectDragon}
        onUpdateStats={handleUpdateStats}
        onStartLevel={handleStartLevel}
        onTogglePause={handleTogglePause}
        onResetGame={handleResetGame}
        onSkipLevel={handleSkipLevel}
      />
    </div>
  );
}

