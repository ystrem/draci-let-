// Multi-Save Map System for Eragon 3D Game
// Stores multiple maps/worlds into localStorage with rich state preservation

import { EragonGameState, LocationId, LOCATIONS, SavedMapSlot } from "./typesEragon";

const STORAGE_KEY = "eragon_3d_saved_maps";

export function getDefaultPresetMaps(): SavedMapSlot[] {
  const now = Date.now();
  return [
    {
      id: "slot_1_palancar",
      title: "První noc u táboráku (Safira & Eragon)",
      createdAt: now - 86400000 * 2,
      updatedAt: now - 3600000,
      locationId: "camp_night1",
      locationName: "Tábořiště v lesích Palancar",
      dayCount: 1,
      riderName: "Eragon",
      riderGender: "boy",
      dragonName: "Safira",
      dragonColorHex: "#2563eb",
      goldCoins: 25,
      healingPotions: 3,
      dragonBond: 30,
      state: {
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
          stage: "juvenile",
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
        healingPotions: 3,
        goldCoins: 25,
        bromHealth: 100,
        bromMaxHealth: 100,
        isSparringWithBrom: true,
        bromNoticeGiven: true,
        dragonBond: 30,
        unlockedSpells: [],
        quests: [
          {
            id: "q_campfire_sparring",
            locationId: "camp_night1",
            title: "Trénink s Bromem u táboráku",
            description: "Uhněte se klacku stisknutím Ctrl a zasaďte Bromovi úder tlačítkem E.",
            rewardGold: 15,
            completed: false,
            giver: "Starý Brom"
          }
        ],
        totalPlaytimeSeconds: 900, // 15 mins into 4h campaign
        campaignTimeFormatted: "0h 15m / 4h 00m",
        isTelepathyOpen: false,
        currentTelepathyDialogue: null,
        lastCombatAction: "Načtena mapa 1: První táborák v Palancaru.",
        isPaused: false,
        isMuted: false,
        gameStatus: "adventure"
      }
    },
    {
      id: "slot_2_terinsford",
      title: "Město Terinsford & Koňský trh",
      createdAt: now - 86400000,
      updatedAt: now - 1800000,
      locationId: "terinsford",
      locationName: "Město Terinsford",
      dayCount: 2,
      riderName: "Eragon",
      riderGender: "boy",
      dragonName: "Safira",
      dragonColorHex: "#2563eb",
      goldCoins: 60,
      healingPotions: 4,
      dragonBond: 45,
      state: {
        currentLocationId: "terinsford",
        dayCount: 2,
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
          stage: "juvenile",
          growthProgress: 100
        },
        horse: {
          owned: true,
          colorName: "Vraník (Černý kůň)",
          bodyColor: "#171717",
          maneColor: "#0a0a0a",
          price: 35
        },
        isRidingHorse: true,
        playerHealth: 100,
        playerMaxHealth: 100,
        playerEnergy: 100,
        playerMaxEnergy: 100,
        healingPotions: 4,
        goldCoins: 60,
        bromHealth: 100,
        bromMaxHealth: 100,
        isSparringWithBrom: false,
        bromNoticeGiven: true,
        dragonBond: 45,
        unlockedSpells: [],
        quests: [
          {
            id: "q_buy_horse",
            locationId: "terinsford",
            title: "Koupit věrného koně",
            description: "V Terinsfordu navštivte koňské stáje.",
            rewardGold: 20,
            completed: true,
            giver: "Koňský handlíř"
          }
        ],
        totalPlaytimeSeconds: 3600, // 1h into 4h campaign
        campaignTimeFormatted: "1h 00m / 4h 00m",
        isTelepathyOpen: false,
        currentTelepathyDialogue: null,
        lastCombatAction: "Načtena mapa 2: Terinsford s věrným vraníkem.",
        isPaused: false,
        isMuted: false,
        gameStatus: "adventure"
      }
    },
    {
      id: "slot_3_hadarak",
      title: "Přechod pouště Hadarak & Brisingr",
      createdAt: now - 3600000,
      updatedAt: now - 600000,
      locationId: "hadarak",
      locationName: "Poušť Hadarak",
      dayCount: 18,
      riderName: "Eragon",
      riderGender: "boy",
      dragonName: "Safira",
      dragonColorHex: "#2563eb",
      goldCoins: 110,
      healingPotions: 6,
      dragonBond: 80,
      state: {
        currentLocationId: "hadarak",
        dayCount: 18,
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
          stage: "juvenile",
          growthProgress: 100
        },
        horse: {
          owned: true,
          colorName: "Plavák (Zlatavý)",
          bodyColor: "#d97706",
          maneColor: "#92400e",
          price: 30
        },
        isRidingHorse: true,
        playerHealth: 100,
        playerMaxHealth: 100,
        playerEnergy: 100,
        playerMaxEnergy: 100,
        healingPotions: 6,
        goldCoins: 110,
        bromHealth: 100,
        bromMaxHealth: 100,
        isSparringWithBrom: false,
        bromNoticeGiven: true,
        dragonBond: 80,
        unlockedSpells: ["brisingr", "skolir", "waise_heill", "jierda"],
        quests: [
          {
            id: "q_hadarak_crossing",
            locationId: "hadarak",
            title: "Přejezd pouště Hadarak",
            description: "Udržte svého koně a draka při síle.",
            rewardGold: 60,
            completed: false,
            giver: "Brom"
          }
        ],
        totalPlaytimeSeconds: 10800, // 3h into 4h campaign
        campaignTimeFormatted: "3h 00m / 4h 00m",
        isTelepathyOpen: false,
        currentTelepathyDialogue: null,
        lastCombatAction: "Načtena mapa 3: Horké písky pouště Hadarak.",
        isPaused: false,
        isMuted: false,
        gameStatus: "adventure"
      }
    }
  ];
}

export function loadAllSavedMaps(): SavedMapSlot[] {
  if (typeof window === "undefined") return getDefaultPresetMaps();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const defaults = getDefaultPresetMaps();
      saveAllMaps(defaults);
      return defaults;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    const defaults = getDefaultPresetMaps();
    saveAllMaps(defaults);
    return defaults;
  } catch {
    return getDefaultPresetMaps();
  }
}

export function saveAllMaps(maps: SavedMapSlot[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(maps));
  } catch (e) {
    console.error("Failed to save maps to localStorage", e);
  }
}

export function saveMapSlot(
  slotId: string,
  title: string,
  state: EragonGameState
): SavedMapSlot[] {
  const currentMaps = loadAllSavedMaps();
  const loc = LOCATIONS.find((l) => l.id === state.currentLocationId) || LOCATIONS[0];
  const now = Date.now();

  const existingIdx = currentMaps.findIndex((m) => m.id === slotId);

  const updatedSlot: SavedMapSlot = {
    id: slotId,
    title: title.trim() || `Mapa: ${loc.name} (Den ${state.dayCount})`,
    createdAt: existingIdx >= 0 ? currentMaps[existingIdx].createdAt : now,
    updatedAt: now,
    locationId: state.currentLocationId,
    locationName: loc.name,
    dayCount: state.dayCount,
    riderName: state.rider.name,
    riderGender: state.rider.gender,
    dragonName: state.dragon.name,
    dragonColorHex: state.dragon.scaleColor,
    goldCoins: state.goldCoins,
    healingPotions: state.healingPotions,
    dragonBond: state.dragonBond,
    state: { ...state }
  };

  if (existingIdx >= 0) {
    currentMaps[existingIdx] = updatedSlot;
  } else {
    currentMaps.unshift(updatedSlot);
  }

  saveAllMaps(currentMaps);
  return currentMaps;
}

export function createNewSavedMap(
  title: string,
  initialState: EragonGameState
): SavedMapSlot[] {
  const newId = `slot_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  return saveMapSlot(newId, title, initialState);
}

export function deleteSavedMap(slotId: string): SavedMapSlot[] {
  const currentMaps = loadAllSavedMaps();
  const filtered = currentMaps.filter((m) => m.id !== slotId);
  saveAllMaps(filtered);
  return filtered;
}

export function duplicateSavedMap(slotId: string): SavedMapSlot[] {
  const currentMaps = loadAllSavedMaps();
  const source = currentMaps.find((m) => m.id === slotId);
  if (!source) return currentMaps;

  const newId = `slot_${Date.now()}_copy`;
  const copy: SavedMapSlot = {
    ...source,
    id: newId,
    title: `${source.title} (Kopie)`,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    state: { ...source.state }
  };

  currentMaps.unshift(copy);
  saveAllMaps(currentMaps);
  return currentMaps;
}
