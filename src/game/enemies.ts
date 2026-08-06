import { Container, Graphics } from "pixi.js";

export type EnemyType = "naga" | "dragon_monster" | "giant_worm" | "worm_tail" | "dwarf";

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

      case "giant_worm":
        this.width = 120;
        this.height = 100;
        this.health = 250; // Boss health
        this.maxHealth = 250;
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

  // Update position and behavior
  public update(ticker: { deltaTime: number }, playerX: number, playerY: number, screenWidth: number, screenHeight: number) {
    const dt = ticker.deltaTime || 1;
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
        
        // Flap visual wing slightly (scaling)
        const wingFlap = Math.sin(this.animTime * 2);
        // We can access or redraw, or simpler: since it's a static graphics child,
        // we can just scale the whole graphics a tiny bit, but let's keep it clean.
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
        // The segments follow the parent or previous segment position
        for (let i = 0; i < this.segments.length; i++) {
          const seg = this.segments[i];
          // We apply a sine wave tail wiggle
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
        // Dwarves walk along bottom (or stay put on forest platforms)
        // If they fall off, they stay bound to the lower region
        const groundLevel = screenHeight - 45;
        if (this.y < groundLevel - 5) {
          this.y += 2 * dt; // simulated gravity to stick to floor
        } else {
          this.y = groundLevel;
        }
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
      // Large boss box
      return {
        x: this.x - 50,
        y: this.y - 45,
        width: 100,
        height: 90
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
  public type: "fire" | "acid" | "poison" | "thorn";

  constructor(options: {
    x: number;
    y: number;
    vx: number;
    vy: number;
    color: number;
    damage: number;
    owner: "player" | "enemy";
    type?: "fire" | "acid" | "poison" | "thorn";
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
    }
  }

  public update(ticker: { deltaTime: number }) {
    const dt = ticker.deltaTime || 1;
    
    // Apply velocity
    this.x += this.vx * dt;
    this.y += this.vy * dt;

    // Apply gravity to thorns only for parabolic throw!
    if (this.type === "thorn") {
      this.vy += 0.12 * dt; // parabolic gravity pull
      // rotate thorn graphics to face the flight vector!
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
