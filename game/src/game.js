// Spot the Difference — game engine.
//
// Owns the rules only: levels, timer, clicks, hints and scoring. The DOM
// shell (index.html) and the wiring (main.js) stay out of here so this file
// can be read as the rules of the game, nothing else.
import { LEVELS, HIT_RADIUS, IMAGE_WIDTH, IMAGE_HEIGHT } from "./levels.js";
import { sfx } from "./audio.js";

const MISS_PENALTY = 25;
const HINT_COST = 50;
const FIND_POINTS = 100;
const STREAK_BONUS = 10;
const TIME_BONUS_PER_SECOND = 5;

export class SpotGame {
  constructor(els, hooks) {
    this.els = els;
    this.hooks = hooks;
    this.levelIndex = 0;
    this.score = 0;
    this.found = new Set();
    this.streak = 0;
    this.hintsLeft = 3;
    this.timeLeft = 0;
    this.timerId = null;
    this.status = "title";
    this.levelScores = [];
    this.muted = false;
  }

  get level() {
    return LEVELS[this.levelIndex];
  }

  get totalDiffs() {
    return this.level.diffs.length;
  }

  // -- flow ---------------------------------------------------------------

  showTitle() {
    this.status = "title";
    this.stopTimer();
    this.hooks.onTitle();
  }

  startLevel(index) {
    this.levelIndex = index;
    this.found = new Set();
    this.streak = 0;
    this.hintsLeft = 3;
    this.timeLeft = this.level.timeLimit;
    this.status = "playing";
    this.hooks.onLevelStart(this.level, index);
    this.renderAll();
    this.startTimer();
  }

  startTimer() {
    this.stopTimer();
    this.timerId = window.setInterval(() => this.tick(), 100);
  }

  stopTimer() {
    if (this.timerId !== null) {
      window.clearInterval(this.timerId);
      this.timerId = null;
    }
  }

  tick() {
    if (this.status !== "playing") return;
    this.timeLeft = Math.max(0, this.timeLeft - 0.1);
    this.hooks.onTick(this.timeLeft, this.level.timeLimit);
    if (this.timeLeft <= 0) this.failLevel();
  }

  // -- input ---------------------------------------------------------------

  // A click on either panel. event carries client coords; the panel element
  // knows its own box, so the same handler serves both pictures.
  clickAt(panelEl, clientX, clientY) {
    if (this.status !== "playing") return;
    const rect = panelEl.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * IMAGE_WIDTH;
    const y = ((clientY - rect.top) / rect.height) * IMAGE_HEIGHT;
    const hit = this.level.diffs.findIndex(
      (d, i) => !this.found.has(i) && Math.hypot(d.x - x, d.y - y) <= HIT_RADIUS,
    );
    if (hit >= 0) this.registerFind(hit);
    else this.registerMiss(clientX - rect.left, clientY - rect.top, panelEl);
  }

  registerFind(index) {
    this.found.add(index);
    const bonus = FIND_POINTS + this.streak * STREAK_BONUS;
    this.score += bonus;
    this.streak += 1;
    sfx.found();
    this.hooks.onFound(this.found.size, this.totalDiffs, this.level.diffs[index].name, bonus);
    this.renderAll();
    if (this.found.size === this.totalDiffs) this.completeLevel();
  }

  registerMiss(offsetX, offsetY, panelEl) {
    this.score = Math.max(0, this.score - MISS_PENALTY);
    this.streak = 0;
    sfx.miss();
    this.hooks.onMiss(offsetX, offsetY, panelEl);
    this.renderAll();
  }

  useHint() {
    if (this.status !== "playing" || this.hintsLeft <= 0) return false;
    const remaining = this.level.diffs
      .map((d, i) => i)
      .filter((i) => !this.found.has(i));
    if (remaining.length === 0) return false;
    const pick = remaining[Math.floor(Math.random() * remaining.length)];
    this.hintsLeft -= 1;
    this.score = Math.max(0, this.score - HINT_COST);
    sfx.hint();
    this.hooks.onHint(this.level.diffs[pick], this.hintsLeft);
    this.renderAll();
    return true;
  }

  // -- endings --------------------------------------------------------------

  completeLevel() {
    this.status = "levelDone";
    this.stopTimer();
    const timeBonus = Math.round(this.timeLeft) * TIME_BONUS_PER_SECOND;
    this.score += timeBonus;
    const stats = {
      level: this.level,
      index: this.levelIndex,
      timeLeft: Math.round(this.timeLeft),
      timeBonus,
      score: this.score,
      last: this.levelIndex === LEVELS.length - 1,
    };
    this.levelScores.push({ name: this.level.name, score: this.score });
    sfx.win();
    this.hooks.onLevelComplete(stats);
  }

  failLevel() {
    this.status = "failed";
    this.stopTimer();
    sfx.lose();
    this.hooks.onFail(this.level, this.levelIndex);
  }

  nextLevel() {
    if (this.levelIndex + 1 < LEVELS.length) this.startLevel(this.levelIndex + 1);
    else this.finishGame();
  }

  retryLevel() {
    this.startLevel(this.levelIndex);
  }

  finishGame() {
    this.status = "gameDone";
    this.hooks.onGameComplete({ score: this.score, levels: this.levelScores });
  }

  // -- rendering ------------------------------------------------------------

  renderAll() {
    this.hooks.onRender({
      level: this.level,
      index: this.levelIndex,
      found: new Set(this.found),
      score: this.score,
      hintsLeft: this.hintsLeft,
      timeLeft: this.timeLeft,
      status: this.status,
    });
  }
}
