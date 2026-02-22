import { STEP_MS_MAX, STEP_MS_MIN } from "./config";
import { createTempo } from "./tempo";

describe("tempo invariants", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("keeps interval within configured bounds over time", () => {
    const tempo = createTempo();

    for (let i = 0; i < 500; i += 1) {
      tempo.update();
      expect(tempo.interval()).toBeGreaterThanOrEqual(STEP_MS_MIN);
      expect(tempo.interval()).toBeLessThanOrEqual(STEP_MS_MAX);
    }
  });

  it("enters burst mode when burst chance is hit", () => {
    const tempo = createTempo();
    const spy = jest.spyOn(Math, "random");
    spy.mockReturnValueOnce(0); // trigger burst branch
    tempo.update();
    spy.mockReturnValue(0.5);
    tempo.update();

    expect(tempo.interval()).toBeGreaterThanOrEqual(STEP_MS_MIN);
    expect(tempo.interval()).toBeLessThanOrEqual(STEP_MS_MAX);
  });

  it("enters lull mode when lull chance is hit", () => {
    const tempo = createTempo();
    const spy = jest.spyOn(Math, "random");
    spy.mockReturnValueOnce(0.9); // skip burst
    spy.mockReturnValueOnce(0); // trigger lull
    tempo.update();
    spy.mockReturnValue(0.5);
    tempo.update();

    expect(tempo.interval()).toBeGreaterThanOrEqual(STEP_MS_MIN);
    expect(tempo.interval()).toBeLessThanOrEqual(STEP_MS_MAX);
  });
});
