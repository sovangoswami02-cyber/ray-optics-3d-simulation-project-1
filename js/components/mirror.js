/**
 * 3D Concave Mirror Mesh Component
 * Strict Concave Mirror Geometry:
 * - Center of Curvature (C) and Focus (F) are on the negative Z-axis (same side as the object).
 * - The deepest center point (the Pole) is at Z = 0.
 * - The mirror curves inward like a bowl facing the object:
 *   The edges of the mirror curve towards the negative Z-axis (z <= 0).
 */

window.createMirrorMesh = function (f_mag = 10, apertureRadius = 6.5) {
  const mirrorGroup = new THREE.Group();
  mirrorGroup.name = 'concaveMirrorGroup';

  const R = 2 * Math.abs(f_mag); // Radius of curvature magnitude

  // Helper to create the concave dish geometry curving inward towards negative Z
  function buildDishGeometry(curvRadius, apRadius) {
    const radialSegments = 64;
    const rings = 40;
    const geometry = new THREE.BufferGeometry();

    const vertices = [];
    const normals = [];
    const uvs = [];
    const indices = [];

    // Center vertex (Pole of mirror at 0, 0, 0)
    vertices.push(0, 0, 0);
    normals.push(0, 0, -1); // Normal pointing towards -Z (toward object)
    uvs.push(0.5, 0.5);

    // Build concentric rings
    for (let r = 1; r <= rings; r++) {
      const radiusRatio = r / rings;
      const currentRadius = radiusRatio * apRadius;

      // Concave sag: edges curve towards negative Z-axis
      const z = -(curvRadius - Math.sqrt(Math.max(0.001, curvRadius * curvRadius - currentRadius * currentRadius)));

      for (let s = 0; s < radialSegments; s++) {
        const theta = (s / radialSegments) * Math.PI * 2;
        const x = currentRadius * Math.cos(theta);
        const y = currentRadius * Math.sin(theta);

        vertices.push(x, y, z);

        // Surface normal: from (x, y, z) towards Center of Curvature (0, 0, -curvRadius)
        const norm = new THREE.Vector3(-x, -y, -curvRadius - z).normalize();
        normals.push(norm.x, norm.y, norm.z);

        uvs.push(0.5 + 0.5 * Math.cos(theta) * radiusRatio, 0.5 + 0.5 * Math.sin(theta) * radiusRatio);
      }
    }

    // Connect indices for center fan (facing -Z towards object)
    for (let s = 0; s < radialSegments; s++) {
      const nextS = (s + 1) % radialSegments;
      indices.push(0, 1 + nextS, 1 + s);
    }

    // Connect indices for subsequent rings
    for (let r = 1; r < rings; r++) {
      const currentRingStart = 1 + (r - 1) * radialSegments;
      const nextRingStart = 1 + r * radialSegments;

      for (let s = 0; s < radialSegments; s++) {
        const nextS = (s + 1) % radialSegments;

        const a = currentRingStart + s;
        const b = currentRingStart + nextS;
        const c = nextRingStart + s;
        const d = nextRingStart + nextS;

        indices.push(a, b, c);
        indices.push(b, d, c);
      }
    }

    geometry.setIndex(indices);
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));

    return geometry;
  }

  // 1. Front Reflective Face (Concave bowl facing -Z)
  const frontGeo = buildDishGeometry(R, apertureRadius);
  const frontMat = new THREE.MeshPhysicalMaterial({
    color: 0xdff4ff,
    metalness: 0.95,
    roughness: 0.08,
    clearcoat: 1.0,
    clearcoatRoughness: 0.05,
    reflectivity: 1.0,
    side: THREE.DoubleSide
  });
  const frontDish = new THREE.Mesh(frontGeo, frontMat);
  frontDish.name = 'frontDish';
  mirrorGroup.add(frontDish);

  // 2. Back Shell Housing (Dark carbon / titanium at +Z backing)
  const backGeo = buildDishGeometry(R, apertureRadius);
  const backMat = new THREE.MeshStandardMaterial({
    color: 0x181822,
    metalness: 0.85,
    roughness: 0.35,
    side: THREE.BackSide
  });
  const backDish = new THREE.Mesh(backGeo, backMat);
  backDish.position.z += 0.12; // backing thickness
  backDish.name = 'backDish';
  mirrorGroup.add(backDish);

  // 3. Futuristic Bezel / Rim with Cyan Neon Edge
  // Rim is at negative Z edge
  const rimOuterZ = -(R - Math.sqrt(Math.max(0.001, R * R - apertureRadius * apertureRadius)));
  const rimGeo = new THREE.TorusGeometry(apertureRadius, 0.22, 24, 64);
  const rimMat = new THREE.MeshStandardMaterial({
    color: 0x222630,
    metalness: 0.9,
    roughness: 0.2
  });
  const rimMesh = new THREE.Mesh(rimGeo, rimMat);
  rimMesh.position.z = rimOuterZ;
  mirrorGroup.add(rimMesh);

  // Neon glowing outer accent ring
  const glowRingGeo = new THREE.TorusGeometry(apertureRadius + 0.05, 0.06, 16, 64);
  const glowRingMat = new THREE.MeshBasicMaterial({
    color: 0x00f5d4,
    transparent: true,
    opacity: 0.85
  });
  const glowRing = new THREE.Mesh(glowRingGeo, glowRingMat);
  glowRing.position.z = rimOuterZ - 0.02;
  mirrorGroup.add(glowRing);

  // 4. Stand & Base Stand
  const standGroup = new THREE.Group();

  const armCurve = new THREE.QuadraticBezierCurve3(
    new THREE.Vector3(0, -apertureRadius + 0.2, rimOuterZ),
    new THREE.Vector3(0, -apertureRadius - 2.5, rimOuterZ + 1.5),
    new THREE.Vector3(0, -apertureRadius - 4.5, 0.5)
  );
  const armGeo = new THREE.TubeGeometry(armCurve, 32, 0.25, 12, false);
  const standMat = new THREE.MeshStandardMaterial({
    color: 0x1f242d,
    metalness: 0.8,
    roughness: 0.3
  });
  const armMesh = new THREE.Mesh(armGeo, standMat);
  standGroup.add(armMesh);

  // Base Pedestal
  const baseGeo = new THREE.CylinderGeometry(3.0, 3.5, 0.45, 32);
  const baseMesh = new THREE.Mesh(baseGeo, standMat);
  baseMesh.position.set(0, -apertureRadius - 4.7, 0.5);
  standGroup.add(baseMesh);

  // Base glowing ring
  const baseGlowGeo = new THREE.TorusGeometry(3.1, 0.04, 16, 32);
  const baseGlowMat = new THREE.MeshBasicMaterial({ color: 0x00f5d4 });
  const baseGlow = new THREE.Mesh(baseGlowGeo, baseGlowMat);
  baseGlow.rotation.x = Math.PI / 2;
  baseGlow.position.set(0, -apertureRadius - 4.5, 0.5);
  standGroup.add(baseGlow);

  mirrorGroup.add(standGroup);

  // 5. Holographic Vertex / Pole marker at Z = 0
  const vRingGeo = new THREE.RingGeometry(0.12, 0.22, 32);
  const vRingMat = new THREE.MeshBasicMaterial({
    color: 0x00f5d4,
    side: THREE.DoubleSide
  });
  const vRing = new THREE.Mesh(vRingGeo, vRingMat);
  vRing.position.set(0, 0, -0.01);
  mirrorGroup.add(vRing);

  // Method to update mirror curvature
  mirrorGroup.updateCurvature = function (newF_mag, newAperture = apertureRadius) {
    const newR = 2 * Math.abs(newF_mag);
    frontDish.geometry.dispose();
    backDish.geometry.dispose();
    frontDish.geometry = buildDishGeometry(newR, newAperture);
    backDish.geometry = buildDishGeometry(newR, newAperture);

    const newOuterZ = -(newR - Math.sqrt(Math.max(0.001, newR * newR - newAperture * newAperture)));
    rimMesh.position.z = newOuterZ;
    glowRing.position.z = newOuterZ - 0.02;
  };

  return mirrorGroup;
};
