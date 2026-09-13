# Waterfall pipeline

Pull on this repo is the trigger. Merge is the cascade. Hourly cron is the heartbeat.

```
PR merge (The-Hive)
  -> quality + env-check
    -> signal Cryptic-Heartbeat
      -> signal gaia-visualizer
        -> signal continuity-ledger-cycle
```

Hourly schedule (`0 * * * *`) re-runs env checks so the versioning folder stays a speedway, not a graveyard.

Bidirectional cloud mesh (Google Drive / ethereal continuum) is documented as intent.
Actual Drive writes stay gated: connectors list files; they do not silently rewrite user clouds.

Numeral origin: `137451921129154222`
