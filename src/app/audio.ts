import {
  SFX_ATTACK_S,
  SFX_DETUNE_CENTS,
  SFX_ENABLED,
  SFX_FALSE_DURATION_S,
  SFX_FALSE_END_HZ,
  SFX_FALSE_START_HZ,
  SFX_MAIN_PRESET,
  SFX_MICRO_PRESET,
  SFX_MASTER_GAIN,
  SFX_MICRO_DETUNE_CENTS,
  SFX_MICRO_DURATION_S,
  SFX_MICRO_FALSE_HZ,
  SFX_MICRO_GAIN_MULTIPLIER,
  SFX_MICRO_TRUE_HZ,
  SFX_MICRO_VARIANCE_HZ,
  SFX_RELEASE_S,
  SFX_TRUE_DURATION_S,
  SFX_TRUE_END_HZ,
  SFX_TRUE_START_HZ,
  type SfxMainPreset,
  type SfxMicroPreset,
} from "./config";

export type TransitionAudio = {
  unlock: () => void;
  setEnabled: (next: boolean) => void;
  getState: () => { supported: boolean; enabled: boolean; running: boolean };
  playTransition: (isTrue: boolean) => void;
  playMicro: (isTrue: boolean) => void;
};

export const createTransitionAudio = (): TransitionAudio => {
  let audioContext: AudioContext | null = null;
  let enabled = false;

  const getAudioContext = () => {
    if (!audioContext) {
      audioContext = new AudioContext();
    }
    return audioContext;
  };

  const unlock = () => {
    if (!SFX_ENABLED) {
      return;
    }
    const ctx = getAudioContext();
    if (ctx.state === "suspended") {
      void ctx.resume();
    }
  };

  const setEnabled = (next: boolean) => {
    enabled = next;
    if (enabled) {
      unlock();
    }
  };

  const getState = () => ({
    supported: SFX_ENABLED,
    enabled,
    running: audioContext?.state === "running",
  });

  const playSweep = (
    startHz: number,
    endHz: number,
    durationS: number,
    type: OscillatorType,
    detuneCents = 0,
    gainScale = 1
  ) => {
    if (!SFX_ENABLED || !enabled) {
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
    gain.gain.linearRampToValueAtTime(SFX_MASTER_GAIN * gainScale, now + SFX_ATTACK_S);
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

  const mainPresetPlayers: Record<SfxMainPreset, (isTrue: boolean) => void> = {
    classic: (isTrue) => {
      if (isTrue) {
        playSweep(
          SFX_TRUE_START_HZ,
          SFX_TRUE_END_HZ,
          SFX_TRUE_DURATION_S,
          "triangle",
          SFX_DETUNE_CENTS
        );
        playSweep(
          SFX_TRUE_START_HZ * 1.5,
          SFX_TRUE_END_HZ * 1.5,
          SFX_TRUE_DURATION_S,
          "sine"
        );
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
    },
    chime: (isTrue) => {
      if (isTrue) {
        playSweep(660, 990, 0.085, "sine", 0, 0.9);
        playSweep(825, 1320, 0.11, "triangle", 0, 0.65);
        return;
      }

      playSweep(390, 246, 0.16, "triangle", -6, 0.9);
      playSweep(292, 146, 0.17, "sine", -10, 0.6);
    },
    arcade: (isTrue) => {
      if (isTrue) {
        playSweep(740, 880, 0.06, "square", 5, 0.95);
        playSweep(880, 1320, 0.075, "square", 2, 0.7);
        return;
      }

      playSweep(260, 170, 0.09, "square", -5, 0.95);
      playSweep(170, 95, 0.11, "sawtooth", -12, 0.75);
    },
  };

  const playTransition = (isTrue: boolean) => {
    mainPresetPlayers[SFX_MAIN_PRESET](isTrue);
  };

  const microPresetPlayers: Record<SfxMicroPreset, (isTrue: boolean) => void> = {
    classic: (isTrue) => {
    const baseHz = isTrue ? SFX_MICRO_TRUE_HZ : SFX_MICRO_FALSE_HZ;
    const variance = (Math.random() * 2 - 1) * SFX_MICRO_VARIANCE_HZ;
      const startHz = Math.max(40, baseHz + variance);
      const endHz = Math.max(40, startHz * (isTrue ? 1.02 : 0.98));
      playSweep(
        startHz,
        endHz,
        SFX_MICRO_DURATION_S,
        "sine",
        isTrue ? SFX_MICRO_DETUNE_CENTS : -SFX_MICRO_DETUNE_CENTS,
        SFX_MICRO_GAIN_MULTIPLIER
      );
    },
    chime: (isTrue) => {
      const baseHz = isTrue ? SFX_MICRO_TRUE_HZ : SFX_MICRO_FALSE_HZ;
      const variance = (Math.random() * 2 - 1) * SFX_MICRO_VARIANCE_HZ;
      const startHz = Math.max(40, baseHz + variance * 0.8);
      const endHz = Math.max(40, startHz * (isTrue ? 1.05 : 0.95));
      playSweep(
        startHz,
        endHz,
        SFX_MICRO_DURATION_S * 1.15,
        "triangle",
        isTrue ? SFX_MICRO_DETUNE_CENTS : -SFX_MICRO_DETUNE_CENTS,
        SFX_MICRO_GAIN_MULTIPLIER * 0.95
      );
    },
    arcade: (isTrue) => {
      const baseHz = isTrue ? SFX_MICRO_TRUE_HZ : SFX_MICRO_FALSE_HZ;
      const variance = (Math.random() * 2 - 1) * SFX_MICRO_VARIANCE_HZ;
      const startHz = Math.max(40, baseHz + variance * 1.2);
      const endHz = Math.max(40, startHz * (isTrue ? 1.01 : 0.93));
      playSweep(
        startHz,
        endHz,
        SFX_MICRO_DURATION_S * 0.9,
        "square",
        isTrue ? SFX_MICRO_DETUNE_CENTS : -SFX_MICRO_DETUNE_CENTS,
        SFX_MICRO_GAIN_MULTIPLIER * 1.1
      );
    },
  };

  const playMicro = (isTrue: boolean) => {
    microPresetPlayers[SFX_MICRO_PRESET](isTrue);
  };

  return { unlock, setEnabled, getState, playTransition, playMicro };
};
