import {
  STEP_MS,
  STEP_MS_DRIFT_PER_STEP,
  STEP_MS_MAX,
  STEP_MS_MIN,
  STEP_MS_RETURN_RATE,
  TEMPO_BURST_CHANCE,
  TEMPO_BURST_LENGTH_MAX,
  TEMPO_BURST_LENGTH_MIN,
  TEMPO_BURST_MULTIPLIER,
  TEMPO_LULL_CHANCE,
  TEMPO_LULL_LENGTH_MAX,
  TEMPO_LULL_LENGTH_MIN,
  TEMPO_LULL_MULTIPLIER,
} from "./config";
import { clamp, randomInt } from "./utils";

export const createTempo = () => {
  let stepIntervalMs = STEP_MS;
  let burstStepsLeft = 0;
  let lullStepsLeft = 0;

  const interval = () => stepIntervalMs;

  const update = () => {
    if (burstStepsLeft > 0) {
      burstStepsLeft -= 1;
      stepIntervalMs = clamp(STEP_MS * TEMPO_BURST_MULTIPLIER, STEP_MS_MIN, STEP_MS_MAX);
      return;
    }

    if (lullStepsLeft > 0) {
      lullStepsLeft -= 1;
      stepIntervalMs = clamp(STEP_MS * TEMPO_LULL_MULTIPLIER, STEP_MS_MIN, STEP_MS_MAX);
      return;
    }

    if (Math.random() < TEMPO_BURST_CHANCE) {
      burstStepsLeft = randomInt(TEMPO_BURST_LENGTH_MIN, TEMPO_BURST_LENGTH_MAX);
      return;
    }

    if (Math.random() < TEMPO_LULL_CHANCE) {
      lullStepsLeft = randomInt(TEMPO_LULL_LENGTH_MIN, TEMPO_LULL_LENGTH_MAX);
      return;
    }

    const drift = (Math.random() * 2 - 1) * STEP_MS_DRIFT_PER_STEP;
    const relaxed = stepIntervalMs + (STEP_MS - stepIntervalMs) * STEP_MS_RETURN_RATE;
    stepIntervalMs = clamp(relaxed + drift, STEP_MS_MIN, STEP_MS_MAX);
  };

  return { interval, update };
};
