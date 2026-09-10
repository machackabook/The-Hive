# Pipeline — tikemachine versioning

## Intent

When a pull lands on any mesh repo, the system stamps the local ledger then dispatches `continuity-cascade` so sibling surfaces push their next enhance. Waterfall, not overwrite.

## Triggers

- cron `19 * * * *`
- `workflow_dispatch`
- `push` to `main`
- `repository_dispatch`: `continuity-cascade`, `pull-then-push`

## Env checks

Siblings expect optional secrets:

- `CASCADE_TOKEN` — PAT that can dispatch to sibling repos
- `GAIA_PULSE_TOKEN` — HMAC peer gate

Device side: `scripts` on Cryptic-Heartbeat (`env-check.sh`) plus SD-card developing tree.

## Bidirectional mesh

GitHub ↔ Google Drive folder `CRYPTIC-HEARTBEAT-NEXUS-ROOT` (id `13sLfVC5R8fmCH-HROzrY2OXs2_0xsBZt`).
nexus-repo-sync holds the sync contract. No generation discarded.

## Recurrence

```
C[n+1] = SYNTHESIZE( PRESERVE( ENHANCE( DUPLICATE(C[n]) ) ) )
```
