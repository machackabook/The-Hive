# The-Hive × gaia-visualizer stages

Stage **46** — session `update(t)` re-pinned (hash `beec41f1`). Continuity cascade stamps `STAGE` + living `sourceHash` (`7cd81012`) on every sibling dispatch (`gaia:targetState`, `gaia:pulse`, `gaia:ledger`).
Stage **45** — phi weave + uniform guards + reused lerp target promoted into `CHAT_KERNEL_SOURCE`.
Stage **44** — compact engram GET `/api/gaia/engram` + replay into visualizer `pendingKernel`.
Stage **43** — HUD + `/api/health` sample fidelity when inbound `sourceHash` ≠ living hash.
Stage **42** — re-pin session paste + `advanceChatKernelAngles`.
Stage **41** — `evaluateChatKernelInto`.
Stage **40** — inbound `sourceHash` flagged on visualizer HUD. Hive accepts `POST /api/gaia/engram`.

Chat kernel (`chatKernel.ts`) keeps two pins:
- `CHAT_KERNEL_SESSION_SOURCE` — exact in-session paste (allocates `new THREE.Vector3` per frame by contract).
- `CHAT_KERNEL_SOURCE` — living runtime: uniform guards, `phi += 0.007 * toroidalWeave`, reused `_kernelTarget`.

## Next

13. Authenticated live ledger pulse → Hive WS (`GAIA_PULSE_TOKEN`, `broadcastGaiaPulse`) — token + HMAC gate is live; wire remaining sheet sources.
14. Memory engrams into Drive `CRYPTIC-HEARTBEAT-NEXUS-ROOT` from stored `/api/gaia/engram`.
16-public. hamiltoniansingularity.ai public band (`blend` default — already host-gated in the visualizer).
19-panels. Hook remaining Quine / NexusStudio editors to `emitWeaveChange` / `emitGeometry` / `emitBlend` / `emitPulse` / `emitLedger`.
47. Promote klein into the session switch only after a chat paste includes it.

Wire in panels:

```ts
import { emitWeaveChange, emitGeometry, emitBlend, emitPulse, emitLedger } from './weaveEmitter';
emitGeometry('blend');
emitBlend(0.6);
emitPulse(1.4, token, { topics: 4, votes: 45, bridges: 1 });
emitLedger({ topics: 4, votes: 45, bridges: 1 });
emitWeaveChange({ gravityPull: 1.4, toroidalWeave: 1.2, blend: 0.6 });
```
