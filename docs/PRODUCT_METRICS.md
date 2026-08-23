# FlightLab runtime contract

FlightLab does not define product metrics, telemetry providers, scenarios, or
operational outcomes. Those are external Opssemble monitoring/MCP concerns.

Feature API routes may emit a server-owned, HMAC-signed neutral envelope with
only `eventId`, `observedAt`, `service`, `releaseSha`, `route`, `requestId`,
`operationId`, `statusCode`, and `durationMs`. The external service interprets
that trigger and obtains any provider-specific observations independently.
