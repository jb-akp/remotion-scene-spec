// One command: node build.mjs specs/x.json [--set scene=seconds] [--compare scene=seconds]
import { bundle } from "@remotion/bundler";
import { renderMedia, renderStill, selectComposition } from "@remotion/renderer";
import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import path from "node:path";
import { compile, setLength } from "./timeline.mjs";

const args = process.argv.slice(2);
const flag = (name) => {
  const i = args.indexOf(name);
  return i === -1 ? null : args[i + 1].split("=");
};

let spec = JSON.parse(readFileSync(args[0], "utf8"));
const set = flag("--set");
if (set) spec = setLength(spec, set[0], Number(set[1]));
const compare = flag("--compare");

mkdirSync("out", { recursive: true });
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.jsx") });

async function renderShort(spec, name) {
  const timeline = compile(spec);
  for (const w of timeline.warnings) console.log(`  ! ${w}`);
  writeFileSync(`out/${name}.timeline.json`, JSON.stringify(timeline, null, 2));
  const inputProps = { timeline, titleOnly: false };
  const composition = await selectComposition({ serveUrl, id: "Short", inputProps });
  const t0 = Date.now();
  await renderMedia({ composition, serveUrl, codec: "h264", outputLocation: `out/${name}.mp4`, inputProps });
  console.log(`rendered out/${name}.mp4  ${(timeline.durationInFrames / timeline.fps).toFixed(1)}s video in ${((Date.now() - t0) / 1000).toFixed(1)}s`);
  console.log(`  cues: ${timeline.cues.map((c) => `${c.sfx}@${(c.frame / timeline.fps).toFixed(2)}s`).join("  ")}`);

  // First-frame title check: render the title layer alone, then measure it.
  const textOnly = { timeline, titleOnly: true };
  const still = await selectComposition({ serveUrl, id: "Short", inputProps: textOnly });
  await renderStill({ composition: still, serveUrl, output: `out/${name}.title-mask.png`, inputProps: textOnly, frame: 0 });
  await renderStill({ composition, serveUrl, output: `out/${name}.frame0.png`, inputProps, frame: 0 });
  console.log(execFileSync("python3", ["-I", "scripts/check_title.py", `out/${name}.title-mask.png`, `out/${name}.frame0.png`], { encoding: "utf8" }).trim());
  return timeline;
}

const a = await renderShort(spec, spec.name);

if (compare) {
  const [id, seconds] = compare;
  const before = spec.scenes.find((s) => s.id === id).seconds;
  const b = await renderShort(setLength(spec, id, Number(seconds)), `${spec.name}.${id}-${seconds}s`);
  mkdirSync("public/out", { recursive: true });
  copyFileSync(`out/${spec.name}.mp4`, "public/out/a.mp4");
  copyFileSync(`out/${spec.name}.${id}-${seconds}s.mp4`, "public/out/b.mp4");
  const props = {
    a: { timeline: a, video: "out/a.mp4", label: "A", title: `${id} = ${before}s`, changed: id },
    b: { timeline: b, video: "out/b.mp4", label: "B", title: `${id} = ${seconds}s`, changed: id },
  };
  // Re-bundle so the two fresh renders are in the bundle's public folder.
  const compareUrl = await bundle({ entryPoint: path.resolve("src/index.jsx") });
  const composition = await selectComposition({ serveUrl: compareUrl, id: "Compare", inputProps: props });
  await renderMedia({ composition, serveUrl: compareUrl, codec: "h264", outputLocation: `out/${spec.name}.compare.mp4`, inputProps: props });
  console.log(`rendered out/${spec.name}.compare.mp4`);
}
