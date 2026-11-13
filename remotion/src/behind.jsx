import '@fontsource/inter/500.css';
import '@fontsource/inter/700.css';
import '@fontsource/montserrat/600.css';
import {AbsoluteFill, OffthreadVideo, Sequence, staticFile, useCurrentFrame, interpolate} from 'remotion';

export const BEHIND_FPS = 30;
const f = (s) => Math.round(s * BEHIND_FPS);

// Text-behind-person: video -> big words -> matted person (RVM alpha) -> question caption.
export const behindDefault = {
  question: {text: 'Як довго тривають ваші тренування?', from: 0, until: 2.4},
  // word timings from Whisper on the child's answer
  words: [
    {text: 'ПОКИ', at: 2.70, line: 0},
    {text: 'НЕ', at: 3.46, line: 0},
    {text: 'ЗДОХНЕМО', at: 3.64, line: 1},
  ],
  skullAt: 4.36,
  color: '#E4F56A',
  duration: 6.2,
};
export const behindDuration = (p) => f(p.duration);

const Pop = ({at, children, style}) => {
  const fr = useCurrentFrame();
  const t = fr - f(at);
  // keep layout space reserved before the word appears, so earlier words don't shift
  const s = interpolate(t, [0, 4], [0.85, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return <span style={{display: 'inline-block', transform: `scale(${s})`, transformOrigin: 'left bottom', ...style,
    visibility: t < 0 ? 'hidden' : 'visible'}}>{children}</span>;
};

export const Behind = ({question, words, skullAt, color}) => {
  const big = {fontFamily: 'Inter', fontWeight: 700, color, letterSpacing: '-0.035em', lineHeight: 0.9, whiteSpace: 'nowrap',
    textShadow: '0 4px 24px rgba(0,0,0,0.18)'};
  return (
    <AbsoluteFill style={{backgroundColor: 'black'}}>
      <OffthreadVideo src={staticFile('behind/src.mp4')} />
      {/* big answer, behind the person */}
      <div style={{position: 'absolute', left: 0, right: 0, top: 250, textAlign: 'center', ...big}}>
        <div style={{fontSize: 214}}>
          {words.filter((w) => w.line === 0).map((w, i) => <span key={i}>{i > 0 && ' '}<Pop at={w.at} style={{transformOrigin: 'center bottom'}}>{w.text}</Pop></span>)}
        </div>
        <div style={{fontSize: 177, marginTop: 4}}>
          {words.filter((w) => w.line === 1).map((w, i) => <Pop key={i} at={w.at} style={{transformOrigin: 'center bottom'}}>{w.text}</Pop>)}
        </div>
      </div>
      <div style={{position: 'absolute', left: 50, top: 690, fontSize: 230, fontFamily: '"Noto Color Emoji"'}}>
        <Pop at={skullAt} style={{rotate: '-12deg'}}>💀</Pop>
      </div>
      {/* the person on top, from Robust Video Matting */}
      <OffthreadVideo src={staticFile('behind/me_fg.webm')} transparent muted
        style={{position: 'absolute', inset: 0, width: '100%', height: '100%'}} />
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
