import {
  SFX_ATTACK_S,
  SFX_DETUNE_CENTS,
  SFX_ENABLED,
  SFX_FALSE_DURATION_S,
  SFX_FALSE_END_HZ,
  SFX_FALSE_START_HZ,
  SFX_MASTER_GAIN,
  SFX_RELEASE_S,
  SFX_TRUE_DURATION_S,
  SFX_TRUE_END_HZ,
  SFX_TRUE_START_HZ,
} from "./config";

export const createTransitionAudio = () => {
  let audioContext: AudioContext | null = null;

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

  return { unlock, playTransition };
};
