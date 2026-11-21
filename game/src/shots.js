// Deterministic demo states for screenshots (?shot=...).
//
// The screenshots must show a real game state, so instead of faking pixels
// this drives the real engine into a mid-game position and freezes the
// timer: two differences already found on level 1, four on level 3, or the
// level-complete overlay. No randomness: the found sets are fixed.
import { LEVELS } from "./levels.js";

function freeze(game, levelIndex, foundIndexes, score, timeLeft) {
  game.startLevel(levelIndex);
  game.stopTimer();
  game.found = new Set(foundIndexes);
  game.score = score;
  game.timeLeft = timeLeft;
  game.status = "playing";
  game.renderAll();
}

export function applyShot(game, els) {
  const params = new URLSearchParams(window.location.search);
  const shot = params.get("shot");
  const status = document.getElementById("status");
  if (shot === "play") {
    // Level 1 mid-game: 2 of 5 found, 1:07 left, score 230.
    freeze(game, 0, [0, 1], 230, 67);
    status.textContent = "2 of 5 found. The tall banana vanished. An apple turned green.";
  } else if (shot === "play3") {
    // Level 3 mid-game: 4 of 10 found, 1:41 left, score 540.
    freeze(game, 2, [0, 1, 2, 3], 540, 101);
    status.textContent = "4 of 10 found. A grapefruit turned red. A lemon vanished.";
  } else if (shot === "end") {
    // Level 1 cleared with 0:23 to spare.
    game.startLevel(0);
    game.stopTimer();
    game.found = new Set(LEVELS[0].diffs.map((_, i) => i));
    game.timeLeft = 23;
    game.renderAll();
    game.completeLevel();
  }
  // "start" (or anything else) leaves the title screen as-is.
  window.__shotReady = true;
}
