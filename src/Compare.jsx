import { AbsoluteFill, OffthreadVideo, staticFile, useCurrentFrame } from "remotion";

const COLORS = { title: "#2a3fd6", ui_demo: "#8a5cf6", flow: "#1a7f37" };
const SFX_COLOR = { whoosh: "#ffd84a", click: "#ff6b6b", pop: "#5ee0ff" };

// Two renders of the same spec, one scene length changed, on one time scale.
export const Compare = ({ a, b }) => {
  const frame = useCurrentFrame();
  const total = Math.max(a.timeline.durationInFrames, b.timeline.durationInFrames);
  const BAR_W = 1700;
  const px = (f) => (f / total) * BAR_W;

  const Track = ({ run, top }) => (
    <div style={{ position: "absolute", left: 110, top, width: BAR_W, height: 120 }}>
      <div style={{ position: "absolute", left: -100, top: 6, fontFamily: "Menlo, monospace", fontSize: 22, color: "#9aa3c7" }}>{run.label}</div>
      {run.timeline.scenes.map((s) => (
        <div
          key={s.id}
          style={{
            position: "absolute",
            left: px(s.from),
            width: px(s.durationInFrames) - 4,
            height: 46,
            borderRadius: 8,
            background: COLORS[s.template],
            color: "#fff",
            fontFamily: "Menlo, monospace",
            fontSize: 20,
            lineHeight: "46px",
            paddingLeft: 10,
            overflow: "hidden",
            outline: s.id === run.changed ? "3px solid #ffd84a" : "none",
          }}
        >
          {s.id} {(s.durationInFrames / run.timeline.fps).toFixed(0)}s
        </div>
      ))}
      {run.timeline.cues.map((c, i) => (
        <div key={i} style={{ position: "absolute", left: px(c.frame) - 3, top: 54, width: 6, height: 40, borderRadius: 3, background: SFX_COLOR[c.sfx] }} />
      ))}
    </div>
  );

  return (
    <AbsoluteFill style={{ background: "#0b1020" }}>
      {[a, b].map((run, i) => (
        <div key={i} style={{ position: "absolute", top: 40, left: i === 0 ? 420 : 1060, textAlign: "center" }}>
          <div style={{ width: 410, height: 728, borderRadius: 16, overflow: "hidden", boxShadow: "0 20px 50px rgba(0,0,0,.5)" }}>
            <OffthreadVideo src={staticFile(run.video)} muted={i === 1} style={{ width: 410, height: 728 }} />
          </div>
          <div style={{ marginTop: 12, fontFamily: "Arial Black, Arial, sans-serif", fontSize: 26, color: "#fff" }}>{run.title}</div>
        </div>
      ))}
      <Track run={a} top={850} />
      <Track run={b} top={960} />
      <div style={{ position: "absolute", left: 110 + px(Math.min(frame, total)), top: 840, width: 3, height: 225, background: "#fff" }} />
      <div style={{ position: "absolute", right: 60, top: 790, fontFamily: "Menlo, monospace", fontSize: 18, color: "#9aa3c7" }}>
        ticks: <span style={{ color: SFX_COLOR.whoosh }}>whoosh</span> · <span style={{ color: SFX_COLOR.click }}>click</span> · <span style={{ color: SFX_COLOR.pop }}>pop</span>
      </div>
    </AbsoluteFill>
  );
};
