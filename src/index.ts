import { Statement, Bool, CONNECTIVES, Operator } from "./lib/connectives";

const ROOT = document.getElementById("root");

if (!ROOT) {
  throw new Error("Root element not found");
}

const flip = () => Math.random() > 0.5;

const sample = <T>(xs: T[]): T => xs[Math.floor(Math.random() * xs.length)];

const statement = () => {
  return new Statement(
    new Bool(flip(), flip()),
    sample(Object.keys(CONNECTIVES)) as Operator,
    new Bool(flip(), flip())
  );
};

const recurse = (depth: number): Statement => {
  if (depth === 0) {
    return statement();
  }

  return new Statement(
    recurse(depth - 1),
    sample(Object.keys(CONNECTIVES)) as Operator,
    recurse(depth - 1)
  );
};

const fitToScreen = () => {
  let min = 1;
  let max = Math.min(window.innerWidth, window.innerHeight);

  while (max - min > 0.5) {
    const mid = (min + max) / 2;
    document.body.style.fontSize = `${mid}px`;

    if (
      document.body.scrollWidth > window.innerWidth ||
      document.body.scrollHeight > window.innerHeight
    ) {
      max = mid;
    } else {
      min = mid;
    }
  }

  document.body.style.fontSize = `${min}px`;
};

const init = () => {
  const s = recurse(4);
  document.body.className = "";
  document.body.classList.add(String(s.value));
  ROOT.innerHTML = s.toString();
  fitToScreen();
};

init();

document.addEventListener("click", init);
window.addEventListener("resize", fitToScreen);
