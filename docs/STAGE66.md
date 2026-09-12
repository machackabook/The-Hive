# Stage 66 — trefoil CPU extra + paste scanner (2026-09-11 23:03 CDT)

Live chat pasted the exact session `update(t)` contract again:

- uniforms `uTime` / `uGravity`
- `theta += (0.01 + idx * 0.002) * gravityPull`
- geometries: infinity (lemniscate) | hamiltonian | triangular | torus default
- `lerp(new THREE.Vector3(x, y, z), 0.05)` on the session paste

Session hash remains `beec41f1`. Living hash remains `7cd81012`.
Klein / hopf / figure8 / trefoil stay out of the session switch.

## Shipped in 66

- CPU `evaluateChatKernel` now evaluates `trefoil` with the same mapping as GPU `KERNEL_GEOMETRY_ID` 7.
- `CHAT_KERNEL_GEOMETRIES` includes `klein | hopf | figure8 | trefoil` as runtime extras only.
- `matchSessionPaste` scans the pasted source for `case 'name'` instead of hardcoding extras to false.
- `STAGE = 66`.

## Next

13 ledger pulse · 14 Drive engrams · 16-public band · 19-panels · 51-impl InstancedMesh · 58 klein-in-session only after paste · 66-session hopf/figure8/trefoil-in-session only after paste
