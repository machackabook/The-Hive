# The-Hive × gaia-visualizer stages

Stage **35** — visualizer applies `pendingKernel` immediately after node construction so TF boot uses streamed / hydrated seeds without waiting for a later frame.
Stage **34** — HMAC-sign kernel frames when `GAIA_PULSE_TOKEN` is set (`signKernelMac` / `verifyKernelMac` in `kernelFrame.ts`). Pulse, ledger, contract, and health carry the signed kernel.
Stage **33** — compact theta/phi seeds ride `gaia:positions` (visualizer `createPositionStreamer` + inbound `ingestKernel`). Session `update(t)` paste unchanged (infinity | hamiltonian | triangular | torus).
Stage **32** — signed kernel contract frame (`sourceHash`, geometries, stage) rides every `gaia:pulse`. `signedKernelFrame()` in `kernelFrame.ts`.
Stage **31** — visualizer fidelity-samples the four chat geometries independently of klein extras.
Stage **30** — `/api/health` exposes `kernel` theta/phi seeds; `POST /api/gaia/kernel` + WS `gaia:kernel`. Visualizer applies `applyKernelSnapshot` on boot and on health hydrate.
Stage **29** — `chatKernel.ts` `CHAT_KERNEL_SOURCE` is the exact session `update(t)` (infinity | hamiltonian | triangular | torus). Runtime extras: `phi += 0.007 * toroidalWeave`, first-class `klein`. Visualizer adds `src/kernelSnapshot.js` (`gaia:stage29:kernel`).
Stage **28** — phi weave + klein in evaluateChatKernel.
Stage **27** — persist last ledger snapshot + pulse age across reload (`.gaia-snapshot.json`, `/api/health` lastPulse / lastPulseAt / pulseAgeSeconds). Visualizer restores `gaia:stage27:snapshot` from localStorage and can hydrate from `?health=`.
Stage **26** — live ledger sheet counts ride `gaia:pulse` / `gaia:ledger`; unsigned frames increment `unsignedRefused` and are dropped when `GAIA_PULSE_TOKEN` / `?token=` is set.
Stage **25** on gaia-visualizer — default HUD line for pulse + TF-bind; `reportTfBindHealth` after each `bindTfPosAttribute`; `stampPulse` on `state.lastPulse`.
Stage **19** here — `weaveEmitter.ts` wraps `postGaiaContract` for Quine / NexusStudio / Editor weave edits (`emitBlend`, `emitPulse`, `emitLedger`).

Chat kernel (`chatKernel.ts`) remains the verbatim `update(t)` from session: uniforms → theta rates → infinity | hamiltonian | triangular | torus → lerp 0.05.
Live GaiaNode path does **not** allocate `new THREE.Vector3` per frame; the pinned source string does, by contract.

## Next

13. Authenticated live ledger pulse → Hive WS (`GAIA_PULSE_TOKEN`, `broadcastGaiaPulse`) — token + HMAC gate is live; wire remaining sheet sources.
14. Memory engrams into Drive `CRYPTIC-HEARTBEAT-NEXUS-ROOT`.
16-public. hamiltoniansingularity.ai public band (`blend` default — already host-gated in the visualizer).
19-panels. Hook remaining Quine / NexusStudio editors to `emitWeaveChange` / `emitGeometry` / `emitBlend` / `emitPulse` / `emitLedger`.
36. BroadcastChannel HMAC verify on visualizer peers when `?token=` is set (partially live via `acceptFrame` + `verifyKernelMac`).
37. Drive-folder engram dump of compact kernel seeds.

Wire in panels:

```ts
import { emitWeaveChange, emitGeometry, emitBlend, emitPulse, emitLedger } from './weaveEmitter';
emitGeometry('blend');
emitBlend(0.6);
emitPulse(1.4, token, { topics: 4, votes: 45, bridges: 1 });
emitLedger({ topics: 4, votes: 45, bridges: 1 });
emitWeaveChange({ gravityPull: 1.4, toroidalWeave: 1.2, blend: 0.6 });
```
