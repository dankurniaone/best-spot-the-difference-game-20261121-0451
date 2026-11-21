// Level data for Spot the Difference — Photo Detective.
//
// Every level ships two real photographs: the original (a) and the changed
// twin (b). Each difference is a point in the 960x640 image space plus the
// human-readable name the game announces when the player finds it.
// Photos: Pexels (free licence). Kitchen by Pexels #10821202, pond by
// #33693386, market by #38949837.
export const LEVELS = [
  {
    id: 1,
    name: "Kitchen Counter",
    tagline: "Two bowls of fruit — five things changed while you blinked.",
    a: "assets/level1-a.jpg",
    b: "assets/level1-b.jpg",
    timeLimit: 90,
    diffs: [
      { x: 350, y: 250, name: "The tall banana vanished" },
      { x: 292, y: 372, name: "An apple turned green" },
      { x: 185, y: 365, name: "The lime turned yellow" },
      { x: 545, y: 355, name: "A lemon turned orange" },
      { x: 255, y: 285, name: "A small banana vanished" },
    ],
  },
  {
    id: 2,
    name: "Duck Pond",
    tagline: "A quiet park pond — seven ducks, trunks and ripples moved.",
    a: "assets/level2-a.jpg",
    b: "assets/level2-b.jpg",
    timeLimit: 120,
    diffs: [
      { x: 200, y: 430, name: "An extra duck appeared" },
      { x: 250, y: 240, name: "A duck left the bank" },
      { x: 810, y: 220, name: "Two ducks left the bank" },
      { x: 650, y: 335, name: "The swimming duck vanished" },
      { x: 930, y: 225, name: "A duck left the far bank" },
      { x: 525, y: 60, name: "A tree trunk vanished" },
      { x: 880, y: 55, name: "Another trunk vanished" },
    ],
  },
  {
    id: 3,
    name: "Market Stall",
    tagline: "A fruit stall bursting with colour — ten things are off.",
    a: "assets/level3-a.jpg",
    b: "assets/level3-b.jpg",
    timeLimit: 150,
    diffs: [
      { x: 450, y: 150, name: "A grapefruit turned red" },
      { x: 620, y: 500, name: "A lemon vanished" },
      { x: 345, y: 385, name: "A lime turned yellow" },
      { x: 215, y: 195, name: "A pomegranate vanished" },
      { x: 85, y: 360, name: "A coconut pack vanished" },
      { x: 430, y: 470, name: "An extra lemon appeared" },
      { x: 620, y: 85, name: "An orange vanished" },
      { x: 700, y: 540, name: "A lemon turned green" },
      { x: 375, y: 195, name: "A grapefruit vanished" },
      { x: 212, y: 278, name: "A spout vanished" },
    ],
  },
];

// Image space is 960x640 for every level. Clicks land if they fall within
// this radius (in image pixels) of an unfound difference.
export const HIT_RADIUS = 44;
export const IMAGE_WIDTH = 960;
export const IMAGE_HEIGHT = 640;
