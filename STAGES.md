# The-Hive × gaia-visualizer stages

Stage **43** — HUD + `/api/health` sample fidelity when inbound `sourceHash` ≠ `beec41f1`.
Stage **42** — re-pin session paste + `advanceChatKernelAngles`.
Stage **41** — `evaluateChatKernelInto`.
Stage **40** — inbound `sourceHash` ≠ `beec41f1` flagged on visualizer HUD. Hive accepts `POST /api/gaia/engram`.

Chat kernel (`chatKernel.ts`) remains the verbatim `update(t)` from session: uniforms → theta rates → infinity | hamiltonian | triangular | torus → lerp 0.05.
Live GaiaNode path does **not** allocate `new THREE.Vector3` per frame; the pinned source string does, by contract.

## Next

13. Authenticated live ledger pulse → Hive WS (`GAIA_PULSE_TOKEN`, `broadcastGaiaPulse`) — token + HMAC gate is live; wire remaining sheet sources.
14. Memory engrams into Drive `CRYPTIC-HEARTBEAT-NEXUS-ROOT` from stored `/api/gaia/engram`.
16-public. hamiltoniansingularity.ai public band (`blend` default — already host-gated in the visualizer).
19-panels. Hook remaining Quine / NexusStudio editors to `emitWeaveChange` / `emitGeometry` / `emitBlend` / `emitPulse` / `emitLedger`.
44. Compact engram GET + replay into visualizer `pendingKernel`.
45. Continuity cascade carries STAGE + sourceHash on every sibling dispatch.

Wire in panels:

```ts
import { emitWeaveChange, emitGeometry, emitBlend, emitPulse, emitLedger } from './weaveEmitter';
emitGeometry('blend');
emitBlend(0.6);
emitPulse(1.4, token, { topics: 4, votes: 45, bridges: 1 });
emitLedger({ topics: 4, votes: 45, bridges: 1 });
emitWeaveChange({ gravityPull: 1.4, toroidalWeave: 1.2, blend: 0.6 });
```
