# The-Hive × gaia-visualizer stages

Stage **177** — live chat (2026-09-18 18:04 CDT) re-pasted session `update(t)` (infinity | hamiltonian | triangular | torus). Session hash remains `beec41f1`. Living hash remains `7cd81012`. No new case labels in the paste; klein / hopf / figure8 / trefoil stay runtime-only. `matchSessionPaste` extras stay false. Do not rewrite the four-geometry session switch. Living `evaluateChatKernelInto` zeros non-finite x/y/z. GPU/TF auto-enable at `?nodes=` > 1024 remains from Stage 160.
Stage **176** — live chat (2026-09-18 17:09 CDT) re-pasted session `update(t)` (infinity | hamiltonian | triangular | torus). Session hash remains `beec41f1`. Living hash remains `7cd81012`. No new case labels in the paste; klein / hopf / figure8 / trefoil stay runtime-only. `matchSessionPaste` extras stay false. Do not rewrite the four-geometry session switch. Living `evaluateChatKernelInto` zeros non-finite x/y/z. GPU/TF auto-enable at `?nodes=` > 1024 remains from Stage 160.
Stage **175** — live chat (2026-09-18 16:04 CDT) re-pasted session `update(t)` (infinity | hamiltonian | triangular | torus). Session hash remains `beec41f1`. Living hash remains `7cd81012`. No new case labels in the paste; klein / hopf / figure8 / trefoil stay runtime-only. `matchSessionPaste` extras stay false. Do not rewrite the four-geometry session switch. Living `evaluateChatKernelInto` zeros non-finite x/y/z. GPU/TF auto-enable at `?nodes=` > 1024 remains from Stage 160.
Stage **174** — live chat (2026-09-18 15:12 CDT) re-pasted session `update(t)` (infinity | hamiltonian | triangular | torus). Session hash remains `beec41f1`. Living hash remains `7cd81012`. No new case labels in the paste; klein / hopf / figure8 / trefoil stay runtime-only. `matchSessionPaste` extras stay false. Do not rewrite the four-geometry session switch. Living `evaluateChatKernelInto` zeros non-finite x/y/z. GPU/TF auto-enable at `?nodes=` > 1024 remains from Stage 160.

Chat kernel (`chatKernel.ts` / `chatKernelSources.ts`) keeps two pins:
- `CHAT_KERNEL_SESSION_SOURCE` — exact in-session paste (allocates `new THREE.Vector3` per frame by contract).
- `CHAT_KERNEL_SOURCE` — living runtime: uniform guards, `phi += 0.007 * toroidalWeave`, reused `_kernelTarget`.

## Next

13. Authenticated live ledger pulse → Hive WS (`GAIA_PULSE_TOKEN`, `broadcastGaiaPulse`) — token + HMAC gate is live; wire remaining sheet sources.
14. Memory engrams into Drive `CRYPTIC-HEARTBEAT-NEXUS-ROOT` from stored `/api/gaia/engram`.
16-public. hamiltoniansingularity.ai public band (`blend` default — already host-gated in the visualizer).
19-panels. Hook remaining Quine / NexusStudio editors to `emitWeaveChange` / `emitGeometry` / `emitBlend` / `emitPulse` / `emitLedger`.
51-impl. InstancedMesh + GPU attributes for >1k nodes — Stage 160 auto path is live (`GPU_AUTO_THRESHOLD = 1024`). Remaining: tighter instanceOffset shader path at 4k–16k without CPU matrix writes.
4-gov. HeartbeatScan authorization on HTTP mutation + WS (The-Hive issue #4).
58. Promote klein into the session switch only after a chat paste includes it.
66-session. Promote hopf/figure8/trefoil into the session switch only after a chat paste includes those cases.
177-gate. Keep session hash `beec41f1` pinned; do not rewrite the four-geometry paste.

Wire in panels:

```ts
import { emitWeaveChange, emitGeometry, emitBlend, emitPulse, emitLedger } from './weaveEmitter';
emitGeometry('blend');
emitBlend(0.6);
emitPulse(1.4, token, { topics: 4, votes: 45, bridges: 1 });
emitLedger({ topics: 4, votes: 45, bridges: 1 });
emitWeaveChange({ gravityPull: 1.4, toroidalWeave: 1.2, blend: 0.6 });
```
