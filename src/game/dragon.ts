import { Container, Graphics, ColorMatrixFilter } from "pixi.js";
import { DragonConfig } from "../types";

export class PlayerDragon {
  public container: Container;
  
  // Visual sub-elements
  private body: Graphics;
  private head: Graphics;
  private frontWing: Graphics;
  private backWing: Graphics;
  private tail: Graphics;
  
  // Custom Color Filter for Hue shifts
  private colorFilter: ColorMatrixFilter;

  // Position and Physics
  public x: number = 100;
  public y: number = 225;
  public width: number = 85;
  public height: number = 60;
  
  // Dynamic parameters (can be adjusted via config/editor)
  public speed: number = 6;
  public fireRate: number = 300; // ms between shots
  public lastFired: number = 0;
  public lastSpecialFired: number = 0;
  public specialCooldown: number = 2500; // 2.5s special attack cooldown
  public attackMode: "single" | "spread" | "plasma" = "single";
  public projectileColor: number = 0xff5500;

  // Animation time
  private animTime: number = 0;

  constructor() {
    this.container = new Container();
    
    // Create and apply ColorMatrixFilter for hue shifts safely
    try {
      this.colorFilter = new ColorMatrixFilter();
      this.container.filters = [this.colorFilter];
    } catch (e) {
      console.warn("ColorMatrixFilter initialization skipped:", e);
    }

    // Build the procedural dragon parts
    this.backWing = new Graphics();
    this.tail = new Graphics();
    this.body = new Graphics();
    this.head = new Graphics();
    this.frontWing = new Graphics();

    // The drawing commands will draw a RED dragon facing RIGHT, centered near (0, 0)
    // Red color is default, then ColorMatrixFilter hue rotates it beautifully!
    this.drawParts();

    // Layer them correctly
    this.container.addChild(this.backWing);
    this.container.addChild(this.tail);
    this.container.addChild(this.body);
    this.container.addChild(this.head);
    this.container.addChild(this.frontWing);

    // Initial position
    this.updatePosition();
  }

  private drawParts() {
    // 1. Back Wing (slightly darker red for depth)
    const backWingColor = 0xb91c1c; 
    this.backWing.clear();
    this.backWing
      .moveTo(0, 0)
      .lineTo(-10, -45)
      .lineTo(-40, -40)
      .lineTo(-30, -10)
      .lineTo(-15, -5)
      .closePath()
      .fill({ color: backWingColor });
    // Wing ribs
    this.backWing
      .moveTo(0, 0).lineTo(-40, -40).stroke({ color: 0x7f1d1d, width: 2 })
      .moveTo(0, 0).lineTo(-30, -10).stroke({ color: 0x7f1d1d, width: 2 });
    
    // Pivot for wing flapping
    this.backWing.pivot.set(0, 0);

    // 2. Tail (pointing left, tapering)
    const bodyColor = 0xef4444;
    const accentColor = 0xb91c1c;
    this.tail.clear();
    // Spine
    this.tail
      .moveTo(-25, 5)
      .bezierCurveTo(-50, 8, -65, -10, -80, -2) // curvy tail
      .stroke({ color: bodyColor, width: 8 });
    // Tail spade/spikes
    this.tail
      .moveTo(-80, -2)
      .lineTo(-90, -12)
      .lineTo(-87, 3)
      .lineTo(-92, 10)
      .closePath()
      .fill({ color: accentColor });

    // 3. Body (sturdy capsule)
    this.body.clear();
    this.body
      .ellipse(0, 5, 28, 16)
      .fill({ color: bodyColor });
    // Underbelly scale lines (light orange-yellow overlay)
    this.body
      .arc(0, 5, 14, Math.PI * 0.3, Math.PI * 0.7)
      .stroke({ color: 0xf97316, width: 2 });
    
    // 4. Head & Neck
    this.head.clear();
    // Neck
    this.head
      .moveTo(15, -2)
      .lineTo(30, -15)
      .lineTo(20, 5)
      .closePath()
      .fill({ color: bodyColor });
    // Head shape facing right
    this.head
      .moveTo(22, -18)
      .lineTo(42, -18)
      .lineTo(45, -8)
      .lineTo(35, 5)
      .lineTo(20, -5)
      .closePath()
      .fill({ color: bodyColor });
    // Snout and mouth line
    this.head
      .moveTo(45, -12)
      .lineTo(38, -10)
      .stroke({ color: accentColor, width: 1.5 });
    // Horns (pointing back-upwards)
    this.head
      .moveTo(25, -18)
      .lineTo(12, -28)
      .lineTo(20, -16)
      .closePath()
      .fill({ color: accentColor });
    this.head
      .moveTo(21, -18)
      .lineTo(8, -25)
      .lineTo(17, -15)
      .closePath()
      .fill({ color: 0x991b1b }); // background horn
    // Glowing eye (default green or matched to projectile)
    this.head
      .circle(34, -13, 2.5)
      .fill({ color: 0xfff000 });

    // 5. Front Wing (bright red, detailed)
    this.frontWing.clear();
    this.frontWing
      .moveTo(0, 0)
      .lineTo(-12, -50)
      .lineTo(-45, -45)
      .lineTo(-35, -12)
      .lineTo(-18, -6)
      .closePath()
      .fill({ color: bodyColor });
    // Wing ribs
    this.frontWing
      .moveTo(0, 0).lineTo(-45, -45).stroke({ color: accentColor, width: 2.5 })
      .moveTo(0, 0).lineTo(-35, -12).stroke({ color: accentColor, width: 2.5 });
    
    this.frontWing.pivot.set(0, 0);
  }

  // Set stats dynamically
  public applyConfig(config: DragonConfig, manualHue?: number, manualSpeed?: number, manualFireRate?: number) {
    const finalHue = manualHue !== undefined ? manualHue : config.baseHue;
    this.setHue(finalHue);
    this.speed = manualSpeed !== undefined ? manualSpeed : config.speed;
    this.fireRate = manualFireRate !== undefined ? manualFireRate : config.fireRate;
    this.projectileColor = config.projectileColor;
  }

  // Shift the color filter hue
  public setHue(angle: number) {
    // Standard PixiJS hue-shifting filter
    this.colorFilter.reset();
    this.colorFilter.hue(angle, false);
  }

  public updatePosition() {
    this.container.x = this.x;
    this.container.y = this.y;
  }

  // Handle movement
  public move(dx: number, dy: number, screenWidth: number, screenHeight: number) {
    this.x += dx * this.speed;
    this.y += dy * this.speed;

    // Boundary constraints (leaving padding for the wings/tail)
    const padX = 40;
    const padY = 35;
    if (this.x < padX) this.x = padX;
    if (this.x > screenWidth - padX) this.x = screenWidth - padX;
    if (this.y < padY) this.y = padY;
    if (this.y > screenHeight - padY) this.y = screenHeight - padY;

    this.updatePosition();
  }

  // Flap wings and animate parts in the update loop
  public update(ticker: { deltaTime: number }) {
    const dt = ticker.deltaTime || 1;
    this.animTime += 0.12 * dt;

    // 1. Wings flapping
    const frontFlap = Math.sin(this.animTime);
    this.frontWing.scale.y = 0.5 + frontFlap * 0.5;
    this.frontWing.rotation = frontFlap * 0.15;

    const backFlap = Math.sin(this.animTime - 0.6); // out of phase
    this.backWing.scale.y = 0.45 + backFlap * 0.45;
    this.backWing.rotation = backFlap * 0.15;

    // 2. Tail wiggling
    this.tail.rotation = Math.sin(this.animTime * 0.5) * 0.1;

    // 3. Body hovering up and down slightly (idle hover)
    this.container.pivot.y = Math.sin(this.animTime * 0.3) * 2;
  }

  public getBoundingBox() {
    // Return custom collision box around body & head (ignoring wings)
    return {
      x: this.x - 30,
      y: this.y - 15,
      width: 70,
      height: 30
    };
  }

  public destroy() {
    this.container.destroy({ children: true });
  }
}
