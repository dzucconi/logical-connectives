import { createTransitionAudio } from "./app/audio";
import { UI_IDLE_MS } from "./app/config";
import { createEngine } from "./app/engine";
import { createTempo } from "./app/tempo";
import { createUi } from "./app/ui";
import { createViewport } from "./app/viewport";

const ROOT = document.getElementById("root");
if (!ROOT) {
  throw new Error("Root element not found");
}

const viewport = createViewport(ROOT);
const audio = createTransitionAudio();
const tempo = createTempo();
const engine = createEngine({ viewport, tempo, audio });
const ui = createUi({ audio, idleMs: UI_IDLE_MS });
engine.start();

document.addEventListener("click", () => {
  ui.handleGlobalClick();
  engine.click();
});
window.addEventListener("pointermove", ui.handleActivity);
window.addEventListener("pointerdown", ui.handleActivity);
window.addEventListener("keydown", ui.handleActivity);
window.addEventListener("resize", () => {
  engine.resize();
});

document.addEventListener("dblclick", () => {
  if (document.fullscreenElement) {
    void document.exitFullscreen();
    return;
  }
  void document.documentElement.requestFullscreen();
});
