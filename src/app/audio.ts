import {
  SFX_ATTACK_S,
  SFX_DETUNE_CENTS,
  SFX_ENABLED,
  SFX_FALSE_DURATION_S,
  SFX_FALSE_END_HZ,
  SFX_FALSE_START_HZ,
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
} from "./config";

export const createTransitionAudio = () => {
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

  const playTransition = (isTrue: boolean) => {
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
  };

  const playMicro = (isTrue: boolean) => {
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
  };

  return { unlock, setEnabled, getState, playTransition, playMicro };
};
