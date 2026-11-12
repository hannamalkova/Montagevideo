import {registerRoot, Composition, AbsoluteFill, useCurrentFrame, interpolate} from 'remotion';
const Hello = () => { const f = useCurrentFrame();
  return <AbsoluteFill style={{background:'#111',justifyContent:'center',alignItems:'center'}}>
    <div style={{color:'white',fontSize:90,fontFamily:'sans-serif',opacity:interpolate(f,[0,20],[0,1])}}>Привіт, монтаж!</div></AbsoluteFill>;};
const Root = () => <Composition id="Test" component={Hello} durationInFrames={45} fps={30} width={720} height={1280}/>;
registerRoot(Root);
