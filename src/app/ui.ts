import type { TransitionAudio } from "./audio";

type UiDeps = {
  audio: TransitionAudio;
  idleMs: number;
};

export type UiController = {
  handleGlobalClick: () => void;
  handleActivity: () => void;
};

export const createUi = ({ audio, idleMs }: UiDeps): UiController => {
  const soundToggle = document.createElement("button");
  soundToggle.type = "button";
  soundToggle.className = "sound-toggle";
  document.body.appendChild(soundToggle);

  let idleTimer: number | undefined;

  const renderSoundToggle = () => {
    const state = audio.getState();
    soundToggle.textContent = state.enabled ? "🔊" : "🔇";
    soundToggle.setAttribute(
      "aria-label",
      state.enabled ? "Disable sound" : "Enable sound"
    );
    soundToggle.dataset.state = state.enabled ? "on" : "off";
    soundToggle.disabled = !state.supported;
  };

  const clearIdleTimer = () => {
    if (!idleTimer) {
      return;
    }
    window.clearTimeout(idleTimer);
    idleTimer = undefined;
  };

  const scheduleIdle = () => {
    clearIdleTimer();
    if (!audio.getState().enabled) {
      document.body.classList.remove("idle-ui");
      return;
    }

    idleTimer = window.setTimeout(() => {
      document.body.classList.add("idle-ui");
    }, idleMs);
  };

  const wake = () => {
    document.body.classList.remove("idle-ui");
    scheduleIdle();
  };

  soundToggle.addEventListener("click", (event) => {
    event.stopPropagation();
    const state = audio.getState();
    audio.setEnabled(!state.enabled);
    wake();
    renderSoundToggle();
  });

  renderSoundToggle();

  const handleGlobalClick = () => {
    const state = audio.getState();
    if (!state.enabled) {
      audio.setEnabled(true);
      renderSoundToggle();
    }
    wake();
  };

  return {
    handleGlobalClick,
    handleActivity: wake,
  };
};
