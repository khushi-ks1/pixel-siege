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
- Headless screenshot (Edge is installed): `msedge --headless=new --screenshot=out.png --window-size=960,540 <url>`. Always pass a **fresh `--user-data-dir`**, because a reused profile caches old modules and gives false errors.
- **Bot playtest:** `_dev/sim.html` (git-ignored) runs every level with a bot that aims, dashes and grabs pickups, then prints per-level results. `?snap=L:sec` draws a frame from level L at that second. Headless barely advances `requestAnimationFrame`, so this page steps `GameScene.update(1/60)` directly. Run it with `--virtual-time-budget=60000` and screenshot it.
- **Audio smoke test:** `_dev/audio.html` with `--autoplay-policy=no-user-gesture-required --mute-audio` fires every sfx and runs the music loop, then reports any errors.

## Code map

- `index.html`, `style.css`: canvas page; pixelated integer scaling, hidden cursor.
- `src/main.js`: boot, fixed 60 Hz timestep loop, scene registry (`app.goto(name, params)`), high score in `localStorage`, crosshair, `?level=` shortcut, auto-pause on blur (`scene.onBlur`). The canvas backing store is `320*k × 180*k` real pixels with `ctx.setTransform(k…)`, so game code works in 320×180 game pixels while text renders sharp. Display size is capped at 3× CSS.
- `src/utils.js`: `W=320, H=180` internal resolution, math helpers, `edgePoint`, `drawText` (size ≥ 14 uses the "Press Start 2P" title font, smaller sizes use the readable "VT323").
- `src/input.js`: arrow keys/WASD, mouse in game coordinates, `clicked`/`wasPressed` edge flags cleared by `input.endStep()`.
- `src/sprites.js`: pixel art as text grids (one char = one palette color, `.` = transparent). `drawSprite()` draws centered and supports flip, white hit-flash and scale.
- `src/audio.js`: Web Audio synthesized sfx plus a looping chiptune music scheduler (`CHORDS`/`BASS` patterns); no audio files. Starts on the first user gesture.
- `src/levels.js`: level tuning: `killsToClear`, `spawnStart`/`spawnEnd`, `maxAlive`, `groupChance`, `enemyMix`, `boss`.
- `src/spawner.js`: spawns exactly `killsToClear` enemies from random screen edges.
- `src/entities/`: `player.js` (movement, dodge-dash, rotated gun, hearts, i-frames, `powers` timers), `enemy.js` (data-driven `ENEMY_TYPES`: grunt, runner, tank, shooter, boss), `pickup.js` (`PICKUPS`: heart, rapid, spread), `bullet.js`, `particles.js`.
- `src/scenes/`: `menu`, `game` (main gameplay; state `play → boss → cleared` or `dead`; also handles combo multiplier, drops, hitstop `freeze`, shake), `levelComplete`, `gameOver`, `win`.
- `og-image.png`: 1200×630 link-preview image referenced by the `og:` meta tags in `index.html`. Re-capture it if the menu changes a lot.
- `src/hud.js`, `src/floor.js`: HUD bar and procedural per-level floors.

## Conventions

- Everything draws at 320×180; keep pixel positions on whole numbers (`Math.round`) so the art stays crisp.
- Enemies clamp to the arena once they've entered (this fixed shooters lurking off-screen). Keep that if changing movement.
- Colors come from the palette in `sprites.js`; reuse them to keep the retro look consistent.
- Screen shake is reserved for heavy moments (tank/boss kills, getting hurt, boss attacks). Don't add it to every hit, or it loses its punch.
- Player bullets spawn 4px from the body (`gunTip(4)`) so point-blank shots register. The muzzle flash is still drawn at the tip.
