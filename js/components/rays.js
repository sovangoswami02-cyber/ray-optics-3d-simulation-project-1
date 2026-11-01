/**
 * 3D Laser Ray System
 * Standardized Z-axis & Customizable Multiple Rays (2 to 20 rays):
 * - Dynamically generates 2 to 20 incoming rays spreading from object top to mirror.
 * - In X-Ray mode, every active reflected ray connects to the front Lens Point of the eye.
 * - Virtual dashed rays extend behind the mirror to intersect at the virtual image point (0, hi, +di).
 */

window.createRaySystem = function () {
  const group = new THREE.Group();
  group.name = 'raySystem';

  const MAX_RAYS = 20;

  // State toggles
  const toggles = {
    ray1: true,
    ray2: true,
    virtualRays: true,
    normals: false,
    photons: true
  };

  // Helper to create glowing solid laser line
  function createLaserLine(colorHex, thickness = 0.038) {
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(6);
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const mat = new THREE.LineBasicMaterial({
      color: colorHex,
      linewidth: 3,
      transparent: true,
      opacity: 0.95
    });

    const line = new THREE.Line(geo, mat);

    // Inner cylinder for visible 3D thickness and bloom
    const beamGeo = new THREE.CylinderGeometry(thickness, thickness, 1, 8);
    const beamMat = new THREE.MeshBasicMaterial({
      color: colorHex,
      transparent: true,
      opacity: 0.85
    });
    const beam = new THREE.Mesh(beamGeo, beamMat);
    beam.visible = false;
    line.add(beam);
    line.beam = beam;

    line.updatePoints = function (pA, pB) {
      const pos = this.geometry.attributes.position.array;
      pos[0] = pA.x; pos[1] = pA.y; pos[2] = pA.z;
      pos[3] = pB.x; pos[4] = pB.y; pos[5] = pB.z;
      this.geometry.attributes.position.needsUpdate = true;

      const dist = pA.distanceTo(pB);
      if (dist > 0.001) {
        this.beam.visible = true;
        this.beam.scale.set(1, dist, 1);
        this.beam.position.copy(pA).add(pB).multiplyScalar(0.5);
        this.beam.quaternion.setFromUnitVectors(
          new THREE.Vector3(0, 1, 0),
          new THREE.Vector3().subVectors(pB, pA).normalize()
        );
      } else {
        this.beam.visible = false;
      }
    };

    return line;
  }

  // Helper to create dashed line for virtual rays
  function createDashedVirtualLine(colorHex) {
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(6);
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const mat = new THREE.LineDashedMaterial({
      color: colorHex,
      dashSize: 0.4,
      gapSize: 0.25,
      linewidth: 2,
      transparent: true,
      opacity: 0.9
    });

    const line = new THREE.Line(geo, mat);

    line.updatePoints = function (pA, pB) {
      const pos = this.geometry.attributes.position.array;
      pos[0] = pA.x; pos[1] = pA.y; pos[2] = pA.z;
      pos[3] = pB.x; pos[4] = pB.y; pos[5] = pB.z;
      this.geometry.attributes.position.needsUpdate = true;
      this.computeLineDistances();
    };

    return line;
  }

  // Color palette for dynamic rays
  const palette = [
    0x00f5d4, // Cyan (Ray 1)
    0xff007f, // Neon Pink (Ray 2)
    0xa855f7, // Purple
    0x38bdf8, // Electric Blue
    0xfbbf24, // Amber Yellow
    0x34d399, // Emerald
    0xf43f5e, // Crimson
    0xa3e635, // Lime Green
    0x818cf8, // Indigo
    0xe879f9, // Fuchsia
    0x2dd4bf, // Teal
    0xf97316, // Orange
    0x60a5fa, // Sky
    0xc084fc, // Violet
    0x4ade80, // Green
    0xf472b6, // Rose
    0x38ef7d, // Mint
    0xff6b6b, // Coral
    0x00e5ff, // Ice Cyan
    0xffd166  // Gold
  ];

  // Pool of ray render objects (up to MAX_RAYS)
  const rayObjects = [];
  for (let i = 0; i < MAX_RAYS; i++) {
    const rayGroup = new THREE.Group();
    rayGroup.name = `rayObject_${i}`;

    const color = palette[i % palette.length];
    const incLine = createLaserLine(color, 0.038);
    const reflLine = createLaserLine(color, 0.038);
    const virtLine = createDashedVirtualLine(0xf5d0fe);
    const normLine = createLaserLine(0x71717a, 0.015);
    normLine.visible = false;

    // Contact spark ring at mirror hit point
    const sparkGeo = new THREE.RingGeometry(0.08, 0.2, 16);
    const sparkMat = new THREE.MeshBasicMaterial({
      color: color,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.95
    });
    const spark = new THREE.Mesh(sparkGeo, sparkMat);

    rayGroup.add(incLine);
    rayGroup.add(reflLine);
    rayGroup.add(virtLine);
    rayGroup.add(normLine);
    rayGroup.add(spark);

    rayGroup.visible = false;
    group.add(rayGroup);

    rayObjects.push({
      group: rayGroup,
      incLine,
      reflLine,
      virtLine,
      normLine,
      spark,
      color
    });
  }

  // Photon Pulses System
  const photonCount = 30;
  const photonGeo = new THREE.SphereGeometry(0.09, 12, 12);
  const photons = [];

  for (let i = 0; i < photonCount; i++) {
    const pMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const pMesh = new THREE.Mesh(photonGeo, pMat);
    pMesh.visible = false;
    group.add(pMesh);
    photons.push({
      mesh: pMesh,
      rayIndex: i % MAX_RAYS,
      phase: i / photonCount
    });
  }

  let currentRaysList = [];

  // Update rays geometry
  group.updateRays = function (raysData, isVirtual, forceRevealVirtual = false, eyeMesh = null, isXRayMode = false) {
    // raysData can be array (from calculateMultipleRays) or object with ray1/ray2
    const rayList = Array.isArray(raysData)
      ? raysData
      : (raysData ? [raysData.ray1, raysData.ray2].filter(Boolean) : []);

    currentRaysList = rayList;
    const total = rayList.length;

    for (let i = 0; i < MAX_RAYS; i++) {
      const robj = rayObjects[i];
      if (i >= total) {
        robj.group.visible = false;
        continue;
      }

      const data = rayList[i];
      if (!data) {
        robj.group.visible = false;
        continue;
      }

      // Check specific Ray 1 and Ray 2 toggles if applicable
      if (total === 2) {
        if (i === 0 && !toggles.ray1) { robj.group.visible = false; continue; }
        if (i === 1 && !toggles.ray2) { robj.group.visible = false; continue; }
      }

      robj.group.visible = true;

      // 1. Incident Ray: from object tip to mirror
      robj.incLine.updatePoints(data.incident[0], data.incident[1]);

      // 2. Spark at mirror hit point
      robj.spark.position.copy(data.hitPoint);

      // 3. Reflected Ray:
      // In X-Ray mode, the two diverging rays coming from the mirror MUST be drawn
      // so their endpoints land exactly on this Pupil coordinate (the absolute anchor).
      if (isXRayMode && eyeMesh) {
        let pupilHit;
        if (typeof eyeMesh.getPupilEntranceWorld === 'function') {
          pupilHit = eyeMesh.getPupilEntranceWorld(i, total);
        } else if (typeof eyeMesh.getPupilWorldPos === 'function') {
          pupilHit = eyeMesh.getPupilWorldPos();
        } else if (typeof eyeMesh.getLensPointWorld === 'function') {
          pupilHit = eyeMesh.getLensPointWorld(i, total);
        } else {
          pupilHit = eyeMesh.position;
        }
        robj.reflLine.updatePoints(data.hitPoint, pupilHit);
      } else {
        robj.reflLine.updatePoints(data.reflected[0], data.reflected[1]);
      }

      // 4. Virtual extension dashed ray:
      // When object is in the virtual zone, extend dashed lines behind mirror to intersect at virtual image point!
      if ((isVirtual || forceRevealVirtual) && data.virtual && toggles.virtualRays) {
        robj.virtLine.visible = true;
        robj.virtLine.updatePoints(data.virtual[0], data.virtual[1]);
      } else {
        robj.virtLine.visible = false;
      }

      // 5. Normal line
      if (toggles.normals && data.normal) {
        robj.normLine.visible = true;
        const normEnd = new THREE.Vector3().copy(data.hitPoint).addScaledVector(data.normal, 2.5);
        robj.normLine.updatePoints(data.hitPoint, normEnd);
      } else {
        robj.normLine.visible = false;
      }
    }
  };

  // Animate photon flow along active rays
  group.animatePhotons = function (delta = 0.016, eyeMesh = null, isXRayMode = false) {
    if (!toggles.photons || currentRaysList.length === 0) {
      photons.forEach((p) => (p.mesh.visible = false));
      return;
    }

    const speed = 0.65;
    const total = currentRaysList.length;

    photons.forEach((p, idx) => {
      const activeIdx = idx % total;
      const rayData = currentRaysList[activeIdx];
      if (!rayData) {
        p.mesh.visible = false;
        return;
      }

      p.phase = (p.phase + delta * speed) % 1.0;
      p.mesh.visible = true;

      // Phase 0.0 -> 0.45: Incident Ray from object tip to mirror
      // Phase 0.45 -> 1.0: Reflected Ray from mirror to lens (X-Ray) or space
      if (p.phase < 0.45) {
        const t = p.phase / 0.45;
        p.mesh.position.lerpVectors(rayData.incident[0], rayData.incident[1], t);
        p.mesh.material.color.setHex(0xffffff);
        p.mesh.scale.setScalar(1.0);
      } else {
        const t = (p.phase - 0.45) / 0.55;
        let reflTarget = rayData.reflected[1];
        if (isXRayMode && eyeMesh) {
          if (typeof eyeMesh.getPupilEntranceWorld === 'function') {
            reflTarget = eyeMesh.getPupilEntranceWorld(activeIdx, total);
          } else if (typeof eyeMesh.getPupilWorldPos === 'function') {
            reflTarget = eyeMesh.getPupilWorldPos();
          } else if (typeof eyeMesh.getLensPointWorld === 'function') {
            reflTarget = eyeMesh.getLensPointWorld(activeIdx, total);
          }
        }
        p.mesh.position.lerpVectors(rayData.incident[1], reflTarget, t);
        p.mesh.material.color.setHex(palette[activeIdx % palette.length]);
        p.mesh.scale.setScalar(0.9);
      }
    });
  };

  // Toggles setter
  group.setToggle = function (name, value) {
    if (name in toggles) {
      toggles[name] = value;
    }
  };

  return group;
};
