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

export type GameStatus = "menu" | "playing" | "cave_shop" | "level_complete" | "game_over" | "victory";

export interface GameState {
  status: GameStatus;
  currentLevel: number;
  score: number;
  enemiesDefeated: number;
  playerHealth: number;
  playerMaxHealth: number;
  playerCount: number; // 1 to 4 players
  playersHealth: number[]; // Health per active player
  playersMaxHealth: number[]; // Max health per active player
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
  // Upgrades purchased in Cave Sanctuary
  healthUpgradeLevel: number;
  fireRateUpgradeLevel: number;
  damageUpgradeLevel: number;
  speedUpgradeLevel: number;
  babyDragonUnlocked: boolean;
}

export const DRAGONS: DragonConfig[] = [
  {
    id: "red",
    name: "Azrak",
    baseHue: 0,
    colorHex: "#ef4444",
    speed: 6,
    fireRate: 350,
    maxHealth: 300,
    element: "Ohnivý Výbuch",
    projectileColor: 0xff5500
  },
  {
    id: "orange",
    name: "Krteček",
    baseHue: 30,
    colorHex: "#f97316",
    speed: 7,
    fireRate: 400,
    maxHealth: 270,
    element: "Plazmový Výboj",
    projectileColor: 0xffaa00
  },
  {
    id: "yellow",
    name: "Běs Sahary",
    baseHue: 60,
    colorHex: "#eab308",
    speed: 8,
    fireRate: 300,
    maxHealth: 250,
    element: "Blesková Jiskra",
    projectileColor: 0xfff000
  },
  {
    id: "green",
    name: "Zenephyr",
    baseHue: 120,
    colorHex: "#22c55e",
    speed: 6,
    fireRate: 250,
    maxHealth: 330,
    element: "Kyselinový Výstřel",
    projectileColor: 0x22ff55
  },
  {
    id: "blue",
    name: "Modrá Bouře",
    baseHue: 200,
    colorHex: "#3b82f6",
    speed: 5,
    fireRate: 300,
    maxHealth: 360,
    element: "Ledový Střep",
    projectileColor: 0x00aaff
  },
  {
    id: "purple",
    name: "Samara",
    baseHue: 280,
    colorHex: "#a855f7",
    speed: 7,
    fireRate: 320,
    maxHealth: 300,
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
    goalDescription: "Bojujte skrze bouřlivé vrcholy, přežijte dlouhý nápor tvorů a po průletu jeskyní vylepšete schopnosti!",
    targetProgress: 160,
    parallaxSpeedFactor: 1.0,
  },
  {
    id: 2,
    title: "Poušť Bojli",
    subtitle: "Biom: Zlaté písečné duny a písečná bouře",
    goalDescription: "Přežijte dlouhý pouštní let, navštivte jeskynní svatyni a poražte obřího červa v dunách!",
    targetProgress: 160,
    parallaxSpeedFactor: 1.2,
  },
  {
    id: 3,
    title: "Masivní les",
    subtitle: "Biom: Prastaré temné houštiny",
    goalDescription: "Proleťte hlubokým lesním kaňonem, vstupte do mramorové jeskyně pro vylepšení a poražte giganta!",
    targetProgress: 160,
    parallaxSpeedFactor: 1.5,
  },
  {
    id: 4,
    title: "Mořské hlubiny",
    subtitle: "Biom: Nekonečný oceán a podmořský žleb",
    goalDescription: "Ponořte se do oceanického žlebu, vylepšete draka v krystalové jeskyni a poražte Pravěkého Krakena!",
    targetProgress: 160,
    parallaxSpeedFactor: 1.8,
  },
  {
    id: 5,
    title: "Lávová Říše",
    subtitle: "Biom: Řeka žhavé lávy a soptící krátery",
    goalDescription: "Proleťte ohnivou lávovou říší, poražte zlé lávové draky a skoncujte s velkým Lávovým Ninjou Stickmanem!",
    targetProgress: 160,
    parallaxSpeedFactor: 2.0,
  },
  {
    id: 6,
    title: "Temná Říše",
    subtitle: "Biom: Temná stínová propast a fialový kosmický chaos",
    goalDescription: "Probijte se temnými příšerami v propasti a poražte finálního zlotřilého Temného Ninju Stickmena!",
    targetProgress: 160,
    parallaxSpeedFactor: 2.2,
  }
];
