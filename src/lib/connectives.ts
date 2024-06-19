export const CONNECTIVES = {
  and: {
    symbol: "∧",
    f: (a: boolean, b: boolean) => a && b,
  },
  or: {
    symbol: "∨",
    f: (a: boolean, b: boolean) => a || b,
  },
  xor: {
    symbol: "⊕",
    f: (a: boolean, b: boolean) => a !== b,
  },
  imply: {
    symbol: "→",
    f: (a: boolean, b: boolean) => !a || b,
  },
  converse: {
    symbol: "←",
    f: (a: boolean, b: boolean) => a || !b,
  },
  xnor: {
    symbol: "≡",
    f: (a: boolean, b: boolean) => a === b,
  },
  nand: {
    symbol: "↑",
    f: (a: boolean, b: boolean) => !(a && b),
  },
  nor: {
    symbol: "↓",
    f: (a: boolean, b: boolean) => !(a || b),
  },
  nimply: {
    symbol: "↛",
    f: (a: boolean, b: boolean) => a && !b,
  },
} as const;

export type Operator = keyof typeof CONNECTIVES;

export class Connective {
  constructor(private operator: Operator) {}

  f(...args: boolean[]) {
    return CONNECTIVES[this.operator].f.apply(null, args);
  }

  toString() {
    return CONNECTIVES[this.operator].symbol;
  }
}

export class Bool {
  value: boolean;
  _value: boolean;
  negate: boolean;

  constructor(value: boolean, negate = false) {
    this.negate = negate;
    this._value = value;

    this.value = negate ? !value : value;
  }

  toString() {
    return `${this.negate ? "¬" : ""}${this._value}`;
  }
}

export class Statement {
  p: Bool | Statement;
  operator: Connective;
  q: Bool | Statement;
  value: boolean;

  constructor(p: Bool | Statement, operator: Operator, q: Bool | Statement) {
    this.p = p;
    this.operator = new Connective(operator);
    this.q = q;

    this.value = this.operator.f(p.value, q.value);
  }

  toString() {
    return `(${this.p} ${this.operator} ${this.q})`;
  }
}
