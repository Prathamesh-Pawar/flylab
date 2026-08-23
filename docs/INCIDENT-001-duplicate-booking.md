# Incident 001: duplicate booking after a response timeout

## Historical context

A previous booking implementation retried a timed-out provider response after a
reservation-side effect had already committed. The retry used a new payment
idempotency key and could create a second reservation for one customer action.

## Expected behavior

Every user booking operation needs one stable operation ID. Repeated attempts
must reuse that ID as the payment idempotency key, and reservation creation must
be idempotent by the same operation ID. A retry is safe only at the response
boundary, after the client can no longer determine whether the original response
was delivered.

## Observability requirements

Correlate each request through operation ID, trace ID, reservation ID, payment
intent ID, and idempotency key. Monitor distinct reservations and payment intents
per operation, booking p99 latency, and checkout/booking completion rate.

This document describes a historical invariant. It does not contain a current
mission result or recommended policy action.
