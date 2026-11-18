# Pixel Siege

Retro 2D top-down shooter that runs in the browser. Plain HTML5 Canvas + vanilla JavaScript ES modules. **No build step, no npm, no dependencies.** Keep it that way unless the user asks otherwise.

- Live: https://khushi-ks1.github.io/pixel-siege/
- Repo: https://github.com/khushi-ks1/pixel-siege (public; `gh` CLI is logged in as `khushi-ks1`)

## Git workflow (required)

The user wants every change saved so it's easy to revert.

- After each logical change: commit with a clean, descriptive message, then `git push` to `origin main`.
- Prefer small focused commits over one big one.
- Pushing to `main` **redeploys the live site** through GitHub Pages (about 1 minute). Don't push broken code; test first.
- To revert, use `git revert` (keeps history). Don't rewrite pushed history.

## Run and test

- Local: `python -m http.server 8000`, then open http://localhost:8000. ES modules don't load from `file://`.
- Jump to a level: `?level=N` (1–5), e.g. `http://localhost:8000/?level=5` for the boss.
- Syntax check: `node --input-type=module --check < src/<file>.js`
- Headless screenshot (Edge is installed): `msedge --headless=new --screenshot=out.png --window-size=960,540 <url>`. Headless barely advances `requestAnimationFrame`, so to test gameplay, write a temporary page that imports `GameScene` and calls `update(1/60)` in a loop with a bot aiming at enemies. Delete that page afterwards.

## Code map

- `index.html`, `style.css`: canvas page; pixelated integer scaling, hidden cursor.
- `src/main.js`: boot, fixed 60 Hz timestep loop, scene registry (`app.goto(name, params)`), high score in `localStorage`, crosshair, `?level=` shortcut.
- `src/utils.js`: `W=320, H=180` internal resolution, math helpers, `edgePoint`, `drawText` (Press Start 2P font).
- `src/input.js`: arrow keys/WASD, mouse in game coordinates, `clicked`/`wasPressed` edge flags cleared by `input.endStep()`.
- `src/sprites.js`: pixel art as text grids (one char = one palette color, `.` = transparent). `drawSprite()` draws centered and supports flip, white hit-flash and scale.
- `src/audio.js`: Web Audio synthesized sfx; no audio files.
- `src/levels.js`: level tuning: `killsToClear`, `spawnStart`/`spawnEnd`, `maxAlive`, `groupChance`, `enemyMix`, `boss`.
- `src/spawner.js`: spawns exactly `killsToClear` enemies from random screen edges.
- `src/entities/`: `player.js` (movement, rotated gun, hearts, i-frames), `enemy.js` (data-driven `ENEMY_TYPES`: grunt, runner, tank, shooter, boss), `bullet.js`, `particles.js`.
- `src/scenes/`: `menu`, `game` (main gameplay; state `play → boss → cleared` or `dead`), `levelComplete`, `gameOver`, `win`.
- `src/hud.js`, `src/floor.js`: HUD bar and procedural per-level floors.

## Conventions

- Everything draws at 320×180; keep pixel positions on whole numbers (`Math.round`) so the art stays crisp.
- Enemies clamp to the arena once they've entered (this fixed shooters lurking off-screen). Keep that if changing movement.
- Colors come from the palette in `sprites.js`; reuse them to keep the retro look consistent.
