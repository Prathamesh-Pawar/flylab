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

FlightLab exposes `/api/version`, which returns its service name and the
server-owned deployed Git SHA (or `local` outside a deployment). Feature API
routes can use `lib/runtime-envelope.ts` to measure an execution and send only
a signed, neutral runtime envelope to the external Opssemble monitoring ingress.

Set `OPSSEMBLE_INGEST_URL` and `OPSSEMBLE_INGEST_SECRET` in the server runtime
to enable delivery. The browser neither chooses telemetry providers nor submits
metric values, scenarios, labels, or outcomes. Monitoring, provider data, and
MCP access belong to the external Opssemble service.
