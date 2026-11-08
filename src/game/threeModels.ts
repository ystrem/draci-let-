import * as THREE from "three";
import { DragonConfig3D, RiderConfig, HorseConfig } from "./typesEragon";

// Helper to create basic materials with varying roughness & metalness
const createMat = (color: number | string, roughness: number = 0.6, metalness: number = 0.1, emissive: number = 0x000000) => {
  return new THREE.MeshStandardMaterial({
    color: new THREE.Color(color),
    roughness,
    metalness,
    emissive: new THREE.Color(emissive),
    emissiveIntensity: emissive !== 0 ? 0.6 : 0
  });
};

/**
 * 1. Procedural 3D Dragon (Composite 3-12 Part THREE.Group)
 * Built to represent Saphira / custom dragon from Eragon with rich anatomical detail
 */
export function createDragonMesh(config: DragonConfig3D, isLyingDown: boolean = false): THREE.Group {
  const dragon = new THREE.Group();
  dragon.name = "Dragon";

  const scale = config.stage === "baby" ? 0.55 : 1.8; // Juvenile is horse-sized!
  const baseColor = new THREE.Color(config.scaleColor);
  const bellyColor = new THREE.Color(config.bellyColor || "#e2e8f0");
  const eyeColor = new THREE.Color(config.eyeColor || "#38bdf8");

  const scaleMat = createMat(baseColor.getHex(), 0.35, 0.4); // Iridescent dragon scales
  const bellyMat = createMat(bellyColor.getHex(), 0.5, 0.15);
  const hornMat = createMat(0x1e293b, 0.25, 0.6); // Dark polished horn
  const eyeMat = new THREE.MeshStandardMaterial({
    color: eyeColor,
    emissive: eyeColor,
    emissiveIntensity: 0.8,
    roughness: 0.1,
    metalness: 0.9
  });
  const wingMembraneMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(config.wingColor || config.scaleColor),
    roughness: 0.7,
    metalness: 0.1,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.88
  });

  // Main Torso (Primary silhouette)
  const bodyGeo = new THREE.CylinderGeometry(0.55, 0.42, 2.2, 12);
  bodyGeo.rotateX(Math.PI / 2);
  const bodyMesh = new THREE.Mesh(bodyGeo, scaleMat);
  bodyMesh.castShadow = true;
  bodyMesh.receiveShadow = true;
  bodyMesh.position.set(0, isLyingDown ? 0.45 : 1.1, 0);

  // Soft belly underplate
  const bellyGeo = new THREE.CylinderGeometry(0.48, 0.38, 2.0, 10);
  bellyGeo.rotateX(Math.PI / 2);
  const bellyMesh = new THREE.Mesh(bellyGeo, bellyMat);
  bellyMesh.position.set(0, -0.12, 0);
  bodyMesh.add(bellyMesh);

  // Neck and Head
  const neckGeo = new THREE.CylinderGeometry(0.32, 0.45, 1.2, 10);
  neckGeo.rotateX(isLyingDown ? 0.3 : 0.8);
  const neckMesh = new THREE.Mesh(neckGeo, scaleMat);
  neckMesh.castShadow = true;
  neckMesh.position.set(0, 0.7, 1.1);
  bodyMesh.add(neckMesh);

  // Head (Secondary read)
  const headGroup = new THREE.Group();
  headGroup.position.set(0, isLyingDown ? 0.6 : 1.2, 1.6);

  const skullGeo = new THREE.ConeGeometry(0.4, 1.0, 8);
  skullGeo.rotateX(Math.PI / 2);
  const skullMesh = new THREE.Mesh(skullGeo, scaleMat);
  skullMesh.castShadow = true;
  headGroup.add(skullMesh);

  // Curved Horns (Accent detail)
  const hornLeftGeo = new THREE.ConeGeometry(0.09, 0.7, 6);
  hornLeftGeo.rotateZ(-0.4);
  hornLeftGeo.rotateX(-0.5);
  const hornLeft = new THREE.Mesh(hornLeftGeo, hornMat);
  hornLeft.position.set(-0.25, 0.35, -0.3);
  headGroup.add(hornLeft);

  const hornRightGeo = new THREE.ConeGeometry(0.09, 0.7, 6);
  hornRightGeo.rotateZ(0.4);
  hornRightGeo.rotateX(-0.5);
  const hornRight = new THREE.Mesh(hornRightGeo, hornMat);
  hornRight.position.set(0.25, 0.35, -0.3);
  headGroup.add(hornRight);

  // Glowing Dragon Eyes
  const eyeLeftGeo = new THREE.SphereGeometry(0.09, 8, 8);
  const eyeLeft = new THREE.Mesh(eyeLeftGeo, eyeMat);
  eyeLeft.position.set(-0.26, 0.12, 0.15);
  headGroup.add(eyeLeft);

  const eyeRightGeo = new THREE.SphereGeometry(0.09, 8, 8);
  const eyeRight = new THREE.Mesh(eyeRightGeo, eyeMat);
  eyeRight.position.set(0.26, 0.12, 0.15);
  headGroup.add(eyeRight);

  // Head orientation: when lying down, look towards Brom (towards -x or +x)
  if (isLyingDown) {
    headGroup.rotation.y = 0.55; // Attentively gazing at Brom
    headGroup.position.y = 0.45;
  }
  bodyMesh.add(headGroup);

  // Dorsal Spines along spine
  for (let i = 0; i < 5; i++) {
    const spineGeo = new THREE.ConeGeometry(0.08, 0.35 - i * 0.04, 5);
    spineGeo.rotateX(-0.3);
    const spineMesh = new THREE.Mesh(spineGeo, hornMat);
    spineMesh.position.set(0, 0.48, 0.7 - i * 0.4);
    bodyMesh.add(spineMesh);
  }

  // Wings (Left & Right)
  const leftWingGroup = new THREE.Group();
  leftWingGroup.position.set(-0.5, 0.4, 0.2);

  const rightWingGroup = new THREE.Group();
  rightWingGroup.position.set(0.5, 0.4, 0.2);

  if (isLyingDown) {
    // Folded comfortably against flanks
    leftWingGroup.rotation.set(0.2, 0.15, -0.2);
    rightWingGroup.rotation.set(0.2, -0.15, 0.2);
  } else {
    // Majestic spread
    leftWingGroup.rotation.set(-0.1, 0, -0.35);
    rightWingGroup.rotation.set(-0.1, 0, 0.35);
  }

  // Wing spar
  const sparGeo = new THREE.CylinderGeometry(0.06, 0.03, 1.8, 6);
  sparGeo.rotateZ(Math.PI / 3);
  const sparLeft = new THREE.Mesh(sparGeo, scaleMat);
  sparLeft.position.set(-0.7, 0.5, 0);
  leftWingGroup.add(sparLeft);

  const sparRight = new THREE.Mesh(sparGeo, scaleMat);
  sparRight.position.set(0.7, 0.5, 0);
  rightWingGroup.add(sparRight);

  // Wing membrane
  const wingShape = new THREE.Shape();
  wingShape.moveTo(0, 0);
  wingShape.lineTo(-1.6, 1.1);
  wingShape.lineTo(-1.9, 0.2);
  wingShape.lineTo(-1.2, -0.6);
  wingShape.closePath();
  const wingMemGeo = new THREE.ShapeGeometry(wingShape);
  const wingMemLeft = new THREE.Mesh(wingMemGeo, wingMembraneMat);
  leftWingGroup.add(wingMemLeft);

  const wingShapeR = new THREE.Shape();
  wingShapeR.moveTo(0, 0);
  wingShapeR.lineTo(1.6, 1.1);
  wingShapeR.lineTo(1.9, 0.2);
  wingShapeR.lineTo(1.2, -0.6);
  wingShapeR.closePath();
  const wingMemGeoR = new THREE.ShapeGeometry(wingShapeR);
  const wingMemRight = new THREE.Mesh(wingMemGeoR, wingMembraneMat);
  rightWingGroup.add(wingMemRight);

  bodyMesh.add(leftWingGroup);
  bodyMesh.add(rightWingGroup);

  // Tail (Curled if lying down)
  const tailGeo = new THREE.CylinderGeometry(0.1, 0.35, 2.0, 8);
  tailGeo.rotateX(isLyingDown ? 0.6 : 0.2);
  const tailMesh = new THREE.Mesh(tailGeo, scaleMat);
  tailMesh.castShadow = true;
  tailMesh.position.set(isLyingDown ? 0.3 : 0, isLyingDown ? -0.1 : 0.1, -1.8);
  if (isLyingDown) {
    tailMesh.rotation.y = 0.8; // gracefully curled around body
  }
  bodyMesh.add(tailMesh);

  // 4 Legs
  const legGeo = new THREE.CylinderGeometry(0.16, 0.1, isLyingDown ? 0.45 : 0.9, 8);
  const legPositions = [
    [-0.45, isLyingDown ? -0.25 : -0.6, 0.7],
    [0.45, isLyingDown ? -0.25 : -0.6, 0.7],
    [-0.45, isLyingDown ? -0.25 : -0.6, -0.7],
    [0.45, isLyingDown ? -0.25 : -0.6, -0.7]
  ];
  legPositions.forEach(([x, y, z]) => {
    const leg = new THREE.Mesh(legGeo, scaleMat);
    leg.castShadow = true;
    leg.position.set(x, y, z);
    bodyMesh.add(leg);
  });

  dragon.add(bodyMesh);
  dragon.scale.set(scale, scale, scale);

  return dragon;
}

/**
 * 2. Procedural 3D Rider (Eragon / Custom Rider)
 * Custom gender (boy/girl), eye color, tunic, and weapon (sword Zar'roc / bow / axe)
 */
export function createRiderMesh(config: RiderConfig): THREE.Group {
  const rider = new THREE.Group();
  rider.name = "Rider";

  const tunicMat = createMat(config.tunicColor || "#1e3a8a", 0.7, 0.1);
  const skinMat = createMat("#fcd34d", 0.5, 0.05); // Warm skin tone
  const hairMat = createMat(config.hairColor || "#451a03", 0.8, 0.05);
  const bootMat = createMat("#3e2723", 0.4, 0.2);
  const eyeMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(config.eyeColor || "#38bdf8"),
    roughness: 0.1,
    metalness: 0.8
  });
  // Gedwëy Ignasia: Glowing silver mark on right palm!
  const gedweyMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    emissive: 0x93c5fd,
    emissiveIntensity: 1.0,
    roughness: 0.1,
    metalness: 0.9
  });

  // Torso / Tunic
  const torsoGeo = new THREE.CylinderGeometry(0.32, 0.26, 0.9, 8);
  const torso = new THREE.Mesh(torsoGeo, tunicMat);
  torso.position.set(0, 1.25, 0);
  torso.castShadow = true;
  rider.add(torso);

  // Belt with bronze buckle
  const beltGeo = new THREE.CylinderGeometry(0.33, 0.33, 0.1, 8);
  const belt = new THREE.Mesh(beltGeo, createMat(0x271910, 0.4, 0.5));
  belt.position.set(0, 0.9, 0);
  rider.add(belt);

  // Head
  const headGeo = new THREE.SphereGeometry(0.24, 12, 12);
  const head = new THREE.Mesh(headGeo, skinMat);
  head.position.set(0, 1.95, 0);
  head.castShadow = true;
  rider.add(head);

  // Hair style
  if (config.gender === "girl") {
    // Flowing braided hair
    const hairGeo = new THREE.SphereGeometry(0.26, 10, 10);
    const hair = new THREE.Mesh(hairGeo, hairMat);
    hair.position.set(0, 2.05, -0.05);
    rider.add(hair);

    const braidGeo = new THREE.CylinderGeometry(0.08, 0.04, 0.7, 6);
    const braid = new THREE.Mesh(braidGeo, hairMat);
    braid.position.set(0, 1.6, -0.22);
    rider.add(braid);
  } else {
    // Eragon's windswept rider hair
    const hairGeo = new THREE.SphereGeometry(0.26, 10, 8);
    const hair = new THREE.Mesh(hairGeo, hairMat);
    hair.position.set(0, 2.05, 0);
    rider.add(hair);
  }

  // Eyes (Displaying chosen eye color!)
  const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.04, 6, 6), eyeMat);
  eyeL.position.set(-0.09, 1.97, 0.22);
  rider.add(eyeL);

  const eyeR = new THREE.Mesh(new THREE.SphereGeometry(0.04, 6, 6), eyeMat);
  eyeR.position.set(0.09, 1.97, 0.22);
  rider.add(eyeR);

  // Legs & Boots
  const legMat = createMat("#1e293b", 0.6, 0.1);
  const legLeft = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.08, 0.85, 6), legMat);
  legLeft.position.set(-0.16, 0.48, 0);
  legLeft.castShadow = true;
  rider.add(legLeft);

  const legRight = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.08, 0.85, 6), legMat);
  legRight.position.set(0.16, 0.48, 0);
  legRight.castShadow = true;
  rider.add(legRight);

  const bootL = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.18, 0.28), bootMat);
  bootL.position.set(-0.16, 0.09, 0.05);
  rider.add(bootL);

  const bootR = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.18, 0.28), bootMat);
  bootR.position.set(0.16, 0.09, 0.05);
  rider.add(bootR);

  // Arms
  const armMat = tunicMat;
  const armL = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.07, 0.7, 6), armMat);
  armL.position.set(-0.42, 1.25, 0);
  rider.add(armL);

  const armR = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.07, 0.7, 6), armMat);
  armR.position.set(0.42, 1.25, 0);
  rider.add(armR);

  // Right Palm: Gedwëy Ignasia (Silver palm mark)
  const gedweyMark = new THREE.Mesh(new THREE.CircleGeometry(0.06, 8), gedweyMat);
  gedweyMark.position.set(0.44, 0.85, 0.05);
  gedweyMark.rotateX(-Math.PI / 2);
  rider.add(gedweyMark);

  // Weapon in hand or on back
  const weaponGroup = new THREE.Group();
  weaponGroup.name = "RiderWeapon";

  if (config.weapon === "sword") {
    // Zar'roc style ruby blade or rider sword
    const hilt = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.25, 6), createMat(0xd97706, 0.3, 0.8));
    const guard = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.05, 0.08), createMat(0xd97706, 0.3, 0.8));
    guard.position.set(0, 0.12, 0);
    const blade = new THREE.Mesh(new THREE.BoxGeometry(0.07, 1.1, 0.02), createMat(0xdc2626, 0.2, 0.9, 0x7f1d1d));
    blade.position.set(0, 0.7, 0);
    weaponGroup.add(hilt);
    weaponGroup.add(guard);
    weaponGroup.add(blade);
    weaponGroup.position.set(0.46, 0.85, 0.2);
    weaponGroup.rotation.set(0.4, 0, 0);
  } else if (config.weapon === "bow") {
    // Yew hunting bow
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, -0.6, 0),
      new THREE.Vector3(0.15, -0.2, 0.1),
      new THREE.Vector3(0.18, 0.2, 0.1),
      new THREE.Vector3(0, 0.6, 0)
    ]);
    const bowGeo = new THREE.TubeGeometry(curve, 12, 0.03, 5, false);
    const bowMesh = new THREE.Mesh(bowGeo, createMat(0x78350f, 0.6, 0.1));
    weaponGroup.add(bowMesh);

    // Quiver on back
    const quiver = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.08, 0.7, 6), createMat(0x451a03, 0.7, 0.1));
    quiver.position.set(-0.15, 1.4, -0.32);
    quiver.rotation.set(0.3, 0, 0.3);
    rider.add(quiver);
    weaponGroup.position.set(0.46, 1.1, 0.1);
  } else {
    // Dwarf battle axe
    const haft = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.0, 6), createMat(0x78350f, 0.7, 0.1));
    const bladeL = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.25, 0.03), createMat(0x94a3b8, 0.2, 0.9));
    bladeL.position.set(-0.15, 0.35, 0);
    const bladeR = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.25, 0.03), createMat(0x94a3b8, 0.2, 0.9));
    bladeR.position.set(0.15, 0.35, 0);
    weaponGroup.add(haft);
    weaponGroup.add(bladeL);
    weaponGroup.add(bladeR);
    weaponGroup.position.set(0.46, 0.85, 0.2);
  }

  rider.add(weaponGroup);
  return rider;
}

/**
 * 3. Procedural 3D Brom (Elder Storyteller & Former Rider)
 */
export function createBromMesh(): THREE.Group {
  const brom = new THREE.Group();
  brom.name = "Brom";

  const cloakMat = createMat(0x1e293b, 0.8, 0.1);
  const skinMat = createMat(0xd4a373, 0.6, 0.05);
  const beardMat = createMat(0x94a3b8, 0.9, 0.05);
  const staffMat = createMat(0x451a03, 0.5, 0.2);

  // Heavy Travel Cloak & Robes
  const bodyGeo = new THREE.CylinderGeometry(0.38, 0.48, 1.5, 8);
  const body = new THREE.Mesh(bodyGeo, cloakMat);
  body.position.set(0, 0.95, 0);
  body.castShadow = true;
  brom.add(body);

  // Head
  const headGeo = new THREE.SphereGeometry(0.24, 10, 10);
  const head = new THREE.Mesh(headGeo, skinMat);
  head.position.set(0, 1.95, 0);
  head.castShadow = true;
  brom.add(head);

  // Grey Beard and Mustache
  const beardGeo = new THREE.ConeGeometry(0.18, 0.45, 6);
  beardGeo.rotateX(0.2);
  const beard = new THREE.Mesh(beardGeo, beardMat);
  beard.position.set(0, 1.75, 0.15);
  brom.add(beard);

  // Gnarled Walking Staff / Training Stick
  const staff = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.045, 2.3, 6), staffMat);
  staff.name = "BromStaff";
  staff.position.set(0.48, 1.15, 0.2);
  staff.castShadow = true;
  brom.add(staff);

  return brom;
}

/**
 * 4. Procedural 3D Horse with Customizable Coat Color
 */
export function createHorseMesh(config: HorseConfig): THREE.Group {
  const horse = new THREE.Group();
  horse.name = "Horse";

  const bodyMat = createMat(config.bodyColor, 0.65, 0.1);
  const maneMat = createMat(config.maneColor, 0.8, 0.05);
  const hoofMat = createMat(0x0f172a, 0.4, 0.5);
  const saddleMat = createMat(0x3e2723, 0.5, 0.3);

  // Barrel Body
  const bodyGeo = new THREE.CylinderGeometry(0.55, 0.6, 2.1, 10);
  bodyGeo.rotateX(Math.PI / 2);
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  body.position.set(0, 1.5, 0);
  body.castShadow = true;
  horse.add(body);

  // Saddle
  const saddleGeo = new THREE.CylinderGeometry(0.58, 0.62, 0.8, 10);
  saddleGeo.rotateX(Math.PI / 2);
  const saddle = new THREE.Mesh(saddleGeo, saddleMat);
  saddle.position.set(0, 1.52, 0);
  horse.add(saddle);

  // Arched Neck
  const neckGeo = new THREE.CylinderGeometry(0.3, 0.42, 1.3, 8);
  neckGeo.rotateX(0.7);
  const neck = new THREE.Mesh(neckGeo, bodyMat);
  neck.position.set(0, 2.1, 0.85);
  neck.castShadow = true;
  horse.add(neck);

  // Mane
  const maneGeo = new THREE.BoxGeometry(0.12, 1.2, 0.2);
  maneGeo.rotateX(0.7);
  const mane = new THREE.Mesh(maneGeo, maneMat);
  mane.position.set(0, 2.2, 0.7);
  horse.add(mane);

  // Head
  const headGeo = new THREE.ConeGeometry(0.3, 0.85, 8);
  headGeo.rotateX(Math.PI / 2 + 0.3);
  const head = new THREE.Mesh(headGeo, bodyMat);
  head.position.set(0, 2.6, 1.4);
  head.castShadow = true;
  horse.add(head);

  // 4 Muscular Legs with Hooves
  const legPositions = [
    [-0.4, 0.7, 0.75],
    [0.4, 0.7, 0.75],
    [-0.4, 0.7, -0.75],
    [0.4, 0.7, -0.75]
  ];

  legPositions.forEach(([x, y, z]) => {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.09, 1.4, 6), bodyMat);
    leg.position.set(x, y, z);
    leg.castShadow = true;
    horse.add(leg);

    const hoof = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.12, 0.18, 6), hoofMat);
    hoof.position.set(x, 0.09, z);
    horse.add(hoof);
  });

  // Flowing Tail
  const tail = new THREE.Mesh(new THREE.ConeGeometry(0.14, 1.1, 6), maneMat);
  tail.position.set(0, 1.4, -1.2);
  tail.rotation.x = -0.3;
  horse.add(tail);

  return horse;
}

/**
 * 5. Procedural 3D Campfire with Glowing Embers and Stone Ring
 */
export function createCampfireMesh(): THREE.Group {
  const campfire = new THREE.Group();
  campfire.name = "Campfire";

  const stoneMat = createMat(0x64748b, 0.8, 0.1);
  const woodMat = createMat(0x3e2723, 0.9, 0.05);
  const emberMat = new THREE.MeshStandardMaterial({
    color: 0xff3b00,
    emissive: 0xff4500,
    emissiveIntensity: 1.8,
    roughness: 0.3
  });

  // Stone Ring
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2;
    const stone = new THREE.Mesh(new THREE.DodecahedronGeometry(0.24, 0), stoneMat);
    stone.position.set(Math.cos(angle) * 1.1, 0.14, Math.sin(angle) * 1.1);
    stone.rotation.set(Math.random(), Math.random(), Math.random());
    campfire.add(stone);
  }

  // Crossed Burned Logs
  for (let i = 0; i < 5; i++) {
    const log = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.11, 1.3, 6), woodMat);
    log.position.set(0, 0.18 + i * 0.05, 0);
    log.rotation.set(0.3, (i / 5) * Math.PI * 2, 0.4);
    log.castShadow = true;
    campfire.add(log);
  }

  // Glowing Core
  const emberCore = new THREE.Mesh(new THREE.SphereGeometry(0.35, 8, 8), emberMat);
  emberCore.position.set(0, 0.25, 0);
  campfire.add(emberCore);

  // Warm Campfire Point Light
  const fireLight = new THREE.PointLight(0xff7700, 2.8, 14, 1.5);
  fireLight.name = "CampfireLight";
  fireLight.position.set(0, 0.9, 0);
  fireLight.castShadow = true;
  fireLight.shadow.bias = -0.001;
  campfire.add(fireLight);

  return campfire;
}

/**
 * 6. Procedural 3D Pine Tree with Layered Foliage
 */
export function createPineTreeMesh(): THREE.Group {
  const tree = new THREE.Group();
  tree.name = "PineTree";

  const trunkMat = createMat(0x3e2723, 0.9, 0.05);
  const needleMat = createMat(0x14532d, 0.85, 0.05);

  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.42, 2.4, 7), trunkMat);
  trunk.position.set(0, 1.2, 0);
  trunk.castShadow = true;
  tree.add(trunk);

  // 3 Layered foliage cones
  const coneSizes = [
    { r: 1.8, h: 2.2, y: 2.4 },
    { r: 1.4, h: 2.0, y: 3.6 },
    { r: 0.9, h: 1.8, y: 4.8 }
  ];

  coneSizes.forEach((s) => {
    const cone = new THREE.Mesh(new THREE.ConeGeometry(s.r, s.h, 7), needleMat);
    cone.position.set(0, s.y, 0);
    cone.castShadow = true;
    tree.add(cone);
  });

  return tree;
}

/**
 * 7. Procedural Medieval Timber Building / House
 */
export function createMedievalHouseMesh(): THREE.Group {
  const house = new THREE.Group();
  house.name = "MedievalHouse";

  const wallMat = createMat(0xe2e8f0, 0.9, 0.05); // Plaster
  const timberMat = createMat(0x451a03, 0.8, 0.1); // Wood beam
  const roofMat = createMat(0x78350f, 0.7, 0.15); // Shingle
  const stoneMat = createMat(0x64748b, 0.9, 0.1);

  // Stone Foundation
  const foundation = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.6, 4.2), stoneMat);
  foundation.position.set(0, 0.3, 0);
  foundation.receiveShadow = true;
  house.add(foundation);

  // Main Timber Walls
  const walls = new THREE.Mesh(new THREE.BoxGeometry(4.0, 3.2, 4.0), wallMat);
  walls.position.set(0, 2.2, 0);
  walls.castShadow = true;
  house.add(walls);

  // Timber framing beams
  [-1.98, 1.98].forEach((x) => {
    const beam = new THREE.Mesh(new THREE.BoxGeometry(0.2, 3.2, 0.2), timberMat);
    beam.position.set(x, 2.2, 1.98);
    house.add(beam);
  });

  // Gabled Roof
  const roofGeo = new THREE.ConeGeometry(3.2, 2.0, 4);
  roofGeo.rotateY(Math.PI / 4);
  const roof = new THREE.Mesh(roofGeo, roofMat);
  roof.position.set(0, 4.8, 0);
  roof.castShadow = true;
  house.add(roof);

  // Chimney
  const chimney = new THREE.Mesh(new THREE.BoxGeometry(0.6, 1.4, 0.6), stoneMat);
  chimney.position.set(1.2, 5.0, 0.8);
  house.add(chimney);

  return house;
}

/**
 * 8. Procedural Mountain Ridge (Dračí hory / The Spine & Beor Mountains)
 */
export function createMountainPeakMesh(height: number = 32, baseRadius: number = 24, snowCap: boolean = true): THREE.Group {
  const peakGroup = new THREE.Group();
  peakGroup.name = "MountainPeak";

  const rockMat = createMat(0x334155, 0.9, 0.05);
  const mountainGeo = new THREE.ConeGeometry(baseRadius, height, 7);
  const rockMesh = new THREE.Mesh(mountainGeo, rockMat);
  rockMesh.position.set(0, height / 2, 0);
  rockMesh.castShadow = true;
  peakGroup.add(rockMesh);

  if (snowCap) {
    const snowMat = createMat(0xf8fafc, 0.7, 0.1);
    const snowGeo = new THREE.ConeGeometry(baseRadius * 0.35, height * 0.35, 7);
    const snowMesh = new THREE.Mesh(snowGeo, snowMat);
    snowMesh.position.set(0, height * 0.82, 0);
    peakGroup.add(snowMesh);
  }

  return peakGroup;
}

/**
 * 9. Procedural Fortified Stone City Gate (Terinsford & Teirm Walls)
 */
export function createCityGateMesh(): THREE.Group {
  const gate = new THREE.Group();
  gate.name = "CityGate";

  const stoneMat = createMat(0x475569, 0.9, 0.1);
  const woodMat = createMat(0x451a03, 0.7, 0.1);

  // Left & Right Watchtowers
  [-5, 5].forEach((x) => {
    const tower = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.8, 9, 8), stoneMat);
    tower.position.set(x, 4.5, 0);
    tower.castShadow = true;
    gate.add(tower);

    // Tower battlement roof
    const roof = new THREE.Mesh(new THREE.ConeGeometry(2.0, 2.2, 8), createMat(0x1e293b, 0.8, 0.1));
    roof.position.set(x, 10, 0);
    roof.castShadow = true;
    gate.add(roof);
  });

  // Connecting arch wall
  const archWall = new THREE.Mesh(new THREE.BoxGeometry(7, 3.5, 1.4), stoneMat);
  archWall.position.set(0, 6.5, 0);
  gate.add(archWall);

  // Heavy Oak Portcullis Gates
  const gateDoors = new THREE.Mesh(new THREE.BoxGeometry(4.8, 4.5, 0.3), woodMat);
  gateDoors.position.set(0, 2.25, 0);
  gate.add(gateDoors);

  return gate;
}

/**
 * 10. Procedural Ruined Tower with Urgal Battle Remnants (Yazuak)
 */
export function createRuinedTowerMesh(): THREE.Group {
  const ruin = new THREE.Group();
  ruin.name = "RuinedTower";

  const stoneMat = createMat(0x334155, 0.95, 0.05);
  const burntMat = createMat(0x18181b, 0.9, 0.05);

  const base = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 2.6, 5, 8), stoneMat);
  base.position.set(0, 2.5, 0);
  base.castShadow = true;
  ruin.add(base);

  // Jagged broken top
  const jagged = new THREE.Mesh(new THREE.ConeGeometry(2.0, 3, 5), burntMat);
  jagged.position.set(0.5, 5.5, 0);
  jagged.rotation.z = 0.2;
  ruin.add(jagged);

  // Urgal horns / spikes banner
  const spikeMat = createMat(0x09090b, 0.5, 0.2);
  const spike1 = new THREE.Mesh(new THREE.ConeGeometry(0.15, 1.6, 5), spikeMat);
  spike1.position.set(-1.2, 5.0, 0.8);
  spike1.rotation.z = -0.3;
  ruin.add(spike1);

  return ruin;
}

/**
 * 11. River Ninor Wooden Bridge (Yazuak & Daret River crossings)
 */
export function createRiverBridgeMesh(): THREE.Group {
  const bridge = new THREE.Group();
  bridge.name = "RiverBridge";

  const woodMat = createMat(0x5c3d2e, 0.8, 0.1);
  const plank = new THREE.Mesh(new THREE.BoxGeometry(22, 0.4, 4.5), woodMat);
  plank.position.set(0, 1.2, 0);
  plank.castShadow = true;
  plank.receiveShadow = true;
  bridge.add(plank);

  // Wooden Piers / Posts
  [-7, 0, 7].forEach((x) => {
    const postL = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 2.8, 6), woodMat);
    postL.position.set(x, 0, 2.1);
    const postR = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 2.8, 6), woodMat);
    postR.position.set(x, 0, -2.1);
    bridge.add(postL);
    bridge.add(postR);
  });

  return bridge;
}
