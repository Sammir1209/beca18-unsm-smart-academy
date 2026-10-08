// ==========================================================================
// 3D TUTOR AVATAR ENGINE (Three.js WebGL Interactive Character)
// ==========================================================================

import * as THREE from 'three';

export class Avatar3D {
  constructor(containerElement) {
    this.container = containerElement;
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.animId = null;

    // Body parts for gestures & talking
    this.head = null;
    this.mouth = null;
    this.leftEye = null;
    this.rightEye = null;
    this.leftArm = null;
    this.rightArm = null;
    this.glowRing = null;
    this.antenna = null;

    // States
    this.isSpeaking = false;
    this.isListening = false;
    this.currentGesture = 'idle'; // 'idle', 'explain', 'listen', 'celebrate'
    this.clock = new THREE.Clock();

    this.init();
  }

  init() {
    if (!this.container) return;
    this.container.innerHTML = '';

    const width = this.container.clientWidth || 240;
    const height = this.container.clientHeight || 280;

    // Scene & Camera
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    this.camera.position.set(0, 0.5, 4.2);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.container.appendChild(this.renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    this.scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0x60A5FA, 2.0);
    keyLight.position.set(3, 4, 3);
    this.scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x34D399, 1.5);
    fillLight.position.set(-3, 2, 2);
    this.scene.add(fillLight);

    const rimLight = new THREE.PointLight(0x3B82F6, 3, 6);
    rimLight.position.set(0, 2, -2);
    this.scene.add(rimLight);

    // Build Cute 3D Smart Tutor Robot Character
    this.buildCharacter();

    // Auto-adapt on screen resize or mobile rotation
    this.resizeObserver = new ResizeObserver(() => {
      if (!this.container || !this.renderer || !this.camera) return;
      const w = this.container.clientWidth;
      const h = this.container.clientHeight;
      if (w > 0 && h > 0) {
        this.camera.aspect = w / h;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(w, h);
      }
    });
    this.resizeObserver.observe(this.container);

    // Start Render Loop
    this.animate();
  }

  buildCharacter() {
    this.rootGroup = new THREE.Group();
    this.scene.add(this.rootGroup);

    // Materials
    const bodyMaterial = new THREE.MeshStandardMaterial({
      color: 0x1E293B,
      roughness: 0.3,
      metalness: 0.7
    });

    const visorMaterial = new THREE.MeshStandardMaterial({
      color: 0x0F172A,
      roughness: 0.1,
      metalness: 0.9
    });

    const eyeMaterial = new THREE.MeshBasicMaterial({
      color: 0x38BDF8
    });

    const mouthMaterial = new THREE.MeshBasicMaterial({
      color: 0x34D399
    });

    const accentMaterial = new THREE.MeshStandardMaterial({
      color: 0x10B981,
      roughness: 0.2,
      metalness: 0.8
    });

    // 1. Torso
    const torsoGeo = new THREE.CylinderGeometry(0.55, 0.45, 0.9, 32);
    const torso = new THREE.Mesh(torsoGeo, bodyMaterial);
    torso.position.y = -0.3;
    this.rootGroup.add(torso);

    // Core Chest Glow
    const coreGeo = new THREE.SphereGeometry(0.18, 16, 16);
    const coreMat = new THREE.MeshBasicMaterial({ color: 0x10B981 });
    this.coreOrb = new THREE.Mesh(coreGeo, coreMat);
    this.coreOrb.position.set(0, -0.2, 0.45);
    this.rootGroup.add(this.coreOrb);

    // 2. Head Group (Floating slightly)
    this.headGroup = new THREE.Group();
    this.headGroup.position.y = 0.6;
    this.rootGroup.add(this.headGroup);

    // Head Base
    const headGeo = new THREE.SphereGeometry(0.65, 32, 32);
    headGeo.scale(1.15, 0.95, 1);
    this.head = new THREE.Mesh(headGeo, bodyMaterial);
    this.headGroup.add(this.head);

    // Visor / Screen Face
    const visorGeo = new THREE.SphereGeometry(0.56, 32, 16, 0, Math.PI);
    visorGeo.scale(1.1, 0.7, 0.85);
    const visor = new THREE.Mesh(visorGeo, visorMaterial);
    visor.rotation.y = Math.PI / 2;
    visor.position.set(0, 0, 0.2);
    this.headGroup.add(visor);

    // Eyes
    const eyeGeo = new THREE.CapsuleGeometry(0.08, 0.12, 8, 16);
    this.leftEye = new THREE.Mesh(eyeGeo, eyeMaterial);
    this.leftEye.position.set(-0.25, 0.08, 0.58);
    this.headGroup.add(this.leftEye);

    this.rightEye = new THREE.Mesh(eyeGeo, eyeMaterial);
    this.rightEye.position.set(0.25, 0.08, 0.58);
    this.headGroup.add(this.rightEye);

    // Mouth (Animated during voice speech)
    const mouthGeo = new THREE.BoxGeometry(0.24, 0.05, 0.05);
    this.mouth = new THREE.Mesh(mouthGeo, mouthMaterial);
    this.mouth.position.set(0, -0.16, 0.58);
    this.headGroup.add(this.mouth);

    // Headphones / Ears
    const earGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.12, 16);
    const leftEar = new THREE.Mesh(earGeo, accentMaterial);
    leftEar.rotation.z = Math.PI / 2;
    leftEar.position.set(-0.8, 0.05, 0);
    this.headGroup.add(leftEar);

    const rightEar = new THREE.Mesh(earGeo, accentMaterial);
    rightEar.rotation.z = Math.PI / 2;
    rightEar.position.set(0.8, 0.05, 0);
    this.headGroup.add(rightEar);

    // Antenna
    const antStemGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.25, 8);
    const antStem = new THREE.Mesh(antStemGeo, bodyMaterial);
    antStem.position.set(0, 0.75, 0);
    this.headGroup.add(antStem);

    const antTipGeo = new THREE.SphereGeometry(0.08, 16, 16);
    this.antennaTip = new THREE.Mesh(antTipGeo, new THREE.MeshBasicMaterial({ color: 0x38BDF8 }));
    this.antennaTip.position.set(0, 0.9, 0);
    this.headGroup.add(this.antennaTip);

    // 3. Floating Holographic Arms
    const armGeo = new THREE.CapsuleGeometry(0.1, 0.35, 8, 16);
    this.leftArm = new THREE.Mesh(armGeo, bodyMaterial);
    this.leftArm.position.set(-0.75, -0.3, 0.1);
    this.rootGroup.add(this.leftArm);

    this.rightArm = new THREE.Mesh(armGeo, bodyMaterial);
    this.rightArm.position.set(0.75, -0.3, 0.1);
    this.rootGroup.add(this.rightArm);

    // 4. Hover Ring Bottom
    const ringGeo = new THREE.TorusGeometry(0.5, 0.03, 16, 32);
    this.glowRing = new THREE.Mesh(ringGeo, new THREE.MeshBasicMaterial({ color: 0x10B981 }));
    this.glowRing.rotation.x = Math.PI / 2;
    this.glowRing.position.y = -0.9;
    this.rootGroup.add(this.glowRing);
  }

  setSpeaking(speaking) {
    this.isSpeaking = speaking;
    if (speaking) {
      this.currentGesture = 'explain';
      this.antennaTip.material.color.setHex(0x10B981);
    } else {
      this.currentGesture = 'idle';
      this.antennaTip.material.color.setHex(0x38BDF8);
      if (this.mouth) this.mouth.scale.set(1, 1, 1);
    }
  }

  setListening(listening) {
    this.isListening = listening;
    if (listening) {
      this.currentGesture = 'listen';
      this.antennaTip.material.color.setHex(0xF59E0B);
    } else {
      this.antennaTip.material.color.setHex(0x38BDF8);
    }
  }

  setGesture(gesture) {
    this.currentGesture = gesture;
  }

  animate() {
    this.animId = requestAnimationFrame(() => this.animate());

    const t = this.clock.getElapsedTime();

    // Subtle Hovering Floating Motion
    if (this.rootGroup) {
      this.rootGroup.position.y = Math.sin(t * 2) * 0.08;
      this.rootGroup.rotation.y = Math.sin(t * 0.8) * 0.1;
    }

    // Head subtle tilt
    if (this.headGroup) {
      this.headGroup.rotation.z = Math.sin(t * 1.5) * 0.04;
      this.headGroup.rotation.x = Math.cos(t * 1.8) * 0.03;
    }

    // Mouth Sync & Head Nodding when speaking
    if (this.isSpeaking && this.mouth) {
      const mouthScaleY = 1 + Math.abs(Math.sin(t * 16)) * 3.5;
      const mouthScaleX = 1 + Math.sin(t * 8) * 0.2;
      this.mouth.scale.set(mouthScaleX, mouthScaleY, 1);

      // Speaking gestures with arms
      if (this.leftArm && this.rightArm) {
        this.leftArm.rotation.x = Math.sin(t * 5) * 0.4 - 0.2;
        this.rightArm.rotation.x = -Math.cos(t * 5) * 0.4 - 0.2;
        this.leftArm.position.y = -0.3 + Math.sin(t * 4) * 0.06;
        this.rightArm.position.y = -0.3 + Math.cos(t * 4) * 0.06;
      }

      this.headGroup.rotation.x = Math.sin(t * 10) * 0.08;
    } else if (this.isListening) {
      // Tilting head to listen with curiosity
      if (this.headGroup) {
        this.headGroup.rotation.z = 0.2;
        this.headGroup.rotation.y = 0.15;
      }
      if (this.coreOrb) {
        this.coreOrb.scale.setScalar(1 + Math.sin(t * 8) * 0.3);
      }
    } else {
      // Idle Breathing Arm sway
      if (this.leftArm && this.rightArm) {
        this.leftArm.rotation.x = Math.sin(t * 1.5) * 0.1;
        this.rightArm.rotation.x = -Math.sin(t * 1.5) * 0.1;
        this.leftArm.position.y = -0.3;
        this.rightArm.position.y = -0.3;
      }
    }

    // Core Pulse
    if (this.coreOrb && !this.isListening) {
      this.coreOrb.scale.setScalar(1 + Math.sin(t * 3) * 0.15);
    }

    // Bottom Ring Glow spin
    if (this.glowRing) {
      this.glowRing.rotation.z += 0.02;
    }

    this.renderer.render(this.scene, this.camera);
  }

  destroy() {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    if (this.animId) cancelAnimationFrame(this.animId);
    if (this.renderer && this.renderer.domElement) {
      this.container.removeChild(this.renderer.domElement);
    }
  }
}
