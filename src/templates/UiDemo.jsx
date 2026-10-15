import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";

// A screen-recording stand-in: a browser card with a visible cursor that
// follows keyframes from the spec and clicks at scene.clickAt.
export const UiDemo = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const t = frame / fps;
  const k = scene.cursor;
  const x = interpolate(t, k.map((p) => p[0]), k.map((p) => p[1]), { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const y = interpolate(t, k.map((p) => p[0]), k.map((p) => p[2]), { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const since = t - scene.clickAt;
  const clicked = since >= 0;
  const ripple = clicked ? interpolate(since, [0, 0.4], [0, 1], { extrapolateRight: "clamp" }) : 0;

  return (
    <AbsoluteFill style={{ background: "#0b1020", alignItems: "center", paddingTop: 260 }}>
      <div style={{ width: 940, height: 1100, borderRadius: 28, background: "#f6f7fb", overflow: "hidden", boxShadow: "0 30px 80px rgba(0,0,0,.5)" }}>
        <div style={{ height: 70, background: "#e3e6ef", display: "flex", alignItems: "center", gap: 14, padding: "0 26px" }}>
          {["#ff5f57", "#febc2e", "#28c840"].map((c) => (
            <div key={c} style={{ width: 20, height: 20, borderRadius: 10, background: c }} />
          ))}
          <div style={{ marginLeft: 20, flex: 1, height: 38, borderRadius: 19, background: "#fff", fontFamily: "Menlo, monospace", fontSize: 22, color: "#555", display: "flex", alignItems: "center", paddingLeft: 18 }}>
            github.com/{scene.repo.replace(/\s/g, "")}
          </div>
        </div>
        <div style={{ padding: 50, fontFamily: "Helvetica, Arial, sans-serif", color: "#1b1f2a" }}>
          <div style={{ fontSize: 52, fontWeight: 700 }}>{scene.repo}</div>
          <div style={{ fontSize: 30, color: "#666", marginTop: 14 }}>★ {scene.stars} · TypeScript · MIT</div>
          <div style={{ marginTop: 40, height: 18, width: "90%", background: "#dde1ea", borderRadius: 9 }} />
          <div style={{ marginTop: 18, height: 18, width: "70%", background: "#dde1ea", borderRadius: 9 }} />
          <div
            style={{
              marginTop: 60,
              display: "inline-block",
              padding: "26px 54px",
              borderRadius: 16,
              fontSize: 38,
              fontWeight: 700,
              color: "#fff",
              background: clicked ? "#1a7f37" : "#2a3fd6",
            }}
          >
            {clicked ? "Demo running…" : "▶ Try the demo"}
          </div>
        </div>
      </div>
      {clicked && (
        <div
          style={{
            position: "absolute",
            left: x * width - 60 * ripple,
            top: y * height - 60 * ripple,
            width: 120 * ripple,
            height: 120 * ripple,
            borderRadius: "50%",
            border: "6px solid rgba(255,216,74,.9)",
            opacity: 1 - ripple,
          }}
        />
      )}
      <svg style={{ position: "absolute", left: x * width, top: y * height }} width="56" height="72" viewBox="0 0 28 36">
        <path d="M2 2 L2 28 L9 21 L14 33 L19 31 L14 19 L24 19 Z" fill="#fff" stroke="#000" strokeWidth="2" />
      </svg>
    </AbsoluteFill>
  );
};
