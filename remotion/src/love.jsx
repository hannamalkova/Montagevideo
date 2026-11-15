import '@fontsource/montserrat/400.css';
import '@fontsource/montserrat/600.css';
import {AbsoluteFill, OffthreadVideo, Sequence, Audio, staticFile, useCurrentFrame, interpolate} from 'remotion';

// Blog style (CLAUDE.md): Montserrat — crossed-out line Regular 400 (Light was unreadable on the bright sky)
// with a red strike, answer SemiBold 600; a soft dark band sits behind the captions.
export const LOVE_FPS = 30;
const f = (s) => Math.round(s * LOVE_FPS);
const shadow = '0 2px 6px rgba(0,0,0,0.65), 0 0 20px rgba(0,0,0,0.45)';
const RED = '#E5262B';

// Cut times follow the reference edit.
export const loveDefault = {
  hook: ['який найдорожчий подарунок', 'тобі зробив твій чоловік?'],
  shots: [
    {src: 'hook', until: 3.167},
    {src: 's1', until: 5.2, no: 'сама розберешся', yes: 'не переживай, ми все вирішимо'},
    {src: 's2', until: 6.667, no: 'подивимось', yes: 'я вже придумав, як ми це зробимо'},
    {src: 's3', until: 8.067, no: 'не виноси мені мозок', yes: 'давай поговоримо'},
    {src: 's4', until: 9.6, no: 'у мене немає на це часу', yes: 'нічого не плануй, у нас побачення'},
    {src: 's5', until: 11.067, no: 'я тобі нічого не обіцяв', yes: 'ти завжди можеш на мене покластися'},
    {src: 's6', until: 12.5, no: 'а сама не можеш?!', yes: 'давай допоможу'},
    {src: 's7', until: 14.39, no: 'не лізь, не твоя справа!', yes: 'ми команда'},
  ],
  duration: 14.39,
};
export const loveDuration = (p) => f(p.duration);

const Strike = ({children}) => {
  const fr = useCurrentFrame();
  const w = interpolate(fr, [2, 9], [0, 100], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});  // line draws across
  return (
    <span style={{position: 'relative', display: 'inline-block'}}>
      {children}
      <span style={{position: 'absolute', left: -6, top: '54%', height: 4, width: `calc(${w}% + 12px)`, background: RED,
        borderRadius: 2, boxShadow: '0 1px 3px rgba(0,0,0,0.35)'}} />
    </span>
  );
};

export const Love = ({hook, shots}) => {
  let prev = 0;
  const base = {position: 'absolute', left: 50, right: 50, textAlign: 'center', color: 'white', textShadow: shadow, fontFamily: 'Montserrat'};
  return (
    <AbsoluteFill style={{backgroundColor: 'black'}}>
      {shots.map((s, i) => {
        const at = prev; prev = s.until;
        const band = <div style={{position: 'absolute', left: 0, right: 0, top: 780, height: 330,
          background: 'radial-gradient(ellipse 70% 50% at 50% 50%, rgba(0,0,0,0.32), rgba(0,0,0,0))'}} />;
        return (
          <Sequence key={i} from={f(at)} durationInFrames={f(s.until) - f(at)}>
            <OffthreadVideo src={staticFile(`love/${s.src}.mp4`)} startFrom={f(0.1)} muted />
            {band}
            {s.no && (
              <div style={{...base, top: 860}}>
                <div style={{fontWeight: 400, fontSize: 50}}><Strike>{s.no}</Strike></div>
                <div style={{fontWeight: 600, fontSize: 48, marginTop: 10}}>{s.yes}</div>
              </div>
            )}
          </Sequence>
        );
      })}
      <Sequence durationInFrames={f(shots[0].until)}>
        <div style={{...base, top: 860, fontWeight: 600, fontSize: 52, lineHeight: '64px'}}>
          {hook.map((l, i) => <div key={i}>{l}</div>)}
        </div>
      </Sequence>
      <Audio src={staticFile('love/music.wav')} />
    </AbsoluteFill>
  );
};
