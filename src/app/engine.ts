import { Statement } from "../lib/connectives";
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
} from "./config";
import {
  evolve,
  forceTruthFlip,
  recurse,
  shrinkOnce,
  treeDepth,
} from "./evolution";
import type { TempoController } from "./tempo";
import { sample } from "./utils";
import type { ViewportController } from "./viewport";
import type { TransitionAudio } from "./audio";

type EngineDeps = {
  viewport: ViewportController;
  tempo: TempoController;
  audio: TransitionAudio;
};

export type EngineController = {
  start: () => void;
  click: () => void;
  resize: () => void;
  togglePause: () => boolean;
};

export const createEngine = ({ viewport, tempo, audio }: EngineDeps): EngineController => {
  const pauseStateKey = "__logicalConnectivesPaused";
  const getPaused = () => Boolean((globalThis as Record<string, unknown>)[pauseStateKey]);
  const setPaused = (next: boolean) => {
    (globalThis as Record<string, unknown>)[pauseStateKey] = next;
  };

  if ((globalThis as Record<string, unknown>)[pauseStateKey] === undefined) {
    setPaused(false);
  }

  let current = recurse(INITIAL_DEPTH);
  let targetDepth = INITIAL_DEPTH;
  let lastStep = 0;
  let lastValue = current.value;
  let lastBackgroundValue = current.value;
  let lastStatementText = current.toString();
  let stepsSinceFlip = 0;
  let started = false;

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
    if (!getPaused() && timestamp - lastStep >= tempo.interval()) {
      step();
      tempo.update();
      lastStep = timestamp;
    }
    requestAnimationFrame(animate);
  };

  const start = () => {
    if (started) {
      return;
    }
    started = true;
    current = renderConstrained(current).next;
    requestAnimationFrame(animate);
  };

  const click = () => {
    targetDepth = sample(CLICK_TARGET_DEPTH_OPTIONS);
  };

  const resize = () => {
    current = renderConstrained(current).next;
  };

  const togglePause = () => {
    const next = !getPaused();
    setPaused(next);
    return next;
  };

  return { start, click, resize, togglePause };
};
