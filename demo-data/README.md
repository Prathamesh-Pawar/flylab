# FlightLab provider observations

These files are deterministic, provider-shaped external observations for the
Opssemble demo. They are not application state and do not contain agent
conclusions, policies, reports, repairs, or expected outcomes.

Each line in an `.ndjson` file is one observation. `availableAfterMs` is
relative to the real merge timestamp (or mission `startedAt` in a local demo).
An adapter must only expose records whose offset has elapsed, then apply the
caller's provider query filters. `{{HEAD_SHA}}` is replaced with the merge SHA
when a fixture snapshot is created.

The `repair/` directory is selected explicitly for a linked repair mission;
selection must never depend on an agent query or inferred result. Empty provider
files mean that provider has no observations for that scenario. Missing declared
provider files are configuration errors.
