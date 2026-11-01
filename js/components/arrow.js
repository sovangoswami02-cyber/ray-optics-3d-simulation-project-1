/**
 * 3D Neon Arrow and Optical Image (Real / Holographic Virtual)
 * Supports dynamic scaling, smooth animation, and holographic shader styling.
 */

window.createArrowSystem = function () {
  const group = new THREE.Group();
  group.name = 'arrowSystem';

  // Helper to create text sprite billboards with glowing glass badge
  function createTextSprite(text, bgColor = 'rgba(0, 245, 212, 0.25)', textColor = '#00f5d4') {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');

    // Draw rounded badge
    ctx.fillStyle = bgColor;
    ctx.strokeStyle = textColor;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.roundRect(10, 10, 492, 108, 30);
    ctx.fill();
    ctx.stroke();

    // Text
    ctx.font = 'bold 36px "JetBrains Mono", monospace';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = textColor;
    ctx.shadowBlur = 12;
    ctx.fillText(text, 256, 64);

    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    const spriteMat = new THREE.SpriteMaterial({ map: texture, transparent: true });
    const sprite = new THREE.Sprite(spriteMat);
    sprite.scale.set(4.0, 1.0, 1.0);
    sprite.canvas = canvas;
    sprite.ctx = ctx;
    sprite.updateText = function (newText, newBg = bgColor, newTextColor = textColor) {
      this.ctx.clearRect(0, 0, 512, 128);
      this.ctx.fillStyle = newBg;
      this.ctx.strokeStyle = newTextColor;
      this.ctx.lineWidth = 4;
      this.ctx.beginPath();
      this.ctx.roundRect(10, 10, 492, 108, 30);
      this.ctx.fill();
      this.ctx.stroke();

      this.ctx.font = 'bold 34px "JetBrains Mono", monospace';
      this.ctx.fillStyle = '#ffffff';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.shadowColor = newTextColor;
      this.ctx.shadowBlur = 12;
      this.ctx.fillText(newText, 256, 64);
      this.material.map.needsUpdate = true;
    };
    return sprite;
  }

  // ==========================================
  // 1. OBJECT ARROW (Neon Cyan / Mint)
  // ==========================================
  const objectGroup = new THREE.Group();
  objectGroup.name = 'objectArrow';

  // Base ground glowing disk
  const objBaseDiskGeo = new THREE.CylinderGeometry(0.5, 0.5, 0.04, 32);
  const objBaseDiskMat = new THREE.MeshBasicMaterial({ color: 0x00f5d4 });
  const objBaseDisk = new THREE.Mesh(objBaseDiskGeo, objBaseDiskMat);
  objectGroup.add(objBaseDisk);

  // Shaft
  const shaftGeo = new THREE.CylinderGeometry(0.12, 0.12, 1, 24);
  const objMat = new THREE.MeshStandardMaterial({
    color: 0x00f5d4,
    emissive: 0x00f5d4,
    emissiveIntensity: 0.8,
    roughness: 0.2,
    metalness: 0.5
  });
  const shaftMesh = new THREE.Mesh(shaftGeo, objMat);
  objectGroup.add(shaftMesh);

  // Cone Head
  const headGeo = new THREE.ConeGeometry(0.35, 0.8, 24);
  const headMesh = new THREE.Mesh(headGeo, objMat);
  objectGroup.add(headMesh);

  // Drag interaction ring handle
  const handleGeo = new THREE.TorusGeometry(0.7, 0.05, 16, 32);
  const handleMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.7 });
  const handleMesh = new THREE.Mesh(handleGeo, handleMat);
  handleMesh.rotation.x = Math.PI / 2;
  handleMesh.name = 'objectDragHandle';
  objectGroup.add(handleMesh);

  // Floating label
  const objLabel = createTextSprite('OBJECT: do = 15.0cm', 'rgba(0, 245, 212, 0.25)', '#00f5d4');
  objectGroup.add(objLabel);

  group.add(objectGroup);

  // ==========================================
  // 2. REAL IMAGE ARROW (Neon Hot Pink, Inverted)
  // ==========================================
  const realImgGroup = new THREE.Group();
  realImgGroup.name = 'realImageArrow';

  const realBaseDisk = new THREE.Mesh(objBaseDiskGeo, new THREE.MeshBasicMaterial({ color: 0xff007f }));
  realImgGroup.add(realBaseDisk);

  const realShaftMesh = new THREE.Mesh(shaftGeo, new THREE.MeshStandardMaterial({
    color: 0xff007f,
    emissive: 0xff007f,
    emissiveIntensity: 0.8,
    roughness: 0.2,
    metalness: 0.5
  }));
  realImgGroup.add(realShaftMesh);

  const realHeadMesh = new THREE.Mesh(headGeo, realShaftMesh.material);
  realImgGroup.add(realHeadMesh);

  const realLabel = createTextSprite('REAL IMAGE', 'rgba(255, 0, 127, 0.25)', '#ff007f');
  realImgGroup.add(realLabel);

  group.add(realImgGroup);

  // ==========================================
  // 3. HOLOGRAPHIC VIRTUAL IMAGE (Translucent Upright)
  // ==========================================
  const virtualImgGroup = new THREE.Group();
  virtualImgGroup.name = 'virtualImageArrow';

  // Holographic Base Ring
  const virtBaseGeo = new THREE.RingGeometry(0.3, 0.7, 32);
  const virtBaseMat = new THREE.MeshBasicMaterial({
    color: 0x7928ca,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.7
  });
  const virtBase = new THREE.Mesh(virtBaseGeo, virtBaseMat);
  virtBase.rotation.x = Math.PI / 2;
  virtualImgGroup.add(virtBase);

  // Translucent Holographic Material
  const holoMat = new THREE.MeshStandardMaterial({
    color: 0xa855f7,
    emissive: 0x7928ca,
    emissiveIntensity: 0.9,
    transparent: true,
    opacity: 0.6,
    roughness: 0.1,
    metalness: 0.8
  });

  const virtShaftMesh = new THREE.Mesh(shaftGeo, holoMat);
  virtualImgGroup.add(virtShaftMesh);

  const virtHeadMesh = new THREE.Mesh(headGeo, holoMat);
  virtualImgGroup.add(virtHeadMesh);

  // Holographic Wireframe Cage effect
  const holoWireShaft = new THREE.Mesh(shaftGeo, new THREE.MeshBasicMaterial({
    color: 0x00f5d4,
    wireframe: true,
    transparent: true,
    opacity: 0.4
  }));
  virtualImgGroup.add(holoWireShaft);

  const holoWireHead = new THREE.Mesh(headGeo, new THREE.MeshBasicMaterial({
    color: 0x00f5d4,
    wireframe: true,
    transparent: true,
    opacity: 0.5
  }));
  virtualImgGroup.add(holoWireHead);

  // Floating label
  const virtLabel = createTextSprite('✨ VIRTUAL IMAGE', 'rgba(121, 40, 202, 0.35)', '#a855f7');
  virtualImgGroup.add(virtLabel);

  group.add(virtualImgGroup);

  // Update object & image transforms
  group.updateArrows = function (opticsResult) {
    const { u, H, v, hi, isVirtual, isAtFocus, m } = opticsResult;

    // --- Update Object Arrow ---
    // Object on the negative side (in front of the mirror): (0, 0, u)
    objectGroup.position.set(0, 0, u);
    const headHeight = Math.min(0.8, H * 0.3);
    const shaftHeight = Math.max(0.05, H - headHeight);

    shaftMesh.scale.set(1, shaftHeight, 1);
    shaftMesh.position.set(0, shaftHeight / 2, 0);

    headMesh.scale.set(1, headHeight / 0.8, 1);
    headMesh.position.set(0, shaftHeight + headHeight / 2, 0);

    handleMesh.position.set(0, 0.05, 0);
    objLabel.position.set(0, H + 0.8, 0);
    objLabel.updateText(`OBJECT: ${Math.abs(u).toFixed(1)}cm`, 'rgba(0, 245, 212, 0.25)', '#00f5d4');

    // --- Update Image Arrows ---
    if (isAtFocus) {
      realImgGroup.visible = false;
      virtualImgGroup.visible = false;
    } else if (isVirtual) {
      realImgGroup.visible = false;
      virtualImgGroup.visible = true;

      // Virtual image locked to exact v coordinate (> 0, behind mirror on positive side), upright (hi > 0)
      virtualImgGroup.position.set(0, 0, v);

      const vHeadH = Math.min(0.8 * Math.abs(m), hi * 0.3);
      const vShaftH = Math.max(0.05, hi - vHeadH);

      virtShaftMesh.scale.set(1, vShaftH, 1);
      virtShaftMesh.position.set(0, vShaftH / 2, 0);
      holoWireShaft.scale.copy(virtShaftMesh.scale);
      holoWireShaft.position.copy(virtShaftMesh.position);

      virtHeadMesh.scale.set(Math.min(2.5, 1 * Math.sqrt(Math.abs(m))), vHeadH / 0.8, Math.min(2.5, 1 * Math.sqrt(Math.abs(m))));
      virtHeadMesh.position.set(0, vShaftH + vHeadH / 2, 0);
      holoWireHead.scale.copy(virtHeadMesh.scale);
      holoWireHead.position.copy(virtHeadMesh.position);

      virtLabel.position.set(0, hi + 1.0, 0);
      virtLabel.updateText(`✨ VIRTUAL: +${v.toFixed(1)}cm (${m.toFixed(2)}x)`, 'rgba(121, 40, 202, 0.35)', '#a855f7');
    } else {
      // Real Image locked to exact v coordinate (< 0, in front of mirror on negative side), inverted (hi < 0)
      realImgGroup.visible = true;
      virtualImgGroup.visible = false;

      realImgGroup.position.set(0, 0, v);

      const absHi = Math.abs(hi);
      const rHeadH = Math.min(0.8 * Math.sqrt(Math.abs(m)), absHi * 0.3);
      const rShaftH = Math.max(0.05, absHi - rHeadH);

      // Invert: pointing downwards
      realShaftMesh.scale.set(1, rShaftH, 1);
      realShaftMesh.position.set(0, -rShaftH / 2, 0);

      realHeadMesh.rotation.z = Math.PI; // point down
      realHeadMesh.scale.set(Math.min(2.5, 1 * Math.sqrt(Math.abs(m))), rHeadH / 0.8, Math.min(2.5, 1 * Math.sqrt(Math.abs(m))));
      realHeadMesh.position.set(0, -rShaftH - rHeadH / 2, 0);

      realLabel.position.set(0, -absHi - 0.9, 0);
      realLabel.updateText(`REAL: ${v.toFixed(1)}cm (${m.toFixed(2)}x)`, 'rgba(255, 0, 127, 0.25)', '#ff007f');
    }
  };

  return group;
};

