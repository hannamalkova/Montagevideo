import '@fontsource/inter/600.css';
import {AbsoluteFill, OffthreadVideo, Sequence, Audio, staticFile} from 'remotion';

export const RANOK_FPS = 30;
const f = (s) => Math.round(s * RANOK_FPS);

// Instagram "Classic"-style caption: Inter SemiBold, white, centred.
const cap = {
  position: 'absolute', left: 80, right: 80, textAlign: 'center',
  fontFamily: 'Inter, "Noto Color Emoji"', fontWeight: 600, fontSize: 37, lineHeight: '46px', color: 'white',
  textShadow: '0 1px 3px rgba(0,0,0,0.3)',
};
const CENTER = 660;   // ref captions sit at y≈440 of 1280

// Times on the output timeline follow the reference's text changes.
// Clips are *_warm.mp4: brighter, warmer grade (ffmpeg eq gamma 1.22 + colorbalance),
// then *_crisp.mp4: contrast 1.12 + luma unsharp for a crisper image.
// Applied to footage only so captions stay pure white.
export const ranokDefault = {
  shots: [
    {src: 'ranok/intro_crisp.mp4', from: 0.5, at: 0, until: 3.133},
    {src: 'ranok/water_crisp.mp4', from: 0.5, at: 3.133, until: 4.067},
    {src: 'ranok/ball_orig_crisp.mp4', from: 0.5, at: 4.067, until: 5.467},
    // kids_full.mp4 starts at 4.0 s of IMG_4154; kids join one by one
    {src: 'ranok/kids_full_crisp.mp4', from: 0.8, at: 5.467, until: 7.733},   // 1st: youngest son runs in (~5.5 s)
    {src: 'ranok/kids_full_crisp.mp4', from: 7.3, at: 7.733, until: 9.233},   // 2nd: boy in yellow (~11.5 s)
    {src: 'ranok/kids_full_crisp.mp4', from: 12.3, at: 9.233, until: 10.733}, // 3rd: boy in black (~16.5 s)
    {src: 'ranok/kids_full_crisp.mp4', from: 16.4, at: 10.733, until: 16.433}, // 4th: boy in white (~20.5 s), heart
  ],
  captions: [
    {at: 0, until: 3.133, lines: ['3 речі, без яких я не готова', 'починати свій ранок?']},
    {at: 3.133, until: 4.067, lines: ['1. Вода']},
    {at: 4.067, until: 5.467, lines: ['2. М’ячик']},
    {at: 5.467, until: 10.733, lines: ['3. І це ...']},
    {at: 10.733, until: 16.433, lines: ['❤️']},
  ],
  duration: 16.433,
};
export const ranokDuration = (p) => f(p.duration);

export const Ranok = ({shots, captions}) => (
  <AbsoluteFill style={{backgroundColor: 'black'}}>
    {shots.map((s, i) => (
      <Sequence key={i} from={f(s.at)} durationInFrames={f(s.until) - f(s.at)}>
        <OffthreadVideo src={staticFile(s.src)} startFrom={f(s.from)} muted />
      </Sequence>
    ))}
    <Audio src={staticFile('ranok/music.wav')} />
    {captions.map((c, i) => (
      <Sequence key={i} from={f(c.at)} durationInFrames={f(c.until) - f(c.at)}>
        <div style={{...cap, top: CENTER - (c.lines.length * 46) / 2}}>
          {c.lines.map((l, j) => <div key={j}>{l}</div>)}
        </div>
      </Sequence>
    ))}
  </AbsoluteFill>
);
