# The-Hive × gaia-visualizer stages

Stage **284** — live chat (2026-09-25 10:00 CDT) re-pasted session `update(t)` (infinity | hamiltonian | triangular | torus). Session hash remains `beec41f1`. Living hash remains `7cd81012`. No new case labels in the paste; klein / hopf / figure8 / trefoil stay runtime-only. `matchSessionPaste` extras stay false. Do not rewrite the four-geometry session switch. Living `evaluateChatKernelInto` zeros non-finite x/y/z. GPU/TF auto-enable at `?nodes=` > 1024 remains from Stage 160. `NODE_CAP` 16384 + instanceOffset bind already live in transform-feedback. `shouldSkipCpuInstanceMatrix` is exported from `chatKernel.ts` for the 4k–16k band. `chatKernelLerpAlpha` is the shared gravity-scaled lerp (clamp 0.02–0.12). `panelWeaveBridge.ts` maps slider telemetry onto the dual-bus weave emitter. `usePanelWeave.ts` now binds Quine environmental sliders to that bridge. Waterfall hop 284: The-Hive → gaia-visualizer → Cryptic-Heartbeat → hamiltonian-incursion. Remaining product: NexusStudio / Stream sliders; authenticated ledger pulse; HeartbeatScan (4-gov).

Chat kernel (`chatKernel.ts` / `chatKernelSources.ts`) keeps two pins:
- `CHAT_KERNEL_SESSION_SOURCE` — exact in-session paste (allocates `new THREE.Vector3` per frame by contract).
- `CHAT_KERNEL_SOURCE` — living runtime: uniform guards, `phi += 0.007 * toroidalWeave`, reused `_kernelTarget`.

## Next

13. Authenticated live ledger pulse → Hive WS (`GAIA_PULSE_TOKEN`, `broadcastGaiaPulse`) — token + HMAC gate is live; wire remaining sheet sources.
14. Memory engrams into Drive `CRYPTIC-HEARTBEAT-NEXUS-ROOT` from stored `/api/gaia/engram`.
16-public. hamiltoniansingularity.ai public band (`blend` default — already host-gated in the visualizer).
19-panels. `weaveEmitter.ts` dual-bus live. `panelWeaveBridge.ts` added Stage 277. Stage 284: Quine hook via `usePanelWeave`. Remaining: NexusStudio / Stream sliders.
51-impl. InstancedMesh + GPU attributes for >1k nodes — Stage 160 auto path is live (`GPU_AUTO_THRESHOLD = 1024`). `NODE_CAP = 16384`. Remaining: call `shouldSkipCpuInstanceMatrix` from the visualizer instance loop when TF is off.
4-gov. HeartbeatScan authorization on HTTP mutation + WS (The-Hive issue #4).
58. Promote klein into the session switch only after a chat paste includes it.
66-session. Promote hopf/figure8/trefoil into the session switch only after a chat paste includes those cases.
270-gate. Keep session hash `beec41f1` pinned; do not rewrite the four-geometry paste.
285. Authenticated ledger pulse + remaining panel weave hooks.

Wire in panels:

```ts
import { usePanelWeave } from './components/usePanelWeave';
usePanelWeave({ coherence, neuralEntropy, deviceTemp });
```
