// Tiny WebAudio sound effects — no audio assets, everything is synthesized
// so the game still plays fully offline from its own files.

let ctx = null;
let muted = false;

function audioCtx() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

function tone(freq, startAt, dur, type, vol, slideTo) {
  const ac = audioCtx();
  if (!ac || muted) return;
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, ac.currentTime + startAt);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, ac.currentTime + startAt + dur);
  gain.gain.setValueAtTime(0.0001, ac.currentTime + startAt);
  gain.gain.exponentialRampToValueAtTime(vol, ac.currentTime + startAt + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + startAt + dur);
  osc.connect(gain).connect(ac.destination);
  osc.start(ac.currentTime + startAt);
  osc.stop(ac.currentTime + startAt + dur + 0.05);
}

export const sfx = {
  // Bright two-note chime when a difference is found.
  found() {
    tone(880, 0, 0.14, "sine", 0.22);
    tone(1318, 0.09, 0.2, "sine", 0.18);
  },
  // Low buzz for a wrong click.
  miss() {
    tone(160, 0, 0.16, "square", 0.1, 110);
  },
  // Soft tick when a hint fires.
  hint() {
    tone(660, 0, 0.1, "triangle", 0.16);
    tone(990, 0.08, 0.14, "triangle", 0.14);
  },
  // Little arpeggio when a level is cleared.
  win() {
    [523, 659, 784, 1046].forEach((f, i) => tone(f, i * 0.09, 0.22, "triangle", 0.2));
  },
  // Descending line when time runs out.
  lose() {
    [392, 330, 262, 196].forEach((f, i) => tone(f, i * 0.11, 0.24, "sawtooth", 0.08));
  },
  // Click on any button.
  click() {
    tone(520, 0, 0.06, "sine", 0.1);
  },
};

export function setMuted(value) {
  muted = value;
}

export function isMuted() {
  return muted;
}
