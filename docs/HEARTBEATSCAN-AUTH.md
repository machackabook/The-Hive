# HeartbeatScan Access Gate

Stage 28 security design for the Gaia mutation surface.

## Required controls

HeartbeatScan is an additive authorization model. A mutation request is accepted only when all four conditions are satisfied:

1. `HEARTBEATSCAN_TOKEN` matches the server-side secret.
2. `HEARTBEATSCAN_PLUS_CODE` matches the configured controller location code.
3. `HEARTBEATSCAN_ALLOWED_CIDRS` contains the controller's network address.
4. `HEARTBEATSCAN_ALLOWED_EMAILS` contains the authenticated account email.

A Plus Code is treated as an additional location/context assertion, not as a cryptographic secret. The token remains the secret credential.

## Environment configuration

Set these values only in the deployment secret store; do not commit them:

```text
HEARTBEATSCAN_TOKEN=<random-high-entropy-secret>
HEARTBEATSCAN_PLUS_CODE=<controller-plus-code>
HEARTBEATSCAN_ALLOWED_CIDRS=<controller-network-cidr>
HEARTBEATSCAN_ALLOWED_EMAILS=<authorized-email-1>,<authorized-email-2>
```

The controller network must be the actual network from which the Samsung controller reaches the service. Do not assume `192.168.1.0/24` is correct merely because an older architecture document used `192.168.1.254` as a gateway example.

## Email trust boundary

`x-authenticated-email` must only be supplied by a trusted authentication gateway that has already validated the user's OAuth/OIDC identity. A public client must never be trusted to self-assert an email address.

The current repository contains the authorization primitive in `gaiaBridge.ts`. HTTP route wiring must pass the request IP, authenticated email, Plus Code and HeartbeatScan token to `authorizePulseRequest()` before permitting mutation operations.

## Credential handling

HeartbeatScan credentials must never be placed in Gaia WebSocket broadcast frames, ledger payloads, browser local storage, URLs, or public logs.

Peer fan-out may use the token in the `x-heartbeatscan-token` request header only when the peer is itself a trusted, separately authenticated service.

## Verification checklist

- [ ] Generate a new high-entropy HeartbeatScan token.
- [ ] Set the actual Samsung-controller Plus Code.
- [ ] Set the actual controller network CIDR(s).
- [ ] Set the approved email allowlist.
- [ ] Configure the OAuth/OIDC gateway to inject `x-authenticated-email` only after authentication.
- [ ] Wire `authorizePulseRequest()` into every HTTP mutation endpoint.
- [ ] Apply the same network/identity policy to the WebSocket upgrade/authentication path.
- [ ] Verify unauthorized token, wrong Plus Code, wrong email, and off-network requests all return 401/close.
- [ ] Verify an authorized Samsung controller can mutate pulse, ledger, contract and position state.
- [ ] Rotate the old `GAIA_PULSE_TOKEN` secret after deployment.
