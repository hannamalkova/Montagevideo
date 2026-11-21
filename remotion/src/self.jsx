import '@fontsource/montserrat/300.css';
import '@fontsource/montserrat/600.css';
import {AbsoluteFill, OffthreadVideo, staticFile, useCurrentFrame, interpolate} from 'remotion';

// Reel in the user's "car video" style: bold left-aligned headline at the top,
// a light-weight aside appearing lower. Blog fonts (CLAUDE.md): Montserrat 600 / 300.
export const SELF_FPS = 30;
const f = (s) => Math.round(s * SELF_FPS);
const shadow = '0 2px 6px rgba(0,0,0,0.45), 0 0 18px rgba(0,0,0,0.25)';

export const selfDefault = {
  headline: ['А отак я б могла', 'виглядати якби', 'не мала дітей'],
  aside: ['[в сенсі? я так і', 'з 4 дітьми виглядаю]'],
  asideAt: 3.6,
  duration: 10.5,
};
export const selfDuration = (p) => f(p.duration);

const Fade = ({at, children}) => {
  const fr = useCurrentFrame();
  const o = interpolate(fr - f(at), [0, 8], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return <div style={{opacity: o}}>{children}</div>;
};

export const Self = ({headline, aside, asideAt}) => (
  <AbsoluteFill style={{backgroundColor: 'black'}}>
    <OffthreadVideo src={staticFile('self/dance.mp4')} muted />
    <div style={{position: 'absolute', left: 96, right: 60, top: 230, color: 'white', textShadow: shadow,
      fontFamily: 'Montserrat', fontWeight: 600, fontSize: 70, lineHeight: '80px', letterSpacing: '-0.01em'}}>
      {headline.map((l, i) => <div key={i}>{l}</div>)}
    </div>
    <div style={{position: 'absolute', left: 96, right: 60, top: 1500, color: 'white', textShadow: shadow,
      fontFamily: 'Montserrat', fontWeight: 300, fontSize: 52, lineHeight: '62px'}}>
      <Fade at={asideAt}>{aside.map((l, i) => <div key={i}>{l}</div>)}</Fade>
    </div>
  </AbsoluteFill>
);
