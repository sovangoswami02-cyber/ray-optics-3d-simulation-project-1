/**
 * Virtual Zone Freeze & Interactive Quiz Modal
 * Handles the crucial optics mystery question when entering the virtual zone.
 * Unlocks the 'X-Ray Mode 🩻' upon discovering the virtual image.
 */

window.createQuizController = function (appState, onRevealVirtualRays, onUnfreeze, onUnlockXRay, onTriggerXRayDirect) {
  // DOM Elements
  const quizModal = document.getElementById('quiz-modal');
  const quizQuestionCard = document.getElementById('quiz-question-card');
  const quizExplanationCard = document.getElementById('quiz-explanation-card');
  const btnYes = document.getElementById('quiz-btn-yes');
  const btnNo = document.getElementById('quiz-btn-no');
  const quizResultTitle = document.getElementById('quiz-result-title');
  const quizResultBadge = document.getElementById('quiz-result-badge');
  const btnContinue = document.getElementById('quiz-btn-continue');
  const btnQuizXRay = document.getElementById('quiz-btn-xray');
  const btnRetriggerQuiz = document.getElementById('btn-retrigger-quiz');

  let hasTriggeredOnce = false;

  // Trigger Freeze & Show Question Modal
  function triggerVirtualZoneMystery() {
    appState.isFrozen = true;
    if (window.soundFX) window.soundFX.playVirtualZoneFreeze();

    const btnExpandQuiz = document.getElementById('btn-expand-quiz');
    if (btnExpandQuiz) btnExpandQuiz.classList.add('hidden');

    // Show modal and reset to question state
    quizModal.classList.remove('hidden');
    quizQuestionCard.classList.remove('hidden');
    quizExplanationCard.classList.add('hidden');

    // Add frozen blur effect to canvas
    const canvasContainer = document.getElementById('canvas-container');
    if (canvasContainer) {
      canvasContainer.classList.add('filter', 'blur-md', 'scale-98', 'transition-all', 'duration-500');
    }
  }

  // Handle user answer
  function handleAnswer(userSaidYes) {
    if (window.soundFX) {
      if (userSaidYes) window.soundFX.playSuccessChime();
      else window.soundFX.playRevealSound();
    }

    // Switch from question card to explanation card
    quizQuestionCard.classList.add('hidden');
    quizExplanationCard.classList.remove('hidden');

    if (userSaidYes) {
      quizResultBadge.className = 'px-3 py-1 rounded-full text-xs font-mono font-bold tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 inline-flex items-center gap-1.5 shadow-[0_0_15px_rgba(52,211,153,0.3)]';
      quizResultBadge.innerHTML = '<span>🧠✨</span> BIG BRAIN MOMENT!';
      quizResultTitle.textContent = "You're 100% correct! The eye DOES see an image.";
    } else {
      quizResultBadge.className = 'px-3 py-1 rounded-full text-xs font-mono font-bold tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/40 inline-flex items-center gap-1.5 shadow-[0_0_15px_rgba(168,85,247,0.3)]';
      quizResultBadge.innerHTML = '<span>🤯</span> COUNTER-INTUITIVE TWIST!';
      quizResultTitle.textContent = "Surprise! The eye actually DOES see an image.";
    }

    // Unlock X-Ray Mode!
    appState.xRayUnlocked = true;
    if (onUnlockXRay) {
      onUnlockXRay();
    }

    // Reveal the virtual rays and holographic arrow immediately in the 3D scene!
    if (onRevealVirtualRays) {
      onRevealVirtualRays();
    }
  }

  // Close modal and unfreeze
  function continueSimulation() {
    quizModal.classList.add('hidden');
    appState.isFrozen = false;

    const canvasContainer = document.getElementById('canvas-container');
    if (canvasContainer) {
      canvasContainer.classList.remove('filter', 'blur-md', 'scale-98');
    }

    if (onUnfreeze) {
      onUnfreeze();
    }

    if (window.soundFX) window.soundFX.playClick();
  }

  // Bind Event Listeners
  if (btnYes) {
    btnYes.addEventListener('click', () => handleAnswer(true));
  }
  if (btnNo) {
    btnNo.addEventListener('click', () => handleAnswer(false));
  }
  if (btnContinue) {
    btnContinue.addEventListener('click', continueSimulation);
  }
  if (btnQuizXRay) {
    btnQuizXRay.addEventListener('click', () => {
      continueSimulation();
      if (onTriggerXRayDirect) {
        setTimeout(onTriggerXRayDirect, 250);
      }
    });
  }
  if (btnRetriggerQuiz) {
    btnRetriggerQuiz.addEventListener('click', () => {
      triggerVirtualZoneMystery();
    });
  }

  // Check on each frame or slider update
  function checkVirtualZoneTrigger(do_dist, f) {
    const isVirtual = do_dist < f;

    if (isVirtual && !hasTriggeredOnce) {
      hasTriggeredOnce = true;
      triggerVirtualZoneMystery();
      return true;
    }
    return false;
  }

  return {
    checkVirtualZoneTrigger,
    triggerManual: triggerVirtualZoneMystery,
    resetTrigger: () => { hasTriggeredOnce = false; }
  };
};
