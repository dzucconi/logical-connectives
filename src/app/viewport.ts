import { Statement } from "../lib/connectives";
import { FIT_FONT_MIN_PX, FIT_FONT_TOLERANCE_PX } from "./config";

export const createViewport = (root: HTMLElement) => {
  const getAvailableSpace = () => {
    const style = getComputedStyle(document.body);
    return {
      width:
        window.innerWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight),
      height:
        window.innerHeight - parseFloat(style.paddingTop) - parseFloat(style.paddingBottom),
    };
  };

  const getFill = () => {
    const bounds = root.getBoundingClientRect();
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

      const bounds = root.getBoundingClientRect();
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
    root.textContent = state.toString();
    const fontSize = fitToScreen();
    document.body.className = "";
    document.body.classList.add(String(state.value));
    return fontSize;
  };

  return { getFill, render };
};
