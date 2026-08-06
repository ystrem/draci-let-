import React from "react";
import { GameState, DRAGONS, LEVELS } from "../types";
import {
  Flame,
  Zap,
  Shield,
  RotateCcw,
  SkipForward,
  Play,
  Pause,
  Sliders,
  Sparkles,
  Sword,
  Target,
  Trophy,
  AlertTriangle,
  Heart,
  HelpCircle,
  Compass,
} from "lucide-react";

interface EditorHUDProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  gameState: GameState;
  onSelectDragon: (dragonId: string) => void;
  onUpdateStats: (hue: number, speed: number, fireRate: number) => void;
  onStartLevel: (levelId: number) => void;
  onTogglePause: () => void;
  onResetGame: () => void;
  onSkipLevel: () => void;
}

export const EditorHUD: React.FC<EditorHUDProps> = ({
  canvasRef,
  gameState,
  onSelectDragon,
  onUpdateStats,
  onStartLevel,
  onTogglePause,
  onResetGame,
  onSkipLevel,
}) => {
  const currentLevelConfig = LEVELS[gameState.currentLevel - 1];

  const handleHueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdateStats(parseFloat(e.target.value), gameState.manualSpeed, gameState.manualFireRate);
  };

  const handleSpeedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdateStats(gameState.manualHue, parseFloat(e.target.value), gameState.manualFireRate);
  };

  const handleFireRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdateStats(gameState.manualHue, gameState.manualSpeed, parseInt(e.target.value, 10));
  };

  // Render the dragon selector cards
  const renderDragonSelector = () => (
    <div id="dragon-selector" className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
      {DRAGONS.map((drag) => {
        const isSelected = gameState.selectedDragonId === drag.id;
        return (
          <button
            key={drag.id}
            id={`dragon-card-${drag.id}`}
            onClick={() => onSelectDragon(drag.id)}
            className={`relative flex flex-col justify-between p-4 rounded-xl border text-left transition-all duration-300 overflow-hidden group ${
              isSelected
                ? "bg-slate-900/90 border-amber-500 shadow-lg shadow-amber-500/20 scale-102"
                : "bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/50"
            }`}
          >
            {/* Hue-colored indicator circle */}
            <div className="absolute top-0 right-0 w-24 h-24 -mr-10 -mt-10 rounded-full opacity-10 group-hover:opacity-20 transition-opacity"
                 style={{ backgroundColor: drag.colorHex }} />

            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-3.5 h-3.5 rounded-full border border-white/20" style={{ backgroundColor: drag.colorHex }} />
                <h3 className="font-semibold text-white group-hover:text-amber-400 transition-colors">{drag.name}</h3>
              </div>
              <p className="text-xs text-slate-400 mb-3 leading-relaxed">Element: {drag.element}</p>
            </div>

            <div className="space-y-1 text-[11px] text-slate-400 border-t border-slate-800/80 pt-2 w-full">
              <div className="flex justify-between">
                <span>Rychlost:</span>
                <span className="font-mono text-slate-200">{drag.speed} px</span>
              </div>
              <div className="flex justify-between">
                <span>Kadence:</span>
                <span className="font-mono text-slate-200">{drag.fireRate}ms</span>
              </div>
              <div className="flex justify-between">
                <span>Max. HP:</span>
                <span className="font-mono text-slate-200">{drag.maxHealth}</span>
              </div>
            </div>

            {isSelected && (
              <div className="absolute top-2 right-2 bg-amber-500 text-slate-950 font-bold text-[9px] px-1.5 py-0.5 rounded uppercase tracking-wider">
                Vybráno
              </div>
            )}
          </button>
        );
      })}
    </div>
  );

  return (
    <div id="game-ui-overlay" className="flex flex-col h-full bg-slate-950 text-slate-100 select-none">
      
      {/* 1. Header with App Title & Core States */}
      <header id="game-header" className="flex items-center justify-between px-6 py-4 border-b border-slate-900 bg-slate-950/80 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center shadow-lg shadow-amber-500/10">
            <Flame className="w-5 h-5 text-slate-950" />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-none tracking-tight text-white uppercase">Dračí Let</h1>
            <p className="text-xs text-slate-400">PixiJS v8 2D akční plošinovka</p>
          </div>
        </div>

        {/* Global Toolbar */}
        <div className="flex items-center gap-3">
          {gameState.status === "playing" && (
            <button
              id="btn-pause"
              onClick={onTogglePause}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs transition font-medium"
            >
              {gameState.isPaused ? (
                <>
                  <Play className="w-3.5 h-3.5 text-emerald-400" /> Pokračovat
                </>
              ) : (
                <>
                  <Pause className="w-3.5 h-3.5 text-amber-400" /> Pauza
                </>
              )}
            </button>
          )}

          <button
            id="btn-reset"
            onClick={onResetGame}
            className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 transition"
            title="Resetovat hru"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* 2. Main content block splitter (Preview on top/left, Editor on right/bottom) */}
      <main id="game-main-content" className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-auto">
        
        {/* Left Side: Game Canvas Holder Screen overlays */}
        <div id="game-canvas-container-wrapper" className="flex-1 flex flex-col bg-slate-950 border-r border-slate-900 relative">
          
          {/* Game Over Screen */}
          {gameState.status === "game_over" && (
            <div id="overlay-game-over" className="absolute inset-0 z-50 bg-slate-950/95 flex flex-col items-center justify-center p-6 text-center">
              <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500 flex items-center justify-center mb-4 animate-bounce">
                <AlertTriangle className="w-8 h-8 text-rose-500" />
              </div>
              <h2 className="text-3xl font-extrabold text-rose-500 tracking-tight uppercase mb-2">Drak poražen!</h2>
              <p className="text-slate-400 max-w-md text-sm mb-6 leading-relaxed">
                Váš drak padl v boji. Biomy jsou nebezpečné, ale váš duch je nezlomný. Upravte parametry rychlosti a střelby draka v panelu editoru a získejte výhodu!
              </p>
              <div className="flex gap-4">
                <button
                  id="btn-retry"
                  onClick={() => onStartLevel(gameState.currentLevel)}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 text-slate-950 font-bold hover:brightness-110 transition flex items-center gap-2 text-sm shadow-lg shadow-amber-500/20"
                >
                  <RotateCcw className="w-4 h-4" /> Zkusit biom znovu
                </button>
                <button
                  id="btn-main-menu"
                  onClick={onResetGame}
                  className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-850 text-white font-semibold transition border border-slate-800 text-sm"
                >
                  Hlavní menu
                </button>
              </div>
            </div>
          )}

          {/* Level Complete Screen */}
          {gameState.status === "level_complete" && (
            <div id="overlay-level-complete" className="absolute inset-0 z-50 bg-slate-950/95 flex flex-col items-center justify-center p-6 text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500 flex items-center justify-center mb-4 animate-pulse">
                <Sparkles className="w-8 h-8 text-emerald-400" />
              </div>
              <h2 className="text-3xl font-extrabold text-emerald-400 tracking-tight uppercase mb-1">Biom úspěšně zdolán!</h2>
              <p className="text-amber-400 text-sm font-semibold mb-3">{currentLevelConfig.title}</p>
              <p className="text-slate-400 max-w-md text-sm mb-6 leading-relaxed">
                Úspěšně jste překonali veškerá nebezpečí. Síla vašeho draka roste! Připravte se na další výzvu.
              </p>
              <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-4 mb-6 min-w-xs grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-xs text-slate-500">Dosavadní skóre</div>
                  <div className="text-xl font-bold font-mono text-white">{gameState.score}</div>
                </div>
                <div className="text-center border-l border-slate-800">
                  <div className="text-xs text-slate-500">Další úroveň</div>
                  <div className="text-xl font-bold text-amber-400">{gameState.currentLevel + 1}. úroveň</div>
                </div>
              </div>
              <button
                id="btn-next-level"
                onClick={() => onStartLevel(gameState.currentLevel + 1)}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold hover:brightness-110 transition flex items-center gap-2 text-sm shadow-lg shadow-emerald-500/20"
              >
                Postoupit do dalšího biomu <SkipForward className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Victory Screen */}
          {gameState.status === "victory" && (
            <div id="overlay-victory" className="absolute inset-0 z-50 bg-slate-950/95 flex flex-col items-center justify-center p-6 text-center">
              <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500 flex items-center justify-center mb-4">
                <Trophy className="w-8 h-8 text-amber-400" />
              </div>
              <h2 className="text-4xl font-extrabold text-amber-400 tracking-tight uppercase mb-1">Velký útěk!</h2>
              <p className="text-slate-300 font-semibold mb-3">Všechny biomy dokončeny</p>
              <p className="text-slate-400 max-w-md text-sm mb-6 leading-relaxed">
                Gratulujeme! Úspěšně jste provedli svého draka všemi nebezpečnými krajinami – od bouřlivých vrcholů Kixskuských hor přes duny pouště Bojli až po křivolaké houštiny Masivního lesa.
              </p>
              <div className="bg-amber-950/20 border border-amber-500/20 rounded-xl p-5 mb-8 min-w-xs">
                <div className="text-xs text-amber-500 uppercase tracking-wider font-bold mb-1">Dosažené finální skóre</div>
                <div className="text-4xl font-black font-mono text-white tracking-widest">{gameState.score}</div>
              </div>
              <button
                id="btn-restart"
                onClick={onResetGame}
                className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 text-slate-950 font-black hover:brightness-110 transition flex items-center gap-2 text-sm shadow-lg shadow-amber-500/35"
              >
                <RotateCcw className="w-4 h-4" /> Vydat se na novou pouť
              </button>
            </div>
          )}

          {/* Menu / Selection Screen */}
          {gameState.status === "menu" && (
            <div id="overlay-menu" className="absolute inset-0 z-40 bg-slate-950 flex flex-col justify-between p-6 overflow-y-auto">
              <div>
                <div className="max-w-2xl">
                  <span className="text-xs font-bold uppercase tracking-widest text-amber-500 bg-amber-500/10 px-2.5 py-1 rounded-full">
                    Vyberte si svého draka ochránce
                  </span>
                  <h2 className="text-3xl font-extrabold text-white tracking-tight uppercase mt-3 mb-1">
                    Zvolte si svůj element
                  </h2>
                  <p className="text-slate-400 text-sm leading-relaxed mb-6">
                    Každý drak ovládá jedinečný elementární projektil. Vyberte si draka níže, upravte jeho vlastnosti v editoru a proleťte bouřlivými vrcholky, písečnými bouřemi a temnými bludišti.
                  </p>
                </div>

                {renderDragonSelector()}
              </div>

              <div className="border-t border-slate-900 pt-6 flex flex-col md:flex-row items-center justify-between gap-4 mt-auto">
                <div className="flex items-center gap-4 text-xs text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <kbd className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 font-mono text-[10px]">WASD</kbd> / <kbd className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 font-mono text-[10px]">ŠIPKY</kbd> Let
                  </div>
                  <div className="flex items-center gap-1.5">
                    <kbd className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 font-mono text-[10px]">MEZERNÍK</kbd> Střelba
                  </div>
                </div>

                <button
                  id="btn-start-game"
                  onClick={() => onStartLevel(1)}
                  className="w-full md:w-auto px-10 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 text-slate-950 font-black hover:brightness-110 transition flex items-center justify-center gap-2 text-sm shadow-lg shadow-amber-500/25 uppercase tracking-wider"
                >
                  <Play className="w-4 h-4" /> Zahájit dračí pouť
                </button>
              </div>
            </div>
          )}

          {/* Active Canvas Holder with Real-time Game Status overlays */}
          <div className="relative flex-1 bg-slate-950 flex items-center justify-center overflow-hidden">
            <canvas
              ref={canvasRef}
              id="game-pixi-canvas"
              className="w-full h-full max-w-4xl aspect-[16/9] shadow-2xl block bg-[#0a0a14]"
            />

            {/* In-Game HUD overlay */}
            {gameState.status === "playing" && (
              <div id="ingame-hud" className="absolute inset-x-0 top-0 p-4 pointer-events-none flex flex-col gap-3">
                
                {/* HUD Top bar */}
                <div className="flex items-start justify-between w-full">
                  
                  {/* Health and Dragon Info */}
                  <div className="flex flex-col gap-1.5 max-w-xs w-full bg-slate-950/80 p-3 rounded-xl border border-slate-900 backdrop-blur-sm pointer-events-auto">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-white flex items-center gap-1">
                        <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                        {gameState.dragonConfig.name}
                      </span>
                      <span className="font-mono text-slate-300 text-[11px]">
                        {Math.floor(gameState.playerHealth)} / {gameState.playerMaxHealth} HP
                      </span>
                    </div>
                    {/* Progress Health Bar */}
                    <div className="w-full h-3 rounded-full bg-slate-900 overflow-hidden border border-slate-800/60">
                      <div
                        id="hud-health-fill"
                        className="h-full bg-gradient-to-r from-rose-600 to-orange-500 transition-all duration-150"
                        style={{ width: `${Math.max(0, (gameState.playerHealth / gameState.playerMaxHealth) * 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Level Goal Description and Stats */}
                  <div className="flex flex-col gap-1.5 items-end text-right bg-slate-950/80 p-3 rounded-xl border border-slate-900 backdrop-blur-sm pointer-events-auto">
                    <div className="text-xs font-bold text-amber-400 flex items-center gap-1 uppercase tracking-wider">
                      <Target className="w-3.5 h-3.5" /> Biom {gameState.currentLevel}: {currentLevelConfig.title}
                    </div>
                    <div className="text-[10px] text-slate-400 max-w-xs">{currentLevelConfig.goalDescription}</div>
                    <div className="flex gap-4 mt-1 border-t border-slate-900 pt-1.5 w-full justify-end">
                      <div>
                        <span className="text-[10px] text-slate-500 block">Skóre</span>
                        <span className="text-sm font-bold font-mono text-white leading-none">{gameState.score}</span>
                      </div>
                      <div className="border-l border-slate-900 pl-4">
                        <span className="text-[10px] text-slate-500 block">Poraženo</span>
                        <span className="text-sm font-bold font-mono text-white leading-none">{gameState.enemiesDefeated}</span>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Level Progress Bar along bottom of HUD */}
                <div className="absolute inset-x-4 bottom-4 pointer-events-auto bg-slate-950/80 p-3 rounded-xl border border-slate-900 backdrop-blur-sm flex items-center gap-3">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest shrink-0">Postup</span>
                  <div className="flex-1 h-2 rounded-full bg-slate-900 overflow-hidden border border-slate-800/80 relative">
                    <div
                      id="hud-progress-fill"
                      className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 transition-all duration-350"
                      style={{ width: `${gameState.levelProgress}%` }}
                    />
                  </div>
                  <span className="text-xs font-mono font-bold text-amber-400 shrink-0">{Math.floor(gameState.levelProgress)}%</span>
                </div>

                {/* Giant Sand Worm Boss health bar overlay (Level 2 specific) */}
                {gameState.currentLevel === 2 && gameState.bossHealth > 0 && (
                  <div id="boss-warning-hud" className="self-center max-w-lg w-full bg-rose-950/90 p-3 rounded-xl border border-rose-500/40 backdrop-blur-sm flex flex-col gap-1 pointer-events-auto mt-2 animate-pulse">
                    <div className="flex justify-between items-center text-xs text-rose-200">
                      <span className="font-extrabold tracking-wide uppercase flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4 text-rose-400" />
                        Obří písečný červ
                      </span>
                      <span className="font-mono text-[11px] font-bold">
                        {Math.floor(gameState.bossHealth)} / {gameState.bossMaxHealth} HP
                      </span>
                    </div>
                    <div className="w-full h-2.5 rounded-full bg-rose-950 overflow-hidden border border-rose-500/20">
                      <div
                        id="hud-boss-fill"
                        className="h-full bg-rose-500 transition-all duration-100"
                        style={{ width: `${(gameState.bossHealth / gameState.bossMaxHealth) * 100}%` }}
                      />
                    </div>
                  </div>
                )}

              </div>
            )}

            {/* Paused Screen */}
            {gameState.status === "playing" && gameState.isPaused && (
              <div id="overlay-paused" className="absolute inset-0 z-35 bg-slate-950/70 flex flex-col items-center justify-center backdrop-blur-xs">
                <h3 className="text-2xl font-black uppercase text-white tracking-widest mb-4">Hra pozastavena</h3>
                <button
                  onClick={onTogglePause}
                  className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold transition flex items-center gap-2 text-xs"
                >
                  <Play className="w-4 h-4" /> Pokračovat ve hře
                </button>
              </div>
            )}

          </div>

        </div>

        {/* Right Side / Bottom: Character Editor & Control Panel */}
        <div id="dragon-editor-panel" className="w-full lg:w-96 flex flex-col border-t lg:border-t-0 lg:border-l border-slate-900 bg-slate-950/40 p-6 overflow-y-auto">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-900">
            <Sliders className="w-4 h-4 text-amber-500" />
            <h2 className="font-bold text-sm uppercase tracking-wider text-slate-200">Editor dračího letu</h2>
          </div>

          <p className="text-xs text-slate-400 mb-6 leading-relaxed">
            Upravujte fyzikální konstanty, aerodynamiku letu a barevný odstín v reálném čase. Pomocí těchto parametrů překonejte náročné nebezpečné zóny nebo otestujte hranice hry.
          </p>

          <div className="space-y-6">
            
            {/* Dragon Hue slider */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label htmlFor="hue-slider" className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Barevný odstín draka
                </label>
                <span className="text-xs font-mono text-amber-400 font-bold">{Math.floor(gameState.manualHue)}°</span>
              </div>
              <input
                id="hue-slider"
                type="range"
                min="0"
                max="360"
                step="1"
                value={gameState.manualHue}
                onChange={handleHueChange}
                className="w-full h-1.5 rounded-lg bg-slate-800 appearance-none cursor-pointer accent-amber-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>0° (Červený)</span>
                <span>120° (Zelený)</span>
                <span>200° (Modrý)</span>
                <span>280° (Fialový)</span>
              </div>
            </div>

            {/* Flight speed slider */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label htmlFor="speed-slider" className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                  <Compass className="w-3.5 h-3.5 text-emerald-400" /> Rychlost letu
                </label>
                <span className="text-xs font-mono text-emerald-400 font-bold">{gameState.manualSpeed.toFixed(1)} px/f</span>
              </div>
              <input
                id="speed-slider"
                type="range"
                min="3"
                max="12"
                step="0.5"
                value={gameState.manualSpeed}
                onChange={handleSpeedChange}
                className="w-full h-1.5 rounded-lg bg-slate-800 appearance-none cursor-pointer accent-emerald-400"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>Pomalý let</span>
                <span>Vysoká rychlost</span>
              </div>
            </div>

            {/* Firing Rate slider */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label htmlFor="firerate-slider" className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                  <Sword className="w-3.5 h-3.5 text-rose-400" /> Rychlost střelby (cooldown)
                </label>
                <span className="text-xs font-mono text-rose-400 font-bold">{gameState.manualFireRate} ms</span>
              </div>
              <input
                id="firerate-slider"
                type="range"
                min="100"
                max="800"
                step="20"
                value={gameState.manualFireRate}
                onChange={handleFireRateChange}
                className="w-full h-1.5 rounded-lg bg-slate-800 appearance-none cursor-pointer accent-rose-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>Rychlá (100ms)</span>
                <span>Pomalá (800ms)</span>
              </div>
            </div>

            {/* Advanced Level Testing commands */}
            <div className="bg-slate-900/40 rounded-xl border border-slate-900 p-4 space-y-3 mt-4">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest flex items-center gap-1">
                <Sliders className="w-3.5 h-3.5" /> Správce úrovní
              </h3>
              
              <div className="grid grid-cols-2 gap-2">
                <button
                  id="btn-skip-level"
                  onClick={onSkipLevel}
                  className="px-3 py-2 rounded bg-slate-950 border border-slate-800 hover:bg-slate-900 text-xs text-amber-500 font-semibold transition flex items-center justify-center gap-1"
                >
                  <SkipForward className="w-3.5 h-3.5" /> Přeskočit
                </button>
                <button
                  id="btn-level1"
                  onClick={() => onStartLevel(1)}
                  className="px-3 py-2 rounded bg-slate-950 border border-slate-800 hover:bg-slate-900 text-xs text-slate-300 transition"
                >
                  Přejít na 1. úroveň
                </button>
                <button
                  id="btn-level2"
                  onClick={() => onStartLevel(2)}
                  className="px-3 py-2 rounded bg-slate-950 border border-slate-800 hover:bg-slate-900 text-xs text-slate-300 transition"
                >
                  Přejít na 2. úroveň
                </button>
                <button
                  id="btn-level3"
                  onClick={() => onStartLevel(3)}
                  className="px-3 py-2 rounded bg-slate-950 border border-slate-800 hover:bg-slate-900 text-xs text-slate-300 transition"
                >
                  Přejít na 3. úroveň
                </button>
              </div>
            </div>

            {/* Gameplay Rules Refcard */}
            <div className="bg-slate-950 rounded-xl border border-slate-900 p-4 space-y-2 text-slate-400">
              <h4 className="text-xs font-bold text-slate-300 flex items-center gap-1 uppercase">
                <HelpCircle className="w-3.5 h-3.5" /> Přehled nebezpečí v biomech
              </h4>
              <ul className="space-y-1 text-[11px] list-disc pl-4 leading-relaxed">
                <li><strong className="text-rose-400">1. úroveň:</strong> Nagy se plazí; dračí příšery střílejí zelené kyselinové kapky vodorovně.</li>
                <li><strong className="text-orange-400">2. úroveň:</strong> Obří písečný červ se vynořuje svisle. Jeho ocas vystřeluje fialové jedovaté jehly.</li>
                <li><strong className="text-emerald-400">3. úroveň:</strong> Vyhýbání se větvím a kořenům stromů je POVINNÉ. Trpaslíci házejí trny v oblouku.</li>
              </ul>
            </div>

          </div>
        </div>

      </main>

    </div>
  );
};
