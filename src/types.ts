export interface DragonConfig {
  id: string;
  name: string;
  baseHue: number; // 0 to 360
  colorHex: string;
  speed: number;   // px per frame
  fireRate: number; // ms between shots
  maxHealth: number;
  element: string;
  projectileColor: number;
}

export type GameStatus = "menu" | "playing" | "level_complete" | "game_over" | "victory";

export interface GameState {
  status: GameStatus;
  currentLevel: number;
  score: number;
  enemiesDefeated: number;
  playerHealth: number;
  playerMaxHealth: number;
  levelProgress: number; // 0 to 100
  selectedDragonId: string;
  dragonConfig: DragonConfig;
  manualHue: number;
  manualSpeed: number;
  manualFireRate: number;
  bossHealth: number; // For level 2 worm boss
  bossMaxHealth: number;
  isPaused: boolean;
  mute: boolean;
}

export const DRAGONS: DragonConfig[] = [
  {
    id: "red",
    name: "Ignis (Červený)",
    baseHue: 0,
    colorHex: "#ef4444",
    speed: 6,
    fireRate: 350,
    maxHealth: 100,
    element: "Ohnivý Výbuch",
    projectileColor: 0xff5500
  },
  {
    id: "orange",
    name: "Solaris (Oranžový)",
    baseHue: 30,
    colorHex: "#f97316",
    speed: 7,
    fireRate: 400,
    maxHealth: 90,
    element: "Plazmový Výboj",
    projectileColor: 0xffaa00
  },
  {
    id: "yellow",
    name: "Aurelius (Žlutý)",
    baseHue: 60,
    colorHex: "#eab308",
    speed: 8,
    fireRate: 300,
    maxHealth: 80,
    element: "Blesková Jiskra",
    projectileColor: 0xfff000
  },
  {
    id: "green",
    name: "Zenephyr (Zelený)",
    baseHue: 120,
    colorHex: "#22c55e",
    speed: 6,
    fireRate: 250,
    maxHealth: 110,
    element: "Kyselinový Výstřel",
    projectileColor: 0x22ff55
  },
  {
    id: "blue",
    name: "Achelous (Modrý)",
    baseHue: 200,
    colorHex: "#3b82f6",
    speed: 5,
    fireRate: 300,
    maxHealth: 120,
    element: "Ledový Střep",
    projectileColor: 0x00aaff
  },
  {
    id: "purple",
    name: "Nebula (Fialový)",
    baseHue: 280,
    colorHex: "#a855f7",
    speed: 7,
    fireRate: 320,
    maxHealth: 100,
    element: "Pulzar Prázdnoty",
    projectileColor: 0xaa22ff
  }
];

export interface LevelConfig {
  id: number;
  title: string;
  subtitle: string;
  goalDescription: string;
  targetProgress: number; // Target score or survival distance
  parallaxSpeedFactor: number;
}

export const LEVELS: LevelConfig[] = [
  {
    id: 1,
    title: "Kixskuske hory",
    subtitle: "Biom: Bouřlivé horské vrcholky",
    goalDescription: "Porazte 15 horských tvorů (Nagů a dračích příšer), abyste unikli z bouřlivých vrcholků.",
    targetProgress: 15, // 15 enemies to defeat
    parallaxSpeedFactor: 1.0,
  },
  {
    id: 2,
    title: "Poušť Bojli",
    subtitle: "Biom: Zlaté písečné duny a písečná bouře",
    goalDescription: "Přežijte pouštní žár a porazte obřího písečného červa vynořujícího se z hlubin.",
    targetProgress: 100, // Distance progress (with boss spawning at 80% progress)
    parallaxSpeedFactor: 1.2,
  },
  {
    id: 3,
    title: "Masivní les",
    subtitle: "Biom: Prastaré temné houštiny",
    goalDescription: "Proleťte hustým lesem! Vyhýbejte se pevným větvím a kořenům stromů a přežijte útoky trpaslíků.",
    targetProgress: 100, // Distance progress (reaches 100 to escape)
    parallaxSpeedFactor: 1.5,
  }
];
