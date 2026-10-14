import { useEffect, useRef, useState } from 'react';
import { createActionTimeline, samplePose } from './timeline';
import './stage.css';

type Props = {
  actionId: string | null;
  running: boolean;
  motionMode: 'system' | 'paused' | 'full';
  soundEnabled: boolean;
  onActivate(): void;
  onContact(id: string): void;
  onSettled(id: string): void;
};
type Stage = ReturnType<typeof import('./createStage').createStage>;
type Action = { id: string; timeline: ReturnType<typeof createActionTimeline>; start: number; done: boolean };

export default function PlayStage(props: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stageRef = useRef<Stage | null>(null);
  const callbacks = useRef(props); callbacks.current = props;
  const active = useRef<Action | null>(null);
  const actualContact = useRef(false);
  const audio = useRef<AudioContext | null>(null);
  const oscillator = useRef<OscillatorNode | null>(null);
  const [ready,setReady] = useState(false);
  const [fallbackImage,setFallbackImage] = useState(true);
  const [systemReduced,setSystemReduced] = useState(() => typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches);
  const reduced = props.motionMode === 'paused' || (props.motionMode === 'system' && systemReduced);
  const finalize = () => {
    actualContact.current=false;
    const action=active.current;
    if (action && !action.done) { action.done=true; action.timeline.finalize(); }
    try { oscillator.current?.stop(); } catch { /* Already ended. */ }
    oscillator.current=null;
  };
  const finalizeRef=useRef(finalize); finalizeRef.current=finalize;

  useEffect(() => {
    const query=window.matchMedia('(prefers-reduced-motion: reduce)');
    const update=() => setSystemReduced(query.matches);
    query.addEventListener('change',update); return () => query.removeEventListener('change',update);
  },[]);

  useEffect(() => {
    const canvas=canvasRef.current;
    if (!canvas) return;
    let mounted=true;
    let observer: ResizeObserver | undefined;
    const lost=(event: Event) => {
      event.preventDefault(); finalizeRef.current();
      stageRef.current?.dispose(); stageRef.current=null;
      if (mounted) setReady(false);
    };
    canvas.addEventListener('webglcontextlost',lost);
    void import('./createStage').then(({createStage}) => {
      if (!mounted) return;
      const stage=createStage(canvas); stageRef.current=stage;
      const resize=() => { const rect=canvas.getBoundingClientRect(); stage.resize(rect.width,rect.height); stage.render(samplePose(0,true)); };
      resize(); observer=new ResizeObserver(resize); observer.observe(canvas); setReady(true);
    }).catch(() => { if (mounted) { finalizeRef.current(); setReady(false); } });
    return () => {
      mounted=false; observer?.disconnect(); canvas.removeEventListener('webglcontextlost',lost);
      finalizeRef.current(); stageRef.current?.dispose(); stageRef.current=null;
      const context=audio.current; audio.current=null;
      if (context) void context.close().catch(()=>undefined);
    };
  },[]);

  useEffect(() => {
    const id=props.actionId;
    if (!id || !props.running) { finalizeRef.current(); return; }
    if (active.current?.id===id) {
      if (reduced || !ready || document.hidden) finalizeRef.current();
      return;
    }
    finalizeRef.current();
    const action: Action = {
      id, start: performance.now(), done:false,
      timeline:createActionTimeline(id,{
        onContact: actionId => {
          callbacks.current.onContact(actionId);
          if (!actualContact.current || !callbacks.current.soundEnabled || document.hidden) return;
          const context=audio.current;
          if (!context || context.state!=='running') return;
          try {
            const pop=context.createOscillator(); const gain=context.createGain();
            pop.type='sine'; pop.frequency.setValueAtTime(330,context.currentTime); pop.frequency.exponentialRampToValueAtTime(105,context.currentTime+.065);
            gain.gain.setValueAtTime(.055,context.currentTime); gain.gain.exponentialRampToValueAtTime(.0001,context.currentTime+.075);
            pop.connect(gain); gain.connect(context.destination); oscillator.current=pop;
            pop.onended=()=>{ pop.disconnect(); gain.disconnect(); if (oscillator.current===pop) oscillator.current=null; };
            pop.start(); pop.stop(context.currentTime+.08);
          } catch { /* An optional cue never owns the result. */ }
        },
        onSettled: actionId => { action.done=true; callbacks.current.onSettled(actionId); },
      },reduced || !ready || document.hidden),
    };
    active.current=action;
    action.timeline.advance(0);
  },[props.actionId,props.running,reduced,ready]);

  useEffect(() => {
    if (!props.soundEnabled) { try { oscillator.current?.stop(); } catch { /* Already ended. */ } }
  },[props.soundEnabled]);

  useEffect(() => {
    if (!ready) return;
    let raf=0;
    let lastRender=0;
    const frame=(time: number) => {
      if (document.hidden) return;
      const action=active.current;
      if (action && !action.done) {
        actualContact.current=true;
        stageRef.current?.render(action.timeline.advance(time-action.start));
        actualContact.current=false;
      } else if (!reduced && time-lastRender>30) {
        stageRef.current?.render({ ...samplePose(0,true),bodyRotation:Math.sin(time/6000*Math.PI*2)*.017 });
        lastRender=time;
      } else if (reduced) stageRef.current?.render(samplePose(0,true));
      if (!reduced || (action && !action.done)) raf=requestAnimationFrame(frame);
    };
    const visibility=() => {
      cancelAnimationFrame(raf);
      if (document.hidden) finalizeRef.current();
      else { stageRef.current?.render(samplePose(0,true)); raf=requestAnimationFrame(frame); }
    };
    raf=requestAnimationFrame(frame);
    document.addEventListener('visibilitychange',visibility);
    return () => { cancelAnimationFrame(raf); document.removeEventListener('visibilitychange',visibility); };
  },[ready,reduced]);

  const activate=() => {
    if (props.running) return;
    if (props.soundEnabled && !reduced) {
      try {
        if (!audio.current) audio.current=new AudioContext();
        void audio.current.resume().catch(()=>undefined);
      } catch { /* Audio may be unavailable or denied. */ }
    }
    props.onActivate();
  };
  return (
    <div className="play-stage" data-ready={ready} data-running={props.running}>
      <button className="play-stage__button" type="button" aria-label="Nieuw passend idee" aria-disabled={props.running} onClick={activate}>
        <span className="play-stage__scene" aria-hidden="true">
          {!ready && (fallbackImage
            ? <img className="play-stage__fallback" src={`${import.meta.env.BASE_URL}assets/klets-stage.png`} alt="" onError={()=>setFallbackImage(false)} />
            : <span className="play-stage__wordmark">Klets<span>.</span></span>)}
          <canvas ref={canvasRef} className="play-stage__canvas" aria-hidden="true" />
        </span>
        <span className="play-stage__hint" aria-hidden="true">Tik voor een idee <svg viewBox="0 0 20 20" width="18" height="18" fill="none"><path d="M5 15 15 5M5 5h10v10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg></span>
      </button>
    </div>
  );
}
