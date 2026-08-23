# FlightLab

FlightLab is a minimal, accessible flight-booking victim app for the Opssemble
hackathon demo. It supports one complete demo journey:

```text
SFO → JFK search → flight selection → traveler details → demo payment → reference
```

It deliberately has no authentication, database, persistence, real airline
provider, or real payment processing.

## Start

```bash
bun install
bun run dev
```

Run checks with:

```bash
bun run lint
bun run typecheck
bun run test
bun run build
```

## Opssemble integration boundary

`demo-data/` contains merge-relative, provider-shaped observations for the
Fake Operations MCP. They expose raw metrics, logs, product events, payment
records, and fault experiment state. They never contain a Watch Plan, agent
selection, verdict, policy result, report, issue text, or repair instruction.

The app's `/api/telemetry` endpoint emits structured runtime logs to standard
output. It makes the same search, seat-selection, and booking events observable
for a local collector without adding application persistence.
