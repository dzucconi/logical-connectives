import { Statement } from "./lib/connectives";
import { createTransitionAudio } from "./app/audio";
import {
  CLICK_TARGET_DEPTH_OPTIONS,
  CONSTRAIN_MAX_SHRINK_STEPS,
  FONT_SIZE_RECOVERY_BUFFER,
  FORCE_FLIP_AFTER_STEPS,
  HEIGHT_TARGET,
  INITIAL_DEPTH,
  MAX_DEPTH,
  MIN_DEPTH,
  MIN_FONT_SIZE,
  TARGET_DEPTH_NUDGE_CHOICES,
  TARGET_DEPTH_RANDOM_NUDGE_CHANCE,
} from "./app/config";
import {
  evolve,
  forceTruthFlip,
  recurse,
  shrinkOnce,
  treeDepth,
} from "./app/evolution";
import { createTempo } from "./app/tempo";
import { sample } from "./app/utils";
import { createViewport } from "./app/viewport";

const ROOT = document.getElementById("root");
if (!ROOT) {
  throw new Error("Root element not found");
}

const viewport = createViewport(ROOT);
const audio = createTransitionAudio();
const tempo = createTempo();
const IDLE_MS = 1800;
const soundToggle = document.createElement("button");
soundToggle.type = "button";
soundToggle.className = "sound-toggle";
document.body.appendChild(soundToggle);

let current = recurse(INITIAL_DEPTH);
let targetDepth = INITIAL_DEPTH;
let lastStep = 0;
let lastValue = current.value;
let lastBackgroundValue = current.value;
let lastStatementText = current.toString();
let stepsSinceFlip = 0;
let idleTimer: number | undefined;

const renderSoundToggle = () => {
  const state = audio.getState();
  soundToggle.textContent = state.enabled ? "🔊" : "🔇";
  soundToggle.setAttribute(
    "aria-label",
    state.enabled ? "Disable sound" : "Enable sound"
  );
  soundToggle.dataset.state = state.enabled ? "on" : "off";
  soundToggle.disabled = !state.supported;
};

const clearIdleTimer = () => {
  if (idleTimer) {
    window.clearTimeout(idleTimer);
    idleTimer = undefined;
  }
};

const scheduleIdle = () => {
  clearIdleTimer();
  if (!audio.getState().enabled) {
    document.body.classList.remove("idle-ui");
    return;
  }

  idleTimer = window.setTimeout(() => {
    document.body.classList.add("idle-ui");
  }, IDLE_MS);
};

const wakeUi = () => {
  document.body.classList.remove("idle-ui");
  scheduleIdle();
};

const renderConstrained = (state: Statement) => {
  let next = state;
  let fontSize = viewport.render(next);
  let guard = 0;

  while (
    fontSize < MIN_FONT_SIZE &&
    treeDepth(next) > MIN_DEPTH &&
    guard < CONSTRAIN_MAX_SHRINK_STEPS
  ) {
    next = shrinkOnce(next);
    fontSize = viewport.render(next);
    guard += 1;
  }

  return { next, fontSize };
};

const nudgeTargetDepth = (fontSize: number) => {
  const fill = viewport.getFill();
  const depth = treeDepth(current);

  if (fill.height < HEIGHT_TARGET && depth < MAX_DEPTH) {
    targetDepth = Math.min(MAX_DEPTH, targetDepth + 1);
  }
  if (fontSize < MIN_FONT_SIZE + FONT_SIZE_RECOVERY_BUFFER && depth > MIN_DEPTH) {
    targetDepth = Math.max(MIN_DEPTH, targetDepth - 1);
  }
  if (Math.random() < TARGET_DEPTH_RANDOM_NUDGE_CHANCE) {
    targetDepth = Math.max(
      MIN_DEPTH,
      Math.min(MAX_DEPTH, targetDepth + sample(TARGET_DEPTH_NUDGE_CHOICES))
    );
  }
};

const step = () => {
  current = evolve(current, targetDepth);
  let frame = renderConstrained(current);
  current = frame.next;

  if (current.value === lastValue) {
    stepsSinceFlip += 1;
  } else {
    stepsSinceFlip = 0;
    lastValue = current.value;
  }

  if (stepsSinceFlip >= FORCE_FLIP_AFTER_STEPS) {
    frame = renderConstrained(forceTruthFlip(current));
    current = frame.next;
    stepsSinceFlip = 0;
    lastValue = current.value;
  }

  const statementText = current.toString();
  const didFlip = current.value !== lastBackgroundValue;
  const didChangeStatement = statementText !== lastStatementText;

  if (didFlip) {
    audio.playTransition(current.value);
    lastBackgroundValue = current.value;
  } else if (didChangeStatement) {
    audio.playMicro(current.value);
  }

  lastStatementText = statementText;
  nudgeTargetDepth(frame.fontSize);
};

const animate = (timestamp: number) => {
  if (timestamp - lastStep >= tempo.interval()) {
    step();
    tempo.update();
    lastStep = timestamp;
  }
  requestAnimationFrame(animate);
};

current = renderConstrained(current).next;
renderSoundToggle();
requestAnimationFrame(animate);

document.addEventListener("click", () => {
  const state = audio.getState();
  if (!state.enabled) {
    audio.setEnabled(true);
    renderSoundToggle();
  }
  targetDepth = sample(CLICK_TARGET_DEPTH_OPTIONS);
  wakeUi();
});
soundToggle.addEventListener("click", (event) => {
  event.stopPropagation();
  const state = audio.getState();
  audio.setEnabled(!state.enabled);
  wakeUi();
  renderSoundToggle();
});
window.addEventListener("pointermove", wakeUi);
window.addEventListener("pointerdown", wakeUi);
window.addEventListener("keydown", wakeUi);
window.addEventListener("resize", () => {
  current = renderConstrained(current).next;
});

document.addEventListener("dblclick", () => {
  if (document.fullscreenElement) {
    void document.exitFullscreen();
    return;
  }
  void document.documentElement.requestFullscreen();
});
