# Pixel Siege

A small retro top-down shooter that runs in the browser. It's built with plain HTML5 Canvas and JavaScript, with no build step and no dependencies.

**Play it:** https://khushi-ks1.github.io/pixel-siege/

It's hosted on GitHub Pages and redeploys automatically on every push to `main`.

## Run locally

ES modules need a local server (they won't load from `file://`). From this folder, run either:

```
npx serve .
# or
python -m http.server 8000
```

Then open the printed URL (e.g. http://localhost:8000).

## Controls

| Action | Input |
| --- | --- |
| Move | Arrow keys (WASD also works) |
| Aim | Mouse |
| Shoot | Left click (hold to auto-fire) |
| Pause | Esc / P |
| Mute | M |

## Structure

- `src/main.js`: boot, fixed-timestep loop, scene switching, high score
- `src/sprites.js`: pixel-art sprites as text grids (edit these to change the art)
- `src/levels.js`: level tuning (kills to clear, spawn rate, enemy mix)
- `src/entities/`: player, enemies, bullets, particles
- `src/scenes/`: menu, game, level complete, game over, win
