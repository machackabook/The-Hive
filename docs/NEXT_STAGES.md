# Next stages (compiled 2026-09-15 09:14 CDT — Stage 125)

Pinned session `update(t)` hash: `beec41f1`.
Living runtime hash: `7cd81012`.
Session geometries: infinity | hamiltonian | triangular | torus.
Runtime extras (not in session switch): klein | hopf | figure8 | trefoil.

## Immediate

1. Keep the four-geometry session paste verbatim. Do not add case labels until a future chat paste includes them.
2. Continue CPU/GPU parity on torus / infinity / hamiltonian / triangular (lerp 0.05, theta step `0.01 + idx*0.002`, minor `3 + weave*2`).
3. Wire remaining Quine / NexusStudio panels to `emitGeometry` / `emitWeaveChange` / `emitPulse` / `emitLedger`.
4. Finish InstancedMesh + GPU attributes for >1k nodes.
5. Persist kernel engrams to Drive nexus root from `/api/gaia/engram`.

## Gated promotions

- Klein enters the session switch only after `matchSessionPaste` reports `kleinInSession: true`.
- Hopf / figure8 / trefoil follow the same gate.
- Public band default remains `blend` on hamiltoniansingularity.ai.
