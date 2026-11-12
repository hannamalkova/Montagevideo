import '@fontsource/montserrat/600.css';
import '@fontsource/montserrat/700.css';
import {
  registerRoot, Composition, AbsoluteFill, OffthreadVideo, Sequence, Audio,
  staticFile, useVideoConfig,
} from 'remotion';
import {Animals, animalsDefault, animalsDuration, ANIMALS_FPS} from './animals';

const FPS = 30;
const YELLOW = '#EBC620';

const font = {
  fontFamily: 'Montserrat',
  fontSize: 44,
  lineHeight: '51px',
  color: 'white',
  letterSpacing: 0.2,
  // Source has a bright ceiling behind the text (reference had a beige wall),
  // so a soft shadow keeps it readable.
  textShadow: '0 2px 3px rgba(0,0,0,0.55), 0 0 14px rgba(0,0,0,0.45)',
};

const List = ({items, top}) => (
  <div style={{position: 'absolute', left: 129, top, ...font, fontWeight: 600}}>
    {items.map((it, i) => (
      <div key={i} style={{color: it.yellow ? YELLOW : 'white'}}>{`${i + 1}. ${it.text}`}</div>
    ))}
  </div>
);

// Timing (seconds, output timeline) mirrors the reference:
// list -> kid sits, his line -> hug, updated list.
const Trener = ({trimStart, lineAt, listAt}) => {
  const {durationInFrames} = useVideoConfig();
  const f = (s) => Math.round(s * FPS);
  const base = [
    {text: 'Скласти план тренувань'},
    {text: 'Купити спортінвентар'},
    {text: 'Оплатити оренду'},
  ];
  return (
    <AbsoluteFill style={{backgroundColor: 'black'}}>
      <OffthreadVideo src={staticFile('IMG_4243_lock_slow.mp4')} startFrom={f(trimStart)} muted />
      {/* Reference track, extended by 3 intro beats so its drop lands on the kid's line */}
      <Audio src={staticFile('music_v4.wav')} />
      <Sequence durationInFrames={f(lineAt)}>
        <List items={base} top={308} />
      </Sequence>
      <Sequence from={f(lineAt)} durationInFrames={f(listAt) - f(lineAt)}>
        <div style={{position: 'absolute', left: 0, right: 0, top: 368, textAlign: 'center',
          ...font, fontWeight: 700, color: YELLOW}}>
          – Сенсейко, я загубив капці
        </div>
      </Sequence>
      <Sequence from={f(listAt)} durationInFrames={durationInFrames - f(listAt)}>
        <List items={[{text: 'Знайти капці', yellow: true}, ...base]} top={322} />
      </Sequence>
    </AbsoluteFill>
  );
};

const Root = () => (
  <>
  <Composition
    id="Trener"
    component={Trener}
    fps={FPS}
    width={1080}
    height={1920}
    durationInFrames={Math.round(10.35 * FPS)}
    defaultProps={{trimStart: 0.1, lineAt: 4.65, listAt: 6.9}}
  />
  <Composition
    id="Animals"
    component={Animals}
    fps={ANIMALS_FPS}
    width={1080}
    height={1920}
    durationInFrames={animalsDuration(animalsDefault)}
    defaultProps={animalsDefault}
    calculateMetadata={({props}) => ({durationInFrames: animalsDuration(props)})}
  />
  </>
);

registerRoot(Root);
