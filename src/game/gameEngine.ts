import { Application, Container } from "pixi.js";
import { PlayerDragon } from "./dragon";
import { Enemy, Projectile, EnemyType } from "./enemies";
import { Obstacle } from "./obstacles";
import { ParticleSystem } from "./particles";
import { ParallaxBackground } from "./background";
import { GameState, DragonConfig, DRAGONS, LEVELS } from "../types";

export class GameEngine {
  private app!: Application;
  private canvas: HTMLCanvasElement;
  private onStateChange: (state: GameState) => void;

  // Game layers
  private gameStage!: Container;
  private bgManager!: ParallaxBackground;
  private playerDragon!: PlayerDragon;
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
    canvas: HTMLCanvasElement,
    initialConfig: DragonConfig,
    onStateChange: (state: GameState) => void
  ) {
    this.canvas = canvas;
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
  public async init() {
    if (this.isInitialized || this.isDestroyed) return;

    this.app = new Application();
    
    // Modern Pixi v8 Application init
    await this.app.init({
      canvas: this.canvas,
      width: 800,
      height: 450,
      antialias: true,
      background: "#0a0a14",
    });

    if (this.isDestroyed) {
      try {
        this.app.destroy(true, { children: true, texture: true });
      } catch (e) {
        // ignore
      }
      return;
    }

    // Outer stage for screen shaking
    this.gameStage = new Container();
    this.app.stage.addChild(this.gameStage);

    // 1. Setup parallax background
    this.bgManager = new ParallaxBackground(this.gameStage, 800, 450);

    // 2. Setup particle system
    this.particles = new ParticleSystem(this.gameStage);

    // 3. Setup player dragon
    this.playerDragon = new PlayerDragon();
    this.playerDragon.applyConfig(this.currentConfig, this.manualHue, this.manualSpeed, this.manualFireRate);
    this.gameStage.addChild(this.playerDragon.container);

    // Bind event listeners
    window.addEventListener("keydown", this.handleKeyDown);
    window.addEventListener("keyup", this.handleKeyUp);

    // Start ticker
    this.app.ticker?.add(this.update);

    this.isInitialized = true;
    this.triggerStateChange();
  }

  // Begin actual level gameplay
  public startLevel(levelId: number) {
    this.state.currentLevel = levelId;
    this.state.status = "playing";
    this.state.levelProgress = 0;
    this.state.enemiesDefeated = 0;
    
    // Reset player health based on selected config
    this.state.playerHealth = this.currentConfig.maxHealth;
    this.state.playerMaxHealth = this.currentConfig.maxHealth;
    
    this.playerDragon.x = 100;
    this.playerDragon.y = 225;
    this.playerDragon.updatePosition();

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

    if (this.playerDragon) {
      this.playerDragon.applyConfig(this.currentConfig, hue, speed, fireRate);
    }
    this.triggerStateChange();
  }

  // Change dragon skin on selection
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

    if (this.playerDragon) {
      this.playerDragon.applyConfig(dragon);
    }
    this.triggerStateChange();
  }

  public togglePause() {
    this.state.isPaused = !this.state.isPaused;
    this.triggerStateChange();
  }

  public resetGame() {
    this.state.score = 0;
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
    if (!this.isRunning || this.state.isPaused) return;

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
    }

    // 4. Player dragon update & controls
    this.playerDragon.update(ticker);
    this.particles.emitDragonTrail(this.playerDragon.x, this.playerDragon.y, this.playerDragon.projectileColor);

    let dx = 0;
    let dy = 0;
    if (this.keys["ArrowUp"] || this.keys["KeyW"] || this.keys["w"]) dy = -1;
    if (this.keys["ArrowDown"] || this.keys["KeyS"] || this.keys["s"]) dy = 1;
    if (this.keys["ArrowLeft"] || this.keys["KeyA"] || this.keys["a"]) dx = -1;
    if (this.keys["ArrowRight"] || this.keys["KeyD"] || this.keys["d"]) dx = 1;

    // Normalize diagonal movement speed
    if (dx !== 0 && dy !== 0) {
      dx *= 0.707;
      dy *= 0.707;
    }

    if (dx !== 0 || dy !== 0) {
      this.playerDragon.move(dx, dy, 800, 450);
    }

    // Firing projectiles
    if (this.keys["Space"] || this.keys[" "]) {
      if (now - this.playerDragon.lastFired >= this.playerDragon.fireRate) {
        this.playerDragon.lastFired = now;
        
        // Spawn fireball projectile
        const proj = new Projectile({
          x: this.playerDragon.x + 35,
          y: this.playerDragon.y,
          vx: 8.5,
          vy: 0,
          color: this.playerDragon.projectileColor,
          damage: 10,
          owner: "player",
          type: "fire"
        });
        
        this.playerProjectiles.push(proj);
        this.gameStage.addChild(proj.container);
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
  };

  // --- SPAWNING LOGIC ---
  private handleSpawns(dt: number) {
    const level = this.state.currentLevel;

    if (level === 1) {
      // Level 1 spawning: Nagas and Agile Dragon Monsters
      this.enemySpawnTimer -= dt * 16.67; // approx ms
      if (this.enemySpawnTimer <= 0) {
        this.enemySpawnTimer = 1800 + Math.random() * 1200; // 1.8 to 3 seconds
        
        const type: EnemyType = Math.random() > 0.4 ? "naga" : "dragon_monster";
        const enemy = new Enemy(type, 850, 50 + Math.random() * 320);
        this.enemies.push(enemy);
        this.gameStage.addChild(enemy.container);
      }
    } 
    else if (level === 2) {
      // Level 2 spawning: Worm boss spawner at 80% progress
      if (this.state.levelProgress < 80) {
        // Sandstorms spawn occasional mini-nagas as desert leeches
        this.enemySpawnTimer -= dt * 16.67;
        if (this.enemySpawnTimer <= 0) {
          this.enemySpawnTimer = 2200 + Math.random() * 1000;
          const enemy = new Enemy("naga", 850, 50 + Math.random() * 300);
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
      // Level 3 spawning: Solid woodland obstacles & ground Dwarves throwing thorns
      this.obstacleSpawnTimer -= dt * 16.67;
      if (this.obstacleSpawnTimer <= 0) {
        this.obstacleSpawnTimer = 2200 + Math.random() * 1200; // every 2.2 - 3.4s
        
        const type = Math.random() > 0.5 ? "branch" : "root";
        const scrollSpeed = -3.5;
        const obst = new Obstacle(type, 850, 450, scrollSpeed);
        this.obstacles.push(obst);
        this.gameStage.addChild(obst.container);

        // If it's a root (ground base), 60% chance to spawn a dwarf standing on it!
        if (type === "root") {
          const dwarfX = 850 + obst.width / 2;
          const dwarfY = 450 - obst.height; // placed on top of root
          const dwarf = new Enemy("dwarf", dwarfX, dwarfY - 20);
          // Set dwarf speed to match root scrolling speed so it stays locked on top of the root!
          dwarf.speedX = scrollSpeed; 
          this.enemies.push(dwarf);
          this.gameStage.addChild(dwarf.container);
        }
      }
    }
  }

  // --- ENTITY UPDATER ---
  private updateEntities(ticker: any) {
    const dt = ticker.deltaTime || 1;
    const playerX = this.playerDragon.x;
    const playerY = this.playerDragon.y;

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
      enemy.update(ticker, playerX, playerY, 800, 450);

      // Handle enemy firing behaviors
      if (enemy.tryShoot(Date.now())) {
        if (enemy.type === "dragon_monster") {
          // Spit acid green projectile horizontally
          const proj = new Projectile({
            x: enemy.x - 20,
            y: enemy.y,
            vx: -5.0,
            vy: 0,
            color: 0x22c55e,
            damage: 8,
            owner: "enemy",
            type: "acid"
          });
          this.enemyProjectiles.push(proj);
          this.gameStage.addChild(proj.container);
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
          // Throw woody poison thorns upwards in a parabolic arc towards the player!
          const dx = playerX - enemy.x;
          // Calculate initial vy based on distance to lob it
          const angleFactor = Math.min(1.0, Math.abs(dx) / 500);
          const proj = new Projectile({
            x: enemy.x - 10,
            y: enemy.y - 15,
            vx: -3.5 - Math.random() * 1.5,
            vy: -4.5 - angleFactor * 3, // lob up
            color: 0xeab308,
            damage: 10,
            owner: "enemy",
            type: "thorn"
          });
          this.enemyProjectiles.push(proj);
          this.gameStage.addChild(proj.container);
        }
      }

      // Sync Boss Health to HUD
      if (enemy.type === "giant_worm") {
        this.state.bossHealth = Math.max(0, enemy.health);
      }

      // Remove off-screen minor enemies
      if (enemy.x < -150 && enemy.type !== "giant_worm") {
        enemy.destroy();
        this.enemies.splice(i, 1);
      }
    }

    // Update global particles
    this.particles.update(ticker);
  }

  // --- COLLISION DETECTION SYSTEMS ---
  private checkCollisions() {
    const playerBox = this.playerDragon.getBoundingBox();

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
            // Massive death particle shatter
            this.particles.emitExplosion(enemy.x, enemy.y, 0xef4444, 18);
            this.state.score += (enemy.type === "giant_worm") ? 500 : 100;
            this.state.enemiesDefeated += 1;

            if (enemy.type === "giant_worm") {
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

    // 2. Enemy Projectiles vs Player Dragon
    for (let i = this.enemyProjectiles.length - 1; i >= 0; i--) {
      const proj = this.enemyProjectiles[i];
      const pBox = proj.getBoundingBox();

      if (this.checkAABB(pBox, playerBox)) {
        // Red blood hit splatter on dragon
        this.particles.emitExplosion(proj.x, proj.y, 0xb91c1c, 10);
        this.triggerShake(12, 10); // Heavy shake

        // Apply health reduction
        this.state.playerHealth = Math.max(0, this.state.playerHealth - proj.damage);
        
        proj.destroy();
        this.enemyProjectiles.splice(i, 1);

        this.checkGameOver();
      }
    }

    // 3. Enemies vs Player Dragon (Direct collisions)
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const enemy = this.enemies[i];
      const eBox = enemy.getBoundingBox();

      if (this.checkAABB(eBox, playerBox)) {
        // Huge smash splash
        this.particles.emitExplosion(enemy.x, enemy.y, 0xb91c1c, 15);
        this.triggerShake(16, 12);

        this.state.playerHealth = Math.max(0, this.state.playerHealth - enemy.damage);
        
        // Remove normal enemies on collision
        if (enemy.type !== "giant_worm") {
          enemy.destroy();
          this.enemies.splice(i, 1);
        }

        this.checkGameOver();
      }
    }

    // 4. Solid Obstacles (Level 3 wood trunks) vs Player Dragon
    for (const obst of this.obstacles) {
      const oBox = obst.getBoundingBox();
      if (this.checkAABB(oBox, playerBox)) {
        // Timber/leaf smash feedback
        this.particles.emitExplosion(this.playerDragon.x + 10, this.playerDragon.y, 0x4f7c46, 12);
        this.triggerShake(18, 15);

        // Inflict massive crash damage
        this.state.playerHealth = Math.max(0, this.state.playerHealth - 1.5); // continuous crash drain
        this.checkGameOver();
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
    this.triggerStateChange();
    if (this.state.playerHealth <= 0) {
      this.state.status = "game_over";
      this.isRunning = false;
      this.triggerStateChange();
    }
  }

  // --- PROGRESSION TRACKER ---
  private trackProgression(dt: number) {
    const level = this.state.currentLevel;
    const config = LEVELS[level - 1];

    if (level === 1) {
      // Level 1: Beat 15 enemies
      const pct = (this.state.enemiesDefeated / config.targetProgress) * 100;
      this.state.levelProgress = Math.min(100, Math.floor(pct));

      if (this.state.levelProgress >= 100) {
        this.completeLevel();
      }
    } 
    else if (level === 2) {
      // Level 2: Distance based up to 80%, then boss-defeated required to reach 100%
      if (this.state.levelProgress < 80) {
        this.state.levelProgress += dt * 0.05; // slowly progress
        if (this.state.levelProgress >= 80) {
          this.state.levelProgress = 80;
        }
      } else {
        // Boss fight phase!
        if (this.bossSpawned && !this.bossRef && this.enemies.filter(e => e.type === "giant_worm").length === 0) {
          // Boss is dead! Progress to 100%
          this.state.levelProgress = 100;
          this.completeLevel();
        }
      }
    } 
    else if (level === 3) {
      // Level 3: Distance survival maze
      this.state.levelProgress += dt * 0.055;
      this.state.levelProgress = Math.min(100, this.state.levelProgress);

      if (this.state.levelProgress >= 100) {
        this.completeLevel();
      }
    }

    this.triggerStateChange();
  }

  private completeLevel() {
    this.isRunning = false;
    this.triggerShake(5, 30);
    
    // Complete entire journey if level 3, otherwise transition
    if (this.state.currentLevel === 3) {
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
  public destroy() {
    this.isDestroyed = true;
    this.isRunning = false;
    window.removeEventListener("keydown", this.handleKeyDown);
    window.removeEventListener("keyup", this.handleKeyUp);
    
    if (this.app) {
      if (this.app.ticker) {
        this.app.ticker.remove(this.update);
      }
      this.clearLists();
      
      if (this.bgManager) this.bgManager.destroy();
      if (this.playerDragon) this.playerDragon.destroy();
      if (this.particles) this.particles.destroy();
      
      try {
        this.app.destroy(true, { children: true, texture: true });
      } catch (e) {
        // ignore if already destroyed
      }
    }
    this.isInitialized = false;
  }
}
