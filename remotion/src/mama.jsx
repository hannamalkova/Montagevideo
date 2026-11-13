import '@fontsource/montserrat/700.css';
import {AbsoluteFill, OffthreadVideo, Sequence, Audio, staticFile} from 'remotion';

export const MAMA_FPS = 30;
const f = (s) => Math.round(s * MAMA_FPS);

// Montserrat with Bulgarian letterforms (lang="bg") matches the reference's
// handwritten-style Cyrillic (т→m, д→g, п→n).
const text = {
  fontFamily: 'Montserrat, "Noto Color Emoji"', fontWeight: 700, fontSize: 52, color: 'white',
  textAlign: 'center', position: 'absolute', left: 0, right: 0,
  textShadow: '0 2px 4px rgba(0,0,0,0.35), 0 0 16px rgba(0,0,0,0.25)',
};

// Times in seconds on the output timeline, taken from the reference cuts.
export const mamaDefault = {
  title: ['речі, які можуть', 'зробити кожну маму', 'трішки щасливіше'],
  shots: [
    {src: 'mama/IMG_3696.mp4', from: 0.2, at: 0, until: 2.6},
    {src: 'mama/IMG_3697.mp4', from: 0.0, at: 2.6, until: 4.133},
    {src: 'mama/IMG_3697.mp4', from: 16.8, at: 4.133, until: 5.867},
    {src: 'mama/IMG_3697.mp4', from: 24.5, at: 5.867, until: 8.433},
    {src: 'mama/IMG_3697.mp4', from: 31.5, at: 8.433, until: 10.8},
  ],
  items: [
    {at: 2.6, until: 4.133, lines: ['1) просто посидіти']},
    {at: 4.133, until: 5.733, lines: ['2) просто посидіти з', 'чистою головою']},
    {at: 5.733, until: 10.8, lines: ['3) просто посидіти з', 'чистою головою та', 'гарячою кавою']},
  ],
  quiet: {at: 8.433, until: 10.8, text: '✨В ТИШІ✨'},
  duration: 10.8,
};

export const mamaDuration = (p) => f(p.duration);

const LIST_CENTER = 510;   // list block is vertically centred here (ref: y≈340 of 1280)
const LINE = 92;           // ref line pitch 61px @720

export const Mama = ({title, shots, items, quiet}) => (
  <AbsoluteFill style={{backgroundColor: 'black'}} lang="bg">
    {shots.map((s, i) => (
      <Sequence key={i} from={f(s.at)} durationInFrames={f(s.until) - f(s.at)}>
        <OffthreadVideo src={staticFile(s.src)} startFrom={f(s.from)} muted />
      </Sequence>
    ))}
    <Audio src={staticFile('mama/music.wav')} />
    <Sequence durationInFrames={f(2.6)}>
      <div style={{...text, top: 330 - 90, lineHeight: '60px'}}>
        {title.map((l, i) => <div key={i}>{l}</div>)}
      </div>
    </Sequence>
    {items.map((it, i) => (
      <Sequence key={i} from={f(it.at)} durationInFrames={f(it.until) - f(it.at)}>
        <div style={{...text, top: LIST_CENTER - (it.lines.length * LINE) / 2, lineHeight: `${LINE}px`}}>
          {it.lines.map((l, j) => <div key={j}>{l}</div>)}
        </div>
      </Sequence>
    ))}
    <Sequence from={f(quiet.at)} durationInFrames={f(quiet.until) - f(quiet.at)}>
      <div style={{...text, top: 783 - LINE / 2, lineHeight: `${LINE}px`}}>{quiet.text}</div>
    </Sequence>
  </AbsoluteFill>
);
