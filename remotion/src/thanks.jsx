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
    {src: 'hook', from: 0.0, until: g(6)},       // you walk in and show "Ми вдячні"
    {src: 'holdup', from: 0.0, until: g(9)},     // holding the poster up on the wardrobe
    {src: 'fall', from: 0.1, until: g(12)},      // the paper unrolls and falls to the floor
    {src: 'smooth', from: 0.0, until: g(14)},    // smoothing / pressing it on
    {src: 'lines', from: 0.3, until: g(16)},     // drawing the columns
    {src: 'hand', from: 0.1, until: g(18)},      // close-up: hand writing (on the music accent)
    {src: 'dad', from: 0.3, until: g(20)},
    {src: 'eldest', from: 0.3, until: g(22)},
    {src: 'green', from: 0.3, until: g(24)},
    {src: 'small', from: 0.3, until: g(26)},
    {src: 'momwrite', from: 0.3, until: g(28)},
    {src: 'smile', from: 0.0, until: 21.6},      // you and the youngest smiling at the camera
  ],
  hookUntil: g(6),
  cta: {text: 'а ви за що вдячні?', from: g(28) + 0.2},
  // music_ext.wav = reference track with 5 beats (7.98-11.40 s) repeated, so the grid holds
  duration: 21.6,
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
      <Audio src={staticFile('thanks/music_ext.wav')} />

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
