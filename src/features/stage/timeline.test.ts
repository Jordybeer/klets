import { describe, expect, it, vi } from 'vitest';
import { createActionTimeline, samplePose } from './timeline';

describe('signature action timeline', () => {
  it('contacts at 150ms and settles at 600ms exactly once', () => {
    const onContact = vi.fn(); const onSettled = vi.fn();
    const t = createActionTimeline('draw-1', { onContact, onSettled }, false);
    t.advance(149); expect(onContact).not.toHaveBeenCalled();
    t.advance(150); t.advance(190);
    expect(onContact).toHaveBeenCalledExactlyOnceWith('draw-1');
    t.advance(599); expect(onSettled).not.toHaveBeenCalled();
    t.advance(600); t.advance(900); t.finalize();
    expect(onSettled).toHaveBeenCalledExactlyOnceWith('draw-1');
    expect(onContact).toHaveBeenCalledTimes(1);
  });
  it('finalizes interrupted actions once, including before contact', () => {
    const onContact = vi.fn(); const onSettled = vi.fn();
    const t = createActionTimeline('draw-2', { onContact, onSettled }, false);
    t.advance(90); t.finalize(); t.finalize(); t.advance(180); t.advance(600);
    expect(onContact).toHaveBeenCalledExactlyOnceWith('draw-2');
    expect(onSettled).toHaveBeenCalledExactlyOnceWith('draw-2');
    expect(onContact.mock.invocationCallOrder[0]).toBeLessThan(onSettled.mock.invocationCallOrder[0]);
  });
  it('publishes immediately with a neutral pose for reduced or paused motion', () => {
    const onContact = vi.fn(); const onSettled = vi.fn();
    const t = createActionTimeline('draw-3', { onContact, onSettled }, true);
    expect(t.advance(0)).toEqual(samplePose(0, true));
    expect(onContact).toHaveBeenCalledExactlyOnceWith('draw-3');
    expect(onSettled).toHaveBeenCalledExactlyOnceWith('draw-3');
    for (const ms of [0, 90, 170, 300, 600]) expect(samplePose(ms, true).handProgress).toBe(0);
  });
  it('has approach, squash, rebound and an exact resting pose', () => {
    expect(samplePose(90, false).handProgress).toBeGreaterThan(0);
    expect(samplePose(150, false).handProgress).toBe(1);
    expect(samplePose(180, false).bodyScaleX).toBeLessThan(1);
    expect(samplePose(180, false).bodyScaleY).toBeGreaterThan(1);
    expect(samplePose(600, false)).toEqual(samplePose(0, false));
    expect(samplePose(-100, false)).toEqual(samplePose(0, false));
  });
});

// The scene is optional: action ownership must also hold at the React boundary.
import { createElement } from 'react';
import { act, render, waitFor } from '@testing-library/react';
import { afterEach, beforeEach } from 'vitest';
import PlayStage from './PlayStage';
import { createStage } from './createStage';
vi.mock('./createStage', () => ({ createStage: vi.fn() }));

beforeEach(() => {
  vi.stubGlobal('matchMedia', () => ({ matches:false, addEventListener:vi.fn(), removeEventListener:vi.fn() }));
  vi.stubGlobal('ResizeObserver', class { observe() {} disconnect() {} });
  vi.stubGlobal('requestAnimationFrame',vi.fn(()=>1));
  vi.stubGlobal('cancelAnimationFrame',vi.fn());
  vi.mocked(createStage).mockReturnValue({render:vi.fn(),resize:vi.fn(),dispose:vi.fn()});
});
afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); });

describe('stage lifecycle', () => {
  const props = () => ({ actionId:null as string|null, running:false, motionMode:'full' as const, soundEnabled:false, onActivate:vi.fn(), onContact:vi.fn(),onSettled:vi.fn() });
  it('immediately finalizes a draw while the scene is loading, without repeating after init', async () => {
    const callbacks=props();
    const view=render(createElement(PlayStage,{...callbacks, actionId:'loading',running:true}));
    await waitFor(()=>expect(view.container.firstChild).toHaveAttribute('data-ready','true'));
    expect(callbacks.onContact).toHaveBeenCalledExactlyOnceWith('loading');
    expect(callbacks.onSettled).toHaveBeenCalledExactlyOnceWith('loading');
    view.unmount(); expect(callbacks.onSettled).toHaveBeenCalledTimes(1);
  });
  it('keeps the button usable and settles when WebGL initialization fails', async () => {
    vi.mocked(createStage).mockImplementation(()=>{throw new Error('WebGL unavailable');});
    const callbacks=props(); const view=render(createElement(PlayStage,callbacks));
    await act(async()=>{});
    view.rerender(createElement(PlayStage,{...callbacks, actionId:'fallback',running:true}));
    expect(view.getByRole('button',{name:'Nieuw passend idee'})).toBeVisible();
    expect(callbacks.onContact).toHaveBeenCalledExactlyOnceWith('fallback');
    expect(callbacks.onSettled).toHaveBeenCalledExactlyOnceWith('fallback');
  });
  it('finalizes once on hidden-tab interruption before contact', async () => {
    const callbacks=props(); const view=render(createElement(PlayStage,callbacks));
    await waitFor(()=>expect(view.container.firstChild).toHaveAttribute('data-ready','true'));
    view.rerender(createElement(PlayStage,{...callbacks,actionId:'hidden',running:true}));
    expect(callbacks.onContact).not.toHaveBeenCalled();
    const hidden=vi.spyOn(document,'hidden','get').mockReturnValue(true);
    act(()=>document.dispatchEvent(new Event('visibilitychange')));
    expect(callbacks.onContact).toHaveBeenCalledExactlyOnceWith('hidden');
    expect(callbacks.onSettled).toHaveBeenCalledExactlyOnceWith('hidden');
    hidden.mockReturnValue(false);
    act(()=>document.dispatchEvent(new Event('visibilitychange')));
    view.unmount(); expect(callbacks.onContact).toHaveBeenCalledTimes(1);
  });
  it('does not animate or publish when an empty activation has no action ID', async () => {
    const callbacks=props(); const view=render(createElement(PlayStage,callbacks));
    await waitFor(()=>expect(view.container.firstChild).toHaveAttribute('data-ready','true'));
    act(()=>view.getByRole('button',{name:'Nieuw passend idee'}).click());
    expect(callbacks.onActivate).toHaveBeenCalledOnce();
    expect(callbacks.onContact).not.toHaveBeenCalled();
    expect(callbacks.onSettled).not.toHaveBeenCalled();
  });
});
