/**
 * 3D Scene Controller for Concave Mirror Simulation
 * Standardized Z-axis:
 * Optical axis runs along the Z-axis (from negative Z to positive Z).
 * Mirror at z = 0, Object & Eye on negative Z (in front of mirror),
 * Virtual Image on positive Z (behind mirror).
 */

window.createSceneController = function (canvasContainer, appState) {
  // 1. Scene
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x121212);
  scene.fog = new THREE.FogExp2(0x121212, 0.01);

  // 2. Camera: Isometric/3/4 perspective in front of the mirror on negative Z
  const camera = new THREE.PerspectiveCamera(
    45,
    canvasContainer.clientWidth / canvasContainer.clientHeight,
    0.1,
    200
  );
  camera.position.set(20, 12, -22);

  // 3. Renderer
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    powerPreference: 'high-performance'
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(canvasContainer.clientWidth, canvasContainer.clientHeight);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  canvasContainer.appendChild(renderer.domElement);

  // 4. OrbitControls
  const controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.06;
  controls.maxDistance = 80;
  controls.minDistance = 2;
  controls.target.set(0, 1, -5);

  // 5. Lighting
  const ambientLight = new THREE.AmbientLight(0x222436, 1.2);
  scene.add(ambientLight);

  const keyLight = new THREE.DirectionalLight(0xffffff, 1.5);
  keyLight.position.set(20, 25, -20);
  scene.add(keyLight);

  const fillLight = new THREE.DirectionalLight(0x00f5d4, 0.6);
  fillLight.position.set(-15, -10, 15);
  scene.add(fillLight);

  const mirrorLight = new THREE.PointLight(0xdff4ff, 2.0, 30);
  mirrorLight.position.set(8, 5, -8);
  scene.add(mirrorLight);

  // Eye focal spotlight for X-Ray mode
  const eyeSpotLight = new THREE.PointLight(0x00f5d4, 1.5, 10);
  eyeSpotLight.visible = false;
  scene.add(eyeSpotLight);

  // 6. Ground Studio Grid
  const gridHelper = new THREE.GridHelper(70, 70, 0x00f5d4, 0x1f2430);
  gridHelper.position.y = -6.5;
  gridHelper.material.transparent = true;
  gridHelper.material.opacity = 0.35;
  scene.add(gridHelper);

  // 7. Principal Optical Axis (Aligned along Z-axis)
  const axisGroup = new THREE.Group();
  axisGroup.name = 'opticalAxisGroup';

  const axisLength = 55;
  const axisGeo = new THREE.CylinderGeometry(0.04, 0.04, axisLength, 16);
  const axisMat = new THREE.MeshBasicMaterial({
    color: 0x475569,
    transparent: true,
    opacity: 0.8
  });
  const axisLine = new THREE.Mesh(axisGeo, axisMat);
  axisLine.rotation.x = Math.PI / 2; // aligns cylinder along Z-axis
  axisLine.position.set(0, 0, -5);
  axisGroup.add(axisLine);

  const axisGlowGeo = new THREE.CylinderGeometry(0.08, 0.08, axisLength, 8);
  const axisGlowMat = new THREE.MeshBasicMaterial({
    color: 0x00f5d4,
    transparent: true,
    opacity: 0.15
  });
  const axisGlow = new THREE.Mesh(axisGlowGeo, axisGlowMat);
  axisGlow.rotation.x = Math.PI / 2;
  axisGlow.position.copy(axisLine.position);
  axisGroup.add(axisGlow);

  function makeMarkerSprite(label, subtext, color = '#00f5d4') {
    const canvas = document.createElement('canvas');
    canvas.width = 256; canvas.height = 100;
    const ctx = canvas.getContext('2d');

    function draw(l, s) {
      ctx.clearRect(0, 0, 256, 100);
      ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(8, 8, 240, 84, 18);
      ctx.fill();
      ctx.stroke();

      ctx.font = 'bold 30px "JetBrains Mono", monospace';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.shadowColor = color;
      ctx.shadowBlur = 10;
      ctx.fillText(l, 128, 44);

      ctx.font = '18px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = color;
      ctx.shadowBlur = 0;
      ctx.fillText(s, 128, 74);
    }

    draw(label, subtext);

    const tex = new THREE.CanvasTexture(canvas);
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true }));
    sprite.scale.set(2.4, 0.95, 1);
    sprite.updateText = function (newLabel, newSubtext) {
      draw(newLabel, newSubtext);
      tex.needsUpdate = true;
    };
    return sprite;
  }

  // Focal Point F Marker (at z = -f)
  const fMarkerGroup = new THREE.Group();
  const fRingGeo = new THREE.TorusGeometry(0.35, 0.04, 16, 32);
  const fRingMat = new THREE.MeshBasicMaterial({ color: 0x39ff14 });
  const fRing = new THREE.Mesh(fRingGeo, fRingMat);
  // Encircles the Z-axis
  fMarkerGroup.add(fRing);

  const fSprite = makeMarkerSprite('F', 'Focus (-f)', '#39ff14');
  fSprite.position.set(0, -1.2, 0);
  fMarkerGroup.add(fSprite);

  // Focal Plane Grid
  const fPlaneGeo = new THREE.PlaneGeometry(12, 12, 12, 12);
  const fPlaneMat = new THREE.MeshBasicMaterial({
    color: 0x39ff14,
    wireframe: true,
    transparent: true,
    opacity: 0.1
  });
  const fPlane = new THREE.Mesh(fPlaneGeo, fPlaneMat);
  fPlane.visible = false;
  fMarkerGroup.add(fPlane);

  axisGroup.add(fMarkerGroup);

  // Center of Curvature C Marker (at z = -2f)
  const cMarkerGroup = new THREE.Group();
  const cRingGeo = new THREE.TorusGeometry(0.4, 0.04, 16, 32);
  const cRingMat = new THREE.MeshBasicMaterial({ color: 0xa855f7 });
  const cRing = new THREE.Mesh(cRingGeo, cRingMat);
  cMarkerGroup.add(cRing);

  const cSprite = makeMarkerSprite('C', 'Center (-2f)', '#a855f7');
  cSprite.position.set(0, -1.2, 0);
  cMarkerGroup.add(cSprite);
  axisGroup.add(cMarkerGroup);

  // Pole P Marker (Vertex at z = 0)
  const vSprite = makeMarkerSprite('P', 'Pole (0)', '#00f5d4');
  vSprite.position.set(0, -1.2, 0);
  axisGroup.add(vSprite);

  scene.add(axisGroup);

  // 8. Components Setup
  const mirror = window.createMirrorMesh(appState.focalLength, appState.apertureRadius);
  scene.add(mirror);

  const arrowSystem = window.createArrowSystem();
  scene.add(arrowSystem);

  const raySystem = window.createRaySystem();
  scene.add(raySystem);

  // Eye: createEyeMesh returns the procedural EyeGroup!
  const eyeMesh = window.createEyeMesh();
  scene.add(eyeMesh);
  if (eyeMesh.reverseTraceGroup) {
    scene.add(eyeMesh.reverseTraceGroup);
  }

  // Update Markers positions along Z (Negative Z-axis)
  function updateMarkers(f) {
    const fMag = Math.abs(f);
    fMarkerGroup.position.set(0, 0, -fMag);
    cMarkerGroup.position.set(0, 0, -2 * fMag);
    if (fSprite && fSprite.updateText) {
      fSprite.updateText('F', `Focus (${(-fMag).toFixed(1)})`);
    }
    if (cSprite && cSprite.updateText) {
      cSprite.updateText('C', `Center (${(-2 * fMag).toFixed(1)})`);
    }
  }
  updateMarkers(appState.focalLength);

  // Camera Animation Tween
  let cameraTween = null;

  function transitionCamera(targetPos, targetLookAt, duration = 800, onComplete = null) {
    const startPos = camera.position.clone();
    const startTarget = controls.target.clone();
    const startTime = performance.now();

    cameraTween = {
      update(now) {
        const elapsed = now - startTime;
        const t = Math.min(1.0, elapsed / duration);
        const ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

        camera.position.lerpVectors(startPos, targetPos, ease);
        controls.target.lerpVectors(startTarget, targetLookAt, ease);
        controls.update();

        if (t >= 1.0) {
          cameraTween = null;
          if (onComplete) onComplete();
        }
      }
    };
  }

  // Camera View Presets
  function setView(viewType) {
    if (window.soundFX) window.soundFX.playClick();
    switch (viewType) {
      case 'perspective':
        transitionCamera(new THREE.Vector3(20, 12, -22), new THREE.Vector3(0, 1, -5));
        break;
      case 'side':
        transitionCamera(new THREE.Vector3(28, 2, -8), new THREE.Vector3(0, 2, -8));
        break;
      case 'top':
        transitionCamera(new THREE.Vector3(0, 32, -8), new THREE.Vector3(0, 0, -8));
        break;
      case 'closeup':
        transitionCamera(new THREE.Vector3(7, 3, -5), new THREE.Vector3(0, 0, 0));
        break;
    }
  }

  // Shift camera to side-profile view of the Eye object for X-Ray Mode
  function enterXRayView(eyePos) {
    eyeSpotLight.visible = true;
    eyeSpotLight.position.set(eyePos.x, eyePos.y + 2, eyePos.z + 2);

    // Target is exactly the eye center
    const target = eyePos.clone();
    // Offset camera laterally along X for a clean side-profile perspective of the eyeball
    const sidePos = new THREE.Vector3(
      eyePos.x + 4.8,
      eyePos.y + 0.3,
      eyePos.z + 0.8
    );

    transitionCamera(sidePos, target, 900);
  }

  function exitXRayView() {
    eyeSpotLight.visible = false;
    transitionCamera(new THREE.Vector3(20, 12, -22), new THREE.Vector3(0, 1, -5), 800);
  }

  // Dynamic 100vw / 100vh Resize Handler with orientation change support
  function handleResize() {
    const width = window.innerWidth || canvasContainer.clientWidth;
    const height = window.innerHeight || canvasContainer.clientHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  }
  window.addEventListener('resize', handleResize);

  return {
    scene,
    camera,
    renderer,
    controls,
    mirror,
    arrowSystem,
    raySystem,
    eyeMesh,
    updateMarkers,
    setView,
    enterXRayView,
    exitXRayView,
    updateTween: (now) => {
      if (cameraTween) cameraTween.update(now);
    },
    setFocalPlaneVisible: (visible) => { fPlane.visible = visible; },
    resize: handleResize
  };
};
