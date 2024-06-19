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

const recurse = (depth: number) => {
  if (depth === 0) {
    return statement();
  }

  return new Statement(
    recurse(depth - 1),
    sample(Object.keys(CONNECTIVES)) as Operator,
    recurse(depth - 1)
  );
};

const init = () => {
  const s = recurse(4);
  document.body.className = "";
  document.body.classList.add(s.value);
  ROOT.innerHTML = s.toString();
};

init();

document.addEventListener("click", init);
