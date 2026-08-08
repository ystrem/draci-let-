import { Container, Graphics } from "pixi.js";

interface Particle {
  graphics: Graphics;
  x: number;
  y: number;
  vx: number;
  vy: number;
  alpha: number;
  scale: number;
  color: number;
  life: number; // 0 to 1
  decay: number; // speed of life decrease
  size: number;
  spin?: number;
  rotation?: number;
  gravity?: number;
}

export class ParticleSystem {
  private container: Container;
  private particles: Particle[] = [];
  private pool: Graphics[] = [];

  constructor(parentContainer: Container) {
    this.container = new Container();
    parentContainer.addChild(this.container);
  }

  // Get a graphics object from the pool or create a new one
  private getGraphics(): Graphics {
    if (this.pool.length > 0) {
      const g = this.pool.pop()!;
      g.visible = true;
      g.alpha = 1;
      g.scale.set(1);
      g.rotation = 0;
      return g;
    }
    return new Graphics();
  }

  private releaseGraphics(g: Graphics) {
    g.visible = false;
    this.container.removeChild(g);
    this.pool.push(g);
  }

  // Emit a single particle
  public emit(options: {
    x: number;
    y: number;
    vx: number;
    vy: number;
    color: number;
    size: number;
    decay: number;
    gravity?: number;
    spin?: number;
    shape?: "circle" | "rect" | "star";
  }) {
    const g = this.getGraphics();
    g.clear();

    const shape = options.shape || "circle";
    const size = options.size;

    if (shape === "circle") {
      g.circle(0, 0, size).fill({ color: options.color });
    } else if (shape === "rect") {
      g.rect(-size / 2, -size / 2, size, size).fill({ color: options.color });
    } else if (shape === "star") {
      // Draw a 4-point star for embers
      g.moveTo(0, -size)
        .lineTo(size * 0.3, -size * 0.3)
        .lineTo(size, 0)
        .lineTo(size * 0.3, size * 0.3)
        .lineTo(0, size)
        .lineTo(-size * 0.3, size * 0.3)
        .lineTo(-size, 0)
        .lineTo(-size * 0.3, -size * 0.3)
        .closePath()
        .fill({ color: options.color });
    }

    g.x = options.x;
    g.y = options.y;

    this.container.addChild(g);

    this.particles.push({
      graphics: g,
      x: options.x,
      y: options.y,
      vx: options.vx,
      vy: options.vy,
      alpha: 1,
      scale: 1,
      color: options.color,
      life: 1,
      decay: options.decay,
      size: size,
      gravity: options.gravity || 0,
      spin: options.spin || 0,
      rotation: 0,
    });
  }

  // Helper for dragon trail
  public emitDragonTrail(x: number, y: number, color: number) {
    // 1-2 particles per frame
    const count = Math.random() > 0.5 ? 2 : 1;
    for (let i = 0; i < count; i++) {
      this.emit({
        x: x - 20 + (Math.random() - 0.5) * 10,
        y: y + (Math.random() - 0.5) * 15,
        vx: -2 - Math.random() * 3, // Fly backwards
        vy: (Math.random() - 0.5) * 1.5,
        color: color,
        size: 3 + Math.random() * 5,
        decay: 0.02 + Math.random() * 0.03,
        shape: Math.random() > 0.4 ? "circle" : "star",
        gravity: -0.01, // Float slightly upwards
      });
    }
  }

  // Helper for explosions
  public emitExplosion(x: number, y: number, color: number, count = 15) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1 + Math.random() * 5;
      this.emit({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: color,
        size: 3 + Math.random() * 6,
        decay: 0.02 + Math.random() * 0.02,
        gravity: 0.05, // fall slightly
        spin: (Math.random() - 0.5) * 0.2,
        shape: Math.random() > 0.5 ? "rect" : "circle",
      });
    }
  }

  // Level 1: Storm rain dust/wind embers
  public emitStormEmbers(width: number, height: number) {
    if (Math.random() > 0.15) return;
    this.emit({
      x: width + 50,
      y: Math.random() * height,
      vx: -8 - Math.random() * 6,
      vy: 1 + Math.random() * 3, // Rain direction
      color: 0x557799,
      size: 1 + Math.random() * 2,
      decay: 0.01 + Math.random() * 0.01,
      shape: "rect",
    });
  }

  // Level 2: Sandstorm particles
  public emitSandstorm(width: number, height: number) {
    if (Math.random() > 0.05) return;
    const count = 2 + Math.floor(Math.random() * 3);
    for (let i = 0; i < count; i++) {
      this.emit({
        x: width + 50,
        y: Math.random() * height,
        vx: -6 - Math.random() * 6,
        vy: (Math.random() - 0.5) * 2,
        color: Math.random() > 0.5 ? 0xcca666 : 0xddb688, // Sandy shades
        size: 2 + Math.random() * 4,
        decay: 0.01 + Math.random() * 0.01,
        shape: "circle",
      });
    }
  }

  // Level 3: Mossy pollen/leaves floating
  public emitLeaves(width: number, height: number) {
    if (Math.random() > 0.1) return;
    this.emit({
      x: width + 50,
      y: Math.random() * height,
      vx: -2 - Math.random() * 2,
      vy: Math.sin(Math.random() * Math.PI) * 1,
      color: Math.random() > 0.5 ? 0x4f7c46 : 0x82a759, // Greenish leaf colors
      size: 3 + Math.random() * 4,
      decay: 0.005 + Math.random() * 0.01,
      spin: 0.02 + Math.random() * 0.05,
      shape: "rect",
    });
  }

  // Level 4: Underwater bubbles rising
  public emitBubbles(width: number, height: number) {
    if (Math.random() > 0.08) return;
    this.emit({
      x: Math.random() * width,
      y: height + 20,
      vx: -1.5 - Math.random() * 1.5,
      vy: -1.2 - Math.random() * 1.5, // Float upwards
      color: Math.random() > 0.5 ? 0x38bdf8 : 0x67e8f9,
      size: 2 + Math.random() * 3,
      decay: 0.008 + Math.random() * 0.008,
      shape: "circle",
    });
  }

  // Update particles
  public update(ticker: any) {
    const dt = (ticker && typeof ticker === 'object' && 'deltaTime' in ticker && typeof ticker.deltaTime === 'number') ? ticker.deltaTime : (typeof ticker === 'number' ? ticker : 1);
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= p.decay * dt;

      if (p.life <= 0) {
        this.releaseGraphics(p.graphics);
        this.particles.splice(i, 1);
        continue;
      }

      // Physics
      if (p.gravity) {
        p.vy += p.gravity * dt;
      }
      p.x += p.vx * dt;
      p.y += p.vy * dt;

      // Spin
      if (p.spin && p.rotation !== undefined) {
        p.rotation += p.spin * dt;
        p.graphics.rotation = p.rotation;
      }

      p.graphics.x = p.x;
      p.graphics.y = p.y;
      p.graphics.alpha = p.life;
      
      // Gradually shrink
      p.graphics.scale.set(p.life);
    }
  }

  // Clear all particles
  public clear() {
    for (const p of this.particles) {
      this.releaseGraphics(p.graphics);
    }
    this.particles = [];
  }

  public destroy() {
    this.clear();
    for (const g of this.pool) {
      g.destroy();
    }
    this.pool = [];
    this.container.destroy({ children: true });
  }
}
