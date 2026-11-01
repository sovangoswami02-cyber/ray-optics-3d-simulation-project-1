/**
 * Procedural Eye Group Component (Three.js Primitives)
 *
 * Strict Procedural Construction:
 * 1. EyeGroup (THREE.Group) aligned directly on the Z-axis.
 * 2. White SphereGeometry: the eyeball.
 * 3. Black CircleGeometry: the pupil, positioned slightly forward on the local Z-axis
 *    (z = +eyeRadius) so it sits tangentially on the surface of the white sphere.
 * 4. Transparent SphereGeometry: cornea/lens over the pupil.
 * 5. Dynamic Eye Tracking: calling EyeGroup.lookAt(VirtualImage.position) in the
 *    render loop aligns the black pupil directly to stare at the image.
 * 6. Pupil Anchor: endpoints of the incoming diverging rays land exactly on the Pupil coordinate.
 * 7. Internal Submerging Rays: two converging lines submerge from the pupil, travel inside the
 *    white sphere, and intersect perfectly at the Retina Coordinate (opposite side, z = -eyeRadius).
 * 8. Real Image on Retina: glowing neon dot at the Retina Coordinate.
 * 9. X-Ray Mode: white sphere becomes 80% transparent (glass-like, opacity = 0.2) revealing the
 *    rays entering the pupil, submerging, and converging onto the retina.
 */

window.createEyeMesh = function () {
  const eyeRadius = 0.85;
  const pupilRadius = 0.24;
  const MAX_RAYS = 20;

  // 1. Procedural Eye Group
  const EyeGroup = new THREE.Group();
  EyeGroup.name = 'EyeGroup';

  let isXRayMode = false;
  let xrayPhase = 0;
  let currentRayCount = 2;

  // Helper to create 3D Billboard Sprite Labels
  function makeSprite(text, bgColor = 'rgba(15, 23, 42, 0.85)', textColor = '#00f5d4') {
    const canvas = document.createElement('canvas');
    canvas.width = 440;
    canvas.height = 100;
    const ctx = canvas.getContext('2d');

    function draw(t, bg, col) {
      ctx.clearRect(0, 0, 440, 100);
      ctx.fillStyle = bg;
      ctx.strokeStyle = col;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(6, 6, 428, 88, 22);
      ctx.fill();
      ctx.stroke();

      ctx.font = 'bold 26px "JetBrains Mono", monospace';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = col;
      ctx.shadowBlur = 10;
      ctx.fillText(t, 220, 50);
    }

    draw(text, bgColor, textColor);

    const tex = new THREE.CanvasTexture(canvas);
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false }));
    sprite.scale.set(3.2, 0.75, 1);
    sprite.canvas = canvas;
    sprite.ctx = ctx;
    sprite.updateText = function (newText, newBg = bgColor, newColor = textColor) {
      draw(newText, newBg, newColor);
      tex.needsUpdate = true;
    };
    return sprite;
  }

  // ==============================================================
  // 1. WHITE SPHEREGEOMETRY (THE EYEBALL)
  // ==============================================================
  const eyeballGeo = new THREE.SphereGeometry(eyeRadius, 36, 36);
  const eyeballMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.25,
    metalness: 0.05
  });
  const eyeball = new THREE.Mesh(eyeballGeo, eyeballMat);
  eyeball.name = 'eyeball';
  EyeGroup.add(eyeball);

  // ==============================================================
  // 2. BLACK CIRCLEGEOMETRY (THE PUPIL)
  // Positioned slightly forward on local Z-axis (z = +eyeRadius)
  // so it sits perfectly on the surface of the white sphere
  // ==============================================================
  const pupilGeo = new THREE.CircleGeometry(pupilRadius, 36);
  const pupilMat = new THREE.MeshBasicMaterial({
    color: 0x050505,
    side: THREE.DoubleSide
  });
  const pupil = new THREE.Mesh(pupilGeo, pupilMat);
  pupil.name = 'pupil';
  pupil.position.set(0, 0, eyeRadius + 0.003);
  EyeGroup.add(pupil);

  // Sleek cybernetic iris ring around the pupil
  const irisGeo = new THREE.RingGeometry(pupilRadius, 0.44, 36);
  const irisMat = new THREE.MeshStandardMaterial({
    color: 0x00f5d4,
    emissive: 0x00a896,
    emissiveIntensity: 0.4,
    roughness: 0.3,
    side: THREE.DoubleSide
  });
  const iris = new THREE.Mesh(irisGeo, irisMat);
  iris.name = 'iris';
  iris.position.set(0, 0, eyeRadius + 0.002);
  EyeGroup.add(iris);

  // ==============================================================
  // 3. TRANSPARENT SPHEREGEOMETRY (THE CORNEA / LENS) OVER PUPIL
  // Slightly larger, transparent dome positioned over the pupil
  // ==============================================================
  const corneaGeo = new THREE.SphereGeometry(0.48, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.48);
  corneaGeo.rotateX(Math.PI / 2); // Orient dome directly along local +Z axis
  const corneaMat = new THREE.MeshPhysicalMaterial({
    color: 0xdff4ff,
    transparent: true,
    opacity: 0.45,
    roughness: 0.05,
    transmission: 0.95,
    ior: 1.38
  });
  const cornea = new THREE.Mesh(corneaGeo, corneaMat);
  cornea.name = 'corneaLens';
  cornea.position.set(0, 0, eyeRadius - 0.06);
  EyeGroup.add(cornea);

  // Thin outer glossy glass shell encircling the eyeball
  const glassShellGeo = new THREE.SphereGeometry(eyeRadius * 1.02, 32, 32);
  const glassShellMat = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.15,
    roughness: 0.05,
    transmission: 0.9
  });
  const glassShell = new THREE.Mesh(glassShellGeo, glassShellMat);
  glassShell.name = 'glassShell';
  EyeGroup.add(glassShell);

  // Cybernetic gimbal accent rings (normal mode)
  const gimbalGroup = new THREE.Group();
  gimbalGroup.name = 'gimbalGroup';

  const gimbalRingGeo = new THREE.TorusGeometry(eyeRadius * 1.1, 0.04, 16, 32);
  const gimbalRingMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    metalness: 0.9,
    roughness: 0.2
  });
  const gimbalRing = new THREE.Mesh(gimbalRingGeo, gimbalRingMat);
  gimbalGroup.add(gimbalRing);

  const reticleGeo = new THREE.RingGeometry(eyeRadius * 1.12, eyeRadius * 1.18, 32);
  const reticleMat = new THREE.MeshBasicMaterial({
    color: 0xef4444,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.8
  });
  const reticle = new THREE.Mesh(reticleGeo, reticleMat);
  gimbalGroup.add(reticle);

  const coneGeo = new THREE.ConeGeometry(0.7, 3.8, 16, 1, true);
  const coneMat = new THREE.MeshBasicMaterial({
    color: 0x00f5d4,
    wireframe: true,
    transparent: true,
    opacity: 0.12
  });
  const gazeCone = new THREE.Mesh(coneGeo, coneMat);
  gazeCone.rotation.x = -Math.PI / 2;
  gazeCone.position.z = 2.6;
  gimbalGroup.add(gazeCone);

  const normalLabel = makeSprite('👁️ EYE POV', 'rgba(15, 23, 42, 0.75)', '#00f5d4');
  normalLabel.scale.set(2.2, 0.55, 1);
  normalLabel.position.set(0, 1.35, 0);
  gimbalGroup.add(normalLabel);

  EyeGroup.add(gimbalGroup);

  // ==============================================================
  // 4. RETINA COORDINATE & GLOWING NEON DOT
  // The exact opposite side of the white sphere from the pupil
  // Local negative Z pole of the eyeball: (0, 0, -eyeRadius)
  // ==============================================================
  const localRetinaPos = new THREE.Vector3(0, 0, -eyeRadius);

  const retinaGroup = new THREE.Group();
  retinaGroup.name = 'retinaGroup';
  retinaGroup.visible = false;

  // Glowing neon sphere at Retina Coordinate
  const retinaDotGeo = new THREE.SphereGeometry(0.11, 24, 24);
  const retinaDotMat = new THREE.MeshBasicMaterial({
    color: 0x39ff14 // Bright neon lime / cyber green
  });
  const retinaDot = new THREE.Mesh(retinaDotGeo, retinaDotMat);
  retinaDot.position.copy(localRetinaPos);
  retinaGroup.add(retinaDot);

  // Retina outer pulsing halo
  const retinaHaloGeo = new THREE.RingGeometry(0.12, 0.28, 32);
  const retinaHaloMat = new THREE.MeshBasicMaterial({
    color: 0x39ff14,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.95
  });
  const retinaHalo = new THREE.Mesh(retinaHaloGeo, retinaHaloMat);
  retinaHalo.position.set(0, 0, -eyeRadius + 0.02);
  retinaGroup.add(retinaHalo);

  // Inverted real image arrow miniature on retina
  const rArrowShaft = new THREE.Mesh(
    new THREE.CylinderGeometry(0.02, 0.02, 0.22, 8),
    new THREE.MeshBasicMaterial({ color: 0x39ff14 })
  );
  rArrowShaft.position.set(0, -0.11, -eyeRadius + 0.03);
  const rArrowCone = new THREE.Mesh(
    new THREE.ConeGeometry(0.05, 0.09, 8),
    new THREE.MeshBasicMaterial({ color: 0x39ff14 })
  );
  rArrowCone.rotation.z = Math.PI; // Inverted
  rArrowCone.position.set(0, -0.25, -eyeRadius + 0.03);
  retinaGroup.add(rArrowShaft);
  retinaGroup.add(rArrowCone);

  // Label: "● REAL IMAGE ON RETINA"
  const retinaLabel = makeSprite('● REAL IMAGE ON RETINA', 'rgba(15, 23, 42, 0.92)', '#39ff14');
  retinaLabel.scale.set(3.4, 0.8, 1);
  retinaLabel.position.set(0, -1.4, -eyeRadius);
  retinaGroup.add(retinaLabel);

  // Label: "CONVEX CORNEA / LENS"
  const lensLabel = makeSprite('CONVEX CORNEA / LENS', 'rgba(8, 145, 178, 0.9)', '#67e8f9');
  lensLabel.scale.set(3.0, 0.7, 1);
  lensLabel.position.set(0, 1.4, eyeRadius);
  retinaGroup.add(lensLabel);

  EyeGroup.add(retinaGroup);

  // ==============================================================
  // 5. INTERNAL SUBMERGING RAYS (PUPIL TO RETINA)
  // Two new converging lines that 'submerge' and travel inside the
  // white sphere from the black pupil to intersect at the Retina Coordinate
  // ==============================================================
  const internalRaysGroup = new THREE.Group();
  internalRaysGroup.name = 'internalRaysGroup';
  internalRaysGroup.visible = false;
  EyeGroup.add(internalRaysGroup);

  const palette = [
    0x00f5d4, // Cyan (Ray 1)
    0xff007f, // Neon Pink (Ray 2)
    0xa855f7, 0x38bdf8, 0xfbbf24, 0x34d399, 0xf43f5e, 0xa3e635,
    0x818cf8, 0xe879f9, 0x2dd4bf, 0xf97316, 0x60a5fa, 0xc084fc,
    0x4ade80, 0xf472b6, 0x38ef7d, 0xff6b6b, 0x00e5ff, 0xffd166
  ];

  function createInternalBeam(colorHex) {
    const beam = new THREE.Group();

    // 1. Core Line
    const geo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]);
    const lineMat = new THREE.LineBasicMaterial({
      color: colorHex,
      linewidth: 3.5,
      transparent: true,
      opacity: 0.95
    });
    const line = new THREE.Line(geo, lineMat);
    beam.add(line);

    // 2. Glowing 3D Cylinder for bloom
    const cylGeo = new THREE.CylinderGeometry(0.022, 0.022, 1, 8);
    const cylMat = new THREE.MeshBasicMaterial({
      color: colorHex,
      transparent: true,
      opacity: 0.85
    });
    const cyl = new THREE.Mesh(cylGeo, cylMat);
    beam.add(cyl);

    beam.updatePoints = function (pA, pB) {
      const pos = line.geometry.attributes.position.array;
      pos[0] = pA.x; pos[1] = pA.y; pos[2] = pA.z;
      pos[3] = pB.x; pos[4] = pB.y; pos[5] = pB.z;
      line.geometry.attributes.position.needsUpdate = true;

      const dist = pA.distanceTo(pB);
      if (dist > 0.001) {
        cyl.visible = true;
        cyl.scale.set(1, dist, 1);
        cyl.position.copy(pA).add(pB).multiplyScalar(0.5);
        cyl.quaternion.setFromUnitVectors(
          new THREE.Vector3(0, 1, 0),
          new THREE.Vector3().subVectors(pB, pA).normalize()
        );
      } else {
        cyl.visible = false;
      }
    };

    return beam;
  }

  const internalBeams = [];
  const internalPhotons = [];
  const photonGeo = new THREE.SphereGeometry(0.045, 12, 12);

  for (let i = 0; i < MAX_RAYS; i++) {
    const col = palette[i % palette.length];
    const beam = createInternalBeam(col);
    beam.visible = false;
    internalRaysGroup.add(beam);
    internalBeams.push(beam);

    const pMesh = new THREE.Mesh(photonGeo, new THREE.MeshBasicMaterial({ color: col }));
    pMesh.visible = false;
    internalRaysGroup.add(pMesh);
    internalPhotons.push(pMesh);
  }

  // Local entrance point on the black pupil for ray k of totalCount
  function getLocalPupilEntrance(k, totalCount) {
    if (totalCount <= 1) return new THREE.Vector3(0, 0, eyeRadius);
    const fraction = k / (totalCount - 1);
    // Spans across the black pupil disk from top to bottom (y = +0.13 to -0.13)
    const y = 0.13 - fraction * 0.26;
    return new THREE.Vector3(0, y, eyeRadius);
  }

  // ==============================================================
  // 6. BRAIN'S REVERSE-TRACING LINES (WORLD SPACE GROUP)
  // Dashed lines extending backward from eye through the mirror
  // to the virtual image behind it
  // ==============================================================
  const reverseTraceGroup = new THREE.Group();
  reverseTraceGroup.name = 'reverseTraceGroup';
  reverseTraceGroup.visible = false;

  function makeDashedTraceLine(colorHex) {
    const geo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]);
    const mat = new THREE.LineDashedMaterial({
      color: colorHex,
      dashSize: 0.45,
      gapSize: 0.25,
      linewidth: 2.5,
      transparent: true,
      opacity: 0.95
    });
    return new THREE.Line(geo, mat);
  }

  const reverseTraceLines = [];
  for (let i = 0; i < MAX_RAYS; i++) {
    const line = makeDashedTraceLine(palette[i % palette.length]);
    line.visible = false;
    reverseTraceGroup.add(line);
    reverseTraceLines.push(line);
  }

  const revTraceLabel = makeSprite("← BRAIN'S REVERSE-TRACING", 'rgba(121, 40, 202, 0.9)', '#d8b4fe');
  revTraceLabel.scale.set(4.0, 0.9, 1);
  reverseTraceGroup.add(revTraceLabel);

  EyeGroup.reverseTraceGroup = reverseTraceGroup;

  // ==============================================================
  // 7. THE PUPIL ANCHOR & RETINA WORLD COORDINATES
  // ==============================================================
  EyeGroup.position.set(0, 2.5, -18.0);

  // Exact World Position of the black Pupil center: (0, 0, eyeRadius)
  EyeGroup.getPupilWorldPos = function () {
    EyeGroup.updateMatrixWorld(true);
    return new THREE.Vector3(0, 0, eyeRadius).applyMatrix4(EyeGroup.matrixWorld);
  };

  // World Position of ray entry point on the black pupil disk for ray k
  EyeGroup.getPupilEntranceWorld = function (k = 0, totalCount = 2) {
    EyeGroup.updateMatrixWorld(true);
    const localPoint = getLocalPupilEntrance(k, totalCount);
    return localPoint.applyMatrix4(EyeGroup.matrixWorld);
  };

  // Backward-compatibility aliases for other modules
  EyeGroup.getLensPointWorld = function (k = 0, totalCount = 2) {
    return this.getPupilEntranceWorld(k, totalCount);
  };

  EyeGroup.getLensEntrancePoint1 = function () {
    return this.getPupilEntranceWorld(0, 2);
  };

  EyeGroup.getLensEntrancePoint2 = function () {
    return this.getPupilEntranceWorld(1, 2);
  };

  // Exact World Position of the Retina Coordinate: (0, 0, -eyeRadius)
  EyeGroup.getRetinaWorldPos = function () {
    EyeGroup.updateMatrixWorld(true);
    return localRetinaPos.clone().applyMatrix4(EyeGroup.matrixWorld);
  };

  EyeGroup.getRetinaPointWorld = function () {
    return this.getRetinaWorldPos();
  };

  EyeGroup.getRetinaSpotWorld = function () {
    return this.getRetinaWorldPos();
  };

  EyeGroup.setTarget = function (targetVec) {
    if (!targetVec) return;
    this.lookAt(targetVec);
  };

  EyeGroup.setInBeamState = function (inBeam) {
    if (inBeam) {
      reticleMat.color.setHex(0x00f5d4);
      reticleMat.opacity = 0.9;
      gazeCone.material.opacity = 0.3;
      irisMat.emissiveIntensity = 0.9;
    } else {
      reticleMat.color.setHex(0xef4444);
      reticleMat.opacity = 0.4;
      gazeCone.material.opacity = 0.08;
      irisMat.emissiveIntensity = 0.3;
    }
  };

  // ==============================================================
  // 8. X-RAY MODE TOGGLE
  // When active: white sphere becomes 80% transparent (glass-like, opacity = 0.2)
  // User clearly sees black pupil catching rays and inner rays submerging
  // and converging onto the back of the retina
  // ==============================================================
  EyeGroup.setXRayMode = function (enabled) {
    isXRayMode = enabled;
    internalRaysGroup.visible = enabled;
    retinaGroup.visible = enabled;
    reverseTraceGroup.visible = enabled;

    if (enabled) {
      // White sphere becomes 80% transparent (glass-like)
      eyeballMat.transparent = true;
      eyeballMat.opacity = 0.20; // 80% transparent!
      eyeballMat.roughness = 0.05;
      eyeballMat.metalness = 0.1;
      eyeballMat.color.setHex(0xe0f7fa);
      gimbalGroup.visible = false;
    } else {
      // Opaque solid white eyeball
      eyeballMat.transparent = false;
      eyeballMat.opacity = 1.0;
      eyeballMat.roughness = 0.25;
      eyeballMat.metalness = 0.05;
      eyeballMat.color.setHex(0xffffff);
      gimbalGroup.visible = true;
    }
  };

  // ==============================================================
  // 9. ANIMATE INTERNAL SUBMERGING RAYS & REVERSE TRACING
  // ==============================================================
  EyeGroup.updateXRayAnimation = function (delta, opticsResult, rayCount = 2) {
    if (!isXRayMode) return;

    currentRayCount = Math.max(2, Math.min(MAX_RAYS, rayCount));
    xrayPhase = (xrayPhase + delta * 0.85) % 1.0;

    // 1. Update internal submerging lines from Pupil to Retina Coordinate
    for (let k = 0; k < MAX_RAYS; k++) {
      if (k < currentRayCount) {
        const localPupilPt = getLocalPupilEntrance(k, currentRayCount);
        internalBeams[k].visible = true;
        // From Pupil coordinate, travel through inside of sphere to Retina Coordinate
        internalBeams[k].updatePoints(localPupilPt, localRetinaPos);

        // Animated photon travelling along the internal ray
        internalPhotons[k].visible = true;
        const phaseK = (xrayPhase + k / currentRayCount) % 1.0;
        internalPhotons[k].position.lerpVectors(localPupilPt, localRetinaPos, phaseK);
      } else {
        internalBeams[k].visible = false;
        internalPhotons[k].visible = false;
      }
    }

    // 2. Pulse retina focal spot & halo
    const pulse = 0.9 + 0.3 * Math.sin(xrayPhase * Math.PI * 4);
    retinaDot.scale.setScalar(pulse);
    retinaHalo.scale.setScalar(pulse);

    // 3. Update Brain's reverse-tracing lines extending from retina/pupil to virtual image
    if (opticsResult) {
      const { v, hi } = opticsResult;
      const retinaWorld = this.getRetinaWorldPos();
      const virtTipWorld = new THREE.Vector3(0, hi, v);

      for (let k = 0; k < MAX_RAYS; k++) {
        if (k < currentRayCount) {
          const line = reverseTraceLines[k];
          line.visible = true;

          const pos = new Float32Array([
            retinaWorld.x, retinaWorld.y, retinaWorld.z,
            virtTipWorld.x, virtTipWorld.y, virtTipWorld.z
          ]);
          line.geometry.setAttribute('position', new THREE.BufferAttribute(pos, 3));
          line.geometry.attributes.position.needsUpdate = true;
          line.computeLineDistances();
        } else {
          reverseTraceLines[k].visible = false;
        }
      }

      const pupilWorld = this.getPupilWorldPos();
      const midPoint = new THREE.Vector3().lerpVectors(pupilWorld, virtTipWorld, 0.5);
      midPoint.y += 0.9;
      revTraceLabel.position.copy(midPoint);
    }
  };

  EyeGroup.getXRayMode = function () {
    return isXRayMode;
  };

  return EyeGroup;
};
