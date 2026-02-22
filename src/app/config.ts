const MAIN_PRESETS = ["classic", "chime", "arcade"] as const;
const MICRO_PRESETS = ["classic", "chime", "arcade"] as const;

export type SfxMainPreset = (typeof MAIN_PRESETS)[number];
export type SfxMicroPreset = (typeof MICRO_PRESETS)[number];

export const evolutionConfig = {
  minDepth: 4,
  maxDepth: 12,
  heightTarget: 0.95,
  forceFlipAfterSteps: 10,
  initialDepth: 6,
  clickTargetDepthOptions: [5, 6, 7, 8] as const,
  targetDepthNudgeChoices: [-1, 1] as const,
  randomBoolThreshold: 0.5,
  targetDepthRandomNudgeChance: 0.12,
  mutateBoolPathChance: 0.55,
  evolveMutateChance: 0.6,
  evolveGrowChance: 0.8,
  forceFlipAttempts: 24,
  forceFlipMutateChance: 0.7,
  forceFlipGrowChance: 0.85,
};

export const layoutConfig = {
  minFontSize: 14,
  fitFontMinPx: 1,
  fitFontTolerancePx: 0.5,
  fontSizeRecoveryBuffer: 1,
  constrainMaxShrinkSteps: 8,
};

export const tempoConfig = {
  stepMs: 110,
  stepMsMin: 55,
  stepMsMax: 240,
  stepMsDriftPerStep: 10,
  stepMsReturnRate: 0.08,
  burstChance: 0.08,
  burstMultiplier: 0.5,
  burstLengthMin: 6,
  burstLengthMax: 18,
  lullChance: 0.05,
  lullMultiplier: 1.6,
  lullLengthMin: 8,
  lullLengthMax: 20,
};

export const audioConfig = {
  enabled: true,
  masterGain: 0.05,
  attackS: 0.005,
  releaseS: 0.14,
  trueStartHz: 640,
  trueEndHz: 960,
  trueDurationS: 0.11,
  falseStartHz: 300,
  falseEndHz: 120,
  falseDurationS: 0.16,
  detuneCents: 9,
  microDurationS: 0.045,
  microGainMultiplier: 0.45,
  microTrueHz: 760,
  microFalseHz: 220,
  microVarianceHz: 26,
  microDetuneCents: 3,
  mainPresets: MAIN_PRESETS,
  mainPreset: "arcade" as SfxMainPreset,
  microPresets: MICRO_PRESETS,
  microPreset: "arcade" as SfxMicroPreset,
};

export const uiConfig = {
  idleMs: 1800,
};

// Flat exports retained for migration-friendly imports.
export const MIN_DEPTH = evolutionConfig.minDepth;
export const MAX_DEPTH = evolutionConfig.maxDepth;
export const HEIGHT_TARGET = evolutionConfig.heightTarget;
export const FORCE_FLIP_AFTER_STEPS = evolutionConfig.forceFlipAfterSteps;
export const INITIAL_DEPTH = evolutionConfig.initialDepth;
export const CLICK_TARGET_DEPTH_OPTIONS = evolutionConfig.clickTargetDepthOptions;
export const TARGET_DEPTH_NUDGE_CHOICES = evolutionConfig.targetDepthNudgeChoices;
export const RANDOM_BOOL_THRESHOLD = evolutionConfig.randomBoolThreshold;
export const TARGET_DEPTH_RANDOM_NUDGE_CHANCE =
  evolutionConfig.targetDepthRandomNudgeChance;
export const MUTATE_BOOL_PATH_CHANCE = evolutionConfig.mutateBoolPathChance;
export const EVOLVE_MUTATE_CHANCE = evolutionConfig.evolveMutateChance;
export const EVOLVE_GROW_CHANCE = evolutionConfig.evolveGrowChance;
export const FORCE_FLIP_ATTEMPTS = evolutionConfig.forceFlipAttempts;
export const FORCE_FLIP_MUTATE_CHANCE = evolutionConfig.forceFlipMutateChance;
export const FORCE_FLIP_GROW_CHANCE = evolutionConfig.forceFlipGrowChance;

export const MIN_FONT_SIZE = layoutConfig.minFontSize;
export const FIT_FONT_MIN_PX = layoutConfig.fitFontMinPx;
export const FIT_FONT_TOLERANCE_PX = layoutConfig.fitFontTolerancePx;
export const FONT_SIZE_RECOVERY_BUFFER = layoutConfig.fontSizeRecoveryBuffer;
export const CONSTRAIN_MAX_SHRINK_STEPS = layoutConfig.constrainMaxShrinkSteps;

export const STEP_MS = tempoConfig.stepMs;
export const STEP_MS_MIN = tempoConfig.stepMsMin;
export const STEP_MS_MAX = tempoConfig.stepMsMax;
export const STEP_MS_DRIFT_PER_STEP = tempoConfig.stepMsDriftPerStep;
export const STEP_MS_RETURN_RATE = tempoConfig.stepMsReturnRate;
export const TEMPO_BURST_CHANCE = tempoConfig.burstChance;
export const TEMPO_BURST_MULTIPLIER = tempoConfig.burstMultiplier;
export const TEMPO_BURST_LENGTH_MIN = tempoConfig.burstLengthMin;
export const TEMPO_BURST_LENGTH_MAX = tempoConfig.burstLengthMax;
export const TEMPO_LULL_CHANCE = tempoConfig.lullChance;
export const TEMPO_LULL_MULTIPLIER = tempoConfig.lullMultiplier;
export const TEMPO_LULL_LENGTH_MIN = tempoConfig.lullLengthMin;
export const TEMPO_LULL_LENGTH_MAX = tempoConfig.lullLengthMax;

export const SFX_ENABLED = audioConfig.enabled;
export const SFX_MASTER_GAIN = audioConfig.masterGain;
export const SFX_ATTACK_S = audioConfig.attackS;
export const SFX_RELEASE_S = audioConfig.releaseS;
export const SFX_TRUE_START_HZ = audioConfig.trueStartHz;
export const SFX_TRUE_END_HZ = audioConfig.trueEndHz;
export const SFX_TRUE_DURATION_S = audioConfig.trueDurationS;
export const SFX_FALSE_START_HZ = audioConfig.falseStartHz;
export const SFX_FALSE_END_HZ = audioConfig.falseEndHz;
export const SFX_FALSE_DURATION_S = audioConfig.falseDurationS;
export const SFX_DETUNE_CENTS = audioConfig.detuneCents;
export const SFX_MICRO_DURATION_S = audioConfig.microDurationS;
export const SFX_MICRO_GAIN_MULTIPLIER = audioConfig.microGainMultiplier;
export const SFX_MICRO_TRUE_HZ = audioConfig.microTrueHz;
export const SFX_MICRO_FALSE_HZ = audioConfig.microFalseHz;
export const SFX_MICRO_VARIANCE_HZ = audioConfig.microVarianceHz;
export const SFX_MICRO_DETUNE_CENTS = audioConfig.microDetuneCents;
export const SFX_MAIN_PRESETS = audioConfig.mainPresets;
export const SFX_MAIN_PRESET = audioConfig.mainPreset;
export const SFX_MICRO_PRESETS = audioConfig.microPresets;
export const SFX_MICRO_PRESET = audioConfig.microPreset;

export const UI_IDLE_MS = uiConfig.idleMs;
