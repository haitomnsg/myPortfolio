// The three small rovers, live (Figs 3–5). Each mount takes the stage holding the figure's <svg>, the
// kit (k, G), its model (M), the wheel drawer (W) and the build's data, and returns a stop function.
// Motion runs only while the figure is on screen; with reduced motion every change lands at once.

/** A critically damped spring toward `target`; false once it has settled. */
function settle(s, target, dt, seconds, calm, top = Infinity) {
  if (calm) { s.x = target; s.v = 0; return false; }
  const w = 1 / seconds;
  for (let i = 0; i < 4; i++) {
    s.v += (w * w * (target - s.x) - 2 * w * s.v) * (dt / 4);
    s.v = Math.max(-top, Math.min(top, s.v));
    s.x += s.v * (dt / 4);
  }
  if (Math.abs(target - s.x) < 0.05 && Math.abs(s.v) < 0.05) { s.x = target; s.v = 0; return false; }
  return true;
}

/** The frame loop every rover shares: `step(dt, calm)` returns true while anything still moves. */
function loopOf(stage, step) {
  const still = matchMedia("(prefers-reduced-motion: reduce)");
  let visible = false;
  let frame = 0;
  let last = 0;
  const tick = (now) => {
    const dt = last ? Math.min((now - last) / 1000, 1 / 30) : 1 / 60;
    last = now;
    const moving = step(dt, still.matches);
    frame = visible && moving && !still.matches ? requestAnimationFrame(tick) : 0;
  };
  const run = () => {
    if (still.matches) { step(0, true); return; }
    if (!frame && visible) { last = 0; frame = requestAnimationFrame(tick); }
  };
  const io = new IntersectionObserver((entries) => { visible = entries[entries.length - 1].isIntersecting; if (visible) run(); }, { rootMargin: "120px 0px" });
  io.observe(stage);
  still.addEventListener?.("change", run);
  return { run, still, stop: () => { io.disconnect(); cancelAnimationFrame(frame); still.removeEventListener?.("change", run); } };
}

/** Where the pointer is across the drawing, 0 at its left edge to 1 at its right. */
const shareOf = (svg, event, inset = 0.12) => {
  const box = svg.getBoundingClientRect();
  return Math.min(1, Math.max(0, ((event.clientX - box.left) / box.width - inset) / (1 - inset * 2)));
};

/** Redraws a wheel's tread or rollers only when its turn has changed. */
function wheelsOf(svg, { k, G, W, data }) {
  const P = data.P;
  return data.wheels.map((wh) => {
    const el = svg.querySelector(`[data-wheel="${wh.name}"]`);
    let drawn = 0;
    return {
      ...wh,
      turn(phase) {
        if (!el || Math.abs(phase - drawn) < 0.004) return;
        el.innerHTML = W.surface(k, G, P, wh.F, wh.kind, wh.r, wh.w2, phase, wh.hand ?? 1);
        drawn = phase;
      },
    };
  });
}

// ---------------------------------------------------------------- Fig 3, the face tracker
/**
 * Traffic-sign mode: the sign rides its rail under the pointer, and the rover strafes sideways on its
 * mecanum wheels, with a lag, to keep the sign centred in front of the MU sensor.
 *
 * @param {HTMLElement} stage the element holding the figure's <svg>
 * @param {{ k: any, G: any, M: any, W: any, data: any, say?: (text: string) => void, describe?: (text: string) => void }} opts
 * @returns {() => void} stops the figure
 */
export function mountFaceTracker(stage, { k, G, M, W, data, say = (text) => void text, describe = (text) => void text }) {
  const svg = stage.querySelector("svg");
  const P = data.P;
  const signG = svg.querySelector("[data-sign]");
  const roverG = svg.querySelector("[data-rover]");
  const sight = svg.querySelector("[data-sight]");
  const wheels = wheelsOf(svg, { k, G, W, data });
  // strafing, one diagonal pair of wheels turns one way and the other pair the other way
  const spin = { wheelLf: 1, wheelRb: 1, wheelRf: -1, wheelLb: -1 };
  const face = M.RAIL.x + M.RAIL.w / 2 + 3.4;

  const sign = { x: 0, v: 0 };
  const rover = { x: 0, v: 0 };
  let want = 0;
  let steering = false;
  let idle = 0;
  let clock = 0;
  const TOUR = [-58, 46, -22, 78, 0];

  const at = (p) => k.iso(p, P);
  const corner = (y, z, dy, dz, arm) => k.pathOf([at([face, y, z + dz * arm]), at([face, y, z]), at([face, y + dy * arm, z])]);
  function draw() {
    signG.setAttribute("transform", k.translateAlong(P, [0, sign.x, 0]));
    roverG.setAttribute("transform", k.translateAlong(P, [0, rover.x, 0]));
    for (const wh of wheels) wh.turn(((spin[wh.name] ?? 1) * Math.sign(wh.F.a[1]) * rover.x) / wh.r);
    // the focus box closes on the sign as the rover centres it
    const err = sign.x - rover.x;
    const h = M.SIGN.r + 4 + Math.min(10, Math.abs(err) * 0.25);
    const z = M.SIGN.z;
    const y = sign.x;
    const lens = [M.LENS[0], M.LENS[1] + rover.x, M.LENS[2]];
    sight.innerHTML =
      `<path class="sight-line" d="${k.pathOf([at(lens), at([face, y, z])])}"/>` +
      `<path class="sight-mark" d="${[corner(y - h, z - h, 1, 1, 6), corner(y + h, z - h, -1, 1, 6), corner(y - h, z + h, 1, -1, 6), corner(y + h, z + h, -1, -1, 6)].join("")}"/>`;
    say(readout(err));
  }
  function readout(err) {
    const n = Math.round(Math.abs(err));
    if (n < 3) return "sign · centred";
    // on screen, and so to the rover as you look over its back, -y is its right
    const side = err < 0 ? "right" : "left";
    const stuck = Math.abs(rover.x) > M.STRAFE - 0.5 && Math.abs(sign.x) > M.STRAFE && Math.abs(rover.v) < 1;
    return `sign · ${n} mm ${side} · ${stuck ? "end of travel" : "strafing"}`;
  }

  const loop = loopOf(stage, (dt, calm) => {
    if (!steering) {
      clock += dt;
      want = TOUR[Math.floor(clock / 2.8) % TOUR.length];
    } else if ((idle += dt) > 3.2) {
      steering = false;
      clock = 0;
    }
    const a = settle(sign, want, dt, 0.16, calm);
    const b = settle(rover, Math.max(-M.STRAFE, Math.min(M.STRAFE, sign.x)), dt, 0.34, calm, 150);
    draw();
    // the tour keeps the loop going until the pointer has been away a while
    return a || b || !steering || idle < 3.2;
  });
  const aim = (y, why) => {
    want = Math.max(-M.SIGN_RANGE, Math.min(M.SIGN_RANGE, y));
    steering = true;
    idle = 0;
    if (why) describe(why);
    loop.run();
  };
  // screen right is -y on this bench
  const fromPointer = (event) => aim(M.SIGN_RANGE * (1 - 2 * shareOf(svg, event)));
  const onMove = (event) => { if (event.pointerType === "mouse") fromPointer(event); };
  const onDown = (event) => { if (event.pointerType !== "mouse") fromPointer(event); };
  const onLeave = () => { idle = 2.2; };
  const onKey = (event) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    aim((steering ? want : sign.x) + (event.key === "ArrowLeft" ? 20 : -20), "The sign moves; the rover strafes to keep it centred.");
  };
  stage.addEventListener("pointermove", onMove);
  stage.addEventListener("pointerdown", onDown);
  stage.addEventListener("pointerleave", onLeave);
  stage.addEventListener("keydown", onKey);
  draw();
  return () => {
    loop.stop();
    stage.removeEventListener("pointermove", onMove);
    stage.removeEventListener("pointerdown", onDown);
    stage.removeEventListener("pointerleave", onLeave);
    stage.removeEventListener("keydown", onKey);
  };
}

// ---------------------------------------------------------------- Fig 4, the obstacle car
/**
 * The car on its stand runs its loop: drive while the way ahead is clear; when the wall is closer than
 * STOP, stop, turn the sensor left and right, then turn the wheels toward the side with more room.
 * The wall rides its rail under the pointer.
 *
 * @param {HTMLElement} stage the element holding the figure's <svg>
 * @param {{ k: any, G: any, M: any, W: any, data: any, say?: (text: string) => void, describe?: (text: string) => void }} opts
 * @returns {() => void} stops the figure
 */
export function mountObstacleCar(stage, { k, G, M, W, data, say = (text) => void text, describe = (text) => void text }) {
  const svg = stage.querySelector("svg");
  const P = data.P;
  const headG = svg.querySelector("[data-head]");
  const sonarG = svg.querySelector("[data-sonar]");
  const wallG = svg.querySelector("[data-wall]");
  const wheels = wheelsOf(svg, { k, G, W, data });
  const at = (p) => k.iso(p, P);

  const wall = { x: 42, v: 0 };
  const head = { x: 0, v: 0 }; // degrees toward the car's left
  const speed = { L: { x: 0, v: 0 }, R: { x: 0, v: 0 } }; // each side's tyre speed, mm/s
  const roll = { L: 0, R: 0 };
  let want = 42;
  let steering = false;
  let idle = 0;
  let tourAt = 0;
  let tourT = 0;
  const TOUR = [[42, 5.2], [91, 3.4], [-42, 5.2], [0, 5.2], [-91, 3.4]];
  // the loop: "drive", "look" (through LOOKS), "turn", "pause"
  let mode = "drive";
  let modeT = 0;
  let look = 0;
  let held = 0;
  let seen = {};
  let choice = "";
  let ping = 0;
  const LOOKS = [["ahead", 0, 0.35], ["left", M.LOOK, 0.5], ["right", -M.LOOK, 0.5], ["", 0, 0.15]];
  const DRIVE = 220;

  const mm = (d) => (d >= M.RANGE ? "clear" : `${Math.round(d)} mm`);
  const ahead = () => M.rangeAt(0, wall.x);
  function readout() {
    if (mode === "drive") return `ahead ${mm(ahead())} · driving`;
    const part = (key) => (key in seen ? mm(seen[key]) : "…");
    const line = `left ${part("left")} · ahead ${part("ahead")} · right ${part("right")}`;
    return choice ? `${line} → ${choice}` : line;
  }

  let drawnHead = NaN;
  function draw(calm) {
    wallG.setAttribute("transform", k.translateAlong(P, [0, wall.x, 0]));
    if (!(Math.abs(head.x - drawnHead) <= 0.05)) {
      headG.innerHTML = M.headOf(k, G, P, head.x).map((p) => M.pieceSvgOf(k, p)).join("");
      drawnHead = head.x;
    }
    for (const wh of wheels) wh.turn(wh.F.a[1] < 0 ? roll.L : roll.R);
    // the sonar cone, to the echo or fading out when nothing answers
    const d = M.rangeAt(head.x, wall.x);
    const reach = d >= M.RANGE ? 96 : Math.min(d, 150);
    const { o } = M.eyeOf(head.x);
    const arc = (r, from, to, n = 12) => Array.from({ length: n + 1 }, (_, i) => {
      const a = ((head.x + from + ((to - from) * i) / n) * Math.PI) / 180;
      return at([o[0] + Math.cos(a) * r, o[1] - Math.sin(a) * r, o[2]]);
    });
    const fan = [at(o), ...arc(reach, -M.CONE, M.CONE)];
    let out = `<path class="sonar"${d >= M.RANGE ? ' data-clear=""' : ""} d="${k.pathOf(fan, true)}"/>`;
    if (!calm) out += `<path class="sonar-arc" d="${k.pathOf(arc(reach * ping, -M.CONE * 0.9, M.CONE * 0.9, 8))}"/>`;
    if (d < M.RANGE) out += `<path class="sight-mark" d="${k.pathOf(arc(reach, -M.CONE, M.CONE))}"/>`;
    sonarG.innerHTML = out;
    say(readout());
  }

  function setMode(next) { mode = next; modeT = 0; }
  function think(dt, calm) {
    if (calm) {
      // without motion: one full reading, laid out at once
      const a = ahead();
      head.x = 0;
      if (a < M.STOP) {
        seen = { ahead: a, left: M.rangeAt(M.LOOK, wall.x), right: M.rangeAt(-M.LOOK, wall.x) };
        choice = seen.left > seen.right ? "left" : "right";
        mode = "turn";
      } else { seen = {}; choice = ""; mode = "drive"; }
      return;
    }
    modeT += dt;
    let vl = 0;
    let vr = 0;
    let aim = 0;
    if (mode === "drive") {
      vl = vr = DRIVE;
      if (ahead() < M.STOP) { setMode("look"); look = 0; held = 0; seen = {}; choice = ""; describe(`Wall ${mm(ahead())} ahead: the car stops and looks left and right.`); }
    } else if (mode === "look") {
      const [key, deg, hold] = LOOKS[look];
      aim = deg;
      // a reading is taken once the head has settled and held
      if (Math.abs(head.x - deg) < 0.5 && Math.abs(head.v) < 2) {
        held += dt;
        if (held > hold) {
          if (key) seen[key] = M.rangeAt(deg, wall.x);
          held = 0;
          look += 1;
          if (look >= LOOKS.length) {
            choice = seen.left > seen.right ? "left" : "right";
            describe(`Left ${mm(seen.left)}, right ${mm(seen.right)}: it turns ${choice}.`);
            setMode("turn");
          }
        }
      }
    } else if (mode === "turn") {
      // a turn on the spot: one side forward, the other back (the car's left is -y)
      vl = choice === "left" ? -DRIVE * 0.7 : DRIVE * 0.7;
      vr = -vl;
      if (modeT > 1.3) setMode("pause");
    } else if (mode === "pause") {
      if (modeT > 0.9) { setMode("drive"); seen = {}; choice = ""; }
    }
    settle(head, aim, dt, 0.09, false, 420);
    settle(speed.L, vl, dt, 0.12, false);
    settle(speed.R, vr, dt, 0.12, false);
    roll.L -= (speed.L.x * dt) / M.WHEEL.r;
    roll.R -= (speed.R.x * dt) / M.WHEEL.r;
    ping = (ping + dt * 2.6) % 1;
  }

  const loop = loopOf(stage, (dt, calm) => {
    if (!steering) {
      tourT += dt;
      if (tourT > TOUR[tourAt][1]) { tourT = 0; tourAt = (tourAt + 1) % TOUR.length; }
      want = TOUR[tourAt][0];
    } else if ((idle += dt) > 3.2) { steering = false; tourT = 0; }
    settle(wall, want, dt, 0.16, calm);
    think(dt, calm);
    draw(calm);
    return true;
  });
  const aim = (y) => {
    want = Math.max(-M.WALL_RANGE, Math.min(M.WALL_RANGE, y));
    steering = true;
    idle = 0;
    loop.run();
  };
  const fromPointer = (event) => aim(M.WALL_RANGE * (1 - 2 * shareOf(svg, event)));
  const onMove = (event) => { if (event.pointerType === "mouse") fromPointer(event); };
  const onDown = (event) => { if (event.pointerType !== "mouse") fromPointer(event); };
  const onLeave = () => { idle = 2.2; };
  const onKey = (event) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    aim((steering ? want : wall.x) + (event.key === "ArrowLeft" ? 20 : -20));
  };
  stage.addEventListener("pointermove", onMove);
  stage.addEventListener("pointerdown", onDown);
  stage.addEventListener("pointerleave", onLeave);
  stage.addEventListener("keydown", onKey);
  think(0, loop.still.matches);
  draw(true);
  return () => {
    loop.stop();
    stage.removeEventListener("pointermove", onMove);
    stage.removeEventListener("pointerdown", onDown);
    stage.removeEventListener("pointerleave", onLeave);
    stage.removeEventListener("keydown", onKey);
  };
}

// ---------------------------------------------------------------- Fig 5, the rescue vehicle
/**
 * Hover (or tap, or press Enter) and the drone spins up, lifts off the roof and flies out over the
 * bench while the arm behind the cabin unfolds; leave and both come back.
 *
 * @param {HTMLElement} stage the element holding the figure's <svg>
 * @param {{ k: any, G: any, M: any, W: any, data: any, say?: (text: string) => void, describe?: (text: string) => void }} opts
 * @returns {() => void} stops the figure
 */
export function mountRescue(stage, { k, G, M, W, data, say = (text) => void text, describe = (text) => void text }) {
  void W;
  const svg = stage.querySelector("svg");
  const P = data.P;
  const droneG = svg.querySelector("[data-drone]");
  const propsG = svg.querySelector("[data-props]");
  const armG = svg.querySelector("[data-arm]");
  const trailG = svg.querySelector("[data-trail]");
  const at = (p) => k.iso(p, P);

  const fly = { x: 0, v: 0 };
  const arm = { x: 0, v: 0 };
  const rpm = { x: 0, v: 0 }; // propeller speed, 0..1
  let spin = 0;
  let active = false;
  let steering = false;
  let idle = 0;
  let clock = 0;
  const TOUR = [2.6, 6.4]; // seconds docked, then out

  let drawnArm = NaN;
  let drawnFly = NaN;
  function draw() {
    const off = M.flightOf(fly.x);
    if (fly.x !== drawnFly) {
      droneG.setAttribute("transform", k.translateAlong(P, off));
      // the way back to the pad, and the pad waiting for it
      if (fly.x > 0.03) {
        const path = Array.from({ length: 18 }, (_, i) => {
          const o = M.flightOf((fly.x * i) / 17);
          return at([M.DOCK[0] + o[0], M.DOCK[1] + o[1], M.DOCK[2] + 8 + o[2]]);
        });
        trailG.innerHTML = `<path class="sight-mark" d="${k.ring(M.DOCK[0], M.DOCK[1], 18, M.DOCK[2], P, 48)}"/><path class="sight-line" d="${k.pathOf(path)}"/>`;
      } else trailG.innerHTML = "";
      drawnFly = fly.x;
    }
    if (!(Math.abs(arm.x - drawnArm) <= 0.002)) {
      armG.innerHTML = M.armOf(k, G, P, arm.x).pieces.map((p) => M.pieceSvgOf(k, p)).join("");
      drawnArm = arm.x;
    }
    propsG.innerHTML = M.propsOf(k, G, P, spin, rpm.x * 0.55);
    say(readout(off));
  }
  function readout(off) {
    const armText = arm.x > 0.97 ? "arm out" : arm.x < 0.03 ? "arm folded" : "arm moving";
    if (fly.x < 0.01) return `drone docked · ${armText}`;
    return `drone · ${Math.round(off[2])} mm up · ${armText}`;
  }

  const loop = loopOf(stage, (dt, calm) => {
    if (!steering) {
      clock += dt;
      const period = TOUR[0] + TOUR[1];
      const want = clock % period > TOUR[0];
      if (want !== active) active = want;
    } else if ((idle += dt) > 3.2 && !active) { steering = false; clock = 0; }
    // the props spin up before lift-off and down only after landing
    const ready = rpm.x > 0.85;
    const r = settle(rpm, active || fly.x > 0.02 ? 1 : 0, dt, 0.22, calm);
    const f = settle(fly, active && (ready || calm) ? 1 : 0, dt, 0.7, calm, 0.9);
    const a = settle(arm, active ? 1 : 0, dt, 0.5, calm, 1.4);
    if (!calm) spin += rpm.x * dt * 38;
    draw();
    return r || f || a || rpm.x > 0 || !steering;
  });
  const set = (on) => {
    if (on !== active) describe(on ? "The drone lifts off and the arm unfolds." : "The drone lands on its pad and the arm folds.");
    active = on;
    steering = true;
    idle = 0;
    loop.run();
  };
  // a pointer already inside when the figure mounts never "enters", so moving counts too
  const onEnter = (event) => { if (event.pointerType === "mouse" && !(steering && active)) set(true); };
  const onLeave = (event) => { if (event.pointerType === "mouse") set(false); };
  const onDown = (event) => { if (event.pointerType !== "mouse") set(!active); };
  const onKey = (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    set(!active);
  };
  stage.addEventListener("pointerenter", onEnter);
  stage.addEventListener("pointermove", onEnter);
  stage.addEventListener("pointerleave", onLeave);
  stage.addEventListener("pointerdown", onDown);
  stage.addEventListener("keydown", onKey);
  draw();
  return () => {
    loop.stop();
    stage.removeEventListener("pointerenter", onEnter);
    stage.removeEventListener("pointermove", onEnter);
    stage.removeEventListener("pointerleave", onLeave);
    stage.removeEventListener("pointerdown", onDown);
    stage.removeEventListener("keydown", onKey);
  };
}
