# Gaia Windows Node

Dedicated Windows execution surface for Gaia: The Nexus Generation.

## Mission

Provide a hardened, auditable Windows node for Sentinel monitoring, TDOC command execution, telemetry, Git synchronization, and controlled ADAM hosting.

## Safety boundary

This branch contains orchestration and policy, not credentials or private Enclave contents. No tokens, private keys, certificates, sparsebundles, raw credential stores, or uncontrolled binary payloads belong here.

## Operating model

1. Audit first.
2. Change only through declared TDOC operations.
3. Emit telemetry for significant state changes.
4. Keep local execution reversible where practical.
5. Treat the Windows node as a worker, never the sole source of truth.
6. Keep source and configuration versioned in Git.

## Components

- `tdoc/` — command contract and capability boundaries.
- `powershell/` — Windows implementation scripts.
- `sentinel/` — monitoring policy.
- `telemetry/` — event schema and local queue contract.
- `.github/workflows/` — validation and audit automation.

## Initial rollout

The first Windows pass is deliberately non-destructive. It inventories the machine, audits Git state, searches for repository hazards, and records a baseline before optimization.

## Remote ChatGPT/Codex note

Codex history is separate from ChatGPT history. Supported desktop Codex chats can be reached remotely from the ChatGPT mobile Remote tab, while cloud Work chats synchronize across web, mobile, and desktop. This repository therefore remains the durable engineering state; chat history is not treated as the system of record.
