import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import {
  EragonGameState,
  LocationId,
  LOCATIONS,
  LocationInfo,
  RiderConfig,
  DragonConfig3D,
  HorseConfig,
  HORSE_BREEDS,
  INITIAL_SPELLS,
  INITIAL_QUESTS,
  TELEPATHY_DIALOGUES,
  BROM_DIALOGUES
} from "./typesEragon";
import {
  createDragonMesh,
  createRiderMesh,
  createBromMesh,
  createHorseMesh,
  createCampfireMesh,
  createPineTreeMesh,
  createMedievalHouseMesh,
  createMountainPeakMesh,
  createCityGateMesh,
  createRuinedTowerMesh,
  createRiverBridgeMesh
} from "./threeModels";
import { soundFX } from "./audioSystem";

export interface Collider {
  x: number;
  z: number;
  radius: number;
  name: string;
}

export class ThreeEragonEngine {
  private container: HTMLDivElement;
  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private isSoftwareGl: boolean = false;
  private frameId: number = 0;
  private clock = new THREE.Clock();
  private onStateChange: (state: EragonGameState) => void;

  // Game Entities
  private riderGroup: THREE.Group | null = null;
  private dragonGroup: THREE.Group | null = null;
  private bromGroup: THREE.Group | null = null;
  private bromHorseGroup: THREE.Group | null = null; // Brom's noble steed Snowfire (Sněžná hříva)
  private horseGroup: THREE.Group | null = null;
  private campfireGroup: THREE.Group | null = null;
  private environmentGroup = new THREE.Group();

  // Colliders for solid obstacle physics ("nejde procházet věcmi")
  private colliders: Collider[] = [];

  // Potion pickups in world
  private potionPickups: { mesh: THREE.Group; x: number; z: number; collected: boolean }[] = [];

  // Player position & movement
  private playerPos = new THREE.Vector3(0, 0, 4);
  private playerVelocity = new THREE.Vector3();
  private playerFacingAngle: number = 0;
  private isRolling: boolean = false;
  private rollTimer: number = 0;
  private attackTimer: number = 0;

  // Brom Sparring State
  private bromPos = new THREE.Vector3(0, 0, -2);
  private bromThrowTimer: number = 3.5; // seconds until next stick throw
  private thrownSticks: { mesh: THREE.Mesh; pos: THREE.Vector3; vel: THREE.Vector3; life: number }[] = [];

  // Magic Projectiles (Brisingr fireballs)
  private magicProjectiles: { mesh: THREE.Mesh; light: THREE.PointLight; pos: THREE.Vector3; vel: THREE.Vector3; life: number }[] = [];

  // Active Shield Mesh (Skölir!)
  private shieldMesh: THREE.Mesh | null = null;

  // Brom combat circling angle
  private bromAngle: number = 0;
  private bromTargetPos = new THREE.Vector3(0, 0, -2.8);

  // Keyboard input states
  private keys: { [key: string]: boolean } = {};

  // Current Game State
  public state: EragonGameState;

  constructor(
    container: HTMLDivElement,
    initialState: EragonGameState,
    onStateChange: (state: EragonGameState) => void
  ) {
    this.container = container;
    this.state = initialState;
    this.onStateChange = onStateChange;
  }

  public init() {
    this.detectSoftwareGl();
    this.setupRenderer();
    this.setupScene();
    this.setupLighting();
    this.setupInputListeners();
    this.loadLocation(this.state.currentLocationId);
    this.startLoop();
  }

  private detectSoftwareGl() {
    try {
      const gl = document.createElement("canvas").getContext("webgl2");
      if (!gl) {
        this.isSoftwareGl = true;
        return;
      }
      const ext = gl.getExtension("WEBGL_debug_renderer_info");
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension("WEBGL_lose_context")?.loseContext();
      this.isSoftwareGl = /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    } catch {
      this.isSoftwareGl = true;
    }
  }

  private setupRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      antialias: !this.isSoftwareGl,
      powerPreference: "high-performance",
      alpha: false
    });
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.renderer.setPixelRatio(this.isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.renderer.shadowMap.enabled = !this.isSoftwareGl;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.container.innerHTML = "";
    this.container.appendChild(this.renderer.domElement);
  }

  private setupScene() {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      55,
      this.container.clientWidth / this.container.clientHeight,
      0.1,
      150
    );
    this.camera.position.set(0, 7.5, 12);
    this.camera.lookAt(0, 1.2, 0);

    // Studio Environment reflection using RoomEnvironment
    const pmrem = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    pmrem.dispose();

    this.scene.add(this.environmentGroup);
  }

  private setupLighting() {
    const hemiLight = new THREE.HemisphereLight(0xb1e1ff, 0x142017, 0.7);
    hemiLight.name = "HemiLight";
    this.scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xfff3d6, 1.2);
    dirLight.name = "DirLight";
    dirLight.position.set(12, 20, 10);
    dirLight.castShadow = !this.isSoftwareGl;
    if (dirLight.shadow) {
      dirLight.shadow.mapSize.width = 1024;
      dirLight.shadow.mapSize.height = 1024;
      dirLight.shadow.camera.near = 0.5;
      dirLight.shadow.camera.far = 45;
      dirLight.shadow.camera.left = -16;
      dirLight.shadow.camera.right = 16;
      dirLight.shadow.camera.top = 16;
      dirLight.shadow.camera.bottom = -16;
      dirLight.shadow.bias = -0.0005;
      dirLight.shadow.normalBias = 0.02;
    }
    this.scene.add(dirLight);
  }

  public loadGameState(newState: EragonGameState) {
    this.state = { ...newState };
    this.loadLocation(this.state.currentLocationId);
    this.updateState();
  }

  public loadLocation(locId: LocationId) {
    const loc = LOCATIONS.find((l) => l.id === locId) || LOCATIONS[0];
    this.state.currentLocationId = locId;

    // Clear previous environment
    while (this.environmentGroup.children.length > 0) {
      const obj = this.environmentGroup.children[0];
      this.environmentGroup.remove(obj);
    }
    this.colliders = [];
    this.potionPickups = [];

    // Scene fog & background matched to location
    this.scene.background = new THREE.Color(loc.skyColor);
    this.scene.fog = new THREE.FogExp2(loc.fogColor, loc.id === "camp_night1" ? 0.025 : 0.015);

    // Ground Plane (Enlarged map: 260x260)
    const groundGeo = new THREE.PlaneGeometry(260, 260, 24, 24);
    groundGeo.rotateX(-Math.PI / 2);
    const groundMat = new THREE.MeshStandardMaterial({
      color: loc.groundColor,
      roughness: 0.9,
      metalness: 0.05
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.receiveShadow = true;
    this.environmentGroup.add(ground);

    // Reset player position
    this.playerPos.set(0, 0, 4);

    // Build specific location environment
    if (loc.id === "camp_night1") {
      this.buildCampfireScene();
    } else if (loc.id === "terinsford" || loc.id === "yazuak" || loc.id === "daret" || loc.id === "teirm") {
      this.buildTownScene(loc);
    } else if (loc.id === "hadarak") {
      this.buildDesertScene();
    } else if (loc.id === "varden") {
      this.buildVardenScene();
    }

    // Spawn 3D Characters
    this.rebuildCharacters();
    this.spawnHealingPotions();
    this.updateState();
  }

  /**
   * Location 1: První tábořiště v lesích Palancar pod hřebeny Dračích hor (The Spine)
   */
  private buildCampfireScene() {
    soundFX.startCampfireAmbient();

    // Campfire in center
    this.campfireGroup = createCampfireMesh();
    this.campfireGroup.position.set(0, 0, 0);
    this.environmentGroup.add(this.campfireGroup);
    this.addCollider(0, 0, 1.4, "Campfire");

    // Brom position
    this.bromPos.set(0, 0, -2.8);
    this.addCollider(this.bromPos.x, this.bromPos.z, 0.8, "Brom");

    // Dračí hory (The Spine) towering snowcapped peaks in the background
    for (let i = -4; i <= 4; i++) {
      const peak = createMountainPeakMesh(45 + Math.abs(i) * 5, 30, true);
      peak.position.set(i * 26, 0, -85 - Math.sin(i) * 15);
      this.environmentGroup.add(peak);
    }

    // Dense ancient Palancar pine forests with mossy boulders
    for (let i = 0; i < 42; i++) {
      const angle = (i / 42) * Math.PI * 2;
      const dist = 14 + Math.sin(i * 3) * 6 + (i % 3) * 8;
      const x = Math.cos(angle) * dist;
      const z = Math.sin(angle) * dist;

      const tree = createPineTreeMesh();
      tree.position.set(x, 0, z);
      const sc = 0.8 + Math.random() * 0.6;
      tree.scale.set(sc, sc, sc);
      this.environmentGroup.add(tree);
      this.addCollider(x, z, 1.0 * sc, `PineTree_${i}`);
    }

    // Traveler's canvas tent & leather saddlebags
    const tentGeo = new THREE.ConeGeometry(2.4, 2.2, 4);
    tentGeo.rotateY(Math.PI / 4);
    const tent = new THREE.Mesh(
      tentGeo,
      new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.9 })
    );
    tent.position.set(-7, 1.1, -4.5);
    tent.castShadow = true;
    this.environmentGroup.add(tent);
    this.addCollider(-7, -4.5, 2.2, "Tent");

    // Wooden log bench by campfire
    const logGeo = new THREE.CylinderGeometry(0.32, 0.38, 3.8, 6);
    logGeo.rotateZ(Math.PI / 2);
    const log = new THREE.Mesh(
      logGeo,
      new THREE.MeshStandardMaterial({ color: 0x3e2723, roughness: 0.9 })
    );
    log.position.set(0, 0.3, 2.6);
    log.castShadow = true;
    this.environmentGroup.add(log);
    this.addCollider(0, 2.6, 1.8, "LogBench");
  }

  /**
   * Location 2-5: Book-accurate cities along the journey
   * Terinsford, Yazuak, Daret, Teirm
   */
  private buildTownScene(loc: LocationInfo) {
    soundFX.stopCampfireAmbient();

    // Mountain silhouettes on the horizon (The Spine on west)
    for (let i = -3; i <= 3; i++) {
      const peak = createMountainPeakMesh(38 + Math.abs(i) * 4, 25, loc.id !== "teirm");
      peak.position.set(i * 35, 0, -95);
      this.environmentGroup.add(peak);
    }

    // Cobblestone Main High Street (Enlarged road)
    const streetMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.8 });
    const street = new THREE.Mesh(new THREE.PlaneGeometry(36, 150), streetMat);
    street.rotateX(-Math.PI / 2);
    street.position.set(0, 0.02, 0);
    this.environmentGroup.add(street);

    // River Ninor / River Anora with flowing blue water
    const river = new THREE.Mesh(
      new THREE.PlaneGeometry(32, 150),
      new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.2, metalness: 0.85 })
    );
    river.rotateX(-Math.PI / 2);
    river.position.set(-35, 0.01, 0);
    this.environmentGroup.add(river);
    this.addCollider(-35, 0, 14, "RiverBank");

    // Wooden Bridge across the river
    const bridge = createRiverBridgeMesh();
    bridge.position.set(-20, 0, 5);
    this.environmentGroup.add(bridge);

    if (loc.id === "terinsford") {
      // TERINSFORD: Great Stone Town Gate & Horse Trading Stables
      const gate = createCityGateMesh();
      gate.position.set(0, 0, 55);
      this.environmentGroup.add(gate);
      this.addCollider(0, 55, 6.0, "TownGate");

      // Timber houses along street
      const houseCoords = [
        { x: 18, z: -35 },
        { x: 18, z: -18 },
        { x: 18, z: 0 },
        { x: 18, z: 18 },
        { x: 18, z: 36 },
        { x: -16, z: -25 },
        { x: -16, z: 20 },
        { x: -16, z: 38 }
      ];
      houseCoords.forEach((c, idx) => {
        const house = createMedievalHouseMesh();
        house.position.set(c.x, 0, c.z);
        this.environmentGroup.add(house);
        this.addCollider(c.x, c.z, 3.2, `House_${idx}`);
      });

      // Horse Stable
      const stable = new THREE.Mesh(
        new THREE.BoxGeometry(8.5, 3.5, 6.0),
        new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.8 })
      );
      stable.position.set(-16, 1.75, -5);
      this.environmentGroup.add(stable);
      this.addCollider(-16, -5, 4.5, "Stable");

      this.bromPos.set(2, 0, -5);
      this.addCollider(this.bromPos.x, this.bromPos.z, 0.8, "Brom");
    } else if (loc.id === "yazuak") {
      // YAZUAK: Ruined foggy village on river Ninor, Urgal ambush site
      const ruin1 = createRuinedTowerMesh();
      ruin1.position.set(12, 0, -10);
      this.environmentGroup.add(ruin1);
      this.addCollider(12, -10, 3.2, "UrgalRuin1");

      const ruin2 = createRuinedTowerMesh();
      ruin2.position.set(-14, 0, 15);
      ruin2.scale.set(1.3, 1.3, 1.3);
      this.environmentGroup.add(ruin2);
      this.addCollider(-14, 15, 4.0, "UrgalRuin2");

      // Burned half-timbered ruins
      [-25, 2, 28].forEach((z, i) => {
        const house = createMedievalHouseMesh();
        house.position.set(16, 0, z);
        this.environmentGroup.add(house);
        this.addCollider(16, z, 3.2, `RuinHouse_${i}`);
      });

      this.bromPos.set(1, 0, -4);
      this.addCollider(this.bromPos.x, this.bromPos.z, 0.8, "Brom");
    } else if (loc.id === "daret") {
      // DARET: Fortified palisade wall and river fortress
      const palisadeMat = new THREE.MeshStandardMaterial({ color: 0x3f2d1d, roughness: 0.9 });
      for (let x = -20; x <= 20; x += 1.8) {
        if (Math.abs(x) < 4) continue; // Gate opening
        const log = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.3, 6, 6), palisadeMat);
        log.position.set(x, 3, 40);
        log.castShadow = true;
        this.environmentGroup.add(log);
        this.addCollider(x, 40, 0.8, `Palisade_${x}`);
      }

      // Houses inside fortress
      [-30, -10, 10].forEach((z, i) => {
        const house = createMedievalHouseMesh();
        house.position.set(14, 0, z);
        this.environmentGroup.add(house);
        this.addCollider(14, z, 3.2, `FortHouse_${i}`);
      });

      this.bromPos.set(2, 0, -2);
      this.addCollider(this.bromPos.x, this.bromPos.z, 0.8, "Brom");
    } else if (loc.id === "teirm") {
      // TEIRM: Massive Citadel Walls, Angela's herbal shop & Jeod's manor
      const gate = createCityGateMesh();
      gate.position.set(0, 0, 48);
      gate.scale.set(1.4, 1.4, 1.4);
      this.environmentGroup.add(gate);
      this.addCollider(0, 48, 8.0, "TeirmCitadelGate");

      // Great coastal stone houses
      [
        { x: 18, z: -35 },
        { x: 18, z: -15 },
        { x: 18, z: 5 },
        { x: 18, z: 25 },
        { x: -16, z: -25 },
        { x: -16, z: -5 },
        { x: -16, z: 20 }
      ].forEach((c, idx) => {
        const house = createMedievalHouseMesh();
        house.position.set(c.x, 0, c.z);
        this.environmentGroup.add(house);
        this.addCollider(c.x, c.z, 3.2, `TeirmManor_${idx}`);
      });

      this.bromPos.set(2, 0, -6);
      this.addCollider(this.bromPos.x, this.bromPos.z, 0.8, "Brom");
    }

    // Market Crates along streets
    const crateMat = new THREE.MeshStandardMaterial({ color: 0x92400e, roughness: 0.7 });
    [
      { x: 5, z: -4 },
      { x: 5.8, z: -4 },
      { x: 5, z: -3.2 },
      { x: -4, z: 4 },
      { x: -4, z: 5.2 }
    ].forEach((p, i) => {
      const crate = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.8, 0.8), crateMat);
      crate.position.set(p.x, 0.4, p.z);
      crate.castShadow = true;
      this.environmentGroup.add(crate);
      this.addCollider(p.x, p.z, 0.6, `Crate_${i}`);
    });
  }

  /**
   * Location 6: Poušť Hadarak & Obří štíty Beorských hor na obzoru
   */
  private buildDesertScene() {
    soundFX.stopCampfireAmbient();

    // The colossal Beor Mountains rising 10 miles into the sky on the southern horizon
    for (let i = -4; i <= 4; i++) {
      const beorPeak = createMountainPeakMesh(65 + Math.abs(i) * 8, 42, true);
      beorPeak.position.set(i * 32, 0, -88);
      this.environmentGroup.add(beorPeak);
    }

    // Desert Sandstone Boulders & Sand Dunes
    const rockMat = new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.9 });
    for (let i = 0; i < 28; i++) {
      const x = (Math.random() - 0.5) * 80;
      const z = (Math.random() - 0.5) * 80;
      if (Math.hypot(x, z) < 8) continue;

      const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(1.6 + Math.random() * 2.2, 1), rockMat);
      rock.position.set(x, 1.4, z);
      rock.scale.set(1.4, 0.9, 1.4);
      rock.castShadow = true;
      this.environmentGroup.add(rock);
      this.addCollider(x, z, 2.4, `DesertRock_${i}`);
    }

    this.bromPos.set(3, 0, -2);
    this.addCollider(this.bromPos.x, this.bromPos.z, 0.8, "Brom");
  }

  /**
   * Location 7: Tronjheim ve Farthen Dûru (Vardeni a Hvězdná růže Isidar Mithrim)
   */
  private buildVardenScene() {
    soundFX.stopCampfireAmbient();

    // Giant Dwarf Marble Pillars forming the circular hall of Tronjheim
    const marbleMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.3, metalness: 0.25 });
    for (let i = -4; i <= 4; i++) {
      if (i === 0) continue;
      [-16, 16].forEach((x) => {
        const pillar = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.6, 22, 12), marbleMat);
        pillar.position.set(x, 11, i * 10);
        pillar.castShadow = true;
        this.environmentGroup.add(pillar);
        this.addCollider(x, i * 10, 1.8, `Pillar_${x}_${i}`);
      });
    }

    // Glowing Star Rose (Isidar Mithrim) Sapphire Crystal in center
    const crystalGeo = new THREE.OctahedronGeometry(3.5, 0);
    const crystalMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 1.6,
      roughness: 0.05,
      metalness: 0.95,
      transparent: true,
      opacity: 0.92
    });
    const starRose = new THREE.Mesh(crystalGeo, crystalMat);
    starRose.position.set(0, 7.5, -16);
    this.environmentGroup.add(starRose);

    const starLight = new THREE.PointLight(0x38bdf8, 4.5, 40);
    starLight.position.set(0, 7.5, -16);
    this.environmentGroup.add(starLight);

    this.bromPos.set(0, 0, -8);
    this.addCollider(this.bromPos.x, this.bromPos.z, 0.8, "Brom");
  }

  /**
   * Add a solid obstacle collider
   */
  public addCollider(x: number, z: number, radius: number, name: string) {
    this.colliders.push({ x, z, radius, name });
  }

  /**
   * Collision check ensuring "nejde procházet věcmi"
   */
  private checkCollision(newX: number, newZ: number, playerRadius: number = 0.5): boolean {
    for (const c of this.colliders) {
      const dist = Math.hypot(newX - c.x, newZ - c.z);
      if (dist < c.radius + playerRadius) {
        return true;
      }
    }
    // Arena boundaries (Enlarged map freedom)
    if (Math.abs(newX) > 95 || Math.abs(newZ) > 95) {
      return true;
    }
    return false;
  }

  /**
   * Spawn healing potion collectibles scattered in world
   */
  private spawnHealingPotions() {
    const potionMat = new THREE.MeshStandardMaterial({
      color: 0xef4444,
      emissive: 0xdc2626,
      emissiveIntensity: 0.8,
      roughness: 0.2
    });

    const positions = [
      { x: 4, z: 2 },
      { x: -5, z: 3 },
      { x: 7, z: -6 },
      { x: -8, z: -4 }
    ];

    positions.forEach((p, idx) => {
      const potionGroup = new THREE.Group();
      const bottle = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 0.45, 8), potionMat);
      bottle.position.set(0, 0.3, 0);
      const neck = new THREE.Mesh(
        new THREE.CylinderGeometry(0.06, 0.06, 0.15, 6),
        new THREE.MeshStandardMaterial({ color: 0x78350f })
      );
      neck.position.set(0, 0.55, 0);
      potionGroup.add(bottle);
      potionGroup.add(neck);
      potionGroup.position.set(p.x, 0, p.z);

      this.scene.add(potionGroup);
      this.potionPickups.push({ mesh: potionGroup, x: p.x, z: p.z, collected: false });
    });
  }

  /**
   * Rebuild 3D Actors (Rider, Dragon, Brom, Horse)
   */
  public rebuildCharacters() {
    // Remove existing
    if (this.riderGroup) this.scene.remove(this.riderGroup);
    if (this.dragonGroup) this.scene.remove(this.dragonGroup);
    if (this.bromGroup) this.scene.remove(this.bromGroup);
    if (this.horseGroup) this.scene.remove(this.horseGroup);

    // 1. Rider
    this.riderGroup = createRiderMesh(this.state.rider);
    this.riderGroup.position.copy(this.playerPos);
    this.scene.add(this.riderGroup);

    // 2. Dragon ("drak ve meste nebude")
    // In cities, soldiers and Ra'zacs patrol, so the dragon stays hidden in forests outside the city walls.
    const isCity = ["terinsford", "yazuak", "daret", "teirm"].includes(this.state.currentLocationId);
    const isAtCamp = this.state.currentLocationId === "camp_night1";

    if (!isCity) {
      this.dragonGroup = createDragonMesh(this.state.dragon, isAtCamp);
      if (isAtCamp) {
        // "drak ktereho si muzes pojmenovat pristane vedle tebe si lehne a kouka na Broma"
        this.dragonGroup.position.set(2.4, 0, 3.2);
        this.dragonGroup.rotation.y = -0.6; // Facing Brom
      } else {
        // In desert or Varden dome, dragon soars above or rests nearby
        this.dragonGroup.position.set(this.playerPos.x + 3.0, 4.5, this.playerPos.z - 2.0);
      }
      this.scene.add(this.dragonGroup);
    } else {
      // In cities: Dragon is hidden in the nearby forest
      this.dragonGroup = null;
    }

    // 3. Brom
    this.bromGroup = createBromMesh();
    this.bromGroup.position.copy(this.bromPos);
    this.scene.add(this.bromGroup);

    // 4. Brom's Horse: Sněžná hříva (Snowfire) - noble white steed
    if (this.bromHorseGroup) this.scene.remove(this.bromHorseGroup);
    const snowfireConfig: HorseConfig = {
      owned: true,
      colorName: "Sněžná hříva (Snowfire)",
      bodyColor: "#f8fafc", // Noble snowy white coat
      maneColor: "#e2e8f0",
      price: 0
    };
    this.bromHorseGroup = createHorseMesh(snowfireConfig);
    // In camp: Snowfire grazes near Brom; on the road / in towns: Brom rides Snowfire or stands beside him!
    if (this.state.isRidingHorse && this.state.currentLocationId !== "camp_night1") {
      this.bromHorseGroup.position.set(this.bromPos.x, 0, this.bromPos.z);
      this.bromGroup.position.set(this.bromPos.x, 1.3, this.bromPos.z); // Brom mounted on Snowfire
    } else {
      this.bromHorseGroup.position.set(this.bromPos.x + 2.4, 0, this.bromPos.z - 0.5);
      this.bromHorseGroup.rotation.y = -0.4;
      this.bromGroup.position.y = 0;
    }
    this.scene.add(this.bromHorseGroup);

    // 5. Player's Horse
    if (this.state.horse.owned) {
      this.horseGroup = createHorseMesh(this.state.horse);
      if (this.state.isRidingHorse) {
        this.horseGroup.position.copy(this.playerPos);
        if (this.riderGroup) {
          this.riderGroup.position.y = 1.3; // mounted on saddle
        }
      } else {
        this.horseGroup.position.set(this.playerPos.x - 2.2, 0, this.playerPos.z);
      }
      this.scene.add(this.horseGroup);
    }
  }

  /**
   * Action: Roll / Kotrmelec (Press Ctrl)
   * Dodges Brom's flying stick or attacks with agile evasive maneuver
   */
  public performDodge() {
    if (this.isRolling) return;
    this.isRolling = true;
    this.rollTimer = 0.45; // duration of roll
    soundFX.playDodge();
    this.state.lastCombatAction = "⚡ Kotrmelec! Uhnul ses útoku!";
    this.updateState();
  }

  /**
   * Action: Attack / Úder (Press E)
   * Strikes with weapon while keeping free fluid player movement!
   */
  public performAttack() {
    this.attackTimer = 0.35;
    const distToBrom = this.playerPos.distanceTo(this.bromPos);

    if (distToBrom < 3.8) {
      // Hit Brom!
      soundFX.playAttackHit(true);
      this.state.bromHealth = Math.max(10, this.state.bromHealth - 15);
      this.state.lastCombatAction = `⚔️ V plném pohybu jsi zasáhl Broma (${this.state.rider.weapon})!`;
      // Check quest
      const sparringQuest = this.state.quests.find((q) => q.id === "q_campfire_sparring");
      if (sparringQuest && !sparringQuest.completed) {
        sparringQuest.completed = true;
        this.state.goldCoins += sparringQuest.rewardGold;
        soundFX.playCoin();
      }
    } else {
      soundFX.playAttackHit(false);
      this.state.lastCombatAction = "🗡️ Máchl jsi zbraní v pohybu! Přistup k Bromovi blíž.";
    }
    this.updateState();
  }

  /**
   * Action: Heal / Uzdravit se (Press F)
   * Recovers health after tough training using potion or Waíse heill
   */
  public performHeal() {
    if (this.state.healingPotions > 0) {
      this.state.healingPotions--;
      this.state.playerHealth = Math.min(this.state.playerMaxHealth, this.state.playerHealth + 45);
      soundFX.playHeal();
      this.state.lastCombatAction = "🧪 Vypil jsi léčivou lahvičku! Zdraví obnoveno.";
      this.updateState();
    } else if (this.state.unlockedSpells.includes("waise_heill") && this.state.playerEnergy >= 30) {
      this.state.playerEnergy -= 30;
      this.state.playerHealth = Math.min(this.state.playerMaxHealth, this.state.playerHealth + 40);
      soundFX.playHeal();
      this.state.lastCombatAction = "✨ WAÍSE HEILL! Zacelil jsi rány svou vnitřní magickou energií.";
      this.updateState();
    } else if (this.state.healingPotions === 0 && !this.state.unlockedSpells.includes("waise_heill")) {
      this.state.lastCombatAction = "⚠️ Nemáš léčivou lahvičku! Kup si ji v lékárně ve městě (12z) nebo ji najdi na zemi.";
      this.updateState();
    } else {
      this.state.lastCombatAction = "⚠️ Nedostatek energie pro kouzlo Waíse heill (potřebuješ 30 energie)!";
      this.updateState();
    }
  }

  /**
   * Action: Cast Spell (Brisingr, Skölir, Waíse heill, Jierda)
   * Progressive learning according to Eragon story
   */
  public castSpell(spellId: string) {
    if (!this.state.unlockedSpells.includes(spellId)) {
      const sp = INITIAL_SPELLS.find((s) => s.id === spellId);
      this.state.lastCombatAction = `🔒 Kouzlo ${sp ? sp.ancientWord : spellId} ještě neznáš! Naučíš se ho v lokaci: ${sp ? sp.unlockLocationName : "na cestě"}.`;
      this.updateState();
      return;
    }

    if (spellId === "brisingr") {
      if (this.state.playerEnergy < 25) {
        this.state.lastCombatAction = "⚠️ Nedostatek energie pro Brisingr (potřeba 25)!";
        this.updateState();
        return;
      }
      this.state.playerEnergy -= 25;
      soundFX.playBrisingr();
      this.state.lastCombatAction = "🔥 BRISINGR! Ohnivý výboj energie ze stříbrné dlaně!";

      // Spawn 3D fireball projectile
      const fireGeo = new THREE.SphereGeometry(0.35, 10, 10);
      const fireMat = new THREE.MeshStandardMaterial({
        color: 0xff4500,
        emissive: 0xff3300,
        emissiveIntensity: 2.2,
        roughness: 0.2
      });
      const fireball = new THREE.Mesh(fireGeo, fireMat);
      fireball.position.copy(this.playerPos).add(new THREE.Vector3(0, 1.2, 0));
      const fireLight = new THREE.PointLight(0xff5500, 3.0, 9);
      fireball.add(fireLight);
      this.scene.add(fireball);

      const dir = new THREE.Vector3(Math.sin(this.playerFacingAngle), 0, Math.cos(this.playerFacingAngle));
      this.magicProjectiles.push({
        mesh: fireball,
        light: fireLight,
        pos: fireball.position,
        vel: dir.multiplyScalar(17),
        life: 2.0
      });
      this.updateState();
    } else if (spellId === "skolir") {
      // Skölir! Protective Ward Shield (lasts 6 seconds)
      if (this.state.playerEnergy < 30) {
        this.state.lastCombatAction = "⚠️ Nedostatek energie pro Skölir (potřeba 30)!";
        this.updateState();
        return;
      }
      this.state.playerEnergy -= 30;
      this.state.shieldActiveTimer = 6.0;
      soundFX.playSkolirShield();
      this.state.lastCombatAction = "🛡️ SKÖLIR! Vyvolal jsi modrý ochranný štít odrážející útoky!";

      if (!this.shieldMesh) {
        const shieldGeo = new THREE.SphereGeometry(1.4, 16, 16);
        const shieldMat = new THREE.MeshStandardMaterial({
          color: 0x38bdf8,
          emissive: 0x0284c7,
          emissiveIntensity: 1.5,
          transparent: true,
          opacity: 0.45,
          roughness: 0.1,
          wireframe: false
        });
        this.shieldMesh = new THREE.Mesh(shieldGeo, shieldMat);
        this.scene.add(this.shieldMesh);
      }
      this.shieldMesh.position.copy(this.playerPos).add(new THREE.Vector3(0, 1.0, 0));
      this.shieldMesh.visible = true;
      this.updateState();
    } else if (spellId === "waise_heill") {
      this.performHeal();
    } else if (spellId === "jierda") {
      // Jierda! Kinetic shockwave pushing Brom / enemies back
      if (this.state.playerEnergy < 40) {
        this.state.lastCombatAction = "⚠️ Nedostatek energie pro Jierda (potřeba 40)!";
        this.updateState();
        return;
      }
      this.state.playerEnergy -= 40;
      soundFX.playJierdaShockwave();
      this.state.lastCombatAction = "💥 JIERDA! Kinetický ráz Starodávného jazyka odhodil protivníka!";

      // Push Brom back if nearby
      const dist = this.playerPos.distanceTo(this.bromPos);
      if (dist < 6.0) {
        const pushDir = new THREE.Vector3().subVectors(this.bromPos, this.playerPos).normalize();
        this.bromPos.addScaledVector(pushDir, 3.5);
        if (this.bromGroup) {
          this.bromGroup.position.copy(this.bromPos);
        }
      }

      // Deflect any sticks in air
      this.thrownSticks.forEach((s) => {
        s.vel.multiplyScalar(-1.5);
      });

      this.updateState();
    }
  }

  /**
   * Toggle mount / dismount horse
   */
  public toggleHorseRide() {
    if (!this.state.horse.owned) {
      this.state.lastCombatAction = "⚠️ Nejprve si v Terinsfordu kup koně!";
      this.updateState();
      return;
    }
    this.state.isRidingHorse = !this.state.isRidingHorse;
    if (this.state.isRidingHorse) {
      soundFX.playHoofstep();
      this.state.lastCombatAction = `🐎 Nasedl jsi na koně (${this.state.horse.colorName})! Pohyb je nyní rychlejší.`;
    } else {
      this.state.lastCombatAction = "🚶 Sesedl jsi z koně na zem.";
    }
    this.rebuildCharacters();
    this.updateState();
  }

  /**
   * Open / close telepathic dialogue with dragon
   */
  public openTelepathy() {
    soundFX.playTelepathy();
    this.state.isTelepathyOpen = true;

    // Pick dialogue appropriate to current location
    let dlg = TELEPATHY_DIALOGUES[0];
    if (this.state.currentLocationId === "hadarak") {
      dlg = TELEPATHY_DIALOGUES[3];
    } else if (this.state.unlockedSpells.includes("brisingr")) {
      dlg = TELEPATHY_DIALOGUES[2];
    } else if (this.state.isRidingHorse) {
      dlg = TELEPATHY_DIALOGUES[1];
    }
    this.state.currentTelepathyDialogue = dlg;
    this.updateState();
  }

  /**
   * Open / close spoken dialogue with Brom ("pridej ze brom ma taky kone a mluvy")
   */
  public openBromDialogue() {
    soundFX.playTelepathy();
    this.state.isBromDialogueOpen = true;

    // Select dialogue based on story / location
    let dlg = BROM_DIALOGUES[0]; // Snowfire horse dialogue
    if (this.state.currentLocationId === "camp_night1") {
      dlg = this.state.playerHealth < 70 ? BROM_DIALOGUES[2] : BROM_DIALOGUES[0];
    } else if (this.state.unlockedSpells.length > 0) {
      dlg = BROM_DIALOGUES[1]; // Dragon lore and magic
    }
    this.state.currentBromDialogue = dlg;
    this.updateState();
  }

  public answerBromDialogue(optIdx: number) {
    if (!this.state.currentBromDialogue) return;
    const option = this.state.currentBromDialogue.options[optIdx];
    if (option) {
      if (option.healBonus) {
        this.state.playerHealth = Math.min(this.state.playerMaxHealth, this.state.playerHealth + 30);
      }
      if (option.energyBonus) {
        this.state.playerEnergy = Math.min(this.state.playerMaxEnergy, this.state.playerEnergy + 30);
      }
      this.state.lastCombatAction = `🗣️ Brom: "${option.bromReply}"`;
    }
    this.state.isBromDialogueOpen = false;
    this.updateState();
  }

  public answerTelepathy(choiceIdx: number) {
    if (!this.state.currentTelepathyDialogue) return;
    const choice = this.state.currentTelepathyDialogue.choices[choiceIdx];
    if (choice) {
      this.state.dragonBond = Math.min(100, this.state.dragonBond + choice.bondEffect);
      soundFX.playDragonCall(this.state.dragon.stage === "baby");
      this.state.lastCombatAction = `💭 ${this.state.dragon.name}: "${choice.dragonReply}"`;
    }
    this.state.isTelepathyOpen = false;
    this.updateState();
  }

  /**
   * Buy horse in town
   */
  public buyHorse(breedIdx: number) {
    const breed = HORSE_BREEDS[breedIdx];
    if (!breed) return;

    if (this.state.goldCoins >= breed.price) {
      this.state.goldCoins -= breed.price;
      this.state.horse = {
        owned: true,
        colorName: breed.colorName,
        bodyColor: breed.bodyColor,
        maneColor: breed.maneColor,
        price: breed.price
      };
      soundFX.playCoin();
      soundFX.playHoofstep();
      this.state.lastCombatAction = `🐴 Koupil jsi koně: ${breed.colorName}!`;

      const quest = this.state.quests.find((q) => q.id === "q_buy_horse");
      if (quest && !quest.completed) {
        quest.completed = true;
        this.state.goldCoins += quest.rewardGold;
      }
      this.rebuildCharacters();
      this.updateState();
    } else {
      this.state.lastCombatAction = "⚠️ Nemáš dostatek zlaťáků na tohoto koně! Pomoz obyvatelům města.";
      this.updateState();
    }
  }

  /**
   * Buy healing potion in town apothecary
   */
  public buyPotion() {
    const cost = 12;
    if (this.state.goldCoins >= cost) {
      this.state.goldCoins -= cost;
      this.state.healingPotions += 1;
      soundFX.playCoin();
      this.state.lastCombatAction = "🧪 Koupil jsi léčivou lahvičku v krámku!";
      this.updateState();
    } else {
      this.state.lastCombatAction = "⚠️ Potřebuješ 12 zlaťáků na léčivou lahvičku!";
      this.updateState();
    }
  }

  /**
   * Complete helping citizen task to earn money
   */
  public completeCitizenTask() {
    this.state.goldCoins += 25;
    soundFX.playCoin();
    this.state.lastCombatAction = "💰 Pomohl jsi měšťanovi se zásobami a získal 25 zlaťáků!";
    const q = this.state.quests.find((quest) => quest.id === "q_help_villagers");
    if (q) q.completed = true;
    this.updateState();
  }

  /**
   * Advance to next town / day (4 days travel between cities)
   */
  public advanceJourney() {
    const locIndex = LOCATIONS.findIndex((l) => l.id === this.state.currentLocationId);
    if (locIndex < LOCATIONS.length - 1) {
      const nextLoc = LOCATIONS[locIndex + 1];
      this.state.dayCount = nextLoc.dayNumber;
      this.state.currentLocationId = nextLoc.id;

      // Progressive learning of Ancient Language spells ("take se budu ucit kouzla postupne"):
      // 1. Yazuak (Day 6) -> Brisingr! (Fire)
      // 2. Daret (Day 10) -> Skölir! (Shield)
      // 3. Teirm (Day 14) -> Waíse heill! (Heal)
      // 4. Hadarak (Day 18) -> Jierda! (Shockwave)
      let newlyLearnedSpell: typeof INITIAL_SPELLS[0] | null = null;
      if (nextLoc.id === "yazuak" && !this.state.unlockedSpells.includes("brisingr")) {
        this.state.unlockedSpells.push("brisingr");
        newlyLearnedSpell = INITIAL_SPELLS.find((s) => s.id === "brisingr") || null;
      } else if (nextLoc.id === "daret" && !this.state.unlockedSpells.includes("skolir")) {
        this.state.unlockedSpells.push("skolir");
        newlyLearnedSpell = INITIAL_SPELLS.find((s) => s.id === "skolir") || null;
      } else if (nextLoc.id === "teirm" && !this.state.unlockedSpells.includes("waise_heill")) {
        this.state.unlockedSpells.push("waise_heill");
        newlyLearnedSpell = INITIAL_SPELLS.find((s) => s.id === "waise_heill") || null;
      } else if (nextLoc.id === "hadarak" && !this.state.unlockedSpells.includes("jierda")) {
        this.state.unlockedSpells.push("jierda");
        newlyLearnedSpell = INITIAL_SPELLS.find((s) => s.id === "jierda") || null;
      }

      if (newlyLearnedSpell) {
        soundFX.playTelepathy();
        this.state.justUnlockedSpell = newlyLearnedSpell;
        this.state.lastCombatAction = `✨ Na cestě jsi odhalil Starodávný jazyk: "${newlyLearnedSpell.ancientWord}" (${newlyLearnedSpell.name})!`;
      }

      this.loadLocation(nextLoc.id);
      this.updateState();
    }
  }

  /**
   * Toggle Sound Effects and Ambience
   */
  public toggleMute() {
    const newMuted = !this.state.isMuted;
    soundFX.setMuted(newMuted);
    this.state.isMuted = newMuted;
    if (!newMuted && this.state.currentLocationId === "camp_night1") {
      soundFX.startCampfireAmbient();
    }
    this.state.lastCombatAction = newMuted ? "🔇 Zvuk byl vypnut (tichý režim)." : "🔊 Zvuk byl zapnut.";
    this.updateState();
  }

  private setupInputListeners() {
    window.addEventListener("keydown", (e) => {
      this.keys[e.code] = true;

      // Dodge roll (Ctrl)
      if (e.key === "Control" || e.code === "ControlLeft" || e.code === "ControlRight") {
        e.preventDefault();
        this.performDodge();
      }

      // Attack (E)
      if (e.code === "KeyE" || e.key === "e" || e.key === "E") {
        this.performAttack();
      }

      // Heal (F)
      if (e.code === "KeyF" || e.key === "f" || e.key === "F") {
        this.performHeal();
      }

      // Telepathy with dragon (T)
      if (e.code === "KeyT" || e.key === "t" || e.key === "T") {
        this.openTelepathy();
      }

      // Talk with Brom (B)
      if (e.code === "KeyB" || e.key === "b" || e.key === "B") {
        this.openBromDialogue();
      }

      // Mount/Dismount horse (Space)
      if (e.code === "Space") {
        e.preventDefault();
        this.toggleHorseRide();
      }

      // Spell Hotkeys (1, 2, 3, 4)
      if (e.code === "Digit1") {
        this.castSpell("brisingr");
      }
      if (e.code === "Digit2") {
        this.castSpell("skolir");
      }
      if (e.code === "Digit3") {
        this.castSpell("waise_heill");
      }
      if (e.code === "Digit4") {
        this.castSpell("jierda");
      }

      // Toggle Sound Mute (M)
      if (e.code === "KeyM" || e.key === "m" || e.key === "M") {
        this.toggleMute();
      }
    });

    window.addEventListener("keyup", (e) => {
      this.keys[e.code] = false;
    });

    // Window resize
    window.addEventListener("resize", () => {
      if (this.container && this.renderer && this.camera) {
        const w = this.container.clientWidth;
        const h = this.container.clientHeight;
        this.camera.aspect = w / h;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(w, h);
      }
    });
  }

  /**
   * Main Game Loop with Gamepad and Delta Physics
   */
  private startLoop() {
    const tick = () => {
      const delta = Math.min(this.clock.getDelta(), 0.1);

      this.updateGameLogic(delta);
      this.renderer.render(this.scene, this.camera);

      if (this.isSoftwareGl) {
        this.afterDraw(tick);
      } else {
        this.frameId = requestAnimationFrame(tick);
      }
    };

    if (this.isSoftwareGl) {
      this.afterDraw(tick);
    } else {
      this.frameId = requestAnimationFrame(tick);
    }
  }

  private afterDraw(cb: () => void) {
    const gl = this.renderer.getContext() as WebGL2RenderingContext;
    const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
    gl.flush();
    const poll = () => {
      const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
      if (state === gl.UNSIGNALED) {
        this.frameId = window.setTimeout(poll, 5);
      } else {
        gl.deleteSync(sync);
        this.frameId = window.setTimeout(cb, 60);
      }
    };
    this.frameId = window.setTimeout(poll, 5);
  }

  private updateGameLogic(delta: number) {
    // 1. Poll Gamepads
    const gamepads = typeof navigator !== "undefined" && navigator.getGamepads ? navigator.getGamepads() : [];
    const gp = Array.from(gamepads).find((g) => g !== null && g.connected);

    let moveX = 0;
    let moveZ = 0;

    // Keyboard movement (W, A, S, D or Arrows)
    if (this.keys["KeyW"] || this.keys["ArrowUp"]) moveZ -= 1;
    if (this.keys["KeyS"] || this.keys["ArrowDown"]) moveZ += 1;
    if (this.keys["KeyA"] || this.keys["ArrowLeft"]) moveX -= 1;
    if (this.keys["KeyD"] || this.keys["ArrowRight"]) moveX += 1;

    // Gamepad Stick / D-Pad
    if (gp) {
      if (Math.abs(gp.axes[0]) > 0.25) moveX = gp.axes[0];
      if (Math.abs(gp.axes[1]) > 0.25) moveZ = gp.axes[1];

      if (gp.buttons[12]?.pressed) moveZ = -1;
      if (gp.buttons[13]?.pressed) moveZ = 1;
      if (gp.buttons[14]?.pressed) moveX = -1;
      if (gp.buttons[15]?.pressed) moveX = 1;

      // Button mappings:
      // B (1) -> Dodge roll
      if (gp.buttons[1]?.pressed && !this.isRolling) this.performDodge();
      // X (2) -> Attack
      if (gp.buttons[2]?.pressed) this.performAttack();
      // Y (3) -> Heal
      if (gp.buttons[3]?.pressed) this.performHeal();
      // A (0) -> Mount/Dismount
      if (gp.buttons[0]?.pressed) this.toggleHorseRide();
    }

    // 2. Player Movement & Solid Collision
    const speed = this.state.isRidingHorse ? 8.5 : this.isRolling ? 10.0 : 4.5;
    if (moveX !== 0 || moveZ !== 0) {
      const len = Math.hypot(moveX, moveZ);
      const dx = (moveX / len) * speed * delta;
      const dz = (moveZ / len) * speed * delta;

      const targetAngle = Math.atan2(moveX, moveZ);
      this.playerFacingAngle = targetAngle;

      const newX = this.playerPos.x + dx;
      const newZ = this.playerPos.z + dz;

      // Collision checks with sliding
      if (!this.checkCollision(newX, this.playerPos.z)) {
        this.playerPos.x = newX;
      }
      if (!this.checkCollision(this.playerPos.x, newZ)) {
        this.playerPos.z = newZ;
      }
    }

    // Update Dodge Roll timer
    if (this.isRolling) {
      this.rollTimer -= delta;
      if (this.rollTimer <= 0) {
        this.isRolling = false;
      }
    }

    // 3. Update Rider 3D mesh
    if (this.riderGroup) {
      this.riderGroup.position.x = this.playerPos.x;
      this.riderGroup.position.z = this.playerPos.z;
      this.riderGroup.position.y = this.state.isRidingHorse ? 1.3 : 0;
      this.riderGroup.rotation.y = this.playerFacingAngle;

      if (this.isRolling) {
        this.riderGroup.rotation.x = (this.rollTimer / 0.45) * Math.PI * 4;
      } else {
        this.riderGroup.rotation.x = 0;
      }
    }

    // 4. Update Horse position
    if (this.horseGroup && this.state.isRidingHorse) {
      this.horseGroup.position.x = this.playerPos.x;
      this.horseGroup.position.z = this.playerPos.z;
      this.horseGroup.rotation.y = this.playerFacingAngle;
    }

    // 5. Brom Campfire Combat Logic: Dynamic movement & Throw stick challenge!
    if (this.state.currentLocationId === "camp_night1" && !this.state.isPaused) {
      // Brom dynamically circles and maintains combat distance with the player!
      this.bromAngle += delta * 0.45;
      const targetBromX = Math.sin(this.bromAngle) * 3.6;
      const targetBromZ = Math.cos(this.bromAngle) * 2.8 - 0.5;

      this.bromPos.x = THREE.MathUtils.damp(this.bromPos.x, targetBromX, 2, delta);
      this.bromPos.z = THREE.MathUtils.damp(this.bromPos.z, targetBromZ, 2, delta);

      if (this.bromGroup) {
        this.bromGroup.position.copy(this.bromPos);
        // Brom faces the player
        const lookAngle = Math.atan2(this.playerPos.x - this.bromPos.x, this.playerPos.z - this.bromPos.z);
        this.bromGroup.rotation.y = lookAngle;
      }

      // Snowfire horse stays close to Brom
      if (this.bromHorseGroup) {
        this.bromHorseGroup.position.set(this.bromPos.x + 2.4, 0, this.bromPos.z - 0.5);
      }

      this.bromThrowTimer -= delta;
      if (this.bromThrowTimer <= 0) {
        this.bromThrowTimer = 4.2 + Math.random() * 2.0;
        this.triggerBromChallenge();
      }
    } else if (this.bromHorseGroup && this.state.isRidingHorse) {
      // On the road / in towns when riding: Brom rides his white stallion Snowfire beside the player!
      const bromOffsetX = -2.8;
      const bromOffsetZ = 1.0;
      this.bromPos.x = THREE.MathUtils.damp(this.bromPos.x, this.playerPos.x + bromOffsetX, 3, delta);
      this.bromPos.z = THREE.MathUtils.damp(this.bromPos.z, this.playerPos.z + bromOffsetZ, 3, delta);

      this.bromHorseGroup.position.set(this.bromPos.x, 0, this.bromPos.z);
      this.bromHorseGroup.rotation.y = this.playerFacingAngle;

      if (this.bromGroup) {
        this.bromGroup.position.set(this.bromPos.x, 1.3, this.bromPos.z); // Mounted on Snowfire!
        this.bromGroup.rotation.y = this.playerFacingAngle;
      }
    }

    // Update Skölir Shield (if active)
    if (this.state.shieldActiveTimer && this.state.shieldActiveTimer > 0) {
      this.state.shieldActiveTimer -= delta;
      if (this.shieldMesh) {
        this.shieldMesh.position.copy(this.playerPos).add(new THREE.Vector3(0, 1.0, 0));
        this.shieldMesh.rotation.y += delta * 2.5;
        this.shieldMesh.visible = true;
      }
      if (this.state.shieldActiveTimer <= 0) {
        this.state.shieldActiveTimer = 0;
        if (this.shieldMesh) this.shieldMesh.visible = false;
        this.state.lastCombatAction = "🛡️ Ochranný štít Skölir vyprchal.";
        this.updateState();
      }
    } else if (this.shieldMesh) {
      this.shieldMesh.visible = false;
    }

    // Update thrown sticks physics
    for (let i = this.thrownSticks.length - 1; i >= 0; i--) {
      const stick = this.thrownSticks[i];
      stick.life -= delta;
      stick.pos.addScaledVector(stick.vel, delta);
      stick.mesh.position.copy(stick.pos);
      stick.mesh.rotation.x += delta * 8;

      // Check hit with player
      const dist = stick.pos.distanceTo(this.playerPos);
      if (dist < 1.3) {
        if (this.state.shieldActiveTimer && this.state.shieldActiveTimer > 0) {
          // Deflected by Skölir ward!
          soundFX.playSkolirShield();
          this.state.lastCombatAction = "🛡️ SKÖLIR! Tvůj magický štít odrazil Bromův klacek!";
        } else if (this.isRolling) {
          // Successfully dodged with Ctrl roll!
          soundFX.playDodge();
          this.state.lastCombatAction = "🛡️ Perfektní kotrmelec! Klacku ses elegantně vyhnul!";
        } else {
          // Hit by Brom's practice stick
          soundFX.playAttackHit(false);
          this.state.playerHealth = Math.max(10, this.state.playerHealth - 12);
          this.state.lastCombatAction = "💥 Brom tě zasáhl cvičným klackem! Stiskni Ctrl pro kotrmelec nebo F pro uzdravení!";
        }
        this.scene.remove(stick.mesh);
        this.thrownSticks.splice(i, 1);
        this.updateState();
        continue;
      }

      if (stick.life <= 0) {
        this.scene.remove(stick.mesh);
        this.thrownSticks.splice(i, 1);
      }
    }

    // 6. Update Magic Projectiles (Brisingr)
    for (let i = this.magicProjectiles.length - 1; i >= 0; i--) {
      const proj = this.magicProjectiles[i];
      proj.life -= delta;
      proj.pos.addScaledVector(proj.vel, delta);
      proj.mesh.position.copy(proj.pos);

      // Hit Brom during practice
      if (proj.pos.distanceTo(this.bromPos) < 2.0) {
        soundFX.playBrisingr();
        this.state.lastCombatAction = "🔥 BRISINGR zasáhl cvičný cíl! Brom obdivuje tvou sílu.";
        this.scene.remove(proj.mesh);
        this.magicProjectiles.splice(i, 1);
        this.updateState();
        continue;
      }

      if (proj.life <= 0) {
        this.scene.remove(proj.mesh);
        this.magicProjectiles.splice(i, 1);
      }
    }

    // 7. Check potion pickups
    this.potionPickups.forEach((p) => {
      if (!p.collected) {
        const dist = Math.hypot(this.playerPos.x - p.x, this.playerPos.z - p.z);
        if (dist < 1.4) {
          p.collected = true;
          this.scene.remove(p.mesh);
          this.state.healingPotions += 1;
          soundFX.playCoin();
          this.state.lastCombatAction = "✨ Našel jsi léčivou lahvičku na zemi!";
          this.updateState();
        }
      }
    });

    // 8. Regenerate energy slowly
    if (this.state.playerEnergy < this.state.playerMaxEnergy) {
      this.state.playerEnergy = Math.min(this.state.playerMaxEnergy, this.state.playerEnergy + delta * 2.5);
    }

    // 9. Camera smooth follow
    const camTargetX = this.playerPos.x;
    const camTargetZ = this.playerPos.z + 9;
    this.camera.position.x = THREE.MathUtils.damp(this.camera.position.x, camTargetX, 4, delta);
    this.camera.position.z = THREE.MathUtils.damp(this.camera.position.z, camTargetZ, 4, delta);
    this.camera.lookAt(this.playerPos.x, 1.2, this.playerPos.z);
  }

  /**
   * Brom throws practice stick at the player
   */
  private triggerBromChallenge() {
    soundFX.playStickThrow();
    this.state.lastCombatAction = "⚠️ Brom po tobě hodil klacek! Stiskni Ctrl a udělej kotrmelec!";

    const stickGeo = new THREE.CylinderGeometry(0.04, 0.05, 0.9, 5);
    stickGeo.rotateZ(Math.PI / 2);
    const stickMesh = new THREE.Mesh(
      stickGeo,
      new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.9 })
    );
    stickMesh.position.copy(this.bromPos).add(new THREE.Vector3(0, 1.4, 0));
    this.scene.add(stickMesh);

    const dir = new THREE.Vector3()
      .subVectors(this.playerPos, this.bromPos)
      .normalize()
      .add(new THREE.Vector3(0, 0.1, 0));

    this.thrownSticks.push({
      mesh: stickMesh,
      pos: stickMesh.position,
      vel: dir.multiplyScalar(8.5),
      life: 2.5
    });

    this.updateState();
  }

  private updateState() {
    this.onStateChange({ ...this.state });
  }

  public destroy() {
    if (this.frameId) {
      cancelAnimationFrame(this.frameId);
      clearTimeout(this.frameId);
    }
    soundFX.stopCampfireAmbient();
    this.renderer.dispose();
  }
}
