export type StagePose = {
  handProgress: number;
  bodyScaleX: number;
  bodyScaleY: number;
  bodyRotation: number;
};
const rest: StagePose = { handProgress: 0, bodyScaleX: 1, bodyScaleY: 1, bodyRotation: 0 };
const clamp = (n: number) => Math.max(0, Math.min(1, n));
const smooth = (n: number) => { const t = clamp(n); return t * t * (3 - 2 * t); };

export function samplePose(elapsedMs: number, reduced: boolean): StagePose {
  const t = Math.max(0, elapsedMs);
  if (reduced || t === 0 || t >= 600) return { ...rest };
  const handProgress = t < 150 ? smooth((t - 40) / 110) : 1 - smooth((t - 190) / 120);
  const impulse = t < 170 ? smooth((t - 130) / 40) : Math.exp(-(t - 170) / 115) * Math.cos((t - 170) / 39);
  const ending = 1 - smooth((t - 490) / 110);
  return {
    handProgress,
    bodyScaleX: 1 - impulse * .135 * ending,
    bodyScaleY: 1 + impulse * .085 * ending,
    bodyRotation: impulse * .095 * ending,
  };
}

export function createActionTimeline(
  actionId: string,
  callbacks: { onContact(actionId: string): void; onSettled(actionId: string): void },
  reduced: boolean,
) {
  let contacted = false;
  let settled = false;
  const contact = () => { if (!contacted) { contacted = true; callbacks.onContact(actionId); } };
  const finalize = () => {
    if (settled) return;
    contact(); settled = true; callbacks.onSettled(actionId);
  };
  return {
    advance(elapsedMs: number): StagePose {
      if (settled) return { ...rest };
      if (reduced) { finalize(); return { ...rest }; }
      if (elapsedMs >= 150) contact();
      if (elapsedMs >= 600) finalize();
      return samplePose(elapsedMs, false);
    },
    finalize,
  };
}
