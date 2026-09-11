# Stage 47 — session kernel reconfirmed from live chat (2026-09-10 20:13 CDT)

Live chat pasted the exact `update(t)` contract:

- uniforms `uTime` / `uGravity`
- `theta += (0.01 + idx * 0.002) * gravityPull`
- geometries: infinity (lemniscate) | hamiltonian | triangular | torus default
- lerp `0.05` allocating `new THREE.Vector3` (session pin, not living source)

FNV-1a of that paste: `beec41f1` — matches `CHAT_KERNEL_SESSION_HASH`.
Living runtime hash stays `7cd81012` (phi weave, uniform guards, reused `_kernelTarget`).
Klein stays a **runtime extra only**. Do not fold it into the session switch until a later paste includes it.

## Next (ordered)

| Stage | Owner | Work |
|------|--------|------|
| 13 | Hive + Heartbeat | Authenticated live ledger pulse → Hive WS |
| 14 | Hive | Memory engrams into Drive `CRYPTIC-HEARTBEAT-NEXUS-ROOT` |
| 16-public | visualizer | hamiltoniansingularity.ai public band (`blend` default) |
| 19-panels | Hive | Remaining Quine / NexusStudio emit hooks |
| 48 | mesh | Drive engram write path from `GET /api/gaia/engram` |
| 49 | session | Promote klein into session switch **only** after chat paste includes it |
