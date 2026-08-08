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

      case 4: // Ocean Depths
        this.drawOceanSky();
        this.drawOceanReefSilhouettes(this.farLayer, 180, 0x1e1b4b, 0x0f172a, 1);  // Deep abyssal trench spires
        this.drawOceanReefSilhouettes(this.midLayer, 260, 0x0369a1, 0x075985, 2);  // Coral reefs & kelp forests
        this.drawOceanReefSilhouettes(this.nearLayer, 360, 0x0284c7, 0x0369a1, 3); // Closer seabed & glowing anemones
        
        // Speeds
        this.farSpeed = 0.3;
        this.midSpeed = 0.8;
        this.nearSpeed = 1.6;
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
    // Fill background with rich stormy twilight indigo
    this.skyLayer.rect(0, 0, this.width, this.height).fill({ color: 0x1e1b4b });
    // Horizon glow
    this.skyLayer.rect(0, 180, this.width, this.height - 180).fill({ color: 0x1e293b, alpha: 0.8 });
    this.skyLayer.ellipse(400, 280, 500, 150).fill({ color: 0x3b82f6, alpha: 0.15 });

    // Radiant moon on the mountain horizon
    this.skyLayer.circle(650, 90, 42).fill({ color: 0xffffff, alpha: 0.98 });
    this.skyLayer.circle(650, 90, 60).fill({ color: 0x60a5fa, alpha: 0.35 });
    this.skyLayer.circle(650, 90, 85).fill({ color: 0x3b82f6, alpha: 0.15 });

    // Layered stormy clouds with atmospheric glow
    this.skyLayer.ellipse(150, 50, 190, 60).fill({ color: 0x334155, alpha: 0.85 });
    this.skyLayer.ellipse(420, 75, 250, 70).fill({ color: 0x475569, alpha: 0.75 });
    this.skyLayer.ellipse(720, 45, 180, 55).fill({ color: 0x312e81, alpha: 0.9 });
  }

  private drawRockyPeaks(g: Graphics, baseHeight: number, topColor: number, bottomColor: number, hasSnow: boolean = false) {
    g.clear();
    
    const getPeaksY = (x: number): number => {
      const wave = Math.sin(x * 0.007) * 75 + Math.cos(x * 0.018) * 28 + Math.sin(x * 0.035) * 12;
      return this.height - baseHeight + wave;
    };

    const drawSide = (offsetX: number) => {
      const step = 16;
      g.moveTo(offsetX, this.height);
      
      for (let x = 0; x <= this.width; x += step) {
        g.lineTo(offsetX + x, getPeaksY(x));
      }
      
      g.lineTo(offsetX + this.width, this.height);
      g.closePath();
      g.fill({ color: bottomColor });

      // Highlight/shading side for 3D mountain ridges
      for (let x = 0; x < this.width; x += step * 2) {
        const py1 = getPeaksY(x);
        const py2 = getPeaksY(x + step);
        g.moveTo(offsetX + x, py1)
          .lineTo(offsetX + x + step, py2)
          .lineTo(offsetX + x + step * 0.8, this.height)
          .lineTo(offsetX + x, this.height)
          .closePath()
          .fill({ color: topColor, alpha: 0.85 });

        // Add brilliant snow caps with blue reflection on high peaks
        if (hasSnow && py1 < this.height - baseHeight + 15) {
          g.moveTo(offsetX + x, py1)
            .lineTo(offsetX + x + step * 0.5, py1 - 6)
            .lineTo(offsetX + x + step, py2)
            .lineTo(offsetX + x + step * 0.6, py2 + 18)
            .lineTo(offsetX + x + step * 0.3, py1 + 22)
            .closePath()
            .fill({ color: 0xf8fafc });
          // Snow shadow
          g.moveTo(offsetX + x + step * 0.3, py1 + 22)
            .lineTo(offsetX + x + step * 0.6, py2 + 18)
            .lineTo(offsetX + x + step * 0.5, py2 + 25)
            .closePath()
            .fill({ color: 0xc7d2fe, alpha: 0.7 });
        }
      }
    };

    drawSide(0);
    drawSide(this.width);
  }

  // --- LEVEL 2 DESERT DUNES ---
  private drawDesertSky() {
    // Rich golden-red sunset heat haze sky
    this.skyLayer.rect(0, 0, this.width, this.height).fill({ color: 0x451a03 });
    this.skyLayer.rect(0, 200, this.width, this.height - 200).fill({ color: 0x78350f, alpha: 0.5 });
    
    // Radiant glowing setting sun with sunburst rays
    const sunX = 400;
    const sunY = 260;
    this.skyLayer.circle(sunX, sunY, 160).fill({ color: 0xef4444, alpha: 0.3 });
    this.skyLayer.circle(sunX, sunY, 110).fill({ color: 0xf97316, alpha: 0.55 });
    this.skyLayer.circle(sunX, sunY, 70).fill({ color: 0xfde047, alpha: 0.95 });

    // Distant Ancient Desert Pyramid Silhouettes on horizon
    this.skyLayer.moveTo(120, sunY + 20).lineTo(200, sunY - 50).lineTo(280, sunY + 20).closePath().fill({ color: 0x78350f, alpha: 0.7 });
    this.skyLayer.moveTo(520, sunY + 20).lineTo(620, sunY - 70).lineTo(720, sunY + 20).closePath().fill({ color: 0x78350f, alpha: 0.8 });
  }

  private drawDunes(g: Graphics, baseHeight: number, topColor: number, bottomColor: number) {
    g.clear();

    const getDuneY = (x: number): number => {
      const wave = Math.sin(x * 0.006) * 55 + Math.cos(x * 0.014) * 20;
      return this.height - baseHeight + wave;
    };

    const drawSide = (offsetX: number) => {
      const step = 12;
      g.moveTo(offsetX, this.height);
      
      for (let x = 0; x <= this.width; x += step) {
        g.lineTo(offsetX + x, getDuneY(x));
      }
      
      g.lineTo(offsetX + this.width, this.height);
      g.closePath();
      g.fill({ color: bottomColor });

      // Golden dune ridge highlights & wind crests
      g.moveTo(offsetX, this.height);
      for (let x = 0; x <= this.width; x += step) {
        g.lineTo(offsetX + x, getDuneY(x));
      }
      for (let x = this.width; x >= 0; x -= step) {
        g.lineTo(offsetX + x, getDuneY(x) + 16);
      }
      g.closePath();
      g.fill({ color: topColor, alpha: 0.9 });
    };

    drawSide(0);
    drawSide(this.width);
  }

  // --- LEVEL 3 DEEP ENCHANTED FOREST ---
  private drawForestSky() {
    // Enchanted dark emerald canopy sky
    this.skyLayer.rect(0, 0, this.width, this.height).fill({ color: 0x064e3b });
    this.skyLayer.rect(0, 180, this.width, this.height - 180).fill({ color: 0x022c22, alpha: 0.6 });
    
    // Moonlight rays breaking through thick forest canopy
    this.skyLayer.moveTo(80, 0).lineTo(220, 0).lineTo(380, this.height).lineTo(180, this.height).closePath().fill({ color: 0x34d399, alpha: 0.18 });
    this.skyLayer.moveTo(420, 0).lineTo(560, 0).lineTo(720, this.height).lineTo(540, this.height).closePath().fill({ color: 0x34d399, alpha: 0.22 });

    // Ambient floating magic forest spores / glowing fireflies
    for (let i = 0; i < 25; i++) {
      const fx = (i * 42 + 15) % this.width;
      const fy = (i * 23 + 30) % (this.height - 80);
      this.skyLayer.circle(fx, fy, (i % 3) + 2).fill({ color: 0xa7f3d0, alpha: 0.85 });
    }
  }

  private drawForestSilhouettes(g: Graphics, baseHeight: number, trunkColor: number, leafColor: number, layer: number) {
    g.clear();

    const drawSide = (offsetX: number) => {
      // Floor undergrowth
      g.rect(offsetX, this.height - 25, this.width, 25).fill({ color: leafColor });

      const treeCount = 4 * layer;
      const treeSpacing = this.width / treeCount;
      
      for (let i = 0; i <= treeCount; i++) {
        const treeX = offsetX + i * treeSpacing + (Math.sin(i * 1.5) * 15);
        const treeWidth = 18 / layer + 8;
        const treeHeight = baseHeight + (Math.cos(i * 2) * 45);

        // Trunk
        g.rect(treeX - treeWidth / 2, this.height - treeHeight, treeWidth, treeHeight).fill({ color: trunkColor });

        // Branch arches
        g.moveTo(treeX, this.height - treeHeight + 35)
          .lineTo(treeX - 30, this.height - treeHeight + 10)
          .stroke({ color: trunkColor, width: treeWidth * 0.5 });
        g.moveTo(treeX, this.height - treeHeight + 55)
          .lineTo(treeX + 35, this.height - treeHeight + 30)
          .stroke({ color: trunkColor, width: treeWidth * 0.45 });

        // Massive foliage domes on tree crown
        g.circle(treeX, this.height - treeHeight - 5, 34 / layer + 14).fill({ color: leafColor });
        g.circle(treeX - 22, this.height - treeHeight + 10, 24 / layer + 8).fill({ color: leafColor });
        g.circle(treeX + 22, this.height - treeHeight + 12, 22 / layer + 8).fill({ color: leafColor });

        // Mossy hanging vines
        if (layer >= 2) {
          g.moveTo(treeX - 18, this.height - treeHeight + 20)
            .bezierCurveTo(treeX - 25, this.height - treeHeight + 60, treeX - 10, this.height - treeHeight + 90, treeX - 20, this.height - treeHeight + 130)
            .stroke({ color: 0x047857, width: 2.5 });
        }
      }
    };

    drawSide(0);
    drawSide(this.width);
  }

  // --- LEVEL 4 OCEAN DEPTHS ---
  private drawOceanSky() {
    // Rich vibrant deep ocean water background
    this.skyLayer.rect(0, 0, this.width, this.height).fill({ color: 0x075985 });
    
    // Sunlight filtering down through surface water layer
    this.skyLayer.rect(0, 0, this.width, 160).fill({ color: 0x0284c7, alpha: 0.6 });
    this.skyLayer.rect(0, 0, this.width, 60).fill({ color: 0x38bdf8, alpha: 0.4 });

    // Water surface caustic light beams piercing from above
    this.skyLayer.moveTo(80, 0).lineTo(180, 0).lineTo(340, this.height).lineTo(160, this.height).closePath().fill({ color: 0x7dd3fc, alpha: 0.28 });
    this.skyLayer.moveTo(360, 0).lineTo(480, 0).lineTo(640, this.height).lineTo(420, this.height).closePath().fill({ color: 0x38bdf8, alpha: 0.32 });
    this.skyLayer.moveTo(660, 0).lineTo(760, 0).lineTo(820, this.height).lineTo(680, this.height).closePath().fill({ color: 0x7dd3fc, alpha: 0.25 });

    // Surface water wave ripples
    for (let x = 0; x < this.width; x += 40) {
      this.skyLayer.moveTo(x, 10).bezierCurveTo(x + 10, 4, x + 30, 16, x + 40, 10).stroke({ color: 0xbae6fd, width: 2, alpha: 0.6 });
    }

    // Floating bioluminescent water bubbles with highlight centers
    for (let i = 0; i < 35; i++) {
      const bx = (i * 37 + 20) % this.width;
      const by = (i * 29 + 15) % this.height;
      const r = (i % 4) + 2.5;
      this.skyLayer.circle(bx, by, r).fill({ color: 0x38bdf8, alpha: 0.6 });
      this.skyLayer.circle(bx - 0.8, by - 0.8, r * 0.45).fill({ color: 0xffffff, alpha: 0.9 });
    }

    // Distant background fish silhouettes
    for (let f = 0; f < 5; f++) {
      const fx = (f * 160 + 50) % this.width;
      const fy = 80 + f * 45;
      this.skyLayer.ellipse(fx, fy, 12, 5).fill({ color: 0x0284c7, alpha: 0.7 });
      this.skyLayer.poly([fx + 12, fy, fx + 18, fy - 4, fx + 18, fy + 4]).fill({ color: 0x0284c7, alpha: 0.7 });
    }
  }

  private drawOceanReefSilhouettes(g: Graphics, baseHeight: number, deepColor: number, reefColor: number, layer: number) {
    g.clear();

    const coralBulbColors = [0xec4899, 0xf59e0b, 0xa855f7, 0x10b981, 0x38bdf8];

    const drawSide = (offsetX: number) => {
      // Seabed sandy floor
      g.rect(offsetX, this.height - 35, this.width, 35).fill({ color: deepColor });

      const count = 5 * layer;
      const spacing = this.width / count;
      
      for (let i = 0; i <= count; i++) {
        const rx = offsetX + i * spacing + Math.sin(i * 1.8) * 12;
        const rw = 22 / layer + 12;
        const rh = baseHeight + Math.cos(i * 2.2) * 40;

        // Coral spire / rock column
        g.moveTo(rx - rw / 2, this.height)
          .lineTo(rx - rw * 0.35, this.height - rh)
          .lineTo(rx + rw * 0.35, this.height - rh)
          .lineTo(rx + rw / 2, this.height)
          .closePath()
          .fill({ color: reefColor });

        // Glowing anemone bulbs & coral caps
        const capColor = coralBulbColors[i % coralBulbColors.length];
        g.circle(rx, this.height - rh, rw * 0.75).fill({ color: capColor });
        g.circle(rx - rw * 0.2, this.height - rh - rw * 0.2, rw * 0.25).fill({ color: 0xffffff, alpha: 0.6 });

        if (layer >= 2) {
          // Kelp frond wavy lines
          g.moveTo(rx, this.height - 10)
            .bezierCurveTo(rx + 22, this.height - rh * 0.5, rx - 22, this.height - rh * 0.8, rx + 12, this.height - rh - 25)
            .stroke({ color: 0x06b6d4, width: 3.5 });

          g.moveTo(rx + 15, this.height - 15)
            .bezierCurveTo(rx - 15, this.height - rh * 0.4, rx + 25, this.height - rh * 0.7, rx - 10, this.height - rh - 30)
            .stroke({ color: 0x10b981, width: 3 });
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
