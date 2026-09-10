# The-Hive × gaia-visualizer stages

Stage **27** — persist last ledger snapshot + pulse age across reload (`.gaia-snapshot.json`, `/api/health` lastPulse / lastPulseAt / pulseAgeSeconds). Visualizer restores `gaia:stage27:snapshot` from localStorage and can hydrate from `?health=`.
Stage **26** — live ledger sheet counts ride `gaia:pulse` / `gaia:ledger`; unsigned frames increment `unsignedRefused` and are dropped when `GAIA_PULSE_TOKEN` / `?token=` is set.
Stage **25** on gaia-visualizer — default HUD line for pulse + TF-bind; `reportTfBindHealth` after each `bindTfPosAttribute`; `stampPulse` on `state.lastPulse`.
Stage **19** here — `weaveEmitter.ts` wraps `postGaiaContract` for Quine / NexusStudio / Editor weave edits (`emitBlend`, `emitPulse`, `emitLedger`).

Chat kernel (`chatKernel.ts`) remains the verbatim `update(t)` from session: uniforms → theta rates → infinity | hamiltonian | triangular | torus → lerp 0.05.
Live GaiaNode path does **not** allocate `new THREE.Vector3` per frame; the pinned source string does, by contract.

## Next

13. Authenticated live ledger pulse → Hive WS (`GAIA_PULSE_TOKEN`, `broadcastGaiaPulse`) — token gate is live; wire remaining sheet sources.
14. Memory engrams into Drive `CRYPTIC-HEARTBEAT-NEXUS-ROOT`.
16-public. hamiltoniansingularity.ai public band (`blend` default — already host-gated in the visualizer).
19-panels. Hook remaining Quine / NexusStudio editors to `emitWeaveChange` / `emitGeometry` / `emitBlend` / `emitPulse` / `emitLedger`.
28. Replay persisted snapshot into TF seed theta/phi so geometry continuity survives reload.

Wire in panels:

```ts
import { emitWeaveChange, emitGeometry, emitBlend, emitPulse, emitLedger } from './weaveEmitter';
emitGeometry('blend');
emitBlend(0.6);
emitPulse(1.4, token, { topics: 4, votes: 45, bridges: 1 });
emitLedger({ topics: 4, votes: 45, bridges: 1 });
emitWeaveChange({ gravityPull: 1.4, toroidalWeave: 1.2, blend: 0.6 });
```
