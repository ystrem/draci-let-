import { useEffect, useRef, useState } from "react";
import { GameEngine } from "./game/gameEngine";
import { EditorHUD } from "./components/EditorHUD";
import { GameState, DRAGONS } from "./types";

export default function App() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const engineRef = useRef<GameEngine | null>(null);

  const [gameState, setGameState] = useState<GameState>({
    status: "playing",
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
    // Suppress transient WebGL context loss errors in sandbox preview
    const handleContextError = (e: ErrorEvent | PromiseRejectionEvent) => {
      const msg = 'reason' in e ? e.reason?.message : e.message;
      if (typeof msg === "string" && (msg.includes("WebGL") || msg.includes("shader") || msg.includes("context may be lost"))) {
        if ('preventDefault' in e && typeof e.preventDefault === 'function') {
          e.preventDefault();
        }
      }
    };
    window.addEventListener("error", handleContextError);
    window.addEventListener("unhandledrejection", handleContextError);

    // Only initialize once on mount
    if (containerRef.current && !engineRef.current) {
      const engine = new GameEngine(
        containerRef.current,
        DRAGONS[0],
        (newState) => {
          setGameState(newState);
        }
      );
      engineRef.current = engine;
      engine.init();
    }

    return () => {
      window.removeEventListener("error", handleContextError);
      window.removeEventListener("unhandledrejection", handleContextError);
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

  const handleSetPlayerCount = (count: number) => {
    if (engineRef.current) {
      engineRef.current.setPlayerCount(count);
    }
  };

  const handleSkipLevel = () => {
    if (engineRef.current) {
      engineRef.current.skipLevel();
    }
  };

  const handleOpenMenu = () => {
    if (engineRef.current) {
      engineRef.current.openMenu();
    }
  };

  return (
    <div id="app-root-container" className="w-screen h-screen overflow-hidden bg-slate-950">
      <EditorHUD
        containerRef={containerRef}
        gameState={gameState}
        onSelectDragon={handleSelectDragon}
        onUpdateStats={handleUpdateStats}
        onStartLevel={handleStartLevel}
        onTogglePause={handleTogglePause}
        onResetGame={handleResetGame}
        onSkipLevel={handleSkipLevel}
        onSetPlayerCount={handleSetPlayerCount}
        onOpenMenu={handleOpenMenu}
      />
    </div>
  );
}

