# SPECULA 3D // Concave Mirror Optics Simulation ⚡

An interactive, Gen Z aesthetic 3D physics simulation of a **Concave Mirror** built with **Three.js** and **Tailwind CSS**. Features a dark obsidian theme (`#121212`), floating frosted glassmorphism panels, real-time geometric ray tracing, a movable 3D human eye camera, a Picture-in-Picture (PiP) retinal perspective feed, and an interactive **'X-Ray Mode 🩻'** with anatomical cutaways.

---

## 🚀 Quick Start

### Option 1: Direct Browser Launch
Simply double-click [`index.html`](file:///c:/Users/User/OneDrive/Documents/Code/index.html) to open it in your favorite modern browser (Chrome, Edge, Brave, Firefox, Opera GX). No installation or build steps required!

### Option 2: Local Python Server (Recommended)
Double-click [`start.bat`](file:///c:/Users/User/OneDrive/Documents/Code/start.bat) or run:
```bash
python serve.py
```
This serves the simulation at `http://localhost:8080` and automatically opens your web browser.

---

## ✨ Features & Refinements

### 1. 🎛️ UI Panel Minimization & Expand
* Every floating UI panel on the screen can now be collapsed into a small, elegant floating tab to clear up 3D viewport screen space:
  * **Controls Panel**: Minimize (`−`) collapses into `[ ⚙️ Controls + ]`.
  * **'POV' Picture-in-Picture Monitor**: Minimize (`−`) collapses into `[ 👁️ Eye POV + ]`.
  * **'X-Ray Mode' Info Card**: Minimize (`−`) collapses into `[ 🩻 X-Ray Info + ]`.
  * **Virtual Zone Mystery Modal**: Minimize (`−`) collapses into `[ 🧠 Virtual Mystery Quiz + ]` so you can inspect the 3D scene and reopen when ready.
  * **Optics Masterclass Modal**: Minimize (`−`) collapses into `[ 📚 Cheat Sheet + ]`.

### 2. 👁️ Dynamic Eye Tracking
* The 3D eye model dynamically and continuously tracks the optical image in real time!
* In the 3D render loop, the eye model uses `lookAt()` orientation mathematics to always point its pupil directly at the image tip (whether a real inverted image in front of the mirror or a virtual holographic image behind it), regardless of where you drag or place the eye along the axis.
* The PiP camera automatically aligns with this sightline.

### 3. 📐 Simplified Textbook Principal Rays (Strictly 2 Rays)
* Strictly limited to the two classic textbook principal rays:
  * **Ray 1 (Cyan)**: Incident parallel to the principal axis &rarr; reflects through the principal focus ($F$).
  * **Ray 2 (Neon Pink)**: Incident directly at the pole ($P$) &rarr; reflects symmetrically below the axis at the exact same angle ($\theta_r = -\theta_i$).
* All extraneous rays and cluttered lines have been removed for a clean, textbook-diagram look.
* Collinear dashed virtual extensions extend straight backward through the mirror to form the virtual image when $d_o < f$.

### 4. 🩻 The X-Ray Mode Misconception Physics
* Clarifies the classic misconception: *"Diverging rays cannot form an image."*
* When toggled:
  1. Camera shifts to a close-up side-profile view of the eye.
  2. Outer sclera becomes transparent, revealing the front convex crystalline lens and the concave retina.
  3. The exact two diverging rays (Ray 1 and Ray 2) from the mirror enter the front surface of the eye's convex lens.
  4. The convex lens refracts (bends) both rays inward, converging them to a sharp single focal point on the retina (marked with a glowing dot and labeled **`● Real Image on Retina`**).
  5. Straight dashed lines extend backward from that retina point, out through the eye, across real space, and through the mirror to form the virtual image behind it (labeled **`← Brain's reverse-tracing`**).
* Sleek info-card clearly explains: *"The eye's convex lens converts the diverging rays of a virtual image into a REAL image on the retina!"*

### 5. 📱 Full Mobile Responsiveness & Touch Support
* 3D canvas scales dynamically to `100vw` and `100vh` on all devices, handling window resizing and device orientation changes.
* Touch event handling (`touchstart`, `touchmove`, `touchend`, `touchcancel` with `{ passive: false }`) allows users on smartphones and tablets to drag the glowing neon arrow and the eye model directly in 3D without triggering page scrolling.
* Range sliders feature `touch-action: pan-x` and large touch-friendly slider thumbs.
* UI panels automatically adjust their width, padding, and layout for smaller screens, and can be collapsed into compact tabs with one tap.

---

## 📂 File Architecture

```
Code/
├── index.html                 # Main HTML layout, UI glass panels, HUD, and PiP monitor
├── start.bat                  # One-click Windows launch script
├── serve.py                   # Python HTTP server with auto-browser launch
├── css/
│   └── styles.css             # Glassmorphism, animations, custom sliders, CRT static
└── js/
    ├── audio.js               # Web Audio API sound synthesizer
    ├── optics.js              # Geometric optics physics engine & 2 principal rays
    ├── scene.js               # Three.js scene, cameras, lights, grid, optical axis
    ├── quiz.js                # Virtual zone freeze modal & explanation controller
    ├── main.js                # App state, UI event listeners, 3D drag & animation loop
    ├── Ray optics assignment.js# Mirrored application controller
    └── components/
        ├── mirror.js          # 3D concave mirror mesh & curvature generator
        ├── arrow.js           # Glowing neon arrow & real/virtual image arrows
        ├── rays.js            # Strictly 2 glowing laser lines, virtual dashed rays & photons
        ├── eye.js             # 3D observer eye, dynamic tracking, cutaway convex lens & retina
        └── pip.js             # Picture-in-Picture secondary camera & beam detector
```
