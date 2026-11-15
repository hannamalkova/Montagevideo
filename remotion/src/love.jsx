import '@fontsource/montserrat/400.css';
import '@fontsource/montserrat/600.css';
import {AbsoluteFill, OffthreadVideo, Sequence, Audio, staticFile, useCurrentFrame, interpolate} from 'remotion';

// Blog style (CLAUDE.md): Montserrat — crossed-out line Regular 400 (Light was unreadable on the bright sky)
// with a red strike, answer SemiBold 600; a soft dark band sits behind the captions.
export const LOVE_FPS = 30;
const f = (s) => Math.round(s * LOVE_FPS);
const shadow = '0 2px 6px rgba(0,0,0,0.65), 0 0 20px rgba(0,0,0,0.45)';
const RED = '#E5262B';

// Captions sit in the sky above the couple: across all shots the highest head is at y≈572
// (person detector), text block spans ~300-520, so it never covers you.
// Shots: no tripod in frame; close-ups and kisses (hook, s1, s4, s7) alternate with running shots
// (r_run2him IMG_4369, r_hands IMG_5915, r_walk IMG_5908, r_jump IMG_5911).
const TEXT_TOP = 300;

// Cut times follow the reference edit.
export const loveDefault = {
  hook: ['який найдорожчий подарунок', 'тобі зробив твій чоловік?'],
  // clips: horizon levelled (tools/horizon.py + level_apply.py -> *_lv), then the brighter shots
  // pulled toward the user's darker shots (colormatch.py --ref=dark clips -> *_lv_dk)
  shots: [
    {src: 'hook_light_lv_dk', until: 3.167},
    {src: 's1_lv_dk', until: 4.850, no: 'сама розберешся', yes: 'не переживай, ми все вирішимо'},
    {src: 'r_run2him_lv_dk', until: 6.534, no: 'подивимось', yes: 'я вже придумав, як ми це зробимо'},
    {src: 'r_hands_lv_dk', until: 8.217, no: 'не виноси мені мозок', yes: 'давай поговоримо'},
    {src: 's4_lv_dk', until: 9.901, no: 'у мене немає на це часу', yes: 'нічого не плануй, у нас побачення'},
    {src: 'd_lift_lv_dk', until: 11.584, no: 'роби як знаєш', yes: 'я на твоєму боці'},
    {src: 'r_walk_lv_dk', until: 13.268, no: 'я тобі нічого не обіцяв', yes: 'ти завжди можеш на мене покластися'},
    {src: 'd_runspin_lv_dk', until: 14.951, no: 'не до тебе зараз', yes: 'я поруч'},
    {src: 'r_jump_lv_dk', until: 16.635, no: 'а сама не можеш?!', yes: 'давай допоможу'},
    {src: 'd_twirl_lv_dk', until: 18.318, no: 'знову ти зі своїми емоціями', yes: 'я тебе чую'},
    {src: 's7_lv_dk', until: 20.002, no: 'не лізь, не твоя справа!', yes: 'ми команда'},
  ],
  // music: null = silent export (user will add her own track). music_ext.wav was the reference track extended.
  music: null,
  duration: 20.002,
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

export const Love = ({hook, shots, music}) => {
  let prev = 0;
  const base = {position: 'absolute', left: 50, right: 50, textAlign: 'center', color: 'white', textShadow: shadow, fontFamily: 'Montserrat'};
  return (
    <AbsoluteFill style={{backgroundColor: 'black'}}>
      {shots.map((s, i) => {
        const at = prev; prev = s.until;
        const band = <div style={{position: 'absolute', left: 0, right: 0, top: 230, height: 360,
          background: 'radial-gradient(ellipse 70% 50% at 50% 50%, rgba(0,0,0,0.32), rgba(0,0,0,0))'}} />;
        return (
          <Sequence key={i} from={f(at)} durationInFrames={f(s.until) - f(at)}>
            <OffthreadVideo src={staticFile(`love/${s.src}.mp4`)} startFrom={f(0.1)} muted />
            {band}
            {s.no && (
              <div style={{...base, top: TEXT_TOP}}>
                <div style={{fontWeight: 400, fontSize: 50}}><Strike>{s.no}</Strike></div>
                <div style={{fontWeight: 600, fontSize: 48, marginTop: 10}}>{s.yes}</div>
              </div>
            )}
          </Sequence>
        );
      })}
      <Sequence durationInFrames={f(shots[0].until)}>
        <div style={{...base, top: TEXT_TOP, fontWeight: 600, fontSize: 52, lineHeight: '64px'}}>
          {hook.map((l, i) => <div key={i}>{l}</div>)}
        </div>
      </Sequence>
      {music && <Audio src={staticFile(music)} />}
    </AbsoluteFill>
  );
};
