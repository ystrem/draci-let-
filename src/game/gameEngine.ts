import { Application, Container } from "pixi.js";
import { PlayerDragon } from "./dragon";
import { Enemy, Projectile, EnemyType } from "./enemies";
import { Obstacle } from "./obstacles";
import { ParticleSystem } from "./particles";
import { ParallaxBackground } from "./background";
import { GameState, DragonConfig, DRAGONS, LEVELS } from "../types";

export class GameEngine {
  private app!: Application;
  private containerElement: HTMLDivElement;
  private onStateChange: (state: GameState) => void;

  // Game layers
  private gameStage!: Container;
  private bgManager!: ParallaxBackground;
  private playerDragons: PlayerDragon[] = [];
  private particles!: ParticleSystem;

  // Lists of active entities
  private enemies: Enemy[] = [];
  private playerProjectiles: Projectile[] = [];
  private enemyProjectiles: Projectile[] = [];
  private obstacles: Obstacle[] = [];

  // Game Loop States
  private isInitialized: boolean = false;
  private isDestroyed: boolean = false;
  private isRunning: boolean = false;
  private initPromise: Promise<void> | null = null;
  private keys: Record<string, boolean> = {};
  
  // Current dynamic settings
  private currentConfig: DragonConfig;
  private manualHue: number;
  private manualSpeed: number;
  private manualFireRate: number;

  // Scoring and level advancement
  private state: GameState;

  // Spawning variables
  private enemySpawnTimer: number = 0;
  private obstacleSpawnTimer: number = 0;
  private bossSpawned: boolean = false;
  private bossRef: Enemy | null = null;

  // Screen shake arcade feedback
  private shakeTime: number = 0;
  private shakeIntensity: number = 0;

  constructor(
    containerElement: HTMLDivElement,
    initialConfig: DragonConfig,
    onStateChange: (state: GameState) => void
  ) {
    this.containerElement = containerElement;
    this.onStateChange = onStateChange;
    this.currentConfig = initialConfig;
    this.manualHue = initialConfig.baseHue;
    this.manualSpeed = initialConfig.speed;
    this.manualFireRate = initialConfig.fireRate;

    // Build initial React-facing game state
    this.state = {
      status: "menu",
      currentLevel: 1,
      score: 0,
      enemiesDefeated: 0,
      playerHealth: initialConfig.maxHealth,
      playerMaxHealth: initialConfig.maxHealth,
      playerCount: 1,
      playersHealth: [initialConfig.maxHealth],
      playersMaxHealth: [initialConfig.maxHealth],
      levelProgress: 0,
      selectedDragonId: initialConfig.id,
      dragonConfig: initialConfig,
      manualHue: initialConfig.baseHue,
      manualSpeed: initialConfig.speed,
      manualFireRate: initialConfig.fireRate,
      bossHealth: 0,
      bossMaxHealth: 250,
      isPaused: false,
      mute: false,
    };
  }

  // Asynchronous game bootstrap matching Pixi v8 standards
  public async init(): Promise<void> {
    if (this.isInitialized || this.isDestroyed) return;
    if (this.initPromise) return this.initPromise;

    this.initPromise = (async () => {
      this.app = new Application();
      
      try {
        // Modern Pixi v8 Application init
        await this.app.init({
          width: 800,
          height: 450,
          antialias: true,
          background: "#0a0a14",
          preference: "webgl",
        });
      } catch (err) {
        console.warn("Primary WebGL init warning, retrying basic initialization:", err);
        try {
          await this.app.init({
            width: 800,
            height: 450,
            background: "#0a0a14",
          });
        } catch (fallbackErr) {
          console.error("PixiJS initialization fallback failed:", fallbackErr);
          return;
        }
      }

      if (this.isDestroyed) {
        try {
          this.app.destroy(true, { children: true });
        } catch (e) {
          // ignore
        }
        return;
      }

      // Append Pixi's fresh canvas element into the container div
      const canvas = this.app.canvas as HTMLCanvasElement;
      if (canvas && this.containerElement) {
        canvas.id = "game-pixi-canvas";
        canvas.className = "w-full h-full max-w-4xl aspect-[16/9] shadow-2xl block bg-[#0a0a14]";
        canvas.style.display = "block";
        this.containerElement.innerHTML = "";
        this.containerElement.appendChild(canvas);
      }

      // Outer stage for screen shaking
      this.gameStage = new Container();
      this.app.stage.addChild(this.gameStage);

      // 1. Setup parallax background
      this.bgManager = new ParallaxBackground(this.gameStage, 800, 450);

      // 2. Setup particle system
      this.particles = new ParticleSystem(this.gameStage);

      // 3. Setup player dragons
      this.setupPlayers();

      // Bind event listeners
      window.addEventListener("keydown", this.handleKeyDown);
      window.addEventListener("keyup", this.handleKeyUp);

      // Start ticker
      this.app.ticker?.add(this.update);

      this.isInitialized = true;
      this.triggerStateChange();
    })();

    return this.initPromise;
  }

  // Setup player dragons for 1 to 4 active players
  public setupPlayers() {
    // Clear existing dragons from stage
    for (const d of this.playerDragons) {
      d.destroy();
    }
    this.playerDragons = [];

    const count = Math.max(1, Math.min(4, this.state.playerCount));
    this.state.playerCount = count;

    const yPositions = count === 1 ? [225] : count === 2 ? [160, 290] : count === 3 ? [120, 225, 330] : [90, 180, 270, 360];
    const defaultDragons = [DRAGONS[0], DRAGONS[4], DRAGONS[3], DRAGONS[2]]; // Red, Blue, Green, Yellow

    this.state.playersHealth = [];
    this.state.playersMaxHealth = [];

    for (let i = 0; i < count; i++) {
      const dragonConfig = i === 0 ? this.currentConfig : defaultDragons[i % defaultDragons.length];
      const d = new PlayerDragon();
      d.applyConfig(dragonConfig);
      // Ensure equalized flying speed across players
      if (this.manualSpeed) {
        d.speed = this.manualSpeed;
      } else {
        d.speed = Math.max(d.speed, 6.5);
      }
      d.x = 100;
      d.y = yPositions[i];
      d.updatePosition();

      this.playerDragons.push(d);
      if (this.gameStage) {
        this.gameStage.addChild(d.container);
      }

      this.state.playersHealth.push(dragonConfig.maxHealth);
      this.state.playersMaxHealth.push(dragonConfig.maxHealth);
    }

    // Keep state.playerHealth synced to Player 1 or max surviving
    this.state.playerHealth = this.state.playersHealth[0] || 100;
    this.state.playerMaxHealth = this.state.playersMaxHealth[0] || 100;
  }

  public setPlayerCount(count: number) {
    this.state.playerCount = count;
    this.setupPlayers();
    this.triggerStateChange();
  }

  // Begin actual level gameplay
  public startLevel(levelId: number) {
    this.state.currentLevel = levelId;
    this.state.status = "playing";
    this.state.levelProgress = 0;
    this.state.enemiesDefeated = 0;
    
    // Reset player healths for all active players
    this.setupPlayers();

    // Reset bosses
    this.bossSpawned = false;
    this.bossRef = null;
    this.state.bossHealth = 0;

    // Clear active lists
    this.clearLists();

    // Configure background for current biome
    this.bgManager.setBiome(levelId);

    this.isRunning = true;
    this.state.isPaused = false;
    this.triggerStateChange();
  }

  // Stop level loop
  public stop() {
    this.isRunning = false;
    this.clearLists();
    this.triggerStateChange();
  }

  private clearLists() {
    // Safely remove active game graphics
    for (const enemy of this.enemies) enemy.destroy();
    this.enemies = [];

    for (const proj of this.playerProjectiles) proj.destroy();
    this.playerProjectiles = [];

    for (const proj of this.enemyProjectiles) proj.destroy();
    this.enemyProjectiles = [];

    for (const obst of this.obstacles) obst.destroy();
    this.obstacles = [];

    if (this.particles) {
      this.particles.clear();
    }
  }

  // Tweak stats on-the-fly via the editor overlay
  public updateDragonStats(hue: number, speed: number, fireRate: number) {
    this.manualHue = hue;
    this.manualSpeed = speed;
    this.manualFireRate = fireRate;

    this.state.manualHue = hue;
    this.state.manualSpeed = speed;
    this.state.manualFireRate = fireRate;

    this.playerDragons.forEach((d, idx) => {
      if (idx === 0) {
        d.applyConfig(this.currentConfig, hue, speed, fireRate);
      } else {
        d.speed = speed;
      }
    });
    this.triggerStateChange();
  }

  // Change dragon skin on selection for P1
  public selectDragon(dragon: DragonConfig) {
    this.currentConfig = dragon;
    this.manualHue = dragon.baseHue;
    this.manualSpeed = dragon.speed;
    this.manualFireRate = dragon.fireRate;

    this.state.selectedDragonId = dragon.id;
    this.state.dragonConfig = dragon;
    this.state.manualHue = dragon.baseHue;
    this.state.manualSpeed = dragon.speed;
    this.state.manualFireRate = dragon.fireRate;
    this.state.playerMaxHealth = dragon.maxHealth;
    this.state.playerHealth = dragon.maxHealth;

    if (this.playerDragons[0]) {
      this.playerDragons[0].applyConfig(dragon);
      this.state.playersHealth[0] = dragon.maxHealth;
      this.state.playersMaxHealth[0] = dragon.maxHealth;
    }
    this.triggerStateChange();
  }

  public togglePause() {
    this.state.isPaused = !this.state.isPaused;
    this.triggerStateChange();
  }

  public resetGame() {
    this.state.score = 0;
    this.state.currentLevel = 1;
    this.state.levelProgress = 0;
    this.state.enemiesDefeated = 0;
    this.selectDragon(DRAGONS[0]);
    this.startLevel(1);
  }

  public skipLevel() {
    if (this.state.currentLevel < 3) {
      this.startLevel(this.state.currentLevel + 1);
    } else {
      this.state.status = "victory";
      this.isRunning = false;
      this.triggerStateChange();
    }
  }

  // --- KEYBOARD INPUT HANDLERS ---
  private handleKeyDown = (e: KeyboardEvent) => {
    this.keys[e.key] = true;
    this.keys[e.code] = true;

    // Prevent scrolling with arrows/spacebar inside the iframe applet
    if (["Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.code) || [" ", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
      e.preventDefault();
    }
  };

  private handleKeyUp = (e: KeyboardEvent) => {
    this.keys[e.key] = false;
    this.keys[e.code] = false;
  };

  // Trigger screen shake arcade feedback
  private triggerShake(intensity: number, frames: number) {
    this.shakeIntensity = intensity;
    this.shakeTime = frames;
  }

  // --- MAIN UPDATE GAME LOOP TICKER ---
  private update = (ticker: any) => {
    if (this.isDestroyed || !this.app || !this.app.renderer || !this.app.stage) return;
    if (this.state.isPaused) return;

    try {
      // Menu preview loop: update background and let player dragon float & flap wings
      if (this.state.status === "menu") {
        if (this.bgManager) this.bgManager.update(ticker);
        if (this.playerDragons.length > 0) {
          this.playerDragons.forEach((dragon, idx) => {
            dragon.x = 180 + idx * 70;
            dragon.y = 225 + Math.sin(Date.now() * 0.003 + idx) * 16;
            dragon.updatePosition();
            dragon.update(ticker);
            if (this.particles) {
              this.particles.emitDragonTrail(dragon.x, dragon.y, dragon.projectileColor);
            }
          });
          if (this.particles) this.particles.emitStormEmbers(800, 450);
        }
        return;
      }
    } catch (e) {
      console.warn("Transient ticker update error ignored:", e);
      return;
    }

    try {
      if (!this.isRunning) return;

      const dt = ticker.deltaTime || 1;
      const now = Date.now();

      // 1. Process Screen Shake
      if (this.shakeTime > 0) {
        this.gameStage.x = (Math.random() - 0.5) * this.shakeIntensity;
        this.gameStage.y = (Math.random() - 0.5) * this.shakeIntensity;
        this.shakeTime -= dt;
        if (this.shakeTime <= 0) {
          this.gameStage.x = 0;
          this.gameStage.y = 0;
        }
      }

      // 2. Background update
      this.bgManager.update(ticker);

      // 3. Ambient level-specific particles
      if (this.state.currentLevel === 1) {
        this.particles.emitStormEmbers(800, 450);
      } else if (this.state.currentLevel === 2) {
        this.particles.emitSandstorm(800, 450);
      } else if (this.state.currentLevel === 3) {
        this.particles.emitLeaves(800, 450);
      } else if (this.state.currentLevel === 4) {
        this.particles.emitBubbles(800, 450);
      }

      // 4. Gamepad polling
      const gamepads = typeof navigator !== "undefined" && navigator.getGamepads ? navigator.getGamepads() : [];

      // Update inputs & movement for each active player
      for (let pIdx = 0; pIdx < this.playerDragons.length; pIdx++) {
        const dragon = this.playerDragons[pIdx];
        const currentHealth = this.state.playersHealth[pIdx] || 0;
        if (currentHealth <= 0) continue; // Skip defeated player

        dragon.update(ticker);
        this.particles.emitDragonTrail(dragon.x, dragon.y, dragon.projectileColor);

        let dx = 0;
        let dy = 0;
        let firePressed = false;
        let specialPressed = false;

        // Player 1 controls (WASD or Arrow keys if alone, or Gamepad 0)
        if (pIdx === 0) {
          if (this.keys["KeyW"] || this.keys["w"] || (this.playerDragons.length === 1 && (this.keys["ArrowUp"] || this.keys["Up"]))) dy -= 1;
          if (this.keys["KeyS"] || this.keys["s"] || (this.playerDragons.length === 1 && (this.keys["ArrowDown"] || this.keys["Down"]))) dy += 1;
          if (this.keys["KeyA"] || this.keys["a"] || (this.playerDragons.length === 1 && (this.keys["ArrowLeft"] || this.keys["Left"]))) dx -= 1;
          if (this.keys["KeyD"] || this.keys["d"] || (this.playerDragons.length === 1 && (this.keys["ArrowRight"] || this.keys["Right"]))) dx += 1;
          if (this.keys["Space"] || this.keys[" "] || this.keys["KeyF"] || this.keys["f"]) firePressed = true;
          if (this.keys["KeyE"] || this.keys["e"] || this.keys["KeyQ"] || this.keys["q"] || this.keys["ShiftLeft"]) specialPressed = true;
        }
        // Player 2 controls (Arrow keys, Up/Down/Left/Right, Enter/Shift)
        else if (pIdx === 1) {
          if (this.keys["ArrowUp"] || this.keys["Up"] || (this.playerDragons.length === 2 && (this.keys["KeyI"] || this.keys["i"]))) dy -= 1;
          if (this.keys["ArrowDown"] || this.keys["Down"] || (this.playerDragons.length === 2 && (this.keys["KeyK"] || this.keys["k"]))) dy += 1;
          if (this.keys["ArrowLeft"] || this.keys["Left"] || (this.playerDragons.length === 2 && (this.keys["KeyJ"] || this.keys["j"]))) dx -= 1;
          if (this.keys["ArrowRight"] || this.keys["Right"] || (this.playerDragons.length === 2 && (this.keys["KeyL"] || this.keys["l"]))) dx += 1;
          if (this.keys["Enter"] || this.keys["ShiftRight"] || this.keys["Numpad0"] || this.keys["0"] || this.keys["Space"]) firePressed = true;
          if (this.keys["NumpadDecimal"] || this.keys["Delete"] || this.keys["ControlRight"] || this.keys["KeyM"]) specialPressed = true;
        }
        // Player 3 controls (I, K, J, L, O/U)
        else if (pIdx === 2) {
          if (this.keys["KeyI"] || this.keys["i"]) dy -= 1;
          if (this.keys["KeyK"] || this.keys["k"]) dy += 1;
          if (this.keys["KeyJ"] || this.keys["j"]) dx -= 1;
          if (this.keys["KeyL"] || this.keys["l"]) dx += 1;
          if (this.keys["KeyO"] || this.keys["o"] || this.keys["KeyU"] || this.keys["u"]) firePressed = true;
          if (this.keys["KeyP"] || this.keys["p"] || this.keys["KeyY"] || this.keys["y"]) specialPressed = true;
        }
        // Player 4 controls (Numpad 8, 5, 4, 6 or 8, 5, 4, 6, NumpadEnter)
        else if (pIdx === 3) {
          if (this.keys["Numpad8"] || this.keys["8"]) dy -= 1;
          if (this.keys["Numpad5"] || this.keys["Numpad2"] || this.keys["5"] || this.keys["2"]) dy += 1;
          if (this.keys["Numpad4"] || this.keys["4"]) dx -= 1;
          if (this.keys["Numpad6"] || this.keys["6"]) dx += 1;
          if (this.keys["NumpadEnter"] || this.keys["NumpadDecimal"] || this.keys["+"] || this.keys["KeyP"]) firePressed = true;
          if (this.keys["Numpad3"] || this.keys["Numpad9"] || this.keys["KeyM"]) specialPressed = true;
        }

        // Check Gamepad inputs for this player
        const gp = gamepads[pIdx];
        if (gp && gp.connected) {
          // Analog Stick or D-Pad (0.35 deadzone threshold to avoid drift freeze)
          if (Math.abs(gp.axes[0]) > 0.35) dx = gp.axes[0];
          if (Math.abs(gp.axes[1]) > 0.35) dy = gp.axes[1];

          if (gp.buttons[12]?.pressed) dy = -1; // D-Pad Up
          if (gp.buttons[13]?.pressed) dy = 1;  // D-Pad Down
          if (gp.buttons[14]?.pressed) dx = -1; // D-Pad Left
          if (gp.buttons[15]?.pressed) dx = 1;  // D-Pad Right

          if (gp.buttons[0]?.pressed || gp.buttons[1]?.pressed || gp.buttons[2]?.pressed || gp.buttons[5]?.pressed) {
            firePressed = true;
          }
          if (gp.buttons[3]?.pressed || gp.buttons[4]?.pressed || gp.buttons[7]?.pressed) {
            specialPressed = true;
          }
        }

        // Normalize speed
        if (dx !== 0 && dy !== 0) {
          dx *= 0.707;
          dy *= 0.707;
        }

        if (dx !== 0 || dy !== 0) {
          dragon.move(dx, dy, 800, 450);
        }

        // --- PRIMARY FIRING (Multi-Attack Varieties) ---
        if (firePressed) {
          if (now - dragon.lastFired >= dragon.fireRate) {
            dragon.lastFired = now;

            const isSpread = pIdx === 0 || pIdx === 2;
            const isPlasma = pIdx === 1;

            if (isPlasma) {
              // Heavy Plasma Super Wave
              const proj = new Projectile({
                x: dragon.x + 35,
                y: dragon.y,
                vx: 10.0,
                vy: 0,
                color: dragon.projectileColor,
                damage: 18,
                owner: "player",
                type: "plasma"
              });
              this.playerProjectiles.push(proj);
              this.gameStage.addChild(proj.container);
            } else if (isSpread) {
              // Triple Spread Fireball Shot (Fan Arc)
              const angles = [-1.8, 0, 1.8];
              angles.forEach((vy) => {
                const proj = new Projectile({
                  x: dragon.x + 35,
                  y: dragon.y,
                  vx: 8.5,
                  vy: vy,
                  color: dragon.projectileColor,
                  damage: 9,
                  owner: "player",
                  type: "fire"
                });
                this.playerProjectiles.push(proj);
                this.gameStage.addChild(proj.container);
              });
            } else {
              // High-speed Laser Beam
              const proj = new Projectile({
                x: dragon.x + 35,
                y: dragon.y,
                vx: 12.0,
                vy: 0,
                color: dragon.projectileColor,
                damage: 12,
                owner: "player",
                type: "laser_beam"
              });
              this.playerProjectiles.push(proj);
              this.gameStage.addChild(proj.container);
            }
          }
        }

        // --- SECONDARY SPECIAL ATTACK (Radial Super Nova Burst) ---
        if (specialPressed) {
          if (now - dragon.lastSpecialFired >= dragon.specialCooldown) {
            dragon.lastSpecialFired = now;

            // Screen Shake & Explosion
            this.shakeTime = 12;
            this.shakeIntensity = 8;
            this.particles.emitExplosion(dragon.x, dragon.y, dragon.projectileColor, 25);

            // Launch 8 Radial Fireballs in 360 starburst
            const numShots = 8;
            for (let s = 0; s < numShots; s++) {
              const angle = (s * Math.PI * 2) / numShots;
              const proj = new Projectile({
                x: dragon.x + Math.cos(angle) * 20,
                y: dragon.y + Math.sin(angle) * 20,
                vx: Math.cos(angle) * 7.5,
                vy: Math.sin(angle) * 7.5,
                color: dragon.projectileColor,
                damage: 15,
                owner: "player",
                type: "fire"
              });
              this.playerProjectiles.push(proj);
              this.gameStage.addChild(proj.container);
            }
          }
        }
      }

      // 5. Spawn enemies and obstacles dynamically
      this.handleSpawns(dt);

      // 6. Update all entity positions
      this.updateEntities(ticker);

      // 7. Check collisions
      this.checkCollisions();

      // 8. Track level progression / victory transitions
      this.trackProgression(dt);
    } catch (e) {
      console.warn("Transient ticker update error ignored:", e);
    }
  };

  // --- SPAWNING LOGIC ---
  private handleSpawns(dt: number) {
    const level = this.state.currentLevel;

    if (level === 1) {
      // Level 1 (Kixskuske hory - Mountain Peaks): Flying Dragon Monsters and Mountain Nagas only, then Mountain Boss
      if (this.state.levelProgress < 80) {
        this.enemySpawnTimer -= dt * 16.67; // approx ms
        if (this.enemySpawnTimer <= 0) {
          this.enemySpawnTimer = 1600 + Math.random() * 1000; // 1.6 to 2.6 seconds
          
          const rand = Math.random();
          let type: EnemyType = "naga";
          const spawnY = 50 + Math.random() * 320;

          if (rand < 0.5) {
            type = "naga"; // Mountain Naga serpent
          } else {
            type = "dragon_monster"; // Agile flying gargoyle dragon
          }

          const enemy = new Enemy(type, 850, spawnY);
          this.enemies.push(enemy);
          this.gameStage.addChild(enemy.container);
        }
      } else if (!this.bossSpawned) {
        // Spawn Mountain Titan Boss!
        this.bossSpawned = true;
        const mountainBoss = new Enemy("mountain_boss", 850, 200);
        this.enemies.push(mountainBoss);
        this.bossRef = mountainBoss;
        this.gameStage.addChild(mountainBoss.container);

        this.state.bossHealth = mountainBoss.health;
        this.state.bossMaxHealth = mountainBoss.maxHealth;
        this.triggerStateChange();
      }
    } 
    else if (level === 2) {
      // Level 2 (Poušť Bojli - Desert Dunes): Desert Sand Serpent Nagas only, then Giant Sand Worm Boss
      if (this.state.levelProgress < 80) {
        this.enemySpawnTimer -= dt * 16.67;
        if (this.enemySpawnTimer <= 0) {
          this.enemySpawnTimer = 1800 + Math.random() * 1000;
          const type: EnemyType = "naga"; // Desert Sand Viper / Naga
          const spawnY = 60 + Math.random() * 300;

          const enemy = new Enemy(type, 850, spawnY);
          this.enemies.push(enemy);
          this.gameStage.addChild(enemy.container);
        }
      } else if (!this.bossSpawned) {
        // Spawn the Giant Worm boss!
        this.bossSpawned = true;
        
        // Create the Worm Head
        const worm = new Enemy("giant_worm", 900, 225);
        this.enemies.push(worm);
        this.bossRef = worm;
        this.gameStage.addChild(worm.container);

        // Create the Worm Tail immediately lagging behind
        const tail = new Enemy("worm_tail", 1000, 225);
        this.enemies.push(tail);
        this.gameStage.addChild(tail.container);

        this.state.bossHealth = worm.health;
        this.state.bossMaxHealth = worm.maxHealth;
        this.triggerStateChange();
      }
    } 
    else if (level === 3) {
      // Level 3 (Masivní les - Ancient Forest): Woodland obstacles & Forest Dwarves only, then Forest Boss
      if (this.state.levelProgress < 80) {
        this.obstacleSpawnTimer -= dt * 16.67;
        if (this.obstacleSpawnTimer <= 0) {
          this.obstacleSpawnTimer = 1800 + Math.random() * 1000;
          
          const type = Math.random() > 0.5 ? "branch" : "root";
          const scrollSpeed = -3.5;
          const obst = new Obstacle(type, 850, 450, scrollSpeed);
          this.obstacles.push(obst);
          this.gameStage.addChild(obst.container);

          // Spawn ground figure (Forest Dwarf in red hood throwing thorns & bombs) on branches/roots
          const figureType: EnemyType = "dwarf";
          const figureX = 850 + obst.width / 2;
          const figureY = 450 - obst.height - 20;
          const figure = new Enemy(figureType, figureX, figureY);
          figure.speedX = scrollSpeed; 
          this.enemies.push(figure);
          this.gameStage.addChild(figure.container);
        }
      } else if (!this.bossSpawned) {
        // Spawn Ancient Forest Ent Giant Boss!
        this.bossSpawned = true;
        const forestBoss = new Enemy("forest_boss", 850, 310);
        this.enemies.push(forestBoss);
        this.bossRef = forestBoss;
        this.gameStage.addChild(forestBoss.container);

        this.state.bossHealth = forestBoss.health;
        this.state.bossMaxHealth = forestBoss.maxHealth;
        this.triggerStateChange();
      }
    }
    else if (level === 4) {
      // Level 4 (Mořské hlubiny - Ocean Depths): Bioluminescent jellies, hungry piranhas, electric serpents, then Kraken Boss
      if (this.state.levelProgress < 80) {
        this.enemySpawnTimer -= dt * 16.67;
        if (this.enemySpawnTimer <= 0) {
          this.enemySpawnTimer = 1400 + Math.random() * 900;
          
          const rand = Math.random();
          let type: EnemyType = "sea_jelly";
          const spawnY = 50 + Math.random() * 340;

          if (rand < 0.4) {
            type = "sea_jelly";
          } else if (rand < 0.75) {
            type = "sea_piranha";
          } else {
            type = "sea_serpent";
          }

          const enemy = new Enemy(type, 850, spawnY);
          this.enemies.push(enemy);
          this.gameStage.addChild(enemy.container);
        }
      } else if (!this.bossSpawned) {
        // Spawn Ancient Ocean Kraken Boss!
        this.bossSpawned = true;
        const krakenBoss = new Enemy("sea_kraken_boss", 850, 220);
        this.enemies.push(krakenBoss);
        this.bossRef = krakenBoss;
        this.gameStage.addChild(krakenBoss.container);

        this.state.bossHealth = krakenBoss.health;
        this.state.bossMaxHealth = krakenBoss.maxHealth;
        this.triggerStateChange();
      }
    }
  }

  // --- ENTITY UPDATER ---
  private updateEntities(ticker: any) {
    const dt = ticker.deltaTime || 1;
    // Find active player 1 or first living dragon for enemy targeting
    let targetX = 100;
    let targetY = 225;
    for (let i = 0; i < this.playerDragons.length; i++) {
      if ((this.state.playersHealth[i] || 0) > 0) {
        targetX = this.playerDragons[i].x;
        targetY = this.playerDragons[i].y;
        break;
      }
    }

    // Update player projectiles
    for (let i = this.playerProjectiles.length - 1; i >= 0; i--) {
      const proj = this.playerProjectiles[i];
      proj.update(ticker);
      
      // Remove off-screen projectiles
      if (proj.x > 850) {
        proj.destroy();
        this.playerProjectiles.splice(i, 1);
      }
    }

    // Update enemy projectiles
    for (let i = this.enemyProjectiles.length - 1; i >= 0; i--) {
      const proj = this.enemyProjectiles[i];
      proj.update(ticker);

      // Remove off-screen projectiles
      if (proj.x < -50 || proj.y > 500) {
        proj.destroy();
        this.enemyProjectiles.splice(i, 1);
      }
    }

    // Update obstacles (Level 3 tree trunks)
    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const obst = this.obstacles[i];
      obst.update(ticker);

      // Remove offscreen
      if (obst.x < -100) {
        obst.destroy();
        this.obstacles.splice(i, 1);
      }
    }

    // Update enemies
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const enemy = this.enemies[i];
      enemy.update(ticker, targetX, targetY, 800, 450);

      // Handle enemy firing behaviors
      if (enemy.tryShoot(Date.now())) {
        if (enemy.type === "naga") {
          // Naga shoots venom orbs towards target player
          const dy = targetY - enemy.y;
          const proj = new Projectile({
            x: enemy.x - 15,
            y: enemy.y,
            vx: -4.8,
            vy: Math.sign(dy) * 1.2,
            color: 0x14b8a6,
            damage: 8,
            owner: "enemy",
            type: "acid"
          });
          this.enemyProjectiles.push(proj);
          this.gameStage.addChild(proj.container);
        }
        else if (enemy.type === "dragon_monster") {
          // Dragon monster shoots either acid or 3-way firebreath spray
          const rand = Math.random();
          if (rand < 0.5) {
            // Triple Firebreath Spray
            const tys = [-1.5, 0, 1.5];
            tys.forEach((vy) => {
              const proj = new Projectile({
                x: enemy.x - 20,
                y: enemy.y,
                vx: -5.0,
                vy: vy,
                color: 0xef4444,
                damage: 7,
                owner: "enemy",
                type: "fire"
              });
              this.enemyProjectiles.push(proj);
              this.gameStage.addChild(proj.container);
            });
          } else {
            // Spit acid green projectile
            const proj = new Projectile({
              x: enemy.x - 20,
              y: enemy.y,
              vx: -5.5,
              vy: 0,
              color: 0x22c55e,
              damage: 9,
              owner: "enemy",
              type: "acid"
            });
            this.enemyProjectiles.push(proj);
            this.gameStage.addChild(proj.container);
          }
        } 
        else if (enemy.type === "mountain_boss") {
          // Level 1 Boss Attacks: Lightning Plasma Stream, 5-Way Fireball Spread, 8-Way Storm Nova
          const mRand = Math.random();
          if (mRand < 0.4) {
            const proj = new Projectile({
              x: enemy.x - 50,
              y: enemy.y,
              vx: -7.5,
              vy: (Math.random() - 0.5) * 1.5,
              color: 0x06b6d4,
              damage: 15,
              owner: "enemy",
              type: "plasma"
            });
            this.enemyProjectiles.push(proj);
            this.gameStage.addChild(proj.container);
          } else if (mRand < 0.75) {
            const vys = [-3.0, -1.5, 0, 1.5, 3.0];
            vys.forEach((vy) => {
              const proj = new Projectile({
                x: enemy.x - 40,
                y: enemy.y,
                vx: -5.0,
                vy: vy,
                color: 0x22d3ee,
                damage: 10,
                owner: "enemy",
                type: "fire"
              });
              this.enemyProjectiles.push(proj);
              this.gameStage.addChild(proj.container);
            });
          } else {
            for (let a = 0; a < Math.PI * 2; a += Math.PI / 4) {
              const proj = new Projectile({
                x: enemy.x + Math.cos(a) * 30,
                y: enemy.y + Math.sin(a) * 30,
                vx: Math.cos(a) * 4.8,
                vy: Math.sin(a) * 4.8,
                color: 0x38bdf8,
                damage: 12,
                owner: "enemy",
                type: "magic_orb"
              });
              this.enemyProjectiles.push(proj);
              this.gameStage.addChild(proj.container);
            }
          }
        }
        else if (enemy.type === "forest_boss") {
          // Level 3 Boss Attacks: Tree Boulders, Homing Spores, Overhead Bomb Barrage
          const fRand = Math.random();
          if (fRand < 0.4) {
            [-15, 15].forEach((offsetY) => {
              const proj = new Projectile({
                x: enemy.x - 40,
                y: enemy.y + offsetY,
                vx: -5.0 - Math.random(),
                vy: (Math.random() - 0.5) * 2.0,
                color: 0x3f2305,
                damage: 20,
                owner: "enemy",
                type: "boulder"
              });
              this.enemyProjectiles.push(proj);
              this.gameStage.addChild(proj.container);
            });
          } else if (fRand < 0.75) {
            const dy = targetY - enemy.y;
            for (let i = -1; i <= 1; i++) {
              const proj = new Projectile({
                x: enemy.x - 30,
                y: enemy.y + i * 20,
                vx: -4.5,
                vy: Math.sign(dy) * 1.5 + i * 0.8,
                color: 0x22c55e,
                damage: 12,
                owner: "enemy",
                type: "homing"
              });
              this.enemyProjectiles.push(proj);
              this.gameStage.addChild(proj.container);
            }
          } else {
            for (let i = 0; i < 3; i++) {
              const proj = new Projectile({
                x: enemy.x - 20,
                y: enemy.y - 30,
                vx: -3.0 - i * 1.2,
                vy: -5.5 - Math.random() * 2,
                color: 0xef4444,
                damage: 16,
                owner: "enemy",
                type: "bomb"
              });
              this.enemyProjectiles.push(proj);
              this.gameStage.addChild(proj.container);
            }
          }
        }
        else if (enemy.type === "giant_worm") {
          // Giant Sand Worm Boss Attacks (3 varied attack types)
          const bossRand = Math.random();
          if (bossRand < 0.4) {
            // Boss Attack 1: Throws Mega Sand Boulder
            const proj = new Projectile({
              x: enemy.x - 30,
              y: enemy.y - 10,
              vx: -4.0,
              vy: (Math.random() - 0.5) * 2.0,
              color: 0x9a3412,
              damage: 20,
              owner: "enemy",
              type: "boulder"
            });
            this.enemyProjectiles.push(proj);
            this.gameStage.addChild(proj.container);
          } else if (bossRand < 0.75) {
            // Boss Attack 2: 8-Way Radial Poison Spike Burst
            for (let a = 0; a < Math.PI * 2; a += Math.PI / 4) {
              const proj = new Projectile({
                x: enemy.x + Math.cos(a) * 20,
                y: enemy.y + Math.sin(a) * 20,
                vx: Math.cos(a) * 4.5,
                vy: Math.sin(a) * 4.5,
                color: 0xc084fc,
                damage: 12,
                owner: "enemy",
                type: "poison"
              });
              this.enemyProjectiles.push(proj);
              this.gameStage.addChild(proj.container);
            }
          } else {
            // Boss Attack 3: Rapid Flame Stream
            const proj = new Projectile({
              x: enemy.x - 30,
              y: enemy.y,
              vx: -6.5,
              vy: (Math.random() - 0.5) * 1.0,
              color: 0xf97316,
              damage: 10,
              owner: "enemy",
              type: "fire"
            });
            this.enemyProjectiles.push(proj);
            this.gameStage.addChild(proj.container);
          }
        }
        else if (enemy.type === "worm_tail") {
          // Shoot twin poison spiked stinger needles in spread arc
          const proj1 = new Projectile({
            x: enemy.x - 15,
            y: enemy.y,
            vx: -4.5,
            vy: -1.0,
            color: 0xc084fc,
            damage: 12,
            owner: "enemy",
            type: "poison"
          });
          const proj2 = new Projectile({
            x: enemy.x - 15,
            y: enemy.y,
            vx: -4.5,
            vy: 1.0,
            color: 0xc084fc,
            damage: 12,
            owner: "enemy",
            type: "poison"
          });
          this.enemyProjectiles.push(proj1);
          this.enemyProjectiles.push(proj2);
          this.gameStage.addChild(proj1.container);
          this.gameStage.addChild(proj2.container);
        } 
        else if (enemy.type === "dwarf") {
          // Dwarf throws woody thorns OR explosive bombs!
          if (Math.random() > 0.5) {
            // Throw explosive dwarf bomb
            const proj = new Projectile({
              x: enemy.x - 10,
              y: enemy.y - 15,
              vx: -3.0 - Math.random() * 1.5,
              vy: -5.0,
              color: 0xef4444,
              damage: 15,
              owner: "enemy",
              type: "bomb"
            });
            this.enemyProjectiles.push(proj);
            this.gameStage.addChild(proj.container);
          } else {
            // Throw woody poison thorns upwards in a parabolic arc
            const dx = targetX - enemy.x;
            const angleFactor = Math.min(1.0, Math.abs(dx) / 500);
            const proj = new Projectile({
              x: enemy.x - 10,
              y: enemy.y - 15,
              vx: -3.5 - Math.random() * 1.5,
              vy: -4.5 - angleFactor * 3,
              color: 0xeab308,
              damage: 10,
              owner: "enemy",
              type: "thorn"
            });
            this.enemyProjectiles.push(proj);
            this.gameStage.addChild(proj.container);
          }
        }
        else if (enemy.type === "sea_jelly") {
          // Jellyfish fires glowing electric bubble
          const proj = new Projectile({
            x: enemy.x - 12,
            y: enemy.y,
            vx: -4.0,
            vy: (Math.random() - 0.5) * 1.5,
            color: 0x38bdf8,
            damage: 8,
            owner: "enemy",
            type: "magic_orb"
          });
          this.enemyProjectiles.push(proj);
          this.gameStage.addChild(proj.container);
        }
        else if (enemy.type === "sea_serpent") {
          // Serpent fires plasma stream
          const proj = new Projectile({
            x: enemy.x - 20,
            y: enemy.y,
            vx: -5.5,
            vy: (Math.random() - 0.5) * 1.2,
            color: 0x06b6d4,
            damage: 14,
            owner: "enemy",
            type: "acid"
          });
          this.enemyProjectiles.push(proj);
          this.gameStage.addChild(proj.container);
        }
        else if (enemy.type === "sea_kraken_boss") {
          // Level 4 Boss Attacks: Whirlpool Wave, Ink Bomb Barrage, 10-Way Water Burst
          const kRand = Math.random();
          if (kRand < 0.4) {
            // Whirlpool wave stream
            for (let i = -2; i <= 2; i++) {
              const proj = new Projectile({
                x: enemy.x - 50,
                y: enemy.y + i * 18,
                vx: -6.5,
                vy: i * 0.8,
                color: 0x38bdf8,
                damage: 16,
                owner: "enemy",
                type: "plasma"
              });
              this.enemyProjectiles.push(proj);
              this.gameStage.addChild(proj.container);
            }
          } else if (kRand < 0.75) {
            // Ink bombs
            for (let i = 0; i < 3; i++) {
              const proj = new Projectile({
                x: enemy.x - 30,
                y: enemy.y - 20,
                vx: -3.5 - i * 1.5,
                vy: -4.5 - Math.random() * 2,
                color: 0x1e1b4b,
                damage: 18,
                owner: "enemy",
                type: "bomb"
              });
              this.enemyProjectiles.push(proj);
              this.gameStage.addChild(proj.container);
            }
          } else {
            // 10-way tentacles water radial spray
            for (let a = 0; a < Math.PI * 2; a += Math.PI / 5) {
              const proj = new Projectile({
                x: enemy.x + Math.cos(a) * 35,
                y: enemy.y + Math.sin(a) * 35,
                vx: Math.cos(a) * 5.0,
                vy: Math.sin(a) * 5.0,
                color: 0x67e8f9,
                damage: 14,
                owner: "enemy",
                type: "magic_orb"
              });
              this.enemyProjectiles.push(proj);
              this.gameStage.addChild(proj.container);
            }
          }
        }
      }

      // Sync Boss Health to HUD
      if (enemy.type === "giant_worm" || enemy.type === "mountain_boss" || enemy.type === "forest_boss" || enemy.type === "sea_kraken_boss") {
        this.state.bossHealth = Math.max(0, enemy.health);
      }

      // Remove off-screen minor enemies
      if (enemy.x < -150 && enemy.type !== "giant_worm" && enemy.type !== "mountain_boss" && enemy.type !== "forest_boss" && enemy.type !== "sea_kraken_boss") {
        enemy.destroy();
        this.enemies.splice(i, 1);
      }
    }

    // Update global particles
    this.particles.update(ticker);
  }

  // --- COLLISION DETECTION SYSTEMS ---
  private checkCollisions() {
    // 1. Player Projectiles vs Enemies
    for (let pIdx = this.playerProjectiles.length - 1; pIdx >= 0; pIdx--) {
      const proj = this.playerProjectiles[pIdx];
      const pBox = proj.getBoundingBox();

      for (let eIdx = this.enemies.length - 1; eIdx >= 0; eIdx--) {
        const enemy = this.enemies[eIdx];
        const eBox = enemy.getBoundingBox();

        if (this.checkAABB(pBox, eBox)) {
          // Explode particle splash
          this.particles.emitExplosion(proj.x, proj.y, proj.color, 8);
          this.triggerShake(4, 5);

          // Apply damage
          const isDead = enemy.takeDamage(proj.damage);
          
          // Clean up hit projectile
          proj.destroy();
          this.playerProjectiles.splice(pIdx, 1);

          if (isDead) {
            const isBoss = (enemy.type === "giant_worm" || enemy.type === "mountain_boss" || enemy.type === "forest_boss" || enemy.type === "sea_kraken_boss");
            // Massive death particle shatter
            this.particles.emitExplosion(enemy.x, enemy.y, isBoss ? 0xf59e0b : 0xef4444, isBoss ? 40 : 18);
            if (isBoss) {
              this.triggerShake(25, 20);
            }
            this.state.score += isBoss ? 1000 : 100;
            this.state.enemiesDefeated += 1;

            if (isBoss) {
              this.bossRef = null;
              this.state.bossHealth = 0;
            }

            // Remove enemy
            enemy.destroy();
            this.enemies.splice(eIdx, 1);
          }
          break; // break enemy loop since projectile is destroyed
        }
      }
    }

    // Iterate through all active player dragons for enemy collisions
    for (let plIdx = 0; plIdx < this.playerDragons.length; plIdx++) {
      const dragon = this.playerDragons[plIdx];
      if ((this.state.playersHealth[plIdx] || 0) <= 0) continue;

      const playerBox = dragon.getBoundingBox();

      // 2. Enemy Projectiles vs Player Dragons
      for (let i = this.enemyProjectiles.length - 1; i >= 0; i--) {
        const proj = this.enemyProjectiles[i];
        const pBox = proj.getBoundingBox();

        if (this.checkAABB(pBox, playerBox)) {
          this.particles.emitExplosion(proj.x, proj.y, 0xb91c1c, 10);
          this.triggerShake(12, 10);

          this.state.playersHealth[plIdx] = Math.max(0, (this.state.playersHealth[plIdx] || 0) - proj.damage);
          
          proj.destroy();
          this.enemyProjectiles.splice(i, 1);

          this.checkGameOver();
        }
      }

      // 3. Enemies vs Player Dragons (Direct collisions)
      for (let i = this.enemies.length - 1; i >= 0; i--) {
        const enemy = this.enemies[i];
        const eBox = enemy.getBoundingBox();

        if (this.checkAABB(eBox, playerBox)) {
          this.particles.emitExplosion(enemy.x, enemy.y, 0xb91c1c, 15);
          this.triggerShake(16, 12);

          this.state.playersHealth[plIdx] = Math.max(0, (this.state.playersHealth[plIdx] || 0) - enemy.damage);
          
          if (enemy.type !== "giant_worm" && enemy.type !== "mountain_boss" && enemy.type !== "forest_boss" && enemy.type !== "sea_kraken_boss") {
            enemy.destroy();
            this.enemies.splice(i, 1);
          }

          this.checkGameOver();
        }
      }

      // 4. Solid Obstacles vs Player Dragons
      for (const obst of this.obstacles) {
        const oBox = obst.getBoundingBox();
        if (this.checkAABB(oBox, playerBox)) {
          this.particles.emitExplosion(dragon.x + 10, dragon.y, 0x4f7c46, 12);
          this.triggerShake(18, 15);

          this.state.playersHealth[plIdx] = Math.max(0, (this.state.playersHealth[plIdx] || 0) - 1.5);
          this.checkGameOver();
        }
      }
    }
  }

  // Axis-Aligned Bounding Box Collision check
  private checkAABB(a: any, b: any): boolean {
    return (
      a.x < b.x + b.width &&
      a.x + a.width > b.x &&
      a.y < b.y + b.height &&
      a.y + a.height > b.y
    );
  }

  private checkGameOver() {
    this.state.playerHealth = Math.max(...this.state.playersHealth, 0);
    this.triggerStateChange();

    const allDead = this.state.playersHealth.every(h => h <= 0);
    if (allDead) {
      this.state.status = "game_over";
      this.isRunning = false;
      this.triggerStateChange();
    }
  }

  // --- PROGRESSION TRACKER ---
  private trackProgression(dt: number) {
    const level = this.state.currentLevel;

    if (level === 1) {
      // Level 1: Enemies defeated increase progress up to 80%, then Mountain Boss at 80%
      if (this.state.levelProgress < 80) {
        this.state.levelProgress = Math.min(80, this.state.enemiesDefeated * 8);
      } else {
        // Boss fight phase!
        if (this.bossSpawned && !this.bossRef && this.enemies.filter(e => e.type === "mountain_boss").length === 0) {
          this.state.levelProgress = 100;
          this.completeLevel();
        }
      }
    } 
    else if (level === 2) {
      // Level 2: Distance based up to 80%, then Giant Worm Boss required
      if (this.state.levelProgress < 80) {
        this.state.levelProgress += dt * 0.05;
        if (this.state.levelProgress >= 80) {
          this.state.levelProgress = 80;
        }
      } else {
        // Boss fight phase!
        if (this.bossSpawned && !this.bossRef && this.enemies.filter(e => e.type === "giant_worm").length === 0) {
          this.state.levelProgress = 100;
          this.completeLevel();
        }
      }
    } 
    else if (level === 3) {
      // Level 3: Distance based up to 80%, then Ancient Forest Ent Boss required
      if (this.state.levelProgress < 80) {
        this.state.levelProgress += dt * 0.055;
        if (this.state.levelProgress >= 80) {
          this.state.levelProgress = 80;
        }
      } else {
        // Boss fight phase!
        if (this.bossSpawned && !this.bossRef && this.enemies.filter(e => e.type === "forest_boss").length === 0) {
          this.state.levelProgress = 100;
          this.completeLevel();
        }
      }
    }
    else if (level === 4) {
      // Level 4: Distance based up to 80%, then Kraken Boss required
      if (this.state.levelProgress < 80) {
        this.state.levelProgress += dt * 0.06;
        if (this.state.levelProgress >= 80) {
          this.state.levelProgress = 80;
        }
      } else {
        // Boss fight phase!
        if (this.bossSpawned && !this.bossRef && this.enemies.filter(e => e.type === "sea_kraken_boss").length === 0) {
          this.state.levelProgress = 100;
          this.completeLevel();
        }
      }
    }

    this.triggerStateChange();
  }

  private completeLevel() {
    this.isRunning = false;
    this.triggerShake(5, 30);
    
    // Complete entire journey if level 4 (final ocean level), otherwise transition
    if (this.state.currentLevel === 4) {
      this.state.status = "victory";
    } else {
      this.state.status = "level_complete";
    }
    this.triggerStateChange();
  }

  private triggerStateChange() {
    this.onStateChange({ ...this.state });
  }

  // Clean up and release webgl/canvas listeners completely
  public async destroy() {
    this.isDestroyed = true;
    this.isRunning = false;
    window.removeEventListener("keydown", this.handleKeyDown);
    window.removeEventListener("keyup", this.handleKeyUp);
    
    if (this.initPromise) {
      try {
        await this.initPromise;
      } catch (e) {
        // ignore
      }
    }

    if (this.containerElement) {
      this.containerElement.innerHTML = "";
    }

    if (this.app) {
      if (this.app.ticker) {
        try {
          this.app.ticker.remove(this.update);
          this.app.ticker.stop();
        } catch (e) {
          // ignore
        }
      }
      this.clearLists();
      
      if (this.bgManager) this.bgManager.destroy();
      for (const d of this.playerDragons) {
        d.destroy();
      }
      this.playerDragons = [];
      if (this.particles) this.particles.destroy();
      
      try {
        this.app.destroy(true, { children: true });
      } catch (e) {
        // ignore if already destroyed
      }
    }
    this.isInitialized = false;
  }
}
