import { Composition, registerRoot } from "remotion";
import { Short } from "./Short.jsx";
import { Compare } from "./Compare.jsx";

const Root = () => (
  <>
    <Composition
      id="Short"
      component={Short}
      fps={30}
      width={1080}
      height={1920}
      durationInFrames={1}
      defaultProps={{ timeline: null, titleOnly: false }}
      calculateMetadata={({ props }) => ({
        durationInFrames: props.timeline.durationInFrames,
        fps: props.timeline.fps,
        width: props.timeline.width,
        height: props.timeline.height,
      })}
    />
    <Composition
      id="Compare"
      component={Compare}
      fps={30}
      width={1920}
      height={1080}
      durationInFrames={1}
      defaultProps={{ a: null, b: null }}
      calculateMetadata={({ props }) => ({
        durationInFrames: Math.max(props.a.timeline.durationInFrames, props.b.timeline.durationInFrames) + 15,
      })}
    />
  </>
);

registerRoot(Root);
