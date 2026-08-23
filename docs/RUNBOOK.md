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

## Runtime telemetry

The app posts structured JSON to `/api/telemetry` for search submission,
seat-bundle selection, and booking completion. The route emits those records to
the server log with `service: "flightlab"`. It accepts no credentials and keeps
no records. Do not send a real card number to this demo.

## Opssemble fixtures

Fixture data lives in `demo-data/scenarios`. Snapshot fixture data when a
mission begins and make observations visible only after `availableAfterMs`
relative to mission start. Apply all query filters after the visibility check.
For a repair mission, choose `booking-timeout-retry/repair` explicitly from the
linked repair metadata; never infer it from a query or a branch name.

## Reset

There is no FlightLab persistence to reset. Reset the Fake Operations MCP demo
session between rehearsals to restore its selected fixture scenario and action
ledger.
