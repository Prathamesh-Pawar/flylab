# FlightLab architecture

FlightLab is a compact Next.js App Router application built to be a victim app
for Opssemble. It has no account system, data store, airline inventory API, or
payment processor.

```text
Browser search and checkout UI
  -> deterministic search and booking libraries

FlightLab feature API route
  -> server-owned signed neutral runtime envelope
  -> external Opssemble monitoring ingress and MCP service
```

The app flow is `/` → `/checkout/[flightId]` → `/booking/[bookingId]`.
`data/flights.ts` is the only source of flight inventory. `lib/booking.ts`
normalizes traveler email and derives a deterministic booking reference and
operation ID without storing traveler data.

`/api/version` returns `service` and a server-owned deployment SHA. Feature API
routes may use `lib/runtime-envelope.ts` to measure a result and emit the exact
neutral envelope contract to the external monitoring ingress. FlightLab does
not read provider fixtures, determine telemetry providers, or store monitoring
data; those responsibilities belong to Opssemble.
