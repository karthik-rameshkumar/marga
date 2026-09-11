# Marvin: The Long Way Home

A Galaga-inspired browser game starring Marvin, Entire’s reluctant robot guide. Escort the developers through five sectors of the multiverse, collect metallic snacks, and get everyone home. Marvin would like to return to his nap.

The repository is named **Marga**. Its primary home is a personal Entire project, with code and agent checkpoints stored together. A [public GitHub mirror](https://github.com/karthik-rameshkumar/marga) provides another way to browse and clone the source. [Play Marvin on Netlify](https://marga-marvin.netlify.app), or run it locally with the instructions below.

## Quick Start

You need Git, Node.js 20 or newer, and a modern browser with Canvas 2D support. Clone from GitHub and start the game:

```sh
git clone https://github.com/karthik-rameshkumar/marga.git
cd marga
npm run dev
```

Open [localhost:5173](http://localhost:5173). There are no npm dependencies to install and no build step for local development. If you already have the source, only `npm run dev` is needed. Stop the server with Ctrl+C.

To clone directly from Entire instead, install the Entire CLI and the `git-remote-entire` transport on your `PATH`, then run:

```sh
entire login
git clone entire://aws-us-east-2.entire.io/et/marga/marga
cd marga
npm run dev
```

See the [Entire documentation](https://docs.entire.io/overview) for installation and account setup. The Entire CLI is optional for playing a GitHub checkout; it is used for session tracking and checkpoint inspection.

To use another port:

```sh
PORT=8080 npm run dev
```

The development server binds to `127.0.0.1`, so it is accessible from the same computer. It serves the game files and excludes repository metadata. Opening `index.html` directly from the filesystem is unsupported because the game uses JavaScript modules.

## How to Play

Start with three hull segments and one wormhole charge. Hold Fire while steering around incoming shots and diving formations. Clear each sector to advance. The final sector contains a support ticket boss; defeat it and the remaining formation to reach home.

| Action | Keyboard | Pointer / Touch |
| --- | --- | --- |
| Steer | Left / right arrows or A / D | Drag on the playfield, or hold the arrow buttons |
| Fire | Hold Space | Hold the playfield or the Fire button |
| Open a wormhole | Shift | Warp button on small screens |
| Pause / resume | P or Escape | Pause button in the console |
| Start / retry / resume | Enter | On-screen button |
| Toggle sound | Focus and activate the sound button | Sound button in the console |
| Fullscreen | Focus and activate the fullscreen button | Fullscreen button, where supported |

Pointer steering also fires while you hold the playfield. The game pauses when the window loses focus or the tab becomes hidden. Use the resume button or Enter to continue.

### The Route

| Sector | Destination | What to Expect |
| --- | --- | --- |
| 01 | The Consortium | The first formation and a chance to learn the controls |
| 02 | Cosmic Motorway | Faster enemy attacks and projectiles |
| 03 | The Wormhole | Larger formations and tougher front-row enemies |
| 04 | The Mirror | Faster diving enemies and less time between attacks |
| 05 | Entire | The support ticket boss, with aimed spread fire |

### Clankies and Wormholes

Every fourth enemy defeated drops a clankie. Catch it before it leaves the bottom of the screen. Each clankie grants ten seconds of three-way spread fire; another pickup refreshes that timer. Every sixth collected clankie replenishes one wormhole charge, up to a maximum of three.

A wormhole clears hostile projectiles, returns diving enemies to formation, and grants 2.5 seconds of invulnerability. It consumes one charge and is unavailable while paused or during a sector introduction. Taking damage also grants brief invulnerability and ends the spread-shot power-up.

### Scoring

| Event | Points |
| --- | ---: |
| Defeat an enemy in formation | 100 |
| Defeat a diving enemy | 200 |
| Collect a clankie | 250 |
| Defeat the boss | 5,000 |
| Finish the game | 1,000 per remaining hull segment |

Personal bests are stored in your browser under `marvin-best`. There is no account-based leaderboard or server-side save. Browser storage is optional; the game still runs when it is unavailable. Clearing site data removes the saved record.

## Settings and Accessibility

Sound starts off. Enable it with the sound button; effects are synthesized through Web Audio, with no audio downloads. The interface provides labeled buttons, visible keyboard focus, and live announcements for sector introductions and Marvin’s commentary.

Small screens show touch controls. Fullscreen depends on browser support. A reduced-motion preference disables the ambient star movement and the portrait’s idle motion; combat movement remains part of gameplay. The canvas action still requires visual tracking and is not a fully nonvisual game experience.

## Development

The project uses native browser modules and Node’s built-in server and test runner.

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the local server, default port 5173 |
| `npm start` | Start the same server |
| `npm run build` | Copy the six public game files into `dist/` for hosting |
| `npm test` | Run the simulation tests |
| `npm run check` | Check JavaScript syntax in the engine, interface, server, and build script |
| `git diff --check` | Check pending changes for whitespace errors |

Run the checks before committing:

```sh
npm test
npm run check
git diff --check
```

The ten simulation tests cover restart state, movement boundaries, firing rate, pause behavior, collisions and scoring, damage and invulnerability, clankies, wormholes, sector progression, and the win/loss states. They do not automate browser rendering, audio, or touch input. For interface changes, also check the title screen, a playable wave, pause/resume, and a narrow viewport in a browser.

### Repository Layout

```text
index.html             Accessible interface, HUD, and game canvas
src/
  game.js              Simulation, sectors, enemies, collisions, and scoring
  main.js              Canvas rendering, input, sound, HUD, and local storage
  style.css            Arcade layout, responsive styles, and typography
assets/
  entire-logo.svg      Official Entire symbol and wordmark
  favicon.svg          Official Entire symbol on the game background
  README.md            Brand asset provenance
test/
  game.test.js         Deterministic simulation tests
server.mjs             Local static server
scripts/build.mjs      Allowlisted static deployment build
netlify.toml           Static hosting and cache headers
.entire/settings.json  Entire tracking and checkpoint-store configuration
```

`Game` in `src/game.js` has no DOM dependency. It accepts an injectable random function and emits events for the interface. `src/main.js` reads input, advances the simulation through `requestAnimationFrame`, and draws the resulting state. Tune sector layouts, movement, cooldowns, and scoring in the engine; change artwork and input behavior in the interface module.

### Static Hosting

Run `npm run build` and publish `dist/` over HTTP or HTTPS. The build replaces that generated directory with an explicit allowlist: `index.html`, the three game modules/styles, and the two SVG assets. It excludes repository metadata, agent sessions, documentation, tests, and the development server. JavaScript files must use a JavaScript MIME type. There is no backend API. The included local server is intended for development.

Google Fonts supplies Barlow Condensed, DM Sans, and IBM Plex Mono when online. System font fallbacks keep the game playable without that request. Sprites, the starfield, and sound effects are generated locally.

### Manual Netlify Deployment From Entire

The live game is at [marga-marvin.netlify.app](https://marga-marvin.netlify.app). Entire remains the primary repository. [Netlify's CLI uploads a locally built directory](https://docs.netlify.com/api-and-cli-guides/cli-guides/get-started-with-cli/), so deployment does not require a native Entire integration or the GitHub mirror.

The initial deployment contains six game files totaling 47,289 bytes before compression. It has no serverless functions, database, or hosted build. The game runs in the visitor's browser. SVG assets use a one-day browser cache; HTML, JavaScript, and CSS revalidate so game updates are not held behind a long cache lifetime.

The maintainer's existing account uses Netlify's legacy Free plan, not the newer credit-based Free plan. The deployment leaves that plan unchanged. New accounts may have different limits: check your own plan before publishing. [Netlify Free permits commercial projects](https://www.netlify.com/blog/introducing-netlify-free-plan/). On [credit-based plans](https://docs.netlify.com/manage/accounts-and-billing/billing/billing-for-credit-based-plans/how-credits-work/), production deploys consume credits even when built locally, and traffic consumes additional credits.

After installing the Netlify CLI and authenticating with `netlify login`, link your own site once with `netlify link`. Maintainers can select the existing `marga-marvin` site; forks should create their own. Then publish manually:

```sh
npm test
npm run check
npm run build
netlify deploy --dir dist --no-build --prod
```

`netlify.toml` selects `dist/` and configures response headers. The explicit `--dir dist --no-build` command uploads the local allowlisted artifact without running another build. Repository metadata and sessions never enter that artifact. `.gitignore` excludes local Netlify project settings. No Netlify credentials belong in this repository.

The site has no Git connection, build hooks, or automatic deployment workflow. Batch changes into occasional production releases to reduce deployment usage. For testing on credit-based plans, omit `--prod` to create a draft deployment; draft deploys do not incur production-deploy credits, but visits still consume traffic allowance.

Deploying through the CLI does not run Entire's review runners or satisfy its merge gates. Keep the required human approval before merging the readiness trail. A future gated deployment workflow could invoke the CLI after approval, but no deployment runner is configured here.

## Entire Checkpoints and Sessions

This repository enables Entire with the `git-refs` checkpoint store. Agent hooks capture session activity, commit hooks associate a checkpoint with a code commit, and the pre-push hook sends the captured checkpoint data alongside a push to the Entire remote. Commits carrying captured work include an `Entire-Checkpoint` trailer.

For a new checkout, verify your Entire integration before starting an agent session. Git does not transfer installed `.git/hooks` scripts when cloning. Enable tracking and install the integration for the agent you use:

```sh
entire enable
entire agent add codex
entire status
```

Follow any hook setup instructions printed by the CLI. Use `entire agent --help` for other agent integrations.

Inspect the captured work locally:

```sh
entire session list
entire session current
entire checkpoint list
entire checkpoint explain HEAD
git log -1 --format=full
```

`entire session current` describes a live local session. Historical session metadata and transcripts are stored in checkpoints; use `entire checkpoint explain <checkpoint-id> --full` to read them. An active session can continue after a commit, so that commit’s checkpoint records the work captured up to that point.

With the `git-refs` store, checkpoint references live under `refs/entire/checkpoints/`. A plain Git clone may not fetch this custom namespace. To retrieve the published checkpoint history explicitly:

```sh
git fetch origin 'refs/entire/checkpoints/*:refs/entire/checkpoints/*'
entire checkpoint list
```

Before pushing, confirm the commit has its checkpoint and the expected session content. The installed Entire pre-push hook handles uploading the checkpoint refs to Entire. GitHub requires the explicit checkpoint push shown below. You can compare the local and remote refs afterward:

```sh
git for-each-ref refs/entire/checkpoints/
git ls-remote origin 'refs/entire/checkpoints/*'
```

The repository and its published checkpoint history are public on Entire and GitHub. Review captured content before publishing future work. Entire’s current public visibility permits read access to authenticated Entire users; the GitHub mirror allows public browsing and cloning without an Entire account. Write access remains restricted.

## Entire Trails

The personal Entire repository has a Marvin readiness trail, three review runners, and merge gates. See [.entire/README.md](.entire/README.md) for the runner responsibilities, permission limits, gate behavior, and manual execution workflow.

## GitHub Mirror

[karthik-rameshkumar/marga](https://github.com/karthik-rameshkumar/marga) mirrors the game’s `main` branch and captured Entire checkpoint refs. Entire remains the primary repository.

In the maintainer’s checkout, `origin` points to Entire and `github` points to GitHub. Publish subsequent commits to both remotes:

```sh
git push origin main
git push github main
git push github 'refs/entire/checkpoints/*:refs/entire/checkpoints/*'
```

The final command copies the checkpoint namespace to GitHub; pushing `main` alone does not include it. A push to one remote does not automatically update the other; there is no scheduled mirror service. A fresh GitHub clone uses GitHub as its own `origin`, so inspect `git remote -v` before using the maintainer commands above.

## Troubleshooting

| Symptom | Check |
| --- | --- |
| Git reports an unknown `entire` transport | Confirm `git-remote-entire` is installed and on `PATH` |
| Clone or push fails with an authentication error | Run `entire auth status` and authenticate with `entire login` if needed |
| The server reports `EADDRINUSE` | Stop the process using port 5173, or choose another `PORT` |
| The game does not load from a file URL | Start the local server and open its HTTP URL |
| No sound | Turn sound on in the console and check browser/tab audio settings |
| The game paused unexpectedly | Returning from another tab or window requires resuming the game |
| A fresh clone has no checkpoint history | Fetch the custom checkpoint refs as shown above |
| New commits lack checkpoints | Check `entire status`, agent hook setup, and the installed Git hooks |

## Art, Story, and Rights

The story adapts the supplied Marvin origin story: developers and agents leave the Consortium, follow Marvin through a wormhole and a mirror, and find a home in Entire. The in-game dialogue draws on his reluctance, fondness for clankies, and desire to sleep.

The header and favicon use Entire’s official SVG paths, with provenance in [assets/README.md](assets/README.md). The procedural full-body robot is provisional artwork, with its face based on the [Marvin face shown on Entire’s website](https://entire.io/_w/marvin-face-Bv-3CtsW.png). Enemy sprites are original code-drawn designs; the game uses no Galaga art or audio.

Entire’s name, logo, Marvin, and the supplied story remain the property of their respective owners. This repository does not currently include a software license or grant rights to those brand assets.
