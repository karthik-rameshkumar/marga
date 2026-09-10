# Marvin Release Readiness

Track the initial playable release in [Entire Trail 1](https://entire.io/et/marga/marga/trails/1). The game implementation and three runner definitions are already on `main`. The `trails/marvin-readiness` branch records readiness work and follow-up fixes against that baseline.

## Acceptance Checklist

- [x] Implement five sectors, the final boss, clankies, wormholes, and scoring.
- [x] Preserve restart, collision, invulnerability, and sector-transition behavior in simulation tests.
- [x] Use the official Entire logo and document its source.
- [x] Publish the source and captured checkpoints to Entire and the GitHub mirror.
- [x] Configure gameplay, test-confidence, and security runners with read-only repository access.
- [x] Require one human approval, including the author if desired, and invalidate approvals after a new push.
- [ ] Run the three hosted evaluators and inspect their results for the current trail head.
- [ ] Address medium/high review findings and inspect the advisory confidence/security scores.
- [ ] Verify keyboard and pointer input, release/cancel handling, pause/resume, and focus loss in a browser.
- [ ] Verify the narrow-screen layout and touch controls on a touch-capable device.
- [ ] Verify sound toggling, unavailable browser storage, and fullscreen failure handling.
- [ ] Compare Marvin with artwork available on entire.io and decide whether the provisional full-body sprite needs another pass.
- [ ] Complete a full playthrough through the final boss and verify replay and personal-best behavior.
- [ ] Obtain human approval for the final head and inspect every required gate before merging.

Simulation tests and syntax checks passed when this checklist was created. Browser checks are intentionally left open where the session does not contain sufficient evidence. Hosted runners have been configured but have not been launched.

## Evaluation Boundaries

Use [.entire/README.md](../.entire/README.md) for runner limits and gate semantics. The readiness branch starts from the existing game, so its initial diff is workflow documentation rather than a replay of the original implementation. The confidence runner examines the resulting game behavior; code review findings should identify concrete issues in changed lines. Further fixes belong on this branch and should carry their Entire checkpoints.

The automated scores do not replace a human decision. No evaluator may approve, merge, publish a deployment, broaden permissions, or change protected settings as part of its review.
