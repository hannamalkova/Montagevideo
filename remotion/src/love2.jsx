import {AbsoluteFill, OffthreadVideo, Sequence, Audio, staticFile} from 'remotion';

// Love reel, version without captions: 21 s, new shot order (build-up: running -> hugs/lifts -> kisses -> walk).
// Clips are the levelled + colour-matched ones from love.jsx (*_lv_dk); kissB is new (IMG_5914 0:32.5).
export const LOVE2_FPS = 30;
const f = (s) => Math.round(s * LOVE2_FPS);

export const love2Default = {
  shots: [
    {src: 'd_runspin_lv_dk', dur: 2.0},   // you run and spin alone
    {src: 'r_run2him_lv_dk', dur: 1.8},   // you run to him
    {src: 'hookD_lv_dk', dur: 2.0, from: 0.2},  // he hugs you from behind, you laugh
    {src: 'r_hands_lv_dk', dur: 1.6},     // running hand in hand
    {src: 'd_lift_lv_dk', dur: 1.6},      // he lifts and spins you
    {src: 'kiss2_lv_dk', dur: 1.8},       // close kiss against the sky
    {src: 'r_walk_lv_dk', dur: 1.6},      // walking to camera hand in hand
    {src: 'r_jump_lv_dk', dur: 1.6},      // you jump into him
    {src: 'd_twirl_lv_dk', dur: 1.6},     // twirl and kiss
    {src: 'kissB_lv_dk', dur: 2.0},       // kiss by the sea, he lifts you a little
    {src: 's7_lv_dk', dur: 1.8},          // kiss
    {src: 'end_lv_dk', dur: 1.6, from: 0.8},  // walking together along the sea
  ],
  music: null,   // track (Яктак — «Уночі») to be added; silent until then
};
export const love2Duration = (p) => p.shots.reduce((a, s) => a + f(s.dur), 0);

export const Love2 = ({shots, music}) => {
  let at = 0;
  return (
    <AbsoluteFill style={{backgroundColor: 'black'}}>
      {shots.map((s, i) => {
        const start = at; at += f(s.dur);
        return (
          <Sequence key={i} from={start} durationInFrames={f(s.dur)}>
            <OffthreadVideo src={staticFile(`love/${s.src}.mp4`)} startFrom={f(s.from ?? 0.1)} muted />
          </Sequence>
        );
      })}
      {music && <Audio src={staticFile(music)} />}
    </AbsoluteFill>
  );
};
