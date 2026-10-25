// TomatoBot, live: drive to a plant, lock focus on a tomato, and pick it if it is ripe.
// Framework-free so the preview page and the site's React wrapper run the same code. Every value it
// shows comes from the model (model.mjs) and the parts it moves are rebuilt by arm.mjs.

/**
 * @param {HTMLElement} stage the element holding the figure's <svg>
 * @param {{ k: any, G: any, M: any, arm: any, data: any, say?: (text: string) => void, describe?: (text: string) => void }} parts
 * @returns {() => void} stops the figure
 */
export function mountTomatobot(stage, { k, G, M, arm, data, say = (text) => void text, describe = (text) => void text }) {
  const svg = stage.querySelector("svg");
  const P = data.P;
  const still = matchMedia("(prefers-reduced-motion: reduce)");
  const robotG = svg.querySelector("[data-robot]");
  const armG = svg.querySelector("[data-arm]");
  const sightG = svg.querySelector("[data-sight]");
  const cupG = svg.querySelector("[data-cup-fruit]");
  const wheels = data.wheels.map((w) => ({ ...w, tread: svg.querySelector(`[data-tread="${w.name}"]`), hub: svg.querySelector(`[data-hub="${w.name}"]`) }));
  const fruits = M.FRUITS.map((f) => ({ ...f, el: svg.querySelector(`[data-fruit="${f.id}"]`), scar: svg.querySelector(`[data-scar="${f.id}"]`), on: true, grow: { x: 1, v: 0 } }));
  const origin = k.iso([0, 0, 0], P);
  const fruitAt = (f, c) => {
    const [x, y] = k.iso(c, P);
    return `<g transform="translate(${(x - origin[0]).toFixed(2)} ${(y - origin[1]).toFixed(2)})">${data.fruitSvg[f.ripe ? 1 : 0]}</g>`;
  };

  // ------------------------------------------------------------ state
  const joints = ["yaw", "a1", "a2", "a3", "grip"];
  const pose = Object.fromEntries(joints.map((j) => [j, { x: M.REST[j], v: 0 }]));
  const want = { ...M.REST };
  const drive = { x: 0, v: 0 };
  let driveTo = 0;
  let turn = 0;
  let job = null; // { fruit, phase, at }
  let aim = null; // the fruit the camera is locked on
  let lockAge = 0;
  let carried = null;
  let holding = null; // a fruit still on its truss, already drawn in the gripper's layer
  let falling = null; // { fruit, z, v, x, y }
  let inCup = 0;
  let clock = 0;
  let touring = !still.matches;
  let tourStep = 0;
  let idleTimer = 0;
  let visible = false;
  let frame = 0;
  let last = 0;
  let lastArm = "";

  const settle = (s, target, dt, seconds, calm) => {
    if (calm) { s.x = target; s.v = 0; return false; }
    const w = 1 / seconds;
    for (let i = 0; i < 4; i++) {
      s.v += (w * w * (target - s.x) - 2 * w * s.v) * (dt / 4);
      s.x += s.v * (dt / 4);
    }
    if (Math.abs(target - s.x) < 1e-4 && Math.abs(s.v) < 1e-4) { s.x = target; s.v = 0; return false; }
    return true;
  };
  const near = (tolerance = 0.02) => joints.every((j) => Math.abs(pose[j].x - want[j]) < (j === "grip" ? 0.03 : tolerance) && Math.abs(pose[j].v) < 0.25);
  const aimAt = (target, pitch) => Object.assign(want, M.reach(target, pitch));
  const localOf = (f) => M.local(f.at, drive.x);
  const ripeLeft = () => fruits.filter((f) => f.ripe && f.on).length;

  // ------------------------------------------------------------ the picking sequence
  function start(f) {
    if (!f || !f.on) return;
    aim = f;
    lockAge = 0;
    job = { fruit: f, phase: "drive", at: clock };
    driveTo = M.stopFor(f);
    describe(f.ripe ? `Tomato ${f.id + 1}, ripe: the arm picks it.` : `Tomato ${f.id + 1}, not ripe: it stays on the vine.`);
  }

  function step() {
    if (!job) return;
    const f = job.fruit;
    const age = clock - job.at;
    const next = (phase) => { job.phase = phase; job.at = clock; };
    const arrived = Math.abs(drive.x - driveTo) < 0.3 && Math.abs(drive.v) < 2;
    switch (job.phase) {
      case "drive":
        if (arrived) next("lock");
        break;
      case "lock":
        if (lockAge > 0.7) next(f.ripe ? "approach" : "leave");
        break;
      case "leave":
        if (age > 1.4) { job = null; aim = null; }
        break;
      case "approach":
        aimAt(M.approachOf(localOf(f)), 0);
        want.grip = 0;
        if (near()) next("reach");
        break;
      case "reach":
        // from here the fruit is drawn between the fingers, so the far finger passes behind it
        f.on = false;
        holding = f;
        aimAt(localOf(f), 0);
        if (near(0.01)) next("grip");
        break;
      case "grip":
        want.grip = 1;
        if (near(0.02)) { carried = f; holding = null; aim = null; next("lift"); }
        break;
      case "lift":
        aimAt(M.approachOf(localOf(f), 12), 0.1);
        if (near(0.03)) next("carry");
        break;
      case "carry":
        aimAt(M.OVER_CUP, M.DROP_PITCH);
        if (near(0.015)) next("release");
        break;
      case "release":
        want.grip = 0;
        if (pose.grip.x < 0.55 && carried) {
          const tip = M.chain(current()).tip;
          falling = { fruit: carried, x: tip[0], y: tip[1], z: tip[2], v: 0 };
          carried = null;
        }
        if (!carried && near()) next("home");
        break;
      case "home":
        Object.assign(want, M.REST);
        if (near(0.03)) job = null;
        break;
    }
  }

  function tour() {
    if (job || !touring) return;
    const order = fruits.filter((f) => f.ripe && f.on);
    if (order.length) { start(order[0]); return; }
    // every ripe one is in the cup: look at an unripe one, then let the plants grow new fruit
    if (tourStep === 0) { tourStep = 1; start(fruits.find((f) => !f.ripe && f.on)); return; }
    tourStep = 0;
    for (const f of fruits) if (!f.on) { f.on = true; f.grow.x = 0; f.grow.v = 0; }
    inCup = 0;
    job = { fruit: null, phase: "wait", at: clock };
  }

  const current = () => Object.fromEntries(joints.map((j) => [j, pose[j].x]));

  // ------------------------------------------------------------ drawing
  function sight() {
    if (!aim || !aim.on || (job && job.phase === "drive")) return "";
    const lens = [M.CAM.x + drive.x, M.CAM.y - 3.5, M.CAM.z];
    const c = aim.at;
    const ray = G.unit3(G.sub3(c, lens));
    const e1 = G.unit3(G.cross3(ray, [0, 0, 1]));
    const e2 = G.unit3(G.cross3(e1, ray));
    // focus hunts like the hero's AF box: overshoot, come back, lock
    const hunt = still.matches ? 0 : Math.exp(-lockAge / 0.22) * Math.cos(lockAge * 16);
    const h = M.FRUIT_R * 1.45 * (1 + 0.5 * hunt);
    const corner = (s1, s2) => G.add3(c, G.add3(G.mul3(e1, s1 * h), G.mul3(e2, s2 * h)));
    const corners = [corner(-1, -1), corner(1, -1), corner(1, 1), corner(-1, 1)];
    const at = (p) => k.iso(p, P);
    const leg = 0.34;
    const marks = corners.map((p, i) => {
      const a = corners[(i + 1) % 4];
      const b = corners[(i + 3) % 4];
      return k.pathOf([at(G.lerp3(p, a, leg)), at(p), at(G.lerp3(p, b, leg))]);
    }).join("");
    const lines = corners.map((p) => k.pathOf([at(lens), at(p)])).join("");
    const locked = lockAge > 0.75;
    return `<path class="sight-line" d="${lines}"/><path class="sight-mark"${locked ? ' data-locked=""' : ""} d="${marks}"/>`;
  }

  function draw() {
    robotG.setAttribute("transform", k.translateAlong(P, [drive.x, 0, 0]));
    const q = current();
    const carriedSvg = carried ? fruitAt(carried, M.chain(q).tip) : holding ? fruitAt(holding, localOf(holding)) : false;
    const armSvg = arm.svg(q, { carried: carriedSvg });
    if (armSvg !== lastArm) { armG.innerHTML = armSvg; lastArm = armSvg; }
    for (const w of wheels) {
      // a wheel on the far side faces the other way, so it turns the other way on its own axis
      const t = turn * (w.F.a[1] > 0 ? 1 : -1);
      if (w.tread) w.tread.innerHTML = arm.tread(w.F, t);
      if (w.hub) w.hub.innerHTML = arm.hub(w.F, t);
    }
    sightG.innerHTML = sight();
    for (const f of fruits) {
      if (!f.el) continue;
      f.el.style.display = f.on ? "" : "none";
      if (f.scar) f.scar.style.display = f.on || holding === f ? "none" : "";
      if (f.on && f.grow.x < 1) {
        const [x, y] = k.iso(f.at, P);
        const s = Math.max(0.001, f.grow.x);
        f.el.setAttribute("transform", `translate(${x.toFixed(2)} ${y.toFixed(2)}) scale(${s.toFixed(3)}) translate(${(-x).toFixed(2)} ${(-y).toFixed(2)})`);
      } else f.el.removeAttribute("transform");
    }
    cupG.innerHTML = falling ? fruitAt(falling.fruit, [falling.x, falling.y, falling.z]) : "";
    say(readout());
  }

  function readout() {
    if (job?.phase === "drive") return `driving · ${(Math.abs(driveTo - drive.x) * 0.25).toFixed(1)} cm to go`;
    if (job && aim && job.phase === "lock") return lockAge > 0.75 ? (aim.ripe ? "ripe · picking it" : "not ripe · leaving it") : "focusing";
    if (job?.phase === "leave") return "not ripe · leaving it";
    if (carried || job?.phase === "carry" || job?.phase === "release") return "picked · into the cup";
    if (falling || job?.phase === "home") return `in the cup · ${inCup + (falling ? 1 : 0)}`;
    if (job && ["approach", "reach", "grip"].includes(job.phase)) return "ripe · picking it";
    if (job?.phase === "wait") return "new fruit growing";
    return `scanning · ${ripeLeft()} ripe`;
  }

  // ------------------------------------------------------------ loop
  function tick(now) {
    const dt = last ? Math.min((now - last) / 1000, 1 / 30) : 1 / 60;
    last = now;
    clock += dt;
    const calm = still.matches;
    if (job?.phase === "wait" && clock - job.at > 1.4) job = null;
    tour();
    step();
    let moving = settle(drive, driveTo, dt, 0.4, calm);
    turn = -drive.x / M.WHEEL_R;
    for (const j of joints) moving = settle(pose[j], want[j], dt, j === "grip" ? 0.1 : 0.2, calm) || moving;
    if (aim && (!job || job.phase !== "drive")) lockAge += dt;
    if (falling) {
      falling.v += M.GRAVITY * dt;
      falling.z -= falling.v * dt;
      const floor = M.TOP + 1.4 + M.FRUIT_R + inCup * 2;
      if (calm || falling.z <= floor) { falling = null; inCup += 1; }
      moving = true;
    }
    for (const f of fruits) if (f.on && f.grow.x < 1) moving = settle(f.grow, 1, dt, 0.35, calm) || moving;
    draw();
    const busy = touring || job || falling || moving || (aim && lockAge < 1);
    frame = visible && busy ? requestAnimationFrame(tick) : 0;
  }
  const run = () => { if (!frame && visible) { last = 0; frame = requestAnimationFrame(tick); } };
  const pause = () => {
    touring = false;
    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => { touring = !still.matches; run(); }, 3600);
  };

  // ------------------------------------------------------------ input
  const pick = (f) => {
    pause();
    if (!f || !f.on) return;
    if (job && job.phase !== "drive" && job.phase !== "lock" && job.phase !== "leave") return; // let a pick finish
    start(f);
    run();
  };
  const fruitUnder = (event) => {
    const box = svg.getBoundingClientRect();
    const vb = svg.viewBox.baseVal;
    const x = ((event.clientX - box.left) / box.width) * vb.width;
    const y = ((event.clientY - box.top) / box.height) * vb.height;
    let best = null;
    let bestD = event.pointerType === "mouse" ? 14 : 26; // a fingertip needs a bigger target
    for (const f of fruits) {
      if (!f.on) continue;
      const [fx, fy] = k.iso(f.at, P);
      const d = Math.hypot(fx - x, fy - y);
      if (d < bestD) { best = f; bestD = d; }
    }
    return best;
  };
  stage.addEventListener("pointermove", (event) => {
    if (event.pointerType !== "mouse") return;
    const f = fruitUnder(event);
    stage.style.cursor = f ? "pointer" : "";
    if (f && f !== aim && (!job || ["drive", "lock", "leave"].includes(job.phase))) pick(f);
  });
  stage.addEventListener("click", (event) => { const f = fruitUnder(event); if (f) pick(f); });
  stage.addEventListener("keydown", (event) => {
    const list = fruits.filter((f) => f.on);
    if (!list.length) return;
    const here = Math.max(0, list.indexOf(aim));
    let to = null;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") to = list[(here + 1) % list.length];
    if (event.key === "ArrowLeft" || event.key === "ArrowUp") to = list[(here - 1 + list.length) % list.length];
    if (event.key === "Home") to = list[0];
    if (event.key === "End") to = list[list.length - 1];
    if (event.key === "Enter" || event.key === " ") to = aim ?? list[0];
    if (!to) return;
    event.preventDefault();
    pick(to);
  });
  const io = new IntersectionObserver((entries) => { visible = entries[entries.length - 1].isIntersecting; if (visible) run(); }, { rootMargin: "120px 0px" });
  io.observe(stage);
  still.addEventListener?.("change", () => { touring = !still.matches; run(); });
  draw();
  return () => { io.disconnect(); cancelAnimationFrame(frame); clearTimeout(idleTimer); };
}
