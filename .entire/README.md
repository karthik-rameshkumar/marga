# Marga Trails

Marga uses three repository-authored trail runners. Configurations live in `runners/` and load from the default branch, `main`.

| Runner | Purpose | Output |
| --- | --- | --- |
| `trail-review` | Review concrete gameplay, input, and local-server regressions | Findings with severity and file/line evidence |
| `trail-confidence` | Execute local checks and assess behavioral coverage | Advisory confidence score, higher is better |
| `trail-security` | Inspect file exposure, untrusted inputs, network behavior, and permissions | Advisory security-risk score, lower is better |

Each runner uses the shipped Claude/Sonnet runtime, a five-minute execution timeout, a ten-minute sandbox lifetime, read-only repository credentials, and `git_push: false`. The prompts prohibit installs, deployments, unrelated file access, and external writes. Runtime permissions enforce repository write restrictions; prompt instructions alone are not a general network sandbox.

Both API and push triggers are declared so the definitions support manual launches and future push automation. The repository-level `auto_run_on_push` setting remains **off**. Creating these configurations does not start an agent or provision a sandbox. Launching a runner uses Entire’s configured execution service and can consume model and sandbox resources.

## Gates

Gate enforcement is enabled for the personal Entire-native Marga repository. Gate definitions are repository settings in Entire, not inferred from this document.

| Gate | Configuration |
| --- | --- |
| Findings | Blocking; unresolved medium- or high-severity agent findings prevent merge |
| Up to Date | Blocking; the branch must be current with its base |
| Checks | Blocking; require success for checks marked required or without requirement metadata; no named CI check is configured yet |
| Human Approval | Disabled for the initial personal workflow; enable when a separate reviewer is designated |

The confidence and security scores are advisory monitors, not numeric merge gates. A passing Node test run does not prove that rendering, touch controls, audio, or visual branding have been checked. The checks gate does not turn these local commands into hosted CI jobs.

Merge bypass policy is `nobody`, and automatic merge is disabled. Gates apply to the Entire Trails merge workflow; they are not a claim that direct Git pushes or the GitHub mirror have branch protection.

## Inspect the Workflow

```sh
entire trail list
entire trail show trails/marvin-readiness
entire trail watch --help
entire checkpoint list
```

Use the trail’s runner controls in Entire to start an evaluation. Review the resulting findings, current-head status, and gate outcomes before merging. Missing or failed runner results are not evidence of a successful review. Do not use bypasses or fabricate results to satisfy a gate.

Gate settings and runner execution remain scoped to the personal Entire repository. GitHub holds a source mirror; this setup does not install GitHub Actions, change collaborator access, or configure GitHub branch protection.
