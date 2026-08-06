import { Container, Graphics } from "pixi.js";

export class Obstacle {
  public container: Container;
  public graphics: Graphics;
  public x: number;
  public y: number;
  public width: number;
  public height: number;
  public type: "branch" | "root";
  public speedX: number;

  constructor(type: "branch" | "root", startX: number, screenHeight: number, speedX: number) {
    this.container = new Container();
    this.graphics = new Graphics();
    this.type = type;
    this.speedX = speedX;

    // Determine random height to keep things exciting (between 110 and 180)
    const obstHeight = 110 + Math.floor(Math.random() * 70);
    const obstWidth = 45 + Math.floor(Math.random() * 25);
    
    this.width = obstWidth;
    this.height = obstHeight;
    this.x = startX;

    if (this.type === "branch") {
      // Hanger from top
      this.y = 0;
      this.drawBranch();
    } else {
      // Protruder from bottom
      this.y = screenHeight - obstHeight;
      this.drawRoot();
    }

    this.container.addChild(this.graphics);
    this.container.x = this.x;
    this.container.y = this.y;
  }

  // Draw a gnarled tree branch extending from top with leaves
  private drawBranch() {
    const g = this.graphics;
    g.clear();

    const barkColor = 0x543d2b; // Dark wood brown
    const leafColor1 = 0x14532d; // Deep forest green
    const leafColor2 = 0x166534; // Lighter green highlight

    // Draw gnarled main trunk/branch tapering down
    g.moveTo(0, 0)
      .lineTo(this.width, 0)
      .lineTo(this.width * 0.7, this.height * 0.6)
      .lineTo(this.width * 0.3, this.height) // tip
      .lineTo(this.width * 0.1, this.height * 0.6)
      .closePath()
      .fill({ color: barkColor });

    // Draw little knots/grain on wood
    g.moveTo(this.width * 0.5, this.height * 0.2)
      .lineTo(this.width * 0.45, this.height * 0.4)
      .stroke({ color: 0x3b2b1f, width: 2.5 });

    // Hanging twig offshoot
    g.moveTo(this.width * 0.3, this.height * 0.5)
      .lineTo(-10, this.height * 0.7)
      .stroke({ color: barkColor, width: 6 });

    // Draw leafy blobs around the branch tip and offshoot
    g.circle(this.width * 0.25, this.height * 0.9, 22).fill({ color: leafColor1 });
    g.circle(this.width * 0.25, this.height * 0.9, 14).fill({ color: leafColor2 });

    g.circle(-10, this.height * 0.7, 18).fill({ color: leafColor1 });
    g.circle(-10, this.height * 0.7, 10).fill({ color: leafColor2 });

    g.circle(this.width * 0.65, this.height * 0.5, 16).fill({ color: leafColor1 });
  }

  // Draw twisted tree roots climbing from the bottom
  private drawRoot() {
    const g = this.graphics;
    g.clear();

    const barkColor = 0x442c1e; // Gnarled dark wood
    const mossColor = 0x22c55e; // Bright moss overlay

    // Base root flares wide at bottom
    g.moveTo(0, this.height)
      .lineTo(this.width, this.height)
      .lineTo(this.width * 0.75, this.height * 0.4)
      .lineTo(this.width * 0.4, 0) // tip poking up
      .lineTo(this.width * 0.2, this.height * 0.4)
      .closePath()
      .fill({ color: barkColor });

    // Splitting root side-shoot
    g.moveTo(this.width * 0.7, this.height * 0.6)
      .lineTo(this.width + 15, this.height * 0.35)
      .stroke({ color: barkColor, width: 7 });

    // Add some fluorescent moss on top/back edge of root facing light
    g.moveTo(this.width * 0.4, 0)
      .bezierCurveTo(this.width * 0.6, this.height * 0.3, this.width * 0.8, this.height * 0.5, this.width, this.height)
      .stroke({ color: mossColor, width: 3 });

    // Dark shading on left side
    g.moveTo(0, this.height)
      .lineTo(this.width * 0.2, this.height * 0.4)
      .stroke({ color: 0x271911, width: 4 });
  }

  public update(ticker: { deltaTime: number }) {
    const dt = ticker.deltaTime || 1;
    this.x += this.speedX * dt;
    this.container.x = this.x;
  }

  public getBoundingBox() {
    // Return precise collision rectangle
    return {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height
    };
  }

  public destroy() {
    this.graphics.destroy();
    this.container.destroy({ children: true });
  }
}
