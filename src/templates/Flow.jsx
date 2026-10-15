import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";

// Steps appear at scene.stepFrames, the same frames the compiler pinned the
// pop sounds to, so picture and sound cannot drift apart.
export const Flow = ({ scene }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: "#0b1020", alignItems: "center", paddingTop: 300, gap: 34 }}>
      {scene.steps.map((step, i) => {
        const at = scene.stepFrames[i];
        const p = interpolate(frame, [at, at + 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        return (
          <div key={step} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 34, opacity: p, transform: `translateY(${(1 - p) * 40}px)` }}>
            {i > 0 && <div style={{ width: 8, height: 50, background: "#4b5bdc", borderRadius: 4 }} />}
            <div
              style={{
                width: 760,
                padding: "34px 0",
                borderRadius: 24,
                textAlign: "center",
                fontFamily: "Arial Black, Arial, sans-serif",
                fontSize: 58,
                color: "#fff",
                background: i === scene.steps.length - 1 ? "#1a7f37" : "#22306e",
                border: "4px solid #4b5bdc",
              }}
            >
              {step}
            </div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
