import { Container, Graphics } from "pixi.js";

export class ParallaxBackground {
  public container: Container;
  private width: number;
  private height: number;

  // Layer containers
  private skyLayer: Graphics;
  private farLayer: Graphics;
  private midLayer: Graphics;
  private nearLayer: Graphics;

  // Scroll positions
  private farX: number = 0;
  private midX: number = 0;
  private nearX: number = 0;

  // Speeds
  private farSpeed: number = 0.2;
  private midSpeed: number = 0.6;
  private nearSpeed: number = 1.2;

  // Current Level ID for switching biomes
  private currentLevelId: number = 1;

  // Level 1: Lightning effects
  private lightningActive: boolean = false;
  private lightningTimer: number = 100;
  private lightningGraphics: Graphics;

  constructor(parent: Container, width: number, height: number) {
    this.width = width;
    this.height = height;

    this.container = new Container();
    parent.addChild(this.container);

    // Instantiate graphics
    this.skyLayer = new Graphics();
    this.farLayer = new Graphics();
    this.midLayer = new Graphics();
    this.nearLayer = new Graphics();
    this.lightningGraphics = new Graphics();

    // Layer ordering
    this.container.addChild(this.skyLayer);
    this.container.addChild(this.farLayer);
    this.container.addChild(this.midLayer);
    this.container.addChild(this.nearLayer);
    this.container.addChild(this.lightningGraphics);

    // Initial draw
    this.setBiome(1);
  }

  // Draw appropriate layers based on level biome
  public setBiome(levelId: number) {
    this.currentLevelId = levelId;
    this.clearAll();

    switch (levelId) {
      case 1: // Stormy Mountains
        this.drawStormySky();
        this.drawRockyPeaks(this.farLayer, 180, 0x1f2937, 0x111827); // Deep grey peaks
        this.drawRockyPeaks(this.midLayer, 260, 0x374151, 0x1f2937);  // Mid grey-blue peaks
        this.drawRockyPeaks(this.nearLayer, 360, 0x4b5563, 0x374151, true); // Foothills with storm fog
        
        // Speeds
        this.farSpeed = 0.25;
        this.midSpeed = 0.7;
        this.nearSpeed = 1.4;
        break;

      case 2: // Bojli Desert
        this.drawDesertSky();
        this.drawDunes(this.farLayer, 220, 0xd97706, 0xb45309); // Dark golden dunes
        this.drawDunes(this.midLayer, 290, 0xf59e0b, 0xd97706);  // Warm golden dunes
        this.drawDunes(this.nearLayer, 380, 0xfbbf24, 0xf59e0b); // Bright sandy dunes with ground line
        
        // Speeds
        this.farSpeed = 0.35;
        this.midSpeed = 0.9;
        this.nearSpeed = 1.8;
        break;

      case 3: // Massive Forest
        this.drawForestSky();
        this.drawForestSilhouettes(this.farLayer, 150, 0x064e3b, 0x022c22, 1);  // Distant thin trees
        this.drawForestSilhouettes(this.midLayer, 230, 0x065f46, 0x064e3b, 2);  // Medium dense trees & mossy overhangs
        this.drawForestSilhouettes(this.nearLayer, 340, 0x047857, 0x065f46, 3); // Closer trees & undergrowth ground line
        
        // Speeds
        this.farSpeed = 0.45;
        this.midSpeed = 1.1;
        this.nearSpeed = 2.2;
        break;
    }
  }

  private clearAll() {
    this.skyLayer.clear();
    this.farLayer.clear();
    this.midLayer.clear();
    this.nearLayer.clear();
    this.lightningGraphics.clear();
    this.farX = 0;
    this.midX = 0;
    this.nearX = 0;
    this.farLayer.x = 0;
    this.midLayer.x = 0;
    this.nearLayer.x = 0;
  }

  // --- LEVEL 1 STORM GRAPHICS ---
  private drawStormySky() {
    // Fill background with stormy violet-navy
    this.skyLayer.rect(0, 0, this.width, this.height).fill({ color: 0x0f111a });
    
    // Add some soft clouds
    this.skyLayer.ellipse(150, 60, 120, 40).fill({ color: 0x181824, alpha: 0.6 });
    this.skyLayer.ellipse(450, 80, 180, 50).fill({ color: 0x181824, alpha: 0.6 });
    this.skyLayer.ellipse(750, 50, 130, 35).fill({ color: 0x181824, alpha: 0.6 });
  }

  private drawRockyPeaks(g: Graphics, baseHeight: number, topColor: number, bottomColor: number, hasSnow: boolean = false) {
    g.clear();
    
    // We draw two identical side-by-side versions from x=0..800 and x=800..1600
    // To make it look rocky, we generate a set of deterministic peaks using fixed equations
    const getPeaksY = (x: number): number => {
      // Periodic combinations to create jagged mountain look
      const wave = Math.sin(x * 0.008) * 60 + Math.cos(x * 0.02) * 20 + Math.sin(x * 0.04) * 8;
      return this.height - baseHeight + wave;
    };

    const drawSide = (offsetX: number) => {
      const step = 20;
      g.moveTo(offsetX, this.height);
      
      for (let x = 0; x <= this.width; x += step) {
        const py = getPeaksY(x);
        g.lineTo(offsetX + x, py);
      }
      
      g.lineTo(offsetX + this.width, this.height);
      g.closePath();
      g.fill({ color: bottomColor });

      // Highlight/shading side (to give 3D rocky volumes)
      for (let x = 0; x < this.width; x += step * 2) {
        const py1 = getPeaksY(x);
        const py2 = getPeaksY(x + step);
        g.moveTo(offsetX + x, py1)
          .lineTo(offsetX + x + step, py2)
          .lineTo(offsetX + x + step * 0.8, this.height)
          .lineTo(offsetX + x, this.height)
          .closePath()
          .fill({ color: topColor, alpha: 0.7 });

        // Add white snow caps if requested
        if (hasSnow && py1 < this.height - baseHeight + 10) {
          g.moveTo(offsetX + x, py1)
            .lineTo(offsetX + x + step * 0.5, py1 - 5)
            .lineTo(offsetX + x + step, py2)
            .lineTo(offsetX + x + step * 0.6, py2 + 15)
            .lineTo(offsetX + x + step * 0.3, py1 + 18)
            .closePath()
            .fill({ color: 0xf3f4f6 }); // Snow color
        }
      }
    };

    drawSide(0);
    drawSide(this.width);
  }

  // --- LEVEL 2 DESERT DUNES ---
  private drawDesertSky() {
    // Warm heat haze sky (orange-red)
    this.skyLayer.rect(0, 0, this.width, this.height).fill({ color: 0x451a03 });
    // Distant hot glowing sun
    this.skyLayer.circle(this.width / 2, this.height / 2 + 50, 100).fill({ color: 0xeab308, alpha: 0.4 });
    this.skyLayer.circle(this.width / 2, this.height / 2 + 50, 70).fill({ color: 0xf97316, alpha: 0.6 });
  }

  private drawDunes(g: Graphics, baseHeight: number, topColor: number, bottomColor: number) {
    g.clear();

    const getDuneY = (x: number): number => {
      // Smooth sine/cos waves for desert dunes
      const wave = Math.sin(x * 0.005) * 45 + Math.cos(x * 0.012) * 15;
      return this.height - baseHeight + wave;
    };

    const drawSide = (offsetX: number) => {
      const step = 15;
      g.moveTo(offsetX, this.height);
      
      for (let x = 0; x <= this.width; x += step) {
        g.lineTo(offsetX + x, getDuneY(x));
      }
      
      g.lineTo(offsetX + this.width, this.height);
      g.closePath();
      g.fill({ color: bottomColor });

      // Dune shading layer
      g.moveTo(offsetX, this.height);
      for (let x = 0; x <= this.width; x += step) {
        g.lineTo(offsetX + x, getDuneY(x));
      }
      // Shadow curve overlay
      for (let x = this.width; x >= 0; x -= step) {
        g.lineTo(offsetX + x, getDuneY(x) + 12);
      }
      g.closePath();
      g.fill({ color: topColor, alpha: 0.8 });
    };

    drawSide(0);
    drawSide(this.width);
  }

  // --- LEVEL 3 DEEP FOREST ---
  private drawForestSky() {
    // Gloomy deep dark forest sky
    this.skyLayer.rect(0, 0, this.width, this.height).fill({ color: 0x021c1e });
    // Ambient soft canopy light shafts
    this.skyLayer.moveTo(100, 0).lineTo(220, 0).lineTo(400, this.height).lineTo(150, this.height).closePath().fill({ color: 0x0f766e, alpha: 0.15 });
    this.skyLayer.moveTo(450, 0).lineTo(540, 0).lineTo(680, this.height).lineTo(520, this.height).closePath().fill({ color: 0x0f766e, alpha: 0.12 });
  }

  private drawForestSilhouettes(g: Graphics, baseHeight: number, trunkColor: number, leafColor: number, layer: number) {
    g.clear();

    const drawSide = (offsetX: number) => {
      // First, draw a flat ground base line
      g.rect(offsetX, this.height - 20, this.width, 20).fill({ color: leafColor });

      // Draw several distinct trees per screen length
      const treeSpacing = this.width / (3 * layer);
      
      for (let i = 0; i <= 3 * layer; i++) {
        const treeX = offsetX + i * treeSpacing + (Math.sin(i) * 20);
        const treeWidth = 14 / layer + 6;
        const treeHeight = baseHeight + (Math.cos(i) * 35);

        // Draw trunk climbing from ground
        g.rect(treeX - treeWidth / 2, this.height - treeHeight, treeWidth, treeHeight).fill({ color: trunkColor });

        // Gnarled branches
        g.moveTo(treeX, this.height - treeHeight + 30)
          .lineTo(treeX - 25, this.height - treeHeight + 5)
          .stroke({ color: trunkColor, width: treeWidth * 0.5 });
        g.moveTo(treeX, this.height - treeHeight + 50)
          .lineTo(treeX + 30, this.height - treeHeight + 35)
          .stroke({ color: trunkColor, width: treeWidth * 0.4 });

        // Draw leafy cluster blobs on top of tree
        g.circle(treeX, this.height - treeHeight, 28 / layer + 10).fill({ color: leafColor });
        g.circle(treeX - 18, this.height - treeHeight + 10, 20 / layer + 6).fill({ color: leafColor });
        g.circle(treeX + 18, this.height - treeHeight + 15, 18 / layer + 6).fill({ color: leafColor });

        // Hanging vines (Level 3 exclusive feel)
        if (layer === 2) {
          g.moveTo(treeX - 15, this.height - treeHeight + 25)
            .bezierCurveTo(treeX - 22, this.height - treeHeight + 55, treeX - 12, this.height - treeHeight + 85, treeX - 18, this.height - treeHeight + 115)
            .stroke({ color: 0x064e3b, width: 2 });
        }
      }
    };

    drawSide(0);
    drawSide(this.width);
  }

  // Update scrolling
  public update(ticker: { deltaTime: number }, gameSpeedModifier: number = 1.0) {
    const dt = ticker.deltaTime || 1;

    // Scroll calculations
    this.farX -= this.farSpeed * gameSpeedModifier * dt;
    this.midX -= this.midSpeed * gameSpeedModifier * dt;
    this.nearX -= this.nearSpeed * gameSpeedModifier * dt;

    // Reset offsets when they loop past a full screen width (800)
    if (this.farX <= -this.width) this.farX = 0;
    if (this.midX <= -this.width) this.midX = 0;
    if (this.nearX <= -this.width) this.nearX = 0;

    // Position the containers
    this.farLayer.x = this.farX;
    this.midLayer.x = this.midX;
    this.nearLayer.x = this.nearX;

    // --- STORM LIGHTNING UPDATE (LEVEL 1) ---
    if (this.currentLevelId === 1) {
      this.lightningTimer -= dt;
      
      if (this.lightningTimer <= 0) {
        // Trigger a flash!
        this.lightningActive = true;
        this.lightningTimer = 180 + Math.random() * 240; // 3 to 7 seconds
        
        // Draw lightning flash overlay
        this.lightningGraphics.clear();
        this.lightningGraphics.rect(0, 0, this.width, this.height).fill({ color: 0xffffff, alpha: 0.8 });
        
        // Draw raw lightning bolt graphic down the sky
        const boltX = 150 + Math.random() * (this.width - 300);
        this.lightningGraphics
          .moveTo(boltX, 0)
          .lineTo(boltX - 40, 100)
          .lineTo(boltX + 20, 180)
          .lineTo(boltX - 30, 280)
          .lineTo(boltX + 10, 360)
          .stroke({ color: 0x93c5fd, width: 6 })
          .stroke({ color: 0xffffff, width: 2 });
          
        // Deactivate flash quickly after 100ms
        setTimeout(() => {
          this.lightningActive = false;
          this.lightningGraphics.clear();
        }, 120);
      }
    }
  }

  public destroy() {
    this.skyLayer.destroy();
    this.farLayer.destroy();
    this.midLayer.destroy();
    this.nearLayer.destroy();
    this.lightningGraphics.destroy();
    this.container.destroy({ children: true });
  }
}
