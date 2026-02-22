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

let current = recurse(INITIAL_DEPTH);
let targetDepth = INITIAL_DEPTH;
let lastStep = 0;
let lastValue = current.value;
let lastBackgroundValue = current.value;
let stepsSinceFlip = 0;

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

  if (current.value !== lastBackgroundValue) {
    audio.playTransition(current.value);
    lastBackgroundValue = current.value;
  }
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
requestAnimationFrame(animate);

document.addEventListener("click", () => {
  audio.unlock();
  targetDepth = sample(CLICK_TARGET_DEPTH_OPTIONS);
});
document.addEventListener("keydown", audio.unlock);
window.addEventListener("resize", () => {
  current = renderConstrained(current).next;
});
