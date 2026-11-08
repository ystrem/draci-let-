import { useState, useRef, useEffect } from "react";
import {
  EragonGameState,
  SavedMapSlot,
  HORSE_BREEDS,
  WEAPON_OPTIONS,
  LOCATIONS,
  INITIAL_QUESTS,
  INITIAL_SPELLS
} from "../game/typesEragon";
import {
  loadAllSavedMaps,
  saveMapSlot,
  createNewSavedMap,
  deleteSavedMap,
  duplicateSavedMap
} from "../game/mapStorage";
import { ThreeEragonEngine } from "../game/threeEngine";
import { soundFX } from "../game/audioSystem";
import {
  Flame,
  Shield,
  Heart,
  Zap,
  Sword,
  MessageCircle,
  HelpCircle,
  Volume2,
  VolumeX,
  Compass,
  Coins,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Egg,
  Gamepad2,
  RefreshCw,
  FolderHeart,
  MapPin,
  Save,
  Copy,
  Trash2,
  Play,
  Plus,
  Edit2
} from "lucide-react";

const DRAGON_COLORS = [
  { name: "Safírově modrá (Safira)", hex: "#2563eb", belly: "#93c5fd", eye: "#38bdf8", desc: "Zářící azurové šupiny plné nebeské energie" },
  { name: "Smaragdově zelená (Fírnen)", hex: "#16a34a", belly: "#86efac", eye: "#4ade80", desc: "Temně zelené šupiny splývající s hvozdy" },
  { name: "Rubínově rudá (Thorn)", hex: "#dc2626", belly: "#fca5a5", eye: "#f87171", desc: "Ohnivě šarlatové šupiny vyzařující teplo" },
  { name: "Zlatavě bronzová (Glaedr)", hex: "#d97706", belly: "#fde68a", eye: "#facc15", desc: "Prastaré zlaté šupiny mudrce a učitele" },
  { name: "Noční stínová (Shruikan)", hex: "#1e293b", belly: "#64748b", eye: "#a855f7", desc: "Černé šupiny pohlcující světlo hvězd" }
];

const EYE_COLORS = [
  { name: "Modrá", hex: "#38bdf8" },
  { name: "Zelená", hex: "#22c55e" },
  { name: "Hnědá", hex: "#78350f" },
  { name: "Jantarová", hex: "#f59e0b" },
  { name: "Fialová", hex: "#a855f7" }
];

export function EragonGameView() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const engineRef = useRef<ThreeEragonEngine | null>(null);

  // Initial Game State
  const [gameState, setGameState] = useState<EragonGameState>({
    currentLocationId: "camp_night1",
    dayCount: 1,
    rider: {
      gender: "boy",
      name: "Eragon",
      eyeColor: "#38bdf8",
      eyeColorName: "Modrá",
      hairColor: "#451a03",
      tunicColor: "#1e3a8a",
      weapon: "sword"
    },
    dragon: {
      name: "Safira",
      scaleColor: "#2563eb",
      bellyColor: "#93c5fd",
      eyeColor: "#38bdf8",
      wingColor: "#1d4ed8",
      elementAbility: "fire",
      elementName: "Ohnivý Výbuch (Brisingr)",
      elementDesc: "Mocný proud ohně a vnitřní síly.",
      stage: "juvenile", // horse-sized
      growthProgress: 100
    },
    horse: {
      owned: false,
      colorName: "Vraník",
      bodyColor: "#171717",
      maneColor: "#0a0a0a",
      price: 35
    },
    isRidingHorse: false,
    playerHealth: 100,
    playerMaxHealth: 100,
    playerEnergy: 100,
    playerMaxEnergy: 100,
    healingPotions: 2,
    goldCoins: 20,
    bromHealth: 100,
    bromMaxHealth: 100,
    isSparringWithBrom: true,
    bromNoticeGiven: true,
    dragonBond: 25,
    unlockedSpells: [],
    quests: INITIAL_QUESTS,
    totalPlaytimeSeconds: 0,
    campaignTimeFormatted: "0h 00m / 4h 00m",
    isTelepathyOpen: false,
    currentTelepathyDialogue: null,
    lastCombatAction: "Vítej u táboráku! Brom po tobě hodí cvičný klacek. Stiskni Ctrl pro kotrmelec nebo E pro úder!",
    isPaused: false,
    isMuted: false,
    gameStatus: "character_creation" // starts with customization
  });

  // 4-Hour Campaign Clock Timer Effect (14400 seconds)
  useEffect(() => {
    if (gameState.gameStatus !== "adventure" || gameState.isPaused) return;

    const timer = setInterval(() => {
      setGameState((prev) => {
        const nextSecs = Math.min(14400, prev.totalPlaytimeSeconds + 1);
        const hours = Math.floor(nextSecs / 3600);
        const minutes = Math.floor((nextSecs % 3600) / 60);
        const formatted = `${hours}h ${minutes.toString().padStart(2, "0")}m / 4h 00m`;
        return {
          ...prev,
          totalPlaytimeSeconds: nextSecs,
          campaignTimeFormatted: formatted
        };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState.gameStatus, gameState.isPaused]);

  // UI Modals & Dock State
  const [isDockCollapsed, setIsDockCollapsed] = useState(false);
  const [showStableModal, setShowStableModal] = useState(false);
  const [showSavedMapsModal, setShowSavedMapsModal] = useState(false);
  const [showJourneyMapModal, setShowJourneyMapModal] = useState(false); // Detailed book journey map of Alagaësia
  const [savedMaps, setSavedMaps] = useState<SavedMapSlot[]>(() => loadAllSavedMaps());
  const [newMapNameInput, setNewMapNameInput] = useState("");
  const [editingSlotId, setEditingSlotId] = useState<string | null>(null);
  const [editingTitleInput, setEditingTitleInput] = useState("");
  const [hatchProgress, setHatchProgress] = useState(0);

  // Keyboard shortcut L to toggle Saved Maps, J to toggle Alagaësia Journey Map
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "KeyL" || e.code === "KeyO") {
        setSavedMaps(loadAllSavedMaps());
        setShowSavedMapsModal((prev) => !prev);
      }
      if (e.code === "KeyJ" || e.key === "j" || e.key === "J") {
        setShowJourneyMapModal((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Initialize 3D Engine when exiting character creation
  useEffect(() => {
    if (gameState.gameStatus === "adventure" && containerRef.current && !engineRef.current) {
      const engine = new ThreeEragonEngine(
        containerRef.current,
        gameState,
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
  }, [gameState.gameStatus]);

  // Current location information
  const currentLocation = LOCATIONS.find((l) => l.id === gameState.currentLocationId) || LOCATIONS[0];

  const handleStartEggHatching = () => {
    setGameState((prev) => ({ ...prev, gameStatus: "egg_hatching" }));
    soundFX.playDragonCall(true);
  };

  const handleHatchTouch = () => {
    soundFX.playTelepathy();
    soundFX.playDragonCall(true);
    let prog = 0;
    const interval = setInterval(() => {
      prog += 20;
      setHatchProgress(prog);
      if (prog >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          soundFX.playDragonCall(false);
          setGameState((prev) => ({
            ...prev,
            gameStatus: "adventure",
            lastCombatAction: `Drak vyrostl do velikosti koně! Brom si všiml změny a vyzývá tě k cestě k Vardenům. Usedli jste k prvnímu táboráku.`
          }));
        }, 1200);
      }
    }, 400);
  };

  const handleToggleMute = () => {
    const newMuted = !gameState.isMuted;
    soundFX.setMuted(newMuted);
    if (!newMuted && gameState.currentLocationId === "camp_night1" && gameState.gameStatus === "adventure") {
      soundFX.startCampfireAmbient();
    }
    setGameState((prev) => ({
      ...prev,
      isMuted: newMuted,
      lastCombatAction: newMuted ? "🔇 Zvuk byl vypnut (tichý režim)." : "🔊 Zvuk byl zapnut."
    }));
  };

  // Saved Maps Handlers
  const handleLoadMap = (slot: SavedMapSlot) => {
    soundFX.playTelepathy();
    setGameState({ ...slot.state, gameStatus: "adventure" });
    if (engineRef.current) {
      engineRef.current.loadGameState({ ...slot.state, gameStatus: "adventure" });
    }
    setShowSavedMapsModal(false);
  };

  const handleSaveToSlot = (slotId: string, currentTitle: string) => {
    soundFX.playCoin();
    const updated = saveMapSlot(slotId, currentTitle, gameState);
    setSavedMaps(updated);
    setGameState((prev) => ({
      ...prev,
      lastCombatAction: `💾 Mapa úspěšně uložena do slotu "${currentTitle}"!`
    }));
  };

  const handleCreateNewMapSlot = () => {
    const title = newMapNameInput.trim() || `Mapa ${savedMaps.length + 1} (${currentLocation.name})`;
    soundFX.playCoin();
    const updated = createNewSavedMap(title, gameState);
    setSavedMaps(updated);
    setNewMapNameInput("");
    setGameState((prev) => ({
      ...prev,
      lastCombatAction: `✨ Vytvořena a uložena nová mapa "${title}"!`
    }));
  };

  const handleDeleteMap = (slotId: string) => {
    if (savedMaps.length <= 1) {
      alert("Musí zůstat alespoň jedna uložená mapa!");
      return;
    }
    const updated = deleteSavedMap(slotId);
    setSavedMaps(updated);
  };

  const handleDuplicateMap = (slotId: string) => {
    soundFX.playCoin();
    const updated = duplicateSavedMap(slotId);
    setSavedMaps(updated);
  };

  const handleFinishRename = (slotId: string) => {
    if (!editingTitleInput.trim()) {
      setEditingSlotId(null);
      return;
    }
    const slot = savedMaps.find((m) => m.id === slotId);
    if (slot) {
      const updated = saveMapSlot(slotId, editingTitleInput.trim(), slot.state);
      setSavedMaps(updated);
    }
    setEditingSlotId(null);
    setEditingTitleInput("");
  };

  return (
    <div className="relative w-full h-full select-none overflow-hidden bg-slate-950 font-sans text-slate-100">
      {/* 3D WebGL Canvas Container */}
      <div ref={containerRef} className="w-full h-full absolute inset-0" />

      {/* SCREEN 1: CHARACTER & DRAGON CREATION */}
      {gameState.gameStatus === "character_creation" && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-950/95 p-4 overflow-y-auto">
          <div className="max-w-3xl w-full bg-slate-900 border border-indigo-500/30 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6 relative">
            {/* Top Sound Toggle Button */}
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <span className="text-xs font-bold uppercase tracking-widest text-indigo-400">
                Příběh Dračího Jezdce podle knihy Eragon
              </span>
              <button
                onClick={handleToggleMute}
                className={`px-3 py-1 rounded-xl text-xs font-bold border transition flex items-center gap-1.5 shadow-md ${
                  gameState.isMuted
                    ? "bg-rose-950/90 border-rose-600/70 text-rose-300 hover:bg-rose-900"
                    : "bg-emerald-950/90 border-emerald-600/70 text-emerald-300 hover:bg-emerald-900"
                }`}
                title={gameState.isMuted ? "Zapnout zvuk" : "Vypnout zvuk"}
              >
                {gameState.isMuted ? (
                  <>
                    <VolumeX className="w-3.5 h-3.5 text-rose-400" />
                    <span>Zvuk: VYP</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Zvuk: ZAP</span>
                  </>
                )}
              </button>
            </div>

            <div className="text-center space-y-2">
              <h1 className="text-2xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-amber-300">
                Tvorba Jezdce a Dračího Vejce
              </h1>
              <p className="text-slate-400 text-xs sm:text-sm max-w-xl mx-auto">
                Vyberte si svého panáčka, barvu očí a zbraň. Zvolte jméno a barvu vašeho dračího vejce!
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Rider Customization */}
              <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4 space-y-4">
                <h3 className="font-bold text-sm text-indigo-300 flex items-center gap-2">
                  <Sword className="w-4 h-4 text-indigo-400" /> Váš Panáček (Jezdec)
                </h3>

                {/* Gender */}
                <div>
                  <label className="text-xs text-slate-400 block mb-1.5 font-medium">Pohlaví panáčka:</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() =>
                        setGameState((prev) => ({
                          ...prev,
                          rider: { ...prev.rider, gender: "boy", name: prev.rider.name || "Eragon" }
                        }))
                      }
                      className={`px-3 py-2 rounded-lg text-xs font-semibold border transition ${
                        gameState.rider.gender === "boy"
                          ? "bg-indigo-600 border-indigo-400 text-white"
                          : "bg-slate-900/60 border-slate-700 text-slate-300"
                      }`}
                    >
                      Kluk (Mladý jezdec)
                    </button>
                    <button
                      onClick={() =>
                        setGameState((prev) => ({
                          ...prev,
                          rider: { ...prev.rider, gender: "girl", name: prev.rider.name || "Arya" }
                        }))
                      }
                      className={`px-3 py-2 rounded-lg text-xs font-semibold border transition ${
                        gameState.rider.gender === "girl"
                          ? "bg-indigo-600 border-indigo-400 text-white"
                          : "bg-slate-900/60 border-slate-700 text-slate-300"
                      }`}
                    >
                      Holka (Dračí jezdkyně)
                    </button>
                  </div>
                </div>

                {/* Rider Name */}
                <div>
                  <label className="text-xs text-slate-400 block mb-1 font-medium">Jméno jezdce:</label>
                  <input
                    type="text"
                    value={gameState.rider.name}
                    onChange={(e) =>
                      setGameState((prev) => ({
                        ...prev,
                        rider: { ...prev.rider, name: e.target.value }
                      }))
                    }
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                {/* Eye Color */}
                <div>
                  <label className="text-xs text-slate-400 block mb-1 font-medium">Barva očí:</label>
                  <div className="flex flex-wrap gap-2">
                    {EYE_COLORS.map((eye) => (
                      <button
                        key={eye.name}
                        onClick={() =>
                          setGameState((prev) => ({
                            ...prev,
                            rider: { ...prev.rider, eyeColor: eye.hex, eyeColorName: eye.name }
                          }))
                        }
                        className={`px-2.5 py-1 rounded-md text-xs font-medium border flex items-center gap-1.5 transition ${
                          gameState.rider.eyeColor === eye.hex
                            ? "bg-indigo-950 border-indigo-400 text-white"
                            : "bg-slate-900/80 border-slate-700 text-slate-300"
                        }`}
                      >
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: eye.hex }} />
                        {eye.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Weapon Selection */}
                <div>
                  <label className="text-xs text-slate-400 block mb-1.5 font-medium">Zbraň jezdce:</label>
                  <div className="space-y-1.5">
                    {WEAPON_OPTIONS.map((w) => (
                      <button
                        key={w.id}
                        onClick={() =>
                          setGameState((prev) => ({
                            ...prev,
                            rider: { ...prev.rider, weapon: w.id }
                          }))
                        }
                        className={`w-full text-left p-2 rounded-lg border text-xs transition flex items-center justify-between ${
                          gameState.rider.weapon === w.id
                            ? "bg-indigo-900/40 border-indigo-400 text-white"
                            : "bg-slate-900/50 border-slate-700/60 text-slate-300"
                        }`}
                      >
                        <div>
                          <div className="font-semibold flex items-center gap-1.5">
                            <span>{w.icon}</span> {w.name}
                          </div>
                          <div className="text-[11px] text-slate-400">{w.description}</div>
                        </div>
                        <span className="text-amber-400 font-bold ml-2">Útok {w.damage}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Dragon Customization */}
              <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4 space-y-4">
                <h3 className="font-bold text-sm text-blue-300 flex items-center gap-2">
                  <Egg className="w-4 h-4 text-blue-400" /> Drak (Vzhled & Schopnosti)
                </h3>

                {/* Dragon Name */}
                <div>
                  <label className="text-xs text-slate-400 block mb-1 font-medium">Jméno draka:</label>
                  <input
                    type="text"
                    value={gameState.dragon.name}
                    onChange={(e) =>
                      setGameState((prev) => ({
                        ...prev,
                        dragon: { ...prev.dragon, name: e.target.value }
                      }))
                    }
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Dragon Color */}
                <div>
                  <label className="text-xs text-slate-400 block mb-1 font-medium">Barva šupin draka:</label>
                  <div className="space-y-1.5">
                    {DRAGON_COLORS.map((col) => (
                      <button
                        key={col.name}
                        onClick={() =>
                          setGameState((prev) => ({
                            ...prev,
                            dragon: {
                              ...prev.dragon,
                              scaleColor: col.hex,
                              bellyColor: col.belly,
                              eyeColor: col.eye
                            }
                          }))
                        }
                        className={`w-full text-left p-2 rounded-lg border text-xs transition flex items-center justify-between ${
                          gameState.dragon.scaleColor === col.hex
                            ? "bg-blue-900/40 border-blue-400 text-white"
                            : "bg-slate-900/50 border-slate-700/60 text-slate-300"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-4 h-4 rounded-full border border-white/30" style={{ backgroundColor: col.hex }} />
                          <span className="font-semibold">{col.name}</span>
                        </div>
                        <span className="text-[11px] text-slate-400 hidden sm:inline">{col.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Dragon Ability */}
                <div>
                  <label className="text-xs text-slate-400 block mb-1 font-medium">Vrozená schopnost:</label>
                  <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-700 text-xs">
                    <div className="text-amber-400 font-bold flex items-center gap-1.5">
                      <Flame className="w-4 h-4" /> {gameState.dragon.elementName}
                    </div>
                    <div className="text-slate-400 mt-0.5">{gameState.dragon.elementDesc}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Launch Button & Load Saved Maps Option */}
            <div className="text-center pt-2 space-y-2">
              <button
                onClick={handleStartEggHatching}
                className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/25 transition active:scale-95 text-sm sm:text-base flex items-center justify-center gap-2 mx-auto"
              >
                <Sparkles className="w-5 h-5 text-amber-300" />
                Vstoupit do Alagaësie a Vylíhnout Draka
              </button>

              <div>
                <button
                  onClick={() => {
                    setSavedMaps(loadAllSavedMaps());
                    setShowSavedMapsModal(true);
                  }}
                  className="px-4 py-1.5 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 rounded-lg text-xs font-semibold text-indigo-300 hover:text-indigo-200 transition flex items-center gap-1.5 mx-auto"
                >
                  <FolderHeart className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Nebo načíst existující uloženou mapu / svět ({savedMaps.length})</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SCREEN 2: EGG HATCHING & RAPID GROWTH TO HORSE SIZE */}
      {gameState.gameStatus === "egg_hatching" && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-950/95 p-4">
          <div className="max-w-lg w-full bg-slate-900 border border-blue-500/40 rounded-2xl p-6 sm:p-8 text-center space-y-6 shadow-2xl relative">
            {/* Sound Toggle Button */}
            <div className="flex justify-end -mt-2 -mr-2">
              <button
                onClick={handleToggleMute}
                className={`px-3 py-1 rounded-xl text-xs font-bold border transition flex items-center gap-1.5 shadow-md ${
                  gameState.isMuted
                    ? "bg-rose-950/90 border-rose-600/70 text-rose-300 hover:bg-rose-900"
                    : "bg-emerald-950/90 border-emerald-600/70 text-emerald-300 hover:bg-emerald-900"
                }`}
                title={gameState.isMuted ? "Zapnout zvuk" : "Vypnout zvuk"}
              >
                {gameState.isMuted ? (
                  <>
                    <VolumeX className="w-3.5 h-3.5 text-rose-400" />
                    <span>Zvuk: VYP</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Zvuk: ZAP</span>
                  </>
                )}
              </button>
            </div>

            <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-blue-500 via-indigo-600 to-slate-900 border-2 border-blue-400 flex items-center justify-center shadow-lg shadow-blue-500/40 animate-pulse">
              <Egg className="w-12 h-12 text-blue-200" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-extrabold text-blue-300">
                Dračí vejce se chvěje v trávě!
              </h2>
              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                Z kamene se ozývá tiché ťukání. Na skořápce září praskliny protkané safírovým světlem.
                Dotkněte se skořápky dlaní!
              </p>
            </div>

            {hatchProgress === 0 ? (
              <button
                onClick={handleHatchTouch}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 transition text-sm flex items-center justify-center gap-2 mx-auto active:scale-95"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                Dotknout se vajíčka (Získat Gedwëy Ignasia)
              </button>
            ) : (
              <div className="space-y-3">
                <div className="text-xs text-amber-300 font-semibold">
                  {hatchProgress < 100
                    ? "✨ Mládě se líhne a rychle roste před tvýma očima..."
                    : "🐉 Drak je velký jako kůň! Brom si toho všiml!"}
                </div>
                <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden border border-slate-700">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-indigo-400 h-full transition-all duration-300"
                    style={{ width: `${hatchProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* HUD OVERLAY (Only in 3D Adventure Mode) */}
      {gameState.gameStatus === "adventure" && (
        <div className="pointer-events-none absolute inset-0 z-20 flex flex-col justify-between p-3 sm:p-4">
          {/* Top Bar: Location & Player Status */}
          <div className="flex flex-wrap items-start justify-between gap-3">
            {/* Location & Day Badge */}
            <div className="pointer-events-auto bg-slate-900/90 border border-slate-800 px-3.5 py-2 rounded-xl backdrop-blur-sm shadow-lg space-y-0.5">
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-indigo-400" />
                <span className="font-bold text-xs sm:text-sm text-indigo-200">
                  {currentLocation.name}
                </span>
                <span className="bg-indigo-950 border border-indigo-700 text-indigo-300 text-[10px] px-1.5 py-0.5 rounded font-mono">
                  Den {gameState.dayCount}
                </span>
                <span className="bg-amber-950/80 border border-amber-600/70 text-amber-300 text-[10px] px-2 py-0.5 rounded-full font-mono flex items-center gap-1 shadow-sm" title="Celková délka velkého příběhu Alagaësie: 4 hodiny">
                  <span>⏳</span>
                  <span>{gameState.campaignTimeFormatted || "0h 00m / 4h 00m"}</span>
                </span>
              </div>
              <div className="text-[11px] text-slate-400 max-w-xs sm:max-w-md truncate">
                {currentLocation.subtitle}
              </div>

              {/* Movement & Controls Legend */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[10px] text-slate-300 border-t border-slate-800/60 mt-1">
                <span className="bg-indigo-950 border border-indigo-700/80 text-indigo-300 px-1.5 py-0.2 rounded font-mono font-bold">W,A,S,D</span>
                <span>Pohyb</span>
                <span className="text-slate-600">•</span>
                <span className="bg-amber-950 border border-amber-700/80 text-amber-300 px-1.5 py-0.2 rounded font-mono font-bold">Mezerník</span>
                <span>Kůň</span>
                <span className="text-slate-600">•</span>
                <span className="bg-slate-800 border border-slate-700 text-slate-200 px-1.5 py-0.2 rounded font-mono font-bold">Ctrl</span>
                <span>Kotrmelec</span>
                <span className="text-slate-600">•</span>
                <span className="bg-rose-950 border border-rose-700/80 text-rose-300 px-1.5 py-0.2 rounded font-mono font-bold">E</span>
                <span>Úder</span>
                <span className="text-slate-600">•</span>
                <span className="bg-emerald-950 border border-emerald-700/80 text-emerald-300 px-1.5 py-0.2 rounded font-mono font-bold">F</span>
                <span>Uzdravit</span>
                <span className="text-slate-600">•</span>
                <span className="bg-amber-950 border border-amber-700/80 text-amber-200 px-1.5 py-0.2 rounded font-mono font-bold">B</span>
                <span>Brom (Kůň & Řeč)</span>
              </div>
            </div>

            {/* Dragon & Rider Status Cards */}
            <div className="pointer-events-auto flex items-center gap-2">
              {/* Health & Energy */}
              <div className="bg-slate-900/90 border border-slate-800 px-3 py-1.5 rounded-xl shadow-lg space-y-1">
                <div className="flex items-center gap-1.5 text-xs">
                  <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                  <span className="font-semibold text-slate-200">Životy:</span>
                  <span className="font-mono text-rose-400 font-bold">
                    {Math.round(gameState.playerHealth)} / {gameState.playerMaxHealth}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs">
                  <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  <span className="font-semibold text-slate-200">Energie:</span>
                  <span className="font-mono text-amber-400 font-bold">
                    {Math.round(gameState.playerEnergy)} / {gameState.playerMaxEnergy}
                  </span>
                </div>
              </div>

              {/* Potions & Gold */}
              <div className="bg-slate-900/90 border border-slate-800 px-3 py-1.5 rounded-xl shadow-lg flex items-center gap-3 text-xs">
                <div className="flex items-center gap-1 text-amber-300 font-bold" title="Zlaťáky z pomoci obyvatelům">
                  <Coins className="w-4 h-4 text-amber-400" />
                  <span>{gameState.goldCoins}</span>
                </div>
                <div className="flex items-center gap-1 text-rose-400 font-bold" title="Léčivé lahvičky (Stiskni F)">
                  <span className="text-sm">🧪</span>
                  <span>{gameState.healingPotions}</span>
                </div>
              </div>

              {/* Map of Alagaësia Book Journey Button */}
              <button
                onClick={() => setShowJourneyMapModal(true)}
                className="bg-slate-900/90 border border-amber-500/70 hover:bg-amber-950 px-3 py-1.5 rounded-xl shadow-lg flex items-center gap-1.5 text-xs font-bold text-amber-300 transition"
                title="Podrobná mapa cesty Alagaësií podle knihy (Klávesa J)"
              >
                <Compass className="w-4 h-4 text-amber-400" />
                <span>Cesta Alagaësií [J]</span>
              </button>

              {/* Saved Maps Manager Button */}
              <button
                onClick={() => {
                  setSavedMaps(loadAllSavedMaps());
                  setShowSavedMapsModal(true);
                }}
                className="bg-slate-900/90 border border-indigo-600/70 hover:bg-indigo-950 px-3 py-1.5 rounded-xl shadow-lg flex items-center gap-1.5 text-xs font-bold text-indigo-300 transition"
                title="Správce uložených map a světů (Klávesa L)"
              >
                <FolderHeart className="w-4 h-4 text-indigo-400" />
                <span>Mapy ({savedMaps.length}) [L]</span>
              </button>

              {/* Sound Toggle Button */}
              <button
                onClick={handleToggleMute}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition flex items-center gap-1.5 shadow-md ${
                  gameState.isMuted
                    ? "bg-rose-950/90 border-rose-600/70 text-rose-300 hover:bg-rose-900"
                    : "bg-emerald-950/90 border-emerald-600/70 text-emerald-300 hover:bg-emerald-900"
                }`}
                title={gameState.isMuted ? "Zapnout zvuk (Klávesa M)" : "Vypnout zvuk (Klávesa M)"}
              >
                {gameState.isMuted ? (
                  <>
                    <VolumeX className="w-4 h-4 text-rose-400" />
                    <span>Zvuk: VYP [M]</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-4 h-4 text-emerald-400" />
                    <span>Zvuk: ZAP [M]</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Action Notification Banner */}
          {gameState.lastCombatAction && (
            <div className="self-center pointer-events-auto bg-slate-900/95 border border-amber-500/40 text-amber-200 px-4 py-2 rounded-xl text-xs sm:text-sm font-medium shadow-xl max-w-lg text-center animate-fade-in">
              {gameState.lastCombatAction}
            </div>
          )}

          {/* Unified Collapsible Bottom Dock (Adhering to Three.js skill guidelines) */}
          <div className="pointer-events-auto self-center w-full max-w-3xl flex flex-col items-center">
            {/* Collapse / Expand Toggle Button */}
            <button
              onClick={() => setIsDockCollapsed((prev) => !prev)}
              className="bg-slate-900/90 border border-slate-800 px-3 py-1 rounded-t-lg text-xs font-semibold text-slate-300 hover:text-white flex items-center gap-1 shadow-md transition -mb-px"
            >
              {isDockCollapsed ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              <span>{isDockCollapsed ? "▴ Zobrazit ovládání" : "▾ Skrýt panel"}</span>
            </button>

            {!isDockCollapsed && (
              <div className="w-full bg-slate-900/95 border border-slate-800 rounded-2xl p-3 sm:p-4 shadow-2xl backdrop-blur-md space-y-3">
                {/* Action Buttons Row */}
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <button
                    onClick={() => engineRef.current?.performDodge()}
                    className="px-3 py-1.5 bg-indigo-950 border border-indigo-700 hover:bg-indigo-900 rounded-lg text-xs font-bold text-indigo-300 transition flex items-center gap-1.5"
                    title="Udělat kotrmelec a vyhnout se ráně"
                  >
                    <span className="bg-indigo-800 px-1.5 py-0.5 rounded text-[10px] text-white">Ctrl</span>
                    <span>Kotrmelec</span>
                  </button>

                  <button
                    onClick={() => engineRef.current?.performAttack()}
                    className="px-3 py-1.5 bg-rose-950 border border-rose-700 hover:bg-rose-900 rounded-lg text-xs font-bold text-rose-300 transition flex items-center gap-1.5"
                    title="Zasadit úder Bromovi nebo protivníkovi"
                  >
                    <span className="bg-rose-800 px-1.5 py-0.5 rounded text-[10px] text-white">E</span>
                    <span>Úder zbraní</span>
                  </button>

                  <button
                    onClick={() => engineRef.current?.performHeal()}
                    className="px-3 py-1.5 bg-emerald-950 border border-emerald-700 hover:bg-emerald-900 rounded-lg text-xs font-bold text-emerald-300 transition flex items-center gap-1.5"
                    title="Uzdravit se lahvičkou nebo kouzlem"
                  >
                    <span className="bg-emerald-800 px-1.5 py-0.5 rounded text-[10px] text-white">F</span>
                    <span>Uzdravit</span>
                  </button>

                  <button
                    onClick={() => engineRef.current?.toggleHorseRide()}
                    className="px-3 py-1.5 bg-amber-950 border border-amber-700 hover:bg-amber-900 rounded-lg text-xs font-bold text-amber-300 transition flex items-center gap-1.5"
                    title="Nasednout nebo sesednout z koně"
                  >
                    <span className="bg-amber-800 px-1.5 py-0.5 rounded text-[10px] text-white">Mezerník</span>
                    <span>{gameState.isRidingHorse ? "Sesednout" : "Nasednout"}</span>
                  </button>

                  <button
                    onClick={() => engineRef.current?.openTelepathy()}
                    className="px-3 py-1.5 bg-blue-950 border border-blue-700 hover:bg-blue-900 rounded-lg text-xs font-bold text-blue-300 transition flex items-center gap-1.5"
                    title="Povídání s drakem v mysli (Brom tě neslyší)"
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-blue-400" />
                    <span>Mysl draka (T)</span>
                  </button>

                  <button
                    onClick={() => engineRef.current?.openBromDialogue()}
                    className="px-3 py-1.5 bg-amber-950/80 border border-amber-600 hover:bg-amber-900 rounded-lg text-xs font-bold text-amber-200 transition flex items-center gap-1.5 shadow-sm"
                    title="Mluvit se starým Bromem o jeho bělouši Sněžné hřívě, Jezdcích a kouzlech"
                  >
                    <span>🧙‍♂️ Mluvit s Bromem [B]</span>
                  </button>

                  <button
                    onClick={handleToggleMute}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition flex items-center gap-1.5 ${
                      gameState.isMuted
                        ? "bg-rose-950 border-rose-700 text-rose-300 hover:bg-rose-900"
                        : "bg-slate-800 border-slate-700 text-slate-300 hover:text-white"
                    }`}
                    title="Vypnout nebo zapnout zvuk (Klávesa M)"
                  >
                    {gameState.isMuted ? (
                      <VolumeX className="w-3.5 h-3.5 text-rose-400" />
                    ) : (
                      <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                    )}
                    <span>{gameState.isMuted ? "Zvuk VYP [M]" : "Zvuk ZAP [M]"}</span>
                  </button>
                </div>

                {/* Ancient Language Magic Spells Row (Progressive Learning) */}
                <div className="flex flex-wrap items-center justify-center gap-2 pt-2 border-t border-slate-800/80">
                  <div className="text-[11px] font-bold text-indigo-300 flex items-center gap-1 mr-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>Kouzla Starodávného jazyka:</span>
                  </div>

                  {INITIAL_SPELLS.map((spell) => {
                    const isUnlocked = gameState.unlockedSpells.includes(spell.id);

                    if (isUnlocked) {
                      return (
                        <button
                          key={spell.id}
                          onClick={() => engineRef.current?.castSpell(spell.id)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition flex items-center gap-1.5 shadow-sm active:scale-95 ${
                            spell.id === "brisingr"
                              ? "bg-orange-950 border-orange-700 hover:bg-orange-900 text-orange-200"
                              : spell.id === "skolir"
                              ? "bg-sky-950 border-sky-600 hover:bg-sky-900 text-sky-200"
                              : spell.id === "waise_heill"
                              ? "bg-emerald-950 border-emerald-600 hover:bg-emerald-900 text-emerald-200"
                              : "bg-purple-950 border-purple-600 hover:bg-purple-900 text-purple-200"
                          }`}
                          title={`${spell.name} (${spell.ancientWord}) - Cena: ${spell.cost} energie`}
                        >
                          <span className="bg-black/40 px-1.5 py-0.2 rounded text-[10px] font-mono text-white">
                            [{spell.keyNumber}]
                          </span>
                          {spell.id === "brisingr" && <Flame className="w-3.5 h-3.5 text-orange-400" />}
                          {spell.id === "skolir" && <Shield className="w-3.5 h-3.5 text-sky-400" />}
                          {spell.id === "waise_heill" && <Heart className="w-3.5 h-3.5 text-emerald-400" />}
                          {spell.id === "jierda" && <Zap className="w-3.5 h-3.5 text-purple-400" />}
                          <span>{spell.ancientWord}</span>
                          <span className="text-[10px] opacity-75">({spell.cost}⚡)</span>
                        </button>
                      );
                    } else {
                      return (
                        <div
                          key={spell.id}
                          className="px-2.5 py-1 bg-slate-900/60 border border-slate-800 rounded-lg text-[11px] text-slate-500 flex items-center gap-1.5 cursor-not-allowed"
                          title={`Kouzlo zamčeno. Odemkne se v lokaci: ${spell.unlockLocationName}`}
                        >
                          <span>🔒</span>
                          <span className="line-through">{spell.ancientWord}</span>
                          <span className="text-[10px] text-indigo-400/70">({spell.unlockLocationName})</span>
                        </div>
                      );
                    }
                  })}
                </div>

                {/* Sub-Actions & Town Travel Row */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800 text-xs">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowStableModal(true)}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-slate-300 transition flex items-center gap-1"
                    >
                      <span>🐴 Stáje / Koně</span>
                    </button>

                    <button
                      onClick={() => engineRef.current?.buyPotion()}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-slate-300 transition flex items-center gap-1"
                      title="Koupit léčivou lahvičku (12 zlaťáků)"
                    >
                      <span>🧪 Koupit lektvar (12z)</span>
                    </button>

                    <button
                      onClick={() => engineRef.current?.completeCitizenTask()}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-slate-300 transition flex items-center gap-1"
                      title="Pomoci obyvatelům města se zásobami"
                    >
                      <span>💰 Pomoc měšťanům</span>
                    </button>

                    <button
                      onClick={() => {
                        setSavedMaps(loadAllSavedMaps());
                        setShowSavedMapsModal(true);
                      }}
                      className="px-2.5 py-1 bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-700/60 rounded-lg text-indigo-300 font-semibold transition flex items-center gap-1"
                      title="Správce a přepínání uložených map (Klávesa L)"
                    >
                      <FolderHeart className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Mapy ({savedMaps.length})</span>
                    </button>
                  </div>

                  <button
                    onClick={() => engineRef.current?.advanceJourney()}
                    className="px-4 py-1.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold rounded-lg shadow-md transition flex items-center gap-1.5"
                  >
                    <span>Vyrazit do dalšího města (4 dny)</span>
                    <span>➔</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL: TELEPATHY WITH DRAGON ("s drakem si v mysli muzes povidat Brom te neslysi") */}
      {gameState.isTelepathyOpen && gameState.currentTelepathyDialogue && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4">
          <div className="max-w-lg w-full bg-slate-900 border-2 border-blue-500/60 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-blue-900/60 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-blue-400 animate-pulse" />
                <h3 className="font-bold text-sm text-blue-300">
                  Myšlenkové pouto • {gameState.dragon.name}
                </h3>
              </div>
              <span className="text-[11px] text-slate-400 italic">Brom tě neslyší</span>
            </div>

            {/* City Lore Notification ("drak ve meste nebude") */}
            {["terinsford", "yazuak", "daret", "teirm"].includes(gameState.currentLocationId) && (
              <div className="bg-slate-800/80 border border-indigo-500/40 rounded-xl p-2.5 text-[11px] text-indigo-300 flex items-center gap-2">
                <span>🌲</span>
                <span>
                  {gameState.dragon.name} se skrývá v lesích za hradbami města před zraky vojáků a Ra'zaků. Promlouvá k tobě v mysli na dálku!
                </span>
              </div>
            )}

            <div className="bg-blue-950/40 border border-blue-800/40 rounded-xl p-3.5 text-xs sm:text-sm text-blue-100 italic leading-relaxed">
              "{gameState.currentTelepathyDialogue.dragonVoice}"
            </div>

            <div className="space-y-2">
              <div className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
                Vyber svou myšlenkovou odpověď:
              </div>
              {gameState.currentTelepathyDialogue.choices.map((c, idx) => (
                <button
                  key={idx}
                  onClick={() => engineRef.current?.answerTelepathy(idx)}
                  className="w-full text-left p-2.5 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 rounded-lg text-xs text-slate-200 transition"
                >
                  {c.text}
                </button>
              ))}
            </div>

            <button
              onClick={() => setGameState((prev) => ({ ...prev, isTelepathyOpen: false }))}
              className="w-full py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-lg text-xs transition"
            >
              Uzavřít spojení myslí
            </button>
          </div>
        </div>
      )}

      {/* MODAL: NEW SPELL LEARNED (Progressive Ancient Language Unlock) */}
      {gameState.justUnlockedSpell && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-sm p-4 animate-fade-in">
          <div className="max-w-md w-full bg-slate-900 border-2 border-amber-500/80 rounded-2xl p-6 shadow-2xl text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-amber-500/30 to-indigo-600/30 border border-amber-400 flex items-center justify-center shadow-lg">
              <Sparkles className="w-8 h-8 text-amber-300 animate-pulse" />
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-widest text-amber-400">
                Odemčeno nové kouzlo ze Starodávného jazyka!
              </span>
              <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-orange-300 to-amber-200">
                "{gameState.justUnlockedSpell.ancientWord}"
              </h2>
              <div className="text-sm font-bold text-slate-200">
                {gameState.justUnlockedSpell.name}
              </div>
            </div>

            <div className="bg-slate-800/80 border border-slate-700 p-3 rounded-xl text-xs text-slate-300 leading-relaxed">
              {gameState.justUnlockedSpell.description}
            </div>

            <div className="flex items-center justify-center gap-2 text-xs text-indigo-300 font-mono">
              <span className="bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                Klávesa: [{gameState.justUnlockedSpell.keyNumber}]
              </span>
              <span>•</span>
              <span className="bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                Spotřeba: {gameState.justUnlockedSpell.cost} energie
              </span>
            </div>

            <button
              onClick={() => setGameState((prev) => ({ ...prev, justUnlockedSpell: null }))}
              className="w-full py-2.5 bg-gradient-to-r from-amber-600 to-indigo-600 hover:from-amber-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg transition active:scale-95 text-xs sm:text-sm"
            >
              Pokračovat v cestě (Naučeno)
            </button>
          </div>
        </div>
      )}

      {/* MODAL: TALK WITH BROM ("brom ma taky kone a mluvy") */}
      {gameState.isBromDialogueOpen && gameState.currentBromDialogue && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-sm p-4 animate-fade-in">
          <div className="max-w-lg w-full bg-slate-900 border-2 border-amber-600/70 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-amber-900/60 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-full bg-amber-950 border border-amber-600 flex items-center justify-center text-sm">
                  🧙‍♂️
                </span>
                <div>
                  <h3 className="font-bold text-sm text-amber-200">
                    Rozhovor s Bromem
                  </h3>
                  <div className="text-[10px] text-amber-400 font-medium">
                    Bělouš Sněžná hříva (Snowfire) • Bývalý Jezdec draků
                  </div>
                </div>
              </div>
              <button
                onClick={() => setGameState((prev) => ({ ...prev, isBromDialogueOpen: false }))}
                className="text-slate-400 hover:text-white text-xs bg-slate-800 p-1.5 rounded-lg transition"
              >
                ✕
              </button>
            </div>

            {/* Brom's Horse notice badge */}
            <div className="bg-amber-950/40 border border-amber-700/40 rounded-xl p-2.5 text-[11px] text-amber-200 flex items-center gap-2">
              <span>🐎</span>
              <span>
                <strong>Sněžná hříva (Snowfire)</strong>, Bromův ušlechtilý sněžný bělouš, tiše ržá po boku vašeho tábořiště.
              </span>
            </div>

            <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-3.5 text-xs sm:text-sm text-slate-100 italic leading-relaxed">
              "{gameState.currentBromDialogue.bromVoice}"
            </div>

            <div className="space-y-2">
              <div className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
                Odpověz Bromovi:
              </div>
              {gameState.currentBromDialogue.options.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => engineRef.current?.answerBromDialogue(idx)}
                  className="w-full text-left p-3 bg-slate-800/90 hover:bg-slate-700 border border-slate-700/80 rounded-xl text-xs text-amber-100 transition flex items-center justify-between group active:scale-[0.99]"
                >
                  <span>{opt.text}</span>
                  <span className="text-amber-400 opacity-0 group-hover:opacity-100 transition text-[11px]">
                    Zvolit ➔
                  </span>
                </button>
              ))}
            </div>

            <button
              onClick={() => setGameState((prev) => ({ ...prev, isBromDialogueOpen: false }))}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition"
            >
              Ukončit rozhovor
            </button>
          </div>
        </div>
      )}

      {/* MODAL: DETAILED BOOK MAP OF ALAGAËSIA JOURNEY ("ja chci aby ta cesta byla vydet a detailne jako v knize") */}
      {showJourneyMapModal && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-4 animate-fade-in">
          <div className="max-w-4xl w-full max-h-[92vh] bg-slate-900 border-2 border-amber-500/60 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
            {/* Map Header */}
            <div className="flex items-center justify-between border-b border-amber-900/60 p-4 sm:p-5 bg-gradient-to-r from-amber-950/60 via-slate-900 to-slate-950">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-950 border border-amber-500/80 flex items-center justify-center text-xl shadow-lg">
                  🗺️
                </div>
                <div>
                  <h3 className="font-extrabold text-base sm:text-lg text-amber-200 tracking-wide">
                    Podrobná mapa cesty Alagaësií podle knihy Eragon
                  </h3>
                  <p className="text-xs text-slate-400">
                    Z údolí Palancar přes řeku Ninor, pobřežní Teirm a poušť Hadarak až do Tronjheimu k Vardenům (4hodinová pouť)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowJourneyMapModal(false)}
                className="text-slate-400 hover:text-white text-sm bg-slate-800 p-2 rounded-xl transition"
              >
                ✕
              </button>
            </div>

            {/* Visual Illustrated Timeline of the Journey */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 bg-slate-950/40">
              {/* Alagaësia Route Steps */}
              <div className="relative border-l-2 border-amber-500/40 ml-4 sm:ml-6 space-y-6">
                {LOCATIONS.map((loc, idx) => {
                  const isCurrent = loc.id === gameState.currentLocationId;
                  const isPassed = loc.dayNumber < gameState.dayCount;
                  const isFuture = loc.dayNumber > gameState.dayCount;

                  return (
                    <div key={loc.id} className="relative pl-6 sm:pl-8 group">
                      {/* Node Circle */}
                      <div
                        className={`absolute -left-[17px] top-1 w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold transition shadow-md ${
                          isCurrent
                            ? "bg-amber-500 border-white text-slate-950 ring-4 ring-amber-500/30 animate-pulse scale-110"
                            : isPassed
                            ? "bg-emerald-900 border-emerald-400 text-emerald-200"
                            : "bg-slate-900 border-slate-700 text-slate-500"
                        }`}
                      >
                        {isPassed ? "✓" : idx + 1}
                      </div>

                      {/* Station Box */}
                      <div
                        className={`p-4 rounded-xl border transition space-y-2 ${
                          isCurrent
                            ? "bg-amber-950/40 border-amber-500/80 shadow-lg shadow-amber-500/10"
                            : isPassed
                            ? "bg-slate-900/80 border-slate-700/80"
                            : "bg-slate-900/40 border-slate-800/60 opacity-75"
                        }`}
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-sm sm:text-base text-slate-100">
                              {loc.name}
                            </span>
                            <span className="text-xs bg-slate-800 px-2 py-0.5 rounded-full font-mono text-amber-300 border border-slate-700">
                              Den {loc.dayNumber}
                            </span>
                            {isCurrent && (
                              <span className="text-xs bg-emerald-950 border border-emerald-500 text-emerald-300 px-2 py-0.5 rounded-full font-bold animate-pulse">
                                Právě zde
                              </span>
                            )}
                          </div>

                          {/* Quick Fast Travel / View button */}
                          <button
                            onClick={() => {
                              engineRef.current?.loadLocation(loc.id);
                              setShowJourneyMapModal(false);
                            }}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                              isCurrent
                                ? "bg-amber-600 text-white"
                                : "bg-slate-800 hover:bg-slate-700 text-slate-300"
                            }`}
                          >
                            <span>{isCurrent ? "Průzkum lokace" : "Cestovat sem ➔"}</span>
                          </button>
                        </div>

                        <div className="text-xs font-semibold text-amber-400/90">
                          {loc.subtitle}
                        </div>

                        <p className="text-xs text-slate-300 leading-relaxed">
                          {loc.description}
                        </p>

                        {/* Lore & Landmarks along route */}
                        <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-slate-400 border-t border-slate-800/60">
                          {loc.id === "camp_night1" && (
                            <>
                              <span className="text-indigo-400">🏔️ Dračí hory (The Spine)</span>
                              <span>•</span>
                              <span>🔥 První táborák & zkouška s klackem</span>
                              <span>•</span>
                              <span>🐉 Ležící drak u ohně</span>
                            </>
                          )}
                          {loc.id === "terinsford" && (
                            <>
                              <span className="text-amber-400">🐴 Trh s koňmi (Sněžná hříva & věrný kůň)</span>
                              <span>•</span>
                              <span>🌊 Řeka Anora</span>
                              <span>•</span>
                              <span>🧪 Lékárna měšťanů</span>
                            </>
                          )}
                          {loc.id === "yazuak" && (
                            <>
                              <span className="text-rose-400">⚔️ Přepadení Urgaly na řece Ninor</span>
                              <span>•</span>
                              <span>🔥 Zrození kouzla: Brisingr! [1]</span>
                              <span>•</span>
                              <span>🌫️ Mlžné zříceniny věží</span>
                            </>
                          )}
                          {loc.id === "daret" && (
                            <>
                              <span className="text-sky-400">🛡️ Dřevěná palisáda & kouzlo štítu: Skölir! [2]</span>
                              <span>•</span>
                              <span>🏹 Obrana mostu před nájezdníky</span>
                            </>
                          )}
                          {loc.id === "teirm" && (
                            <>
                              <span className="text-emerald-400">🏰 Hradby přístavu Teirm</span>
                              <span>•</span>
                              <span>🌿 Bylinkářka Angela a kočkodlak Solembum</span>
                              <span>•</span>
                              <span>✨ Kouzlo uzdravení: Waíse heill! [3]</span>
                            </>
                          )}
                          {loc.id === "hadarak" && (
                            <>
                              <span className="text-yellow-400">🏜️ Nekonečné duny pouště Hadarak</span>
                              <span>•</span>
                              <span>⚡ Kinetické kouzlo zlomení: Jierda! [4]</span>
                              <span>•</span>
                              <span>🏔️ Štíty Beorských hor</span>
                            </>
                          )}
                          {loc.id === "varden" && (
                            <>
                              <span className="text-purple-400">💎 Hvězdná růže (Isidar Mithrim)</span>
                              <span>•</span>
                              <span>🛡️ Mramorový sál Tronjheimu</span>
                              <span>•</span>
                              <span>👑 Spojení s Vardeny a Ajihad</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Map Footer */}
            <div className="p-4 bg-slate-950/80 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="text-slate-400">
                Tip: Klávesou <span className="bg-slate-800 text-amber-300 font-bold px-1.5 py-0.5 rounded">J</span> mapu kdykoliv otevřete nebo zavřete.
              </div>
              <button
                onClick={() => setShowJourneyMapModal(false)}
                className="px-5 py-2 bg-gradient-to-r from-amber-600 to-indigo-600 hover:from-amber-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-md transition"
              >
                Návrat do 3D světa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: HORSE STABLE (Buy Horse with Color Choices) */}
      {showStableModal && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4">
          <div className="max-w-md w-full bg-slate-900 border border-amber-500/40 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="font-bold text-base text-amber-300 flex items-center gap-2">
                <span>🐴</span> Koňské stáje v Terinsfordu
              </h3>
              <button
                onClick={() => setShowStableModal(false)}
                className="text-slate-400 hover:text-white text-xs"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Vyberte si barvu svého koně pro cestu přes Alagaësii k Vardenům.
              Váš zůstatek: <strong className="text-amber-400">{gameState.goldCoins} zlaťáků</strong>.
            </p>

            <div className="space-y-2">
              {HORSE_BREEDS.map((breed, idx) => (
                <div
                  key={breed.colorName}
                  className="p-3 bg-slate-800/70 border border-slate-700 rounded-xl flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className="w-4 h-4 rounded-full border border-white/30"
                      style={{ backgroundColor: breed.bodyColor }}
                    />
                    <div>
                      <div className="font-semibold text-slate-200">{breed.colorName}</div>
                      <div className="text-[11px] text-amber-400 font-mono">{breed.price} zlaťáků</div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      engineRef.current?.buyHorse(idx);
                      setShowStableModal(false);
                    }}
                    disabled={gameState.goldCoins < breed.price}
                    className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-bold rounded-lg transition"
                  >
                    Koupit
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: SAVED MAPS & WORLDS MANAGER */}
      {showSavedMapsModal && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-sm p-4">
          <div className="max-w-3xl w-full max-h-[90vh] bg-slate-900 border border-indigo-500/50 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 p-4 sm:p-5 bg-slate-950/60">
              <div className="flex items-center gap-2.5">
                <FolderHeart className="w-5 h-5 text-indigo-400" />
                <div>
                  <h3 className="font-bold text-base sm:text-lg text-indigo-200">
                    Správce uložených map a světů
                  </h3>
                  <p className="text-xs text-slate-400">
                    Můžete mít libovolné množství map. Každá si pamatuje lokaci, den, draka i výbavu.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowSavedMapsModal(false)}
                className="text-slate-400 hover:text-white text-sm bg-slate-800 p-1.5 rounded-lg transition"
              >
                ✕
              </button>
            </div>

            {/* Create New Saved Map Bar */}
            <div className="p-4 bg-slate-800/40 border-b border-slate-800 flex flex-col sm:flex-row items-center gap-2">
              <input
                type="text"
                placeholder="Název nové mapy (např. Cesta na sever, Safira & Eragon...)"
                value={newMapNameInput}
                onChange={(e) => setNewMapNameInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleCreateNewMapSlot();
                }}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-indigo-500"
              />
              <button
                onClick={handleCreateNewMapSlot}
                className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md whitespace-nowrap flex items-center justify-center gap-1.5 transition active:scale-95"
              >
                <Plus className="w-4 h-4 text-amber-300" />
                <span>+ Uložit současný svět jako novou mapu</span>
              </button>
            </div>

            {/* Scrollable Slots List */}
            <div className="p-4 overflow-y-auto space-y-3 flex-1">
              {savedMaps.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs">
                  Nemáte žádné uložené mapy. Uložte si současnou mapu kliknutím na tlačítko výše!
                </div>
              ) : (
                savedMaps.map((slot) => {
                  const locInfo = LOCATIONS.find((l) => l.id === slot.locationId) || LOCATIONS[0];
                  const isCurrent = slot.locationId === gameState.currentLocationId && slot.dayCount === gameState.dayCount;
                  const isEditing = editingSlotId === slot.id;

                  return (
                    <div
                      key={slot.id}
                      className={`p-3.5 sm:p-4 rounded-xl border transition space-y-2.5 ${
                        isCurrent
                          ? "bg-slate-800/80 border-indigo-500/80 shadow-lg shadow-indigo-500/10"
                          : "bg-slate-800/40 border-slate-700/70 hover:border-slate-600"
                      }`}
                    >
                      {/* Title & Date */}
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                          {isEditing ? (
                            <div className="flex items-center gap-1.5 flex-1">
                              <input
                                type="text"
                                value={editingTitleInput}
                                onChange={(e) => setEditingTitleInput(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") handleFinishRename(slot.id);
                                }}
                                autoFocus
                                className="bg-slate-950 border border-indigo-500 rounded px-2 py-0.5 text-xs text-white flex-1"
                              />
                              <button
                                onClick={() => handleFinishRename(slot.id)}
                                className="px-2 py-0.5 bg-indigo-600 text-[10px] text-white font-bold rounded"
                              >
                                Uložit
                              </button>
                            </div>
                          ) : (
                            <>
                              <h4 className="font-bold text-xs sm:text-sm text-slate-100 flex items-center gap-1.5">
                                <span>{slot.title}</span>
                                {isCurrent && (
                                  <span className="text-[10px] bg-emerald-950 border border-emerald-600 text-emerald-300 px-1.5 py-0.2 rounded font-semibold">
                                    Aktivní
                                  </span>
                                )}
                              </h4>
                              <button
                                onClick={() => {
                                  setEditingSlotId(slot.id);
                                  setEditingTitleInput(slot.title);
                                }}
                                className="text-slate-400 hover:text-slate-200"
                                title="Přejmenovat mapu"
                              >
                                <Edit2 className="w-3 h-3" />
                              </button>
                            </>
                          )}
                        </div>

                        <div className="text-[10px] text-slate-400 font-mono">
                          {new Date(slot.updatedAt).toLocaleDateString("cs-CZ", {
                            day: "2-digit",
                            month: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit"
                          })}
                        </div>
                      </div>

                      {/* Location & Details Badges */}
                      <div className="flex flex-wrap items-center gap-2 text-[11px]">
                        <span className="bg-indigo-950/70 border border-indigo-700 text-indigo-300 px-2 py-0.5 rounded-md flex items-center gap-1 font-semibold">
                          <MapPin className="w-3 h-3 text-indigo-400" />
                          <span>{locInfo.name}</span>
                          <span className="text-indigo-400 font-mono">Den {slot.dayCount}</span>
                        </span>

                        <span className="bg-slate-900 border border-slate-700 text-slate-300 px-2 py-0.5 rounded-md flex items-center gap-1">
                          <span>👤 {slot.riderName} ({slot.riderGender === "boy" ? "Kluk" : "Holka"})</span>
                        </span>

                        <span className="bg-slate-900 border border-slate-700 text-slate-300 px-2 py-0.5 rounded-md flex items-center gap-1.5">
                          <span
                            className="w-2.5 h-2.5 rounded-full border border-white/40"
                            style={{ backgroundColor: slot.dragonColorHex }}
                          />
                          <span>🐉 {slot.dragonName}</span>
                          <span className="text-blue-400 font-mono font-semibold">{slot.dragonBond}% pouto</span>
                        </span>

                        <span className="bg-slate-900 border border-slate-700 text-amber-300 px-2 py-0.5 rounded-md font-mono">
                          💰 {slot.goldCoins} zlaťáků
                        </span>

                        <span className="bg-slate-900 border border-slate-700 text-rose-300 px-2 py-0.5 rounded-md font-mono">
                          🧪 {slot.healingPotions} lektvarů
                        </span>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-750 text-xs">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleLoadMap(slot)}
                            className="px-3.5 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-lg shadow-sm flex items-center gap-1.5 transition active:scale-95"
                            title="Načíst tento svět do 3D hry"
                          >
                            <Play className="w-3.5 h-3.5 fill-white" />
                            <span>Načíst mapu</span>
                          </button>

                          <button
                            onClick={() => handleSaveToSlot(slot.id, slot.title)}
                            className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 font-semibold rounded-lg flex items-center gap-1 transition"
                            title="Uložit aktuální postup hry do tohoto slotu"
                          >
                            <Save className="w-3.5 h-3.5 text-amber-400" />
                            <span>Uložit sem</span>
                          </button>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleDuplicateMap(slot.id)}
                            className="p-1.5 bg-slate-700/60 hover:bg-slate-600 text-slate-300 rounded-lg transition"
                            title="Duplikovat mapu do nového slotu"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleDeleteMap(slot.id)}
                            className="p-1.5 bg-slate-700/60 hover:bg-rose-900/60 text-rose-400 hover:text-rose-300 rounded-lg transition"
                            title="Smazat tuto mapu"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
