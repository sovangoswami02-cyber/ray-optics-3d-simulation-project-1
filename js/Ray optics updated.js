/**
 * Main Application Controller
 * Coordinates UI, 3D Scene, Optics Calculations, Sound, User Interactions,
 * Dynamic Eye Tracking, Simplified Textbook Rays, X-Ray Misconception Physics,
 * Full UI Panel Minimization, and Mobile Touch Events.
 */

window.addEventListener('DOMContentLoaded', () => {
  // Application State
  const appState = {
    focalLength: 10.0,
    objectDistance: 16.0,
    objectHeight: 3.5,
    apertureRadius: 6.5,
    rayCount: 2, // 2 to 20 rays (Customizable Multiple Rays)
    mode: 'basic', // 'basic' | 'advanced'
    isFrozen: false,
    soundEnabled: true,
    forceRevealVirtual: false,
    xRayUnlocked: false,
    xRayActive: false,
    optics: null
  };

  // DOM Elements - Navigation & Modes
  const tabBasic = document.getElementById('tab-basic');
  const tabAdvanced = document.getElementById('tab-advanced');
  const panelBasic = document.getElementById('panel-basic');
  const panelAdvanced = document.getElementById('panel-advanced');
  const btnSound = document.getElementById('btn-sound');
  const soundIcon = document.getElementById('sound-icon');
  const btnScreenshot = document.getElementById('btn-screenshot');
  const btnReset = document.getElementById('btn-reset');
  const btnTheoryModal = document.getElementById('btn-theory-modal');
  const theoryModal = document.getElementById('theory-modal');
  const btnCloseTheory = document.getElementById('btn-close-theory');

  // DOM Elements - UI Panel Minimization & Expand
  const controlsPanel = document.getElementById('controls-panel');
  const btnMinimizeControls = document.getElementById('btn-minimize-controls');
  const btnExpandControls = document.getElementById('btn-expand-controls');

  const pipContainer = document.getElementById('pip-container');
  const btnMinimizePip = document.getElementById('btn-minimize-pip');
  const btnExpandPip = document.getElementById('btn-expand-pip');

  const xrayInfoCard = document.getElementById('xray-info-card');
  const btnMinimizeXray = document.getElementById('btn-minimize-xray');
  const btnExpandXray = document.getElementById('btn-expand-xray');
  const btnCloseXRay = document.getElementById('btn-close-xray');

  const quizModal = document.getElementById('quiz-modal');
  const btnMinimizeQuiz = document.getElementById('btn-minimize-quiz');
  const btnMinimizeQuizExp = document.getElementById('btn-minimize-quiz-exp');
  const btnExpandQuiz = document.getElementById('btn-expand-quiz');

  const btnMinimizeTheory = document.getElementById('btn-minimize-theory');
  const btnExpandTheory = document.getElementById('btn-expand-theory');

  // DOM Elements - X-Ray Mode
  const btnXRayToggle = document.getElementById('btn-xray-toggle');
  const xrayIcon = document.getElementById('xray-icon');
  const xrayTooltip = document.getElementById('xray-tooltip');

  // DOM Elements - Basic Mode
  const sliderObjDistBasic = document.getElementById('slider-obj-dist-basic');
  const valObjDistBasic = document.getElementById('val-obj-dist-basic');
  const presetBeyondC = document.getElementById('preset-beyond-c');
  const presetAtC = document.getElementById('preset-at-c');
  const presetBetweenCF = document.getElementById('preset-between-cf');
  const presetAtF = document.getElementById('preset-at-f');
  const presetVirtual = document.getElementById('preset-virtual');

  // DOM Elements - Image Stats Cards
  const badgeImageType = document.getElementById('badge-image-type');
  const badgeOrientation = document.getElementById('badge-orientation');
  const badgeSize = document.getElementById('badge-size');
  const textImageDist = document.getElementById('text-image-dist');
  const textMagnification = document.getElementById('text-magnification');

  // DOM Elements - Advanced Mode
  const inputFocalDist = document.getElementById('input-focal-dist');
  const sliderFocalDist = document.getElementById('slider-focal-dist');
  const textCurvatureRadius = document.getElementById('text-curvature-radius');

  const inputObjDistAdv = document.getElementById('input-obj-dist-adv');
  const sliderObjDistAdv = document.getElementById('slider-obj-dist-adv');

  const inputObjHeight = document.getElementById('input-obj-height');
  const sliderObjHeight = document.getElementById('slider-obj-height');

  const toggleRay1 = document.getElementById('toggle-ray1');
  const toggleRay2 = document.getElementById('toggle-ray2');
  const toggleVirtualRays = document.getElementById('toggle-virtual-rays');
  const toggleNormals = document.getElementById('toggle-normals');
  const togglePhotons = document.getElementById('toggle-photons');

  // Ray Count Slider (Customizable Multiple Rays)
  const sliderRayCount = document.getElementById('slider-ray-count');
  const valRayCount = document.getElementById('val-ray-count');

  // Math display in Advanced Mode
  const mathFormulaDi = document.getElementById('math-formula-di');
  const mathFormulaM = document.getElementById('math-formula-m');

  // Eye Control Sliders
  const eyeSliderX = document.getElementById('eye-slider-x');
  const eyeSliderY = document.getElementById('eye-slider-y');
  const eyeSliderZ = document.getElementById('eye-slider-z');
  const pipSnapBtn = document.getElementById('pip-snap-btn');

  // Initialize 3D Scene
  const canvasContainer = document.getElementById('canvas-container');
  const sceneCtrl = window.createSceneController(canvasContainer, appState);

  // Initialize PiP System
  const pipCtrl = window.createPipSystem(sceneCtrl.scene, sceneCtrl.renderer);

  // ==============================================================
  // UI PANEL MINIMIZATION / EXPAND CONTROLLERS
  // ==============================================================

  // 1. Controls Panel
  if (btnMinimizeControls && btnExpandControls && controlsPanel) {
    btnMinimizeControls.addEventListener('click', () => {
      controlsPanel.classList.add('hidden');
      btnExpandControls.classList.remove('hidden');
      if (window.soundFX) window.soundFX.playClick();
    });
    btnExpandControls.addEventListener('click', () => {
      controlsPanel.classList.remove('hidden');
      btnExpandControls.classList.add('hidden');
      if (window.soundFX) window.soundFX.playClick();
    });
  }

  // 2. PiP Window
  if (btnMinimizePip && btnExpandPip && pipContainer) {
    btnMinimizePip.addEventListener('click', () => {
      pipContainer.classList.add('hidden');
      btnExpandPip.classList.remove('hidden');
      if (window.soundFX) window.soundFX.playClick();
    });
    btnExpandPip.addEventListener('click', () => {
      pipContainer.classList.remove('hidden');
      btnExpandPip.classList.add('hidden');
      if (window.soundFX) window.soundFX.playClick();
    });
  }

  // 3. X-Ray Info Card
  if (btnMinimizeXray && btnExpandXray && xrayInfoCard) {
    btnMinimizeXray.addEventListener('click', () => {
      xrayInfoCard.classList.add('hidden');
      btnExpandXray.classList.remove('hidden');
      if (window.soundFX) window.soundFX.playClick();
    });
    btnExpandXray.addEventListener('click', () => {
      xrayInfoCard.classList.remove('hidden');
      btnExpandXray.classList.add('hidden');
      if (window.soundFX) window.soundFX.playClick();
    });
  }

  // 4. Mystery Quiz Modal
  function minimizeQuizModal() {
    if (quizModal) quizModal.classList.add('hidden');
    canvasContainer.classList.remove('filter', 'blur-md', 'scale-98');
    if (btnExpandQuiz) btnExpandQuiz.classList.remove('hidden');
    if (window.soundFX) window.soundFX.playClick();
  }

  if (btnMinimizeQuiz) btnMinimizeQuiz.addEventListener('click', minimizeQuizModal);
  if (btnMinimizeQuizExp) btnMinimizeQuizExp.addEventListener('click', minimizeQuizModal);
  if (btnExpandQuiz) {
    btnExpandQuiz.addEventListener('click', () => {
      if (quizModal) quizModal.classList.remove('hidden');
      canvasContainer.classList.add('filter', 'blur-md', 'scale-98');
      btnExpandQuiz.classList.add('hidden');
      if (window.soundFX) window.soundFX.playClick();
    });
  }

  // 5. Theory Modal
  if (btnMinimizeTheory && btnExpandTheory && theoryModal) {
    btnMinimizeTheory.addEventListener('click', () => {
      theoryModal.classList.add('hidden');
      btnExpandTheory.classList.remove('hidden');
      if (window.soundFX) window.soundFX.playClick();
    });
    btnExpandTheory.addEventListener('click', () => {
      theoryModal.classList.remove('hidden');
      btnExpandTheory.classList.add('hidden');
      if (window.soundFX) window.soundFX.playClick();
    });
  }

  // ==============================================================
  // X-RAY MODE CONTROLLER
  // ==============================================================

  function unlockXRayMode() {
    if (appState.xRayUnlocked) return;
    appState.xRayUnlocked = true;

    if (btnXRayToggle) {
      btnXRayToggle.className = 'px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl glass-panel text-xs font-mono font-bold text-cyan-300 border border-cyan-400/60 shadow-[0_0_20px_rgba(0,245,212,0.4)] cursor-pointer transition-all hover:scale-105 flex items-center gap-1.5 opacity-100 animate-pulse';
      if (xrayIcon) xrayIcon.textContent = '🩻';
      if (xrayTooltip) xrayTooltip.textContent = 'Toggle Eye Anatomy X-Ray Mode';
    }
  }

  function toggleXRayMode(forceState) {
    if (!appState.xRayUnlocked) {
      if (window.soundFX) window.soundFX.playClick();
      alert('🔒 Discover the virtual image first! Move the neon arrow inside the focal point (do < f) to unlock X-Ray Mode.');
      return;
    }

    const nextState = (forceState !== undefined) ? forceState : !appState.xRayActive;
    appState.xRayActive = nextState;

    if (nextState) {
      sceneCtrl.eyeMesh.setXRayMode(true);
      sceneCtrl.enterXRayView(sceneCtrl.eyeMesh.position);

      // Target virtual image coordinates and update mirror-to-lens rays
      const target = getImageTarget(appState.optics);
      sceneCtrl.eyeMesh.lookAt(target);

      if (appState.optics) {
        const raysData = Optics.calculateMultipleRays(appState.optics, appState.rayCount, appState.apertureRadius);
        sceneCtrl.raySystem.updateRays(
          raysData,
          appState.optics.isVirtual,
          appState.forceRevealVirtual,
          sceneCtrl.eyeMesh,
          true
        );
      }

      if (xrayInfoCard) {
        xrayInfoCard.classList.remove('hidden');
        if (btnExpandXray) btnExpandXray.classList.add('hidden');
      }

      if (btnXRayToggle) {
        btnXRayToggle.classList.add('bg-cyan-500/30', 'text-white', 'border-cyan-300');
      }

      if (window.soundFX) window.soundFX.playRevealSound();
    } else {
      sceneCtrl.eyeMesh.setXRayMode(false);
      sceneCtrl.exitXRayView();

      if (appState.optics) {
        const raysData = Optics.calculateMultipleRays(appState.optics, appState.rayCount, appState.apertureRadius);
        sceneCtrl.raySystem.updateRays(
          raysData,
          appState.optics.isVirtual,
          appState.forceRevealVirtual,
          sceneCtrl.eyeMesh,
          false
        );
      }

      if (xrayInfoCard) xrayInfoCard.classList.add('hidden');
      if (btnExpandXray) btnExpandXray.classList.add('hidden');

      if (btnXRayToggle) {
        btnXRayToggle.classList.remove('bg-cyan-500/30', 'text-white', 'border-cyan-300');
      }

      if (window.soundFX) window.soundFX.playClick();
    }
  }

  if (btnXRayToggle) btnXRayToggle.addEventListener('click', () => toggleXRayMode());
  if (btnCloseXRay) btnCloseXRay.addEventListener('click', () => toggleXRayMode(false));

  // Initialize Quiz Controller
  const quizCtrl = window.createQuizController(
    appState,
    () => {
      appState.forceRevealVirtual = true;
      sceneCtrl.raySystem.setToggle('virtualRays', true);
      if (toggleVirtualRays) toggleVirtualRays.checked = true;
      unlockXRayMode();
      updateSimulation();
    },
    () => {
      if (btnExpandQuiz) btnExpandQuiz.classList.add('hidden');
      updateSimulation();
    },
    () => {
      unlockXRayMode();
    },
    () => {
      unlockXRayMode();
      toggleXRayMode(true);
    }
  );

  // Helper: compute active image target for dynamic eye tracking
  // In the render loop, call lookAt(virtualImagePosition) on the Group, NOT the mesh.
  // Lock the Virtual Image to exactly this v coordinate and Image Height.
  // If v is positive, it is behind the mirror.
  function getImageTarget(opticsResult) {
    if (!opticsResult) return new THREE.Vector3(0, 3.5, 16);
    if (opticsResult.isAtFocus) {
      return new THREE.Vector3(0, 0, 0); // look towards mirror pole
    }
    // Strict Cartesian image coordinates: (0, ImageHeight, v)
    return new THREE.Vector3(0, opticsResult.hi, opticsResult.v);
  }

  // Update All Optics Calculations & 3D Elements
  function updateSimulation() {
    const opticsResult = Optics.calculateImage(
      appState.focalLength,
      appState.objectDistance,
      appState.objectHeight
    );
    appState.optics = opticsResult;

    // Check virtual zone trigger
    quizCtrl.checkVirtualZoneTrigger(appState.objectDistance, appState.focalLength);

    if (opticsResult.isVirtual) {
      unlockXRayMode();
    }

    // Update 3D Markers & Mirror along Z-axis
    sceneCtrl.updateMarkers(appState.focalLength);

    // Update 3D Arrows along Z-axis
    sceneCtrl.arrowSystem.updateArrows(opticsResult);

    // Update Dynamic Multiple Rays (2 to 20 rays)
    const raysData = Optics.calculateMultipleRays(
      opticsResult,
      appState.rayCount,
      appState.apertureRadius
    );
    sceneCtrl.raySystem.updateRays(
      raysData,
      opticsResult.isVirtual,
      appState.forceRevealVirtual,
      sceneCtrl.eyeMesh,
      appState.xRayActive
    );

    // Dynamic Eye Tracking: lock pupil onto the Virtual Image position
    // Call lookAt on the Group, NOT the mesh!
    const imageTarget = getImageTarget(opticsResult);
    sceneCtrl.eyeMesh.lookAt(imageTarget);

    // Update UI Stats & Math
    updateUIStats(opticsResult);
    updateMathFormulas(opticsResult);
  }

  // Update UI Stats Cards
  function updateUIStats(res) {
    if (res.isAtFocus) {
      badgeImageType.className = 'px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40';
      badgeImageType.textContent = 'AT INFINITY';

      badgeOrientation.className = 'px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-neutral-800 text-neutral-400 border border-neutral-700';
      badgeOrientation.textContent = 'PARALLEL RAYS';

      badgeSize.className = 'px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-neutral-800 text-neutral-400 border border-neutral-700';
      badgeSize.textContent = 'INFINITE';

      textImageDist.textContent = '∞ (Parallel)';
      textMagnification.textContent = 'Undefined';
      return;
    }

    if (res.isVirtual) {
      badgeImageType.className = 'px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-[0_0_12px_rgba(168,85,247,0.3)] animate-pulse';
      badgeImageType.textContent = '✨ VIRTUAL';

      badgeOrientation.className = 'px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40';
      badgeOrientation.textContent = '↑ UPRIGHT';
    } else {
      badgeImageType.className = 'px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-pink-500/20 text-pink-300 border border-pink-500/40 shadow-[0_0_12px_rgba(255,0,127,0.3)]';
      badgeImageType.textContent = '● REAL';

      badgeOrientation.className = 'px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40';
      badgeOrientation.textContent = '↓ INVERTED';
    }

    if (res.sizeCategory === 'magnified') {
      badgeSize.className = 'px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40';
      badgeSize.textContent = 'MAGNIFIED';
    } else if (res.sizeCategory === 'diminished') {
      badgeSize.className = 'px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-blue-500/20 text-blue-300 border border-blue-500/40';
      badgeSize.textContent = 'DIMINISHED';
    } else {
      badgeSize.className = 'px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-neutral-700/50 text-neutral-300 border border-neutral-600';
      badgeSize.textContent = 'SAME SIZE';
    }

    textImageDist.textContent = `v = ${res.v > 0 ? '+' : ''}${res.v.toFixed(1)} cm`;
    textMagnification.textContent = `${res.m > 0 ? '+' : ''}${res.m.toFixed(2)}x`;
  }

  // Update Math Formulas in Advanced Mode
  function updateMathFormulas(res) {
    if (!mathFormulaDi || !mathFormulaM) return;

    if (res.isAtFocus) {
      mathFormulaDi.innerHTML = `
        <div class="text-xs text-neutral-400 mb-1">Mirror Formula: \\(v = \\frac{u \\cdot f}{u - f}\\)</div>
        <div class="text-xs sm:text-sm font-mono text-cyan-300">
          u = ${res.u.toFixed(1)} cm, f = ${res.f.toFixed(1)} cm 
          &nbsp;&rarr;&nbsp; 
          <span class="text-white font-bold">u - f = 0 &implies; v = &infin; (Parallel Rays)</span>
        </div>
      `;
      mathFormulaM.innerHTML = `
        <div class="text-xs text-neutral-400 mb-1">Magnification: \\(m = -\\frac{v}{u}\\)</div>
        <div class="text-xs sm:text-sm font-mono text-pink-300">
          m = -(&infin; / ${res.u.toFixed(1)}) = <span class="text-white font-bold">&infin; (Undefined)</span>
        </div>
      `;
    } else {
      mathFormulaDi.innerHTML = `
        <div class="text-xs text-neutral-400 mb-1">Exact Mirror Formula: \\(v = \\frac{u \\cdot f}{u - f}\\)</div>
        <div class="text-xs sm:text-sm font-mono text-cyan-300">
          u = ${res.u.toFixed(1)} cm, f = ${res.f.toFixed(1)} cm 
          &nbsp;&rarr;&nbsp; 
          <span class="text-white font-bold">v = ${res.v > 0 ? '+' : ''}${res.v.toFixed(2)} cm</span> 
          <span class="text-xs ${res.v > 0 ? 'text-purple-400 font-semibold' : 'text-pink-400 font-semibold'}">(${res.v > 0 ? 'behind mirror, z > 0' : 'in front of mirror, z < 0'})</span>
        </div>
      `;

      mathFormulaM.innerHTML = `
        <div class="text-xs text-neutral-400 mb-1">Magnification: \\(m = -\\frac{v}{u}\\), &nbsp; \\(\\text{Image Height} = H \\cdot m\\)</div>
        <div class="text-xs sm:text-sm font-mono text-pink-300">
          m = -(${res.v > 0 ? '+' : ''}${res.v.toFixed(2)} / ${res.u.toFixed(1)}) = <span class="text-white font-bold">${res.m > 0 ? '+' : ''}${res.m.toFixed(2)}&times;</span>, 
          &nbsp;&rarr;&nbsp; 
          <span class="text-white font-bold">Image Height = ${res.hi > 0 ? '+' : ''}${res.hi.toFixed(2)} cm</span>
        </div>
      `;
    }
  }

  // Sync Input Handlers for Object Distance
  function setObjectDistance(newDo, playSwoosh = true) {
    appState.objectDistance = Math.max(1.5, Math.min(30.0, parseFloat(newDo)));
    if (sliderObjDistBasic) sliderObjDistBasic.value = appState.objectDistance;
    if (valObjDistBasic) valObjDistBasic.textContent = `${appState.objectDistance.toFixed(1)} cm`;
    if (sliderObjDistAdv) sliderObjDistAdv.value = appState.objectDistance;
    if (inputObjDistAdv) inputObjDistAdv.value = appState.objectDistance.toFixed(1);

    if (playSwoosh && window.soundFX) {
      window.soundFX.playLaserSwoosh(400 + appState.objectDistance * 20);
    }
    updateSimulation();
  }

  if (sliderObjDistBasic) {
    sliderObjDistBasic.addEventListener('input', (e) => setObjectDistance(e.target.value, false));
  }
  if (sliderObjDistAdv) {
    sliderObjDistAdv.addEventListener('input', (e) => setObjectDistance(e.target.value, false));
  }
  if (inputObjDistAdv) {
    inputObjDistAdv.addEventListener('change', (e) => setObjectDistance(e.target.value, true));
  }

  function setFocalLength(newF) {
    appState.focalLength = Math.max(4.0, Math.min(20.0, parseFloat(newF)));
    if (sliderFocalDist) sliderFocalDist.value = appState.focalLength;
    if (inputFocalDist) inputFocalDist.value = appState.focalLength.toFixed(1);
    if (textCurvatureRadius) textCurvatureRadius.textContent = `${(appState.focalLength * 2).toFixed(1)} cm`;

    sceneCtrl.mirror.updateCurvature(appState.focalLength, appState.apertureRadius);
    if (window.soundFX) window.soundFX.playClick();
    updateSimulation();
  }

  if (sliderFocalDist) sliderFocalDist.addEventListener('input', (e) => setFocalLength(e.target.value));
  if (inputFocalDist) inputFocalDist.addEventListener('change', (e) => setFocalLength(e.target.value));

  function setObjectHeight(newHo) {
    appState.objectHeight = Math.max(1.0, Math.min(6.0, parseFloat(newHo)));
    if (sliderObjHeight) sliderObjHeight.value = appState.objectHeight;
    if (inputObjHeight) inputObjHeight.value = appState.objectHeight.toFixed(1);
    updateSimulation();
  }

  if (sliderObjHeight) sliderObjHeight.addEventListener('input', (e) => setObjectHeight(e.target.value));
  if (inputObjHeight) inputObjHeight.addEventListener('change', (e) => setObjectHeight(e.target.value));

  // Quick Preset Buttons
  if (presetBeyondC) presetBeyondC.addEventListener('click', () => setObjectDistance(appState.focalLength * 2.5));
  if (presetAtC) presetAtC.addEventListener('click', () => setObjectDistance(appState.focalLength * 2.0));
  if (presetBetweenCF) presetBetweenCF.addEventListener('click', () => setObjectDistance(appState.focalLength * 1.5));
  if (presetAtF) presetAtF.addEventListener('click', () => setObjectDistance(appState.focalLength * 1.0));
  if (presetVirtual) presetVirtual.addEventListener('click', () => setObjectDistance(appState.focalLength * 0.55));

  // Mode Tabs Switching
  if (tabBasic && tabAdvanced) {
    tabBasic.addEventListener('click', () => {
      appState.mode = 'basic';
      tabBasic.className = 'flex-1 py-1.5 sm:py-2 text-center text-xs font-mono font-bold tracking-wider rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_15px_rgba(0,245,212,0.25)] transition-all';
      tabAdvanced.className = 'flex-1 py-1.5 sm:py-2 text-center text-xs font-mono font-medium tracking-wider rounded-xl text-neutral-400 hover:text-white transition-all';
      panelBasic.classList.remove('hidden');
      panelAdvanced.classList.add('hidden');
      if (window.soundFX) window.soundFX.playClick();
    });

    tabAdvanced.addEventListener('click', () => {
      appState.mode = 'advanced';
      tabAdvanced.className = 'flex-1 py-1.5 sm:py-2 text-center text-xs font-mono font-bold tracking-wider rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-[0_0_15px_rgba(121,40,202,0.25)] transition-all';
      tabBasic.className = 'flex-1 py-1.5 sm:py-2 text-center text-xs font-mono font-medium tracking-wider rounded-xl text-neutral-400 hover:text-white transition-all';
      panelAdvanced.classList.remove('hidden');
      panelBasic.classList.add('hidden');
      if (window.soundFX) window.soundFX.playClick();
    });
  }

  // Ray Diagram Toggles: Strictly Ray 1 & Ray 2
  function bindToggle(elem, key, onToggleExtra) {
    if (!elem) return;
    elem.addEventListener('change', (e) => {
      sceneCtrl.raySystem.setToggle(key, e.target.checked);
      if (onToggleExtra) onToggleExtra(e.target.checked);
      if (window.soundFX) window.soundFX.playClick();
      updateSimulation();
    });
  }

  bindToggle(toggleRay1, 'ray1');
  bindToggle(toggleRay2, 'ray2');
  bindToggle(toggleVirtualRays, 'virtualRays');
  bindToggle(toggleNormals, 'normals');
  bindToggle(togglePhotons, 'photons');

  // Dynamic Ray Count Slider Listener
  if (sliderRayCount) {
    sliderRayCount.addEventListener('input', (e) => {
      appState.rayCount = parseInt(e.target.value, 10);
      if (valRayCount) valRayCount.textContent = appState.rayCount;
      if (window.soundFX) window.soundFX.playClick();
      updateSimulation();
    });
  }

  // Eye Position Sliders
  function updateEyePositionFromSliders() {
    const x = parseFloat(eyeSliderX.value);
    const y = parseFloat(eyeSliderY.value);
    const z = parseFloat(eyeSliderZ.value);
    sceneCtrl.eyeMesh.position.set(x, y, z);
    const target = getImageTarget(appState.optics);
    sceneCtrl.eyeMesh.lookAt(target);
  }

  if (eyeSliderX) eyeSliderX.addEventListener('input', updateEyePositionFromSliders);
  if (eyeSliderY) eyeSliderY.addEventListener('input', updateEyePositionFromSliders);
  if (eyeSliderZ) eyeSliderZ.addEventListener('input', updateEyePositionFromSliders);

  // Snap Eye into Reflected Beam Button
  if (pipSnapBtn) {
    pipSnapBtn.addEventListener('click', () => {
      pipCtrl.snapEyeIntoBeam(appState.optics, sceneCtrl.eyeMesh, (targetPos) => {
        const startPos = sceneCtrl.eyeMesh.position.clone();
        const duration = 400;
        const startTime = performance.now();

        function animateSnap(now) {
          const elapsed = now - startTime;
          const t = Math.min(1, elapsed / duration);
          const ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

          sceneCtrl.eyeMesh.position.lerpVectors(startPos, targetPos, ease);
          const target = getImageTarget(appState.optics);
          sceneCtrl.eyeMesh.lookAt(target);

          if (eyeSliderX) eyeSliderX.value = sceneCtrl.eyeMesh.position.x;
          if (eyeSliderY) eyeSliderY.value = sceneCtrl.eyeMesh.position.y;
          if (eyeSliderZ) eyeSliderZ.value = sceneCtrl.eyeMesh.position.z;

          if (t < 1) {
            requestAnimationFrame(animateSnap);
          }
        }
        requestAnimationFrame(animateSnap);
      });
    });
  }

  // View Presets
  document.querySelectorAll('[data-view]').forEach((btn) => {
    btn.addEventListener('click', () => {
      if (appState.xRayActive) {
        toggleXRayMode(false);
      }
      sceneCtrl.setView(btn.dataset.view);
    });
  });

  // Sound FX Toggle
  if (btnSound) {
    btnSound.addEventListener('click', () => {
      appState.soundEnabled = window.soundFX.toggle();
      if (appState.soundEnabled) {
        soundIcon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />';
        btnSound.className = 'p-2 sm:p-2.5 rounded-xl glass-panel text-cyan-400 hover:text-white transition-all';
      } else {
        soundIcon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z m11.414-4l4 4m0-4l-4 4" />';
        btnSound.className = 'p-2 sm:p-2.5 rounded-xl glass-panel text-neutral-500 hover:text-white transition-all';
      }
    });
  }

  // Screenshot Capture Button
  if (btnScreenshot) {
    btnScreenshot.addEventListener('click', () => {
      if (window.soundFX) window.soundFX.playClick();
      sceneCtrl.renderer.render(sceneCtrl.scene, sceneCtrl.camera);
      const dataUrl = sceneCtrl.renderer.domElement.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `concave-mirror-optics-${Date.now()}.png`;
      a.click();
    });
  }

  // Reset Simulation Button
  if (btnReset) {
    btnReset.addEventListener('click', () => {
      if (appState.xRayActive) {
        toggleXRayMode(false);
      }
      appState.focalLength = 10.0;
      appState.objectHeight = 3.5;
      appState.rayCount = 2;
      if (sliderRayCount) sliderRayCount.value = 2;
      if (valRayCount) valRayCount.textContent = 2;
      appState.forceRevealVirtual = false;
      quizCtrl.resetTrigger();
      setObjectDistance(16.0);
      sceneCtrl.setView('perspective');
      sceneCtrl.eyeMesh.position.set(0, 2.5, -18.0);
      const target = getImageTarget(appState.optics);
      sceneCtrl.eyeMesh.lookAt(target);
      if (window.soundFX) window.soundFX.playClick();
    });
  }

  // Optics Theory Modal Open / Close
  if (btnTheoryModal && theoryModal && btnCloseTheory) {
    btnTheoryModal.addEventListener('click', () => {
      theoryModal.classList.remove('hidden');
      if (btnExpandTheory) btnExpandTheory.classList.add('hidden');
      if (window.soundFX) window.soundFX.playClick();
    });
    btnCloseTheory.addEventListener('click', () => {
      theoryModal.classList.add('hidden');
      if (btnExpandTheory) btnExpandTheory.classList.add('hidden');
      if (window.soundFX) window.soundFX.playClick();
    });
  }

  // ==============================================================
  // 3D DIRECT DRAG INTERACTION (Desktop Mouse & Mobile Touch Support)
  // ==============================================================
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  const dragPlane = new THREE.Plane();
  const planeIntersect = new THREE.Vector3();
  let draggedObject = null; // 'arrow' | 'eye' | null
  let activeTouchId = null;

  function updateNormalizedCoords(clientX, clientY) {
    const rect = canvasContainer.getBoundingClientRect();
    mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((clientY - rect.top) / rect.height) * 2 + 1;
  }

  function handleDragStart(clientX, clientY) {
    if (appState.isFrozen || appState.xRayActive) return false;
    updateNormalizedCoords(clientX, clientY);
    raycaster.setFromCamera(mouse, sceneCtrl.camera);

    // Hit test object arrow
    const arrowObj = sceneCtrl.arrowSystem.getObjectByName('objectArrow');
    if (arrowObj) {
      const arrowHits = raycaster.intersectObjects(arrowObj.children, true);
      if (arrowHits.length > 0) {
        draggedObject = 'arrow';
        sceneCtrl.controls.enabled = false;
        // Drag plane facing X so movement is along Z-axis
        dragPlane.setFromNormalAndCoplanarPoint(new THREE.Vector3(1, 0, 0), arrowObj.position);
        canvasContainer.style.cursor = 'ew-resize';
        return true;
      }
    }

    // Hit test eye mesh
    if (sceneCtrl.eyeMesh) {
      const eyeHits = raycaster.intersectObjects(sceneCtrl.eyeMesh.children, true);
      if (eyeHits.length > 0) {
        draggedObject = 'eye';
        sceneCtrl.controls.enabled = false;
        const normal = new THREE.Vector3().subVectors(sceneCtrl.camera.position, sceneCtrl.eyeMesh.position).normalize();
        dragPlane.setFromNormalAndCoplanarPoint(normal, sceneCtrl.eyeMesh.position);
        canvasContainer.style.cursor = 'move';
        return true;
      }
    }
    return false;
  }

  function handleDragMove(clientX, clientY) {
    if (!draggedObject) return;
    updateNormalizedCoords(clientX, clientY);
    raycaster.setFromCamera(mouse, sceneCtrl.camera);

    if (raycaster.ray.intersectPlane(dragPlane, planeIntersect)) {
      if (draggedObject === 'arrow') {
        // Object distance along Z-axis (negative Z): do = -planeIntersect.z
        const newDo = Math.max(1.5, Math.min(30.0, -planeIntersect.z));
        setObjectDistance(newDo, false);
      } else if (draggedObject === 'eye') {
        sceneCtrl.eyeMesh.position.copy(planeIntersect);
        sceneCtrl.eyeMesh.position.z = Math.min(-2.0, Math.max(-30.0, sceneCtrl.eyeMesh.position.z));

        // Dynamic tracking while dragging eye
        const target = getImageTarget(appState.optics);
        sceneCtrl.eyeMesh.lookAt(target);

        if (eyeSliderX) eyeSliderX.value = sceneCtrl.eyeMesh.position.x;
        if (eyeSliderY) eyeSliderY.value = sceneCtrl.eyeMesh.position.y;
        if (eyeSliderZ) eyeSliderZ.value = sceneCtrl.eyeMesh.position.z;
      }
    }
  }

  function handleDragEnd() {
    if (draggedObject) {
      draggedObject = null;
      sceneCtrl.controls.enabled = true;
      canvasContainer.style.cursor = 'default';
      activeTouchId = null;
      if (window.soundFX) window.soundFX.playClick();
    }
  }

  // Pointer Events (covers Mouse, Pen, and unified pointers)
  canvasContainer.addEventListener('pointerdown', (e) => {
    if (e.pointerType === 'touch') return; // Handled by touch events for fine-tuned smartphone gestures
    if (handleDragStart(e.clientX, e.clientY)) {
      canvasContainer.setPointerCapture(e.pointerId);
    }
  });

  window.addEventListener('pointermove', (e) => {
    if (e.pointerType === 'touch') return;
    handleDragMove(e.clientX, e.clientY);
  });

  window.addEventListener('pointerup', (e) => {
    if (e.pointerType === 'touch') return;
    handleDragEnd();
  });

  // Mobile Touch Events with preventDefault to prevent screen panning during 3D dragging
  canvasContainer.addEventListener('touchstart', (e) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      if (handleDragStart(touch.clientX, touch.clientY)) {
        activeTouchId = touch.identifier;
        e.preventDefault();
      }
    }
  }, { passive: false });

  window.addEventListener('touchmove', (e) => {
    if (draggedObject && activeTouchId !== null) {
      for (let i = 0; i < e.touches.length; i++) {
        if (e.touches[i].identifier === activeTouchId) {
          handleDragMove(e.touches[i].clientX, e.touches[i].clientY);
          e.preventDefault();
          break;
        }
      }
    }
  }, { passive: false });

  window.addEventListener('touchend', (e) => {
    if (draggedObject) {
      handleDragEnd();
    }
  });

  window.addEventListener('touchcancel', () => {
    if (draggedObject) {
      handleDragEnd();
    }
  });

  // ==============================================================
  // MAIN ANIMATION LOOP
  // ==============================================================
  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);

    const delta = clock.getDelta();

    // Smooth camera tween update
    sceneCtrl.updateTween(performance.now());

    // Orbit controls update
    sceneCtrl.controls.update();

    // DYNAMIC EYE TRACKING:
    // Ensure the 'Eye' object is continuously updating its rotation inside the main render loop (requestAnimationFrame).
    // The eye must call .lookAt() targeting the coordinates of the Virtual Image, NOT the physical object.
    if (appState.optics) {
      const target = getImageTarget(appState.optics);
      sceneCtrl.eyeMesh.lookAt(target);
    }

    // In X-Ray Mode, continuously lock the diverging rays leaving the mirror to the eye's Lens Point
    if (appState.xRayActive && appState.optics) {
      const raysData = Optics.calculateMultipleRays(appState.optics, appState.rayCount, appState.apertureRadius);
      sceneCtrl.raySystem.updateRays(
        raysData,
        appState.optics.isVirtual,
        appState.forceRevealVirtual,
        sceneCtrl.eyeMesh,
        true
      );
    }

    // Photons on active rays (flowing into the eye lens in X-Ray mode)
    if (!appState.isFrozen) {
      sceneCtrl.raySystem.animatePhotons(delta, sceneCtrl.eyeMesh, appState.xRayActive);
    }

    // Animate X-Ray refraction & brain reverse-tracing
    if (appState.xRayActive) {
      sceneCtrl.eyeMesh.updateXRayAnimation(delta, appState.optics, appState.rayCount);
    }

    // Render Main 3D Canvas
    sceneCtrl.renderer.render(sceneCtrl.scene, sceneCtrl.camera);

    // Render Picture-in-Picture POV from eye camera
    if (appState.optics) {
      pipCtrl.render(sceneCtrl.eyeMesh, appState.optics);
    }
  }

  // Initial Run
  updateSimulation();
  animate();
});
