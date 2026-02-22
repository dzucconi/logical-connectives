export const MIN_DEPTH = 4;
export const MAX_DEPTH = 12;
export const MIN_FONT_SIZE = 14;

export const STEP_MS = 110;
export const STEP_MS_MIN = 55;
export const STEP_MS_MAX = 240;
export const STEP_MS_DRIFT_PER_STEP = 10;
export const STEP_MS_RETURN_RATE = 0.08;

export const TEMPO_BURST_CHANCE = 0.08;
export const TEMPO_BURST_MULTIPLIER = 0.5;
export const TEMPO_BURST_LENGTH_MIN = 6;
export const TEMPO_BURST_LENGTH_MAX = 18;

export const TEMPO_LULL_CHANCE = 0.05;
export const TEMPO_LULL_MULTIPLIER = 1.6;
export const TEMPO_LULL_LENGTH_MIN = 8;
export const TEMPO_LULL_LENGTH_MAX = 20;

export const HEIGHT_TARGET = 0.95;
export const FORCE_FLIP_AFTER_STEPS = 10;

export const SFX_ENABLED = true;
export const SFX_MASTER_GAIN = 0.05;
export const SFX_ATTACK_S = 0.005;
export const SFX_RELEASE_S = 0.14;
export const SFX_TRUE_START_HZ = 640;
export const SFX_TRUE_END_HZ = 960;
export const SFX_TRUE_DURATION_S = 0.11;
export const SFX_FALSE_START_HZ = 300;
export const SFX_FALSE_END_HZ = 120;
export const SFX_FALSE_DURATION_S = 0.16;
export const SFX_DETUNE_CENTS = 9;
export const SFX_MICRO_DURATION_S = 0.045;
export const SFX_MICRO_GAIN_MULTIPLIER = 0.45;
export const SFX_MICRO_TRUE_HZ = 760;
export const SFX_MICRO_FALSE_HZ = 220;
export const SFX_MICRO_VARIANCE_HZ = 26;
export const SFX_MICRO_DETUNE_CENTS = 3;
export const SFX_MAIN_PRESETS = ["classic", "chime", "arcade"] as const;
export type SfxMainPreset = (typeof SFX_MAIN_PRESETS)[number];
export const SFX_MAIN_PRESET: SfxMainPreset = "arcade";
export const SFX_MICRO_PRESETS = ["classic", "chime", "arcade"] as const;
export type SfxMicroPreset = (typeof SFX_MICRO_PRESETS)[number];
export const SFX_MICRO_PRESET: SfxMicroPreset = "arcade";

export const INITIAL_DEPTH = 6;
export const CLICK_TARGET_DEPTH_OPTIONS = [5, 6, 7, 8] as const;
export const TARGET_DEPTH_NUDGE_CHOICES = [-1, 1] as const;

export const RANDOM_BOOL_THRESHOLD = 0.5;
export const TARGET_DEPTH_RANDOM_NUDGE_CHANCE = 0.12;

export const FIT_FONT_MIN_PX = 1;
export const FIT_FONT_TOLERANCE_PX = 0.5;
export const FONT_SIZE_RECOVERY_BUFFER = 1;
export const CONSTRAIN_MAX_SHRINK_STEPS = 8;

export const MUTATE_BOOL_PATH_CHANCE = 0.55;
export const EVOLVE_MUTATE_CHANCE = 0.6;
export const EVOLVE_GROW_CHANCE = 0.8;

export const FORCE_FLIP_ATTEMPTS = 24;
export const FORCE_FLIP_MUTATE_CHANCE = 0.7;
export const FORCE_FLIP_GROW_CHANCE = 0.85;
