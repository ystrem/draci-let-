import React, { useState, useEffect } from "react";
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
  Users,
  Eye,
  EyeOff,
  X,
  ShieldOff,
  Skull,
  Swords,
  Activity,
  Volume2,
  VolumeX,
  PlusCircle,
  ArrowRight,
  Egg,
} from "lucide-react";

interface EditorHUDProps {
  containerRef: React.RefObject<HTMLDivElement | null>;
  gameState: GameState;
  onSelectDragon: (dragonId: string) => void;
  onUpdateStats: (hue: number, speed: number, fireRate: number) => void;
  onStartLevel: (levelId: number) => void;
  onTogglePause: () => void;
  onResetGame: () => void;
  onSkipLevel: () => void;
  onSetPlayerCount?: (count: number) => void;
  onOpenMenu?: () => void;
  onToggleMute?: () => void;
  onUpgradeHealth?: () => void;
  onUpgradeFireRate?: () => void;
  onUpgradeDamage?: () => void;
  onUpgradeSpeed?: () => void;
  onNextLevelFromCave?: () => void;
}

const CHARACTERS_GALLERY = [
  {
    id: "dragon",
    name: "Létající Drak (Hráč)",
    role: "Hlavní hrdina",
    biome: "Všechny biomy",
    description: "Animovaný elementalní drak s mávajícími křídly, vlnícím se ocasem a schopností chrlit magické projektily. V editoru můžete měnit jeho barvu, rychlost a kadenci.",
    badgeColor: "bg-amber-500/20 text-amber-400 border-amber-500/40",
    renderSvg: (colorHex: string) => (
      <svg viewBox="0 0 100 70" className="w-16 h-12">
        <path d="M40 35 L20 10 L5 20 L25 35 Z" fill={colorHex} opacity="0.7" className="animate-pulse" />
        <path d="M30 40 Q15 45 5 35 Q-5 40 0 50" stroke={colorHex} strokeWidth="4" fill="none" />
        <polygon points="0,50 -8,45 -5,55" fill={colorHex} />
        <ellipse cx="45" cy="40" rx="20" ry="12" fill={colorHex} />
        <path d="M55 35 L70 20 L80 25 L75 35 L60 42 Z" fill={colorHex} />
        <circle cx="73" cy="23" r="2.5" fill="#fff000" />
        <polygon points="65,20 55,8 60,18" fill="#991b1b" />
        <path d="M45 35 L30 5 L10 12 L32 32 Z" fill={colorHex} className="animate-bounce" />
      </svg>
    )
  },
  {
    id: "naga",
    name: "Hadovitá Naga",
    role: "Létající plaz",
    biome: "1. Biom: Kixskuske hory",
    description: "Vlnící se plazivá stvůra složená ze 6 spojených článků s fialově zářícíma očima a hřbetními ostny. Útočí v roji.",
    badgeColor: "bg-teal-500/20 text-teal-400 border-teal-500/40",
    renderSvg: () => (
      <svg viewBox="0 0 100 40" className="w-16 h-10">
        <g className="animate-pulse">
          <circle cx="20" cy="20" r="10" fill="#0f766e" />
          <circle cx="23" cy="17" r="2" fill="#c084fc" />
          <line x1="18" y1="12" x2="10" y2="5" stroke="#c084fc" strokeWidth="2" />
          <circle cx="35" cy="22" r="8" fill="#14b8a6" />
          <polygon points="35,14 31,8 29,14" fill="#f43f5e" />
          <circle cx="48" cy="18" r="7" fill="#0d9488" />
          <circle cx="60" cy="22" r="6" fill="#115e59" />
          <circle cx="70" cy="19" r="5" fill="#134e4a" />
          <circle cx="78" cy="20" r="3" fill="#042f2e" />
        </g>
      </svg>
    )
  },
  {
    id: "gargoyle",
    name: "Dračí Monstrum",
    role: "Střelec kyseliny",
    biome: "1. Biom: Kixskuske hory",
    description: "Netopýří ještěr chrlící zelené kyselinové projektily. Má animovaná netopýří křídla a ostnatou kouli na ocase.",
    badgeColor: "bg-purple-500/20 text-purple-400 border-purple-500/40",
    renderSvg: () => (
      <svg viewBox="0 0 80 60" className="w-14 h-11">
        <g>
          <path d="M40 30 L65 10 L75 25 L55 30 Z" fill="#581c87" className="animate-pulse" />
          <ellipse cx="40" cy="35" rx="15" ry="10" fill="#6b21a8" />
          <path d="M30 30 L15 20 L10 32 L22 38 Z" fill="#6b21a8" />
          <circle cx="18" cy="24" r="2" fill="#22c55e" />
          <path d="M55 35 Q65 38 75 30" stroke="#6b21a8" strokeWidth="3" fill="none" />
          <circle cx="75" cy="30" r="4" fill="#581c87" />
        </g>
      </svg>
    )
  },
  {
    id: "mountain_boss",
    name: "Vládce Bouřných Štítů",
    role: "Boss 1. Biomu",
    biome: "1. Biom: Kixskuske hory",
    description: "Kolosální bouřný drak s obřími azurovými křídly a bleskovými rohy. Chrlí plazmové paprsky a vysílá 8-směrné bouřkové orby.",
    badgeColor: "bg-cyan-500/20 text-cyan-400 border-cyan-500/40",
    renderSvg: () => (
      <svg viewBox="0 0 100 70" className="w-16 h-12">
        <g>
          <path d="M50 35 L85 5 L95 20 L75 35 Z" fill="#06b6d4" className="animate-pulse" />
          <ellipse cx="50" cy="40" rx="25" ry="14" fill="#1e1b4b" />
          <ellipse cx="45" cy="45" rx="18" ry="8" fill="#38bdf8" />
          <path d="M35 30 L10 15 L5 30 L25 42 Z" fill="#1e1b4b" />
          <polygon points="20,20 5,0 15,18" fill="#fef08a" />
          <circle cx="18" cy="24" r="3" fill="#22d3ee" />
          <path d="M75 40 Q95 50 100 35" stroke="#1e1b4b" strokeWidth="4" fill="none" />
          <circle cx="100" cy="35" r="5" fill="#06b6d4" />
        </g>
      </svg>
    )
  },
  {
    id: "giant_worm",
    name: "Obří Písečný Červ",
    role: "Boss 2. Biomu",
    biome: "2. Biom: Poušť Bojli",
    description: "Monstrózní červ s 9 články, otevírající se tlamou s bílými tesáky a mnoha červenými očima. Vynořuje se svisle z dun.",
    badgeColor: "bg-orange-500/20 text-orange-400 border-orange-500/40",
    renderSvg: () => (
      <svg viewBox="0 0 100 60" className="w-16 h-11">
        <g>
          <circle cx="30" cy="30" r="22" fill="#7c2d12" />
          <circle cx="30" cy="30" r="14" fill="#111111" />
          <line x1="30" y1="10" x2="30" y2="18" stroke="#ffffff" strokeWidth="2" />
          <line x1="30" y1="42" x2="30" y2="50" stroke="#ffffff" strokeWidth="2" />
          <line x1="10" y1="30" x2="18" y2="30" stroke="#ffffff" strokeWidth="2" />
          <line x1="42" y1="30" x2="50" y2="30" stroke="#ffffff" strokeWidth="2" />
          <circle cx="18" cy="18" r="2.5" fill="#ef4444" />
          <circle cx="18" cy="42" r="2.5" fill="#ef4444" />
          <circle cx="55" cy="30" r="18" fill="#ea580c" />
          <circle cx="75" cy="30" r="14" fill="#c2410c" />
        </g>
      </svg>
    )
  },
  {
    id: "dwarf",
    name: "Lesní Trpaslík",
    role: "Pěšák s trny",
    biome: "3. Biom: Masivní les",
    description: "Trpaslík v červené kapuci stojící na kořenech stromů. Vystřeluje obloukové dřevěné trny a výbušné bomby.",
    badgeColor: "bg-rose-500/20 text-rose-400 border-rose-500/40",
    renderSvg: () => (
      <svg viewBox="0 0 60 60" className="w-12 h-12">
        <g>
          <path d="M15 50 L20 25 L40 25 L45 50 Z" fill="#451a03" />
          <path d="M20 25 Q30 5 40 25 Z" fill="#b91c1c" />
          <ellipse cx="30" cy="23" rx="7" ry="5" fill="#1c1917" />
          <circle cx="27" cy="23" r="1.5" fill="#eab308" />
          <circle cx="33" cy="23" r="1.5" fill="#eab308" />
        </g>
      </svg>
    )
  },
  {
    id: "forest_boss",
    name: "Prastarý Lesní Gigant",
    role: "Boss 3. Biomu",
    biome: "3. Biom: Masivní les",
    description: "Mocný lesní treant z prastarého dubového dřeva a mechové koruny s zářícími jantarovými runami. Vrhá těžké kmeny a naváděné spory.",
    badgeColor: "bg-emerald-500/20 text-emerald-400 border-emerald-500/40",
    renderSvg: () => (
      <svg viewBox="0 0 80 70" className="w-16 h-12">
        <g>
          <circle cx="40" cy="20" r="18" fill="#15803d" />
          <circle cx="22" cy="25" r="14" fill="#166534" />
          <circle cx="58" cy="25" r="14" fill="#166534" />
          <polygon points="20,60 15,35 40,25 65,35 60,60" fill="#3f2305" />
          <circle cx="30" cy="38" r="3" fill="#f59e0b" />
          <circle cx="50" cy="38" r="3" fill="#f59e0b" />
          <circle cx="10" cy="45" r="8" fill="#3f2305" />
          <circle cx="70" cy="45" r="8" fill="#3f2305" />
        </g>
      </svg>
    )
  },
  {
    id: "sea_jelly",
    name: "Svítící Medúzka",
    role: "Podmořský minion",
    biome: "4. Biom: Mořské hlubiny",
    description: "Svítící bioluminiscenční medúza s plovoucími chapadly. Vznáší se ve vodě a střílí elektrické bublinové projektily.",
    badgeColor: "bg-cyan-500/20 text-cyan-300 border-cyan-500/40",
    renderSvg: () => (
      <svg viewBox="0 0 60 60" className="w-12 h-12">
        <g className="animate-pulse">
          <ellipse cx="30" cy="22" rx="18" ry="14" fill="#06b6d4" opacity="0.85" />
          <ellipse cx="25" cy="18" rx="6" ry="3" fill="#67e8f9" />
          <circle cx="30" cy="24" r="5" fill="#a5f3fc" />
          <path d="M18 34 Q22 46 16 56 M24 34 Q28 46 22 56 M30 34 Q34 46 28 56 M36 34 Q40 46 34 56 M42 34 Q46 46 40 56" stroke="#38bdf8" strokeWidth="2" fill="none" />
        </g>
      </svg>
    )
  },
  {
    id: "sea_piranha",
    name: "Zubatá Piraňa",
    role: "Rychlý plavec",
    biome: "4. Biom: Mořské hlubiny",
    description: "Agresivní dravá ryba s velkou zubatou tlamou a zářícím žlutým okem. Rychle kmitá napříč hlubinami.",
    badgeColor: "bg-purple-500/20 text-purple-300 border-purple-500/40",
    renderSvg: () => (
      <svg viewBox="0 0 70 50" className="w-14 h-10">
        <g>
          <ellipse cx="35" cy="25" rx="22" ry="14" fill="#1e1b4b" />
          <ellipse cx="38" cy="27" rx="16" ry="9" fill="#c026d3" />
          <polygon points="57,25 67,14 62,25 67,36" fill="#ec4899" />
          <circle cx="23" cy="20" r="4" fill="#facc15" />
          <circle cx="22" cy="20" r="2" fill="#000000" />
          <polygon points="18,25 10,30 14,27 10,35" fill="#ffffff" />
        </g>
      </svg>
    )
  },
  {
    id: "sea_serpent",
    name: "Hlubinný Had",
    role: "Elektrický serpenoid",
    biome: "4. Biom: Mořské hlubiny",
    description: "Dlouhý mořský drak složený ze článků s modrými ploutvemi. Vlní se vodními proudy a chrlí energetické plazmové proudy.",
    badgeColor: "bg-sky-500/20 text-sky-300 border-sky-500/40",
    renderSvg: () => (
      <svg viewBox="0 0 90 40" className="w-16 h-10">
        <g className="animate-pulse">
          <circle cx="20" cy="20" r="10" fill="#0284c7" />
          <circle cx="16" cy="17" r="2.5" fill="#38bdf8" />
          <polygon points="22,10 30,2 24,14" fill="#38bdf8" />
          <circle cx="34" cy="22" r="8" fill="#0369a1" />
          <circle cx="47" cy="18" r="7" fill="#075985" />
          <circle cx="58" cy="22" r="6" fill="#0c4a6e" />
          <circle cx="68" cy="20" r="4" fill="#082f49" />
        </g>
      </svg>
    )
  },
  {
    id: "sea_kraken_boss",
    name: "Pravěký Kraken z hlubin",
    role: "Boss 4. Biomu",
    biome: "4. Biom: Mořské hlubiny",
    description: "Obří pravěké mořské monstrum se svíjejícími se chapadly, velkýma zářícíma jantarovýma očima a ostnatou korunou. Chrlí vodní smrště, inkoustové bomby a 10-směrnou vodní sprchu.",
    badgeColor: "bg-indigo-500/20 text-indigo-300 border-indigo-500/40",
    renderSvg: () => (
      <svg viewBox="0 0 90 80" className="w-16 h-14">
        <g>
          <circle cx="20" cy="20" r="12" fill="#1e1b4b" />
          <circle cx="70" cy="20" r="12" fill="#1e1b4b" />
          <circle cx="15" cy="60" r="12" fill="#1e1b4b" />
          <circle cx="75" cy="60" r="12" fill="#1e1b4b" />
          <ellipse cx="45" cy="35" rx="26" ry="20" fill="#312e81" />
          <ellipse cx="45" cy="30" rx="20" ry="14" fill="#4338ca" />
          <polygon points="25,20 35,5 40,20" fill="#6366f1" />
          <polygon points="65,20 55,5 50,20" fill="#6366f1" />
          <circle cx="33" cy="32" r="5" fill="#f59e0b" />
          <circle cx="57" cy="32" r="5" fill="#f59e0b" />
          <polygon points="38,45 45,55 52,45" fill="#020617" />
        </g>
      </svg>
    )
  }
];

const BossHealthBar: React.FC<{ bossHealth: number; bossMaxHealth: number; level: number }> = ({
  bossHealth,
  bossMaxHealth,
  level,
}) => {
  const [shatterAlert, setShatterAlert] = useState<string | null>(null);
  const [prevSegments, setPrevSegments] = useState<number>(4);

  const totalSegments = 4;
  const healthPct = Math.max(0, Math.min(100, (bossHealth / bossMaxHealth) * 100));
  const currentSegments = Math.ceil((healthPct / 100) * totalSegments);

  // Detect threshold shatter
  useEffect(() => {
    if (prevSegments > currentSegments && bossHealth > 0) {
      setShatterAlert(`ŠTÍT PROLOMEN! FÁZE ${currentSegments}/${totalSegments}`);
      const timer = setTimeout(() => setShatterAlert(null), 1800);
      setPrevSegments(currentSegments);
      return () => clearTimeout(timer);
    } else if (prevSegments < currentSegments) {
      setPrevSegments(currentSegments);
    }
  }, [currentSegments, bossHealth, prevSegments]);

  // Biome specific styling
  const bossDetails = {
    1: {
      name: "Vládce Bouřných Štítů",
      title: "Bouřný Dron Titan",
      gradient: "from-cyan-400 via-sky-500 to-indigo-600",
      glowColor: "border-cyan-500/50 shadow-[0_0_20px_rgba(6,182,212,0.3)]",
      bgOverlay: "bg-cyan-950/90",
      textColor: "text-cyan-300",
      icon: <Zap className="w-4 h-4 text-cyan-400 animate-bounce" />,
    },
    2: {
      name: "Obří Písečný Červ",
      title: "Monstrum Písečných Dun",
      gradient: "from-amber-400 via-orange-500 to-rose-600",
      glowColor: "border-orange-500/50 shadow-[0_0_20px_rgba(249,115,22,0.3)]",
      bgOverlay: "bg-orange-950/90",
      textColor: "text-amber-300",
      icon: <Flame className="w-4 h-4 text-orange-400 animate-bounce" />,
    },
    3: {
      name: "Prastarý Lesní Gigant",
      title: "Prastarý Treant Strážce",
      gradient: "from-emerald-400 via-teal-500 to-amber-600",
      glowColor: "border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.3)]",
      bgOverlay: "bg-emerald-950/90",
      textColor: "text-emerald-300",
      icon: <Swords className="w-4 h-4 text-emerald-400 animate-bounce" />,
    },
    4: {
      name: "Pravěký Kraken z hlubin",
      title: "Vládce Nekonečného Oceánu",
      gradient: "from-cyan-400 via-indigo-500 to-purple-600",
      glowColor: "border-indigo-500/50 shadow-[0_0_20px_rgba(99,102,241,0.4)]",
      bgOverlay: "bg-indigo-950/90",
      textColor: "text-cyan-300",
      icon: <Skull className="w-4 h-4 text-cyan-400 animate-bounce" />,
    },
  }[level] || {
    name: "Mocný Boss",
    title: "Strážce Biomu",
    gradient: "from-rose-500 via-amber-500 to-red-600",
    glowColor: "border-rose-500/50 shadow-[0_0_20px_rgba(244,63,94,0.3)]",
    bgOverlay: "bg-rose-950/90",
    textColor: "text-rose-300",
    icon: <Skull className="w-4 h-4 text-rose-400 animate-bounce" />,
  };

  return (
    <div
      id="boss-warning-hud"
      className={`self-center max-w-xl w-full ${bossDetails.bgOverlay} p-3.5 rounded-2xl border ${bossDetails.glowColor} backdrop-blur-md flex flex-col gap-2 pointer-events-auto mt-2 shadow-2xl relative overflow-hidden transition-all duration-300`}
    >
      {/* Shatter Alert Banner Overlay */}
      {shatterAlert && (
        <div className="absolute inset-0 z-20 bg-rose-600/95 flex items-center justify-center gap-2 text-white font-black text-xs uppercase tracking-widest animate-pulse backdrop-blur-xs">
          <ShieldOff className="w-5 h-5 animate-spin" />
          <span>{shatterAlert}</span>
          <Sparkles className="w-5 h-5 animate-pulse" />
        </div>
      )}

      {/* Header Info */}
      <div className="flex justify-between items-center text-xs">
        <div className="flex items-center gap-2">
          {bossDetails.icon}
          <div className="flex flex-col">
            <span className={`font-black tracking-wider uppercase text-xs ${bossDetails.textColor} flex items-center gap-1.5`}>
              {bossDetails.name}
            </span>
            <span className="text-[10px] text-slate-400 font-medium">
              {bossDetails.title}
            </span>
          </div>
        </div>

        {/* Phase & Health details */}
        <div className="flex items-center gap-3">
          {/* Phase Shield Icons */}
          <div className="flex items-center gap-1.5 bg-slate-950/70 px-2.5 py-1 rounded-xl border border-slate-800/80">
            {Array.from({ length: totalSegments }).map((_, idx) => {
              const isIntact = idx < currentSegments;
              return (
                <span key={idx} title={`Štít ${idx + 1}`} className="transition-all duration-300">
                  {isIntact ? (
                    <Shield className="w-3.5 h-3.5 fill-amber-400 text-amber-300 drop-shadow-[0_0_5px_rgba(251,191,36,0.9)]" />
                  ) : (
                    <ShieldOff className="w-3.5 h-3.5 text-rose-600 opacity-60 scale-90" />
                  )}
                </span>
              );
            })}
            <span className="text-[10px] font-mono font-black text-amber-400 ml-1">
              FÁZE {Math.max(1, currentSegments)}/4
            </span>
          </div>

          <div className="text-right">
            <span className="font-mono text-xs font-black text-white">
              {Math.floor(bossHealth)} <span className="text-[10px] text-slate-400">/ {bossMaxHealth}</span>
            </span>
            <span className={`block text-[10px] font-mono font-bold ${bossDetails.textColor}`}>
              {Math.ceil(healthPct)}% HP
            </span>
          </div>
        </div>
      </div>

      {/* Segmented Health Bar */}
      <div className="grid grid-cols-4 gap-2 w-full h-4 bg-slate-950/90 p-0.5 rounded-xl border border-slate-800/80 relative">
        {Array.from({ length: totalSegments }).map((_, segIdx) => {
          // Calculate percentage fill for this specific segment (0 to 100%)
          const segMin = segIdx * 25;
          const segMax = (segIdx + 1) * 25;
          let fillPct = 0;
          if (healthPct >= segMax) {
            fillPct = 100;
          } else if (healthPct <= segMin) {
            fillPct = 0;
          } else {
            fillPct = ((healthPct - segMin) / 25) * 100;
          }

          const isShattered = healthPct <= segMin;

          return (
            <div
              key={segIdx}
              className={`h-full rounded-lg relative overflow-hidden transition-all duration-200 ${
                isShattered
                  ? "bg-rose-950/40 border border-dashed border-rose-800/70 shadow-inner"
                  : "bg-slate-900/90 border border-slate-800/80"
              }`}
            >
              {/* Active Health Fill */}
              {fillPct > 0 && (
                <div
                  className={`h-full bg-gradient-to-r ${bossDetails.gradient} transition-all duration-150 rounded-md relative shadow-[0_0_10px_rgba(244,63,94,0.5)]`}
                  style={{ width: `${fillPct}%` }}
                >
                  {/* Glossy shine highlight */}
                  <div className="absolute inset-x-0 top-0 h-1/2 bg-white/25 rounded-t-md" />
                </div>
              )}

              {/* Shattered Crack Overlay */}
              {isShattered && (
                <div className="absolute inset-0 flex items-center justify-center opacity-80">
                  <svg className="w-full h-full text-rose-500/60" viewBox="0 0 40 10">
                    <path d="M0,5 L12,2 L22,8 L32,3 L40,6" stroke="currentColor" strokeWidth="1.2" fill="none" strokeDasharray="1.5 1.5" />
                  </svg>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const EditorHUD: React.FC<EditorHUDProps> = ({
  containerRef,
  gameState,
  onSelectDragon,
  onUpdateStats,
  onStartLevel,
  onTogglePause,
  onResetGame,
  onSkipLevel,
  onSetPlayerCount,
  onOpenMenu,
  onToggleMute,
  onUpgradeHealth,
  onUpgradeFireRate,
  onUpgradeDamage,
  onUpgradeSpeed,
  onNextLevelFromCave,
}) => {
  const [showCharactersModal, setShowCharactersModal] = useState(false);
  const [hideMenuOverlay, setHideMenuOverlay] = useState(false);
  const [hatchingStage, setHatchingStage] = useState<number>(0);
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
                : "bg-slate-950/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60"
            }`}
          >
            {/* Visual Dragon SVG Preview Badge */}
            <div className="absolute top-2 right-2 opacity-80 group-hover:scale-110 transition-transform">
              <svg viewBox="0 0 100 70" className="w-10 h-8">
                <path d="M40 35 L20 10 L5 20 L25 35 Z" fill={drag.colorHex} opacity="0.6" />
                <ellipse cx="45" cy="40" rx="18" ry="10" fill={drag.colorHex} />
                <path d="M55 35 L70 20 L80 25 L75 35 Z" fill={drag.colorHex} />
                <circle cx="73" cy="23" r="2" fill="#fff" />
                <path d="M45 35 L30 5 L10 12 L32 32 Z" fill={drag.colorHex} />
              </svg>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2 pr-10">
                <span className="w-3.5 h-3.5 rounded-full border border-white/20 shrink-0" style={{ backgroundColor: drag.colorHex }} />
                <h3 className="font-semibold text-white group-hover:text-amber-400 transition-colors text-sm">{drag.name}</h3>
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
              <div className="mt-2 bg-amber-500 text-slate-950 font-bold text-[9px] px-1.5 py-0.5 rounded uppercase tracking-wider text-center w-full">
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
          <button
            id="btn-sound-mute"
            onClick={onToggleMute}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs transition font-bold"
            title="Zapnout / Vypnout zvuky"
          >
            {gameState.mute ? (
              <>
                <VolumeX className="w-3.5 h-3.5 text-rose-400" /> <span className="text-rose-300">Zvuk VYPNUT</span>
              </>
            ) : (
              <>
                <Volume2 className="w-3.5 h-3.5 text-emerald-400" /> <span className="text-emerald-300">Zvuk ZAPNUT</span>
              </>
            )}
          </button>

          {gameState.status === "playing" && (
            <>
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

              {onOpenMenu && (
                <button
                  id="btn-open-menu"
                  onClick={onOpenMenu}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 font-bold text-xs transition"
                  title="Otevřít nabídku výběru hráčů a editor"
                >
                  <Sliders className="w-3.5 h-3.5" /> Nastavení / Menu
                </button>
              )}
            </>
          )}

          <button
            id="btn-reset"
            onClick={onResetGame}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 font-bold text-xs transition"
            title="Restartovat celou hru do začátku"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Restart celé hry
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
              <h2 className="text-3xl font-extrabold text-rose-500 tracking-tight uppercase mb-2">Všichni drakové poraženi!</h2>
              <p className="text-slate-400 max-w-md text-sm mb-6 leading-relaxed">
                Vaši drakové padli v boji. Biomy jsou nebezpečné, ale váš duch je nezlomný! Zrestartujte hru nebo upravte parametry draků.
              </p>
              <div className="flex gap-4">
                <button
                  id="btn-retry"
                  onClick={() => onStartLevel(gameState.currentLevel)}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 text-slate-950 font-bold hover:brightness-110 transition flex items-center gap-2 text-sm shadow-lg shadow-amber-500/20"
                >
                  <RotateCcw className="w-4 h-4" /> Opakovat biom
                </button>
                <button
                  id="btn-main-menu"
                  onClick={onResetGame}
                  className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-850 text-amber-400 font-bold transition border border-slate-800 text-sm flex items-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" /> Restart celé hry
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
                Úspěšně jste překonali veškerá nebezpečí. Síla vašich draků roste! Připravte se na další výzvu.
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
              <div className="flex gap-4">
                <button
                  id="btn-next-level"
                  onClick={() => onStartLevel(gameState.currentLevel + 1)}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold hover:brightness-110 transition flex items-center gap-2 text-sm shadow-lg shadow-emerald-500/20"
                >
                  Postoupit do dalšího biomu <SkipForward className="w-4 h-4" />
                </button>
                <button
                  id="btn-restart-from-complete"
                  onClick={onResetGame}
                  className="px-4 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-semibold transition border border-slate-800 text-sm"
                >
                  Restart hry
                </button>
              </div>
            </div>
          )}

          {/* Cave Sanctuary / Upgrade Shop Overlay */}
          {gameState.status === "cave_shop" && (
            <div id="overlay-cave-shop" className="absolute inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex flex-col justify-between p-6 overflow-y-auto">
              <div className="max-w-4xl mx-auto w-full my-auto">
                {/* Header */}
                <div className="text-center mb-6">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 text-xs font-bold uppercase tracking-wider mb-2">
                    <Sparkles className="w-4 h-4 text-indigo-400" /> Vlet do Dračí Jeskyně – Biom {gameState.currentLevel} Dokončen!
                  </div>
                  <h2 className="text-3xl font-black text-white uppercase tracking-tight">
                    Tajemná Jeskynní Svatyně & Vylepšení
                  </h2>
                  <p className="text-slate-400 text-xs md:text-sm mt-1 max-w-xl mx-auto leading-relaxed">
                    Váš drak bezpečně přistál v krystalové jeskyni. Využijte nasbírané krystaly a body k vylepšení životů, rychlosti letu a síly střelby před vstupem do dalšího biomu!
                  </p>
                </div>

                {/* Balance & Dragon Status */}
                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 mb-6 flex flex-wrap items-center justify-between gap-4 shadow-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center border shadow-inner" style={{ backgroundColor: `${gameState.dragonConfig.colorHex}22`, borderColor: gameState.dragonConfig.colorHex }}>
                      <Flame className="w-6 h-6" style={{ color: gameState.dragonConfig.colorHex }} />
                    </div>
                    <div>
                      <div className="text-sm font-extrabold text-white">{gameState.dragonConfig.name}</div>
                      <div className="text-xs text-slate-400">{gameState.dragonConfig.element} • Hráč 1</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <div className="text-[10px] uppercase font-bold text-slate-500">Dostupné Krystaly / Skóre</div>
                      <div className="text-2xl font-black font-mono text-amber-400">{gameState.score} bodů</div>
                    </div>
                  </div>
                </div>

                {/* Upgrade Shop Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                  {/* Health Upgrade */}
                  {(() => {
                    const hpCost = 450 + (gameState.healthUpgradeLevel * 250);
                    const canAfford = gameState.score >= hpCost;
                    return (
                      <div className="bg-slate-900/90 border border-slate-800 hover:border-emerald-500/50 rounded-2xl p-4 transition flex flex-col justify-between gap-3 shadow-lg">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                              <Heart className="w-6 h-6 fill-emerald-500/20" />
                            </div>
                            <div>
                              <div className="text-sm font-bold text-white flex items-center gap-2">
                                Max. Zdraví & Vyléčení
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono">
                                  Lvl {gameState.healthUpgradeLevel}
                                </span>
                              </div>
                              <div className="text-xs text-slate-400 mt-0.5">
                                +50 Max. HP a plně obnoví zdraví všem drakům.
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between border-t border-slate-800/80 pt-3">
                          <span className="text-xs font-mono font-bold text-amber-400">{hpCost} bodů</span>
                          <button
                            onClick={onUpgradeHealth}
                            disabled={!canAfford}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                              canAfford
                                ? "bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/20 cursor-pointer"
                                : "bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed"
                            }`}
                          >
                            <PlusCircle className="w-4 h-4" /> Vylepšit Životy
                          </button>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Fire Rate Upgrade */}
                  {(() => {
                    const frCost = 500 + (gameState.fireRateUpgradeLevel * 300);
                    const canAfford = gameState.score >= frCost;
                    return (
                      <div className="bg-slate-900/90 border border-slate-800 hover:border-rose-500/50 rounded-2xl p-4 transition flex flex-col justify-between gap-3 shadow-lg">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400">
                              <Sword className="w-6 h-6" />
                            </div>
                            <div>
                              <div className="text-sm font-bold text-white flex items-center gap-2">
                                Kadence Střelby
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-mono">
                                  Lvl {gameState.fireRateUpgradeLevel}
                                </span>
                              </div>
                              <div className="text-xs text-slate-400 mt-0.5">
                                Sníží prodlevu mezi výstřely o 35ms (Rychlejší chrlění ohně).
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between border-t border-slate-800/80 pt-3">
                          <span className="text-xs font-mono font-bold text-amber-400">{frCost} bodů</span>
                          <button
                            onClick={onUpgradeFireRate}
                            disabled={!canAfford}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                              canAfford
                                ? "bg-rose-500 hover:bg-rose-400 text-slate-950 shadow-md shadow-rose-500/20 cursor-pointer"
                                : "bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed"
                            }`}
                          >
                            <PlusCircle className="w-4 h-4" /> Zrychlit Střelbu
                          </button>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Damage Upgrade */}
                  {(() => {
                    const dmgCost = 600 + (gameState.damageUpgradeLevel * 350);
                    const canAfford = gameState.score >= dmgCost;
                    return (
                      <div className="bg-slate-900/90 border border-slate-800 hover:border-amber-500/50 rounded-2xl p-4 transition flex flex-col justify-between gap-3 shadow-lg">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
                              <Zap className="w-6 h-6" />
                            </div>
                            <div>
                              <div className="text-sm font-bold text-white flex items-center gap-2">
                                Síla Ohnivého Výboje
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono">
                                  Lvl {gameState.damageUpgradeLevel}
                                </span>
                              </div>
                              <div className="text-xs text-slate-400 mt-0.5">
                                Zvýší udílené poškození o +35% proti všem nepřátelům i bossovi.
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between border-t border-slate-800/80 pt-3">
                          <span className="text-xs font-mono font-bold text-amber-400">{dmgCost} bodů</span>
                          <button
                            onClick={onUpgradeDamage}
                            disabled={!canAfford}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                              canAfford
                                ? "bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20 cursor-pointer"
                                : "bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed"
                            }`}
                          >
                            <PlusCircle className="w-4 h-4" /> Zvýšit Sílu
                          </button>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Speed Upgrade */}
                  {(() => {
                    const spdCost = 400 + (gameState.speedUpgradeLevel * 200);
                    const canAfford = gameState.score >= spdCost;
                    return (
                      <div className="bg-slate-900/90 border border-slate-800 hover:border-sky-500/50 rounded-2xl p-4 transition flex flex-col justify-between gap-3 shadow-lg">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-400">
                              <Compass className="w-6 h-6" />
                            </div>
                            <div>
                              <div className="text-sm font-bold text-white flex items-center gap-2">
                                Rychlost Letu Křídel
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 font-mono">
                                  Lvl {gameState.speedUpgradeLevel}
                                </span>
                              </div>
                              <div className="text-xs text-slate-400 mt-0.5">
                                Zvýší rychlost manévrování o +1 px/f pro snazší vyhýbání.
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between border-t border-slate-800/80 pt-3">
                          <span className="text-xs font-mono font-bold text-amber-400">{spdCost} bodů</span>
                          <button
                            onClick={onUpgradeSpeed}
                            disabled={!canAfford}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                              canAfford
                                ? "bg-sky-500 hover:bg-sky-400 text-slate-950 shadow-md shadow-sky-500/20 cursor-pointer"
                                : "bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed"
                            }`}
                          >
                            <PlusCircle className="w-4 h-4" /> Zrychlit Let
                          </button>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* Continue to Next Level Button */}
                <div className="flex justify-center">
                  <button
                    onClick={onNextLevelFromCave}
                    className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-slate-950 font-black text-sm uppercase tracking-wider hover:brightness-110 transition flex items-center gap-2 shadow-xl shadow-emerald-500/25 cursor-pointer"
                  >
                    Opustit Jeskyni a Vletět do Biom {gameState.currentLevel + 1}
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Victory Screen with Dragon Nest Cutscene & Hatching Egg */}
          {gameState.status === "victory" && (
            <div id="overlay-victory" className="absolute inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center overflow-y-auto">
              <div className="max-w-2xl w-full my-auto flex flex-col items-center">
                {/* Victory badge */}
                <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/40 flex items-center justify-center mb-3 shadow-lg shadow-amber-500/20">
                  <Trophy className="w-7 h-7 text-amber-400" />
                </div>
                <h2 className="text-3xl md:text-4xl font-extrabold text-amber-400 tracking-tight uppercase mb-1">
                  VÍTĚZNÝ FINÁLNÍ LET!
                </h2>
                <p className="text-slate-300 font-semibold text-xs md:text-sm mb-4">
                  Poražen Pravěký Kraken i všichni vládci biomů!
                </p>

                {/* DRAGON NEST STAGE */}
                <div className="w-full bg-slate-900/90 border border-amber-500/30 rounded-3xl p-6 mb-6 shadow-2xl relative overflow-hidden flex flex-col items-center">
                  <div className="text-xs font-extrabold text-amber-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4" /> Dračí Hnízdo na Vrcholku Skály
                  </div>

                  {/* Nest Visual Canvas Box */}
                  <div className="relative w-64 h-56 flex flex-col items-center justify-end my-2">
                    
                    {/* Twig Nest Container */}
                    <div className="absolute bottom-2 w-56 h-20 rounded-[50%] bg-gradient-to-b from-amber-950 via-amber-900/80 to-stone-900 border-2 border-amber-800/60 shadow-2xl flex items-center justify-center z-10 overflow-hidden">
                      {/* Twigs & embers inside nest */}
                      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-500/30 via-transparent to-transparent animate-pulse" />
                      <div className="text-[10px] text-amber-600/60 font-mono tracking-widest uppercase select-none">
                        •••• Teplé dračí hnízdo ••••
                      </div>
                    </div>

                    {/* Egg / Baby Dragon State */}
                    {hatchingStage === 0 && (
                      <div
                        onClick={() => setHatchingStage(1)}
                        className="relative z-20 mb-6 cursor-pointer group flex flex-col items-center transition transform hover:scale-105 active:scale-95"
                        title="Klepni na vajíčko!"
                      >
                        {/* Uncracked Egg */}
                        <div
                          className="w-28 h-36 rounded-[50%_50%_50%_50%/60%_60%_40%_40%] border-4 shadow-2xl transition duration-300 animate-bounce flex items-center justify-center relative overflow-hidden"
                          style={{
                            backgroundColor: `${gameState.dragonConfig.colorHex}dd`,
                            borderColor: "#fbbf24",
                            boxShadow: `0 0 30px ${gameState.dragonConfig.colorHex}88`
                          }}
                        >
                          <div className="absolute inset-0 bg-gradient-to-tr from-black/40 via-transparent to-white/30" />
                          <div className="w-20 h-24 border-t-2 border-b-2 border-amber-300/40 rounded-full rotate-12" />
                          <div className="text-2xl select-none animate-pulse">✨</div>
                        </div>

                        <div className="mt-3 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-[11px] font-bold uppercase tracking-wider animate-pulse">
                          👉 Klepni na vajíčko pro líhnutí!
                        </div>
                      </div>
                    )}

                    {hatchingStage === 1 && (
                      <div
                        onClick={() => setHatchingStage(2)}
                        className="relative z-20 mb-6 cursor-pointer flex flex-col items-center transition transform hover:scale-105 active:scale-95"
                        title="Klepni ještě jednou pro vyklouznutí!"
                      >
                        {/* Cracking Egg */}
                        <div
                          className="w-28 h-36 rounded-[50%_50%_50%_50%/60%_60%_40%_40%] border-4 shadow-2xl flex items-center justify-center relative overflow-hidden animate-pulse"
                          style={{
                            backgroundColor: `${gameState.dragonConfig.colorHex}ee`,
                            borderColor: "#f59e0b",
                            boxShadow: `0 0 40px #f59e0b`
                          }}
                        >
                          {/* Light Rays */}
                          <div className="absolute inset-0 bg-amber-300/30 animate-ping" />
                          
                          {/* Crack Lines SVG */}
                          <svg className="absolute inset-0 w-full h-full text-amber-200 fill-none stroke-current stroke-2">
                            <path d="M50 10 L42 35 L58 55 L45 80 L52 110" />
                            <path d="M42 35 L20 45" />
                            <path d="M58 55 L80 65" />
                          </svg>

                          <div className="text-xl text-white font-extrabold z-10 animate-bounce">KŘUP!</div>
                        </div>

                        <div className="mt-3 px-3 py-1 rounded-full bg-amber-400 text-slate-950 text-[11px] font-black uppercase tracking-wider shadow-lg">
                          ✨ Skořápka praská! Klepni znovu!
                        </div>
                      </div>
                    )}

                    {hatchingStage === 2 && (
                      <div
                        className="relative z-20 mb-4 cursor-pointer flex flex-col items-center transition transform hover:scale-105 active:scale-95"
                      >
                        {/* Hatched Baby Dragon peeking out */}
                        <div className="relative w-32 h-40 flex flex-col items-center justify-end">
                          
                          {/* Baby Dragon SVG */}
                          <div className="relative w-24 h-24 mb-[-12px] z-20 flex items-center justify-center">
                            <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-xl animate-bounce">
                              {/* Tiny Wings */}
                              <path d="M25 45 Q5 30 15 55 Q25 50 30 45 Z" fill={gameState.dragonConfig.colorHex} />
                              <path d="M75 45 Q95 30 85 55 Q75 50 70 45 Z" fill={gameState.dragonConfig.colorHex} />
                              
                              {/* Baby Head */}
                              <ellipse cx="50" cy="45" rx="26" ry="22" fill={gameState.dragonConfig.colorHex} />
                              
                              {/* Cute Horns */}
                              <polygon points="38,25 32,10 44,22" fill="#fbbf24" />
                              <polygon points="62,25 68,10 56,22" fill="#fbbf24" />
                              
                              {/* Glossy Cute Eyes */}
                              <circle cx="38" cy="42" r="6" fill="#0f172a" />
                              <circle cx="62" cy="42" r="6" fill="#0f172a" />
                              <circle cx="40" cy="40" r="2" fill="#ffffff" />
                              <circle cx="64" cy="40" r="2" fill="#ffffff" />
                              
                              {/* Rosy Cheeks */}
                              <ellipse cx="32" cy="48" rx="4" ry="2" fill="#f43f5e" opacity="0.6" />
                              <ellipse cx="68" cy="48" rx="4" ry="2" fill="#f43f5e" opacity="0.6" />
                              
                              {/* Sweet Smile */}
                              <path d="M43 50 Q50 56 57 50" stroke="#0f172a" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                              
                              {/* Fire Spark Puff */}
                              <circle cx="50" cy="60" r="4" fill="#fbbf24" className="animate-ping" />
                            </svg>
                          </div>

                          {/* Bottom Broken Shell */}
                          <div
                            className="w-28 h-20 rounded-[0_0_50%_50%/0_0_60%_60%] border-4 shadow-xl z-10 relative overflow-hidden"
                            style={{
                              backgroundColor: `${gameState.dragonConfig.colorHex}dd`,
                              borderColor: "#fbbf24"
                            }}
                          >
                          </div>
                        </div>

                        <div className="px-3 py-1 rounded-full bg-emerald-500 text-slate-950 text-[11px] font-black uppercase tracking-wider shadow-lg flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5" /> Malé mládě draka {gameState.dragonConfig.name} se vylíhlo!
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Cutscene Description text */}
                  <p className="text-xs text-slate-300 max-w-md mt-2 leading-relaxed">
                    {hatchingStage < 2 ? (
                      <span>V rohu prastaré jeskyně leží hřejivé hnízdo s dračím vajíčkem, které přejímá barvu a element vašeho draka <strong className="text-amber-400">{gameState.dragonConfig.name}</strong>.</span>
                    ) : (
                      <span>Z vajíčka vykouklo roztomilé drakátko se zářivýma očima v barvě <strong className="text-amber-400">{gameState.dragonConfig.name}</strong>! Přenáší tradici ohně a kouzel do nové generace!</span>
                    )}
                  </p>
                </div>

                {/* Final Stats Summary */}
                <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 mb-6 w-full grid grid-cols-3 gap-2 text-center">
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase font-bold">Celkové Skóre</div>
                    <div className="text-lg font-black font-mono text-amber-400">{gameState.score}</div>
                  </div>
                  <div className="border-x border-slate-800">
                    <div className="text-[10px] text-slate-500 uppercase font-bold">Monstra Poražena</div>
                    <div className="text-lg font-black font-mono text-emerald-400">{gameState.enemiesDefeated}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase font-bold">Vylepšení Doma</div>
                    <div className="text-lg font-black font-mono text-sky-400">
                      {gameState.healthUpgradeLevel + gameState.fireRateUpgradeLevel + gameState.damageUpgradeLevel + gameState.speedUpgradeLevel}x
                    </div>
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex gap-3">
                  <button
                    id="btn-restart"
                    onClick={() => {
                      setHatchingStage(0);
                      onResetGame();
                    }}
                    className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-rose-500 text-slate-950 font-black hover:brightness-110 transition flex items-center gap-2 text-xs uppercase tracking-wider shadow-lg shadow-amber-500/25 cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4" /> Hrát Znovu Od Začátku
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Menu / Selection Screen */}
          {gameState.status === "menu" && (
            <>
              {hideMenuOverlay ? (
                <div className="absolute top-4 left-4 z-40 flex items-center gap-2">
                  <button
                    onClick={() => setHideMenuOverlay(false)}
                    className="px-4 py-2 rounded-xl bg-slate-900/95 border border-slate-700 text-amber-400 font-bold text-xs hover:bg-slate-800 transition flex items-center gap-2 shadow-2xl backdrop-blur-md"
                  >
                    <Eye className="w-4 h-4" /> Zobrazit nabídku a nastavení hráčů
                  </button>
                  <button
                    onClick={() => {
                      setHideMenuOverlay(false);
                      onStartLevel(1);
                    }}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 text-slate-950 font-black text-xs hover:brightness-110 transition flex items-center gap-1.5 shadow-2xl uppercase tracking-wider"
                  >
                    <Play className="w-4 h-4 fill-current" /> Spustit hru přímo
                  </button>
                </div>
              ) : (
                <div id="overlay-menu" className="absolute inset-0 z-40 bg-slate-950/50 backdrop-blur-xs flex flex-col justify-between p-6 overflow-y-auto">
                  <div>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                      <div>
                        <span className="text-xs font-bold uppercase tracking-widest text-amber-500 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
                          Multiplayer až pro 4 hráče
                        </span>
                        <h2 className="text-3xl font-extrabold text-white tracking-tight uppercase mt-2 mb-1">
                          Nastavení hráčů & Ovládání
                        </h2>
                        <p className="text-slate-400 text-xs md:text-sm leading-relaxed max-w-xl">
                          Hrajte sami nebo až ve 4 hráčích současně! Ovládejte z klávesnice nebo připojte Gamepady.
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={onToggleMute}
                          className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-bold transition flex items-center gap-2 shadow-md"
                          title="Zapnout / Vypnout zvuky"
                        >
                          {gameState.mute ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
                          Zvuky: {gameState.mute ? "Vypnuty" : "Zapnuty"}
                        </button>
                        <button
                          onClick={() => setShowCharactersModal(true)}
                          className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-bold transition flex items-center gap-2 shadow-md"
                        >
                          <Users className="w-4 h-4 text-amber-400" /> Galerie postav
                        </button>
                        <button
                          onClick={() => setHideMenuOverlay(true)}
                          className="px-4 py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold transition flex items-center gap-2 shadow-md"
                          title="Skrýt menu a sledovat draka a celou hru na pozadí"
                        >
                          <EyeOff className="w-4 h-4 text-amber-400" /> Skrýt menu (Živý náhled)
                        </button>
                      </div>
                    </div>

                    {/* Player Count Selection Buttons */}
                    <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 mb-6">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                          <Users className="w-4 h-4" /> Počet hráčů ve hře:
                        </span>
                        <span className="text-xs font-semibold text-slate-300">
                          Aktivní: <strong className="text-amber-400">{gameState.playerCount} {gameState.playerCount === 1 ? "hráč" : gameState.playerCount < 5 ? "hráči" : "hráčů"}</strong>
                        </span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {[1, 2, 3, 4].map((count) => {
                          const isActive = gameState.playerCount === count;
                          return (
                            <button
                              key={count}
                              onClick={() => onSetPlayerCount?.(count)}
                              className={`py-3 px-4 rounded-xl border text-center transition-all duration-200 font-bold text-sm flex flex-col items-center gap-1 ${
                                isActive
                                  ? "bg-amber-500 text-slate-950 border-amber-400 shadow-lg shadow-amber-500/20 scale-102"
                                  : "bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-850 hover:border-slate-700"
                              }`}
                            >
                              <span>{count} {count === 1 ? "Hráč" : count < 5 ? "Hráči" : "Hráčů"}</span>
                              <span className={`text-[10px] font-normal ${isActive ? "text-slate-900" : "text-slate-500"}`}>
                                {count === 1 ? "1 Drak" : `${count} Drakové`}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="mb-3 text-xs font-bold text-slate-300 uppercase tracking-wider">
                      Výběr draka pro Hráče 1:
                    </div>
                    {renderDragonSelector()}

                    {/* Multi-Player Controls Guide Panel */}
                    <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 mb-6">
                      <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <HelpCircle className="w-4 h-4" /> Ovládání z počítače & Gamepadů (Různé Útoky)
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                        <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800">
                          <div className="font-bold text-rose-400 mb-1">1. Hráč (Trojitý výstřel)</div>
                          <div className="text-[11px] text-slate-400 space-y-1">
                            <div>Pohyb: <kbd className="px-1 py-0.5 rounded bg-slate-900 border border-slate-800 font-mono text-white text-[10px]">W A S D</kbd> / Šipky</div>
                            <div>Útok: <kbd className="px-1 py-0.5 rounded bg-slate-900 border border-slate-800 font-mono text-white text-[10px]">MEZERNÍK</kbd> / <kbd className="px-1 py-0.5 rounded bg-slate-900 border border-slate-800 font-mono text-white text-[10px]">F</kbd></div>
                            <div className="text-amber-400">Speciál (Nova): <kbd className="px-1 py-0.5 rounded bg-slate-900 border border-slate-800 font-mono text-amber-300 text-[10px]">E</kbd> / <kbd className="px-1 py-0.5 rounded bg-slate-900 border border-slate-800 font-mono text-amber-300 text-[10px]">Q</kbd> / <kbd className="px-1 py-0.5 rounded bg-slate-900 border border-slate-800 font-mono text-amber-300 text-[10px]">Shift</kbd></div>
                            <div className="text-amber-400/90 text-[10px]">Gamepad 1: A/RB (Útok) | Y/RT (Super Nova)</div>
                          </div>
                        </div>

                        <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800">
                          <div className="font-bold text-sky-400 mb-1">2. Hráč (Plazmová Vlna)</div>
                          <div className="text-[11px] text-slate-400 space-y-1">
                            <div>Pohyb: <kbd className="px-1 py-0.5 rounded bg-slate-900 border border-slate-800 font-mono text-white text-[10px]">ŠIPKY</kbd></div>
                            <div>Útok: <kbd className="px-1 py-0.5 rounded bg-slate-900 border border-slate-800 font-mono text-white text-[10px]">ENTER</kbd> / <kbd className="px-1 py-0.5 rounded bg-slate-900 border border-slate-800 font-mono text-white text-[10px]">SHIFT</kbd></div>
                            <div className="text-amber-400">Speciál (Nova): <kbd className="px-1 py-0.5 rounded bg-slate-900 border border-slate-800 font-mono text-amber-300 text-[10px]">Del</kbd> / <kbd className="px-1 py-0.5 rounded bg-slate-900 border border-slate-800 font-mono text-amber-300 text-[10px]">Numpad .</kbd></div>
                            <div className="text-amber-400/90 text-[10px]">Gamepad 2: A/RB (Útok) | Y/RT (Super Nova)</div>
                          </div>
                        </div>

                        <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800">
                          <div className="font-bold text-emerald-400 mb-1">3. Hráč (Trojitá Kyselina)</div>
                          <div className="text-[11px] text-slate-400 space-y-1">
                            <div>Pohyb: <kbd className="px-1 py-0.5 rounded bg-slate-900 border border-slate-800 font-mono text-white text-[10px]">I K J L</kbd></div>
                            <div>Útok: <kbd className="px-1 py-0.5 rounded bg-slate-900 border border-slate-800 font-mono text-white text-[10px]">O</kbd> / <kbd className="px-1 py-0.5 rounded bg-slate-900 border border-slate-800 font-mono text-white text-[10px]">U</kbd></div>
                            <div className="text-amber-400">Speciál (Nova): <kbd className="px-1 py-0.5 rounded bg-slate-900 border border-slate-800 font-mono text-amber-300 text-[10px]">P</kbd> / <kbd className="px-1 py-0.5 rounded bg-slate-900 border border-slate-800 font-mono text-amber-300 text-[10px]">Y</kbd></div>
                            <div className="text-amber-400/90 text-[10px]">Gamepad 3: A/RB (Útok) | Y/RT (Super Nova)</div>
                          </div>
                        </div>

                        <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800">
                          <div className="font-bold text-amber-400 mb-1">4. Hráč (Laserový Paprsek)</div>
                          <div className="text-[11px] text-slate-400 space-y-1">
                            <div>Pohyb: <kbd className="px-1 py-0.5 rounded bg-slate-900 border border-slate-800 font-mono text-white text-[10px]">Numpad 8 5 4 6</kbd></div>
                            <div>Útok: <kbd className="px-1 py-0.5 rounded bg-slate-900 border border-slate-800 font-mono text-white text-[10px]">NumpadEnter</kbd></div>
                            <div className="text-amber-400">Speciál (Nova): <kbd className="px-1 py-0.5 rounded bg-slate-900 border border-slate-800 font-mono text-amber-300 text-[10px]">Numpad 3</kbd> / <kbd className="px-1 py-0.5 rounded bg-slate-900 border border-slate-800 font-mono text-amber-300 text-[10px]">M</kbd></div>
                            <div className="text-amber-400/90 text-[10px]">Gamepad 4: A/RB (Útok) | Y/RT (Super Nova)</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-slate-900/90 pt-4 flex flex-col md:flex-row items-center justify-between gap-4 mt-auto">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={onResetGame}
                        className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-400 border border-slate-800 text-xs font-bold transition flex items-center gap-1.5"
                      >
                        <RotateCcw className="w-4 h-4" /> Restart celé hry
                      </button>
                    </div>

                    <button
                      id="btn-start-game"
                      onClick={() => onStartLevel(1)}
                      className="w-full md:w-auto px-10 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 text-slate-950 font-black hover:brightness-110 transition flex items-center justify-center gap-2 text-sm shadow-lg shadow-amber-500/25 uppercase tracking-wider"
                    >
                      <Play className="w-4 h-4" /> Spustit hru ({gameState.playerCount} {gameState.playerCount === 1 ? "Hráč" : "Hráči"})
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Active Canvas Holder with Real-time Game Status overlays */}
          <div className="relative flex-1 bg-slate-950 flex items-center justify-center overflow-hidden p-2 min-h-[300px]">
            <div
              ref={containerRef}
              id="game-canvas-holder"
              className="relative w-full max-w-5xl aspect-[16/9] shadow-2xl bg-[#0f172a] overflow-hidden rounded-xl border border-slate-800/80 my-auto flex items-center justify-center min-h-[280px]"
            />

            {/* In-Game HUD overlay */}
            {gameState.status === "playing" && (
              <div id="ingame-hud" className="absolute inset-x-0 top-0 p-4 pointer-events-none flex flex-col gap-3">
                
                {/* HUD Top bar */}
                <div className="flex items-start justify-between w-full">
                  
                  {/* Health Bars for Active Players */}
                  <div className="flex flex-col gap-2 max-w-xs w-full pointer-events-auto">
                    {Array.from({ length: gameState.playerCount }).map((_, pIdx) => {
                      const hp = gameState.playersHealth[pIdx] ?? 100;
                      const maxHp = gameState.playersMaxHealth[pIdx] ?? 100;
                      const isAlive = hp > 0;
                      const names = ["1. Červený", "2. Modrý", "3. Zelený", "4. Žlutý"];
                      const colors = [
                        "from-rose-600 to-orange-500",
                        "from-sky-600 to-blue-500",
                        "from-emerald-600 to-teal-500",
                        "from-amber-500 to-yellow-400"
                      ];

                      return (
                        <div key={pIdx} className="bg-slate-950/85 p-2 px-3 rounded-xl border border-slate-900 backdrop-blur-sm flex flex-col gap-1">
                          <div className="flex justify-between items-center text-[11px]">
                            <span className="font-bold text-white flex items-center gap-1">
                              <Heart className={`w-3 h-3 ${isAlive ? "text-rose-500 fill-rose-500" : "text-slate-600 fill-slate-600"}`} />
                              {pIdx === 0 ? gameState.dragonConfig.name : names[pIdx]}
                            </span>
                            <span className={`font-mono text-[10px] ${isAlive ? "text-slate-300" : "text-rose-500 font-bold uppercase"}`}>
                              {isAlive ? `${Math.floor(hp)} / ${maxHp} HP` : "PORAŽEN"}
                            </span>
                          </div>
                          <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden border border-slate-800/60">
                            <div
                              className={`h-full bg-gradient-to-r ${colors[pIdx % colors.length]} transition-all duration-150`}
                              style={{ width: `${Math.max(0, (hp / maxHp) * 100)}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Level Goal Description, Sound Toggle, and Stats */}
                  <div className="flex flex-col gap-1.5 items-end text-right bg-slate-950/80 p-3 rounded-xl border border-slate-900 backdrop-blur-sm pointer-events-auto">
                    <div className="flex items-center gap-2 justify-between w-full">
                      <button
                        onClick={onToggleMute}
                        className="px-2.5 py-1 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-[10px] font-bold text-slate-300 transition flex items-center gap-1 shadow-sm"
                        title="Zapnout / Vypnout zvuky"
                      >
                        {gameState.mute ? <VolumeX className="w-3 h-3 text-rose-400" /> : <Volume2 className="w-3 h-3 text-emerald-400" />}
                        <span>{gameState.mute ? "Ticho" : "Zvuk"}</span>
                      </button>
                      <div className="text-xs font-bold text-amber-400 flex items-center gap-1 uppercase tracking-wider">
                        <Target className="w-3.5 h-3.5" /> Biom {gameState.currentLevel}: {currentLevelConfig.title}
                      </div>
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

                {/* Boss health bar overlay for all biomes */}
                {gameState.bossHealth > 0 && (
                  <BossHealthBar
                    bossHealth={gameState.bossHealth}
                    bossMaxHealth={gameState.bossMaxHealth}
                    level={gameState.currentLevel}
                  />
                )}

              </div>
            )}

            {/* Paused Screen */}
            {gameState.status === "playing" && gameState.isPaused && (
              <div id="overlay-paused" className="absolute inset-0 z-35 bg-slate-950/80 flex flex-col items-center justify-center backdrop-blur-xs gap-4">
                <h3 className="text-2xl font-black uppercase text-white tracking-widest mb-1">Hra pozastavena</h3>
                <div className="flex gap-3">
                  <button
                    onClick={onTogglePause}
                    className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold transition flex items-center gap-2 text-xs"
                  >
                    <Play className="w-4 h-4" /> Pokračovat
                  </button>
                  <button
                    onClick={onResetGame}
                    className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-400 border border-slate-800 font-bold transition flex items-center gap-2 text-xs"
                  >
                    <RotateCcw className="w-4 h-4" /> Restart celé hry
                  </button>
                </div>
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

          {/* Quick Player Count selector in editor panel */}
          <div className="bg-slate-900/40 rounded-xl border border-slate-900 p-4 mb-6">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-amber-400" /> Počet hráčů ({gameState.playerCount})
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {[1, 2, 3, 4].map((c) => (
                <button
                  key={c}
                  onClick={() => onSetPlayerCount?.(c)}
                  className={`py-1.5 rounded-lg border text-xs font-bold transition ${
                    gameState.playerCount === c
                      ? "bg-amber-500 text-slate-950 border-amber-400"
                      : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
                  }`}
                >
                  {c}P
                </button>
              ))}
            </div>
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
                  className="px-3 py-2 rounded bg-slate-950 border border-slate-800 hover:bg-slate-900 text-xs text-amber-500 font-semibold transition flex items-center justify-center gap-1 col-span-2"
                >
                  <SkipForward className="w-3.5 h-3.5" /> Přeskočit aktuální biom
                </button>
                <button
                  id="btn-level1"
                  onClick={() => onStartLevel(1)}
                  className="px-3 py-2 rounded bg-slate-950 border border-slate-800 hover:bg-slate-900 text-xs text-slate-300 transition"
                >
                  1. Hory
                </button>
                <button
                  id="btn-level2"
                  onClick={() => onStartLevel(2)}
                  className="px-3 py-2 rounded bg-slate-950 border border-slate-800 hover:bg-slate-900 text-xs text-slate-300 transition"
                >
                  2. Poušť
                </button>
                <button
                  id="btn-level3"
                  onClick={() => onStartLevel(3)}
                  className="px-3 py-2 rounded bg-slate-950 border border-slate-800 hover:bg-slate-900 text-xs text-slate-300 transition"
                >
                  3. Les
                </button>
                <button
                  id="btn-level4"
                  onClick={() => onStartLevel(4)}
                  className="px-3 py-2 rounded bg-slate-950 border border-cyan-800/80 hover:bg-cyan-950/60 text-xs text-cyan-300 font-semibold transition"
                >
                  4. Oceán (Hlubiny)
                </button>
              </div>
            </div>

            {/* Gameplay Rules Refcard */}
            <div className="bg-slate-950 rounded-xl border border-slate-900 p-4 space-y-2 text-slate-400">
              <h4 className="text-xs font-bold text-slate-300 flex items-center gap-1 uppercase">
                <HelpCircle className="w-3.5 h-3.5" /> Přehled nebezpečí v biomech
              </h4>
              <ul className="space-y-1 text-[11px] list-disc pl-4 leading-relaxed">
                <li><strong className="text-rose-400">1. úroveň:</strong> Nagy se plazí; lučištníci střílejí šípy, kouzelníci sesílají magické koule a dračí příšery plivou kyselinu.</li>
                <li><strong className="text-orange-400">2. úroveň:</strong> Obří písečný červ se vynořuje svisle. Pouštní čarodějové a střelci útočí ze vzduchu i země.</li>
                <li><strong className="text-emerald-400">3. úroveň:</strong> Obrnění rytíři útočí sekem meče, trpaslíci házejí trny a větve/kořeny tvoří překážky.</li>
                <li><strong className="text-cyan-400">4. úroveň:</strong> Světélkující medúzy, vodní pirani, mořští hadi a gigantický obří Kraken!</li>
              </ul>
            </div>

          </div>
        </div>

      </main>

    </div>
  );
};
