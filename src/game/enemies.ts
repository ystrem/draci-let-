import { Container, Graphics } from "pixi.js";

export type EnemyType = "naga" | "dragon_monster" | "giant_worm" | "worm_tail" | "dwarf" | "mountain_boss" | "forest_boss" | "sea_jelly" | "sea_piranha" | "sea_serpent" | "sea_kraken_boss" | "lava_dragon_enemy" | "lava_ninja_boss" | "dark_monster" | "dark_ninja_boss";

export class Enemy {
  public container: Container;
  public type: EnemyType;
  public x: number;
  public y: number;
  public width: number;
  public height: number;
  
  public health: number;
  public maxHealth: number;
  public speedX: number;
  public speedY: number;
  public damage: number;
  
  // Custom timers
  public fireCooldown: number = 0;
  public fireRate: number = 2000; // ms
  private animTime: number = 0;

  // Segmented bodies (for Nagas and Giant Worm)
  private segments: { x: number; y: number; graphics: Graphics }[] = [];
  private mainGraphics: Graphics;

  // Level 2 Worm movement state
  public wormState: "emerging" | "diving" | "horizontal_sweep" = "emerging";
  private wormTargetY: number = 225;
  private wormTimer: number = 0;

  constructor(type: EnemyType, startX: number, startY: number) {
    this.container = new Container();
    this.type = type;
    this.x = startX;
    this.y = startY;

    this.mainGraphics = new Graphics();
    
    // Set default stats based on type
    switch (type) {
      case "naga":
        this.width = 60;
        this.height = 30;
        this.health = 25;
        this.maxHealth = 25;
        this.speedX = -(1.5 + Math.random() * 1.5);
        this.speedY = 0;
        this.damage = 15;
        this.buildNaga();
        break;

      case "dragon_monster":
        this.width = 50;
        this.height = 40;
        this.health = 20;
        this.maxHealth = 20;
        this.speedX = -(2.5 + Math.random() * 2);
        this.speedY = 0;
        this.damage = 10;
        this.fireRate = 1200 + Math.random() * 800; // spit acid frequently
        this.buildDragonMonster();
        break;

      case "mountain_boss":
        this.width = 140;
        this.height = 90;
        this.health = 850; // High Boss health
        this.maxHealth = 850;
        this.speedX = 0;
        this.speedY = 0;
        this.damage = 25;
        this.fireRate = 1100;
        this.buildMountainBoss();
        break;

      case "giant_worm":
        this.width = 120;
        this.height = 100;
        this.health = 850; // High Boss health
        this.maxHealth = 850;
        this.speedX = -1.5;
        this.speedY = 0;
        this.damage = 30;
        this.wormState = "emerging";
        this.buildGiantWorm();
        break;

      case "worm_tail":
        this.width = 50;
        this.height = 50;
        this.health = 100;
        this.maxHealth = 100;
        this.speedX = -1.5;
        this.speedY = 0;
        this.damage = 20;
        this.fireRate = 1500; // shoots stinger needles
        this.buildWormTail();
        break;

      case "dwarf":
        this.width = 40;
        this.height = 45;
        this.health = 30;
        this.maxHealth = 30;
        this.speedX = -1.0; // moves slowly on ground/branches
        this.speedY = 0;
        this.damage = 15;
        this.fireRate = 2000 + Math.random() * 1000; // throws thorn arcs
        this.buildDwarf();
        break;

      case "forest_boss":
        this.width = 130;
        this.height = 110;
        this.health = 950; // High Boss health
        this.maxHealth = 950;
        this.speedX = -0.5;
        this.speedY = 0;
        this.damage = 30;
        this.fireRate = 1200;
        this.buildForestBoss();
        break;

      case "sea_jelly":
        this.width = 32;
        this.height = 36;
        this.health = 18;
        this.maxHealth = 18;
        this.speedX = -(1.2 + Math.random() * 0.8);
        this.speedY = 0;
        this.damage = 8;
        this.fireRate = 2200;
        this.buildSeaJelly();
        break;

      case "sea_piranha":
        this.width = 42;
        this.height = 28;
        this.health = 25;
        this.maxHealth = 25;
        this.speedX = -(3.2 + Math.random() * 1.5); // Fast swimmer
        this.speedY = 0;
        this.damage = 14;
        this.buildSeaPiranha();
        break;

      case "sea_serpent":
        this.width = 75;
        this.height = 32;
        this.health = 45;
        this.maxHealth = 45;
        this.speedX = -(1.8 + Math.random() * 1.0);
        this.speedY = 0;
        this.damage = 18;
        this.fireRate = 1800;
        this.buildSeaSerpent();
        break;

      case "sea_kraken_boss":
        this.width = 160;
        this.height = 130;
        this.health = 1100; // Massive Ocean Boss health
        this.maxHealth = 1100;
        this.speedX = 0;
        this.speedY = 0;
        this.damage = 35;
        this.fireRate = 1000;
        this.buildSeaKrakenBoss();
        break;

      case "lava_dragon_enemy":
        this.width = 55;
        this.height = 42;
        this.health = 35;
        this.maxHealth = 35;
        this.speedX = -(2.2 + Math.random() * 1.5);
        this.speedY = 0;
        this.damage = 18;
        this.fireRate = 1400;
        this.buildLavaDragonEnemy();
        break;

      case "lava_ninja_boss":
        this.width = 110;
        this.height = 120;
        this.health = 1300; // Large Lava Ninja Boss
        this.maxHealth = 1300;
        this.speedX = 0;
        this.speedY = 0;
        this.damage = 38;
        this.fireRate = 850;
        this.buildLavaNinjaBoss();
        break;

      case "dark_monster":
        this.width = 48;
        this.height = 48;
        this.health = 45;
        this.maxHealth = 45;
        this.speedX = -(2.5 + Math.random() * 1.8);
        this.speedY = 0;
        this.damage = 22;
        this.fireRate = 1300;
        this.buildDarkMonster();
        break;

      case "dark_ninja_boss":
        this.width = 120;
        this.height = 130;
        this.health = 1600; // Final Ultimate Boss: Dark Ninja Stickman
        this.maxHealth = 1600;
        this.speedX = 0;
        this.speedY = 0;
        this.damage = 42;
        this.fireRate = 700;
        this.buildDarkNinjaBoss();
        break;
    }

    this.container.x = this.x;
    this.container.y = this.y;
  }

  // Draw Naga slithering serpent segment-by-segment
  private buildNaga() {
    const segmentCount = 6;
    const segmentRadius = 12;
    const colors = [0x0f766e, 0x14b8a6, 0x0d9488, 0x115e59, 0x134e4a, 0x042f2e];

    for (let i = 0; i < segmentCount; i++) {
      const g = new Graphics();
      g.clear();
      if (i === 0) {
        // Head
        g.circle(0, 0, segmentRadius + 3).fill({ color: 0x0f766e });
        // Glowing violet eyes
        g.circle(4, -4, 2.5).fill({ color: 0xc084fc });
        g.circle(4, 4, 2.5).fill({ color: 0xc084fc });
        // Whiskers/horns
        g.moveTo(-2, -6).lineTo(-10, -14).stroke({ color: 0xc084fc, width: 2 });
        g.moveTo(-2, 6).lineTo(-10, 14).stroke({ color: 0xc084fc, width: 2 });
      } else {
        // Body segment
        g.circle(0, 0, segmentRadius - (i * 1.5)).fill({ color: colors[i % colors.length] });
        // Fin/spike on back of segment
        g.moveTo(0, -(segmentRadius - (i * 1.5)))
          .lineTo(-4, -(segmentRadius - (i * 1.5) + 6))
          .lineTo(-6, -(segmentRadius - (i * 1.5)))
          .closePath()
          .fill({ color: 0xf43f5e });
      }
      
      // Position offset initially
      g.x = -i * 18;
      g.y = 0;
      this.container.addChild(g);
      this.segments.push({ x: g.x, y: g.y, graphics: g });
    }
  }

  // Draw agile gargoyle dragon spitting acid
  private buildDragonMonster() {
    const mainG = this.mainGraphics;
    mainG.clear();
    
    const purpleColor = 0x7e22ce;
    const skinColor = 0x6b21a8;
    const eyeColor = 0x22c55e; // Spits green acid, green eyes!

    // Wing
    mainG.moveTo(0, 0).lineTo(-25, -25).lineTo(-35, -5).lineTo(-15, 0).closePath().fill({ color: 0x581c87 });
    // Body
    mainG.ellipse(0, 5, 18, 12).fill({ color: skinColor });
    // Head facing left (so moves left)
    mainG.moveTo(-10, 0)
      .lineTo(-24, -10)
      .lineTo(-28, 2)
      .lineTo(-15, 8)
      .closePath()
      .fill({ color: skinColor });
    // Horn
    mainG.moveTo(-18, -8).lineTo(-26, -18).lineTo(-14, -8).closePath().fill({ color: 0x581c87 });
    // Red/green eye
    mainG.circle(-21, -4, 2).fill({ color: eyeColor });
    // Tail
    mainG.moveTo(12, 5).bezierCurveTo(25, 8, 30, -5, 38, -2).stroke({ color: skinColor, width: 4 });
    mainG.circle(38, -2, 4).fill({ color: 0x581c87 }); // spike ball

    this.container.addChild(mainG);
  }

  // Draw Giant Segmented Sand Worm (Boss)
  private buildGiantWorm() {
    const segmentCount = 9;
    const colors = [0x9a3412, 0xc2410c, 0xea580c, 0xf97316, 0x9a3412, 0xc2410c, 0xea580c, 0xf97316, 0x7c2d12];
    
    for (let i = 0; i < segmentCount; i++) {
      const g = new Graphics();
      const r = 35 - (i * 2.5); // Tapering back
      g.clear();
      
      if (i === 0) {
        // Head / Maw
        g.circle(0, 0, r).fill({ color: 0x7c2d12 });
        // Inner dark mouth
        g.circle(0, 0, r - 8).fill({ color: 0x111111 });
        // Fangs inside mouth
        for (let a = 0; a < Math.PI * 2; a += Math.PI / 4) {
          const toothX = Math.cos(a) * (r - 12);
          const toothY = Math.sin(a) * (r - 12);
          const toothTipX = Math.cos(a) * (r - 4);
          const toothTipY = Math.sin(a) * (r - 4);
          g.moveTo(toothX, toothY).lineTo(toothTipX, toothTipY).stroke({ color: 0xffffff, width: 3 });
        }
        // Small glowing red predator eyes around mouth
        g.circle(-15, -15, 3).fill({ color: 0xef4444 });
        g.circle(-15, 15, 3).fill({ color: 0xef4444 });
        g.circle(0, -22, 3).fill({ color: 0xef4444 });
        g.circle(0, 22, 3).fill({ color: 0xef4444 });
      } else {
        // Body segment
        g.circle(0, 0, r).fill({ color: colors[i % colors.length] });
        // Left & Right segment spikes (sand worm thorns)
        g.moveTo(-r, -5).lineTo(-r - 10, -12).lineTo(-r + 4, 0).closePath().fill({ color: 0xf97316 });
        g.moveTo(-r, 5).lineTo(-r - 10, 12).lineTo(-r + 4, 0).closePath().fill({ color: 0xf97316 });
        g.moveTo(r, -5).lineTo(r + 10, -12).lineTo(r - 4, 0).closePath().fill({ color: 0xf97316 });
        g.moveTo(r, 5).lineTo(r + 10, 12).lineTo(r - 4, 0).closePath().fill({ color: 0xf97316 });
      }

      g.x = -i * 35;
      g.y = 0;
      this.container.addChild(g);
      this.segments.push({ x: g.x, y: g.y, graphics: g });
    }
  }

  // Draw stinger worm tail
  private buildWormTail() {
    const mainG = this.mainGraphics;
    mainG.clear();
    
    const purpleColor = 0xa855f7;
    const bodyColor = 0x6b21a8;

    // Drawn facing left as an active weapon tail segment
    // Segment balls leading to...
    mainG.circle(20, 5, 12).fill({ color: bodyColor });
    mainG.circle(0, 0, 15).fill({ color: 0x7c2d12 });
    // Claw/Pincers
    mainG.moveTo(0, -10).bezierCurveTo(-20, -25, -35, -10, -40, 5).stroke({ color: 0xea580c, width: 4 });
    mainG.moveTo(0, 10).bezierCurveTo(-20, 25, -35, 10, -40, -5).stroke({ color: 0xea580c, width: 4 });
    // Stinger bulb
    mainG.circle(-10, 0, 8).fill({ color: 0xa855f7 });
    // Poison tip
    mainG.moveTo(-18, 0).lineTo(-32, 0).stroke({ color: 0xd8b4fe, width: 3 });

    this.container.addChild(mainG);
  }

  // Draw Ground Dwarf standing on ground/branches throwing thorns
  private buildDwarf() {
    const mainG = this.mainGraphics;
    mainG.clear();

    const cloakColor = 0x451a03; // Dark cloak
    const hoodColor = 0xb91c1c;  // Red hood
    const shadowColor = 0x1c1917;

    // Body/Cloak shape
    mainG.moveTo(-15, 20)
      .lineTo(-20, -5)
      .lineTo(0, -20)
      .lineTo(20, -5)
      .lineTo(15, 20)
      .closePath()
      .fill({ color: cloakColor });

    // Under shadow / face mask
    mainG.ellipse(0, -6, 12, 10).fill({ color: shadowColor });
    // Glowing red/yellow angry dwarf eyes
    mainG.circle(-4, -6, 2.5).fill({ color: 0xeab308 });
    mainG.circle(4, -6, 2.5).fill({ color: 0xeab308 });
    
    // Hood border overlay
    mainG.moveTo(-12, -8)
      .bezierCurveTo(0, -22, 12, -8, 14, -4)
      .stroke({ color: hoodColor, width: 4 });

    // Small boots
    mainG.circle(-7, 20, 4).fill({ color: shadowColor });
    mainG.circle(7, 20, 4).fill({ color: shadowColor });

    // Arm throwing poses
    mainG.circle(-16, 5, 4.5).fill({ color: hoodColor }); // Cloaked hand

    this.container.addChild(mainG);
  }

  // Draw Level 1 Mountain Boss: Vládce Bouřných Štítů
  private buildMountainBoss() {
    const mainG = this.mainGraphics;
    mainG.clear();

    const scaleColor = 0x1e1b4b; // Deep Indigo Navy
    const bellyColor = 0x38bdf8; // Electric Cyan belly
    const wingColor = 0x06b6d4;  // Cyan wing membrane
    const hornColor = 0xfef08a;  // Lightning Horn Gold

    // Back wings (huge storm wings)
    mainG.moveTo(10, -10)
      .lineTo(60, -65)
      .lineTo(15, -75)
      .lineTo(-30, -50)
      .lineTo(-10, -10)
      .closePath()
      .fill({ color: wingColor });

    mainG.moveTo(-5, -5)
      .lineTo(-45, -70)
      .lineTo(-75, -50)
      .lineTo(-40, -15)
      .closePath()
      .fill({ color: 0x0284c7 });

    // Main Body
    mainG.ellipse(0, 10, 45, 25).fill({ color: scaleColor });
    // Belly plate
    mainG.ellipse(-5, 18, 30, 14).fill({ color: bellyColor });

    // Colossal Head facing left
    mainG.moveTo(-25, 0)
      .lineTo(-65, -15)
      .lineTo(-70, 10)
      .lineTo(-35, 25)
      .closePath()
      .fill({ color: scaleColor });

    // Dual Majestic Lightning Horns
    mainG.moveTo(-45, -12).lineTo(-68, -45).lineTo(-38, -25).closePath().fill({ color: hornColor });
    mainG.moveTo(-35, -15).lineTo(-50, -50).lineTo(-25, -22).closePath().fill({ color: hornColor });

    // Glowing cyan dragon eye
    mainG.circle(-52, -4, 4.5).fill({ color: 0x22d3ee });
    mainG.circle(-53, -5, 2).fill({ color: 0xffffff });

    // Sharp spiky teeth in mouth
    mainG.moveTo(-65, -5).lineTo(-60, 2).lineTo(-55, -3).lineTo(-50, 4).stroke({ color: 0xffffff, width: 2 });

    // Long spiky tail with electric orb
    mainG.moveTo(35, 10).bezierCurveTo(65, 25, 80, -10, 100, -5).stroke({ color: scaleColor, width: 8 });
    mainG.circle(100, -5, 10).fill({ color: 0x06b6d4 });
    mainG.circle(100, -5, 6).fill({ color: 0xffffff });

    this.container.addChild(mainG);
  }

  // Draw Level 3 Forest Boss: Prastarý Lesní Gigant (Tree Ent Golem)
  private buildForestBoss() {
    const mainG = this.mainGraphics;
    mainG.clear();

    const barkColor = 0x3f2305;  // Dark Oak Bark
    const innerBark = 0x261403;
    const mossColor = 0x15803d;  // Mossy Green Crown
    const runeColor = 0xf59e0b;  // Glowing Amber Runes

    // Giant Mossy Foliage Canopy (Crown on top)
    mainG.circle(0, -45, 38).fill({ color: mossColor });
    mainG.circle(-28, -35, 28).fill({ color: 0x166534 });
    mainG.circle(28, -35, 28).fill({ color: 0x166534 });

    // Main Trunk Body
    mainG.poly([-35, 35, -45, -15, 0, -35, 45, -15, 35, 35, 0, 45]).fill({ color: barkColor });
    mainG.poly([-25, 25, -32, -10, 0, -25, 32, -10, 25, 25, 0, 35]).fill({ color: innerBark });

    // Glowing Amber Rune Eyes on Bark Face
    mainG.circle(-16, -10, 5).fill({ color: runeColor });
    mainG.circle(16, -10, 5).fill({ color: runeColor });
    mainG.circle(-16, -10, 2.5).fill({ color: 0xffffff });
    mainG.circle(16, -10, 2.5).fill({ color: 0xffffff });

    // Jagged Wooden Mouth
    mainG.moveTo(-20, 10).lineTo(-10, 18).lineTo(0, 12).lineTo(10, 18).lineTo(20, 10).stroke({ color: 0x78350f, width: 4 });

    // Massive Wooden Club Fist Arms
    mainG.circle(-48, 10, 18).fill({ color: barkColor });
    mainG.circle(48, 10, 18).fill({ color: barkColor });
    mainG.circle(-48, 10, 8).fill({ color: mossColor });
    mainG.circle(48, 10, 8).fill({ color: mossColor });

    // Root feet at bottom
    mainG.moveTo(-30, 35).lineTo(-45, 50).lineTo(-15, 42).closePath().fill({ color: barkColor });
    mainG.moveTo(30, 35).lineTo(45, 50).lineTo(15, 42).closePath().fill({ color: barkColor });

    this.container.addChild(mainG);
  }

  // Draw Bioluminescent Sea Jelly (Small Minion)
  private buildSeaJelly() {
    const mainG = this.mainGraphics;
    mainG.clear();

    // Glowing translucent cyan bell dome
    mainG.ellipse(0, -6, 14, 12).fill({ color: 0x06b6d4, alpha: 0.85 });
    mainG.ellipse(-4, -10, 5, 3).fill({ color: 0x67e8f9, alpha: 0.9 });
    mainG.ellipse(0, -6, 16, 14).stroke({ color: 0x22d3ee, width: 1.5 });

    // Inner glowing core organ
    mainG.circle(0, -4, 4).fill({ color: 0xa5f3fc });

    // Dangling tentacles
    for (let i = -10; i <= 10; i += 5) {
      mainG.moveTo(i, 2)
        .quadraticCurveTo(i + 4, 12, i - 2, 20)
        .stroke({ color: 0x38bdf8, width: 1.8 });
    }

    this.container.addChild(mainG);
  }

  // Draw Aggressive Sea Piranha (Small Minion)
  private buildSeaPiranha() {
    const mainG = this.mainGraphics;
    mainG.clear();

    // Fish body (Deep blue & magenta)
    mainG.ellipse(0, 0, 18, 12).fill({ color: 0x1e1b4b });
    mainG.ellipse(2, 2, 14, 8).fill({ color: 0xc026d3 });

    // Tail fin
    mainG.moveTo(14, 0).lineTo(24, -10).lineTo(20, 0).lineTo(24, 10).closePath().fill({ color: 0xec4899 });

    // Sharp dorsal and ventral fins
    mainG.moveTo(2, -10).lineTo(-8, -18).lineTo(-4, -8).closePath().fill({ color: 0xa855f7 });
    mainG.moveTo(2, 10).lineTo(-6, 16).lineTo(-2, 8).closePath().fill({ color: 0xa855f7 });

    // Angry glowing yellow eye
    mainG.circle(-8, -4, 4).fill({ color: 0xfacc15 });
    mainG.circle(-9, -4, 2).fill({ color: 0x000000 });

    // Sharp white teeth jaw
    mainG.moveTo(-12, 0).lineTo(-18, 4).lineTo(-14, 2).lineTo(-18, 8).lineTo(-10, 6).closePath().fill({ color: 0xffffff });

    this.container.addChild(mainG);
  }

  // Draw Electric Sea Serpent (Medium Minion)
  private buildSeaSerpent() {
    const segmentCount = 5;
    const segmentRadius = 10;
    const colors = [0x0284c7, 0x0369a1, 0x075985, 0x0c4a6e, 0x082f49];

    for (let i = 0; i < segmentCount; i++) {
      const g = new Graphics();
      g.clear();
      if (i === 0) {
        // Dragon sea head
        g.circle(0, 0, segmentRadius + 3).fill({ color: 0x0284c7 });
        // Glowing cyan eye
        g.circle(-4, -3, 3).fill({ color: 0x38bdf8 });
        g.circle(-4, -3, 1.5).fill({ color: 0xffffff });
        // Sea crest fins
        g.moveTo(2, -10).lineTo(10, -18).lineTo(4, -6).closePath().fill({ color: 0x38bdf8 });
        // Fangs
        g.moveTo(-10, 3).lineTo(-14, 8).lineTo(-7, 5).fill({ color: 0xffffff });
      } else {
        // Body segment
        g.circle(0, 0, segmentRadius - i * 1.2).fill({ color: colors[i % colors.length] });
        g.circle(0, -2, (segmentRadius - i * 1.2) * 0.5).fill({ color: 0x38bdf8 });
      }

      g.x = -i * 14;
      g.y = 0;
      this.segments.push({ x: g.x, y: g.y, graphics: g });
      this.container.addChild(g);
    }
  }

  // Draw Ancient Ocean Kraken Boss (Massive Sea Boss)
  private buildSeaKrakenBoss() {
    const mainG = this.mainGraphics;
    mainG.clear();

    const krakenColor = 0x312e81; // Deep abyss indigo
    const innerColor = 0x4338ca;
    const eyeColor = 0xf59e0b; // Glowing golden amber

    // Writhing outer tentacles
    for (let a = 0; a < Math.PI * 2; a += Math.PI / 4) {
      const tx = Math.cos(a) * 45;
      const ty = Math.sin(a) * 45;
      mainG.circle(tx, ty, 18).fill({ color: 0x1e1b4b });
      mainG.circle(tx, ty, 10).fill({ color: 0x4f46e5 });
      // Suction cups
      mainG.circle(tx + 4, ty + 4, 3.5).fill({ color: 0xc7d2fe });
    }

    // Main Kraken Mantle Dome
    mainG.ellipse(0, -10, 48, 38).fill({ color: krakenColor });
    mainG.ellipse(0, -15, 36, 26).fill({ color: innerColor });

    // Crown spikes / Abyssal fins
    mainG.moveTo(-35, -40).lineTo(-20, -65).lineTo(-10, -42).closePath().fill({ color: 0x4338ca });
    mainG.moveTo(35, -40).lineTo(20, -65).lineTo(10, -42).closePath().fill({ color: 0x4338ca });
    mainG.moveTo(0, -45).lineTo(0, -72).lineTo(8, -45).closePath().fill({ color: 0x6366f1 });

    // Large Glowing Golden Abyssal Eyes
    mainG.circle(-22, -10, 9).fill({ color: eyeColor });
    mainG.circle(22, -10, 9).fill({ color: eyeColor });
    mainG.circle(-22, -10, 4).fill({ color: 0x000000 });
    mainG.circle(22, -10, 4).fill({ color: 0x000000 });
    mainG.circle(-24, -12, 2.5).fill({ color: 0xffffff });
    mainG.circle(20, -12, 2.5).fill({ color: 0xffffff });

    // Menacing Beak Mouth
    mainG.moveTo(-12, 10).lineTo(0, 22).lineTo(12, 10).lineTo(0, 14).closePath().fill({ color: 0x020617 });

    this.container.addChild(mainG);
  }

  // Draw Lava Dragon Enemy
  private buildLavaDragonEnemy() {
    const mainG = this.mainGraphics;
    mainG.clear();
    // Fiery red/orange body
    mainG.ellipse(0, 0, 22, 14).fill({ color: 0xd97706 });
    mainG.ellipse(0, 0, 18, 10).fill({ color: 0xef4444 });
    // Horned dragon head
    mainG.circle(-16, -6, 11).fill({ color: 0x991b1b });
    mainG.circle(-20, -5, 5).fill({ color: 0xd97706 });
    // Glowing yellow eye
    mainG.circle(-18, -8, 3.5).fill({ color: 0xfde047 });
    mainG.circle(-18, -8, 1.5).fill({ color: 0x000000 });
    // Lava horns
    mainG.moveTo(-14, -13).lineTo(-10, -22).lineTo(-18, -15).closePath().fill({ color: 0xf97316 });
    // Fiery wing
    mainG.moveTo(2, -4).lineTo(15, -28).lineTo(28, -12).lineTo(10, -2).closePath().fill({ color: 0xf97316 });

    this.container.addChild(mainG);
  }

  // Draw Lava Ninja Stickman Boss
  private buildLavaNinjaBoss() {
    const mainG = this.mainGraphics;
    mainG.clear();

    // Fiery aura glow around stick ninja
    mainG.circle(0, -10, 50).fill({ color: 0xef4444, alpha: 0.25 });
    mainG.circle(0, -10, 35).fill({ color: 0xf97316, alpha: 0.35 });

    // Ninja stickman head (masked with glowing yellow ninja eyes)
    mainG.circle(0, -45, 18).fill({ color: 0x7f1d1d }); // Ninja cowl/mask
    mainG.rect(-12, -49, 24, 7).fill({ color: 0x18181b }); // Eye headband
    // Glowing fiery eyes
    mainG.ellipse(-5, -46, 3, 2).fill({ color: 0xfde047 });
    mainG.ellipse(5, -46, 3, 2).fill({ color: 0xfde047 });

    // Ninja headband tail flowing back
    mainG.moveTo(-12, -45).bezierCurveTo(-25, -52, -35, -40, -42, -58).stroke({ color: 0xef4444, width: 5 });

    // Stickman Body torso
    mainG.rect(-4, -27, 8, 38).fill({ color: 0x7f1d1d }); // Lava Ninja tunic

    // Stick Arms & Dual Flaming Katanas
    mainG.moveTo(-4, -20).lineTo(-22, -10).lineTo(-15, 15).stroke({ color: 0xef4444, width: 5 });
    mainG.moveTo(-15, 15).lineTo(-35, 30).stroke({ color: 0xf97316, width: 4 }).stroke({ color: 0xfde047, width: 2 }); // Flaming Katana 1

    mainG.moveTo(4, -20).lineTo(25, -12).lineTo(40, -25).stroke({ color: 0xef4444, width: 5 });
    mainG.moveTo(40, -25).lineTo(70, -38).stroke({ color: 0xf97316, width: 5 }).stroke({ color: 0xffffff, width: 2 }); // Flaming Katana 2

    // Stick Legs in martial stance
    mainG.moveTo(-2, 11).lineTo(-20, 35).lineTo(-25, 52).stroke({ color: 0x7f1d1d, width: 6 });
    mainG.moveTo(2, 11).lineTo(18, 35).lineTo(22, 52).stroke({ color: 0x7f1d1d, width: 6 });

    this.container.addChild(mainG);
  }

  // Draw Dark Monster
  private buildDarkMonster() {
    const mainG = this.mainGraphics;
    mainG.clear();

    // Dark void shadow aura
    mainG.circle(0, 0, 22).fill({ color: 0x3b0764 });
    mainG.circle(0, 0, 16).fill({ color: 0x581c87 });

    // Glowing purple void eyes
    mainG.circle(-6, -4, 4).fill({ color: 0xc084fc });
    mainG.circle(6, -4, 4).fill({ color: 0xc084fc });
    mainG.circle(-6, -4, 1.5).fill({ color: 0xffffff });
    mainG.circle(6, -4, 1.5).fill({ color: 0xffffff });

    // Sharp shadow claws/horns
    mainG.moveTo(-12, -12).lineTo(-18, -25).lineTo(-8, -16).closePath().fill({ color: 0xa855f7 });
    mainG.moveTo(12, -12).lineTo(18, -25).lineTo(8, -16).closePath().fill({ color: 0xa855f7 });
    mainG.moveTo(-18, 5).lineTo(-28, 12).lineTo(-16, 12).closePath().fill({ color: 0x3b0764 });

    this.container.addChild(mainG);
  }

  // Draw Dark Ninja Stickman Final Boss
  private buildDarkNinjaBoss() {
    const mainG = this.mainGraphics;
    mainG.clear();

    // Dark void purple aura rings
    mainG.circle(0, -10, 55).fill({ color: 0x581c87, alpha: 0.3 });
    mainG.circle(0, -10, 40).fill({ color: 0x7e22ce, alpha: 0.4 });

    // Ninja stickman head (dark purple cowl with bright glowing magenta eyes)
    mainG.circle(0, -50, 20).fill({ color: 0x2e1065 });
    mainG.rect(-14, -54, 28, 8).fill({ color: 0x090514 });
    // Glowing cosmic eyes
    mainG.ellipse(-6, -51, 3.5, 2).fill({ color: 0xe879f9 });
    mainG.ellipse(6, -51, 3.5, 2).fill({ color: 0xe879f9 });

    // Dark flowing scarf/headband tail
    mainG.moveTo(-14, -50).bezierCurveTo(-28, -58, -42, -45, -55, -65).stroke({ color: 0xa855f7, width: 6 });

    // Dark Ninja Torso
    mainG.rect(-5, -30, 10, 42).fill({ color: 0x2e1065 });

    // Arms with dual Dark Void Blades
    mainG.moveTo(-5, -22).lineTo(-25, -12).lineTo(-35, -30).stroke({ color: 0x581c87, width: 5 });
    mainG.moveTo(-35, -30).lineTo(-60, -50).stroke({ color: 0xc084fc, width: 5 }).stroke({ color: 0xffffff, width: 2 });

    mainG.moveTo(5, -22).lineTo(30, -15).lineTo(45, -28).stroke({ color: 0x581c87, width: 5 });
    mainG.moveTo(45, -28).lineTo(78, -42).stroke({ color: 0xe879f9, width: 6 }).stroke({ color: 0xffffff, width: 2 });

    // Stick Legs
    mainG.moveTo(-2, 12).lineTo(-22, 38).lineTo(-28, 58).stroke({ color: 0x2e1065, width: 6 });
    mainG.moveTo(2, 12).lineTo(20, 38).lineTo(25, 58).stroke({ color: 0x2e1065, width: 6 });

    this.container.addChild(mainG);
  }

  // Update position and behavior
  public update(ticker: any, playerX: number, playerY: number, screenWidth: number, screenHeight: number) {
    const dt = (ticker && typeof ticker === 'object' && 'deltaTime' in ticker && typeof ticker.deltaTime === 'number') ? ticker.deltaTime : (typeof ticker === 'number' ? ticker : 1);
    this.animTime += 0.1 * dt;

    // Handle projectile cooldown
    if (this.fireCooldown > 0) {
      this.fireCooldown -= (dt * 16.67); // approximate ms
    }

    // Apply basic speed movement
    this.x += this.speedX * dt;
    this.y += this.speedY * dt;

    // Specific enemy behaviors
    switch (this.type) {
      case "naga": {
        // Naga slithers up and down in a wavy motion
        this.y += Math.sin(this.animTime * 0.8) * 1.5 * dt;
        
        // Update segment slither offsets dynamically for the gorgeous snake wave!
        for (let i = 0; i < this.segments.length; i++) {
          const seg = this.segments[i];
          // Each segment lags behind the previous
          seg.graphics.y = Math.sin(this.animTime * 0.8 - i * 0.5) * 8;
        }
        break;
      }

      case "dragon_monster": {
        // Dragon monsters bob up and down slightly
        this.y += Math.sin(this.animTime * 1.5) * 0.5 * dt;
        break;
      }

      case "mountain_boss": {
        // Mountain Boss hovers gracefully around screen right (x ~ 650)
        // Smooth sine wave movement up and down
        if (this.x > 620) {
          this.speedX = -1.8;
        } else {
          this.speedX = 0;
        }
        this.y = 200 + Math.sin(this.animTime * 0.9) * 80;
        break;
      }

      case "giant_worm": {
        this.wormTimer += dt * 0.016; // approx seconds
        
        // The giant worm alternates states: emerging vertically, diving, or horizontal sweep
        if (this.wormState === "emerging") {
          // Erupt vertically from bottom or sweep from right
          this.speedX = -2.5;
          // Follow player Y loosely
          const dy = playerY - this.y;
          this.y += Math.sign(dy) * 1.2 * dt;

          // Face towards movement direction
          const angle = Math.atan2(Math.sign(dy) * 1.2, -2.5);
          this.container.rotation = angle;
        } else if (this.wormState === "diving") {
          // Dive back down
          this.speedX = -1.0;
          this.y += 3 * dt;
          this.container.rotation = Math.PI / 4;
        } else {
          // Horizontal Sweep: fly straight left rapidly
          this.speedX = -5;
          this.speedY = 0;
          this.container.rotation = 0;
        }

        // Segment chaining logic for giant worm!
        for (let i = 0; i < this.segments.length; i++) {
          const seg = this.segments[i];
          seg.graphics.y = Math.sin(this.animTime * 0.6 - i * 0.4) * 6;
        }

        // Change states every few seconds
        if (this.wormTimer > 4.5) {
          this.wormTimer = 0;
          const rand = Math.random();
          if (rand < 0.4) {
            this.wormState = "emerging";
          } else if (rand < 0.7) {
            this.wormState = "horizontal_sweep";
            // Reposition Y to player level to surprise them
            this.y = playerY;
            this.x = screenWidth + 150;
          } else {
            this.wormState = "diving";
          }
        }
        break;
      }

      case "worm_tail": {
        // Matches boss vertical position or hovers nearby
        this.y += Math.sin(this.animTime * 0.7) * 2 * dt;
        break;
      }

      case "dwarf": {
        const groundLevel = screenHeight - 45;
        if (this.y < groundLevel - 5) {
          this.y += 2 * dt;
        } else {
          this.y = groundLevel;
        }
        break;
      }

      case "forest_boss": {
        // Forest Boss marches on forest ground floor
        if (this.x > 630) {
          this.speedX = -1.5;
        } else {
          this.speedX = Math.sin(this.animTime * 0.5) * 1.2;
        }
        const forestFloor = 310;
        this.y = forestFloor + Math.sin(this.animTime * 1.5) * 12; // stomping march
        break;
      }

      case "sea_jelly": {
        // Jellyfish pulses upwards and drifts slowly
        this.y += Math.sin(this.animTime * 1.8) * 1.8 * dt;
        break;
      }

      case "sea_piranha": {
        // Piranha darts aggressively up and down aiming for dragon height
        const dy = playerY - this.y;
        this.y += Math.sign(dy) * 1.2 * dt + Math.sin(this.animTime * 2.5) * 0.8;
        break;
      }

      case "sea_serpent": {
        this.y += Math.sin(this.animTime * 1.2) * 2.0 * dt;
        for (let i = 0; i < this.segments.length; i++) {
          const seg = this.segments[i];
          seg.graphics.y = Math.sin(this.animTime * 1.2 - i * 0.6) * 10;
        }
        break;
      }

      case "sea_kraken_boss": {
        // Massive Kraken floats in water abyssal depths, slowly swaying
        if (this.x > 620) {
          this.speedX = -1.5;
        } else {
          this.speedX = 0;
        }
        this.y = 220 + Math.sin(this.animTime * 0.8) * 70;
        this.container.rotation = Math.sin(this.animTime * 0.4) * 0.08;
        break;
      }

      case "lava_dragon_enemy": {
        this.y += Math.sin(this.animTime * 1.8) * 1.2 * dt;
        break;
      }

      case "lava_ninja_boss": {
        if (this.x > 630) {
          this.speedX = -2.0;
        } else {
          this.speedX = 0;
        }
        // Ninja leaps up and down gracefully
        this.y = 210 + Math.sin(this.animTime * 1.2) * 85;
        this.container.rotation = Math.sin(this.animTime * 1.2) * 0.12;
        break;
      }

      case "dark_monster": {
        const dy = playerY - this.y;
        this.y += Math.sign(dy) * 1.4 * dt + Math.cos(this.animTime * 2.0) * 1.2;
        break;
      }

      case "dark_ninja_boss": {
        if (this.x > 620) {
          this.speedX = -2.2;
        } else {
          this.speedX = 0;
        }
        // Dark Ninja teleports/dashes vertically with shadow steps
        this.y = 220 + Math.sin(this.animTime * 1.6) * 95;
        this.container.rotation = Math.sin(this.animTime * 0.8) * 0.15;
        break;
      }
    }

    this.container.x = this.x;
    this.container.y = this.y;
  }

  // Check if enemy can shoot, reset cooldown and return true
  public tryShoot(now: number): boolean {
    if (this.fireCooldown <= 0) {
      this.fireCooldown = this.fireRate;
      return true;
    }
    return false;
  }

  public getBoundingBox() {
    if (this.type === "giant_worm") {
      return {
        x: this.x - 50,
        y: this.y - 45,
        width: 100,
        height: 90
      };
    }
    if (this.type === "mountain_boss") {
      return {
        x: this.x - 65,
        y: this.y - 40,
        width: 130,
        height: 80
      };
    }
    if (this.type === "forest_boss") {
      return {
        x: this.x - 55,
        y: this.y - 50,
        width: 110,
        height: 100
      };
    }
    if (this.type === "sea_kraken_boss") {
      return {
        x: this.x - 70,
        y: this.y - 55,
        width: 140,
        height: 110
      };
    }
    if (this.type === "lava_ninja_boss") {
      return {
        x: this.x - 55,
        y: this.y - 60,
        width: 110,
        height: 120
      };
    }
    if (this.type === "dark_ninja_boss") {
      return {
        x: this.x - 60,
        y: this.y - 65,
        width: 120,
        height: 130
      };
    }
    // Normal enemy box
    return {
      x: this.x - this.width / 2,
      y: this.y - this.height / 2,
      width: this.width,
      height: this.height
    };
  }

  public isBoss(): boolean {
    return (
      this.type === "mountain_boss" ||
      this.type === "giant_worm" ||
      this.type === "forest_boss" ||
      this.type === "sea_kraken_boss" ||
      this.type === "lava_ninja_boss" ||
      this.type === "dark_ninja_boss"
    );
  }

  public takeDamage(amount: number): boolean {
    this.health -= amount;
    // Highlight flash when damaged
    this.container.alpha = 0.5;
    setTimeout(() => {
      if (this.container) this.container.alpha = 1.0;
    }, 100);

    return this.health <= 0;
  }

  public destroy() {
    for (const seg of this.segments) {
      seg.graphics.destroy();
    }
    this.segments = [];
    this.mainGraphics.destroy();
    this.container.destroy({ children: true });
  }
}

// Separate class for both player and enemy projectiles
export class Projectile {
  public container: Container;
  public graphics: Graphics;
  public x: number;
  public y: number;
  public vx: number;
  public vy: number;
  public width: number;
  public height: number;
  public color: number;
  public damage: number;
  
  // Who fired: "player" or "enemy"
  public owner: "player" | "enemy";
  public type: "fire" | "acid" | "poison" | "thorn" | "arrow" | "magic_orb" | "sword_slash" | "plasma" | "boulder" | "bomb" | "laser_beam" | "homing";

  constructor(options: {
    x: number;
    y: number;
    vx: number;
    vy: number;
    color: number;
    damage: number;
    owner: "player" | "enemy";
    type?: "fire" | "acid" | "poison" | "thorn" | "arrow" | "magic_orb" | "sword_slash" | "plasma" | "boulder" | "bomb" | "laser_beam" | "homing";
  }) {
    this.container = new Container();
    this.graphics = new Graphics();
    this.x = options.x;
    this.y = options.y;
    this.vx = options.vx;
    this.vy = options.vy;
    this.color = options.color;
    this.damage = options.damage;
    this.owner = options.owner;
    this.type = options.type || "fire";

    this.drawProjectile();
    this.container.addChild(this.graphics);
    this.container.x = this.x;
    this.container.y = this.y;

    // Define bounding size
    if (this.type === "fire") {
      this.width = 16;
      this.height = 10;
    } else if (this.type === "plasma") {
      this.width = 30;
      this.height = 24;
    } else if (this.type === "boulder") {
      this.width = 28;
      this.height = 28;
    } else if (this.type === "bomb") {
      this.width = 16;
      this.height = 16;
    } else if (this.type === "acid") {
      this.width = 14;
      this.height = 14;
    } else {
      this.width = 12;
      this.height = 8;
    }
  }

  private drawProjectile() {
    const g = this.graphics;
    g.clear();

    if (this.type === "fire") {
      // Fireball / Plasma capsule facing right
      g.ellipse(0, 0, 8, 4).fill({ color: this.color });
      // Inner hot core
      g.ellipse(2, 0, 4, 2).fill({ color: 0xffffff });
      // Sparks trailing back
      g.moveTo(-6, -2).lineTo(-12, 0).lineTo(-6, 2).closePath().fill({ color: 0xffaa00 });
    } else if (this.type === "plasma") {
      // Massive glowing plasma crescent wave
      g.ellipse(0, 0, 16, 12).fill({ color: this.color });
      g.ellipse(2, 0, 10, 6).fill({ color: 0xffffff }); // White hot core
      // Outer aura ring
      g.ellipse(0, 0, 20, 14).stroke({ color: this.color, width: 2 });
    } else if (this.type === "boulder") {
      // Giant jagged sand rock
      g.poly([-12, -8, 2, -14, 14, -6, 12, 8, 0, 14, -10, 10]).fill({ color: 0x9a3412 });
      g.poly([-8, -4, 0, -10, 8, -4, 6, 4, -4, 6]).fill({ color: 0xc2410c }); // Inner rock detail
    } else if (this.type === "bomb") {
      // Explosive dwarf bomb with lit fuse
      g.circle(0, 2, 7).fill({ color: 0x1c1917 }); // Iron bomb body
      g.circle(-2, -1, 2).fill({ color: 0x57534e }); // Specular
      // Fuse & spark
      g.moveTo(0, -5).lineTo(4, -10).stroke({ color: 0xd97706, width: 2 });
      g.circle(4, -10, 2.5).fill({ color: 0xef4444 }); // Spark
    } else if (this.type === "laser_beam") {
      // Long fast energy beam
      g.rect(-15, -2, 30, 4).fill({ color: this.color });
      g.rect(-12, -1, 24, 2).fill({ color: 0xffffff });
    } else if (this.type === "homing") {
      // Spiraling homing magic orb
      g.circle(0, 0, 6).fill({ color: this.color });
      g.circle(-1, -1, 3).fill({ color: 0xffffff });
      g.moveTo(-6, 0).lineTo(-14, -3).lineTo(-10, 0).lineTo(-14, 3).closePath().fill({ color: this.color });
    } else if (this.type === "acid") {
      // Acid blob
      g.circle(0, 0, 6).fill({ color: 0x22c55e }); // vibrant green
      g.circle(-2, -2, 2).fill({ color: 0xbbf7d0 }); // bubble specular
    } else if (this.type === "poison") {
      // Stinger needle (pincer thorn) purple/cyan
      g.moveTo(-10, 0)
        .lineTo(8, -3)
        .lineTo(12, 0)
        .lineTo(8, 3)
        .closePath()
        .fill({ color: 0xc084fc });
      // inner glowing core
      g.rect(-4, -1, 10, 2).fill({ color: 0xf3e8ff });
    } else if (this.type === "thorn") {
      // Poisonous woody thorn (yellowish orange)
      g.moveTo(-8, -4)
        .bezierCurveTo(2, -8, 8, -2, 10, 0)
        .bezierCurveTo(8, 2, 2, 8, -8, 4)
        .closePath()
        .fill({ color: 0xeab308 });
      g.circle(-4, 0, 2.5).fill({ color: 0x78350f }); // wooden base node
    } else if (this.type === "arrow") {
      // Wooden Arrow with steel tip and red feather fletching facing direction
      g.rect(-12, -1, 18, 2).fill({ color: 0x78350f }); // shaft
      g.moveTo(6, -4).lineTo(14, 0).lineTo(6, 4).closePath().fill({ color: 0x94a3b8 }); // tip
      g.moveTo(-12, -4).lineTo(-6, -1).lineTo(-12, 0).closePath().fill({ color: 0xef4444 }); // top feather
      g.moveTo(-12, 4).lineTo(-6, 1).lineTo(-12, 0).closePath().fill({ color: 0xef4444 }); // bottom feather
    } else if (this.type === "magic_orb") {
      // Glowing Sapphire Magic Orb
      g.circle(0, 0, 7).fill({ color: 0x06b6d4 });
      g.circle(0, 0, 4).fill({ color: 0x67e8f9 });
      g.circle(-2, -2, 2).fill({ color: 0xffffff });
    } else if (this.type === "sword_slash") {
      // Crescent Golden Sword Energy Wave
      g.arc(0, 0, 12, -Math.PI * 0.4, Math.PI * 0.4, false)
        .stroke({ color: 0xf59e0b, width: 4 });
      g.arc(0, 0, 10, -Math.PI * 0.3, Math.PI * 0.3, false)
        .stroke({ color: 0xfef08a, width: 2 });
    }
  }

  public update(ticker: any) {
    const dt = (ticker && typeof ticker === 'object' && 'deltaTime' in ticker && typeof ticker.deltaTime === 'number') ? ticker.deltaTime : (typeof ticker === 'number' ? ticker : 1);
    
    // Apply velocity
    this.x += this.vx * dt;
    this.y += this.vy * dt;

    // Apply specific behavior by type
    if (this.type === "thorn" || this.type === "bomb") {
      this.vy += 0.12 * dt; // parabolic gravity pull
      this.container.rotation = Math.atan2(this.vy, this.vx);
    } else if (this.type === "boulder") {
      this.container.rotation += 0.08 * dt; // spin rock
    } else if (this.type === "arrow" || this.type === "plasma" || this.type === "laser_beam") {
      this.container.rotation = Math.atan2(this.vy, this.vx);
    } else if (this.type === "magic_orb" || this.type === "homing") {
      this.container.rotation += 0.15 * dt;
    } else if (this.type === "sword_slash") {
      this.container.rotation = Math.atan2(this.vy, this.vx);
    }

    this.container.x = this.x;
    this.container.y = this.y;
  }

  public getBoundingBox() {
    return {
      x: this.x - this.width / 2,
      y: this.y - this.height / 2,
      width: this.width,
      height: this.height
    };
  }

  public destroy() {
    this.graphics.destroy();
    this.container.destroy({ children: true });
  }
}
