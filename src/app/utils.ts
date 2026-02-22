export const sample = <T>(xs: readonly T[]): T =>
  xs[Math.floor(Math.random() * xs.length)];

export const randomInt = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

export const flip = (threshold = 0.5) => Math.random() > threshold;

export const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));
