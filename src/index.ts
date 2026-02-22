import { Statement, Bool, CONNECTIVES, Operator } from "./lib/connectives";

const ROOT = document.getElementById("root");

if (!ROOT) {
  throw new Error("Root element not found");
}

const MIN_DEPTH = 4;
const MAX_DEPTH = 12;
const MIN_FONT_SIZE = 14;
const STEP_MS = 110;
const STEP_MS_MIN = 55;
const STEP_MS_MAX = 240;
const STEP_MS_DRIFT_PER_STEP = 10;
const STEP_MS_RETURN_RATE = 0.08;

const TEMPO_BURST_CHANCE = 0.08;
const TEMPO_BURST_MULTIPLIER = 0.5;
const TEMPO_BURST_LENGTH_MIN = 6;
const TEMPO_BURST_LENGTH_MAX = 18;

const TEMPO_LULL_CHANCE = 0.05;
const TEMPO_LULL_MULTIPLIER = 1.6;
const TEMPO_LULL_LENGTH_MIN = 8;
const TEMPO_LULL_LENGTH_MAX = 20;

const HEIGHT_TARGET = 0.95;
const FORCE_FLIP_AFTER_STEPS = 10;

const SFX_ENABLED = true;
const SFX_MASTER_GAIN = 0.05;
const SFX_ATTACK_S = 0.005;
const SFX_RELEASE_S = 0.14;
const SFX_TRUE_START_HZ = 640;
const SFX_TRUE_END_HZ = 960;
const SFX_TRUE_DURATION_S = 0.11;
const SFX_FALSE_START_HZ = 300;
const SFX_FALSE_END_HZ = 120;
const SFX_FALSE_DURATION_S = 0.16;
const SFX_DETUNE_CENTS = 9;

const INITIAL_DEPTH = 6;
const CLICK_TARGET_DEPTH_OPTIONS = [5, 6, 7, 8] as const;
const TARGET_DEPTH_NUDGE_CHOICES = [-1, 1] as const;

const RANDOM_BOOL_THRESHOLD = 0.5;
const TARGET_DEPTH_RANDOM_NUDGE_CHANCE = 0.12;

const FIT_FONT_MIN_PX = 1;
const FIT_FONT_TOLERANCE_PX = 0.5;
const FONT_SIZE_RECOVERY_BUFFER = 1;
const CONSTRAIN_MAX_SHRINK_STEPS = 8;

const MUTATE_BOOL_PATH_CHANCE = 0.55;
const EVOLVE_MUTATE_CHANCE = 0.6;
const EVOLVE_GROW_CHANCE = 0.8;

const FORCE_FLIP_ATTEMPTS = 24;
const FORCE_FLIP_MUTATE_CHANCE = 0.7;
const FORCE_FLIP_GROW_CHANCE = 0.85;

const flip = () => Math.random() > RANDOM_BOOL_THRESHOLD;
const randomInt = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const sample = <T>(xs: readonly T[]): T => xs[Math.floor(Math.random() * xs.length)];
const operators = Object.keys(CONNECTIVES) as Operator[];
const sampleOperator = () => sample(operators);
let audioContext: AudioContext | null = null;

const getAudioContext = () => {
  if (!audioContext) {
    audioContext = new AudioContext();
  }
  return audioContext;
};

const unlockAudio = () => {
  if (!SFX_ENABLED) {
    return;
  }

  const ctx = getAudioContext();
  if (ctx.state === "suspended") {
    void ctx.resume();
  }
};

const playSweep = (
  startHz: number,
  endHz: number,
  durationS: number,
  type: OscillatorType,
  detuneCents = 0
) => {
  if (!SFX_ENABLED) {
    return;
  }

  const ctx = getAudioContext();
  if (ctx.state !== "running") {
    return;
  }

  const now = ctx.currentTime;
  const gain = ctx.createGain();
  const osc = ctx.createOscillator();

  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(SFX_MASTER_GAIN, now + SFX_ATTACK_S);
  gain.gain.linearRampToValueAtTime(0, now + durationS + SFX_RELEASE_S);

  osc.type = type;
  osc.frequency.setValueAtTime(startHz, now);
  osc.frequency.exponentialRampToValueAtTime(endHz, now + durationS);
  osc.detune.setValueAtTime(detuneCents, now);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + durationS + SFX_RELEASE_S);
};

const playTransitionSound = (isTrue: boolean) => {
  if (isTrue) {
    playSweep(
      SFX_TRUE_START_HZ,
      SFX_TRUE_END_HZ,
      SFX_TRUE_DURATION_S,
      "triangle",
      SFX_DETUNE_CENTS
    );
    playSweep(SFX_TRUE_START_HZ * 1.5, SFX_TRUE_END_HZ * 1.5, SFX_TRUE_DURATION_S, "sine");
    return;
  }

  playSweep(
    SFX_FALSE_START_HZ,
    SFX_FALSE_END_HZ,
    SFX_FALSE_DURATION_S,
    "sawtooth",
    -SFX_DETUNE_CENTS
  );
  playSweep(
    SFX_FALSE_START_HZ * 1.33,
    SFX_FALSE_END_HZ * 1.2,
    SFX_FALSE_DURATION_S,
    "square"
  );
};

const statement = () => {
  return new Statement(
    new Bool(flip(), flip()),
    sampleOperator(),
    new Bool(flip(), flip())
  );
};

const recurse = (depth: number): Statement => {
  if (depth === 0) {
    return statement();
  }

  return new Statement(
    recurse(depth - 1),
    sampleOperator(),
    recurse(depth - 1)
  );
};

type Node = Bool | Statement;
type Branch = "p" | "q";
type Path = Branch[];

const isStatement = (node: Node): node is Statement => node instanceof Statement;

const getOperator = (node: Statement): Operator => {
  return (node.operator as unknown as { operator: Operator }).operator;
};

const getNodeAt = (node: Node, path: Path): Node => {
  return path.reduce<Node>((current, branch) => {
    if (!isStatement(current)) {
      return current;
    }
    return branch === "p" ? current.p : current.q;
  }, node);
};

const replaceAt = (node: Node, path: Path, replace: (current: Node) => Node): Node => {
  if (path.length === 0) {
    return replace(node);
  }

  if (!isStatement(node)) {
    return node;
  }

  const [branch, ...rest] = path;
  const child = branch === "p" ? node.p : node.q;
  const nextChild = replaceAt(child, rest, replace);
  const p = branch === "p" ? nextChild : node.p;
  const q = branch === "q" ? nextChild : node.q;

  return new Statement(p, getOperator(node), q);
};

const collectPaths = (
  node: Node,
  path: Path = [],
  acc: { bools: Path[]; statements: Path[] } = { bools: [], statements: [] }
) => {
  if (isStatement(node)) {
    acc.statements.push(path);
    collectPaths(node.p, [...path, "p"], acc);
    collectPaths(node.q, [...path, "q"], acc);
  } else {
    acc.bools.push(path);
  }

  return acc;
};

const treeDepth = (node: Node): number => {
  if (!isStatement(node)) {
    return 0;
  }
  return 1 + Math.max(treeDepth(node.p), treeDepth(node.q));
};

const growOnce = (root: Statement): Statement => {
  const paths = collectPaths(root).bools;
  if (paths.length === 0) {
    return root;
  }

  const path = sample(paths);
  const leaf = getNodeAt(root, path);
  if (!(leaf instanceof Bool)) {
    return root;
  }

  const seed = new Bool(flip(), flip());
  const branch = flip()
    ? new Statement(leaf, sampleOperator(), seed)
    : new Statement(seed, sampleOperator(), leaf);

  const next = replaceAt(root, path, () => branch);
  return isStatement(next) ? next : root;
};

const shrinkOnce = (root: Statement): Statement => {
  const paths = collectPaths(root).statements.filter((path) => path.length > 0);
  if (paths.length === 0) {
    return root;
  }

  const path = sample(paths);
  const node = getNodeAt(root, path);
  if (!isStatement(node)) {
    return root;
  }

  const collapsed = new Bool(node.value, false);
  const next = replaceAt(root, path, () => collapsed);
  return isStatement(next) ? next : root;
};

const mutateOnce = (root: Statement): Statement => {
  const paths = collectPaths(root);

  if (Math.random() < MUTATE_BOOL_PATH_CHANCE && paths.bools.length > 0) {
    const path = sample(paths.bools);
    const node = getNodeAt(root, path);
    if (!(node instanceof Bool)) {
      return root;
    }

    const mutated = flip()
      ? new Bool(node._value, !node.negate)
      : new Bool(!node._value, node.negate);

    const next = replaceAt(root, path, () => mutated);
    return isStatement(next) ? next : root;
  }

  const path = sample(paths.statements);
  const node = getNodeAt(root, path);
  if (!isStatement(node)) {
    return root;
  }

  const mutated = new Statement(node.p, sampleOperator(), node.q);
  const next = replaceAt(root, path, () => mutated);
  return isStatement(next) ? next : root;
};

const forceTruthFlip = (root: Statement): Statement => {
  const baseline = root.value;
  let candidate = root;

  for (let i = 0; i < FORCE_FLIP_ATTEMPTS; i += 1) {
    const mode = Math.random();
    candidate =
      mode < FORCE_FLIP_MUTATE_CHANCE
        ? mutateOnce(candidate)
        : mode < FORCE_FLIP_GROW_CHANCE
          ? growOnce(candidate)
          : shrinkOnce(candidate);

    if (candidate.value !== baseline) {
      return candidate;
    }
  }

  return candidate;
};

const evolve = (root: Statement, targetDepth: number): Statement => {
  const depth = treeDepth(root);

  if (depth < targetDepth) {
    return growOnce(root);
  }

  if (depth > targetDepth) {
    return shrinkOnce(root);
  }

  const r = Math.random();
  if (r < EVOLVE_MUTATE_CHANCE) {
    return mutateOnce(root);
  }
  if (r < EVOLVE_GROW_CHANCE) {
    return growOnce(root);
  }
  return shrinkOnce(root);
};

const getAvailableSpace = () => {
  const style = getComputedStyle(document.body);
  return {
    width:
      window.innerWidth -
      parseFloat(style.paddingLeft) -
      parseFloat(style.paddingRight),
    height:
      window.innerHeight -
      parseFloat(style.paddingTop) -
      parseFloat(style.paddingBottom),
  };
};

const getFill = () => {
  const bounds = ROOT.getBoundingClientRect();
  const space = getAvailableSpace();

  return {
    width: bounds.width / space.width,
    height: bounds.height / space.height,
  };
};

const fitToScreen = () => {
  let min = FIT_FONT_MIN_PX;
  let max = Math.min(window.innerWidth, window.innerHeight);

  while (max - min > FIT_FONT_TOLERANCE_PX) {
    const mid = (min + max) / 2;
    document.body.style.fontSize = `${mid}px`;

    const bounds = ROOT.getBoundingClientRect();
    const space = getAvailableSpace();

    if (bounds.width > space.width || bounds.height > space.height) {
      max = mid;
    } else {
      min = mid;
    }
  }

  document.body.style.fontSize = `${min}px`;
  return min;
};

const render = (state: Statement) => {
  ROOT.textContent = state.toString();
  const fontSize = fitToScreen();
  document.body.className = "";
  document.body.classList.add(String(state.value));
  return fontSize;
};

const constrainForViewport = (state: Statement): Statement => {
  let next = state;
  let fontSize = render(next);
  let guard = 0;

  while (
    fontSize < MIN_FONT_SIZE &&
    treeDepth(next) > MIN_DEPTH &&
    guard < CONSTRAIN_MAX_SHRINK_STEPS
  ) {
    next = shrinkOnce(next);
    fontSize = render(next);
    guard += 1;
  }

  return next;
};

let current = recurse(INITIAL_DEPTH);
let targetDepth = INITIAL_DEPTH;
let lastStep = 0;
let lastValue = current.value;
let lastBackgroundValue = current.value;
let stepsSinceFlip = 0;
let stepIntervalMs = STEP_MS;
let burstStepsLeft = 0;
let lullStepsLeft = 0;

const nudgeTargetDepth = (fontSize: number) => {
  const fill = getFill();
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
  current = constrainForViewport(current);
  if (current.value === lastValue) {
    stepsSinceFlip += 1;
  } else {
    stepsSinceFlip = 0;
    lastValue = current.value;
  }

  if (stepsSinceFlip >= FORCE_FLIP_AFTER_STEPS) {
    current = constrainForViewport(forceTruthFlip(current));
    stepsSinceFlip = 0;
    lastValue = current.value;
  }

  const fontSize = render(current);
  if (current.value !== lastBackgroundValue) {
    playTransitionSound(current.value);
    lastBackgroundValue = current.value;
  }
  nudgeTargetDepth(fontSize);
};

const updateTempo = () => {
  if (burstStepsLeft > 0) {
    burstStepsLeft -= 1;
    stepIntervalMs = Math.max(
      STEP_MS_MIN,
      Math.min(STEP_MS_MAX, STEP_MS * TEMPO_BURST_MULTIPLIER)
    );
    return;
  }

  if (lullStepsLeft > 0) {
    lullStepsLeft -= 1;
    stepIntervalMs = Math.max(
      STEP_MS_MIN,
      Math.min(STEP_MS_MAX, STEP_MS * TEMPO_LULL_MULTIPLIER)
    );
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
  stepIntervalMs = Math.max(STEP_MS_MIN, Math.min(STEP_MS_MAX, relaxed + drift));
};

const animate = (timestamp: number) => {
  if (timestamp - lastStep >= stepIntervalMs) {
    step();
    updateTempo();
    lastStep = timestamp;
  }

  requestAnimationFrame(animate);
};

current = constrainForViewport(current);
requestAnimationFrame(animate);

document.addEventListener("click", () => {
  unlockAudio();
  targetDepth = sample(CLICK_TARGET_DEPTH_OPTIONS);
});

document.addEventListener("keydown", unlockAudio);

window.addEventListener("resize", () => {
  current = constrainForViewport(current);
});
