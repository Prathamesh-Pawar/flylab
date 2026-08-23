# FlightLab runbook

## Run locally

```bash
bun install
bun run dev
```

Open `http://localhost:3000`, keep the defaults `SFO`, `JFK`, and September 4,
then select any flight. Submit a name, email, phone number, and a 12–19 digit
demo card number. The confirmation reference is stable for the selected flight
and normalized email.

## Runtime monitoring boundary

Check the deployed release metadata at `/api/version`. To enable a feature API
route to notify monitoring, configure `OPSSEMBLE_INGEST_URL` and
`OPSSEMBLE_INGEST_SECRET` in the server environment. The server signs a neutral
runtime envelope before delivery. If delivery is unavailable, application
results remain unchanged and the route can inspect the returned delivery status.
Do not send a real card number to this demo.

## Reset

There is no FlightLab persistence to reset. Monitoring data and MCP operations
are owned by the external Opssemble service. After a rehearsal, restore feature
code through an ordinary revert PR; never force-push or rewrite FlightLab
history. Opssemble monitoring provides guarded PR and revert scripts under
`monitoring/flightlab-prs`.
