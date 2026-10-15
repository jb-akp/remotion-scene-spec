import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";

// Fully opaque from frame 0 so the first frame always carries the title.
export const Title = ({ scene, textOnly }) => {
  const frame = useCurrentFrame();
  const scale = textOnly ? 1 : interpolate(frame, [0, 8], [0.94, 1], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill
      style={{
        background: textOnly ? "#000" : "radial-gradient(circle at 50% 40%, #2a3fd6 0%, #0b1020 70%)",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          width: 880,
          textAlign: "center",
          fontFamily: "Arial Black, Arial, sans-serif",
          fontSize: 118,
          lineHeight: 1.05,
          color: "#ffffff",
          transform: `scale(${scale})`,
        }}
      >
        {scene.text}
      </div>
    </AbsoluteFill>
  );
};
