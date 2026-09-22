# Stage 247 — session kernel reconfirmed (2026-09-22 17:23 CDT)

Live chat pasted the exact session `update(t)` contract again.

- uniforms `uTime` / `uGravity`
- `theta += (0.01 + idx * 0.002) * gravityPull`
- geometries: infinity (lemniscate) | hamiltonian | triangular | torus default
- `lerp(new THREE.Vector3(x, y, z), 0.05)` on the session paste

FNV-1a of that paste: `beec41f1` — matches `CHAT_KERNEL_SESSION_HASH`.
Living runtime hash stays `7cd81012` (phi weave, uniform guards, reused `_kernelTarget`).
Klein / hopf / figure8 / trefoil stay **runtime extras only**. Do not fold them into the session switch until a later paste includes those cases.

Living runtime already enhances without touching the session switch:
- uniform guards (`uTime`, `uGravity`, optional `uWeave`)
- `phi += 0.007 * toroidalWeave`
- reused `_kernelTarget` (no per-frame Vector3 alloc)
- non-finite x/y/z zeroed in `evaluateChatKernelInto`
- GPU/TF auto-enable at `nodes > 1024`
