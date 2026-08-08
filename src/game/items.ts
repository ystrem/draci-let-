import { Container, Graphics } from "pixi.js";

export type ItemType = "gem" | "coin" | "health_crystal" | "star_powerup";

export interface CollectibleItemOptions {
  x: number;
  y: number;
  type?: ItemType;
  value?: number;
}

export class CollectibleItem {
  public container: Container;
  public graphic: Graphics;
  public x: number;
  public y: number;
  public vx: number;
  public vy: number;
  public type: ItemType;
  public value: number;
  public radius: number = 14;
  public isCollected: boolean = false;
  private animTime: number = Math.random() * 10;

  constructor(options: CollectibleItemOptions) {
    this.x = options.x;
    this.y = options.y;
    this.type = options.type || "gem";
    this.value = options.value || (this.type === "health_crystal" ? 40 : 150);

    // Initial drift physics
    this.vx = -1.8 - Math.random() * 0.8;
    this.vy = (Math.random() - 0.5) * 1.2;

    this.container = new Container();
    this.graphic = new Graphics();
    this.container.addChild(this.graphic);

    this.render();
    this.container.x = this.x;
    this.container.y = this.y;
  }

  private render() {
    this.graphic.clear();

    if (this.type === "health_crystal") {
      // Heart/Health Crystal
      this.graphic
        .circle(0, 0, 12)
        .fill({ color: 0xef4444, alpha: 0.9 })
        .stroke({ color: 0xffffff, width: 2 })
        .circle(0, 0, 6)
        .fill({ color: 0xfca5a5, alpha: 0.8 });
    } else if (this.type === "star_powerup") {
      // Golden Star
      this.graphic
        .star(0, 0, 5, 14, 7)
        .fill({ color: 0xfacc15, alpha: 0.95 })
        .stroke({ color: 0xffffff, width: 2 });
    } else if (this.type === "coin") {
      // Shiny Gold Coin
      this.graphic
        .circle(0, 0, 10)
        .fill({ color: 0xf59e0b, alpha: 0.95 })
        .stroke({ color: 0xfef08a, width: 2 })
        .circle(0, 0, 5)
        .fill({ color: 0xfef08a, alpha: 0.8 });
    } else {
      // Glowing Gem / Diamond
      this.graphic
        .poly([
          { x: 0, y: -12 },
          { x: 10, y: -4 },
          { x: 0, y: 12 },
          { x: -10, y: -4 }
        ])
        .fill({ color: 0x38bdf8, alpha: 0.95 })
        .stroke({ color: 0xffffff, width: 2 });
    }
  }

  public update(dt: number = 1) {
    this.animTime += 0.08 * dt;
    this.x += this.vx * dt;
    this.y += (this.vy + Math.sin(this.animTime) * 0.4) * dt;

    this.container.x = this.x;
    this.container.y = this.y;

    // Bobbing scaling / rotation animation
    this.container.rotation = Math.sin(this.animTime * 0.5) * 0.2;
    const scale = 1 + Math.sin(this.animTime * 1.5) * 0.08;
    this.container.scale.set(scale);
  }

  public getBoundingBox() {
    return {
      x: this.x - this.radius,
      y: this.y - this.radius,
      width: this.radius * 2,
      height: this.radius * 2
    };
  }

  public destroy() {
    this.container.destroy({ children: true });
  }
}
