import '@fontsource/inter/500.css';
import '@fontsource/inter/700.css';
import '@fontsource/montserrat/600.css';
import {AbsoluteFill, OffthreadVideo, Img, Audio, Sequence, staticFile, useCurrentFrame, interpolate, Easing} from 'remotion';

export const BEHIND_FPS = 30;
const f = (s) => Math.round(s * BEHIND_FPS);

// Text-behind-person: video -> big words -> matted person (RVM alpha) -> question caption.
// Then the "vine boom" hit: freeze frame, black & white, punch-in zoom, big skull.
export const behindDefault = {
  question: {text: 'Як довго тривають ваші тренування?', from: 0, until: 2.4},
  // word timings from Whisper on the child's answer
  words: [
    {text: 'ПОКИ', at: 2.70, line: 0},
    {text: 'НЕ', at: 3.46, line: 0},
    {text: 'ЗДОХНЕМО', at: 3.64, line: 1},
  ],
  hitAt: 4.4,        // right after "здохнем" ends (4.36)
  freezeFor: 1.3,    // seconds of B&W freeze after the boom
  zoom: 1.1,        // keeps the 965px-wide words inside the frame after the punch-in
  color: '#E4F56A',
};
export const behindDuration = (p) => f(p.hitAt + p.freezeFor);

const Pop = ({at, children, style}) => {
  const fr = useCurrentFrame();
  const t = fr - f(at);
  // keep layout space reserved before the word appears, so earlier words don't shift
  const s = interpolate(t, [0, 4], [0.85, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return <span style={{display: 'inline-block', transform: `scale(${s})`, transformOrigin: 'left bottom', ...style,
    visibility: t < 0 ? 'hidden' : 'visible'}}>{children}</span>;
};

const full = {position: 'absolute', inset: 0, width: '100%', height: '100%'};

export const Behind = ({question, words, hitAt, freezeFor, zoom, color}) => {
  const fr = useCurrentFrame();
  const hit = f(hitAt);
  const frozen = fr >= hit;
  const th = fr - hit;
  // punch-in: fast ease-out zoom over 5 frames, tiny shake on impact
  const z = frozen ? interpolate(th, [0, 5], [1, zoom], {extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)}) : 1;
  const shake = frozen && th < 6 ? Math.sin(th * 2.3) * (6 - th) * 3 : 0;
  const skullScale = frozen ? interpolate(th, [0, 3, 6], [0.3, 1.15, 1], {extrapolateRight: 'clamp'}) : 0;
  const flash = frozen ? interpolate(th, [0, 3], [0.55, 0], {extrapolateRight: 'clamp'}) : 0;

  const big = {fontFamily: 'Inter', fontWeight: 700, color, letterSpacing: '-0.035em', lineHeight: 0.9, whiteSpace: 'nowrap',
    textShadow: '0 4px 24px rgba(0,0,0,0.18)'};
  const bw = frozen ? 'grayscale(1) contrast(1.15)' : 'none';

  return (
    <AbsoluteFill style={{backgroundColor: 'black', overflow: 'hidden'}}>
      <AbsoluteFill style={{transform: `translate(${shake}px, ${-shake / 2}px) scale(${z})`, transformOrigin: '50% 35%'}}>
        {/* background: live video until the hit, then the frozen frame in B&W */}
        <Sequence durationInFrames={hit}>
          <OffthreadVideo src={staticFile('behind/src.mp4')} />
        </Sequence>
        {frozen && <Img src={staticFile('behind/freeze_bg.png')} style={{...full, filter: bw}} />}

        {/* big answer, behind the person (stays in colour on the B&W freeze) */}
        <div style={{position: 'absolute', left: 0, right: 0, top: 250, textAlign: 'center', ...big}}>
          <div style={{fontSize: 200}}>
            {words.filter((w) => w.line === 0).map((w, i) => <span key={i}>{i > 0 && ' '}<Pop at={w.at} style={{transformOrigin: 'center bottom'}}>{w.text}</Pop></span>)}
          </div>
          <div style={{fontSize: 165, marginTop: 4}}>
            {words.filter((w) => w.line === 1).map((w, i) => <Pop key={i} at={w.at} style={{transformOrigin: 'center bottom'}}>{w.text}</Pop>)}
          </div>
        </div>

        {/* the person on top, from Robust Video Matting */}
        <Sequence durationInFrames={hit}>
          <OffthreadVideo src={staticFile('behind/me_fg.webm')} transparent muted style={full} />
        </Sequence>
        {frozen && <Img src={staticFile('behind/freeze_fg.png')} style={{...full, filter: bw}} />}
      </AbsoluteFill>

      {/* boom: white flash, big skull in the middle, sound */}
      {frozen && <AbsoluteFill style={{backgroundColor: 'white', opacity: flash}} />}
      {frozen && (
        <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
          <div style={{fontSize: 520, fontFamily: '"Noto Color Emoji"', transform: `scale(${skullScale})`,
            filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.45))', marginTop: 120}}>💀</div>
        </AbsoluteFill>
      )}
      <Sequence from={hit}>
        <Audio src={staticFile('behind/boom.wav')} volume={1} />
      </Sequence>

      <Sequence from={f(question.from)} durationInFrames={f(question.until) - f(question.from)}>
        <div style={{position: 'absolute', left: 90, right: 90, top: 1420, textAlign: 'center',
          fontFamily: 'Montserrat', fontWeight: 600, fontSize: 54, lineHeight: '66px', color: 'white',
          textShadow: '0 2px 6px rgba(0,0,0,0.55), 0 0 18px rgba(0,0,0,0.35)'}}>
          {question.text}
        </div>
      </Sequence>
    </AbsoluteFill>
  );
};
