# game-dev

A mega repo of vibe-coded games. Each game lives in its own folder under `games/`, runs in the browser with no build step, and shows up in the arcade page at the repo root.

## Layout

```
game-dev/
├── index.html          # Arcade page: lists every game in games.json
├── games.json          # Registry of games (title, folder, description, tags)
├── games/
│   └── <game-slug>/    # One folder per game, self-contained
│       ├── index.html
│       ├── game.js
│       ├── style.css
│       └── README.md
├── templates/
│   └── vanilla-js/     # Starter copied by the new-game script
└── scripts/
    └── new-game.mjs    # Creates a game from the template and registers it
```

## Add a game

```bash
node scripts/new-game.mjs my-game "My Game"
```

This copies `templates/vanilla-js` to `games/my-game/` and adds an entry to `games.json`. Then edit `games/my-game/game.js` and go.

Games built with another stack (Phaser, Three.js, a bundler) are fine too. Keep them inside their own folder, and make sure `games/<slug>/index.html` is the playable entry point (commit the built output if there's a build step).

## Play locally

The arcade page loads `games.json` with `fetch`, so serve the repo over HTTP instead of opening the file directly:

```bash
npx serve .
```

## Publish

Turn on GitHub Pages (Settings → Pages → Deploy from branch → `main`, `/ (root)`). The arcade is then at `https://noamcelermajer.github.io/game-dev/`.

## Games

| Game | Description |
| --- | --- |
| _none yet_ | |
