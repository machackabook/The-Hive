# Stage 44 — compact engram GET + replay (2026-09-10)

Session `update(t)` unchanged. sourceHash `beec41f1`. STAGE constant is 44.

## Shipped

- `GET /api/gaia/engram` returns the last compact `{ stage, sourceHash, at, count, theta, phi }`.
- `POST /api/gaia/engram` (token-gated when `GAIA_PULSE_TOKEN` is set) stores via `stampEngram` / `compactEngram` (cap 64).
- `/api/health` includes `engram`.
- Visualizer `?relay=` fetches that GET before first apply and writes it to `pendingKernel`.

## Next

| Stage | Owner | Work |
|------|--------|------|
| 13 | both | Authenticated live ledger_pulse → Hive WS |
| 14 | The-Hive | Memory engrams into Drive |
| 16-public | gaia-visualizer | public band blend default |
| 19-panels | The-Hive | remaining emit hooks |
| 42-enclave | ENCLAVE-ADAM-REUNITED | auto-unpack watch |
| 45 | mesh | Continuity cascade carries STAGE + sourceHash on every sibling dispatch |
