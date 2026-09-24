# Next stages after 277

1. Keep the four-geometry session paste verbatim. Do not add case labels until a future chat paste includes them.
2. Continue CPU/GPU parity on torus / infinity / hamiltonian / triangular (lerp 0.05 session, living lerp tracks gravityPull, theta step `0.01 + idx*0.002`, minor `3 + weave*2`).
3. Import `panelWeaveBridge` from Quine / NexusStudio / Stream sliders (`emitGeometry` / `emitWeaveChange` / `emitPulse` / `emitLedger`). EditorPanel SAVE/EXECUTE already emit; weaveEmitter dual-bus live.
4. Skip CPU instance matrix writes in the 4k–16k band when TF is off (helper `shouldSkipCpuInstanceMatrix` now shared from chatKernel).
5. Persist kernel engrams to Drive nexus root from `/api/gaia/engram`.
6. Wire remaining sheet sources into authenticated live ledger pulse (`GAIA_PULSE_TOKEN` / `broadcastGaiaPulse`).
7. HeartbeatScan authorization on HTTP mutation + WS (issue #4).
