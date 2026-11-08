// Eragon Alagaësia 3D Game Types & Data Models

export type Gender = "boy" | "girl";

export type WeaponType = "sword" | "bow" | "axe";

export interface WeaponOption {
  id: WeaponType;
  name: string;
  description: string;
  range: number;
  damage: number;
  icon: string;
}

export const WEAPON_OPTIONS: WeaponOption[] = [
  {
    id: "sword",
    name: "Jezdecký meč Zar'roc",
    description: "Čepel z jasně červeného kovu ukovaná elfskou kovářkou Rhunön.",
    range: 3.5,
    damage: 25,
    icon: "⚔️"
  },
  {
    id: "bow",
    name: "Tisový jezdecký luk",
    description: "Přesný lovecký luk s tětivou z koňských žíní a šípy s havraním peřím.",
    range: 12.0,
    damage: 20,
    icon: "🏹"
  },
  {
    id: "axe",
    name: "Trpasličí bojová sekera",
    description: "Těžká dvoubřitá sekera klanu Dûrgrimst Ingeitum s runovým ostřím.",
    range: 2.8,
    damage: 35,
    icon: "🪓"
  }
];

export interface RiderConfig {
  gender: Gender;
  name: string;
  eyeColor: string; // hex color for iris
  eyeColorName: string;
  hairColor: string;
  tunicColor: string;
  weapon: WeaponType;
}

export interface DragonConfig3D {
  name: string;
  scaleColor: string; // hex
  bellyColor: string;
  eyeColor: string;
  wingColor: string;
  elementAbility: "fire" | "lightning" | "frost" | "shadow";
  elementName: string;
  elementDesc: string;
  stage: "egg" | "baby" | "juvenile"; // juvenile = horse-sized
  growthProgress: number; // 0 to 100
}

export interface HorseConfig {
  owned: boolean;
  colorName: string;
  bodyColor: string; // hex
  maneColor: string;
  price: number;
}

export const HORSE_BREEDS: HorseConfig[] = [
  {
    owned: false,
    colorName: "Vraník (Černý kůň)",
    bodyColor: "#171717",
    maneColor: "#0a0a0a",
    price: 35
  },
  {
    owned: false,
    colorName: "Bělouš (Bílý sněžný)",
    bodyColor: "#f1f5f9",
    maneColor: "#e2e8f0",
    price: 40
  },
  {
    owned: false,
    colorName: "Hnědák (Kastanový)",
    bodyColor: "#78350f",
    maneColor: "#451a03",
    price: 25
  },
  {
    owned: false,
    colorName: "Plavák (Zlatavý)",
    bodyColor: "#d97706",
    maneColor: "#92400e",
    price: 30
  },
  {
    owned: false,
    colorName: "Strakáč (Černobílý pinto)",
    bodyColor: "#57534e",
    maneColor: "#f5f5f4",
    price: 45
  }
];

export interface Spell {
  id: string;
  name: string;
  ancientWord: string;
  description: string;
  cost: number;
  unlocked: boolean;
  unlockLocationId: LocationId;
  unlockLocationName: string;
  keyNumber: string;
}

export const INITIAL_SPELLS: Spell[] = [
  {
    id: "brisingr",
    name: "Oheň",
    ancientWord: "Brisingr!",
    description: "Vrhne ohnivý výboj energie ze stříbrné dlaně Gedwëy Ignasia.",
    cost: 25,
    unlocked: false,
    unlockLocationId: "yazuak",
    unlockLocationName: "Yazuak (Den 6)",
    keyNumber: "1"
  },
  {
    id: "skolir",
    name: "Štít",
    ancientWord: "Skölir!",
    description: "Vyvolá zářící ochrannou magickou sféru, která odráží útoky a letící klacky.",
    cost: 30,
    unlocked: false,
    unlockLocationId: "daret",
    unlockLocationName: "Daret (Den 10)",
    keyNumber: "2"
  },
  {
    id: "waise_heill",
    name: "Uzdravení",
    ancientWord: "Waíse heill!",
    description: "Zacelí zranění a obnoví fyzické síly z tvé vnitřní energie.",
    cost: 35,
    unlocked: false,
    unlockLocationId: "teirm",
    unlockLocationName: "Teirm (Den 14)",
    keyNumber: "3"
  },
  {
    id: "jierda",
    name: "Zlomení",
    ancientWord: "Jierda!",
    description: "Kinetický ráz Starodávného jazyka, který roztříští překážky a odhodí protivníky vzad.",
    cost: 40,
    unlocked: false,
    unlockLocationId: "hadarak",
    unlockLocationName: "Hadarak (Den 18)",
    keyNumber: "4"
  }
];

export type LocationId = "camp_night1" | "terinsford" | "yazuak" | "daret" | "teirm" | "hadarak" | "varden";

export interface LocationInfo {
  id: LocationId;
  name: string;
  dayNumber: number; // Day 1, 2, 6, 10, etc.
  subtitle: string;
  description: string;
  environmentType: "forest_night" | "town_river" | "town_ruin" | "fortress_dock" | "coastal_city" | "desert_dunes" | "mountain_throne";
  fogColor: number;
  skyColor: number;
  groundColor: number;
}

export const LOCATIONS: LocationInfo[] = [
  {
    id: "camp_night1",
    name: "Tábořiště v lesích Palancar",
    dayNumber: 1,
    subtitle: "První noc s Bromem a vylíhnutým drakem",
    description: "Usedli jste k praskajícímu táboráku pod hvězdným nebem. Drak přistál vedle tebe, lehl si a upřeně pozoruje starého Broma. Brom náhle zvedá větev a vyzývá tě k tréninku!",
    environmentType: "forest_night",
    fogColor: 0x090d16,
    skyColor: 0x050811,
    groundColor: 0x142017
  },
  {
    id: "terinsford",
    name: "Město Terinsford",
    dayNumber: 2,
    subtitle: "Druhý den cesty: Koňský trh a pomoc měšťanům",
    description: "Druhý den jste dorazili k řece a branám Terinsfordu. Zde si můžete koupit věrného koně, vybrat jeho zbarvení, pomoci obyvatelům a nakoupit léčivé lahvičky.",
    environmentType: "town_river",
    fogColor: 0x7dd3fc,
    skyColor: 0x38bdf8,
    groundColor: 0x475569
  },
  {
    id: "yazuak",
    name: "Město Yazuak",
    dayNumber: 6,
    subtitle: "Čtvrtý den cesty: Stopy Urgalů a první kouzlo",
    description: "Mlžné město na břehu řeky Ninor. Zde čelíte nebezpečným hlídkám Urgalů a v tísni poprvé vyslovíte v mysli mocné slovo: Brisingr!",
    environmentType: "town_ruin",
    fogColor: 0x64748b,
    skyColor: 0x475569,
    groundColor: 0x334155
  },
  {
    id: "daret",
    name: "Město Daret",
    dayNumber: 10,
    subtitle: "Pevnost na řece a obranný val",
    description: "Opevněná osada chráněná dřevěnou palisádou. Obyvatelé se obávají nájezdníků. Pomozte jim a naučte se kouzlo štítu Skölir.",
    environmentType: "fortress_dock",
    fogColor: 0x94a3b8,
    skyColor: 0x60a5fa,
    groundColor: 0x3f3f46
  },
  {
    id: "teirm",
    name: "Přístavní město Teirm",
    dayNumber: 14,
    subtitle: "Město z kamene, Jeod a bylinkářka Angela",
    description: "Mohutné pobřežní město obehnané nedobytnými hradbami. Setkání s Bromovým přítelem Jeodem a bylinkářkou Angelou, která ti nabídne vzácné léčivé elixíry.",
    environmentType: "coastal_city",
    fogColor: 0x38bdf8,
    skyColor: 0x0284c7,
    groundColor: 0x64748b
  },
  {
    id: "hadarak",
    name: "Poušť Hadarak",
    dayNumber: 18,
    subtitle: "Nekonečné písečné duny a spalující žár",
    description: "Obrovská poušť v srdci Alagaësie. Cestujete na koni v rozpáleném písku, zatímco tvůj drak krouží na obloze a chrání tě před hlídkami Impéria.",
    environmentType: "desert_dunes",
    fogColor: 0xfde047,
    skyColor: 0xf59e0b,
    groundColor: 0xd97706
  },
  {
    id: "varden",
    name: "Tronjheim ve Farthen Dûru",
    dayNumber: 22,
    subtitle: "Útočiště Vardenů a cíl vaší pouti",
    description: "Obří mramorové město trpaslíků uvnitř vyhaslé sopky Farthen Dûr pod zářící Hvězdnou růží (Isidar Mithrim). Brom tě dovedl k Vardenům. Jsi pravým Jezdcem draků!",
    environmentType: "mountain_throne",
    fogColor: 0x4338ca,
    skyColor: 0x1e1b4b,
    groundColor: 0x312e81
  }
];

export interface Quest {
  id: string;
  locationId: LocationId;
  title: string;
  description: string;
  rewardGold: number;
  completed: boolean;
  giver: string;
}

export const INITIAL_QUESTS: Quest[] = [
  {
    id: "q_campfire_sparring",
    locationId: "camp_night1",
    title: "Trénink s Bromem u táboráku",
    description: "Uhněte se klacku stisknutím Ctrl (kotrmelec) a zasaďte Bromovi úder tlačítkem E. Po tréninku se uzdravte tlačítkem F.",
    rewardGold: 15,
    completed: false,
    giver: "Starý Brom"
  },
  {
    id: "q_buy_horse",
    locationId: "terinsford",
    title: "Koupit věrného koně",
    description: "V Terinsfordu navštivte koňské stáje a vyberte si koně s vyhovujícím zbarvením pro dlouhou cestu.",
    rewardGold: 20,
    completed: false,
    giver: "Koňský handlíř"
  },
  {
    id: "q_help_villagers",
    locationId: "terinsford",
    title: "Pomoc kováři a obyvatelům",
    description: "Pomozte kováři najít ztracené zásoby železné rudy ve městě a získejte cenné zlaťáky.",
    rewardGold: 30,
    completed: false,
    giver: "Kovář Gedric"
  },
  {
    id: "q_yazuak_defense",
    locationId: "yazuak",
    title: "Záchrana mostu v Yazuaku",
    description: "Porazte předsunutou hlídku Urgalů pomocí kouzla Brisingr!",
    rewardGold: 45,
    completed: false,
    giver: "Uprchlý měšťan"
  },
  {
    id: "q_teirm_potions",
    locationId: "teirm",
    title: "Zásoby u bylinkářky Angely",
    description: "Navštivte krámek bylinkářky Angely a kočkodlaka Solembuma v Teirmu a pořiďte si léčivé lektvary.",
    rewardGold: 40,
    completed: false,
    giver: "Bylinkářka Angela"
  },
  {
    id: "q_hadarak_crossing",
    locationId: "hadarak",
    title: "Přejezd pouště Hadarak",
    description: "Udržte svého koně a draka při síle během náročného 4-denního přechodu písků k horám Beor.",
    rewardGold: 60,
    completed: false,
    giver: "Brom"
  }
];

export interface TelepathyChoice {
  text: string;
  dragonReply: string;
  bondEffect: number;
}

export interface TelepathyDialogue {
  id: string;
  prompt: string;
  dragonVoice: string;
  choices: TelepathyChoice[];
}

export const TELEPATHY_DIALOGUES: TelepathyDialogue[] = [
  {
    id: "first_camp",
    prompt: "Hlas v tvé mysli",
    dragonVoice: "Můj Jezdče... Cítím teplo ohně a vůni borovic. Ten stařec Brom... Voní jako stará kůže, dýmka a něco pradávného. Mám mu věřit?",
    choices: [
      {
        text: "Brom je moudrý. Chce nás oba ochránit a dovést do bezpečí.",
        dragonReply: "Pokud mu věříš ty, věřím mu i já. Spolu překonáme cokoliv.",
        bondEffect: 5
      },
      {
        text: "Buď opatrný a měj se na pozoru, maličký. Svět za údolím je nebezpečný.",
        dragonReply: "Budu tě střežit i ve spánku. Moje křídla rostou s každým tvým dechem.",
        bondEffect: 4
      },
      {
        text: "Jak se ti líbí tvé nové jméno?",
        dragonReply: "Je to jméno hodné draka! Zvoní v mé duši jako stříbrný zvon.",
        bondEffect: 6
      }
    ]
  },
  {
    id: "horse_ride",
    prompt: "Myšlenkový hlas za letu",
    dragonVoice: "To čtyřnohé zvíře, na kterém jedeš... Je rychlé, ale mé křídla jsou svobodnější než kterýkoliv kůň v Alagaësii! Vidím tě shora z oblak.",
    choices: [
      {
        text: "Kůň šetří tvé síly, aby ses neunavil dlouhým letem.",
        dragonReply: "Máš pravdu. Budu kroužit nad vámi a hlídat cestu před Ra'zaky.",
        bondEffect: 5
      },
      {
        text: "Těším se, až vyrosteš natolik, abych mohl letět na tvých zádech!",
        dragonReply: "Ten den přijde brzy, můj bratře. Už brzy budeme létat spolu v oblacích!",
        bondEffect: 7
      }
    ]
  },
  {
    id: "magic_awakening",
    prompt: "Rezonance magie",
    dragonVoice: "Cítil jsem to slovo... 'Brisingr'! Ohnivý záblesk ve tvé dlani mě zahřál až do morku kostí. Naše mysli jsou propojené.",
    choices: [
      {
        text: "Byla to tvá síla, kterou jsem cítil proudit skrz stříbrnou značku Gedwëy Ignasia.",
        dragonReply: "Všechno, co mám, patří i tobě. Společně jsme silnější než Galbatorixovi nohsledi.",
        bondEffect: 8
      },
      {
        text: "Starodávný jazyk je vyčerpávající, musím se naučit šetřit energii.",
        dragonReply: "Odpočiň si. Lehnu si vedle tebe a zahřeji tě svými šupinami.",
        bondEffect: 6
      }
    ]
  },
  {
    id: "desert_thoughts",
    prompt: "Horký vítr pouště Hadarak",
    dragonVoice: "Písek pálí a vzduch se chvěje žárem. Ale cítím hory na obzoru... Obrovské štíty Beorských hor. Už jsme blízko Vardenů!",
    choices: [
      {
        text: "Dokázali jsme to! Už jen kousek a budeme v bezpečí Tronjheimu.",
        dragonReply: "Nikdy jsem o tobě nepochyboval, Jezdče. Jsi můj domov.",
        bondEffect: 10
      }
    ]
  }
];

export interface BromSpeechDialogue {
  id: string;
  topic: string;
  bromVoice: string;
  options: {
    text: string;
    bromReply: string;
    healBonus?: boolean;
    energyBonus?: boolean;
  }[];
}

export const BROM_DIALOGUES: BromSpeechDialogue[] = [
  {
    id: "brom_snowfire",
    topic: "Bromův bělouš Sněžná hříva (Snowfire)",
    bromVoice: "Vidíš mého bělouše? Jmenuje se Sněžná hříva (Snowfire). Věrný a neobyčejně rychlý hřebec. Jezdíval jsem na něm dlouho předtím, než jsi v Dračích horách našel to modré vejce.",
    options: [
      {
        text: "Kde jsi takového ušlechtilého bělouše získal?",
        bromReply: "Starý přítel Jeod mi kdysi pomohl. Kůň, který cítí Jezdce, nezaváhá ani před stíny Urgalů. Hlídej svého koně jako své vlastní oči."
      },
      {
        text: "Můj kůň i drak s tebou udrží krok!",
        bromReply: "To brzy prověříme, mladý Jezdče. Cesta do Yazuaku a Teirmu je plná strastí. Šetři síly koně i své vlastní."
      }
    ]
  },
  {
    id: "brom_dragon_lore",
    topic: "Tajemství starých Jezdců draků",
    bromVoice: "Být Jezdcem draků neznamená jen máchat mečem nebo chrlit plameny. Drak a Jezdec jsou jedno tělo i jedna mysl. Když trpí drak, trpí i Jezdec. Vždy mu naslouchej.",
    options: [
      {
        text: "Proč Galbatorix zničil Jezdce?",
        bromReply: "Pýcha a zrada Křivopřísežníků. Galbatorix zatoužil po moci, která mu nenáležela. Teď zbýváš ty a tvůj drak jako poslední jiskra naděje pro celou Alagaësii."
      },
      {
        text: "Naučíš mě víc o Starodávném jazyku?",
        bromReply: "Postupně, chlapče! Každé slovo tě stojí energii tvého těla. Kdybys vyslovil slovo, na které nemáš sílu, magie by tě vysála až na kost.",
        energyBonus: true
      }
    ]
  },
  {
    id: "brom_combat_advice",
    topic: "Rada do boje s Urgaly a vojáky",
    bromVoice: "V boji se nesmíš zastavit! Když stojíš na místě, jsi snadný terč. Využívej kotrmelec (Ctrl), uhýbej a útoč zbraní (E) v pohybu.",
    options: [
      {
        text: "Tvůj trénink u táboráku byl tvrdý, ale pomáhá mi.",
        bromReply: "Boj na život a na smrt není cvičení s klackem. Galbatorixovi nohsledi nebudou mít slitování. Jsem hrdý na tvou vytrvalost.",
        healBonus: true
      }
    ]
  }
];

export interface EragonGameState {
  currentLocationId: LocationId;
  dayCount: number;
  rider: RiderConfig;
  dragon: DragonConfig3D;
  horse: HorseConfig;
  isRidingHorse: boolean;
  playerHealth: number;
  playerMaxHealth: number;
  playerEnergy: number; // for magic
  playerMaxEnergy: number;
  healingPotions: number;
  goldCoins: number;
  bromHealth: number;
  bromMaxHealth: number;
  isSparringWithBrom: boolean;
  bromNoticeGiven: boolean;
  dragonBond: number; // 0 to 100
  unlockedSpells: string[];
  shieldActiveTimer?: number; // duration of active Skölir shield
  justUnlockedSpell?: Spell | null; // discovery modal state
  quests: Quest[];
  totalPlaytimeSeconds: number; // Campaign clock (0 to 14400s = 4 hours)
  campaignTimeFormatted?: string; // "0h 14m / 4h 00m"
  isTelepathyOpen: boolean;
  currentTelepathyDialogue: TelepathyDialogue | null;
  isBromDialogueOpen?: boolean;
  currentBromDialogue?: BromSpeechDialogue | null;
  lastCombatAction: string; // notification banner
  isPaused: boolean;
  isMuted: boolean;
  gameStatus: "character_creation" | "egg_hatching" | "adventure" | "city_shop" | "victory";
}

export interface SavedMapSlot {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  locationId: LocationId;
  locationName: string;
  dayCount: number;
  riderName: string;
  riderGender: Gender;
  dragonName: string;
  dragonColorHex: string;
  goldCoins: number;
  healingPotions: number;
  dragonBond: number;
  state: EragonGameState;
}
