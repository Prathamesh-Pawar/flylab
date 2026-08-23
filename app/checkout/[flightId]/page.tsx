import { notFound } from "next/navigation";
import Link from "next/link";
import { FareSummary } from "@/components/fare-summary";
import { TravelerForm } from "@/components/traveler-form";
import { getFlight } from "@/lib/search";

export default async function CheckoutPage({ params }: { params: Promise<{ flightId: string }> }) {
  const { flightId } = await params;
  const flight = getFlight(flightId);
  if (!flight) notFound();
  return <section className="page">
    <Link className="back" href="/">← Back to flights</Link>
    <div className="checkout-grid"><TravelerForm flightId={flight.id} /><FareSummary flight={flight} /></div>
  </section>;
}
