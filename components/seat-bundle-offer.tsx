"use client";

import { useState } from "react";
import { scoreSeatBundles, seatBundles } from "@/lib/seat-scoring";
import { formatMoney } from "@/lib/search";
import { emitClientObservation } from "@/lib/telemetry";

export function SeatBundleOffer({ flightId }: { flightId: string }) {
  const [selected, setSelected] = useState("standard");
  const choices = scoreSeatBundles(seatBundles, selected);
  return <section className="seat-offer" aria-labelledby="seat-bundle-heading">
    <h3 id="seat-bundle-heading">Seat preference <span aria-label="optional">(optional)</span></h3>
    <p>Choose a demo preference. It does not change the total or reserve a real seat.</p>
    <label>
      Seat bundle
      <select value={selected} onChange={(event) => { setSelected(event.target.value); emitClientObservation({ provider: "posthog", kind: "event", name: "seat_bundle_selected", flightId, attributes: { bundle: event.target.value } }); }}>
        {choices.map((bundle) => <option key={bundle.id} value={bundle.id}>{bundle.label}{bundle.priceCents ? ` (+${formatMoney(bundle.priceCents)})` : ""}</option>)}
      </select>
    </label>
  </section>;
}
