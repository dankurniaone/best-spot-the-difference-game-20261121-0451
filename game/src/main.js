// Wiring: binds the engine (game.js) to the page, draws the markers, runs
// the overlays and the timer bar. No rules live here — only DOM work.
import { LEVELS, IMAGE_WIDTH, IMAGE_HEIGHT } from "./levels.js";
import { SpotGame } from "./game.js";
import { sfx, setMuted, isMuted } from "./audio.js";
import { applyShot } from "./shots.js";

const $ = (id) => document.getElementById(id);
const els = {
  levelName: $("level-name"),
  levelTagline: $("level-tagline"),
  timerText: $("timer-text"),
  timerFill: $("timer-fill"),
  scoreValue: $("score-value"),
  foundValue: $("found-value"),
  hintBtn: $("hint-btn"),
  hintCount: $("hint-count"),
  muteBtn: $("mute-btn"),
  levelDots: $("level-dots"),
  panelA: $("panel-a"),
  panelB: $("panel-b"),
  marksA: $("marks-a"),
  marksB: $("marks-b"),
  toast: $("toast"),
  overlayTitle: $("overlay-title"),
  overlayLevel: $("overlay-level"),
  overlayEnd: $("overlay-end"),
  overlayFail: $("overlay-fail"),
  levelCards: $("level-cards"),
  status: $("status"),
};

let toastTimer = null;

function showToast(text) {
  els.toast.textContent = text;
  els.toast.classList.add("show");
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => els.toast.classList.remove("show"), 2200);
}

function hideOverlays() {
  for (const o of [els.overlayTitle, els.overlayLevel, els.overlayEnd, els.overlayFail]) {
    o.classList.add("hidden");
  }
}

function markerEl(diff, index) {
  const m = document.createElement("div");
  m.className = "marker";
  m.style.left = `${(diff.x / IMAGE_WIDTH) * 100}%`;
  m.style.top = `${(diff.y / IMAGE_HEIGHT) * 100}%`;
  m.innerHTML = `<span>${index + 1}</span>`;
  return m;
}

function drawMarkers(found, level) {
  for (const layer of [els.marksA, els.marksB]) {
    layer.replaceChildren();
    for (const i of found) layer.appendChild(markerEl(level.diffs[i], i));
  }
}

function fmtTime(seconds) {
  const s = Math.max(0, Math.ceil(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

function renderDots(current, doneCount) {
  els.levelDots.replaceChildren();
  LEVELS.forEach((lv, i) => {
    const d = document.createElement("span");
    d.className = "dot" + (i < doneCount ? " done" : "") + (i === current ? " current" : "");
    d.textContent = lv.id;
    els.levelDots.appendChild(d);
  });
}

const hooks = {
  onTitle() {
    hideOverlays();
    els.overlayTitle.classList.remove("hidden");
    els.status.textContent = "Pick a scene to start hunting.";
  },
  onLevelStart(level, index) {
    hideOverlays();
    els.levelName.textContent = `Level ${level.id} — ${level.name}`;
    els.levelTagline.textContent = level.tagline;
    els.panelA.querySelector("img").src = level.a;
    els.panelB.querySelector("img").src = level.b;
    renderDots(index, index);
    els.status.textContent = `Find all ${level.diffs.length} differences.`;
  },
  onTick(timeLeft, limit) {
    els.timerText.textContent = fmtTime(timeLeft);
    els.timerFill.style.width = `${(timeLeft / limit) * 100}%`;
    els.timerFill.classList.toggle("urgent", timeLeft <= 15);
    els.timerText.classList.toggle("urgent", timeLeft <= 15);
  },
  onFound(count, total, name, bonus) {
    showToast(`Found it — ${name}! +${bonus}`);
    els.status.textContent = `${count} of ${total} found. ${name}.`;
  },
  onMiss(x, y, panelEl) {
    const mark = document.createElement("div");
    mark.className = "miss";
    mark.style.left = `${x}px`;
    mark.style.top = `${y}px`;
    mark.textContent = "✕";
    panelEl.appendChild(mark);
    window.setTimeout(() => mark.remove(), 650);
    panelEl.classList.add("shake");
    window.setTimeout(() => panelEl.classList.remove("shake"), 350);
    els.status.textContent = "Not there — minus 25 points. Look closer.";
  },
  onHint(diff, hintsLeft) {
    showToast("Hint: look at the pulsing ring.");
    for (const layer of [els.marksA, els.marksB]) {
      const p = document.createElement("div");
      p.className = "hint-pulse";
      p.style.left = `${(diff.x / IMAGE_WIDTH) * 100}%`;
      p.style.top = `${(diff.y / IMAGE_HEIGHT) * 100}%`;
      layer.appendChild(p);
      window.setTimeout(() => p.remove(), 2600);
    }
  },
  onLevelComplete(stats) {
    hideOverlays();
    els.scoreValue.textContent = stats.score;
    $("leveldone-title").textContent = stats.last
      ? `You cleared ${stats.level.name}!`
      : `${stats.level.name} cleared!`;
    $("leveldone-lines").innerHTML =
      `<p>All ${stats.level.diffs.length} differences found with ` +
      `<strong>${fmtTime(stats.timeLeft)}</strong> to spare.</p>` +
      `<p>Time bonus <strong>+${stats.timeBonus}</strong> &nbsp;·&nbsp; Score ` +
      `<strong>${stats.score}</strong></p>`;
    $("leveldone-next").textContent = stats.last ? "See final results" : "Next level →";
    els.overlayLevel.classList.remove("hidden");
    els.status.textContent = `${stats.level.name} cleared.`;
  },
  onFail(level) {
    hideOverlays();
    $("fail-lines").textContent =
      `Time ran out on ${level.name} with ${game.found.size} of ${level.diffs.length} found. Your score stays — try the level again.`;
    els.overlayFail.classList.remove("hidden");
    els.status.textContent = "Out of time — give it another go.";
  },
  onGameComplete({ score, levels }) {
    hideOverlays();
    $("end-score").textContent = score;
    $("end-lines").innerHTML = levels
      .map((l) => `<p>${l.name} — <strong>${l.score}</strong></p>`)
      .join("");
    els.overlayEnd.classList.remove("hidden");
    els.status.textContent = "All three scenes cleared. Detective work done.";
  },
  onRender({ level, index, found, score, hintsLeft, timeLeft }) {
    drawMarkers(found, level);
    els.scoreValue.textContent = score;
    els.foundValue.textContent = `${found.size} / ${level.diffs.length}`;
    els.hintCount.textContent = hintsLeft;
    els.hintBtn.disabled = hintsLeft <= 0;
    els.timerText.textContent = fmtTime(timeLeft);
    els.timerFill.style.width = `${(timeLeft / level.timeLimit) * 100}%`;
    renderDots(index, index);
  },
};

export const game = new SpotGame(els, hooks);

// -- level cards on the title screen ----------------------------------------
LEVELS.forEach((lv, i) => {
  const card = document.createElement("button");
  card.className = "level-card";
  card.type = "button";
  card.innerHTML =
    `<img src="${lv.a}" alt="${lv.name} scene">` +
    `<span class="card-name">Level ${lv.id} — ${lv.name}</span>` +
    `<span class="card-meta">${lv.diffs.length} differences · ${fmtTime(lv.timeLimit)}</span>`;
  card.addEventListener("click", () => {
    sfx.click();
    game.startLevel(i);
  });
  els.levelCards.appendChild(card);
});

// -- controls ----------------------------------------------------------------
function bindPanel(panelEl) {
  panelEl.addEventListener("click", (e) => {
    game.clickAt(panelEl, e.clientX, e.clientY);
  });
}
bindPanel(els.panelA);
bindPanel(els.panelB);

els.hintBtn.addEventListener("click", () => game.useHint());
els.muteBtn.addEventListener("click", () => {
  setMuted(!isMuted());
  els.muteBtn.textContent = isMuted() ? "🔇 Sound off" : "🔊 Sound on";
  els.muteBtn.setAttribute("aria-pressed", String(isMuted()));
});
$("leveldone-next").addEventListener("click", () => {
  sfx.click();
  game.nextLevel();
});
$("fail-retry").addEventListener("click", () => {
  sfx.click();
  game.retryLevel();
});
$("end-replay").addEventListener("click", () => {
  sfx.click();
  game.score = 0;
  game.levelScores = [];
  game.startLevel(0);
});
$("title-howto").addEventListener("click", () => {
  $("howto").classList.toggle("hidden");
});
$("back-title").addEventListener("click", () => {
  sfx.click();
  game.showTitle();
});

window.addEventListener("keydown", (e) => {
  if (e.key === "h" || e.key === "H") game.useHint();
  if (e.key === "m" || e.key === "M") els.muteBtn.click();
  if ((e.key === "r" || e.key === "R") && game.status === "failed") game.retryLevel();
});

// -- boot --------------------------------------------------------------------
game.showTitle();
if (new URLSearchParams(window.location.search).has("shot")) {
  applyShot(game, els);
}
window.__shotReady = true;
