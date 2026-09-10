# Marvin: The Long Way Home

A Galaga-inspired browser game set in Entire’s multiverse. Marvin would like to return to his nap. First, he has to get everyone home.

## Play Locally

Requires Node.js 20 or newer. No dependencies or build step.

```sh
npm run dev
```

Open http://localhost:5173. Set `PORT` to use another port. The development server listens on your local computer only.

## Controls

| Action | Keyboard | Pointer / Touch |
| --- | --- | --- |
| Steer | Arrow keys or A / D | Drag on the playfield, or use the arrow buttons |
| Fire | Hold Space | Hold the playfield or the Fire button |
| Wormhole | Shift | Warp button |
| Pause / resume | P or Escape | Pause button |
| Start / retry / resume | Enter | On-screen button |

Clear five sectors, ending with the support ticket boss at Entire. Diving enemies award twice the normal score. Every fourth defeated enemy drops a clankie. Collect one for ten seconds of spread fire; every sixth collected clankie grants a wormhole charge, up to three. A wormhole clears hostile shots, returns diving enemies to formation, and grants brief invulnerability. Finish with hull intact for a survival bonus.

Sound starts off and can be enabled in the console. The game pauses when the window loses focus. Personal bests stay in local browser storage when available. Small screens have touch controls; reduced motion preferences disable ambient star movement and the portrait’s idle motion.

## Development

```sh
npm test
npm run check
```

`src/game.js` contains the simulation, with no browser dependency. `src/main.js` handles canvas drawing, controls, audio, and the interface. `src/style.css` styles the cabinet and layout. `server.mjs` serves the game with Node’s built-in HTTP server. Deployable static files are `index.html`, `src/`, and `assets/`; no backend service is required.

## Art and Story

The story, Marvin character, and Entire name belong to their respective owners. This prototype adapts the supplied Marvin origin story. The procedural robot is provisional artwork, with its face based on the [Marvin face shown on Entire’s website](https://entire.io/_w/marvin-face-Bv-3CtsW.png). It is not an official full-body mascot asset. Enemy sprites and the starfield are drawn in code. Google Fonts supplies the typefaces when online; local fallbacks keep the game playable offline. Audio uses the Web Audio API.
