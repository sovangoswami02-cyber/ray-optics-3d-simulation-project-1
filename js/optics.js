/**
 * Optics Physics Engine for Concave Mirror Simulation
 * Strict Cartesian Physics System:
 * - Concave mirror vertex / pole at (0, 0, 0).
 * - Object on negative Z-axis: u < 0, height H > 0.
 * - Focal length f < 0 (e.g. -10), Center of Curvature C at (0, 0, 2f).
 * - Mirror formula: v = (u * f) / (u - f).
 * - Magnification: m = -v / u.
 * - Image Height = H * m.
 * - If v > 0: Virtual image behind mirror, upright.
 * - If v < 0: Real image in front of mirror, inverted.
 *
 * Strict 2-Ray Tracing Coordinates:
 * - Ray 1: Object Top (0, H, u) -> Mirror (0, H, 0) -> Focus (0, 0, f).
 * - Ray 2: Object Top (0, H, u) -> Pole (0, 0, 0) -> Reflected downward through (0, -H, -u).
 * - Virtual Rays (Dashed): Starting from Virtual Image Top (0, ImageHeight, v),
 *   connecting to (0, H, 0) and (0, 0, 0).
 */

window.Optics = {
  // Compute image characteristics using exact Cartesian mirror formula
  calculateImage(f_mag, do_dist, H) {
    const f = -Math.abs(f_mag); // Focal length is negative for concave mirror (e.g. -10)
    const u = -Math.abs(do_dist); // Object position on negative Z-axis (e.g. -16 or -6)
    const R = 2 * f; // Center of curvature position (e.g. -20)

    const denom = u - f;
    const isAtFocus = Math.abs(denom) < 0.05;

    let v = 0;
    let m = 0;
    let hi = 0;
    let isVirtual = false;
    let imageType = 'real';
    let orientation = 'inverted';
    let sizeCategory = 'same';

    if (isAtFocus) {
      imageType = 'infinity';
      orientation = 'none';
      sizeCategory = 'infinite';
      v = -999999;
      m = -999999;
      hi = -999999;
    } else {
      // Exact mirror formula: 1/f = 1/u + 1/v => v = (u * f) / (u - f)
      v = (u * f) / denom;
      m = -v / u;
      hi = H * m;

      if (v > 0) {
        // v > 0: Virtual image behind the mirror (+z), upright (hi > 0)
        isVirtual = true;
        imageType = 'virtual';
        orientation = 'upright';
      } else {
        // v < 0: Real image in front of the mirror (-z), inverted (hi < 0)
        isVirtual = false;
        imageType = 'real';
        orientation = 'inverted';
      }

      const absM = Math.abs(m);
      if (Math.abs(absM - 1.0) < 0.05) {
        sizeCategory = 'same';
      } else if (absM > 1.0) {
        sizeCategory = 'magnified';
      } else {
        sizeCategory = 'diminished';
      }
    }

    return {
      f, // negative (e.g. -10)
      f_mag: Math.abs(f),
      R, // negative (e.g. -20)
      R_mag: Math.abs(R),
      u, // negative (e.g. -16)
      do: Math.abs(u),
      H, // Object height
      ho: H,
      v, // image Z coordinate (positive if virtual, negative if real)
      di: Math.abs(v),
      m,
      hi, // signed Image Height (positive if virtual, negative if real)
      ImageHeight: hi,
      isVirtual,
      isAtFocus,
      imageType,
      orientation,
      sizeCategory
    };
  },

  // Concave Mirror Sag: deepest center point (Pole) at z = 0, edges curve towards negative Z
  getMirrorSurfaceZ(x, y, R_mag) {
    const rSq = x * x + y * y;
    if (rSq >= R_mag * R_mag) {
      return -R_mag * 0.5;
    }
    // Negative sag: curves inward toward negative Z facing the object
    return -(R_mag - Math.sqrt(Math.max(0, R_mag * R_mag - rSq)));
  },

  // Strict Ray Tracing Generator:
  // Ray 1: (0, H, u) -> (0, H, 0) -> passes through Focus (0, 0, f)
  // Ray 2: (0, H, u) -> (0, 0, 0) -> reflects downward with slope -H/u
  // Virtual Rays (Dashed): from Virtual Image Top (0, ImageHeight, v) to (0, H, 0) and (0, 0, 0)
  calculateMultipleRays(params, rayCount = 2, apertureRadius = 6.5) {
    const { f, u, H, v, hi, isVirtual, isAtFocus } = params;

    const objTop = new THREE.Vector3(0, H, u);
    const focus = new THREE.Vector3(0, 0, f);
    const pole = new THREE.Vector3(0, 0, 0);

    // Image Top coordinate (0, ImageHeight, v)
    let imgTop;
    if (isAtFocus) {
      imgTop = new THREE.Vector3(0, -100, -100);
    } else {
      imgTop = new THREE.Vector3(0, hi, v);
    }

    const rays = [];
    const reflLength = 40;
    const clampedCount = Math.max(2, Math.min(20, rayCount));

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

    if (clampedCount === 2) {
      // ==============================================================
      // 1. RAY 1 (Parallel to Focus)
      // Starts at Object Top (0, H, u).
      // Travels flat to hit the mirror at (0, H, 0).
      // Reflects to pass exactly through Focus (0, 0, f).
      // Virtual ray (dashed): connects (0, ImageHeight, v) to (0, H, 0).
      // ==============================================================
      const hit1 = new THREE.Vector3(0, H, 0);

      // Reflected direction from hit1 (0, H, 0) through focus (0, 0, f)
      // Direction vector: (focus - hit1) = (0, -H, f)
      const reflDir1 = new THREE.Vector3().subVectors(focus, hit1).normalize();
      const r1_end = new THREE.Vector3().copy(hit1).addScaledVector(reflDir1, reflLength);

      rays.push({
        id: 'ray1',
        name: 'Parallel Ray',
        color: palette[0],
        incident: [objTop.clone(), hit1.clone()],
        reflected: [hit1.clone(), r1_end],
        // Dashed virtual ray connecting mirror hit point (0, H, 0) to Virtual Image Top (0, ImageHeight, v)
        virtual: isVirtual ? [hit1.clone(), imgTop.clone()] : null,
        hitPoint: hit1.clone(),
        normal: new THREE.Vector3(0, 0, -1),
        reflDir: reflDir1
      });

      // ==============================================================
      // 2. RAY 2 (To the Pole)
      // Starts at Object Top (0, H, u).
      // Travels to the Pole at (0, 0, 0).
      // Reflects downward to pass through (0, -H, -u) with slope -H/u into negative Z.
      // Virtual ray (dashed): connects (0, ImageHeight, v) to (0, 0, 0).
      // ==============================================================
      const hit2 = pole.clone(); // (0, 0, 0)

      // Reflected direction into the room (z < 0): direction vector (0, -H, u)
      const reflDir2 = new THREE.Vector3(0, -H, u).normalize();
      const r2_end = new THREE.Vector3().copy(hit2).addScaledVector(reflDir2, reflLength);

      rays.push({
        id: 'ray2',
        name: 'Pole Ray',
        color: palette[1],
        incident: [objTop.clone(), hit2.clone()],
        reflected: [hit2.clone(), r2_end],
        // Dashed virtual ray connecting Pole (0, 0, 0) to Virtual Image Top (0, ImageHeight, v)
        virtual: isVirtual ? [hit2.clone(), imgTop.clone()] : null,
        hitPoint: hit2.clone(),
        normal: new THREE.Vector3(0, 0, -1),
        reflDir: reflDir2
      });
    } else {
      // ==============================================================
      // DYNAMIC MULTIPLE RAYS (N = 3 to 20):
      // Incoming rays spreading from Object Top (0, H, u) across the mirror at z = 0.
      // Virtual dashed rays connect from mirror strike points directly to
      // the mathematically exact Virtual Image Top (0, ImageHeight, v).
      // ==============================================================
      const yMax = Math.min(H * 1.3, apertureRadius * 0.88);
      const yMin = Math.max(-H * 1.15, -apertureRadius * 0.88);

      for (let k = 0; k < clampedCount; k++) {
        const fraction = k / (clampedCount - 1);
        let y_k;
        if (k === 0) y_k = H; // Ray 1: hits at (0, H, 0)
        else if (k === 1) y_k = 0; // Ray 2: hits at (0, 0, 0)
        else y_k = yMax - fraction * (yMax - yMin);

        const hit_k = new THREE.Vector3(0, y_k, 0);

        // For virtual image (v > 0), the reflected ray points along line from imgTop through hit_k:
        // direction = (hit_k - imgTop)
        // For real image (v < 0), reflected ray leaves hit_k and passes through imgTop (0, hi, v)
        let reflDir;
        if (isVirtual) {
          reflDir = new THREE.Vector3().subVectors(hit_k, imgTop).normalize();
        } else if (isAtFocus) {
          reflDir = new THREE.Vector3(0, -H, f).normalize();
        } else {
          reflDir = new THREE.Vector3().subVectors(imgTop, hit_k).normalize();
        }

        const r_end = new THREE.Vector3().copy(hit_k).addScaledVector(reflDir, reflLength);

        rays.push({
          id: `ray_${k + 1}`,
          name: `Ray ${k + 1}`,
          color: palette[k % palette.length],
          incident: [objTop.clone(), hit_k.clone()],
          reflected: [hit_k.clone(), r_end],
          virtual: isVirtual ? [hit_k.clone(), imgTop.clone()] : null,
          hitPoint: hit_k.clone(),
          normal: new THREE.Vector3(0, 0, -1),
          reflDir: reflDir
        });
      }
    }

    return rays;
  },

  calculateRays(params, apertureRadius = 6.5) {
    const list = this.calculateMultipleRays(params, 2, apertureRadius);
    return {
      ray1: list[0],
      ray2: list[1]
    };
  },

  checkEyeInBeam(eyePos, eyeLookAt, params) {
    const { isVirtual, isAtFocus, v, hi } = params;

    // Condition 1: Eye must be on negative Z (in front of the mirror)
    if (eyePos.z >= -0.2) {
      return {
        inBeam: false,
        reason: 'Behind mirror - light blocked by mirror backing',
        alignment: 0
      };
    }

    // Condition 2: Eye looking towards mirror (towards positive Z)
    const toMirror = new THREE.Vector3(0, 0, 0).sub(eyePos).normalize();
    const gazeDot = eyeLookAt.dot(toMirror);
    if (gazeDot < 0.2) {
      return {
        inBeam: false,
        reason: 'Eye not looking towards mirror',
        alignment: 0
      };
    }

    // Condition 3: Check proximity to reflection zone
    let targetY = hi;
    let targetZ = v;

    if (isAtFocus) {
      const distFromAxis = Math.sqrt(eyePos.x * eyePos.x + eyePos.y * eyePos.y);
      const inBeam = distFromAxis < 8.0;
      return {
        inBeam,
        reason: inBeam ? 'In parallel reflected beam' : 'Outside parallel beam',
        alignment: inBeam ? 95 : 20
      };
    }

    const imagePoint = new THREE.Vector3(0, targetY, targetZ);
    const sightRay = new THREE.Ray(eyePos, eyeLookAt);
    const distToImage = sightRay.distanceToPoint(imagePoint);

    const maxTol = Math.max(3.5, Math.abs(hi) * 0.9);
    const inBeam = distToImage < maxTol;
    const alignment = Math.max(0, Math.min(100, Math.round((1 - distToImage / maxTol) * 100)));

    return {
      inBeam,
      reason: inBeam ? 'Clear optical image in view' : `Missed image by ${distToImage.toFixed(1)} cm`,
      alignment
    };
  }
};
