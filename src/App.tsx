import { useState, useRef, useEffect } from "react";
import { GameEngine } from "./game/gameEngine";
import { EditorHUD } from "./components/EditorHUD";
import { GameState, DRAGONS } from "./types";
import { EragonGameView } from "./components/EragonGameView";
import { Sparkles, Gamepad2 } from "lucide-react";

export default function App() {
  // Mode selection: default to "3d_eragon" as requested by the user
  const [gameMode, setGameMode] = useState<"3d_eragon" | "2d_arcade">("3d_eragon");

  // 2D Arcade State & Refs
  const containerRef = useRef<HTMLDivElement | null>(null);
  const engineRef = useRef<GameEngine | null>(null);

  const [gameState, setGameState] = useState<GameState>({
    status: "playing",
    currentLevel: 1,
    score: 0,
    enemiesDefeated: 0,
    playerHealth: DRAGONS[0].maxHealth,
    playerMaxHealth: DRAGONS[0].maxHealth,
    playerCount: 1,
    playersHealth: [DRAGONS[0].maxHealth],
    playersMaxHealth: [DRAGONS[0].maxHealth],
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
    healthUpgradeLevel: 0,
    fireRateUpgradeLevel: 0,
    damageUpgradeLevel: 0,
    speedUpgradeLevel: 0,
    babyDragonUnlocked: false,
  });

  useEffect(() => {
    // Only initialize 2D engine if in 2D mode
    if (gameMode === "2d_arcade" && containerRef.current && !engineRef.current) {
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

    if (gameMode !== "2d_arcade" && engineRef.current) {
      engineRef.current.destroy();
      engineRef.current = null;
    }

    return () => {
      if (engineRef.current) {
        engineRef.current.destroy();
        engineRef.current = null;
      }
    };
  }, [gameMode]);

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

  const handleToggleMute = () => {
    if (engineRef.current) {
      engineRef.current.toggleMute();
    }
  };

  const handleUpgradeHealth = () => engineRef.current?.upgradeHealth();
  const handleUpgradeFireRate = () => engineRef.current?.upgradeFireRate();
  const handleUpgradeDamage = () => engineRef.current?.upgradeDamage();
  const handleUpgradeSpeed = () => engineRef.current?.upgradeSpeed();
  const handleNextLevelFromCave = () => engineRef.current?.nextLevelFromCave();
  const handleUnlockBabyDragon = () => engineRef.current?.unlockBabyDragon();

  return (
    <div id="app-root-container" className="relative w-screen h-screen overflow-hidden bg-slate-950">
      {/* Mode Switcher & Global Sound Toggle in Top Corner */}
      <div className="absolute top-3 right-3 z-40 flex items-center gap-2">
        <div className="flex items-center gap-1.5 bg-slate-900/90 border border-slate-700/80 p-1 rounded-xl shadow-lg backdrop-blur-sm text-xs">
          <button
            onClick={() => setGameMode("3d_eragon")}
            className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition ${
              gameMode === "3d_eragon"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/30"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>3D Eragon RPG</span>
          </button>

          <button
            onClick={() => setGameMode("2d_arcade")}
            className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition ${
              gameMode === "2d_arcade"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/30"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Gamepad2 className="w-3.5 h-3.5 text-indigo-300" />
            <span>2D Arkáda</span>
          </button>
        </div>
      </div>

      {/* Main Game Screen */}
      {gameMode === "3d_eragon" ? (
        <EragonGameView />
      ) : (
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
          onToggleMute={handleToggleMute}
          onUpgradeHealth={handleUpgradeHealth}
          onUpgradeFireRate={handleUpgradeFireRate}
          onUpgradeDamage={handleUpgradeDamage}
          onUpgradeSpeed={handleUpgradeSpeed}
          onNextLevelFromCave={handleNextLevelFromCave}
          onUnlockBabyDragon={handleUnlockBabyDragon}
        />
      )}
    </div>
  );
}
