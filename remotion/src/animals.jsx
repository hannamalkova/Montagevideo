import '@fontsource/montserrat/400.css';
import {AbsoluteFill, OffthreadVideo, Sequence, Audio, staticFile} from 'remotion';

export const ANIMALS_FPS = 30;
const f = (s) => Math.round(s * ANIMALS_FPS);

// Each clip: file in public/animals, where to start in it, how long it plays.
export const animalsDefault = {
  caption: '👥 не привчай його спати з тобою',
  captionUntil: 2.7,
  music: 'animals/music.wav',
  clips: [
    {src: 'animals/open.mp4', from: 1.0, dur: 2.7},
    {src: 'animals/swan_wide_up.mp4', from: 0, dur: 1.3667},
    {src: 'animals/swan_close_up.mp4', from: 0, dur: 1.2},
    {src: 'animals/polarbear_up.mp4', from: 0, dur: 1.9},
    {src: 'animals/koala_up.mp4', from: 0, dur: 2.9333},
    {src: 'animals/otter_up.mp4', from: 0, dur: 3.0},
  ],
};

export const animalsDuration = (props) => props.clips.reduce((a, c) => a + f(c.dur), 0);

export const Animals = ({caption, captionUntil, music, clips}) => {
  let at = 0;
  return (
    <AbsoluteFill style={{backgroundColor: 'black'}}>
      {clips.map((c, i) => {
        const start = at;
        at += f(c.dur);
        return (
          <Sequence key={i} from={start} durationInFrames={f(c.dur)}>
            <OffthreadVideo src={staticFile(c.src)} startFrom={f(c.from)} muted
              style={{width: '100%', height: '100%', objectFit: 'cover'}} />
          </Sequence>
        );
      })}
      <Audio src={staticFile(music)} />
      <Sequence durationInFrames={f(captionUntil)}>
        {/* Reference caption: Montserrat Regular, white, centred at mid-frame */}
        <div style={{position: 'absolute', left: 60, right: 60, top: 935, textAlign: 'center',
          fontFamily: 'Montserrat, "Noto Color Emoji"', fontWeight: 400, fontSize: 42, color: 'white',
          textShadow: '0 1px 3px rgba(0,0,0,0.45), 0 0 10px rgba(0,0,0,0.25)'}}>
          {caption}
        </div>
      </Sequence>
    </AbsoluteFill>
  );
};
