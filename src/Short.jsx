import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame } from "remotion";
import { Title } from "./templates/Title.jsx";
import { UiDemo } from "./templates/UiDemo.jsx";
import { Flow } from "./templates/Flow.jsx";

const TEMPLATES = { title: Title, ui_demo: UiDemo, flow: Flow };

// One shared timeline: scenes, sound cues and caption words are all placed by
// absolute frame from the compiled spec. No scene knows where it starts.
export const Short = ({ timeline, titleOnly }) => {
  if (titleOnly) {
    // Text layer alone on black, used by the first-frame readability check.
    const first = timeline.scenes[0];
    return <Title scene={first} textOnly />;
  }
  return (
    <AbsoluteFill style={{ background: "#0b1020" }}>
      {timeline.scenes.map((scene) => {
        const T = TEMPLATES[scene.template];
        return (
          <Sequence key={scene.id} from={scene.from} durationInFrames={scene.durationInFrames}>
            <T scene={scene} />
          </Sequence>
        );
      })}
      {timeline.cues.map((cue, i) => (
        <Sequence key={i} from={cue.frame} durationInFrames={20}>
          <Audio src={staticFile(`sfx/${cue.sfx}.wav`)} />
        </Sequence>
      ))}
      {timeline.music && <Audio src={staticFile(timeline.music.src)} volume={timeline.music.volume} />}
      <Captions captions={timeline.captions} scenes={timeline.scenes} />
    </AbsoluteFill>
  );
};

const Captions = ({ captions, scenes }) => {
  const frame = useCurrentFrame();
  const scene = scenes.find((s) => frame >= s.from && frame < s.from + s.durationInFrames);
  if (!scene || scene.template === "title") return null;
  const words = captions.filter((c) => c.scene === scene.id && c.frame <= frame).slice(-3);
  if (!words.length) return null;
  return (
    <div style={{ position: "absolute", bottom: 300, width: "100%", textAlign: "center", padding: "0 80px" }}>
      {words.map((w, i) => (
        <span
          key={w.frame}
          style={{
            fontFamily: "Arial Black, Arial, sans-serif",
            fontSize: 68,
            margin: "0 12px",
            color: i === words.length - 1 ? "#ffd84a" : "#ffffff",
            textShadow: "0 6px 0 #000, 0 0 24px rgba(0,0,0,.6)",
          }}
        >
          {w.word}
        </span>
      ))}
    </div>
  );
};
