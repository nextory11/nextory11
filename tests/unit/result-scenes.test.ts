import { describe, expect, it } from "vitest";

import { resultScenes } from "../../src/data/resultScenes.js";
import { resultTypes } from "../../src/data/resultTypes.js";

describe("NEXTORY11 cinematic result scenes", () => {
  it("defines one complete scene for each of the eleven result types", () => {
    expect(Object.keys(resultScenes)).toEqual(Object.keys(resultTypes));
    expect(Object.keys(resultScenes)).toHaveLength(11);

    Object.values(resultScenes).forEach((scene) => {
      expect(scene.message.length).toBeGreaterThan(30);
      expect(scene.constellation.points.length).toBeGreaterThanOrEqual(6);
      expect(scene.constellation.lines.length).toBeGreaterThanOrEqual(5);
    });
  });

  it("keeps every realm, symbol, message, and constellation unique", () => {
    const scenes = Object.values(resultScenes);
    const constellationSignature = (scene: (typeof scenes)[number]) =>
      JSON.stringify(scene.constellation);

    expect(new Set(scenes.map((scene) => scene.realm)).size).toBe(11);
    expect(new Set(scenes.map((scene) => scene.glyph)).size).toBe(11);
    expect(new Set(scenes.map((scene) => scene.message)).size).toBe(11);
    expect(new Set(scenes.map(constellationSignature)).size).toBe(11);
  });
});

