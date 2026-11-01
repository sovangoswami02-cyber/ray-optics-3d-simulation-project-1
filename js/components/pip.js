/**
 * 'POV' Picture-in-Picture Camera System
 * Renders the live perspective feed from the movable human eye camera.
 * STRICT REQUIREMENT: Only renders the image if the eye is placed in the path of reflected rays!
 */

window.createPipSystem = function (scene, mainRenderer) {
  // DOM Elements
  const pipCanvas = document.getElementById('pip-canvas');
  const pipStatusBadge = document.getElementById('pip-status-badge');
  const pipAlignmentBar = document.getElementById('pip-alignment-bar');
  const pipAlignmentText = document.getElementById('pip-alignment-text');
  const pipWarningOverlay = document.getElementById('pip-warning-overlay');
  const pipWarningMessage = document.getElementById('pip-warning-message');
  const pipSnapBtn = document.getElementById('pip-snap-btn');

  // Dedicated secondary renderer for PiP to ensure crisp resolution and isolate eye camera
  const pipRenderer = new THREE.WebGLRenderer({
    canvas: pipCanvas,
    antialias: true,
    alpha: true
  });
  pipRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  pipRenderer.setSize(pipCanvas.clientWidth, pipCanvas.clientHeight);
  pipRenderer.toneMapping = THREE.ACESFilmicToneMapping;
  pipRenderer.toneMappingExposure = 1.2;

  // Eye Camera
  const eyeCamera = new THREE.PerspectiveCamera(
    45,
    pipCanvas.clientWidth / pipCanvas.clientHeight,
    0.1,
    100
  );

  let currentBeamState = {
    inBeam: false,
    alignment: 0,
    reason: 'Initial check'
  };

  // Resize handler
  function handleResize() {
    if (!pipCanvas) return;
    const width = pipCanvas.clientWidth;
    const height = pipCanvas.clientHeight;
    if (width > 0 && height > 0) {
      eyeCamera.aspect = width / height;
      eyeCamera.updateProjectionMatrix();
      pipRenderer.setSize(width, height);
    }
  }
  window.addEventListener('resize', handleResize);

  // Render loop update
  function render(eyeMesh, opticsResult) {
    if (!eyeMesh || !scene) return;

    // 1. Sync Eye Camera transform with 3D Eye mesh
    eyeCamera.position.copy(eyeMesh.position);

    // Dynamic Eye Tracking: Eye camera looks directly at the optical image (0, ImageHeight, v)
    let imageTarget;
    if (opticsResult) {
      if (opticsResult.isAtFocus) {
        imageTarget = new THREE.Vector3(0, 0, 0);
      } else {
        // Strict Cartesian image coordinates: (0, ImageHeight, v)
        imageTarget = new THREE.Vector3(0, opticsResult.hi, opticsResult.v);
      }
    } else {
      imageTarget = new THREE.Vector3(0, 0, 0);
    }
    eyeCamera.lookAt(imageTarget);

    // Compute look vector towards image / mirror
    const eyeLookDir = new THREE.Vector3().subVectors(imageTarget, eyeCamera.position).normalize();

    // 2. Check if eye is in reflected ray beam path!
    currentBeamState = Optics.checkEyeInBeam(eyeMesh.position, eyeLookDir, opticsResult);

    // Update 3D eye mesh reticle ring color
    eyeMesh.setInBeamState(currentBeamState.inBeam, currentBeamState.alignment);

    // 3. Update PiP UI Elements
    if (pipAlignmentText) {
      pipAlignmentText.textContent = `${currentBeamState.alignment}%`;
    }
    if (pipAlignmentBar) {
      pipAlignmentBar.style.width = `${currentBeamState.alignment}%`;
      pipAlignmentBar.className = `h-full transition-all duration-300 ${
        currentBeamState.inBeam ? 'bg-cyan-400 shadow-[0_0_8px_#00f5d4]' : 'bg-rose-500'
      }`;
    }

    if (currentBeamState.inBeam) {
      // IN BEAM: Show live camera feed!
      if (pipStatusBadge) {
        pipStatusBadge.className = 'px-2 py-0.5 rounded-full text-[10px] font-mono tracking-wider font-bold bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 flex items-center gap-1.5 shadow-[0_0_12px_rgba(0,245,212,0.3)]';
        pipStatusBadge.innerHTML = '<span class="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span> SIGNAL LOCKED';
      }
      if (pipWarningOverlay) {
        pipWarningOverlay.classList.add('hidden');
      }

      // Temporarily hide eye model from its own camera view
      eyeMesh.visible = false;

      // Render the scene as seen through the eye camera
      pipRenderer.render(scene, eyeCamera);

      // Restore eye visibility for main camera
      eyeMesh.visible = true;
    } else {
      // OUT OF BEAM: Screen is dark/static with warning overlay!
      if (pipStatusBadge) {
        pipStatusBadge.className = 'px-2 py-0.5 rounded-full text-[10px] font-mono tracking-wider font-bold bg-rose-500/20 text-rose-400 border border-rose-500/40 flex items-center gap-1.5';
        pipStatusBadge.innerHTML = '<span class="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span> OUT OF BEAM';
      }
      if (pipWarningOverlay) {
        pipWarningOverlay.classList.remove('hidden');
      }
      if (pipWarningMessage) {
        pipWarningMessage.textContent = currentBeamState.reason || 'Rays not entering pupil!';
      }

      // Clear PiP canvas to dark/static background
      pipRenderer.clear();
    }
  }

  // Snap Eye into the sweet spot of the reflected ray bundle
  function snapEyeIntoBeam(opticsResult, eyeMesh, animateCallback) {
    const { isVirtual, isAtFocus, di, f } = opticsResult;
    let targetPos;

    if (isAtFocus) {
      // Parallel rays reflect out along -z
      targetPos = new THREE.Vector3(0.5, 0.5, -18);
    } else if (isVirtual) {
      // Virtual image behind mirror at (0, hi, +di)
      // Observer in front on negative Z looking towards mirror
      targetPos = new THREE.Vector3(0, 2.5, -16.0);
    } else {
      // Real image at -di
      const eyeZ = Math.min(-di - 4, -16);
      targetPos = new THREE.Vector3(0, -opticsResult.hi * 0.7, eyeZ);
    }

    if (animateCallback) {
      animateCallback(targetPos);
    } else if (eyeMesh) {
      eyeMesh.position.copy(targetPos);
      eyeMesh.setTarget(new THREE.Vector3(0, 0, 0));
    }

    if (window.soundFX) window.soundFX.playLaserSwoosh(850);
  }

  return {
    render,
    snapEyeIntoBeam,
    getCamera: () => eyeCamera,
    getBeamState: () => currentBeamState,
    resize: handleResize
  };
};

