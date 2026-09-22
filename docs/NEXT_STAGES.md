# Next stages after 241

1. Keep the four-geometry session paste verbatim. Do not add case labels until a future chat paste includes them.
2. Continue CPU/GPU parity on torus / infinity / hamiltonian / triangular (lerp 0.05, theta step `0.01 + idx*0.002`, minor `3 + weave*2`).
3. Wire remaining Quine / NexusStudio / Stream sliders to `emitGeometry` / `emitWeaveChange` / `emitPulse` / `emitLedger` (EditorPanel SAVE/EXECUTE already emit; weaveEmitter now dual-bus).
4. Tighter InstancedMesh + GPU attributes for 4k–16k nodes (gaia-visualizer).
5. Persist kernel engrams to Drive nexus root from `/api/gaia/engram`.
6. Wire remaining sheet sources into authenticated live ledger pulse (`GAIA_PULSE_TOKEN` / `broadcastGaiaPulse`).
7. HeartbeatScan authorization on HTTP mutation + WS (issue #4).
