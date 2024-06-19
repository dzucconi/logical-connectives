import { CONNECTIVES as C, Bool, Statement } from "./connectives";

describe("Statement", () => {
  it("can build a statement with a connective", () => {
    const statement = new Statement(new Bool(true), "and", new Bool(true));
    expect(statement.value).toBe(true);
    expect(statement.toString()).toBe("(true ∧ true)");
  });

  it("can build a statement with a nested statement", () => {
    const statement = new Statement(
      new Statement(new Bool(true), "and", new Bool(true)),
      "and",
      new Bool(false)
    );
    expect(statement.value).toBe(false);
    expect(statement.toString()).toBe("((true ∧ true) ∧ false)");
  });

  it("can build a statement with a nested statement with a connective", () => {
    const statement = new Statement(
      new Statement(new Bool(true), "and", new Bool(true)),
      "and",
      new Statement(new Bool(false), "and", new Bool(true))
    );
    expect(statement.value).toBe(false);
    expect(statement.toString()).toBe("((true ∧ true) ∧ (false ∧ true))");
  });

  it("can build a deeply nested statement with a connective", () => {
    const statement = new Statement(
      new Statement(
        new Statement(new Bool(true), "and", new Bool(true)),
        "and",
        new Statement(new Bool(false), "and", new Bool(true))
      ),
      "and",
      new Statement(
        new Statement(new Bool(true), "and", new Bool(false)),
        "and",
        new Statement(new Bool(true), "and", new Bool(true))
      )
    );
    expect(statement.value).toBe(false);
    expect(statement.toString()).toBe(
      "(((true ∧ true) ∧ (false ∧ true)) ∧ ((true ∧ false) ∧ (true ∧ true)))"
    );
  });
});

describe("connectives", () => {
  describe("and", () => {
    it("should return the conjunction of the inputs", () => {
      expect(C.and.f(true, true)).toBe(true);
      expect(C.and.f(true, false)).toBe(false);
      expect(C.and.f(false, true)).toBe(false);
      expect(C.and.f(false, false)).toBe(false);
    });
  });

  describe("or", () => {
    it("should return the disjunction of the inputs", () => {
      expect(C.or.f(true, true)).toBe(true);
      expect(C.or.f(true, false)).toBe(true);
      expect(C.or.f(false, true)).toBe(true);
      expect(C.or.f(false, false)).toBe(false);
    });
  });

  describe("xor", () => {
    it("should return the exclusive disjunction of the inputs", () => {
      expect(C.xor.f(true, true)).toBe(false);
      expect(C.xor.f(true, false)).toBe(true);
      expect(C.xor.f(false, true)).toBe(true);
      expect(C.xor.f(false, false)).toBe(false);
    });
  });

  describe("imply", () => {
    it("should return the implication of the inputs", () => {
      expect(C.imply.f(false, false)).toBe(true);
      expect(C.imply.f(false, true)).toBe(true);
      expect(C.imply.f(true, false)).toBe(false);
      expect(C.imply.f(true, true)).toBe(true);
    });
  });

  describe("converse", () => {
    it("should return the converse of the inputs", () => {
      expect(C.converse.f(false, false)).toBe(true);
      expect(C.converse.f(false, true)).toBe(false);
      expect(C.converse.f(true, false)).toBe(true);
      expect(C.converse.f(true, true)).toBe(true);
    });
  });

  describe("xnor", () => {
    it("should return the biconditional of the inputs", () => {
      expect(C.xnor.f(false, false)).toBe(true);
      expect(C.xnor.f(false, true)).toBe(false);
      expect(C.xnor.f(true, false)).toBe(false);
      expect(C.xnor.f(true, true)).toBe(true);
    });
  });

  describe("nand", () => {
    it("should return the alternative denial of the inputs", () => {
      expect(C.nand.f(false, false)).toBe(true);
      expect(C.nand.f(false, true)).toBe(true);
      expect(C.nand.f(true, false)).toBe(true);
      expect(C.nand.f(true, true)).toBe(false);
    });
  });

  describe("nor", () => {
    it("should return the joint denial of the inputs", () => {
      expect(C.nor.f(false, false)).toBe(true);
      expect(C.nor.f(false, true)).toBe(false);
      expect(C.nor.f(true, false)).toBe(false);
      expect(C.nor.f(true, true)).toBe(false);
    });
  });

  describe("nimply", () => {
    it("should return the material nonimplication of the inputs", () => {
      expect(C.nimply.f(false, false)).toBe(false);
      expect(C.nimply.f(false, true)).toBe(false);
      expect(C.nimply.f(true, false)).toBe(true);
      expect(C.nimply.f(true, true)).toBe(false);
    });
  });
});
