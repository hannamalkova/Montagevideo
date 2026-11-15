import '@fontsource/montserrat/300.css';
import '@fontsource/montserrat/600.css';
import {AbsoluteFill, OffthreadVideo, Sequence, Audio, staticFile, useCurrentFrame, interpolate} from 'remotion';

// Blog style (see CLAUDE.md): Montserrat SemiBold 600 for main text, Light 300 for asides.
export const THANKS_FPS = 30;
const f = (s) => Math.round(s * THANKS_FPS);
const B = 0.6845;            // one beat of the music (~87.7 bpm); cuts land on 2-beat steps from 0.45 s
const g = (n) => 0.45 + n * B;

const shadow = '0 2px 6px rgba(0,0,0,0.45), 0 0 18px rgba(0,0,0,0.25)';

export const thanksDefault = {
  shots: [
    {src: 'hook', from: 0.0, until: g(6)},       // you walk in and show "Ми вдячні" (hang1 turn-around shot removed)
    {src: 'hang2', from: 0.2, until: g(7)},
    {src: 'hang3', from: 0.2, until: g(8)},
    {src: 'hang4', from: 0.2, until: g(9)},
    {src: 'lines', from: 0.3, until: g(11)},     // drawing the columns
    {src: 'hand', from: 0.1, until: g(13)},      // close-up: hand writing (music accent at ~8 s)
    {src: 'dad', from: 0.3, until: g(15)},
    {src: 'eldest', from: 0.3, until: g(17)},
    {src: 'green', from: 0.3, until: g(19)},
    {src: 'small', from: 0.3, until: g(21)},
    {src: 'momwrite', from: 0.3, until: g(23)},
    {src: 'smile', from: 0.0, until: 18.2},      // you and the youngest smiling at the camera
  ],
  hookUntil: g(6),
  cta: {text: 'а ви за що вдячні?', from: g(23) + 0.2},
  duration: 18.2,
};
export const thanksDuration = (p) => f(p.duration);

const FadeIn = ({at, children}) => {
  const fr = useCurrentFrame();
  const o = interpolate(fr - f(at), [0, 6], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const y = interpolate(fr - f(at), [0, 8], [14, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return <div style={{opacity: o, transform: `translateY(${y}px)`}}>{children}</div>;
};

export const Thanks = ({shots, hookUntil, cta}) => {
  let prev = 0;
  return (
    <AbsoluteFill style={{backgroundColor: 'black'}}>
      {shots.map((s, i) => {
        const at = prev; prev = s.until;
        return (
          <Sequence key={i} from={f(at)} durationInFrames={f(s.until) - f(at)}>
            <OffthreadVideo src={staticFile(`thanks/${s.src}.mp4`)} startFrom={f(s.from)} muted />
          </Sequence>
        );
      })}
      <Audio src={staticFile('thanks/music.wav')} />

      {/* hook: small Light line / big spaced SemiBold word / small Light line */}
      <Sequence durationInFrames={f(hookUntil)}>
        <div style={{position: 'absolute', left: 0, right: 0, top: 190, textAlign: 'center', color: 'white', textShadow: shadow,
          fontFamily: 'Montserrat'}}>
          <FadeIn at={0.15}><div style={{fontWeight: 300, fontSize: 58, letterSpacing: '0.02em'}}>наша нова</div></FadeIn>
          <FadeIn at={0.45}><div style={{fontWeight: 600, fontSize: 112, letterSpacing: '0.16em', margin: '6px 0 2px', paddingLeft: '0.16em'}}>ТРАДИЦІЯ</div></FadeIn>
          <FadeIn at={0.75}><div style={{fontWeight: 300, fontSize: 58, letterSpacing: '0.02em'}}>в листопаді</div></FadeIn>
        </div>
      </Sequence>

      <Sequence from={f(cta.from)}>
        <div style={{position: 'absolute', left: 60, right: 60, top: 300, textAlign: 'center', color: 'white', textShadow: shadow,
          fontFamily: 'Montserrat', fontWeight: 600, fontSize: 60}}>
          <FadeIn at={0}>{cta.text}</FadeIn>
        </div>
      </Sequence>
    </AbsoluteFill>
  );
};
