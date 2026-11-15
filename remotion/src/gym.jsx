import '@fontsource/montserrat/600.css';
import {AbsoluteFill, OffthreadVideo, Sequence, Audio, staticFile} from 'remotion';

// Blog style (CLAUDE.md): Montserrat SemiBold, white, soft shadow (stronger here: light gym walls).
export const GYM_FPS = 30;
const f = (s) => Math.round(s * GYM_FPS);

// Audio = reference voice-over: 0-4.88 "Фізичні вправи забезпечують ендорфінами...",
// 4.88-7.34 "Щасливі люди не вбивають своїх чоловіків", then music to 12.3.
export const gymDefault = {
  caption: ['чому насправді мама 4', 'ходить на тренування?'],
  shots: [
    {src: 'bag', until: 1.2},
    {src: 'row', until: 2.3},
    {src: 'press', until: 3.4},
    {src: 'bridge', until: 4.88},
    {src: 'deadlift', until: 6.0},   // punchline starts: the strongest lift
    {src: 'kick', until: 7.34},
    {src: 'lunge', until: 8.4},
    {src: 'lateral', until: 9.5},
    {src: 'overhead', until: 10.6},
    {src: 'smile', until: 12.3},     // ends on a smile to camera
  ],
  duration: 12.3,
};
export const gymDuration = (p) => f(p.duration);

export const Gym = ({caption, shots}) => {
  let prev = 0;
  return (
    <AbsoluteFill style={{backgroundColor: 'black'}}>
      {shots.map((s, i) => {
        const at = prev; prev = s.until;
        return (
          <Sequence key={i} from={f(at)} durationInFrames={f(s.until) - f(at)}>
            <OffthreadVideo src={staticFile(`gym/${s.src}.mp4`)} startFrom={f(0.1)} muted />
          </Sequence>
        );
      })}
      <Audio src={staticFile('gym/audio.wav')} />
      <div style={{position: 'absolute', left: 60, right: 60, top: 1250, textAlign: 'center', color: 'white',
        fontFamily: 'Montserrat', fontWeight: 600, fontSize: 60, lineHeight: '74px',
        textShadow: '0 2px 8px rgba(0,0,0,0.6), 0 0 22px rgba(0,0,0,0.35)'}}>
        {caption.map((l, i) => <div key={i}>{l}</div>)}
      </div>
    </AbsoluteFill>
  );
};
