# FlightLab Business Context

## Purpose

FlightLab is Opssemble’s deterministic flight-booking application used to prove that release decisions can combine code, runtime, customer, and financial evidence.

The product is intentionally small, but the business journey is real enough to expose release risk:

```text
Search SFO → JFK
  → choose a flight
  → enter traveler details
  → select optional seat bundle
  → complete demo payment
  → receive booking reference
```

FlightLab is the system under evaluation. Opssemble owns the release mission, Watch Plan, agent analysis, policy decision, repair workflow, and revalidation. For the hackathon, provider observations are deterministic fixtures, while the Opssemble behavior above that boundary remains real.

## Business context

### Customer promise

Customers should be able to find a flight quickly, understand the offer, complete payment once, and receive one valid booking confirmation.

### Business outcomes

- Convert search intent into completed bookings.
- Increase ancillary revenue through relevant seat-bundle offers.
- Avoid duplicate reservations, duplicate payment attempts, and customer support incidents.
- Keep the booking journey fast enough that customers do not abandon checkout.
- Preserve search quality while adding richer date and offer experiences.

### Critical invariants

These are safety properties, not optimization targets:

1. One booking operation creates at most one reservation.
2. One booking operation creates at most one payment intent.
3. A confirmed booking has a stable booking reference.
4. A failed or unknown release is not promoted without an explicit decision.
5. A repair is accepted only after the original release contract passes again.

## Application surface

| Journey surface | User action | Business question | Primary evidence |
|---|---|---|---|
| Search `/` | Search SFO → JFK and review results | Are customers finding relevant inventory? | Search events, zero-result rate, selection rate, search latency |
| Checkout `/checkout/[flightId]` | Enter traveler details and complete demo booking | Can intent convert without friction or latency? | Checkout funnel, p95/p99 latency, errors, seat-bundle events |
| Booking `/booking/[bookingId]` | View confirmation and booking reference | Did the customer receive a valid outcome? | Booking completion, confirmation load, reservation/payment records |
| Seat-bundle offer | View and optionally select an ancillary offer | Does the feature increase value without hurting conversion? | Offer exposure, attach rate, ancillary revenue, checkout completion |

## Metric criticality model

| Level | Meaning | Policy treatment |
|---|---|---|
| **P0 — Critical** | Safety, financial integrity, or core booking failure. A breach can create customer harm or an invalid booking. | Reject or restore. Unknown must hold. |
| **P1 — High** | Material conversion, search-quality, or customer-experience regression. | Reject or hold when the threshold is sustained. |
| **P2 — Medium** | Growth, ancillary revenue, or quality optimization signal. Important, but not an immediate safety stop by itself. | Warn, investigate, or require approval. |
| **P3 — Diagnostic** | Context needed to interpret a metric: exposure, sample size, cohort, variant, or data freshness. | Never treated as a pass/fail outcome by itself. |

## Business metrics to track

### P0 — Critical metrics

| Metric | Definition | Suggested guardrail | Demo availability |
|---|---|---:|---|
| Duplicate reservations per operation | Count of committed reservation IDs for one stable booking operation ID | `≤ 1` | Available in PR #3 fixtures |
| Duplicate payment intents per operation | Count of payment intents created for one booking operation ID | `≤ 1` | Available in PR #3 fixtures |
| Booking completion rate | Confirmed bookings ÷ booking attempts, by release and variant | No more than 5% relative drop from baseline | Available in PR #3 fixtures |
| Booking confirmation success | Sessions reaching a valid booking reference ÷ completed payment attempts | No material regression from baseline | Recommended derived metric |
| Payment success rate | Successful payment outcomes ÷ payment attempts | No material regression; define exact tolerance per market | Recommended metric |

### P1 — High metrics

| Metric | Definition | Suggested guardrail | Demo availability |
|---|---|---:|---|
| Checkout p95 latency | 95th percentile time for the checkout journey or endpoint | `≤ 800 ms` for Smart Seat Bundles | Available in PR #1 fixtures |
| Booking p99 latency | 99th percentile booking completion latency | `≤ 1,500 ms` | Available in PR #3 fixtures |
| Search p95 latency | 95th percentile search response time | Compare to baseline; PR #2 target is 430 ms | Available in PR #2 fixtures |
| Search zero-result rate | Searches returning no usable flights ÷ all valid searches | Relative delta within agreed tolerance; PR #2 is 1.2% | Available in PR #2 fixtures |
| Flight-selection rate | Searches leading to a selected flight ÷ valid search sessions | Relative delta within agreed tolerance; PR #2 is 0.8% | Available in PR #2 fixtures |
| Checkout completion rate | Checkout completions ÷ checkout starts, by variant | Smart Seat Bundles relative drop `≤ 8%` | Available in PR #1 fixtures |
| Booking abandonment rate | Booking starts that do not reach confirmation ÷ booking starts | No sustained increase beyond baseline tolerance | Recommended derived metric |

### P2 — Medium metrics

| Metric | Definition | Why it matters |
|---|---|---|
| Seat-bundle attach rate | Completed bookings with a seat bundle ÷ eligible completed bookings | Measures ancillary adoption and feature value |
| Seat-bundle revenue per booking | Ancillary revenue ÷ completed bookings | Connects the feature to commercial upside |
| Seat-bundle offer engagement | `seat_bundle_viewed` or offer interaction events ÷ eligible checkout sessions | Distinguishes discoverability from conversion |
| Search-to-book conversion | Completed bookings ÷ search sessions | End-to-end value of search improvements |
| Average booking value | Total booking and ancillary value ÷ completed bookings | Shows whether changes affect mix or monetization |
| Recovery time to healthy | Time from release regression detection to restored baseline behavior | Measures operational effectiveness and customer exposure |

### P3 — Diagnostic metrics

These metrics make the business metrics trustworthy and interpretable:

- Exposed users or sessions by feature-flag variant.
- Baseline and candidate sample size.
- Cohort assignment stability.
- Release SHA, deployment ID, route, region, and feature variant.
- Metric freshness and observation window.
- Funnel denominators and missing-event rate.
- Operation ID, reservation ID, payment intent ID, and trace ID correlation.

Diagnostic metrics should not produce a PASS. Missing or insufficient evidence should produce `UNKNOWN`, which policy treats as hold for critical gates.

## Mapping metrics to example PRs

### PR #1 — Smart Seat Bundles

**Change:** Add a seat-bundle offer and sequential seat-scoring work in checkout. The feature flag moves from 10% to 50%.

**Business hypothesis:** The offer can increase ancillary engagement and revenue, but extra scoring work may slow checkout and reduce completion.

| Metric | Criticality | Baseline / canary example | Expected Opssemble behavior |
|---|---|---|---|
| Checkout completion | P1 | `72% → 59%` | Fail the `≤ 8%` relative-drop gate and request restoration |
| Checkout p95 | P1 | `~600 ms → 1,280 ms` | Fail the `≤ 800 ms` gate |
| Seat-bundle viewed events | P3 / context | Increased volume at 50% exposure | Explain exposure and denominator; do not call this success |
| Seat-bundle attach rate | P2 | Recommended to add | Determine whether ancillary value offsets the conversion cost |
| Seat-bundle revenue per booking | P2 | Recommended to add | Quantify commercial upside after safety and conversion pass |

**Best demo framing:** Show that more offer exposure is not automatically a win. The canary increases `seat_bundle_viewed`, but checkout completion falls and checkout latency rises. Opssemble restores the safer 10% rollout.

### PR #2 — Flexible-Date Search

**Change:** Add a seven-day flexible-date strip and bounded aggregation in search.

**Business hypothesis:** More date choices should improve discovery and selection without making search slow or confusing.

| Metric | Criticality | Example observation | Expected Opssemble behavior |
|---|---|---:|---|
| Search p95 latency | P1 | `430 ms` | Pass performance if the baseline comparison is healthy |
| Zero-result rate | P1 | `1.2%` delta from baseline | Pass within the agreed tolerance |
| Flight-selection rate | P1 | `0.8%` delta from baseline | Pass within the agreed tolerance |
| Search-to-book conversion | P2 | Recommended to add | Confirm the feature improves the full journey, not only search clicks |
| Flexible-date interaction rate | P2 | Recommended to add | Show whether customers use the new control |

**Best demo framing:** Use this as the healthy control. Opssemble selects Impact, Performance, and Product Health, skips irrelevant Resilience and Security work, and promotes based on evidence rather than forcing every change through the same checks.

### PR #3 — Booking Timeout Retry

**Change:** Retry booking after a timeout without a stable idempotency key.

**Business hypothesis:** Retry should improve resilience, but an unsafe retry boundary can duplicate side effects and create financial harm.

| Metric | Criticality | Failure example | Repair target |
|---|---|---:|---:|
| Reservations per operation | P0 | `2` for `op-204` | `1` |
| Payment intents per operation | P0 | `2` for `op-204` | `1` |
| Booking p99 latency | P1 | `2,280 ms` | `920 ms`, below `1,500 ms` |
| Booking completion | P0 | `11%` below baseline | Within `2%` of baseline |
| Stable idempotency-key reuse | P0 / diagnostic | Missing across attempts | Same key across retry boundary |
| Timeout recovery success | P1 | Retry completes with duplicate side effects | Retry completes once and safely |
| Customer support / refund rate | P2 | Recommended future metric | No release-attributed increase |

**Best demo framing:** Lead with the invariant violation: one customer operation creates two reservations and two payment intents. Then show the repair and revalidation under the unchanged contract.

## Recommended Opssemble demo scorecard

For a short demo, track these five metrics:

1. **Checkout completion rate** — clearest customer-impact signal for PR #1.
2. **Checkout p95 latency** — explains the Smart Seat Bundles regression.
3. **Reservations per operation** — visceral P0 safety failure for PR #3.
4. **Payment intents per operation** — makes the financial risk undeniable.
5. **Booking p99 latency** — demonstrates recovery after the Codex repair.

Use these supporting signals around the scorecard:

- Feature exposure and variant assignment.
- `seat_bundle_viewed` volume.
- Search zero-result and flight-selection deltas for PR #2.
- Operation, trace, reservation, and payment correlation IDs.
- Sample size, window, and evidence freshness.

## Suggested demo sequence

```text
PR #2 healthy control
  → show search p95 + zero-result + selection rate
  → promote

PR #1 canary regression
  → show baseline vs 50% canary
  → checkout p95 rises and completion falls
  → restore to 10%

PR #3 safety failure
  → timeout after reservation commit
  → two reservations + two payments for one operation
  → reject, repair, rerun
  → one reservation + one payment, p99 920 ms, completion within 2%
```

## Metric design rules

- Every metric must have a named owner and a business definition.
- Always show numerator, denominator, cohort, variant, and release identity.
- Prefer customer-level invariants over aggregate error rates for payment and booking safety.
- Pair a business outcome with the technical metric that explains it.
- Set thresholds before the canary runs; do not tune them after seeing the result.
- Keep `UNKNOWN` explicit when data is missing, sparse, stale, or uncorrelated.
- Never let a fixture encode the expected verdict; the Opssemble agents and policy must derive it.
