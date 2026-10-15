// Compiles a scene spec into one shared timeline: every scene start, every
// sound cue and every caption word becomes an absolute frame. Scenes only
// carry lengths and scene-relative times, so changing one length moves
// everything after it.

const STEP_SPACING = 0.9;

export function compile(spec) {
  const { fps } = spec;
  const f = (s) => Math.round(s * fps);
  let cursor = 0;
  const scenes = [];
  const cues = [];
  const captions = [];
  const warnings = [];

  for (const scene of spec.scenes) {
    const from = cursor;
    const durationInFrames = f(scene.seconds);
    if (scene.seconds > 8) warnings.push(`${scene.id}: ${scene.seconds}s with no new beat (max 8s)`);

    const stepTimes = scene.steps ? scene.steps.map((_, i) => 0.4 + i * STEP_SPACING) : [];
    for (const cue of scene.cues ?? []) {
      const times = cue.at === "each_step" ? stepTimes : [cue.at];
      for (const t of times) {
        if (t > scene.seconds) warnings.push(`${scene.id}: cue ${cue.sfx} at ${t}s is past the scene end`);
        cues.push({ scene: scene.id, sfx: cue.sfx, frame: from + f(t) });
      }
    }
    for (const [t, word] of scene.captions ?? []) captions.push({ scene: scene.id, word, frame: from + f(t) });

    scenes.push({ ...scene, from, durationInFrames, stepFrames: stepTimes.map(f) });
    cursor += durationInFrames;
  }

  return { ...spec, durationInFrames: cursor, scenes, cues, captions, warnings };
}

export function setLength(spec, sceneId, seconds) {
  return { ...spec, scenes: spec.scenes.map((s) => (s.id === sceneId ? { ...s, seconds } : s)) };
}
