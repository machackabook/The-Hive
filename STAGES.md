# The-Hive × gaia-visualizer stages

Stage **254** — live chat (2026-09-23 10:33 CDT) re-pasted session `update(t)` (infinity | hamiltonian | triangular | torus). Session hash remains `beec41f1`. Living hash remains `7cd81012`. No new case labels in the paste; klein / hopf / figure8 / trefoil stay runtime-only. `matchSessionPaste` extras stay false. Do not rewrite the four-geometry session switch. Living `evaluateChatKernelInto` zeros non-finite x/y/z. GPU/TF auto-enable at `?nodes=` > 1024 remains from Stage 160. `weaveEmitter.ts` dual-dispatches CustomEvent + postMessage on both `gaia-weave` and `gaia:targetState`. EditorPanel SAVE/EXECUTE emit weave + ledger ticks.
Stage **253** — live chat (2026-09-22 23:08 CDT) re-pasted session `update(t)` (infinity | hamiltonian | triangular | torus). Session hash remains `beec41f1`. Living hash remains `7cd81012`. No new case labels in the paste; klein / hopf / figure8 / trefoil stay runtime-only. `matchSessionPaste` extras stay false. Do not rewrite the four-geometry session switch. Living `evaluateChatKernelInto` zeros non-finite x/y/z. GPU/TF auto-enable at `?nodes=` > 1024 remains from Stage 160. `weaveEmitter.ts` dual-dispatches CustomEvent + postMessage on both `gaia-weave` and `gaia:targetState`. EditorPanel SAVE/EXECUTE emit weave + ledger ticks.
Stage **252** — live chat (2026-09-22 22:06 CDT) re-pasted session `update(t)` (infinity | hamiltonian | triangular | torus). Session hash remains `beec41f1`. Living hash remains `7cd81012`. No new case labels in the paste; klein / hopf / figure8 / trefoil stay runtime-only. `matchSessionPaste` extras stay false. Do not rewrite the four-geometry session switch. Living `evaluateChatKernelInto` zeros non-finite x/y/z. GPU/TF auto-enable at `?nodes=` > 1024 remains from Stage 160. `weaveEmitter.ts` dual-dispatches CustomEvent + postMessage on both `gaia-weave` and `gaia:targetState`. EditorPanel SAVE/EXECUTE emit weave + ledger ticks.
Stage **251** — live chat (2026-09-22 21:06 CDT) re-pasted session `update(t)` (infinity | hamiltonian | triangular | torus). Session hash remains `beec41f1`. Living hash remains `7cd81012`. No new case labels in the paste; klein / hopf / figure8 / trefoil stay runtime-only. `matchSessionPaste` extras stay false. Do not rewrite the four-geometry session switch. Living `evaluateChatKernelInto` zeros non-finite x/y/z. GPU/TF auto-enable at `?nodes=` > 1024 remains from Stage 160. `weaveEmitter.ts` dual-dispatches CustomEvent + postMessage on both `gaia-weave` and `gaia:targetState`. EditorPanel SAVE/EXECUTE emit weave + ledger ticks.
Stage **250** — live chat (2026-09-22 20:07 CDT) re-pasted session `update(t)` (infinity | hamiltonian | triangular | torus). Session hash remains `beec41f1`. Living hash remains `7cd81012`. No new case labels in the paste; klein / hopf / figure8 / trefoil stay runtime-only. `matchSessionPaste` extras stay false. Do not rewrite the four-geometry session switch. Living `evaluateChatKernelInto` zeros non-finite x/y/z. GPU/TF auto-enable at `?nodes=` > 1024 remains from Stage 160. `weaveEmitter.ts` dual-dispatches CustomEvent + postMessage on both `gaia-weave` and `gaia:targetState`. EditorPanel SAVE/EXECUTE emit weave + ledger ticks.

Chat kernel (`chatKernel.ts` / `chatKernelSources.ts`) keeps two pins:
- `CHAT_KERNEL_SESSION_SOURCE` — exact in-session paste (allocates `new THREE.Vector3` per frame by contract).
- `CHAT_KERNEL_SOURCE` — living runtime: uniform guards, `phi += 0.007 * toroidalWeave`, reused `_kernelTarget`.

## Next

13. Authenticated live ledger pulse → Hive WS (`GAIA_PULSE_TOKEN`, `broadcastGaiaPulse`) — token + HMAC gate is live; wire remaining sheet sources.
14. Memory engrams into Drive `CRYPTIC-HEARTBEAT-NEXUS-ROOT` from stored `/api/gaia/engram`.
16-public. hamiltoniansingularity.ai public band (`blend` default — already host-gated in the visualizer).
19-panels. `weaveEmitter.ts` dual-bus live (`gaia-weave` + `gaia:targetState`). Remaining: hook Quine / NexusStudio / Stream sliders to `emitWeaveChange` / `emitGeometry` / `emitBlend` / `emitPulse` / `emitLedger`.
51-impl. InstancedMesh + GPU attributes for >1k nodes — Stage 160 auto path is live (`GPU_AUTO_THRESHOLD = 1024`). Remaining: tighter instanceOffset shader path at 4k–16k without CPU matrix writes.
4-gov. HeartbeatScan authorization on HTTP mutation + WS (The-Hive issue #4).
58. Promote klein into the session switch only after a chat paste includes it.
66-session. Promote hopf/figure8/trefoil into the session switch only after a chat paste includes those cases.
254-gate. Keep session hash `beec41f1` pinned; do not rewrite the four-geometry paste.

Wire in panels:

```ts
import { emitWeaveChange, emitGeometry, emitBlend, emitPulse, emitLedger } from './weaveEmitter';
emitGeometry('blend');
emitBlend(0.6);
emitPulse(1.4, token, { topics: 4, votes: 45, bridges: 1 });
emitLedger({ topics: 4, votes: 45, bridges: 1 });
emitWeaveChange({ gravityPull: 1.4, toroidalWeave: 1.2, blend: 0.6 });
```
