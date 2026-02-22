import { Bool, CONNECTIVES, Operator, Statement } from "../lib/connectives";
import {
  EVOLVE_GROW_CHANCE,
  EVOLVE_MUTATE_CHANCE,
  FORCE_FLIP_ATTEMPTS,
  FORCE_FLIP_GROW_CHANCE,
  FORCE_FLIP_MUTATE_CHANCE,
  MUTATE_BOOL_PATH_CHANCE,
  RANDOM_BOOL_THRESHOLD,
} from "./config";
import { flip, sample } from "./utils";

type Node = Bool | Statement;
type Branch = "p" | "q";
type Path = Branch[];

const operators = Object.keys(CONNECTIVES) as Operator[];
const sampleOperator = () => sample(operators);

const statement = () =>
  new Statement(
    new Bool(flip(RANDOM_BOOL_THRESHOLD), flip(RANDOM_BOOL_THRESHOLD)),
    sampleOperator(),
    new Bool(flip(RANDOM_BOOL_THRESHOLD), flip(RANDOM_BOOL_THRESHOLD))
  );

export const recurse = (depth: number): Statement =>
  depth === 0
    ? statement()
    : new Statement(recurse(depth - 1), sampleOperator(), recurse(depth - 1));

const isStatement = (node: Node): node is Statement => node instanceof Statement;

const getOperator = (node: Statement): Operator =>
  (node.operator as unknown as { operator: Operator }).operator;

const getNodeAt = (node: Node, path: Path): Node =>
  path.reduce<Node>((current, branch) => {
    if (!isStatement(current)) {
      return current;
    }
    return branch === "p" ? current.p : current.q;
  }, node);

const replaceAt = (node: Node, path: Path, replace: (current: Node) => Node): Node => {
  if (path.length === 0) {
    return replace(node);
  }
  if (!isStatement(node)) {
    return node;
  }

  const [branch, ...rest] = path;
  const child = branch === "p" ? node.p : node.q;
  const nextChild = replaceAt(child, rest, replace);
  const p = branch === "p" ? nextChild : node.p;
  const q = branch === "q" ? nextChild : node.q;

  return new Statement(p, getOperator(node), q);
};

const collectPaths = (
  node: Node,
  path: Path = [],
  acc: { bools: Path[]; statements: Path[] } = { bools: [], statements: [] }
) => {
  if (isStatement(node)) {
    acc.statements.push(path);
    collectPaths(node.p, [...path, "p"], acc);
    collectPaths(node.q, [...path, "q"], acc);
  } else {
    acc.bools.push(path);
  }
  return acc;
};

export const treeDepth = (node: Node): number =>
  isStatement(node) ? 1 + Math.max(treeDepth(node.p), treeDepth(node.q)) : 0;

export const growOnce = (root: Statement): Statement => {
  const paths = collectPaths(root).bools;
  if (!paths.length) {
    return root;
  }

  const path = sample(paths);
  const leaf = getNodeAt(root, path);
  if (!(leaf instanceof Bool)) {
    return root;
  }

  const seed = new Bool(flip(RANDOM_BOOL_THRESHOLD), flip(RANDOM_BOOL_THRESHOLD));
  const branch = flip(RANDOM_BOOL_THRESHOLD)
    ? new Statement(leaf, sampleOperator(), seed)
    : new Statement(seed, sampleOperator(), leaf);

  const next = replaceAt(root, path, () => branch);
  return isStatement(next) ? next : root;
};

export const shrinkOnce = (root: Statement): Statement => {
  const paths = collectPaths(root).statements.filter((path) => path.length > 0);
  if (!paths.length) {
    return root;
  }

  const path = sample(paths);
  const node = getNodeAt(root, path);
  if (!isStatement(node)) {
    return root;
  }

  const next = replaceAt(root, path, () => new Bool(node.value, false));
  return isStatement(next) ? next : root;
};

export const mutateOnce = (root: Statement): Statement => {
  const paths = collectPaths(root);

  if (Math.random() < MUTATE_BOOL_PATH_CHANCE && paths.bools.length) {
    const path = sample(paths.bools);
    const node = getNodeAt(root, path);
    if (!(node instanceof Bool)) {
      return root;
    }

    const mutated = flip(RANDOM_BOOL_THRESHOLD)
      ? new Bool(node._value, !node.negate)
      : new Bool(!node._value, node.negate);

    const next = replaceAt(root, path, () => mutated);
    return isStatement(next) ? next : root;
  }

  const path = sample(paths.statements);
  const node = getNodeAt(root, path);
  if (!isStatement(node)) {
    return root;
  }

  const next = replaceAt(root, path, () => new Statement(node.p, sampleOperator(), node.q));
  return isStatement(next) ? next : root;
};

export const evolve = (root: Statement, targetDepth: number): Statement => {
  const depth = treeDepth(root);
  if (depth < targetDepth) {
    return growOnce(root);
  }
  if (depth > targetDepth) {
    return shrinkOnce(root);
  }

  const r = Math.random();
  if (r < EVOLVE_MUTATE_CHANCE) {
    return mutateOnce(root);
  }
  if (r < EVOLVE_GROW_CHANCE) {
    return growOnce(root);
  }
  return shrinkOnce(root);
};

export const forceTruthFlip = (root: Statement): Statement => {
  const baseline = root.value;
  let candidate = root;

  for (let i = 0; i < FORCE_FLIP_ATTEMPTS; i += 1) {
    const mode = Math.random();
    candidate =
      mode < FORCE_FLIP_MUTATE_CHANCE
        ? mutateOnce(candidate)
        : mode < FORCE_FLIP_GROW_CHANCE
          ? growOnce(candidate)
          : shrinkOnce(candidate);

    if (candidate.value !== baseline) {
      return candidate;
    }
  }

  return candidate;
};
