# FlightLab product and operational metrics

| Signal | Provider shape | App/runtime source | Correlation |
| --- | --- | --- | --- |
| Search submitted | PostHog event | `flight_search_submitted` | route and departure date |
| Flight selected | UI navigation | checkout route | flight ID |
| Seat bundle selected | PostHog event | `seat_bundle_selected` | flight ID |
| Booking completed | PostHog event | `booking_completed` | booking operation ID |
| Booking confirmation | CloudWatch log | `demo_booking_confirmed` | booking operation ID and reference |
| Booking p99 | CloudWatch metric fixture | `BookingLatencyP99` | `op-204`, release SHA |
| Payment attempt | Stripe record fixture | `payment_intent` | `op-204`, idempotency key |
| Reservation commit | CloudWatch log fixture | `reservation_committed` | `op-204`, trace ID |

The runtime endpoint emits raw observation records, not conclusions. The fixture
sets contain raw values and provider facts only. Opssemble computes rates,
distinct counts, latency bounds, agent results, and policy decisions itself.
