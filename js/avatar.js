/* KARVION AI — 3D cute boy avatar (Three.js, pure frontend, free) */
(function () {
  if (window.KVAvatar) return;
  const S = {
    speaking: false,
    blip: 0,
    raf: 0,
    clock: null,
    scene: null,
    camera: null,
    renderer: null,
    blinkT: 2,
    t: 0
  };
  const parts = {};
  const SKIN = 0xffd9b3, HAIR = 0x3b2a20, SHIRT = 0xa78bfa, PANT = 0x2a1f4d, SHOE = 0x1c1533, MOUTH = 0x9c4a52;

  function ready() { return typeof THREE !== 'undefined'; }

  function mat(color) { return new THREE.MeshStandardMaterial({ color, roughness: .5, metalness: .05 }); }

  function init() {
    if (!ready()) return false;
    const canvas = document.getElementById('avatarCanvas');
    if (!canvas) return false;
    S.scene = new THREE.Scene();
    S.camera = new THREE.PerspectiveCamera(45, 1, .1, 100);
    S.camera.position.set(0, 1.7, 5.3);
    S.camera.lookAt(0, 1, 0);
    S.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    S.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    S.scene.add(new THREE.AmbientLight(0xffffff, .7));
    const dl = new THREE.DirectionalLight(0xffffff, .95); dl.position.set(2, 4, 3); S.scene.add(dl);
    const dl2 = new THREE.DirectionalLight(0xa78bfa, .5); dl2.position.set(-3, 2, -2); S.scene.add(dl2);
    buildBoy();
    S.clock = new THREE.Clock();
    const wrap = canvas.parentElement;
    const ro = new ResizeObserver(() => size());
    if (wrap) ro.observe(wrap);
    window.addEventListener('resize', size);
    size();
    return true;
  }

  function size() {
    if (!S.renderer || !S.camera) return;
    const canvas = document.getElementById('avatarCanvas');
    if (!canvas) return;
    const wrap = canvas.parentElement;
    if (!wrap) return;
    const w = wrap.clientWidth, h = wrap.clientHeight;
    if (!w || !h) return;
    canvas.width = w; canvas.height = h;
    S.camera.aspect = w / h; S.camera.updateProjectionMatrix();
    S.renderer.setSize(w, h, false);
  }

  function buildBoy() {
    const g = new THREE.Group();
    parts.torso = new THREE.Group();
    const body = new THREE.Mesh(new THREE.CylinderGeometry(.55, .48, 1, 24), mat(SHIRT));
    parts.torso.add(body);
    parts.torso.position.y = .95;

    parts.head = new THREE.Group();
    const head = new THREE.Mesh(new THREE.SphereGeometry(.5, 32, 32), mat(SKIN));
    const hair = new THREE.Mesh(new THREE.SphereGeometry(.5, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2.2), mat(HAIR));
    hair.position.y = .09;
    parts.head.add(head); parts.head.add(hair);

    parts.eyes = new THREE.Group();
    [-.18, .18].forEach(x => {
      const e = new THREE.Mesh(new THREE.SphereGeometry(.07, 14, 14), mat(0x1b1230));
      e.position.set(x, .07, .43);
      const hl = new THREE.Mesh(new THREE.SphereGeometry(.022, 8, 8), mat(0xffffff));
      hl.position.set(x + .02, .105, .485);
      parts.eyes.add(e); parts.eyes.add(hl);
    });
    parts.head.add(parts.eyes);

    parts.jaw = new THREE.Mesh(new THREE.BoxGeometry(.2, .05, .06), mat(MOUTH));
    parts.jaw.position.set(0, -.22, .43);
    parts.head.add(parts.jaw);

    parts.head.position.y = 1.95;
    g.add(parts.head);

    parts.armL = armPivot(-1); parts.armR = armPivot(1);
    parts.legL = legPivot(-.24); parts.legR = legPivot(.24);
    g.add(parts.torso);
    S.group = g;
    S.scene.add(g);
  }

  function armPivot(side) {
    const p = new THREE.Group();
    p.position.set(.72 * side, 1.45, 0);
    const arm = new THREE.Mesh(new THREE.CylinderGeometry(.13, .1, .7, 16), mat(SHIRT));
    arm.position.y = -.3;
    const hand = new THREE.Mesh(new THREE.SphereGeometry(.14, 16, 16), mat(SKIN));
    hand.position.y = -.78;
    p.add(arm); p.add(hand);
    parts.torso.add(p);
    return p;
  }

  function legPivot(side) {
    const p = new THREE.Group();
    p.position.set(.24 * side, .45, 0);
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(.14, .12, .6, 16), mat(PANT));
    leg.position.y = -.3;
    const foot = new THREE.Mesh(new THREE.BoxGeometry(.22, .1, .34), mat(SHOE));
    foot.position.set(0, -.74, .06);
    p.add(leg); p.add(foot);
    parts.torso.add(p);
    return p;
  }

  function loop() {
    if (S.clock) S.t = S.clock.getElapsedTime();
    const t = S.t, g = S.group;
    if (g) {
      g.rotation.y = Math.sin(t * .5) * .18;
      g.position.y = Math.sin(t * 1.6) * .04;
      parts.torso.scale.y = 1 + Math.sin(t * 2.4) * .02;
      const spk = S.speaking;
      parts.head.rotation.x = (spk ? Math.sin(t * 9) * .05 : Math.sin(t * .8) * .04);
      parts.head.rotation.z = Math.sin(t * .6) * .05;
      if (spk) {
        const open = Math.max(0, Math.sin(t * 15) * .6 + Math.sin(t * 23) * .4 + S.blip * 2) * .9;
        parts.jaw.scale.y = .5 + open * 3;
        parts.jaw.position.y = -.22 - open * .06;
      } else {
        parts.jaw.scale.y = 1;
        parts.jaw.position.y = -.22;
      }
      S.blinkT -= 1 / 60;
      if (S.blinkT <= 0) {
        S.blinkT = 2.5 + Math.random() * 3;
        parts.eyes.scale.y = .1;
        setTimeout(() => { parts.eyes.scale.y = 1; }, 140);
      }
      const wave = spk ? Math.sin(t * 6) * .5 : Math.sin(t * 1.2) * .09;
      parts.armR.rotation.x = spk ? -Math.abs(wave) - .3 : wave * .6;
      parts.armL.rotation.x = -wave * .6;
      parts.legL.rotation.x = Math.sin(t * 1.2) * .06;
      parts.legR.rotation.x = -Math.sin(t * 1.2) * .06;
    }
    if (S.renderer && S.scene && S.camera) S.renderer.render(S.scene, S.camera);
    S.raf = requestAnimationFrame(loop);
  }

  window.KVAvatar = {
    ready,
    show() {
      if (!ready()) return false;
      const canvas = document.getElementById('avatarCanvas');
      if (!canvas) return false;
      if (!S.renderer && !init()) return false;
      canvas.style.display = 'block';
      size();
      if (!S.raf) S.raf = requestAnimationFrame(loop);
      return true;
    },
    hide() {
      const canvas = document.getElementById('avatarCanvas');
      if (canvas) canvas.style.display = 'none';
      if (S.raf) { cancelAnimationFrame(S.raf); S.raf = 0; }
    },
    setSpeaking(b) { S.speaking = !!b; },
    blip() { S.blip = 1; setTimeout(() => { S.blip = 0; }, 130); },
    gesture() { S.blip = 1; setTimeout(() => { S.blip = 0; }, 450); }
  };
})();
