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
}

export const DRAGONS: DragonConfig[] = [
  {
    id: "red",
    name: "Ignis (Červený)",
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
    name: "Solaris (Oranžový)",
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
    name: "Aurelius (Žlutý)",
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
    name: "Zenephyr (Zelený)",
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
    name: "Achelous (Modrý)",
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
    name: "Nebula (Fialový)",
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
    goalDescription: "Bojujte skrze bouřlivé vrcholy, přežijte nápor tvorů a poražte finálního Vládce Bouřných Štítů!",
    targetProgress: 100,
    parallaxSpeedFactor: 1.0,
  },
  {
    id: 2,
    title: "Poušť Bojli",
    subtitle: "Biom: Zlaté písečné duny a písečná bouře",
    goalDescription: "Přežijte pouštní žár a poražte monstrózního Obřího písečného červa vynořujícího se z dun!",
    targetProgress: 100,
    parallaxSpeedFactor: 1.2,
  },
  {
    id: 3,
    title: "Masivní les",
    subtitle: "Biom: Prastaré temné houštiny",
    goalDescription: "Proleťte hustým lesem, vyhýbejte se kmenům a poražte mocného Prastarého lesního giganta!",
    targetProgress: 100,
    parallaxSpeedFactor: 1.5,
  },
  {
    id: 4,
    title: "Mořské hlubiny",
    subtitle: "Biom: Nekonečný oceán a podmořský žleb",
    goalDescription: "Ponořte se do oceanických hlubin, poražte roje mořských tvorů a udolejte obřího Pravěkého Krakena!",
    targetProgress: 100,
    parallaxSpeedFactor: 1.8,
  }
];
