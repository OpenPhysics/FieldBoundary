/**
 * Fleet-standard memory-leak regression suite (SceneryStackTemplate / QubitSketch pattern).
 *
 * Creates a disposable model object inside a function boundary, disposes it, forces
 * garbage collection via global.gc (--expose-gc in vitest.config.ts), then asserts via
 * WeakRef that the object was collected. V8 requires a function boundary (not merely
 * a block scope) so local strong references die when the helper returns.
 *
 * This points at the sim's own models rather than a template placeholder: the
 * screen models register a Multilink on their parameter Properties, so a model
 * that fails to dispose that link stays reachable forever.
 */

import { describe, expect, it } from "vitest";
import { ElectricModel } from "../src/electric/model/ElectricModel.js";
import { MagneticModel } from "../src/magnetic/model/MagneticModel.js";

/**
 * Force garbage collection with multiple passes. When `earlyExitRefs` is supplied
 * the loop bails as soon as every referenced object is confirmed collected. The
 * setTimeout(0) yield after a live deref() avoids the WeakRef macrotask-liveness pin.
 * Without early-exit refs the loop always runs all passes, which on a slow `gc()`
 * can exceed the Vitest testTimeout — always pass refs when you have them.
 */
async function forceGC(earlyExitRefs?: WeakRef<object> | readonly WeakRef<object>[]): Promise<void> {
  const refs = earlyExitRefs === undefined ? [] : Array.isArray(earlyExitRefs) ? earlyExitRefs : [earlyExitRefs];
  for (let i = 0; i < 15; i++) {
    globalThis.gc?.();
    await new Promise<void>((r) => setTimeout(r, 50));
    if (refs.length > 0 && refs.every((ref) => ref.deref() === undefined)) {
      return;
    }
    if (refs.length > 0) {
      await new Promise<void>((r) => setTimeout(r, 0));
    }
  }
}

function createAndDisposeElectricModel(): WeakRef<object> {
  const model = new ElectricModel();
  // Exercise the field multilink so the dependency graph is fully wired.
  model.setE1FromTip(model.e1Property.value);
  model.eps2Property.value = 12;
  const ref = new WeakRef<object>(model);
  model.dispose();
  return ref;
}

function createAndDisposeMagneticModel(): WeakRef<object> {
  const model = new MagneticModel();
  model.surfaceCurrentProperty.value = 1;
  const ref = new WeakRef<object>(model);
  model.dispose();
  return ref;
}

describe("Memory leak regression", () => {
  it("global.gc is available (--expose-gc)", () => {
    expect(globalThis.gc).toBeDefined();
  });

  it("sanity: plain object is collected", async () => {
    const ref = (() => new WeakRef({ hello: "world" }))();
    await forceGC(ref);
    expect(ref.deref()).toBeUndefined();
  });

  it("ElectricModel is collected after dispose", async () => {
    const ref = createAndDisposeElectricModel();
    await forceGC(ref);
    expect(ref.deref()).toBeUndefined();
  });

  it("MagneticModel is collected after dispose", async () => {
    const ref = createAndDisposeMagneticModel();
    await forceGC(ref);
    expect(ref.deref()).toBeUndefined();
  });

  it("repeated create/dispose cycles leave no survivors", async () => {
    const refs: WeakRef<object>[] = [];
    for (let i = 0; i < 10; i++) {
      refs.push(createAndDisposeElectricModel());
      refs.push(createAndDisposeMagneticModel());
    }
    await forceGC(refs);
    const survivors = refs.filter((r) => r.deref() !== undefined).length;
    expect(survivors).toBe(0);
  }, 90_000);
});
